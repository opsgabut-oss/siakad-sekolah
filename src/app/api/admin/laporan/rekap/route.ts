import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getAuthenticatedUser } from '@/lib/auth';

export async function GET(request: Request) {
  const user = await getAuthenticatedUser();
  if (!user || (user.role !== 'ADMIN' && user.role !== 'GURU')) {
    return NextResponse.json({ message: 'Tidak diizinkan' }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const kelasId = searchParams.get('kelasId');

    if (!kelasId) {
      return NextResponse.json({ message: 'kelasId wajib disertakan' }, { status: 400 });
    }

    const siswaList = await prisma.siswa.findMany({
      where: { kelasId },
      orderBy: { nama: 'asc' },
    });

    const absensiList = await prisma.absensi.findMany({
      where: {
        siswa: { kelasId },
      },
    });

    let totalKehadiranSiswaSum = 0;
    let totalHariEfektifSet = new Set<string>();

    const rows = siswaList.map((siswa) => {
      const absensiSiswa = absensiList.filter((a) => a.siswaId === siswa.id);
      const hadir = absensiSiswa.filter((a) => a.status === 'HADIR').length;
      const izin = absensiSiswa.filter((a) => a.status === 'IZIN').length;
      const sakit = absensiSiswa.filter((a) => a.status === 'SAKIT').length;
      const alpa = absensiSiswa.filter((a) => a.status === 'ALPA').length;
      const total = absensiSiswa.length;
      const persentase = total > 0 ? Math.round((hadir / total) * 100) : 0;

      totalKehadiranSiswaSum += persentase;
      absensiSiswa.forEach((a) => {
        // Simpan tanggal dalam format string YYYY-MM-DD
        const dateStr = a.tanggal.toISOString().split('T')[0];
        totalHariEfektifSet.add(dateStr);
      });

      return {
        siswaId: siswa.id,
        nisn: siswa.nisn,
        nama: siswa.nama,
        hadir,
        izin,
        sakit,
        alpa,
        total,
        persentase,
      };
    });

    const totalSiswa = siswaList.length;
    const rataRataKehadiran = totalSiswa > 0 
      ? Math.round(totalKehadiranSiswaSum / totalSiswa) 
      : 0;

    return NextResponse.json({
      rows,
      statistik: {
        totalSiswa,
        rataRataKehadiran,
        totalHadir: absensiList.filter((a) => a.status === 'HADIR').length,
        totalHariEfektif: totalHariEfektifSet.size,
      },
    });
  } catch (error) {
    console.error('Laporan rekap error:', error);
    return NextResponse.json({ message: 'Gagal memproses data rekap absensi' }, { status: 500 });
  }
}
