import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getAuthenticatedUser } from '@/lib/auth';
import { JenisSurat } from '@prisma/client';

export async function GET(request: Request) {
  const user = await getAuthenticatedUser();
  if (!user || (user.role !== 'ADMIN' && user.role !== 'KEPALA_SEKOLAH')) {
    return NextResponse.json({ message: 'Tidak diizinkan' }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const jenis = searchParams.get('jenis'); // MASUK or KELUAR
    const search = searchParams.get('search') || '';

    const whereClause: any = {};
    if (jenis === 'MASUK' || jenis === 'KELUAR') {
      whereClause.jenis = jenis;
    }

    if (search) {
      whereClause.OR = [
        { nomorSurat: { contains: search, mode: 'insensitive' } },
        { perihal: { contains: search, mode: 'insensitive' } },
        { pengirim: { contains: search, mode: 'insensitive' } },
        { penerima: { contains: search, mode: 'insensitive' } },
      ];
    }

    const surat = await prisma.arsipSurat.findMany({
      where: whereClause,
      orderBy: { tanggalSurat: 'desc' },
    });

    return NextResponse.json(surat);
  } catch (error) {
    console.error('Fetch surat error:', error);
    return NextResponse.json({ message: 'Gagal mengambil data surat' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const user = await getAuthenticatedUser();
  if (!user || user.role !== 'ADMIN') {
    return NextResponse.json({ message: 'Tidak diizinkan' }, { status: 403 });
  }

  try {
    const { nomorSurat, tanggalSurat, tanggalDiterima, pengirim, penerima, perihal, jenis, tautanBerkas, keterangan } = await request.json();

    if (!nomorSurat || !tanggalSurat || !pengirim || !penerima || !perihal || !jenis) {
      return NextResponse.json({ message: 'Kolom utama wajib diisi' }, { status: 400 });
    }

    // Check unique nomorSurat
    const existingSurat = await prisma.arsipSurat.findUnique({
      where: { nomorSurat },
    });

    if (existingSurat) {
      return NextResponse.json({ message: 'Nomor surat sudah terdaftar' }, { status: 400 });
    }

    const newSurat = await prisma.arsipSurat.create({
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

    return NextResponse.json(newSurat, { status: 201 });
  } catch (error) {
    console.error('Create surat error:', error);
    return NextResponse.json({ message: 'Gagal mengarsipkan surat' }, { status: 500 });
  }
}
