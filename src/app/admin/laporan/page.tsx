'use client';

import { useState, useEffect } from 'react';
import { FileSpreadsheet, Download, RefreshCw, BarChart3, Users, Percent, CheckCircle } from 'lucide-react';

interface Kelas {
  id: string;
  nama: string;
  tahunAjaran: { tahun: string };
}

interface LaporanAbsensiRow {
  siswaId: string;
  nisn: string;
  nama: string;
  hadir: number;
  izin: number;
  sakit: number;
  alpa: number;
  total: number;
  persentase: number;
}

export default function LaporanAbsensiPage() {
  const [kelasList, setKelasList] = useState<Kelas[]>([]);
  const [selectedKelasId, setSelectedKelasId] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingConfig, setLoadingConfig] = useState(true);
  const [error, setError] = useState('');
  
  const [laporanRows, setLaporanRows] = useState<LaporanAbsensiRow[]>([]);
  const [statistik, setStatistik] = useState({
    totalSiswa: 0,
    rataRataKehadiran: 0,
    totalHadir: 0,
    totalHariEfektif: 0,
  });

  useEffect(() => {
    fetchKelas();
  }, []);

  useEffect(() => {
    if (selectedKelasId) {
      fetchLaporanData(selectedKelasId);
    } else {
      setLaporanRows([]);
    }
  }, [selectedKelasId]);

  const fetchKelas = async () => {
    setLoadingConfig(true);
    try {
      const res = await fetch('/api/admin/kelas');
      if (!res.ok) throw new Error('Gagal mengambil data kelas');
      const data = await res.json();
      setKelasList(data);
      if (data.length > 0) {
        setSelectedKelasId(data[0].id);
      }
    } catch (err: any) {
      setError(err.message || 'Gagal memuat daftar kelas');
    } finally {
      setLoadingConfig(false);
    }
  };

  const fetchLaporanData = async (kelasId: string) => {
    setLoading(true);
    setError('');
    try {
      // Ambil data absensi via API internal (kita juga bisa memprosesnya langsung dari response db atau memanggil endpoint /api/admin/siswa/ ke API yang efisien).
      // Agar tidak memerlukan penambahan API route terpisah yang terlalu banyak, kita memanggil rekap data kehadiran secara dinamis:
      // Kita panggil daftar siswa di kelas, dan daftar absensi siswa di kelas tersebut.
      // Kita manfaatkan pemanggilan route API yang efisien dengan menghitung di client-side untuk tabel dashboard visualnya!
      
      const [resSiswa, resAbsensi] = await Promise.all([
        fetch(`/api/admin/siswa?kelasId=${kelasId}`),
        // Kita modifikasi request absensi dengan mengambil absensi kelas tersebut.
        // Endpoint /api/guru/absensi mendukung absensi, mari kita gunakan endpoint yang aman atau fetch data siswa & hitung absensinya.
        // Oh, wait! Di `/api/admin/siswa` kita mendapatkan data siswa dengan filter kelasId.
        // Mari kita ambil datanya, dan kita hitung.
        // Lebih baik jika kita memproses visualisasi ini dari data absensi.
        // Kita juga bisa membuat endpoint helper atau langsung hitung.
        // Mari kita fetch siswa, lalu untuk setiap siswa kita fetch riwayat absensinya, atau panggil API.
        // API absensi guru `/api/guru/absensi` mengambil daftar siswa kelasId.
        // Mari kita panggil API siswa kelas, lalu ambil datanya.
        // Untuk meminimalkan load server, mari kita hitung rekap di backend, atau panggil endpoint data absensi yang lengkap.
        // Tunggu! Kita punya endpoint ekspor `/api/admin/laporan/absensi?kelasId=xxx` yang mengembalikan CSV.
        // Kita bisa membuat API sederhana atau memanfaatkan fetch absensi yang ada.
        // Apakah kita memiliki endpoint untuk mengambil data absensi per kelas?
        // Let's check: `/api/guru/absensi` dengan query param `kelasId` dan `tanggal` mengembalikan daftar absensi hari itu.
        // Untuk rekap total, mari kita buat sebuah client-side fetch helper atau sebuah data fetcher.
        // Mari kita check apakah kita bisa mengambil dari database.
        // Kita bisa membuat sub-route atau memprosesnya secara elegan dengan fetch data terintegrasi.
        // Mari kita buat route API GET `/api/admin/laporan/rekap` yang mengembalikan JSON data rekap, agar visualisasi tabel dan statistik di halaman ini sinkron dengan data CSV!
        // Ini ide yang brilian dan sangat rapi!
        // Mari kita panggil `/api/admin/laporan/rekap?kelasId=xxx` (kita akan membuat API ini setelah ini atau di file yang sama).
        // Let's implement fetchLaporanData dengan memanggil `/api/admin/laporan/rekap?kelasId=xxx`!
      ]);

      const resRekap = await fetch(`/api/admin/laporan/rekap?kelasId=${kelasId}`);
      if (!resRekap.ok) throw new Error('Gagal memuat rekap absensi');
      const data = await resRekap.json();
      
      setLaporanRows(data.rows);
      setStatistik({
        totalSiswa: data.statistik.totalSiswa,
        rataRataKehadiran: data.statistik.rataRataKehadiran,
        totalHadir: data.statistik.totalHadir,
        totalHariEfektif: data.statistik.totalHariEfektif,
      });
    } catch (err: any) {
      setError(err.message || 'Gagal memuat data rekap absensi');
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = () => {
    if (!selectedKelasId) return;
    window.open(`/api/admin/laporan/absensi?kelasId=${selectedKelasId}`, '_blank');
  };

  if (loadingConfig) {
    return (
      <div className="flex justify-center items-center py-20">
        <RefreshCw className="animate-spin text-indigo-400" size={32} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Halaman */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-2">
            <FileSpreadsheet className="text-indigo-400" />
            Laporan Absensi Siswa
          </h1>
          <p className="text-slate-400 mt-1">Pantau rekapitulasi kehadiran dan unduh laporan kelas.</p>
        </div>
        {selectedKelasId && laporanRows.length > 0 && (
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold text-sm shadow-lg shadow-emerald-500/20 transition-all duration-200"
          >
            <Download size={16} />
            Ekspor Laporan (CSV)
          </button>
        )}
      </div>

      {/* Alert Error */}
      {error && (
        <div className="p-4 bg-rose-950/60 border border-rose-800 text-rose-300 rounded-2xl text-sm font-medium">
          {error}
        </div>
      )}

      {/* Filter & Pemilihan Kelas */}
      <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="w-full sm:w-auto flex items-center gap-3">
          <label className="text-sm font-semibold text-slate-300 whitespace-nowrap">Pilih Kelas:</label>
          <select
            value={selectedKelasId}
            onChange={(e) => setSelectedKelasId(e.target.value)}
            className="w-full sm:w-64 px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-hidden focus:border-indigo-500 transition-colors"
          >
            {kelasList.map((k) => (
              <option key={k.id} value={k.id}>
                {k.nama}
              </option>
            ))}
          </select>
        </div>
        {selectedKelasId && (
          <button
            onClick={() => fetchLaporanData(selectedKelasId)}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-sm font-medium transition-colors w-full sm:w-auto"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            Segarkan Rekap
          </button>
        )}
      </div>

      {/* Grid Statistik Ringkas */}
      {selectedKelasId && laporanRows.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-900/30 border border-slate-800/60 rounded-2xl p-5 flex items-center gap-4 hover:border-slate-800 transition-colors">
            <div className="p-3.5 rounded-xl bg-indigo-500/10 text-indigo-400">
              <Users size={24} />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Siswa</p>
              <h3 className="text-2xl font-black text-white mt-1">{statistik.totalSiswa} Siswa</h3>
            </div>
          </div>

          <div className="bg-slate-900/30 border border-slate-800/60 rounded-2xl p-5 flex items-center gap-4 hover:border-slate-800 transition-colors">
            <div className="p-3.5 rounded-xl bg-emerald-500/10 text-emerald-400">
              <Percent size={24} />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Rata-rata Kehadiran</p>
              <h3 className="text-2xl font-black text-emerald-400 mt-1">{statistik.rataRataKehadiran}%</h3>
            </div>
          </div>

          <div className="bg-slate-900/30 border border-slate-800/60 rounded-2xl p-5 flex items-center gap-4 hover:border-slate-800 transition-colors">
            <div className="p-3.5 rounded-xl bg-violet-500/10 text-violet-400">
              <CheckCircle size={24} />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Hari Efektif</p>
              <h3 className="text-2xl font-black text-white mt-1">{statistik.totalHariEfektif} Hari Absensi</h3>
            </div>
          </div>
        </div>
      )}

      {/* Tabel Laporan Kehadiran */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <RefreshCw className="animate-spin text-indigo-400" size={32} />
        </div>
      ) : !selectedKelasId ? (
        <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-12 text-center">
          <FileSpreadsheet className="mx-auto text-slate-600 mb-3" size={40} />
          <p className="text-slate-400 text-sm font-medium">Silakan tambahkan data kelas dan siswa terlebih dahulu.</p>
        </div>
      ) : laporanRows.length === 0 ? (
        <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-12 text-center">
          <BarChart3 className="mx-auto text-slate-600 mb-3" size={40} />
          <p className="text-slate-400 text-sm font-medium">Belum ada riwayat absensi untuk kelas ini.</p>
        </div>
      ) : (
        <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/40">
                  <th className="p-4 text-xs font-semibold uppercase tracking-wider text-slate-400">No</th>
                  <th className="p-4 text-xs font-semibold uppercase tracking-wider text-slate-400">NISN</th>
                  <th className="p-4 text-xs font-semibold uppercase tracking-wider text-slate-400">Nama Siswa</th>
                  <th className="p-4 text-xs font-semibold uppercase tracking-wider text-slate-400 text-center bg-emerald-950/10 text-emerald-400">Hadir</th>
                  <th className="p-4 text-xs font-semibold uppercase tracking-wider text-slate-400 text-center bg-sky-950/10 text-sky-400">Izin</th>
                  <th className="p-4 text-xs font-semibold uppercase tracking-wider text-slate-400 text-center bg-amber-950/10 text-amber-450">Sakit</th>
                  <th className="p-4 text-xs font-semibold uppercase tracking-wider text-slate-400 text-center bg-rose-950/10 text-rose-450">Alpa</th>
                  <th className="p-4 text-xs font-semibold uppercase tracking-wider text-slate-400 text-center">Total Hari</th>
                  <th className="p-4 text-xs font-semibold uppercase tracking-wider text-slate-400 text-right">Persentase</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-850">
                {laporanRows.map((row, index) => (
                  <tr key={row.siswaId} className="hover:bg-slate-900/30 transition-colors">
                    <td className="p-4 text-sm text-slate-500 font-medium">{index + 1}</td>
                    <td className="p-4 text-sm font-semibold text-slate-400">{row.nisn}</td>
                    <td className="p-4 text-sm font-bold text-slate-200">{row.nama}</td>
                    <td className="p-4 text-sm font-bold text-center text-emerald-400 bg-emerald-950/5">{row.hadir}</td>
                    <td className="p-4 text-sm font-bold text-center text-sky-400 bg-sky-950/5">{row.izin}</td>
                    <td className="p-4 text-sm font-bold text-center text-amber-400 bg-amber-950/5">{row.sakit}</td>
                    <td className="p-4 text-sm font-bold text-center text-rose-400 bg-rose-950/5">{row.alpa}</td>
                    <td className="p-4 text-sm font-medium text-center text-slate-300">{row.total}</td>
                    <td className="p-4 text-sm font-extrabold text-right text-indigo-400">
                      {row.persentase}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
