import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getAuthenticatedUser } from '@/lib/auth';

export async function POST(request: Request) {
  const user = await getAuthenticatedUser();
  if (!user || user.role !== 'GURU') {
    return NextResponse.json({ message: 'Tidak diizinkan' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { 
      tujuanPembelajaranId, 
      mataPelajaranId, 
      kelasId, 
      topik, 
      apiKey: clientApiKey 
    } = body;

    // Ambil API Key dari client, atau fallback ke .env
    const apiKey = clientApiKey?.trim() || process.env.GEMINI_API_KEY || '';
    if (!apiKey) {
      return NextResponse.json({ 
        message: 'API Key Gemini belum diatur. Silakan masukkan API Key Gemini Anda di form untuk menggunakan fitur ini.' 
      }, { status: 400 });
    }

    // Ambil detail mapel
    let mapelNama = '';
    if (mataPelajaranId) {
      const mapel = await prisma.mataPelajaran.findUnique({
        where: { id: mataPelajaranId }
      });
      if (mapel) mapelNama = mapel.nama;
    }

    // Ambil detail kelas
    let kelasNama = '';
    if (kelasId) {
      const kelas = await prisma.kelas.findUnique({
        where: { id: kelasId }
      });
      if (kelas) kelasNama = kelas.nama;
    }

    // Ambil detail tujuan pembelajaran
    let tpDeskripsi = '';
    if (tujuanPembelajaranId) {
      const tp = await prisma.tujuanPembelajaran.findUnique({
        where: { id: tujuanPembelajaranId }
      });
      if (tp) tpDeskripsi = tp.deskripsi;
    }

    // Susun prompt untuk Gemini
    const prompt = `Buatkan Modul Ajar Kurikulum Merdeka tingkat Sekolah Dasar (SD) yang sangat lengkap dan profesional (bukan ringkasan) berdasarkan parameter berikut:
- Mata Pelajaran: ${mapelNama || 'Mata Pelajaran SD'}
- Kelas: ${kelasNama || 'SD'}
- Tujuan Pembelajaran (TP): ${tpDeskripsi || topik || 'Materi Pembelajaran'}
- Topik / Tema Tambahan: ${topik || '-'}

Anda harus menghasilkan output dalam format JSON objek dengan kunci-kunci berikut (tanpa markdown wrapper \`\`\`json atau sejenisnya, hanya string JSON mentah utuh):
{
  "judul": "Judul modul ajar yang menarik dan sesuai dengan materi (contoh: Modul Ajar Matematika - Pembagian Pecahan Kelas V)",
  "semester": "Ganjil atau Genap (sesuaikan dengan materi pembelajaran yang paling masuk akal)",
  "alokasiWaktu": "2 JP (2 x 35 Menit) atau sejenisnya",
  "kompetensiAwal": "Kompetensi prasyarat yang harus dimiliki siswa sebelum mempelajari materi ini",
  "profilLulusan": [
    "Pilih 2-3 dimensi yang paling relevan dari 8 dimensi Profil Lulusan Permendikdasmen No. 10/2025: 'Keimanan dan Ketakwaan (terhadap Tuhan YME & Berakhlak Mulia)', 'Kewargaan', 'Penalaran Kritis', 'Kreativitas', 'Kolaborasi', 'Kemandirian', 'Kesehatan', 'Komunikasi'"
  ],
  "saranaPrasarana": "Sarana prasarana penunjang yang logis (contoh: LCD Proyektor, laptop, papan tulis, kertas lipat, dll)",
  "targetPeserta": "Siswa Reguler (Umum)",
  "modelPembelajaran": "Tatap Muka / Problem-Based Learning atau Project-Based Learning",
  "tujuanPembelajaranText": "Penjabaran detail tujuan pembelajaran operasional",
  "pemahamanBermakna": "Manfaat praktis materi ini dalam kehidupan sehari-hari siswa",
  "pertanyaanPemantik": "2-3 pertanyaan pemantik pembelajaran (pisahkan dengan baris baru '\\n')",
  "kegiatanPendahuluan": "Langkah detail kegiatan pendahuluan (misal: salam, absensi, apersepsi, motivasi, penyampaian tujuan)",
  "kegiatanInti": "Langkah detail kegiatan inti sesuai model pembelajaran yang dipilih (langkah berkelompok, diskusi, presentasi, pengerjaan LKPD)",
  "kegiatanPenutup": "Langkah detail kegiatan penutup (refleksi, simpulan bersama, asesmen singkat, salam penutup)",
  "asesmenDiagnostik": "Metode penilaian awal (contoh: kuis singkat, tanya jawab lisan)",
  "asesmenFormatif": "Metode penilaian proses (contoh: rubrik observasi keaktifan kelompok, pengerjaan LKPD)",
  "asesmenSumatif": "Metode penilaian hasil akhir (contoh: tes tertulis 5 soal pilihan ganda/isian)",
  "lkpd": "Tuliskan soal latihan singkat atau tugas kelompok di dalam LKPD untuk dikerjakan siswa",
  "glosarium": "Definisi istilah-istilah penting dalam materi ini",
  "daftarPustaka": "Daftar pustaka acuan resmi (contoh: Buku Siswa dan Buku Guru Mata Pelajaran Kelas V SD Kemendikdasmen 2025)"
}

Catatan penting:
- Setiap konten deskripsi kegiatan (pendahuluan, inti, penutup) harus ditulis secara lengkap dan rinci, tidak boleh disingkat.
- Gunakan bahasa Indonesia yang baik, benar, formal, dan santun.
- Jangan menyertakan tanda petik tiga (\`\`\`json) di awal maupun akhir output. Berikan JSON valid mentah.`;

    // Panggil Gemini API
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
    const response = await fetch(geminiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: prompt }]
        }],
        generationConfig: {
          responseMimeType: 'application/json',
        }
      })
    });

    const responseData = await response.json();

    if (!response.ok) {
      console.error('Gemini API Error:', responseData);
      return NextResponse.json({ 
        message: responseData.error?.message || 'Gagal memanggil API Gemini. Cek kembali API Key Anda.' 
      }, { status: response.status });
    }

    const textResponse = responseData.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!textResponse) {
      throw new Error('Tidak menerima respon dari model AI.');
    }

    // Parsing JSON hasil dari Gemini
    const result = JSON.parse(textResponse.trim());

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('AI Generator Error:', error);
    return NextResponse.json({ 
      message: error.message || 'Terjadi kesalahan saat membuat modul ajar otomatis dengan AI.' 
    }, { status: 500 });
  }
}
