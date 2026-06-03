import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getAuthenticatedUser } from '@/lib/auth';

export async function GET() {
  const user = await getAuthenticatedUser();
  if (!user || (user.role !== 'SISWA' && user.role !== 'ORANG_TUA')) {
    return NextResponse.json({ message: 'Tidak diizinkan' }, { status: 403 });
  }

  try {
    // 1. Cari data siswa berdasarkan role user yang login
    let siswa = null;
    if (user.role === 'SISWA') {
      siswa = await prisma.siswa.findUnique({
        where: { userId: user.id },
        include: {
          kelas: {
            include: { tahunAjaran: true },
          },
        },
      });
    } else if (user.role === 'ORANG_TUA') {
      siswa = await prisma.siswa.findUnique({
        where: { orangTuaUserId: user.id },
        include: {
          kelas: {
            include: { tahunAjaran: true },
          },
        },
      });
    }

    if (!siswa) {
      return NextResponse.json({ message: 'Data siswa tidak ditemukan' }, { status: 404 });
    }

    // 2. Ambil data absensi & hitung statistik
    const absensi = await prisma.absensi.findMany({
      where: { siswaId: siswa.id },
    });

    const statistikAbsensi = {
      HADIR: absensi.filter((a) => a.status === 'HADIR').length,
      IZIN: absensi.filter((a) => a.status === 'IZIN').length,
      SAKIT: absensi.filter((a) => a.status === 'SAKIT').length,
      ALPA: absensi.filter((a) => a.status === 'ALPA').length,
      TOTAL: absensi.length,
    };

    // 3. Ambil jadwal pelajaran kelas siswa
    const jadwal = await prisma.jadwalPelajaran.findMany({
      where: { kelasId: siswa.kelasId },
      include: {
        mataPelajaran: true,
        guru: true,
      },
      orderBy: { jamMulai: 'asc' },
    });

    // Custom sorting helper untuk Hari
    const hariOrder = ['SENIN', 'SELASA', 'RABU', 'KAMIS', 'JUMAT', 'SABTU'];
    const sortedJadwal = [...jadwal].sort((a, b) => {
      return hariOrder.indexOf(a.hari) - hariOrder.indexOf(b.hari);
    });

    // 4. Ambil semua mata pelajaran yang ada untuk tabulasi nilai
    const mapelList = await prisma.mataPelajaran.findMany({
      orderBy: { nama: 'asc' },
    });

    // Ambil data nilai siswa
    const nilaiList = await prisma.nilai.findMany({
      where: { siswaId: siswa.id },
      include: {
        mataPelajaran: true,
      },
    });

    // Format tabulasi nilai per mata pelajaran
    const rekapNilai = mapelList.map((mapel) => {
      const mapelNilai = nilaiList.filter((n) => n.mataPelajaranId === mapel.id);
      const tugas = mapelNilai.find((n) => n.jenis === 'TUGAS')?.nilai ?? '-';
      const uts = mapelNilai.find((n) => n.jenis === 'UTS')?.nilai ?? '-';
      const uas = mapelNilai.find((n) => n.jenis === 'UAS')?.nilai ?? '-';

      // Hitung rata-rata jika ada nilai
      const validGrades = [tugas, uts, uas].filter((v) => typeof v === 'number') as number[];
      const rataRata = validGrades.length > 0 
        ? Math.round(validGrades.reduce((sum, val) => sum + val, 0) / validGrades.length) 
        : '-';

      return {
        mapelId: mapel.id,
        namaMapel: mapel.nama,
        kodeMapel: mapel.kode,
        tugas,
        uts,
        uas,
        rataRata,
      };
    }).filter((r) => r.tugas !== '-' || r.uts !== '-' || r.uas !== '-'); // Tampilkan mapel yang sudah dinilai saja

    return NextResponse.json({
      siswa: {
        id: siswa.id,
        nisn: siswa.nisn,
        nama: siswa.nama,
        kelas: siswa.kelas.nama,
        tahunAjaran: siswa.kelas.tahunAjaran.tahun,
      },
      statistikAbsensi,
      jadwal: sortedJadwal,
      nilai: rekapNilai,
    });
  } catch (error) {
    console.error('Siswa dashboard API error:', error);
    return NextResponse.json({ message: 'Gagal mengambil data dashboard siswa' }, { status: 500 });
  }
}
