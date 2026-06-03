import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getAuthenticatedUser } from '@/lib/auth';

export async function GET() {
  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ message: 'Tidak diizinkan' }, { status: 401 });
  }

  try {
    let profil = await prisma.profilSekolah.findFirst();
    if (!profil) {
      // Buat profil default
      profil = await prisma.profilSekolah.create({
        data: {
          id: 'single-profile',
          pemerintah: 'Pemerintah Kabupaten Pati',
          dinas: 'Dinas Pendidikan dan Kebudayaan',
          namaSekolah: 'SD Negeri Wedusan',
          npsn: '20338123',
          alamat: 'Jl. Puncel - Ngablak KM. 05 Desa Wedusan, Kec. Dukuhseti, Kab. Pati (59158)',
          telepon: '081234567890',
          email: 'sdnwedusan@gmail.com',
          website: 'www.sdnwedusan.sch.id',
          logoUrl: null,
          namaKepsek: 'Sudarto, S.Pd',
          nipKepsek: '197408122005011002'
        }
      });
    }
    return NextResponse.json(profil);
  } catch (error) {
    console.error('Fetch profil error:', error);
    return NextResponse.json({ message: 'Gagal memuat profil sekolah' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const user = await getAuthenticatedUser();
  if (!user || user.role !== 'ADMIN') {
    return NextResponse.json({ message: 'Tidak diizinkan' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { pemerintah, dinas, namaSekolah, npsn, alamat, telepon, email, website, logoUrl, namaKepsek, nipKepsek } = body;

    if (!pemerintah || !dinas || !namaSekolah || !alamat || !namaKepsek) {
      return NextResponse.json({ message: 'Kolom utama wajib diisi' }, { status: 400 });
    }

    const profil = await prisma.profilSekolah.upsert({
      where: { id: 'single-profile' },
      update: {
        pemerintah,
        dinas,
        namaSekolah,
        npsn,
        alamat,
        telepon,
        email,
        website,
        logoUrl,
        namaKepsek,
        nipKepsek
      },
      create: {
        id: 'single-profile',
        pemerintah,
        dinas,
        namaSekolah,
        npsn,
        alamat,
        telepon,
        email,
        website,
        logoUrl,
        namaKepsek,
        nipKepsek
      }
    });

    return NextResponse.json(profil);
  } catch (error) {
    console.error('Update profil error:', error);
    return NextResponse.json({ message: 'Gagal menyimpan profil sekolah' }, { status: 500 });
  }
}
