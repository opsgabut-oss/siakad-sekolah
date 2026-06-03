import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getAuthenticatedUser } from '@/lib/auth';
import { JenisNilai } from '@prisma/client';

export async function GET(request: Request) {
  const user = await getAuthenticatedUser();
  if (!user || user.role !== 'GURU') {
    return NextResponse.json({ message: 'Tidak diizinkan' }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const kelasId = searchParams.get('kelasId');
    const mataPelajaranId = searchParams.get('mataPelajaranId');

    if (!kelasId || !mataPelajaranId) {
      return NextResponse.json({ message: 'kelasId dan mataPelajaranId wajib disertakan' }, { status: 400 });
    }

    // Ambil daftar siswa di kelas tersebut
    const siswaList = await prisma.siswa.findMany({
      where: { kelasId },
      orderBy: { nama: 'asc' },
    });

    // Ambil semua nilai di kelas tersebut untuk mapel tersebut
    const nilaiList = await prisma.nilai.findMany({
      where: {
        mataPelajaranId,
        siswa: { kelasId },
      },
    });

    // Gabungkan data agar mudah diolah di frontend
    const result = siswaList.map((siswa) => {
      const siswaNilai = nilaiList.filter((n) => n.siswaId === siswa.id);
      return {
        siswaId: siswa.id,
        nisn: siswa.nisn,
        nama: siswa.nama,
        nilai: {
          TUGAS: siswaNilai.find((n) => n.jenis === JenisNilai.TUGAS) || null,
          UTS: siswaNilai.find((n) => n.jenis === JenisNilai.UTS) || null,
          UAS: siswaNilai.find((n) => n.jenis === JenisNilai.UAS) || null,
        },
      };
    });

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ message: 'Gagal mengambil data nilai' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const user = await getAuthenticatedUser();
  if (!user || user.role !== 'GURU') {
    return NextResponse.json({ message: 'Tidak diizinkan' }, { status: 403 });
  }

  try {
    const { mataPelajaranId, jenis, grades } = await request.json();

    if (!mataPelajaranId || !jenis || !grades || !Array.isArray(grades)) {
      return NextResponse.json({ message: 'Data tidak lengkap' }, { status: 400 });
    }

    if (!Object.values(JenisNilai).includes(jenis)) {
      return NextResponse.json({ message: 'Jenis nilai tidak valid' }, { status: 400 });
    }

    // Jalankan upsert menggunakan transaksi interaktif (sequential loop) untuk keamanan dan kompatibilitas ORM:
    const finalResult = await prisma.$transaction(async (tx) => {
      const records = [];
      for (const g of grades) {
        const { siswaId, nilai, keterangan } = g;
        if (siswaId && nilai !== undefined && nilai !== null && nilai !== '') {
          const parsedNilai = parseInt(nilai, 10);
          if (isNaN(parsedNilai) || parsedNilai < 0 || parsedNilai > 100) {
            throw new Error('Nilai harus berupa angka antara 0 - 100');
          }

          const existing = await tx.nilai.findFirst({
            where: {
              siswaId,
              mataPelajaranId,
              jenis,
            },
          });

          if (existing) {
            const updated = await tx.nilai.update({
              where: { id: existing.id },
              data: {
                nilai: parsedNilai,
                keterangan: keterangan || null,
              },
            });
            records.push(updated);
          } else {
            const created = await tx.nilai.create({
              data: {
                siswaId,
                mataPelajaranId,
                jenis,
                nilai: parsedNilai,
                keterangan: keterangan || null,
              },
            });
            records.push(created);
          }
        }
      }
      return records;
    });

    return NextResponse.json({ message: 'Nilai berhasil disimpan', data: finalResult });
  } catch (error: any) {
    console.error('Save grades error:', error);
    return NextResponse.json({ message: error.message || 'Gagal menyimpan nilai' }, { status: 500 });
  }
}
