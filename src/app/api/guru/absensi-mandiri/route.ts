import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getAuthenticatedUser } from '@/lib/auth';
import { StatusAbsensi } from '@prisma/client';

export async function GET() {
  const user = await getAuthenticatedUser();
  if (!user || !user.guru) {
    return NextResponse.json({ message: 'Tidak diizinkan' }, { status: 401 });
  }

  try {
    const now = new Date();
    const todayStr = now.toLocaleDateString('sv'); // Format YYYY-MM-DD
    const todayDate = new Date(todayStr);

    // Cek absensi hari ini
    const absensiToday = await prisma.absensiGuru.findFirst({
      where: {
        guruId: user.guru.id,
        tanggal: todayDate
      }
    });

    // Ambil riwayat absensi bulan ini
    const year = now.getFullYear();
    const month = now.getMonth();
    const startDate = new Date(year, month, 1);
    const endDate = new Date(year, month + 1, 0, 23, 59, 59);

    const history = await prisma.absensiGuru.findMany({
      where: {
        guruId: user.guru.id,
        tanggal: {
          gte: startDate,
          lte: endDate
        }
      },
      orderBy: { tanggal: 'desc' }
    });

    return NextResponse.json({
      today: absensiToday,
      history
    });
  } catch (error) {
    console.error('Fetch absensi mandiri error:', error);
    return NextResponse.json({ message: 'Gagal memuat absensi' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const user = await getAuthenticatedUser();
  if (!user || !user.guru) {
    return NextResponse.json({ message: 'Tidak diizinkan' }, { status: 401 });
  }

  try {
    const { status, keterangan } = await request.json();

    if (!status || !Object.values(StatusAbsensi).includes(status)) {
      return NextResponse.json({ message: 'Status absensi tidak valid' }, { status: 400 });
    }

    const now = new Date();
    const todayStr = now.toLocaleDateString('sv'); // Format YYYY-MM-DD
    const todayDate = new Date(todayStr);

    const record = await prisma.absensiGuru.upsert({
      where: {
        guruId_tanggal: {
          guruId: user.guru.id,
          tanggal: todayDate
        }
      },
      update: {
        status,
        keterangan: keterangan || null
      },
      create: {
        guruId: user.guru.id,
        tanggal: todayDate,
        status,
        keterangan: keterangan || null
      }
    });

    return NextResponse.json({
      message: 'Absensi mandiri berhasil disimpan',
      record
    });
  } catch (error) {
    console.error('Save absensi mandiri error:', error);
    return NextResponse.json({ message: 'Gagal merekam absensi' }, { status: 500 });
  }
}
