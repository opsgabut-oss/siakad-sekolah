import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getAuthenticatedUser } from '@/lib/auth';
import { Role } from '@prisma/client';
import bcrypt from 'bcryptjs';

export async function GET() {
  const user = await getAuthenticatedUser();
  if (!user || user.role !== 'ADMIN') {
    return NextResponse.json({ message: 'Tidak diizinkan' }, { status: 403 });
  }

  try {
    const guru = await prisma.guru.findMany({
      include: {
        user: {
          select: { username: true }
        }
      },
      orderBy: { nama: 'asc' }
    });
    return NextResponse.json(guru);
  } catch (error) {
    return NextResponse.json({ message: 'Gagal mengambil data guru' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const user = await getAuthenticatedUser();
  if (!user || user.role !== 'ADMIN') {
    return NextResponse.json({ message: 'Tidak diizinkan' }, { status: 403 });
  }

  try {
    const { nip, nama, kontak } = await request.json();

    if (!nip || nip.length !== 18 || isNaN(Number(nip))) {
      return NextResponse.json({ message: 'NIP harus 18 digit angka' }, { status: 400 });
    }

    if (!nama || !kontak) {
      return NextResponse.json({ message: 'Nama dan kontak wajib diisi' }, { status: 400 });
    }

    // Cek apakah NIP sudah ada
    const existingGuru = await prisma.guru.findUnique({
      where: { nip }
    });

    if (existingGuru) {
      return NextResponse.json({ message: 'Guru dengan NIP ini sudah terdaftar' }, { status: 400 });
    }

    // Username otomatis menggunakan NIP murni
    const username = nip;

    // Hash password default 'guru123'
    const hashedPassword = await bcrypt.hash('guru123', 10);
    
    const result = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          username,
          password: hashedPassword,
          role: Role.GURU,
        }
      });

      const newGuru = await tx.guru.create({
        data: {
          nip,
          nama,
          kontak,
          userId: newUser.id
        }
      });

      return newGuru;
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error('Create Guru error:', error);
    return NextResponse.json({ message: 'Gagal menambahkan data guru' }, { status: 500 });
  }
}
