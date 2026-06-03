'use client';

import { useState, useEffect } from 'react';
import { FolderOpen, Search, X, Loader2, Calendar, FileText, Link as LinkIcon, Download } from 'lucide-react';

interface ArsipSurat {
  id: string;
  nomorSurat: string;
  tanggalSurat: string;
  tanggalDiterima: string | null;
  pengirim: string;
  penerima: string;
  perihal: string;
  jenis: 'MASUK' | 'KELUAR';
  tautanBerkas: string | null;
  keterangan: string | null;
}

export default function KepsekSuratMonitoringPage() {
  const [suratList, setSuratList] = useState<ArsipSurat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedJenisTab, setSelectedJenisTab] = useState<'SEMUA' | 'MASUK' | 'KELUAR'>('SEMUA');

  useEffect(() => {
    fetchSurat();
  }, [selectedJenisTab, searchTerm]);

  const fetchSurat = async () => {
    setLoading(true);
    setError('');
    try {
      let url = '/api/admin/surat?';
      if (selectedJenisTab !== 'SEMUA') {
        url += `jenis=${selectedJenisTab}&`;
      }
      if (searchTerm) {
        url += `search=${encodeURIComponent(searchTerm)}&`;
      }
      const res = await fetch(url);
      if (!res.ok) throw new Error('Gagal memuat arsip surat');
      const data = await res.json();
      setSuratList(data);
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan saat memuat data');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Halaman */}
      <div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
          <FolderOpen className="text-violet-400" />
          Monitoring Arsip Surat Digital
        </h1>
        <p className="text-slate-400 mt-1 text-sm">
          Supervisi arsip surat masuk dan surat keluar sekolah secara terstruktur.
        </p>
      </div>

      {error && (
        <div className="bg-red-950/40 border border-red-800/60 text-red-200 px-4 py-3 rounded-2xl text-sm">
          ⚠️ {error}
        </div>
      )}

      {/* Filter Tabs & Search Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
        
        {/* Tab Filters */}
        <div className="flex bg-slate-950/80 p-1 rounded-2xl border border-slate-850 w-full md:w-auto">
          <button
            onClick={() => setSelectedJenisTab('SEMUA')}
            className={`flex-1 md:flex-initial px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              selectedJenisTab === 'SEMUA'
                ? 'bg-slate-800 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Semua Surat
          </button>
          <button
            onClick={() => setSelectedJenisTab('MASUK')}
            className={`flex-1 md:flex-initial px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              selectedJenisTab === 'MASUK'
                ? 'bg-emerald-950/60 border border-emerald-800/40 text-emerald-400 shadow-md'
                : 'text-slate-400 hover:text-slate-250'
            }`}
          >
            Surat Masuk
          </button>
          <button
            onClick={() => setSelectedJenisTab('KELUAR')}
            className={`flex-1 md:flex-initial px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              selectedJenisTab === 'KELUAR'
                ? 'bg-violet-950/60 border border-violet-800/40 text-violet-400 shadow-md'
                : 'text-slate-400 hover:text-slate-250'
            }`}
          >
            Surat Keluar
          </button>
        </div>

        {/* Search */}
        <div className="flex bg-slate-950/40 border border-slate-855 rounded-2xl px-4 py-2.5 items-center gap-3 w-full md:w-80">
          <Search className="text-slate-500 shrink-0" size={16} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari nomor, perihal, pengirim..."
            className="bg-transparent border-0 text-white placeholder-slate-500 text-xs focus:outline-hidden w-full"
          />
          {searchTerm && (
            <button onClick={() => setSearchTerm('')} className="text-slate-500 hover:text-slate-350">
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Letters List */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
        {loading ? (
          <div className="flex items-center justify-center p-12 text-slate-400 gap-3">
            <Loader2 className="animate-spin" size={24} />
            Memuat arsip surat...
          </div>
        ) : suratList.length === 0 ? (
          <div className="text-center p-12 text-slate-500 text-sm">
            Tidak ada dokumen surat ditemukan.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800/80 bg-slate-950/20 text-slate-400 text-xs font-semibold uppercase tracking-wider">
                  <th className="px-6 py-4">Jenis & No. Surat</th>
                  <th className="px-6 py-4">Perihal</th>
                  <th className="px-6 py-4">Asal / Penerima</th>
                  <th className="px-6 py-4">Tanggal Dokumen</th>
                  <th className="px-6 py-4">Berkas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50 text-slate-300 text-sm">
                {suratList.map((surat) => (
                  <tr key={surat.id} className="hover:bg-slate-800/10 transition-colors">
                    <td className="px-6 py-4 space-y-1">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                        surat.jenis === 'MASUK'
                          ? 'bg-emerald-950/50 border border-emerald-800/60 text-emerald-400'
                          : 'bg-violet-950/50 border border-violet-800/60 text-violet-405'
                      }`}>
                        {surat.jenis === 'MASUK' ? 'Masuk' : 'Keluar'}
                      </span>
                      <h4 className="font-mono text-xs font-bold text-slate-200">{surat.nomorSurat}</h4>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-bold text-slate-100">{surat.perihal}</p>
                      {surat.keterangan && (
                        <p className="text-[10px] text-slate-500 truncate max-w-xs">{surat.keterangan}</p>
                      )}
                    </td>
                    <td className="px-6 py-4 space-y-0.5 text-xs">
                      <p><span className="text-slate-500">Pengirim:</span> <strong className="text-slate-300">{surat.pengirim}</strong></p>
                      <p><span className="text-slate-500">Penerima:</span> <strong className="text-slate-300">{surat.penerima}</strong></p>
                    </td>
                    <td className="px-6 py-4 text-xs font-medium space-y-0.5">
                      <p className="text-slate-300">
                        {new Date(surat.tanggalSurat).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                      {surat.jenis === 'MASUK' && surat.tanggalDiterima && (
                        <p className="text-[9px] text-slate-500 font-bold uppercase">
                          Diterima: {new Date(surat.tanggalDiterima).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                        </p>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {surat.tautanBerkas ? (
                        <a
                          href={surat.tautanBerkas}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-955 border border-slate-800 text-violet-400 hover:text-violet-300 rounded-lg text-xs font-semibold select-none cursor-pointer"
                        >
                          <LinkIcon size={12} />
                          Lihat Berkas
                        </a>
                      ) : (
                        <span className="text-xs text-slate-600 italic">No File</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
