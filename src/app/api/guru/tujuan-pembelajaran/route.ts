import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getAuthenticatedUser } from '@/lib/auth';

export async function GET(request: Request) {
  const user = await getAuthenticatedUser();
  if (!user || (user.role !== 'GURU' && user.role !== 'KEPALA_SEKOLAH' && user.role !== 'ADMIN' && user.role !== 'GURU_BK')) {
    return NextResponse.json({ message: 'Tidak diizinkan' }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const mataPelajaranId = searchParams.get('mataPelajaranId');
    const kelasId = searchParams.get('kelasId');

    if (!mataPelajaranId) {
      return NextResponse.json({ message: 'mataPelajaranId wajib disertakan' }, { status: 400 });
    }

    const whereClause: any = { mataPelajaranId };
    if (kelasId) {
      whereClause.kelasId = kelasId;
    }

    const tps = await prisma.tujuanPembelajaran.findMany({
      where: whereClause,
      orderBy: [
        { semester: 'asc' },
        { createdAt: 'asc' }
      ]
    });

    return NextResponse.json(tps);
  } catch (error) {
    console.error('Fetch TP error:', error);
    return NextResponse.json({ message: 'Gagal mengambil data tujuan pembelajaran' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const user = await getAuthenticatedUser();
  if (!user || (user.role !== 'GURU' && user.role !== 'ADMIN')) {
    return NextResponse.json({ message: 'Tidak diizinkan' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { id, mataPelajaranId, kelasId, deskripsi, kktp, alokasiJP, semester } = body;

    if (!mataPelajaranId || !deskripsi) {
      return NextResponse.json({ message: 'Data tidak lengkap' }, { status: 400 });
    }

    const kktpValue = kktp !== undefined ? parseInt(kktp, 10) : 70;
    const jp = alokasiJP !== undefined ? parseInt(alokasiJP, 10) : 4;
    const sem = semester !== undefined ? parseInt(semester, 10) : 1;

    if (id) {
      // Update
      const updated = await prisma.tujuanPembelajaran.update({
        where: { id },
        data: {
          deskripsi,
          kktp: kktpValue,
          alokasiJP: jp,
          semester: sem,
          kelasId: kelasId || undefined,
        }
      });
      return NextResponse.json({ message: 'Tujuan pembelajaran berhasil diubah', data: updated });
    } else {
      // Create
      const created = await prisma.tujuanPembelajaran.create({
        data: {
          mataPelajaranId,
          kelasId,
          deskripsi,
          kktp: kktpValue,
          alokasiJP: jp,
          semester: sem,
        }
      });
      return NextResponse.json({ message: 'Tujuan pembelajaran berhasil ditambahkan', data: created });
    }
  } catch (error: any) {
    console.error('Save TP error:', error);
    return NextResponse.json({ message: error.message || 'Gagal menyimpan tujuan pembelajaran' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const user = await getAuthenticatedUser();
  if (!user || (user.role !== 'GURU' && user.role !== 'ADMIN')) {
    return NextResponse.json({ message: 'Tidak diizinkan' }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ message: 'id wajib disertakan' }, { status: 400 });
    }

    await prisma.tujuanPembelajaran.delete({
      where: { id }
    });

    return NextResponse.json({ message: 'Tujuan pembelajaran berhasil dihapus' });
  } catch (error) {
    console.error('Delete TP error:', error);
    return NextResponse.json({ message: 'Gagal menghapus tujuan pembelajaran' }, { status: 500 });
  }
}
