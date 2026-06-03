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
    const { nuptk, nama, kontak } = await request.json();

    if (!nuptk || nuptk.length !== 16 || isNaN(Number(nuptk))) {
      return NextResponse.json({ message: 'NUPTK harus 16 digit angka' }, { status: 400 });
    }

    if (!nama || !kontak) {
      return NextResponse.json({ message: 'Nama dan kontak wajib diisi' }, { status: 400 });
    }

    // Cek apakah NUPTK sudah ada
    const existingGuru = await prisma.guru.findUnique({
      where: { nuptk }
    });

    if (existingGuru) {
      return NextResponse.json({ message: 'Guru dengan NUPTK ini sudah terdaftar' }, { status: 400 });
    }

    // Generate username berdasarkan nama depan
    const namePart = nama.split(' ')[0].toLowerCase().replace(/[^a-z0-9]/g, '');
    const baseUsername = `guru.${namePart}`;
    
    let username = baseUsername;
    let counter = 1;
    let userExists = await prisma.user.findUnique({ where: { username } });
    
    while (userExists) {
      username = `${baseUsername}${counter}`;
      userExists = await prisma.user.findUnique({ where: { username } });
      counter++;
    }

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
          nuptk,
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
