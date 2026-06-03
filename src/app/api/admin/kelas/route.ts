import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getAuthenticatedUser } from '@/lib/auth';

export async function GET() {
  const user = await getAuthenticatedUser();
  if (!user || user.role !== 'ADMIN') {
    return NextResponse.json({ message: 'Tidak diizinkan' }, { status: 403 });
  }

  try {
    const kelas = await prisma.kelas.findMany({
      include: {
        tahunAjaran: {
          select: { tahun: true, aktif: true }
        }
      },
      orderBy: { nama: 'asc' }
    });
    return NextResponse.json(kelas);
  } catch (error) {
    return NextResponse.json({ message: 'Gagal mengambil data kelas' }, { status: 500 });
  }
}
