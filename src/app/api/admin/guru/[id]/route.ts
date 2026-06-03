import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getAuthenticatedUser } from '@/lib/auth';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthenticatedUser();
  if (!user || user.role !== 'ADMIN') {
    return NextResponse.json({ message: 'Tidak diizinkan' }, { status: 403 });
  }

  try {
    const { id } = await params;
    const { nuptk, nama, kontak } = await request.json();

    if (!nuptk || nuptk.length !== 16 || isNaN(Number(nuptk))) {
      return NextResponse.json({ message: 'NUPTK harus 16 digit angka' }, { status: 400 });
    }

    if (!nama || !kontak) {
      return NextResponse.json({ message: 'Nama dan kontak wajib diisi' }, { status: 400 });
    }

    const existingGuru = await prisma.guru.findFirst({
      where: {
        nuptk,
        NOT: { id }
      }
    });

    if (existingGuru) {
      return NextResponse.json({ message: 'NUPTK sudah digunakan oleh guru lain' }, { status: 400 });
    }

    const updatedGuru = await prisma.guru.update({
      where: { id },
      data: { nuptk, nama, kontak }
    });

    return NextResponse.json(updatedGuru);
  } catch (error) {
    return NextResponse.json({ message: 'Gagal memperbarui data guru' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthenticatedUser();
  if (!user || user.role !== 'ADMIN') {
    return NextResponse.json({ message: 'Tidak diizinkan' }, { status: 403 });
  }

  try {
    const { id } = await params;

    const guru = await prisma.guru.findUnique({
      where: { id },
      select: { userId: true }
    });

    if (!guru) {
      return NextResponse.json({ message: 'Data guru tidak ditemukan' }, { status: 404 });
    }

    await prisma.$transaction(async (tx) => {
      await tx.guru.delete({ where: { id } });
      if (guru.userId) {
        await tx.user.delete({ where: { id: guru.userId } });
      }
    });

    return NextResponse.json({ message: 'Data guru berhasil dihapus' });
  } catch (error) {
    return NextResponse.json({ message: 'Gagal menghapus data guru' }, { status: 500 });
  }
}
