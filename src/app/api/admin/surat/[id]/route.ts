import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getAuthenticatedUser } from '@/lib/auth';
import { JenisSurat } from '@prisma/client';

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
    const { nomorSurat, tanggalSurat, tanggalDiterima, pengirim, penerima, perihal, jenis, tautanBerkas, keterangan } = await request.json();

    if (!nomorSurat || !tanggalSurat || !pengirim || !penerima || !perihal || !jenis) {
      return NextResponse.json({ message: 'Kolom utama wajib diisi' }, { status: 400 });
    }

    const existingSurat = await prisma.arsipSurat.findFirst({
      where: {
        nomorSurat,
        NOT: { id },
      },
    });

    if (existingSurat) {
      return NextResponse.json({ message: 'Nomor surat sudah digunakan oleh surat lain' }, { status: 400 });
    }

    const updatedSurat = await prisma.arsipSurat.update({
      where: { id },
      data: {
        nomorSurat,
        tanggalSurat: new Date(tanggalSurat),
        tanggalDiterima: tanggalDiterima ? new Date(tanggalDiterima) : null,
        pengirim,
        penerima,
        perihal,
        jenis: jenis as JenisSurat,
        tautanBerkas,
        keterangan,
      },
    });

    return NextResponse.json(updatedSurat);
  } catch (error) {
    console.error('Update surat error:', error);
    return NextResponse.json({ message: 'Gagal memperbarui data surat' }, { status: 500 });
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
    await prisma.arsipSurat.delete({ where: { id } });
    return NextResponse.json({ message: 'Arsip surat berhasil dihapus' });
  } catch (error) {
    console.error('Delete surat error:', error);
    return NextResponse.json({ message: 'Gagal menghapus arsip surat' }, { status: 500 });
  }
}
