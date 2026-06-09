import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getAuthenticatedUser } from '@/lib/auth';
import { Hari, Role } from '@prisma/client';

export async function GET(request: Request) {
  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ message: 'Silakan login terlebih dahulu' }, { status: 401 });
  }

  try {
    // 1. Dapatkan atau buat Tahun Ajaran aktif
    let tahunAjaran = await prisma.tahunAjaran.findFirst({
      where: { aktif: true }
    });

    if (!tahunAjaran) {
      tahunAjaran = await prisma.tahunAjaran.create({
        data: {
          tahun: '2025/2026',
          aktif: true
        }
      });
    }

    // 2. Dapatkan atau buat Kelas 4 dan Kelas 5
    let kelas4 = await prisma.kelas.findFirst({
      where: { nama: 'Kelas 4', tahunAjaranId: tahunAjaran.id }
    });
    if (!kelas4) {
      kelas4 = await prisma.kelas.create({
        data: { nama: 'Kelas 4', tahunAjaranId: tahunAjaran.id }
      });
    }

    let kelas5 = await prisma.kelas.findFirst({
      where: { nama: 'Kelas 5', tahunAjaranId: tahunAjaran.id }
    });
    if (!kelas5) {
      kelas5 = await prisma.kelas.create({
        data: { nama: 'Kelas 5', tahunAjaranId: tahunAjaran.id }
      });
    }

    // 3. Dapatkan atau buat Mata Pelajaran MTK & IPAS
    let mapelMTK = await prisma.mataPelajaran.findUnique({
      where: { kode: 'MTK' }
    });
    if (!mapelMTK) {
      mapelMTK = await prisma.mataPelajaran.create({
        data: { nama: 'Matematika', kode: 'MTK' }
      });
    }

    let mapelIPAS = await prisma.mataPelajaran.findUnique({
      where: { kode: 'IPAS' }
    });
    if (!mapelIPAS) {
      mapelIPAS = await prisma.mataPelajaran.create({
        data: { nama: 'Ilmu Pengetahuan Alam dan Sosial', kode: 'IPAS' }
      });
    }

    // 4. Cari atau hubungkan Guru Profile ke User
    let guru = await prisma.guru.findUnique({
      where: { userId: user.id }
    });

    if (!guru) {
      // Jika NIP di user ada, gunakan itu. Jika tidak, pakai NIP default/username
      const isNip = user.username.match(/^\d+$/);
      guru = await prisma.guru.create({
        data: {
          nip: isNip ? user.username : '198309052021212004',
          nama: user.username === '198309052021212004' ? 'Widyaningsih, S.Pd. SD.' : 'Guru Pengajar',
          kontak: '08123456789',
          userId: user.id
        }
      });
    }

    // 5. Buat Jadwal Mengajar untuk Guru tersebut jika belum ada
    const existingJadwals = await prisma.jadwalPelajaran.findMany({
      where: { guruId: guru.id }
    });

    const createdJadwals = [];

    if (existingJadwals.length === 0) {
      // Jadwal Kelas 4 - MTK
      const j1 = await prisma.jadwalPelajaran.create({
        data: {
          kelasId: kelas4.id,
          mataPelajaranId: mapelMTK.id,
          guruId: guru.id,
          hari: Hari.SENIN,
          jamMulai: '07:30',
          jamSelesai: '09:00'
        }
      });
      createdJadwals.push(`Kelas 4 - Matematika`);

      // Jadwal Kelas 4 - IPAS
      const j2 = await prisma.jadwalPelajaran.create({
        data: {
          kelasId: kelas4.id,
          mataPelajaranId: mapelIPAS.id,
          guruId: guru.id,
          hari: Hari.SELASA,
          jamMulai: '07:30',
          jamSelesai: '09:00'
        }
      });
      createdJadwals.push(`Kelas 4 - IPAS`);

      // Jadwal Kelas 5 - MTK
      const j3 = await prisma.jadwalPelajaran.create({
        data: {
          kelasId: kelas5.id,
          mataPelajaranId: mapelMTK.id,
          guruId: guru.id,
          hari: Hari.RABU,
          jamMulai: '07:30',
          jamSelesai: '09:00'
        }
      });
      createdJadwals.push(`Kelas 5 - Matematika`);

      // Jadwal Kelas 5 - IPAS
      const j4 = await prisma.jadwalPelajaran.create({
        data: {
          kelasId: kelas5.id,
          mataPelajaranId: mapelIPAS.id,
          guruId: guru.id,
          hari: Hari.KAMIS,
          jamMulai: '07:30',
          jamSelesai: '09:00'
        }
      });
      createdJadwals.push(`Kelas 5 - IPAS`);
    }

    // 6. Pastikan ada siswa di Kelas 4 agar lembar penilaian tidak kosong
    const siswaKelas4 = await prisma.siswa.findMany({
      where: { kelasId: kelas4.id }
    });

    if (siswaKelas4.length === 0) {
      await prisma.siswa.createMany({
        data: [
          { nisn: '4001123456', nama: 'Ahmad Syarif', kelasId: kelas4.id, kontakOrangTua: '081234567890' },
          { nisn: '4002123456', nama: 'Siti Rahma', kelasId: kelas4.id, kontakOrangTua: '081234567891' },
          { nisn: '4003123456', nama: 'Budi Wijaya', kelasId: kelas4.id, kontakOrangTua: '081234567892' },
          { nisn: '4004123456', nama: 'Dinda Lestari', kelasId: kelas4.id, kontakOrangTua: '081234567893' }
        ]
      });
    }

    // 7. Pastikan ada siswa di Kelas 5
    const siswaKelas5 = await prisma.siswa.findMany({
      where: { kelasId: kelas5.id }
    });

    if (siswaKelas5.length === 0) {
      await prisma.siswa.createMany({
        data: [
          { nisn: '5001123456', nama: 'Dian Permana', kelasId: kelas5.id, kontakOrangTua: '081234567894' },
          { nisn: '5002123456', nama: 'Eka Putri', kelasId: kelas5.id, kontakOrangTua: '081234567895' },
          { nisn: '5003123456', nama: 'Fajar Kurnia', kelasId: kelas5.id, kontakOrangTua: '081234567896' }
        ]
      });
    }

    return NextResponse.json({
      success: true,
      message: `Inisialisasi database berhasil untuk Guru: ${guru.nama}.`,
      detail: {
        tahunAjaran: tahunAjaran.tahun,
        guru: guru.nama,
        jadwalDibuat: createdJadwals.length > 0 ? createdJadwals : 'Sudah ada jadwal sebelumnya',
        totalSiswaKelas4: (await prisma.siswa.count({ where: { kelasId: kelas4.id } })),
        totalSiswaKelas5: (await prisma.siswa.count({ where: { kelasId: kelas5.id } }))
      }
    });

  } catch (error: any) {
    console.error('Init DB error:', error);
    return NextResponse.json({ success: false, message: 'Gagal inisialisasi database', error: error.message }, { status: 500 });
  }
}
