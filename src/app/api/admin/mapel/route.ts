import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getAuthenticatedUser } from '@/lib/auth';

export async function GET() {
  const user = await getAuthenticatedUser();
  if (!user || (user.role !== 'ADMIN' && user.role !== 'GURU' && user.role !== 'GURU_BK' && user.role !== 'KEPALA_SEKOLAH')) {
    return NextResponse.json({ message: 'Tidak diizinkan' }, { status: 403 });
  }

  try {
    const mapel = await prisma.mataPelajaran.findMany({
      orderBy: { nama: 'asc' },
    });
    return NextResponse.json(mapel);
  } catch (error) {
    return NextResponse.json({ message: 'Gagal mengambil data mata pelajaran' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const user = await getAuthenticatedUser();
  if (!user || user.role !== 'ADMIN') {
    return NextResponse.json({ message: 'Tidak diizinkan' }, { status: 403 });
  }

  try {
    const { nama, kode } = await request.json();

    if (!nama || !kode) {
      return NextResponse.json({ message: 'Nama dan kode mata pelajaran wajib diisi' }, { status: 400 });
    }

    const uppercaseKode = kode.toUpperCase();

    // Check unique kode
    const existing = await prisma.mataPelajaran.findUnique({
      where: { kode: uppercaseKode },
    });

    if (existing) {
      return NextResponse.json({ message: 'Kode mata pelajaran sudah terdaftar' }, { status: 400 });
    }

    const newMapel = await prisma.mataPelajaran.create({
      data: {
        nama,
        kode: uppercaseKode,
      },
    });

    return NextResponse.json(newMapel, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: 'Gagal menambahkan mata pelajaran' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const user = await getAuthenticatedUser();
  if (!user || user.role !== 'ADMIN') {
    return NextResponse.json({ message: 'Tidak diizinkan' }, { status: 403 });
  }

  try {
    const { id, nama, kode } = await request.json();

    if (!id || !nama || !kode) {
      return NextResponse.json({ message: 'ID, nama, dan kode mata pelajaran wajib diisi' }, { status: 400 });
    }

    const uppercaseKode = kode.toUpperCase();

    // Check unique kode (exclude current item)
    const existing = await prisma.mataPelajaran.findFirst({
      where: {
        kode: uppercaseKode,
        NOT: { id },
      },
    });

    if (existing) {
      return NextResponse.json({ message: 'Kode mata pelajaran sudah digunakan oleh pelajaran lain' }, { status: 400 });
    }

    const updated = await prisma.mataPelajaran.update({
      where: { id },
      data: {
        nama,
        kode: uppercaseKode,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ message: 'Gagal memperbarui mata pelajaran' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const user = await getAuthenticatedUser();
  if (!user || user.role !== 'ADMIN') {
    return NextResponse.json({ message: 'Tidak diizinkan' }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ message: 'ID mata pelajaran wajib disertakan' }, { status: 400 });
    }

    await prisma.mataPelajaran.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Mata pelajaran berhasil dihapus' });
  } catch (error) {
    return NextResponse.json({ message: 'Gagal menghapus mata pelajaran' }, { status: 500 });
  }
}
