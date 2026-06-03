import { prisma } from '@/lib/db';
import { notFound } from 'next/navigation';

interface PageProps {
  searchParams: Promise<{ kelasId?: string; bulan?: string }>;
}

export default async function RekapAbsensiPrintPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const { kelasId, bulan } = params;

  if (!kelasId || !bulan) {
    return notFound();
  }

  // Parse bulan (YYYY-MM)
  const [yearStr, monthStr] = bulan.split('-');
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10) - 1; // 0-indexed in JS Date

  const startDate = new Date(year, month, 1);
  const endDate = new Date(year, month + 1, 0, 23, 59, 59);

  const kelas = await prisma.kelas.findUnique({
    where: { id: kelasId },
    include: { tahunAjaran: true },
  });

  if (!kelas) {
    return notFound();
  }

  const siswaList = await prisma.siswa.findMany({
    where: { kelasId },
    orderBy: { nama: 'asc' },
  });

  // Fetch School Profile
  const profil = await prisma.profilSekolah.findFirst();

  // Ambil semua absensi siswa kelas ini pada bulan tersebut
  const absensiRecords = await prisma.absensi.findMany({
    where: {
      siswa: { kelasId },
      tanggal: {
        gte: startDate,
        lte: endDate,
      },
    },
  });

  // Hitung jumlah hari efektif belajar (jumlah hari di mana ada minimal satu siswa diabsen)
  const uniqueDates = Array.from(new Set(absensiRecords.map((r) => r.tanggal.toISOString().split('T')[0])));
  const totalHariEfektif = uniqueDates.length || 20; // default 20 hari jika belum ada data

  const rows = siswaList.map((siswa, index) => {
    const siswaAbsensi = absensiRecords.filter((r) => r.siswaId === siswa.id);
    const hadir = siswaAbsensi.filter((r) => r.status === 'HADIR').length;
    const izin = siswaAbsensi.filter((r) => r.status === 'IZIN').length;
    const sakit = siswaAbsensi.filter((r) => r.status === 'SAKIT').length;
    const alpa = siswaAbsensi.filter((r) => r.status === 'ALPA').length;
    const total = siswaAbsensi.length;
    
    // Asumsikan total hari kerja adalah totalHariEfektif
    const persentase = totalHariEfektif > 0 
      ? Math.round((hadir / totalHariEfektif) * 100) 
      : 0;

    return {
      no: index + 1,
      nisn: siswa.nisn,
      nama: siswa.nama,
      hadir,
      izin,
      sakit,
      alpa,
      total,
      persentase,
    };
  });

  const namaBulan = startDate.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
  const tanggalLaporan = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <div className="min-h-screen bg-white text-black p-8 md:p-12 max-w-4xl mx-auto font-sans relative">
      {/* Tombol Cetak Manual */}
      <div 
        className="absolute top-4 right-4 print:hidden flex gap-2"
        dangerouslySetInnerHTML={{ __html: `
          <button onclick="window.print()" class="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-md cursor-pointer transition-colors animate-pulse">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="inline mr-1"><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><path d="M6 9V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v5"/><rect x="6" y="14" width="12" height="8" rx="1"/></svg> Cetak Laporan
          </button>
        `}}
      />

      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          body {
            background: white !important;
            color: black !important;
            padding: 0 !important;
            margin: 0 !important;
          }
          .print\\:hidden {
            display: none !important;
          }
        }
        @page {
          size: A4 portrait;
          margin: 1.5cm;
        }
      `}} />

      {/* Kop Laporan */}
      <div className="border-b-2 border-black pb-4 text-center relative flex items-center justify-center min-h-[80px]">
        {profil?.logoUrl && (
          <img 
            src={profil.logoUrl} 
            alt="Logo" 
            className="w-12 h-12 absolute left-0 object-contain print:block"
          />
        )}
        <div className="flex-1 text-center">
          <h2 className="text-sm font-bold uppercase tracking-wider leading-none">
            {profil?.pemerintah || 'Pemerintah Kabupaten Pati'}
          </h2>
          <h1 className="text-base font-black uppercase tracking-wide leading-tight mt-1">
            {profil?.namaSekolah || 'SD Negeri Wedusan'}
          </h1>
          <p className="text-xs font-semibold text-slate-500 mt-1">
            Laporan Rekapitulasi Absensi Bulanan • Kelas: {kelas.nama} • Periode: {namaBulan} • TA: {kelas.tahunAjaran.tahun}
          </p>
        </div>
      </div>

      <div className="mt-4 flex justify-between text-xs text-slate-650">
        <p>Total Hari Efektif KBM: <strong>{totalHariEfektif} Hari</strong></p>
        <p>Dicetak: {tanggalLaporan}</p>
      </div>

      {/* Tabel Data Rekap */}
      <table className="w-full mt-4 border-collapse text-xs border border-black text-left">
        <thead>
          <tr className="bg-slate-100 border-b border-black">
            <th className="p-2 border-r border-black font-bold text-center">No</th>
            <th className="p-2 border-r border-black font-bold">NISN</th>
            <th className="p-2 border-r border-black font-bold">Nama Siswa</th>
            <th className="p-2 border-r border-black font-bold text-center bg-emerald-50">H</th>
            <th className="p-2 border-r border-black font-bold text-center bg-sky-50">I</th>
            <th className="p-2 border-r border-black font-bold text-center bg-amber-50">S</th>
            <th className="p-2 border-r border-black font-bold text-center bg-rose-50">A</th>
            <th className="p-2 border-r border-black font-bold text-center">Total</th>
            <th className="p-2 font-bold text-right">Kehadiran (%)</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-black/40">
          {rows.map((row) => (
            <tr key={row.nisn} className="border-b border-black/40">
              <td className="p-2 border-r border-black text-center">{row.no}</td>
              <td className="p-2 border-r border-black font-mono">{row.nisn}</td>
              <td className="p-2 border-r border-black font-semibold">{row.nama}</td>
              <td className="p-2 border-r border-black text-center bg-emerald-50/20">{row.hadir}</td>
              <td className="p-2 border-r border-black text-center bg-sky-50/20">{row.izin}</td>
              <td className="p-2 border-r border-black text-center bg-amber-50/20">{row.sakit}</td>
              <td className="p-2 border-r border-black text-center bg-rose-50/20 font-bold text-rose-600">{row.alpa}</td>
              <td className="p-2 border-r border-black text-center">{row.total}</td>
              <td className="p-2 text-right font-bold">{row.persentase}%</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Legenda Singkatan */}
      <div className="mt-4 text-[10px] text-slate-500 space-x-4">
        <span>* Keterangan:</span>
        <span><strong>H</strong>: Hadir</span>
        <span><strong>I</strong>: Izin</span>
        <span><strong>S</strong>: Sakit</span>
        <span><strong>A</strong>: Alpa (Tanpa Keterangan)</span>
      </div>

      {/* Kolom Tanda Tangan */}
      <div className="mt-12 grid grid-cols-2 text-center text-xs gap-8">
        <div>
          <p>Mengetahui,</p>
          <p>Kepala Sekolah</p>
          <div className="h-16" />
          <p className="font-bold underline">{profil?.namaKepsek || 'Sudarto, S.Pd'}</p>
          {profil?.nipKepsek && (
            <p className="text-[10px] text-slate-500">NIP. {profil.nipKepsek}</p>
          )}
        </div>
        <div>
          <p>{profil?.namaSekolah.split(' ')[2] || 'Wedusan'}, {tanggalLaporan}</p>
          <p>Guru BK / Wali Kelas</p>
          <div className="h-16" />
          <p className="font-bold underline">Budi Santoso, S.Pd.</p>
          <p className="text-[10px] text-slate-500">NIP. 198503152010011002</p>
        </div>
      </div>

      {/* Script Auto Print */}
      <script dangerouslySetInnerHTML={{ __html: `
        setTimeout(() => {
          window.print();
        }, 500);
      `}} />
    </div>
  );
}
