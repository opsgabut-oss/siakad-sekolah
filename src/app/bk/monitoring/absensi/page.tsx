'use client';

import { useState, useEffect } from 'react';
import { FileSpreadsheet, Download, RefreshCw, BarChart3, Users, Percent, CheckCircle, Printer } from 'lucide-react';

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

export default function BKMonitoringAbsensiPage() {
  const [kelasList, setKelasList] = useState<Kelas[]>([]);
  const [selectedKelasId, setSelectedKelasId] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingConfig, setLoadingConfig] = useState(true);
  const [error, setError] = useState('');
  const [profil, setProfil] = useState<any>(null);
  
  const [laporanRows, setLaporanRows] = useState<LaporanAbsensiRow[]>([]);
  const [statistik, setStatistik] = useState({
    totalSiswa: 0,
    rataRataKehadiran: 0,
    totalHadir: 0,
    totalHariEfektif: 0,
  });

  useEffect(() => {
    fetchKelas();
    fetchSchoolProfile();
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

  const fetchSchoolProfile = async () => {
    try {
      const res = await fetch('/api/admin/profil-sekolah');
      if (res.ok) {
        const data = await res.json();
        setProfil(data);
      }
    } catch (err) {
      console.error('Error fetching school profile:', err);
    }
  };

  const fetchLaporanData = async (kelasId: string) => {
    setLoading(true);
    setError('');
    try {
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

  const handlePrint = () => {
    window.print();
  };

  const getSelectedKelasNama = () => {
    return kelasList.find(k => k.id === selectedKelasId)?.nama || '';
  };

  const getSelectedKelasTahun = () => {
    return kelasList.find(k => k.id === selectedKelasId)?.tahunAjaran.tahun || '';
  };

  if (loadingConfig) {
    return (
      <div className="flex justify-center items-center py-20">
        <RefreshCw className="animate-spin text-violet-400" size={32} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* CSS untuk Media Print */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          body {
            background-color: white !important;
            color: black !important;
          }
          .no-print {
            display: none !important;
          }
          .print-header {
            display: block !important;
            color: black !important;
          }
          .print-table {
            border: 1px solid black !important;
            color: black !important;
          }
          .print-table th, .print-table td {
            border: 1px solid black !important;
            color: black !important;
            padding: 8px !important;
          }
          aside, nav, main {
            background-color: white !important;
            color: black !important;
          }
        }
      `}} />

      {/* Header Halaman */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 no-print">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-2">
            <FileSpreadsheet className="text-violet-400" />
            Monitoring Kehadiran Siswa
          </h1>
          <p className="text-slate-400 mt-1">Pantau rekapitulasi kehadiran dan cetak laporan absensi kelas.</p>
        </div>
        <div className="flex gap-2">
          {selectedKelasId && laporanRows.length > 0 && (
            <>
              <button
                onClick={handlePrint}
                className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl font-semibold text-xs shadow-lg transition-all duration-200 cursor-pointer select-none"
              >
                <Printer size={14} />
                Cetak Laporan
              </button>
              <button
                onClick={handleExportCSV}
                className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold text-xs shadow-lg shadow-emerald-500/20 transition-all duration-200 cursor-pointer select-none"
              >
                <Download size={14} />
                Ekspor CSV
              </button>
            </>
          )}
        </div>
      </div>

      {/* Kop Surat Header saat Cetak */}
      <div className="hidden print-header text-center space-y-2 mb-6 text-black relative flex items-center justify-center min-h-[80px] border-b-2 border-black pb-4">
        {profil?.logoUrl && (
          <img 
            src={profil.logoUrl} 
            alt="Logo" 
            className="w-12 h-12 absolute left-0 object-contain print:block"
          />
        )}
        <div className="flex-1 text-center">
          <h2 className="text-sm font-bold uppercase tracking-wider leading-none">{profil?.pemerintah || 'Pemerintah Kabupaten Pati'}</h2>
          <h3 className="text-base font-black uppercase tracking-wide leading-tight mt-1">{profil?.namaSekolah || 'SD Negeri Wedusan'}</h3>
          <p className="text-xs mt-1">Laporan Rekapitulasi Absensi Siswa • Kelas: {getSelectedKelasNama()} • TA: {getSelectedKelasTahun()}</p>
          <p className="text-[10px] text-slate-500 font-bold uppercase">Dicetak pada tanggal: {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
        </div>
      </div>

      {/* Alert Error */}
      {error && (
        <div className="p-4 bg-rose-950/60 border border-rose-800 text-rose-300 rounded-2xl text-sm font-medium no-print">
          {error}
        </div>
      )}

      {/* Filter & Pemilihan Kelas */}
      <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4 no-print">
        <div className="w-full sm:w-auto flex items-center gap-3">
          <label className="text-sm font-semibold text-slate-305 whitespace-nowrap">Pilih Kelas:</label>
          <select
            value={selectedKelasId}
            onChange={(e) => setSelectedKelasId(e.target.value)}
            className="w-full sm:w-64 px-4 py-2.5 bg-slate-955 border border-slate-800 rounded-xl text-white text-sm focus:outline-hidden focus:border-violet-500 transition-colors"
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
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-medium transition-colors w-full sm:w-auto cursor-pointer"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            Segarkan Rekap
          </button>
        )}
      </div>

      {/* Grid Statistik Ringkas */}
      {selectedKelasId && laporanRows.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 print-header">
          <div className="bg-slate-900/30 border border-slate-800/60 rounded-2xl p-5 flex items-center gap-4 hover:border-slate-800 transition-colors text-white print:text-black print:border-black">
            <div className="p-3.5 rounded-xl bg-violet-500/10 text-violet-400 no-print">
              <Users size={24} />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider print:text-slate-700">Total Siswa</p>
              <h3 className="text-2xl font-black mt-1">{statistik.totalSiswa} Siswa</h3>
            </div>
          </div>

          <div className="bg-slate-900/30 border border-slate-800/60 rounded-2xl p-5 flex items-center gap-4 hover:border-slate-800 transition-colors text-white print:text-black print:border-black">
            <div className="p-3.5 rounded-xl bg-emerald-500/10 text-emerald-400 no-print">
              <Percent size={24} />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider print:text-slate-700">Rata-rata Kehadiran</p>
              <h3 className="text-2xl font-black mt-1 text-emerald-455 print:text-black">{statistik.rataRataKehadiran}%</h3>
            </div>
          </div>

          <div className="bg-slate-900/30 border border-slate-800/60 rounded-2xl p-5 flex items-center gap-4 hover:border-slate-800 transition-colors text-white print:text-black print:border-black">
            <div className="p-3.5 rounded-xl bg-indigo-500/10 text-indigo-400 no-print">
              <CheckCircle size={24} />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider print:text-slate-700">Total Hari Efektif</p>
              <h3 className="text-2xl font-black mt-1">{statistik.totalHariEfektif} Hari Absensi</h3>
            </div>
          </div>
        </div>
      )}

      {/* Tabel Laporan Kehadiran */}
      {loading ? (
        <div className="flex justify-center items-center py-20 no-print">
          <RefreshCw className="animate-spin text-violet-400" size={32} />
        </div>
      ) : !selectedKelasId ? (
        <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-12 text-center no-print">
          <FileSpreadsheet className="mx-auto text-slate-600 mb-3" size={40} />
          <p className="text-slate-400 text-sm font-medium">Silakan hubungi administrator untuk data kelas.</p>
        </div>
      ) : laporanRows.length === 0 ? (
        <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-12 text-center no-print">
          <BarChart3 className="mx-auto text-slate-600 mb-3" size={40} />
          <p className="text-slate-400 text-sm font-medium">Belum ada riwayat absensi untuk kelas ini.</p>
        </div>
      ) : (
        <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl overflow-hidden print-table text-white print:text-black">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/40 print:bg-slate-100 text-slate-400 print:text-black">
                  <th className="p-4 text-xs font-semibold uppercase tracking-wider">No</th>
                  <th className="p-4 text-xs font-semibold uppercase tracking-wider">NISN</th>
                  <th className="p-4 text-xs font-semibold uppercase tracking-wider">Nama Siswa</th>
                  <th className="p-4 text-xs font-semibold uppercase tracking-wider text-center bg-emerald-950/10 text-emerald-400 print:bg-transparent print:text-black">Hadir</th>
                  <th className="p-4 text-xs font-semibold uppercase tracking-wider text-center bg-sky-950/10 text-sky-400 print:bg-transparent print:text-black">Izin</th>
                  <th className="p-4 text-xs font-semibold uppercase tracking-wider text-center bg-amber-950/10 text-amber-450 print:bg-transparent print:text-black">Sakit</th>
                  <th className="p-4 text-xs font-semibold uppercase tracking-wider text-center bg-rose-950/10 text-rose-450 print:bg-transparent print:text-black">Alpa</th>
                  <th className="p-4 text-xs font-semibold uppercase tracking-wider text-center">Total Hari</th>
                  <th className="p-4 text-xs font-semibold uppercase tracking-wider text-right">Persentase</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-850 print:divide-slate-300">
                {laporanRows.map((row, index) => (
                  <tr key={row.siswaId} className="hover:bg-slate-900/30 transition-colors print:hover:bg-transparent">
                    <td className="p-4 text-sm text-slate-500 print:text-black font-medium">{index + 1}</td>
                    <td className="p-4 text-sm font-semibold text-slate-400 print:text-black">{row.nisn}</td>
                    <td className="p-4 text-sm font-bold text-slate-200 print:text-black">{row.nama}</td>
                    <td className="p-4 text-sm font-bold text-center text-emerald-400 bg-emerald-950/5 print:bg-transparent print:text-black">{row.hadir}</td>
                    <td className="p-4 text-sm font-bold text-center text-sky-400 bg-sky-950/5 print:bg-transparent print:text-black">{row.izin}</td>
                    <td className="p-4 text-sm font-bold text-center text-amber-400 bg-amber-950/5 print:bg-transparent print:text-black">{row.sakit}</td>
                    <td className="p-4 text-sm font-bold text-center text-rose-400 bg-rose-950/5 print:bg-transparent print:text-black">{row.alpa}</td>
                    <td className="p-4 text-sm font-medium text-center text-slate-350 print:text-black">{row.total}</td>
                    <td className="p-4 text-sm font-extrabold text-right text-violet-400 print:text-black">
                      {row.persentase}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Lembar Tanda Tangan saat Cetak */}
      <div className="hidden print:block mt-12 text-black">
        <div className="flex justify-between">
          <div className="text-center w-48 space-y-16">
            <p>Guru Wali Kelas,</p>
            <p className="font-bold underline">( ______________________ )</p>
          </div>
          <div className="text-center w-48 space-y-16">
            <p>Mengetahui,<br />Kepala Sekolah</p>
            <p className="font-bold underline">{profil?.namaKepsek || '( ______________________ )'}</p>
            {profil?.nipKepsek && (
              <p className="text-[10px] text-slate-500 -mt-1">NIP. {profil.nipKepsek}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
