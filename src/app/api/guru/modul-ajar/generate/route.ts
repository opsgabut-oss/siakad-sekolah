import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getAuthenticatedUser } from '@/lib/auth';

function generateOfflineTemplate(mapelNama: string, kelasNama: string, tpDeskripsi: string, topik: string) {
  const finalTopic = tpDeskripsi || topik || 'Materi Pembelajaran';
  const cleanTopic = finalTopic.replace(/^\d+\.\s*/, ''); // hilangkan nomor jika ada
  
  return {
    judul: `Modul Ajar ${mapelNama || 'Mata Pelajaran'} - ${cleanTopic} - Kelas ${kelasNama || 'SD'}`,
    semester: "Ganjil",
    alokasiWaktu: "2 JP (2 x 35 Menit)",
    kompetensiAwal: `Siswa telah memahami konsep dasar awal yang berkaitan dengan ${cleanTopic.toLowerCase()}.`,
    profilLulusan: [
      "Penalaran Kritis",
      "Kemandirian",
      "Kolaborasi"
    ],
    saranaPrasarana: "Buku teks pelajaran, papan tulis, alat tulis, lembar kerja siswa (LKPD), proyektor/media cetak relevan.",
    targetPeserta: "Siswa Reguler (Umum)",
    modelPembelajaran: "Tatap Muka / Problem-Based Learning",
    tujuanPembelajaranText: `1. Peserta didik dapat memahami konsep ${cleanTopic.toLowerCase()} dengan benar.\n2. Peserta didik dapat mengidentifikasi dan memecahkan masalah sehari-hari yang berkaitan dengan ${cleanTopic.toLowerCase()}.`,
    pemahamanBermakna: `Peserta didik dapat menyadari manfaat penting dari mempelajari ${cleanTopic.toLowerCase()} dalam aktivitas sehari-hari.`,
    pertanyaanPemantik: `1. Apa yang terlintas di pikiran kalian ketika mendengar kata ${cleanTopic.toLowerCase()}?\n2. Mengapa kita perlu mempelajari ${cleanTopic.toLowerCase()}?`,
    kegiatanPendahuluan: `1. Orientasi: Guru membuka pelajaran dengan salam pembuka, menanyakan kabar siswa, dan memeriksa kehadiran siswa.\n2. Apersepsi: Guru mengaitkan materi pembelajaran sebelumnya dengan materi yang akan dipelajari hari ini tentang ${cleanTopic.toLowerCase()}.\n3. Motivasi: Guru menjelaskan manfaat nyata mempelajari ${cleanTopic.toLowerCase()} dalam kehidupan sehari-hari.\n4. Pemberian Acuan: Guru menyampaikan tujuan pembelajaran yang ingin dicapai pada hari ini.`,
    kegiatanInti: `1. Orientasi Siswa pada Masalah: Guru menyajikan contoh kasus atau gambar menarik di papan tulis terkait dengan ${cleanTopic.toLowerCase()}.\n2. Mengorganisasikan Siswa: Guru membagi kelas menjadi beberapa kelompok kecil berisi 4-5 siswa yang heterogen dan membagikan Lembar Kerja Peserta Didik (LKPD).\n3. Membimbing Penyelidikan: Siswa melakukan diskusi kelompok secara aktif untuk menyelesaikan masalah dalam LKPD. Guru berkeliling memberikan arahan dan bantuan kepada kelompok yang kesulitan.\n4. Menyajikan Hasil Karya: Perwakilan kelompok maju ke depan kelas untuk mempresentasikan hasil diskusi kelompok mereka.\n5. Menganalisis & Mengevaluasi: Kelompok lain memberikan masukan atau pertanyaan. Guru memberikan klarifikasi, ulasan, serta penguatan atas jawaban siswa.`,
    kegiatanPenutup: `1. Simpulan: Siswa bersama guru merangkum poin-poin inti dari materi pelajaran hari ini tentang ${cleanTopic.toLowerCase()}.\n2. Evaluasi: Guru memberikan kuis tertulis/lisan mandiri singkat untuk mengecek pemahaman masing-masing siswa.\n3. Refleksi: Guru menanyakan perasaan siswa mengenai KBM hari ini (apa yang menyenangkan dan apa yang dirasa masih sulit).\n4. Tindak Lanjut: Guru memberikan tugas bacaan singkat di rumah, ditutup dengan doa bersama dan salam penutup.`,
    asesmenDiagnostik: "Tanya jawab lisan secara klasikal untuk mengukur kemampuan awal siswa sebelum pembelajaran dimulai.",
    asesmenFormatif: "Observasi sikap profil lulusan selama pembelajaran, penilaian kinerja kelompok, serta penilaian hasil pengerjaan LKPD.",
    asesmenSumatif: "Tes tertulis mandiri di akhir materi yang terdiri dari 5 soal isian singkat atau pilihan ganda.",
    lkpd: `LEMBAR KERJA PESERTA DIDIK (LKPD) KELOMPOK\nMata Pelajaran: ${mapelNama || 'Mata Pelajaran'}\nMateri: ${cleanTopic}\n\nAnggota Kelompok:\n1. .....................\n2. .....................\n3. .....................\n4. .....................\n\nPetunjuk:\n1. Tuliskan nama anggota kelompok Anda.\n2. Diskusikan dan jawablah pertanyaan di bawah ini bersama teman sekelompok Anda:\n   a. Tuliskan penjelasan singkat mengenai ${cleanTopic.toLowerCase()} menurut pemahaman kelompok Anda!\n   b. Sebutkan 3 contoh penerapan atau manfaat ${cleanTopic.toLowerCase()} yang Anda temukan di lingkungan sekitar rumah Anda!\n   c. Selesaikan soal/tugas kasus yang telah ditulis guru di papan tulis bersama kelompok!`,
    glosarium: `${cleanTopic}: Tema pembelajaran utama yang dipelajari siswa guna menunjang target kompetensi pada bab berjalan.`,
    daftarPustaka: `Buku Panduan Guru dan Buku Siswa Mata Pelajaran Kelas ${kelasNama || 'SD'} Kurikulum Merdeka, Kementerian Pendidikan, Kebudayaan, Riset, dan Teknologi, 2025.`
  };
}

export async function POST(request: Request) {
  const user = await getAuthenticatedUser();
  if (!user || user.role !== 'GURU') {
    return NextResponse.json({ message: 'Tidak diizinkan' }, { status: 403 });
  }

  // Ambil data dari request
  let body;
  try {
    body = await request.json();
  } catch (e) {
    return NextResponse.json({ message: 'Request body tidak valid' }, { status: 400 });
  }

  const { 
    tujuanPembelajaranId, 
    mataPelajaranId, 
    kelasId, 
    topik, 
    apiKey: clientApiKey 
  } = body;

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

  const apiKey = clientApiKey?.trim() || process.env.GEMINI_API_KEY || '';

  // Jika API Key kosong, langsung gunakan Offline Generator (cepat dan pasti sukses)
  if (!apiKey) {
    const offlineResult = generateOfflineTemplate(mapelNama, kelasNama, tpDeskripsi, topik);
    return NextResponse.json(offlineResult);
  }

  try {
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

    // Panggil Gemini API (menggunakan model 1.5-flash yang sangat stabil di free tier)
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    
    // Set timeout 10 detik agar tidak hang
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12000);

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
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      // Jika API error, fallback otomatis ke template offline yang rapi
      console.warn('Gemini API returned error code. Falling back to offline generator.');
      const offlineResult = generateOfflineTemplate(mapelNama, kelasNama, tpDeskripsi, topik);
      return NextResponse.json(offlineResult);
    }

    const responseData = await response.json();
    const textResponse = responseData.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!textResponse) {
      throw new Error('Format respon AI tidak valid');
    }

    // Parsing JSON hasil dari Gemini
    const result = JSON.parse(textResponse.trim());
    return NextResponse.json(result);

  } catch (error) {
    // Tangkap semua error (timeout, salah kunci, dll) dan alihkan ke generator offline agar pengguna tidak terganggu
    console.error('Gemini API failed or timed out. Falling back to offline generator.', error);
    const offlineResult = generateOfflineTemplate(mapelNama, kelasNama, tpDeskripsi, topik);
    return NextResponse.json(offlineResult);
  }
}
