'use client';

import { useState, useEffect } from 'react';
import { FolderOpen, Plus, Edit2, Trash2, Search, X, Loader2, Calendar, FileText, Link as LinkIcon, Download, AlertCircle } from 'lucide-react';

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

export default function AdminSuratPage() {
  const [suratList, setSuratList] = useState<ArsipSurat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedJenisTab, setSelectedJenisTab] = useState<'SEMUA' | 'MASUK' | 'KELUAR'>('SEMUA');

  // Modal State
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form State
  const [nomorSurat, setNomorSurat] = useState('');
  const [tanggalSurat, setTanggalSurat] = useState('');
  const [tanggalDiterima, setTanggalDiterima] = useState('');
  const [pengirim, setPengirim] = useState('');
  const [penerima, setPenerima] = useState('');
  const [perihal, setPerihal] = useState('');
  const [jenis, setJenis] = useState<'MASUK' | 'KELUAR'>('MASUK');
  const [tautanBerkas, setTautanBerkas] = useState('');
  const [keterangan, setKeterangan] = useState('');
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchSurat();
  }, [selectedJenisTab, searchTerm]);

  const fetchSurat = async () => {
    setLoading(true);
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

  const handleOpenAdd = () => {
    setEditingId(null);
    setNomorSurat('');
    setTanggalSurat(new Date().toISOString().split('T')[0]);
    setTanggalDiterima('');
    setPengirim('');
    setPenerima('Kepala Sekolah');
    setPerihal('');
    setJenis('MASUK');
    setTautanBerkas('');
    setKeterangan('');
    setFormError('');
    setIsOpen(true);
  };

  const handleOpenEdit = (surat: ArsipSurat) => {
    setEditingId(surat.id);
    setNomorSurat(surat.nomorSurat);
    setTanggalSurat(new Date(surat.tanggalSurat).toISOString().split('T')[0]);
    setTanggalDiterima(surat.tanggalDiterima ? new Date(surat.tanggalDiterima).toISOString().split('T')[0] : '');
    setPengirim(surat.pengirim);
    setPenerima(surat.penerima);
    setPerihal(surat.perihal);
    setJenis(surat.jenis);
    setTautanBerkas(surat.tautanBerkas || '');
    setKeterangan(surat.keterangan || '');
    setFormError('');
    setIsOpen(true);
  };

  const handleClose = () => {
    setIsOpen(false);
    setFormError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nomorSurat || !tanggalSurat || !pengirim || !penerima || !perihal || !jenis) {
      setFormError('Kolom utama wajib diisi');
      return;
    }

    setFormError('');
    setSubmitting(true);

    try {
      const url = editingId ? `/api/admin/surat/${editingId}` : '/api/admin/surat';
      const method = editingId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nomorSurat,
          tanggalSurat,
          tanggalDiterima: jenis === 'MASUK' && tanggalDiterima ? tanggalDiterima : null,
          pengirim,
          penerima,
          perihal,
          jenis,
          tautanBerkas: tautanBerkas || null,
          keterangan: keterangan || null,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Gagal menyimpan arsip surat');
      }

      fetchSurat();
      setIsOpen(false);
    } catch (err: any) {
      setFormError(err.message || 'Gagal menyimpan arsip surat');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string, nomor: string) => {
    if (confirm(`Apakah Anda yakin ingin menghapus arsip surat dengan nomor "${nomor}"?`)) {
      try {
        const res = await fetch(`/api/admin/surat/${id}`, {
          method: 'DELETE',
        });
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.message || 'Gagal menghapus arsip surat');
        }

        setSuratList(suratList.filter((s) => s.id !== id));
      } catch (err: any) {
        alert(err.message || 'Terjadi kesalahan');
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Halaman */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <FolderOpen className="text-indigo-400" />
            Arsip Surat Digital
          </h1>
          <p className="text-slate-400 mt-1 text-sm">
            Catat dan dokumentasikan surat masuk dan surat keluar sekolah secara terstruktur.
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="px-5 py-3 bg-linear-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white rounded-2xl text-xs font-semibold shadow-lg shadow-indigo-500/10 hover:shadow-indigo-500/20 transition-all duration-200 flex items-center gap-2 cursor-pointer select-none"
        >
          <Plus size={16} />
          Arsipkan Surat Baru
        </button>
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
                ? 'bg-indigo-950/60 border border-indigo-800/40 text-indigo-400 shadow-md'
                : 'text-slate-400 hover:text-slate-250'
            }`}
          >
            Surat Keluar
          </button>
        </div>

        {/* Search */}
        <div className="flex bg-slate-950/40 border border-slate-850 rounded-2xl px-4 py-2.5 items-center gap-3 w-full md:w-80">
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
                  <th className="px-6 py-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50 text-slate-300 text-sm">
                {suratList.map((surat) => (
                  <tr key={surat.id} className="hover:bg-slate-800/10 transition-colors">
                    <td className="px-6 py-4 space-y-1">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                        surat.jenis === 'MASUK'
                          ? 'bg-emerald-950/50 border border-emerald-800/60 text-emerald-400'
                          : 'bg-indigo-950/50 border border-indigo-800/60 text-indigo-450'
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
                          className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-950 border border-slate-800 text-indigo-400 hover:text-indigo-300 rounded-lg text-xs font-semibold select-none cursor-pointer"
                        >
                          <LinkIcon size={12} />
                          Lihat Berkas
                        </a>
                      ) : (
                        <span className="text-xs text-slate-600 italic">No File</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleOpenEdit(surat)}
                          className="p-2 text-indigo-405 hover:text-white hover:bg-indigo-950/40 rounded-xl transition-colors cursor-pointer"
                          title="Edit Arsip"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(surat.id, surat.nomorSurat)}
                          className="p-2 text-rose-455 hover:text-white hover:bg-rose-950/40 rounded-xl transition-colors cursor-pointer"
                          title="Hapus Arsip"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Add / Edit Surat */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            
            <div className="px-6 py-4 border-b border-slate-800/80 flex items-center justify-between">
              <h2 className="text-lg font-bold text-white">
                {editingId ? 'Edit Data Surat' : 'Arsipkan Surat Baru'}
              </h2>
              <button onClick={handleClose} className="text-slate-500 hover:text-slate-300">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {formError && (
                <div className="bg-red-950/40 border border-red-800/60 text-red-200 px-3 py-2 rounded-xl text-xs">
                  ⚠️ {formError}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                {/* Jenis Surat */}
                <div className="space-y-2 col-span-1">
                  <label className="text-xs font-semibold text-slate-350 uppercase block">Jenis Surat</label>
                  <select
                    value={jenis}
                    onChange={(e) => setJenis(e.target.value as 'MASUK' | 'KELUAR')}
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-850 rounded-xl text-white text-sm focus:outline-hidden focus:border-indigo-500"
                  >
                    <option value="MASUK">Surat Masuk</option>
                    <option value="KELUAR">Surat Keluar</option>
                  </select>
                </div>

                {/* Nomor Surat */}
                <div className="space-y-2 col-span-1">
                  <label className="text-xs font-semibold text-slate-350 uppercase block">Nomor Surat</label>
                  <input
                    type="text"
                    value={nomorSurat}
                    onChange={(e) => setNomorSurat(e.target.value)}
                    placeholder="Contoh: 045/SD-TU/VI/2026"
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-850 rounded-xl text-white text-sm focus:outline-hidden focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Perihal */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-355 uppercase block">Perihal Surat</label>
                <input
                  type="text"
                  value={perihal}
                  onChange={(e) => setPerihal(e.target.value)}
                  placeholder="Contoh: Undangan Rapat Komite Sekolah"
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-855 rounded-xl text-white text-sm focus:outline-hidden focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Pengirim */}
                <div className="space-y-2 col-span-1">
                  <label className="text-xs font-semibold text-slate-355 uppercase block">Pengirim</label>
                  <input
                    type="text"
                    value={pengirim}
                    onChange={(e) => setPengirim(e.target.value)}
                    placeholder={jenis === 'MASUK' ? 'Dinas Pendidikan' : 'SD Antigravity'}
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-855 rounded-xl text-white text-sm focus:outline-hidden focus:border-indigo-500"
                  />
                </div>

                {/* Penerima */}
                <div className="space-y-2 col-span-1">
                  <label className="text-xs font-semibold text-slate-355 uppercase block">Penerima</label>
                  <input
                    type="text"
                    value={penerima}
                    onChange={(e) => setPenerima(e.target.value)}
                    placeholder={jenis === 'MASUK' ? 'Kepala Sekolah' : 'Wali Murid Kelas 6'}
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-855 rounded-xl text-white text-sm focus:outline-hidden focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Tanggal Surat */}
                <div className="space-y-2 col-span-1">
                  <label className="text-xs font-semibold text-slate-355 uppercase block">Tanggal Surat</label>
                  <input
                    type="date"
                    value={tanggalSurat}
                    onChange={(e) => setTanggalSurat(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-855 rounded-xl text-white text-sm focus:outline-hidden focus:border-indigo-500"
                  />
                </div>

                {/* Tanggal Diterima (Hanya Surat Masuk) */}
                <div className="space-y-2 col-span-1">
                  <label className={`text-xs font-semibold uppercase block ${jenis === 'KELUAR' ? 'text-slate-600' : 'text-slate-355'}`}>
                    Tanggal Diterima {jenis === 'KELUAR' && '(N/A)'}
                  </label>
                  <input
                    type="date"
                    disabled={jenis === 'KELUAR'}
                    value={tanggalDiterima}
                    onChange={(e) => setTanggalDiterima(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-855 rounded-xl text-white disabled:text-slate-600 text-sm focus:outline-hidden focus:border-indigo-500 disabled:border-slate-900 disabled:bg-slate-950/20"
                  />
                </div>
              </div>

              {/* Tautan Berkas */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-355 uppercase block">
                  Tautan File Pendukung (Opsional)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                    <LinkIcon size={14} />
                  </div>
                  <input
                    type="url"
                    value={tautanBerkas}
                    onChange={(e) => setTautanBerkas(e.target.value)}
                    placeholder="Contoh: https://drive.google.com/file/d/..."
                    className="w-full pl-9 pr-4 py-2.5 bg-slate-950 border border-slate-855 rounded-xl text-white placeholder-slate-550 text-sm focus:outline-hidden focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Keterangan */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-355 uppercase block">Keterangan Tambahan</label>
                <textarea
                  value={keterangan}
                  onChange={(e) => setKeterangan(e.target.value)}
                  placeholder="Isi ringkasan disposisi atau keterangan tambahan..."
                  rows={2}
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-855 rounded-xl text-white placeholder-slate-550 text-sm focus:outline-hidden focus:border-indigo-500 resize-none"
                />
              </div>

              {/* Action Buttons */}
              <div className="pt-4 flex justify-end gap-3 border-t border-slate-800/80">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-4 py-2 text-slate-400 hover:text-white rounded-xl text-xs font-semibold select-none cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 bg-linear-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer disabled:opacity-50 select-none"
                >
                  {submitting && <Loader2 size={14} className="animate-spin" />}
                  {editingId ? 'Simpan Perubahan' : 'Arsipkan Surat'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}
    </div>
  );
}
