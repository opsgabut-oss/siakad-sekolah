import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getAuthenticatedUser } from '@/lib/auth';
import { BUKU_PAKET_DATABASE } from '@/lib/bukuPaket';

// Helper to enhance chapter activities into 2 meetings with explicit minutes
function enhanceChapterActivities(chapter: any) {
  const parseClean = (text: string) => {
    return text.replace(/Pertemuan \d+:\s*/gi, '').trim();
  };

  const cleanPendahuluan = parseClean(chapter.kegiatanPendahuluan);
  const cleanInti = parseClean(chapter.kegiatanInti);
  const cleanPenutup = parseClean(chapter.kegiatanPenutup);

  const p1Pend = `* Pertemuan 1 (10 Menit):
1. Guru membuka pembelajaran dengan salam pembuka, menyapa siswa, dan berdoa bersama.
2. Apersepsi: Guru mengaitkan pembelajaran hari ini dengan pengetahuan awal siswa: ${cleanPendahuluan}.
3. Motivasi: Guru menyampaikan tujuan pembelajaran dan pentingnya materi ini untuk kehidupan sehari-hari.`;

  const p2Pend = `* Pertemuan 2 (10 Menit):
1. Guru menyapa siswa dengan hangat, menanyakan kesiapan belajar, dan berdoa.
2. Apersepsi: Guru mengulas singkat materi yang dipelajari pada Pertemuan 1.
3. Pemberian Acuan: Guru menyampaikan kelanjutan kegiatan yang akan dilaksanakan hari ini.`;

  const p1Inti = `* Pertemuan 1 (50 Menit):
1. Orientasi Masalah: Guru memantik pemahaman siswa dengan media/pertanyaan terkait topik.
2. Diskusi & Investigasi: Guru membagi siswa ke dalam kelompok heterogen (4-5 orang).
3. Aktivitas Pembelajaran: Siswa secara berkelompok melakukan aktivitas utama: ${cleanInti}.
4. Bimbingan Guru: Guru berkeliling membimbing kelompok yang memerlukan arahan.`;

  const p2Inti = `* Pertemuan 2 (50 Menit):
1. Pengolahan Data: Siswa kembali ke kelompoknya untuk mendiskusikan hasil temuan sebelumnya dan merampungkan Lembar Kerja Peserta Didik (LKPD).
2. Menyajikan Hasil Karya: Perwakilan kelompok mempresentasikan hasil diskusi kelompok di depan kelas.
3. Evaluasi & Penguatan: Guru memberikan apresiasi, ulasan, serta penguatan atas hasil presentasi kelompok.`;

  const p1Penut = `* Pertemuan 1 (10 Menit):
1. Simpulan: Siswa dipandu oleh guru untuk menyimpulkan pembelajaran hari ini.
2. Refleksi: ${cleanPenutup}
3. Tindak Lanjut: Siswa diberikan tugas mandiri/bacaan singkat untuk pertemuan berikutnya.`;

  const p2Penut = `* Pertemuan 2 (10 Menit):
1. Simpulan Akhir: Siswa bersama guru menyimpulkan keseluruhan kompetensi yang telah dipelajari dari Pertemuan 1 & 2.
2. Asesmen Penutup: Guru memberikan tes evaluasi tertulis mandiri singkat.
3. Tindak Lanjut & Doa: Guru menutup pembelajaran dengan doa bersama dan salam penutup.`;

  return {
    ...chapter,
    alokasiWaktu: "4 JP (4 x 35 Menit) - 2 Pertemuan (2 Hari)",
    kegiatanPendahuluan: `${p1Pend}\n\n${p2Pend}`,
    kegiatanInti: `${p1Inti}\n\n${p2Inti}`,
    kegiatanPenutup: `${p1Penut}\n\n${p2Penut}`,
  };
}

function generateOfflineTemplate(mapelNama: string, kelasNama: string, tpDeskripsi: string, topik: string) {
  const finalTopic = tpDeskripsi || topik || 'Materi Pembelajaran';
  const cleanTopic = finalTopic.replace(/^\d+\.\s*/, ''); // hilangkan nomor jika ada
  
  return {
    judul: `Modul Ajar ${mapelNama || 'Mata Pelajaran'} - ${cleanTopic} - Kelas ${kelasNama || 'SD'}`,
    semester: "Ganjil",
    alokasiWaktu: "4 JP (4 x 35 Menit) - 2 Pertemuan (2 Hari)",
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
    
    kegiatanPendahuluan: `* Pertemuan 1 (10 Menit):
1. Orientasi: Guru membuka pelajaran dengan salam pembuka, menanyakan kabar siswa, dan memeriksa kehadiran siswa.
2. Apersepsi: Guru mengaitkan materi sebelumnya dengan konsep ${cleanTopic.toLowerCase()}.
3. Motivasi: Guru menjelaskan tujuan pembelajaran dan manfaat mempelajari ${cleanTopic.toLowerCase()} dalam kehidupan sehari-hari.

* Pertemuan 2 (10 Menit):
1. Orientasi: Guru menyapa siswa dan memimpin doa bersama sebelum memulai pembelajaran.
2. Apersepsi: Guru mengulas kembali konsep dasar ${cleanTopic.toLowerCase()} yang sudah dipelajari di pertemuan pertama.
3. Pemberian Acuan: Guru menyampaikan rencana kegiatan inti lanjutan untuk pertemuan kedua.`,

    kegiatanInti: `* Pertemuan 1 (50 Menit):
1. Orientasi Siswa pada Masalah: Guru menyajikan contoh kasus atau gambar menarik di papan tulis terkait dengan ${cleanTopic.toLowerCase()}.
2. Mengorganisasikan Siswa: Guru membagi kelas menjadi beberapa kelompok kecil berisi 4-5 siswa yang heterogen dan membagikan Lembar Kerja Peserta Didik (LKPD).
3. Membimbing Penyelidikan: Siswa melakukan diskusi kelompok secara aktif untuk menyelesaikan masalah dalam LKPD. Guru berkeliling memberikan bimbingan.
4. Menyajikan Hasil Karya Awal: Perwakilan kelompok mempresentasikan analisis awal mereka tentang ${cleanTopic.toLowerCase()}.

* Pertemuan 2 (50 Menit):
1. Mengembangkan Hasil Karya: Siswa kembali ke kelompok masing-masing untuk menyempurnakan solusi pemecahan masalah.
2. Menyajikan Hasil Karya Akhir: Setiap kelompok secara bergantian mempresentasikan produk hasil pemecahan masalah atau kesimpulan akhir kelompok di depan kelas.
3. Menganalisis & Mengevaluasi: Kelompok lain memberikan masukan atau pertanyaan. Guru memberikan klarifikasi, ulasan, serta penguatan materi ${cleanTopic.toLowerCase()}.`,

    kegiatanPenutup: `* Pertemuan 1 (10 Menit):
1. Simpulan Awal: Siswa bersama guru menyimpulkan inti pembelajaran pertemuan pertama.
2. Refleksi: Guru menanyakan perasaan siswa mengenai proses belajar hari ini.
3. Tindak Lanjut: Guru meminta siswa mengamati penerapan ${cleanTopic.toLowerCase()} di rumah untuk dibahas pertemuan berikutnya.

* Pertemuan 2 (10 Menit):
1. Rangkuman Akhir: Siswa bersama guru merangkum seluruh materi tentang ${cleanTopic.toLowerCase()} dari pertemuan 1 & 2.
2. Evaluasi: Guru memberikan kuis tertulis mandiri singkat untuk mengecek pemahaman akhir siswa.
3. Refleksi & Penutup: Guru memberikan apresiasi atas kerja kelompok siswa, doa bersama, dan salam penutup.`,

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
    bukuPaketChapterId,
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

  // Cari chapter dari Buku Paket Database offline jika ada
  const selectedChapter = bukuPaketChapterId 
    ? BUKU_PAKET_DATABASE.find(c => c.id === bukuPaketChapterId)
    : null;

  const apiKey = clientApiKey?.trim() || process.env.GEMINI_API_KEY || '';

  // Jika API Key kosong, gunakan Offline Generator (menggunakan chapter yang dipilih atau fallback umum)
  if (!apiKey) {
    if (selectedChapter) {
      return NextResponse.json(enhanceChapterActivities(selectedChapter));
    }
    const offlineResult = generateOfflineTemplate(mapelNama, kelasNama, tpDeskripsi, topik);
    return NextResponse.json(offlineResult);
  }

  try {
    // Susun prompt untuk Gemini
    let prompt = `Buatkan Modul Ajar Kurikulum Merdeka tingkat Sekolah Dasar (SD) yang sangat lengkap dan profesional (bukan ringkasan) berdasarkan parameter berikut:
- Mata Pelajaran: ${mapelNama || 'Mata Pelajaran SD'}
- Kelas: ${kelasNama || 'SD'}
- Tujuan Pembelajaran (TP): ${tpDeskripsi || topik || 'Materi Pembelajaran'}
- Topik / Tema Tambahan: ${topik || '-'}\n`;

    if (selectedChapter) {
      prompt += `\nAnda wajib mengacu pada kerangka buku paket resmi berikut untuk menyusun materi:\n`;
      prompt += `- Judul Bab: ${selectedChapter.judulBab}\n`;
      prompt += `- Kompetensi Awal: ${selectedChapter.kompetensiAwal}\n`;
      prompt += `- Tujuan Pembelajaran Buku: ${selectedChapter.tujuanPembelajaranText}\n`;
      prompt += `- Pemahaman Bermakna Buku: ${selectedChapter.pemahamanBermakna}\n`;
      prompt += `- Pertanyaan Pemantik Buku: ${selectedChapter.pertanyaanPemantik}\n`;
      prompt += `- Kegiatan Pembelajaran Buku: ${selectedChapter.kegiatanPendahuluan} ${selectedChapter.kegiatanInti} ${selectedChapter.kegiatanPenutup}\n`;
      prompt += `- Lembar Kerja Peserta Didik (LKPD) Buku: ${selectedChapter.lkpd}\n`;
      prompt += `- Rujukan Daftar Pustaka: ${selectedChapter.daftarPustaka}\n\n`;
      prompt += `Tugas Anda adalah memodifikasi, memperluas, dan melengkapi seluruh bagian di atas menjadi draf modul ajar utuh kelas yang mengesankan, detail, dan formal.`;
    }

    prompt += `\n\nAnda harus menghasilkan output dalam format JSON objek dengan kunci-kunci berikut (tanpa markdown wrapper \`\`\`json atau sejenisnya, hanya string JSON mentah utuh):
{
  "judul": "Judul modul ajar yang menarik dan sesuai dengan materi (contoh: Modul Ajar Matematika - Pembagian Pecahan Kelas V)",
  "semester": "Ganjil atau Genap (sesuaikan dengan materi pembelajaran yang paling masuk akal)",
  "alokasiWaktu": "4 JP (4 x 35 Menit) - Dibagi menjadi 2 Pertemuan (2 hari)",
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
  "kegiatanPendahuluan": "Wajib dibagi menjadi Pertemuan 1 (10 Menit) dan Pertemuan 2 (10 Menit) secara eksplisit. Contoh:\\n* Pertemuan 1 (10 Menit):\\n  1. Guru membuka pembelajaran dengan salam dan doa.\\n  2. Apersepsi...\\n* Pertemuan 2 (10 Menit):\\n  1. Guru menyapa siswa...\\n  2. Apersepsi materi sebelumnya...",
  "kegiatanInti": "Wajib dibagi menjadi Pertemuan 1 (50 Menit) dan Pertemuan 2 (50 Menit) secara eksplisit. Contoh:\\n* Pertemuan 1 (50 Menit):\\n  1. Orientasi...\\n  2. Diskusi...\\n* Pertemuan 2 (50 Menit):\\n  1. Melanjutkan proyek...\\n  2. Presentasi...",
  "kegiatanPenutup": "Wajib dibagi menjadi Pertemuan 1 (10 Menit) dan Pertemuan 2 (10 Menit) secara eksplisit. Contoh:\\n* Pertemuan 1 (10 Menit):\\n  1. Refleksi...\\n  2. Tugas mandiri...\\n* Pertemuan 2 (10 Menit):\\n  1. Kesimpulan...\\n  2. Penutup dan doa...",
  "asesmenDiagnostik": "Metode penilaian awal (contoh: kuis singkat, tanya jawab lisan)",
  "asesmenFormatif": "Metode penilaian proses (contoh: rubrik observasi keaktifan kelompok, pengerjaan LKPD)",
  "asesmenSumatif": "Metode penilaian hasil akhir (contoh: tes tertulis 5 soal pilihan ganda/isian)",
  "lkpd": "Tuliskan soal latihan singkat atau tugas kelompok di dalam LKPD untuk dikerjakan siswa. Wajib mengacu dan mengembangkan dari LKPD Buku resmi yang disediakan di atas (jika ada).",
  "glosarium": "Definisi istilah-istilah penting dalam materi ini",
  "daftarPustaka": "Daftar pustaka acuan resmi (contoh: Buku Siswa dan Buku Guru Mata Pelajaran Kelas V SD Kemendikdasmen 2025)"
}

Catatan penting:
- Bagi seluruh kegiatan pembelajaran menjadi Pertemuan 1 dan Pertemuan 2 secara eksplisit untuk menggambarkan pembagian 2 hari belajar agar siswa tidak jenuh, serta cantumkan alokasi waktu menit di setiap pertemuan (Pendahuluan: 10 Menit, Inti: 50 Menit, Penutup: 10 Menit).
- Setiap konten deskripsi kegiatan (pendahuluan, inti, penutup) harus ditulis secara lengkap, panjang, dan rinci, tidak boleh disingkat.
- Gunakan bahasa Indonesia yang baik, benar, formal, dan santun.
- Jangan menyertakan tanda petik tiga (\`\`\`json) di awal maupun akhir output. Berikan JSON valid mentah.`;

    // Panggil Gemini API (menggunakan model 1.5-flash yang sangat stabil di free tier)
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    
    // Set timeout 12 detik agar tidak hang
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
      console.warn('Gemini API returned error. Falling back to offline generator.');
      if (selectedChapter) return NextResponse.json(enhanceChapterActivities(selectedChapter));
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
    if (selectedChapter) return NextResponse.json(enhanceChapterActivities(selectedChapter));
    const offlineResult = generateOfflineTemplate(mapelNama, kelasNama, tpDeskripsi, topik);
    return NextResponse.json(offlineResult);
  }
}
