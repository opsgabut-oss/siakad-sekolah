import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getAuthenticatedUser } from '@/lib/auth';
import { BUKU_PAKET_DATABASE } from '@/lib/bukuPaket';

export async function POST(request: Request) {
  const user = await getAuthenticatedUser();
  if (!user || (user.role !== 'GURU' && user.role !== 'ADMIN')) {
    return NextResponse.json({ message: 'Tidak diizinkan' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { mataPelajaranId, kelasId } = body;

    if (!mataPelajaranId || !kelasId) {
      return NextResponse.json({ message: 'Parameter tidak lengkap' }, { status: 400 });
    }

    // Ambil detail mapel & kelas
    const mapel = await prisma.mataPelajaran.findUnique({ where: { id: mataPelajaranId } });
    const kelas = await prisma.kelas.findUnique({ where: { id: kelasId } });

    if (!mapel || !kelas) {
      return NextResponse.json({ message: 'Mapel atau kelas tidak ditemukan' }, { status: 404 });
    }

    // Map database codes to book codes if there are mismatches
    const dbKode = mapel.kode.toUpperCase();
    const bookKode = 
      dbKode === 'PABP' ? 'PAI' : 
      dbKode === 'SB' ? 'SRI' : 
      dbKode === 'BJAW' ? 'JAWA' : 
      dbKode;

    // Filter chapters di BUKU_PAKET_DATABASE
    const chapters = BUKU_PAKET_DATABASE.filter(
      c => c.kelas.toLowerCase() === kelas.nama.toLowerCase() && 
           c.mapelKode.toUpperCase() === bookKode
    );

    if (chapters.length === 0) {
      return NextResponse.json({ 
        message: `Tidak ada rujukan buku paket resmi untuk ${mapel.nama} di ${kelas.nama} saat ini. Anda tetap dapat memasukkannya secara manual.` 
      }, { status: 404 });
    }

    // Ekstrak TPs dari setiap chapter
    let importedCount = 0;
    for (const chapter of chapters) {
      // Split tujuanPembelajaranText menjadi baris
      const lines = chapter.tujuanPembelajaranText.split('\n').map(l => l.trim()).filter(l => l.length > 0);
      
      for (const line of lines) {
        // Hilangkan nomor di depan jika ada (misal "1. ", "2. ")
        const cleanDesc = line.replace(/^\d+\.\s*/, '');
        const semesterNum = chapter.semester.toLowerCase().includes('ganjil') || chapter.semester.includes('1') ? 1 : 2;
        
        // Cek apakah TP dengan deskripsi ini sudah ada untuk mapel dan kelas ini
        const existing = await prisma.tujuanPembelajaran.findFirst({
          where: {
            mataPelajaranId,
            kelasId,
            deskripsi: cleanDesc
          }
        });

        if (!existing) {
          // Parse alokasi JP dari string (misal "4 JP" -> 4)
          const jpMatch = chapter.alokasiWaktu.match(/(\d+)\s*JP/i);
          const alokasiJP = jpMatch ? parseInt(jpMatch[1], 10) : 4;
          
          await prisma.tujuanPembelajaran.create({
            data: {
              mataPelajaranId,
              kelasId,
              deskripsi: cleanDesc,
              semester: semesterNum,
              alokasiJP,
              kktp: 70 // Default KKTP
            }
          });
          importedCount++;
        }
      }
    }

    return NextResponse.json({ 
      message: `Berhasil memuat ${importedCount} Tujuan Pembelajaran resmi dari Buku Paket!`,
      count: importedCount
    });

  } catch (error: any) {
    console.error('Import TPs error:', error);
    return NextResponse.json({ message: error.message || 'Gagal memuat TP otomatis' }, { status: 500 });
  }
}
