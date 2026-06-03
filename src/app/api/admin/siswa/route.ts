import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getAuthenticatedUser } from '@/lib/auth';

export async function GET() {
  const user = await getAuthenticatedUser();
  if (!user || user.role !== 'ADMIN') {
    return NextResponse.json({ message: 'Tidak diizinkan' }, { status: 403 });
  }

  try {
    const siswa = await prisma.siswa.findMany({
      include: {
        kelas: {
          select: { nama: true }
        }
      },
      orderBy: { nama: 'asc' }
    });
    return NextResponse.json(siswa);
  } catch (error) {
    return NextResponse.json({ message: 'Gagal mengambil data siswa' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const user = await getAuthenticatedUser();
  if (!user || user.role !== 'ADMIN') {
    return NextResponse.json({ message: 'Tidak diizinkan' }, { status: 403 });
  }

  try {
    const { nisn, nama, kelasId, kontakOrangTua } = await request.json();

    if (!nisn || nisn.length !== 10 || isNaN(Number(nisn))) {
      return NextResponse.json({ message: 'NISN harus 10 digit angka' }, { status: 400 });
    }

    if (!nama || !kelasId || !kontakOrangTua) {
      return NextResponse.json({ message: 'Nama, kelas, dan kontak orang tua wajib diisi' }, { status: 400 });
    }

    // Cek apakah NISN sudah terdaftar
    const existingSiswa = await prisma.siswa.findUnique({
      where: { nisn }
    });

    if (existingSiswa) {
      return NextResponse.json({ message: 'Siswa dengan NISN ini sudah terdaftar' }, { status: 400 });
    }

    const newSiswa = await prisma.siswa.create({
      data: {
        nisn,
        nama,
        kelasId,
        kontakOrangTua
      }
    });

    return NextResponse.json(newSiswa, { status: 201 });
  } catch (error) {
    console.error('Create Siswa error:', error);
    return NextResponse.json({ message: 'Gagal menambahkan data siswa' }, { status: 500 });
  }
}
