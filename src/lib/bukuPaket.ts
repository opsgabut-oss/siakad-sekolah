export interface BukuPaketChapter {
  id: string;
  kelas: string;
  mapelKode: string;
  judulBab: string;
  judulModul: string;
  semester: string;
  alokasiWaktu: string;
  kompetensiAwal: string;
  profilLulusan: string[];
  saranaPrasarana: string;
  targetPeserta: string;
  modelPembelajaran: string;
  tujuanPembelajaranText: string;
  pemahamanBermakna: string;
  pertanyaanPemantik: string;
  kegiatanPendahuluan: string;
  kegiatanInti: string;
  kegiatanPenutup: string;
  asesmenDiagnostik: string;
  asesmenFormatif: string;
  asesmenSumatif: string;
  lkpd: string;
  glosarium: string;
  daftarPustaka: string;
}

export const BUKU_PAKET_DATABASE: BukuPaketChapter[] = [
  {
    id: "mtk-4-cacah",
    kelas: "Kelas 4",
    mapelKode: "MTK",
    judulBab: "Bab 1: Bilangan Cacah sampai 10.000",
    judulModul: "Modul Ajar Matematika - Bilangan Cacah sampai 10.000 (Sesuai Buku Paket Kurikulum Merdeka)",
    semester: "Ganjil",
    alokasiWaktu: "4 JP (4 x 35 Menit) - 2 Pertemuan",
    kompetensiAwal: "Peserta didik telah memahami konsep nilai tempat (satuan, puluhan, ratusan) serta mampu membaca dan menulis bilangan cacah hingga 1.000.",
    profilLulusan: [
      "Penalaran Kritis",
      "Kemandirian",
      "Kolaborasi"
    ],
    saranaPrasarana: "Buku Siswa Matematika Kelas IV Volume 1 (Penerbit Kemendikbudristek 2021/2025), kartu angka (0-9), papan nilai tempat, dekak-dekak, proyektor, lembar kerja peserta didik (LKPD) tercetak.",
    targetPeserta: "Siswa Reguler (Umum)",
    modelPembelajaran: "Tatap Muka / Problem-Based Learning (PBL)",
    tujuanPembelajaranText: "1. Peserta didik dapat membaca bilangan cacah sampai 10.000 dengan tepat.\n2. Peserta didik dapat menuliskan lambang bilangan cacah sampai 10.000 berdasarkan nilai tempatnya.\n3. Peserta didik dapat menentukan nilai tempat (ribuan, ratusan, puluhan, satuan) dari bilangan cacah sampai 10.000.\n4. Peserta didik dapat membandingkan dan mengurutkan bilangan cacah sampai 10.000 dalam pemecahan masalah.",
    pemahamanBermakna: "Kemampuan memahami bilangan cacah besar membantu siswa dalam melakukan transaksi keuangan sehari-hari, membaca data jumlah penduduk, membaca skala peta sederhana, serta mengukur jarak antarkota.",
    pertanyaanPemantik: "1. Jika uang jajan kalian adalah Rp 5.500, bagaimana cara kalian menuliskan angka tersebut dalam bentuk tabel nilai tempat?\n2. Mengapa angka 5 pada bilangan 5.500 memiliki arti yang berbeda meskipun bentuk angkanya sama?\n3. Bagaimana cara tercepat menentukan mana yang lebih besar antara Rp 8.450 dengan Rp 8.540?",
    kegiatanPendahuluan: "Pertemuan 1 (2 JP - 70 Menit)\n1. Orientasi (10 Menit):\n- Guru mengucapkan salam, menanyakan kabar siswa, dan memeriksa kehadiran.\n- Siswa berdoa bersama dipimpin oleh ketua kelas untuk menanamkan karakter religius.\n2. Apersepsi (5 Menit):\n- Guru menunjukkan uang mainan kertas senilai Rp 1.000 dan bertanya, 'Berapa nilai uang ini?'\n- Guru kemudian menambahkan beberapa lembar uang kertas Rp 1.000 dan Rp 100 untuk memancing ingatan siswa tentang bilangan ratusan dan ribuan dasar.\n3. Motivasi (5 Menit):\n- Guru menceritakan pentingnya materi hari ini, misalnya untuk menghitung kembalian belanja di koperasi sekolah.\n4. Pemberian Acuan (5 Menit):\n- Guru menyampaikan tujuan pembelajaran hari ini yaitu membaca dan menulis bilangan cacah hingga 10.000 berdasarkan buku paket Matematika Bab 1.",
    kegiatanInti: "Pertemuan 1 (2 JP - 70 Menit)\n1. Orientasi Siswa pada Masalah (15 Menit):\n- Guru menampilkan tabel data jumlah siswa SD Negeri Wedusan atau sekolah terdekat di papan tulis (misalnya: 1.245 siswa, 2.304 siswa, dll).\n- Guru meminta siswa mengamati angka-angka tersebut dan menanyakan: 'Bagaimana cara membaca bilangan yang terdiri dari 4 digit ini?'\n2. Mengorganisasikan Siswa (10 Menit):\n- Guru membagi siswa ke dalam beberapa kelompok diskusi beranggotakan 4 orang.\n- Guru membagikan Lembar Kerja Peserta Didik (LKPD) Kelompok dan seperangkat kartu angka (0-9).\n3. Membimbing Penyelidikan (15 Menit):\n- Siswa berdiskusi menyusun kartu angka membentuk bilangan tertentu sesuai instruksi LKPD.\n- Siswa memetakan digit angka tersebut ke dalam kolom Nilai Tempat (Ribuan, Ratusan, Puluhan, Satuan).\n- Guru berkeliling memberikan arahan serta memvalidasi kerja kelompok yang masih kebingungan dalam menempatkan angka 0 pada nilai tempat puluhan atau ratusan.\n4. Mengembangkan Hasil Karya (15 Menit):\n- Perwakilan kelompok mempresentasikan hasil penyusunan kartu angka dan pembacaan bilangan di depan kelas.\n- Siswa lain menyimak dan mencocokkan dengan hasil kerja kelompok mereka.\n5. Analisis & Evaluasi (15 Menit):\n- Guru memberikan evaluasi terhadap jalannya presentasi.\n- Guru memberikan contoh penulisan angka ribuan yang benar menggunakan tanda titik pemisah ribuan (misal: 4.500 bukan 4500).",
    kegiatanPenutup: "Pertemuan 1 (15 Menit)\n1. Simpulan (5 Menit):\n- Siswa bersama guru menyimpulkan cara membaca dan menulis bilangan cacah sampai 10.000 berdasarkan nilai tempatnya.\n2. Refleksi (5 Menit):\n- Guru menanyakan: 'Bagian mana dari pelajaran hari ini yang paling kalian sukai? Apakah masih ada yang bingung tentang nilai tempat ribuan?'\n3. Tindak Lanjut (5 Menit):\n- Guru memberikan pekerjaan rumah (PR) mandiri dari Buku Siswa Matematika Kelas IV halaman 12.\n- Pembelajaran ditutup dengan doa dan salam penutup.",
    asesmenDiagnostik: "Tanya jawab lisan secara klasikal mengenai bilangan ratusan (contoh: membaca angka 789, menentukan nilai tempat angka 8 pada 820) sebelum masuk ke materi ribuan.",
    asesmenFormatif: "Penilaian proses berupa rubrik observasi keaktifan kerja sama dalam diskusi kelompok, ketepatan pengerjaan LKPD kelompok, dan penilaian kuis individu tertulis (3 soal menulis lambang bilangan).",
    asesmenSumatif: "Tes tertulis di akhir pertemuan berupa evaluasi mandiri esai sebanyak 5 soal pemecahan masalah kontekstual bilangan cacah besar (membaca, menulis, membandingkan bilangan).",
    lkpd: "LEMBAR KERJA PESERTA DIDIK (LKPD) KELOMPOK\nMata Pelajaran: Matematika\nMateri: Nilai Tempat Bilangan Cacah sampai 10.000\n\nNama Anggota Kelompok:\n1. .....................\n2. .....................\n3. .....................\n4. .....................\n\nPetunjuk Pengerjaan:\n1. Tuliskan nama anggota kelompok Anda.\n2. Menggunakan kartu angka yang diberikan guru, susunlah angka-angka berikut:\n   - Kelompokkan angka 3, 7, 0, dan 5 menjadi bilangan ribuan terbesar yang mungkin.\n   - Kelompokkan angka 3, 7, 0, dan 5 menjadi bilangan ribuan terkecil yang mungkin.\n3. Masukkan bilangan yang telah Anda susun ke dalam tabel nilai tempat di bawah ini:\n   Ribuan | Ratusan | Puluhan | Satuan\n   ---------------------------------\n   ...... | ....... | ....... | ......\n4. Tulislah cara membaca kedua bilangan tersebut dengan huruf!",
    glosarium: "1. Bilangan Cacah: Himpunan bilangan bulat yang tidak negatif, yaitu {0, 1, 2, 3, ...}.\n2. Nilai Tempat: Nilai suatu angka dalam suatu bilangan berdasarkan letak posisinya (satuan, puluhan, ratusan, ribuan).\n3. Digit: Lambang bilangan tunggal (angka 0 sampai 9) yang digunakan untuk membentuk angka majemuk.",
    daftarPustaka: "1. Hobri, dkk. 2021. Buku Panduan Guru Matematika untuk SD Kelas IV. Jakarta: Pusat Kurikulum dan Perbukuan Kemendikbudristek.\n2. Hobri, dkk. 2021. Buku Siswa Matematika untuk SD Kelas IV. Jakarta: Pusat Kurikulum dan Perbukuan Kemendikbudristek."
  },
  {
    id: "mtk-4-pecahan",
    kelas: "Kelas 4",
    mapelKode: "MTK",
    judulBab: "Bab 2: Pecahan Senilai dan Menyederhanakan",
    judulModul: "Modul Ajar Matematika - Pecahan Senilai dan Menyederhanakan Pecahan (Sesuai Buku Paket)",
    semester: "Ganjil",
    alokasiWaktu: "4 JP (4 x 35 Menit) - 2 Pertemuan",
    kompetensiAwal: "Peserta didik telah mengenal konsep pecahan dasar sebagai bagian dari keseluruhan (seperti 1/2, 1/4) menggunakan gambar lingkaran/kotak di kelas III.",
    profilLulusan: [
      "Penalaran Kritis",
      "Kreativitas",
      "Kolaborasi"
    ],
    saranaPrasarana: "Buku Siswa Matematika Kelas IV Penerbit Kemendikbudristek, kertas origami warna-warni, gunting, spidol warna, penggaris, lembar kerja siswa (LKPD).",
    targetPeserta: "Siswa Reguler (Umum)",
    modelPembelajaran: "Tatap Muka / Project-Based Learning (PjBL)",
    tujuanPembelajaranText: "1. Peserta didik dapat menjelaskan konsep pecahan senilai menggunakan alat peraga konkret (lipatan kertas).\n2. Peserta didik dapat menentukan pecahan-pecahan yang senilai dengan suatu pecahan yang diberikan.\n3. Peserta didik dapat menyederhanakan pecahan sampai ke bentuk yang paling sederhana.",
    pemahamanBermakna: "Konsep pecahan senilai digunakan dalam kehidupan sehari-hari saat membagi makanan (seperti martabak atau pizza) secara merata kepada beberapa orang tanpa mengurangi porsi total.",
    pertanyaanPemantik: "1. Jika Ibu memotong martabak menjadi 4 bagian dan kamu memakan 2 bagian, lalu adik memakan 4 bagian dari martabak yang dipotong 8, siapakah yang memakan martabak lebih banyak?\n2. Bagaimana cara membuktikan bahwa setengah gelas air sama nilainya dengan dua perempat gelas air?",
    kegiatanPendahuluan: "Pertemuan 1 (2 JP - 70 Menit)\n1. Orientasi (10 Menit):\n- Guru mengucapkan salam, menyapa siswa, mengecek kerapian kelas, dan berdoa.\n2. Apersepsi (5 Menit):\n- Guru menggambar dua buah lingkaran yang sama besar di papan tulis. Satu lingkaran dibagi 2 bagian (diarsir 1 bagian), dan satu lagi dibagi 4 bagian (diarsir 2 bagian). Guru bertanya, 'Manakah daerah arsir yang lebih luas?'\n3. Motivasi (5 Menit):\n- Guru menjelaskan bahwa hari ini kita akan belajar tentang pecahan senilai agar kita bisa membagi benda secara adil.\n4. Pemberian Acuan (5 Menit):\n- Guru menjelaskan tujuan pembelajaran hari ini yaitu membuktikan pecahan senilai menggunakan aktivitas melipat kertas origami.",
    kegiatanInti: "Pertemuan 1 (2 JP - 70 Menit)\n1. Pertanyaan Mendasar (10 Menit):\n- Guru menanyakan, 'Bagaimana cara melipat selembar kertas agar dapat menunjukkan pecahan 1/2, 2/4, dan 4/8 secara visual?'\n2. Mendesain Perencanaan Proyek (10 Menit):\n- Siswa berkumpul dalam kelompoknya (4 orang per kelompok).\n- Siswa mempersiapkan 3 lembar kertas origami dengan warna yang berbeda, penggaris, dan spidol warna.\n3. Menyusun Jadwal Pembuatan (5 Menit):\n- Guru dan siswa menyepakati waktu pembuatan lipatan kertas pembukti pecahan senilai selama 15 menit.\n4. Memonitor Keaktifan & Proyek (15 Menit):\n- Siswa melipat origami pertama menjadi 2 bagian lalu mengarsir 1 bagian (1/2).\n- Origami kedua dilipat menjadi 4 bagian lalu mengarsir 2 bagian (2/4).\n- Origami ketiga dilipat menjadi 8 bagian lalu mengarsir 4 bagian (4/8).\n- Siswa membandingkan luas arsir ketiga kertas tersebut dengan menempelkannya berdampingan.\n- Guru memandu dan membantu siswa yang kesulitan membagi lipatan kertas secara presisi.\n5. Menguji Hasil (10 Menit):\n- Siswa mengamati bahwa luas daerah yang diarsir pada ketiga origami tersebut adalah sama besar.\n- Siswa menuliskan kesimpulan di LKPD bahwa 1/2 = 2/4 = 4/8.\n6. Evaluasi Pengalaman Belajar (10 Menit):\n- Perwakilan kelompok mempresentasikan hasil origami mereka di depan kelas.\n- Guru memperkuat dengan rumus matematika bahwa pecahan senilai dapat diperoleh dengan mengalikan atau membagi pembilang dan penyebut dengan angka yang sama.",
    kegiatanPenutup: "Pertemuan 1 (15 Menit)\n1. Kesimpulan (5 Menit):\n- Guru membimbing siswa membuat kesimpulan tentang pecahan senilai.\n2. Refleksi (5 Menit):\n- Siswa menuliskan kesan belajar hari ini di jurnal belajar matematika.\n3. Tindak Lanjut (5 Menit):\n- Guru memberikan tugas latihan soal di Buku Siswa halaman 25.\n- Kelas ditutup dengan doa bersama.",
    asesmenDiagnostik: "Tes tertulis singkat menyebutkan nilai pecahan dari gambar arsir lingkaran sederhana (contoh gambar yang bernilai 1/3, 3/4).",
    asesmenFormatif: "Penilaian proses proyek (kerapian melipat, ketepatan arsir), penilaian kerja sama kelompok, serta ketepatan pengisian laporan LKPD proyek.",
    asesmenSumatif: "Tes esai mandiri sebanyak 5 soal latihan tentang menentukan 3 pecahan yang senilai dan menyederhanakan pecahan ke bentuk paling sederhana.",
    lkpd: "LEMBAR KERJA PESERTA DIDIK (LKPD) KELOMPOK\nMata Pelajaran: Matematika\nMateri: Eksperimen Pecahan Senilai dengan Origami\n\nNama Kelompok:\n1. .....................\n2. .....................\n3. .....................\n4. .....................\n\nLangkah Kegiatan:\n1. Ambillah Origami A (Warna Merah). Lipatlah menjadi 2 bagian yang sama besar. Arsirlah 1 bagian. Tulis pecahan yang terbentuk: ...... / ......\n2. Ambillah Origami B (Warna Biru). Lipatlah menjadi 4 bagian yang sama besar. Arsirlah 2 bagian. Tulis pecahan yang terbentuk: ...... / ......\n3. Ambillah Origami C (Warna Hijau). Lipatlah menjadi 8 bagian yang sama besar. Arsirlah 4 bagian. Tulis pecahan yang terbentuk: ...... / ......\n4. Tempelkan ketiga origami tersebut berdampingan di bawah ini. Apakah daerah arsirnya sama besar?\n5. Tulislah kesimpulan kelompok Anda tentang hubungan antara ketiga pecahan tersebut!",
    glosarium: "1. Pecahan Senilai: Pecahan-pecahan yang memiliki nilai yang sama meskipun dituliskan dalam lambang angka pembilang dan penyebut yang berbeda.\n2. Pembilang: Bilangan yang berada di bagian atas pada penulisan pecahan, menunjukkan bagian yang diambil.\n3. Penyebut: Bilangan yang berada di bagian bawah pada penulisan pecahan, menunjukkan jumlah pembagian keseluruhan.",
    daftarPustaka: "1. Hobri, dkk. 2021. Buku Panduan Guru Matematika untuk SD Kelas IV. Jakarta: Pusat Kurikulum dan Perbukuan Kemendikbudristek.\n2. Hobri, dkk. 2021. Buku Siswa Matematika untuk SD Kelas IV. Jakarta: Pusat Kurikulum dan Perbukuan Kemendikbudristek."
  },
  {
    id: "ipas-4-tumbuhan",
    kelas: "Kelas 4",
    mapelKode: "IPAS",
    judulBab: "Bab 1: Bagian Tubuh Tumbuhan dan Fungsinya",
    judulModul: "Modul Ajar IPAS - Bagian Tubuh Tumbuhan dan Fungsinya (Sesuai Buku Paket Kurikulum Merdeka)",
    semester: "Ganjil",
    alokasiWaktu: "3 JP (3 x 35 Menit) - 1 Pertemuan",
    kompetensiAwal: "Peserta didik telah mengenal nama-nama tumbuhan di lingkungan sekitar dan mengetahui secara umum bahwa tumbuhan memiliki akar dan daun.",
    profilLulusan: [
      "Penalaran Kritis",
      "Kolaborasi",
      "Kemandirian"
    ],
    saranaPrasarana: "Buku Siswa IPAS Kelas IV Bab 1 (Penerbit Kemendikbudristek), tumbuhan utuh yang dicabut beserta akarnya (contoh: rumput atau tanaman liar kecil), kaca pembesar (lup), proyektor, LKPD pengamatan.",
    targetPeserta: "Siswa Reguler (Umum)",
    modelPembelajaran: "Tatap Muka / Discovery Learning",
    tujuanPembelajaranText: "1. Peserta didik dapat mengidentifikasi bagian-bagian tubuh tumbuhan (akar, batang, daun, bunga, buah, biji) dengan benar.\n2. Peserta didik dapat menganalisis fungsi dari masing-masing bagian tubuh tumbuhan bagi kelangsungan hidup tumbuhan tersebut.\n3. Peserta didik dapat menyajikan hasil laporan pengamatan bagian tubuh tumbuhan beserta fungsinya dalam bentuk tabel.",
    pemahamanBermakna: "Dengan memahami bagian tubuh tumbuhan beserta fungsinya, peserta didik dapat merawat tumbuhan di rumah dengan benar (misal menyiram air di tanah agar diserap akar, meletakkan tanaman di tempat terang untuk fotosintesis daun).",
    pertanyaanPemantik: "1. Mengapa tumbuhan tidak jatuh roboh meskipun tertiup angin kencang?\n2. Bagaimana cara tumbuhan makan sedangkan mereka tidak punya mulut seperti kita?\n3. Mengapa daun pada tumbuhan sebagian besar berwarna hijau?",
    kegiatanPendahuluan: "Pertemuan 1 (3 JP - 105 Menit)\n1. Orientasi (10 Menit):\n- Salam, menanyakan kabar, cek kebersihan sekitar bangku, berdoa bersama dipimpin salah satu siswa.\n2. Apersepsi (10 Menit):\n- Guru membawa pot tanaman hias kecil ke dalam kelas dan meletakkannya di meja depan.\n- Guru menunjuk daun dan batang, lalu bertanya: 'Apa nama bagian yang bapak tunjuk ini? Apa gunanya bagi tanaman ini?'\n3. Motivasi (5 Menit):\n- Guru menyampaikan bahwa tumbuhan adalah produsen oksigen bagi bumi, sehingga memahami tubuhnya akan membantu kita melestarikannya.\n4. Pemberian Acuan (5 Menit):\n- Guru menyampaikan tujuan pembelajaran hari ini yaitu mengidentifikasi bagian tubuh tumbuhan beserta fungsinya melalui pengamatan langsung di luar kelas.",
    kegiatanInti: "Pertemuan 1 (3 JP - 105 Menit)\n1. Stimulasi (10 Menit):\n- Siswa membaca Buku Paket IPAS Kelas IV halaman 2-5 mengenai bagian-bagian tanaman.\n- Guru menayangkan video animasi singkat tentang perjalanan air dari tanah menuju daun tumbuhan.\n2. Identifikasi Masalah (10 Menit):\n- Guru menanyakan: 'Bagaimana air dari dalam tanah bisa sampai ke daun tertinggi sebuah pohon? Apa peran batang dan akar dalam proses ini?'\n3. Pengumpulan Data (20 Menit):\n- Siswa dibagi dalam kelompok berisi 4-5 orang.\n- Guru mengajak siswa keluar ke halaman sekolah untuk mengamati tumbuhan liar kecil secara langsung.\n- Setiap kelompok mencabut satu jenis rumput/tumbuhan liar secara hati-hati agar akarnya tidak putus, lalu membersihkan tanah yang menempel pada akar menggunakan air.\n- Siswa mengamati akar, batang, daun, serta bunga (jika ada) menggunakan kaca pembesar (lup).\n4. Pengolahan Data (15 Menit):\n- Siswa kembali ke dalam kelas dan berdiskusi mengisi LKPD Laporan Pengamatan.\n- Siswa mencatat struktur akar (serabut/tunggang), bentuk batang, dan tulang daun (menyirip/menjari/sejajar) serta fungsinya.\n5. Pembuktian (15 Menit):\n- Setiap kelompok membacakan hasil laporan pengamatannya.\n- Guru memvalidasi dan meluruskan konsep, misalnya menjelaskan fungsi stomata pada daun untuk bernapas dan klorofil untuk fotosintesis.\n6. Menarik Kesimpulan (5 Menit):\n- Guru bersama siswa merangkum bagian tubuh tumbuhan: akar menyerap air, batang menyalurkan air/nutrisi, daun memasak makanan (fotosintesis), bunga untuk perkembangbiakan.",
    kegiatanPenutup: "Pertemuan 1 (15 Menit)\n1. Evaluasi & Refleksi (10 Menit):\n- Guru memberikan kuis tertulis mandiri sebanyak 4 soal singkat.\n- Siswa menyampaikan refleksi: 'Hari ini saya senang karena bisa mencabut tanaman langsung dan melihat akarnya lewat lup.'\n2. Tindak Lanjut (5 Menit):\n- Guru memberi instruksi agar siswa menyiram tanaman di rumah masing-masing dan menutup kelas dengan doa.",
    asesmenDiagnostik: "Tanya jawab lisan tentang perbedaan tumbuhan dengan hewan (contoh: apakah tumbuhan bisa bergerak berpindah tempat? bagaimana tumbuhan mencari makan?).",
    asesmenFormatif: "Penilaian kinerja pengamatan di lapangan, ketepatan pengisian tabel klasifikasi organ tumbuhan di LKPD, dan penilaian sikap gotong royong dalam kerja kelompok.",
    asesmenSumatif: "Tes tertulis mandiri berupa 5 soal pilihan ganda mengenai fungsi spesifik organ tumbuhan (fotosintesis, penyerapan zat hara, penguapan air).",
    lkpd: "LEMBAR KERJA PESERTA DIDIK (LKPD) KELOMPOK\nMata Pelajaran: IPAS\nMateri: Laporan Pengamatan Organ Tumbuhan\n\nNama Anggota Kelompok:\n1. .....................\n2. .....................\n3. .....................\n4. .....................\n\nLangkah Kegiatan:\n1. Amatilah tumbuhan liar yang telah kelompok Anda cabut.\n2. Gambar sketsa sederhana tumbuhan tersebut di lembar ini, dan berikan garis petunjuk nama bagian tubuhnya!\n3. Lengkapilah tabel fungsi organ tumbuhan di bawah ini:\n   Bagian Tubuh | Hasil Pengamatan Struktur | Fungsi Bagi Tumbuhan\n   --------------------------------------------------------------\n   Akar         | Serabut / Tunggang        | ....................\n   Batang       | Berkayu / Basah / Rumput  | ....................\n   Daun         | Menyirip/Menjari/Sejajar  | ....................\n4. Diskusikan: Apa yang akan terjadi pada tumbuhan jika daunnya dipotong habis?",
    glosarium: "1. Fotosintesis: Proses pembuatan makanan oleh tumbuhan hijau dengan bantuan cahaya matahari, air, dan karbon dioksida.\n2. Klorofil: Zat hijau daun yang berperan penting dalam menyerap energi cahaya matahari untuk fotosintesis.\n3. Stomata: Mulut daun berupa celah kecil pada epidermis daun yang berfungsi sebagai organ pertukaran gas.",
    daftarPustaka: "1. Fitri, Amalia, dkk. 2021. Buku Panduan Guru Ilmu Pengetahuan Alam dan Sosial untuk SD Kelas IV. Jakarta: Pusat Kurikulum dan Perbukuan Kemendikbudristek.\n2. Fitri, Amalia, dkk. 2021. Buku Siswa Ilmu Pengetahuan Alam dan Sosial untuk SD Kelas IV. Jakarta: Pusat Kurikulum dan Perbukuan Kemendikbudristek."
  },
  {
    id: "ipas-5-cahaya",
    kelas: "Kelas 5",
    mapelKode: "IPAS",
    judulBab: "Bab 1: Cahaya dan Sifatnya",
    judulModul: "Modul Ajar IPAS Kelas V - Cahaya dan Sifat-sifatnya (Sesuai Buku Paket Kurikulum Merdeka)",
    semester: "Ganjil",
    alokasiWaktu: "3 JP (3 x 35 Menit) - 1 Pertemuan",
    kompetensiAwal: "Peserta didik telah mengetahui kegunaan cahaya dalam kehidupan sehari-hari (misal cahaya lampu untuk menerangi kegelapan, cahaya matahari untuk menjemur pakaian).",
    profilLulusan: [
      "Penalaran Kritis",
      "Kreativitas",
      "Kolaborasi"
    ],
    saranaPrasarana: "Buku Siswa IPAS Kelas V Bab 1 (Penerbit Kemendikbudristek), senter, gelas kaca bening, air, pensil, cermin datar (2 buah), CD bekas, lembar kerja pengamatan (LKPD).",
    targetPeserta: "Siswa Reguler (Umum)",
    modelPembelajaran: "Tatap Muka / Problem-Based Learning (PBL) berbasis Eksperimen",
    tujuanPembelajaranText: "1. Peserta didik dapat membuktikan sifat-sifat cahaya (merambat lurus, menembus benda bening, dapat dipantulkan, dan dapat dibiaskan) melalui serangkaian eksperimen mandiri.\n2. Peserta didik dapat menganalisis penerapan sifat-sifat cahaya dalam kehidupan sehari-hari (contoh pada spion mobil, kolam renang terlihat dangkal, cermin).\n3. Peserta didik dapat membuat laporan ilmiah sederhana berdasarkan hasil eksperimen sifat cahaya.",
    pemahamanBermakna: "Memahami sifat cahaya membantu siswa memahami cara kerja alat-alat optik seperti kacamata, kamera, kaca spion kendaraan, mikroskop, periskop, hingga fenomena alam seperti pelangi.",
    pertanyaanPemantik: "1. Mengapa jika kita memasukkan pensil ke dalam segelas air bening, pensil tersebut terlihat patah?\n2. Bagaimana lampu senter motor/mobil bisa memancarkan cahaya lurus ke depan di malam yang gelap?\n3. Bagaimana kita bisa melihat wajah kita di cermin?",
    kegiatanPendahuluan: "Pertemuan 1 (3 JP - 105 Menit)\n1. Orientasi (10 Menit):\n- Guru menyapa siswa dengan ceria, memeriksa kesiapan belajar, presensi, dan memimpin doa bersama.\n2. Apersepsi (10 Menit):\n- Guru mematikan semua lampu kelas dan menutup gorden jendela hingga kelas gelap gulita.\n- Guru menyalakan sebuah lampu senter kecil ke arah dinding dan bertanya: 'Mengapa bapak bisa menerangi satu titik di dinding? Bagaimana bentuk jalannya cahaya senter ini?'\n3. Motivasi (5 Menit):\n- Guru menjelaskan bahwa hampir seluruh informasi visual di dunia ini diterima mata karena adanya cahaya, sehingga belajar sifat cahaya sangatlah penting.\n4. Pemberian Acuan (5 Menit):\n- Guru mengumumkan tujuan KBM hari ini yaitu membuktikan 4 sifat utama cahaya melalui pos eksperimen (Station Learning).",
    kegiatanInti: "Pertemuan 1 (3 JP - 105 Menit)\n1. Orientasi Siswa pada Masalah (15 Menit):\n- Guru memperlihatkan pensil utuh dan gelas berisi air bening. Guru memasukkan pensil ke gelas di depan kelas. Siswa terkejut melihat pensil terlihat bengkok/patah di perbatasan air dan udara.\n- Guru mengajukan masalah: 'Mengapa pensil ini terlihat patah? Sifat cahaya apa yang mendasari peristiwa ini?'\n2. Mengorganisasikan Siswa (10 Menit):\n- Siswa dibagi menjadi 4 kelompok. Setiap kelompok akan melakukan eksperimen bergiliran di 4 Pos Percobaan:\n  - Pos 1: Merambat lurus (menggunakan 3 karton berlubang sejajar dan senter).\n  - Pos 2: Menembus benda bening (senter diarahkan ke gelas bening dan plastik mika, dibandingkan ke buku tebal).\n  - Pos 3: Dapat dipantulkan (senter diarahkan ke cermin datar).\n  - Pos 4: Dapat dibiaskan (pensil dimasukkan ke gelas berisi air).\n3. Membimbing Penyelidikan (25 Menit):\n- Siswa berpindah dari pos ke pos sesuai waktu yang ditentukan (masing-masing pos selama 6 menit).\n- Siswa melakukan percobaan sesuai langkah-langkah di pos tersebut dan mencatat hasilnya di LKPD.\n- Guru mengawasi jalannya praktikum kelompok, mengarahkan posisi karton agar berlubang lurus, dan menjelaskan fenomena pembiasan secara ringkas.\n4. Menyajikan Hasil Karya (15 Menit):\n- Setiap kelompok mempresentasikan satu sifat cahaya yang didapat dari pos eksperimen tertentu.\n- Perwakilan kelompok mempraktikkan ulang di depan teman-teman kelas.\n5. Analisis & Evaluasi (10 Menit):\n- Guru memberikan evaluasi ilmiah. Guru menjelaskan hukum pemantulan cahaya dan menjelaskan indeks bias air yang menyebabkan cahaya dibelokkan (pembiasan).",
    kegiatanPenutup: "Pertemuan 1 (15 Menit)\n1. Simpulan (5 Menit):\n- Siswa bersama guru menyimpulkan 4 sifat cahaya yang telah dibuktikan.\n2. Refleksi (5 Menit):\n- Siswa menuliskan refleksi di selembar kertas memo kecil (Sticky Note) tentang apa yang mereka pelajari dan menempelkannya di papan refleksi kelas.\n3. Tindak Lanjut (5 Menit):\n- Guru memberikan PR dari Buku Paket IPAS Kelas V halaman 32.\n- Pembelajaran ditutup dengan doa bersama.",
    asesmenDiagnostik: "Tanya jawab lisan mengenai sumber-sumber cahaya di bumi (matahari, lampu, api, kunang-kunang).",
    asesmenFormatif: "Penilaian kinerja praktikum kelompok (keselamatan kerja, keaktifan berpartisipasi), penilaian ketepatan penulisan hasil laporan LKPD Pos Percobaan.",
    asesmenSumatif: "Tes esai mandiri sebanyak 5 soal mengenai analisis sifat cahaya pada alat periskop kapal selam, cermin tikungan jalan, dan kolam renang bening.",
    lkpd: "LEMBAR KERJA PESERTA DIDIK (LKPD) KELOMPOK\nMata Pelajaran: IPAS (Sains)\nMateri: Laporan Praktikum Sifat-sifat Cahaya\n\nNama Kelompok:\n1. .....................\n2. .....................\n3. .....................\n4. .....................\n\nLengkapi tabel hasil pengamatan pos percobaan di bawah ini:\nPos 1: Merambat Lurus\n- Langkah: Sejajarkan 3 lubang karton, sorot senter dari ujung lubang. Geser karton tengah.\n- Hasil: Cahaya senter (terlihat/tidak terlihat) saat karton digeser. Kesimpulan: ....................\n\nPos 2: Menembus Benda Bening\n- Langkah: Sorot senter ke gelas bening, mika plastik, lalu ke buku tebal.\n- Hasil: Cahaya (dapat/tidak dapat) menembus gelas bening, dan (dapat/tidak dapat) menembus buku tebal. Kesimpulan: ....................\n\nPos 3: Dapat Dipantulkan\n- Langkah: Sorot senter ke arah cermin datar di ruangan agak gelap.\n- Hasil: Arah cahaya (berbalik/menyebar) setelah mengenai cermin. Kesimpulan: ....................\n\nPos 4: Dapat Dibiaskan\n- Langkah: Masukkan pensil ke gelas berisi air bening. Lihat dari samping gelas.\n- Hasil: Pensil terlihat (lurus/bengkok-patah). Kesimpulan: ....................",
    glosarium: "1. Pembiasan (Refraksi): Peristiwa pembelokan arah rambat cahaya karena melewati dua medium yang kerapatan optiknya berbeda (misal udara dan air).\n2. Pemantulan (Refleksi): Peristiwa terpantulnya kembali cahaya ketika mengenai permukaan benda yang mengkilap (seperti cermin).\n3. Medium: Zat perantara yang dilalui oleh gelombang cahaya (contoh: udara, air, kaca).",
    daftarPustaka: "1. Ghaniem, Amalia Fitri, dkk. 2021. Buku Panduan Guru Ilmu Pengetahuan Alam dan Sosial untuk SD Kelas V. Jakarta: Pusat Kurikulum dan Perbukuan Kemendikbudristek.\n2. Ghaniem, Amalia Fitri, dkk. 2021. Buku Siswa Ilmu Pengetahuan Alam dan Sosial untuk SD Kelas V. Jakarta: Pusat Kurikulum dan Perbukuan Kemendikbudristek."
  }
];
