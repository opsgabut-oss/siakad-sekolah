'use client';

import { useState, useEffect } from 'react';
import { Calendar, Plus, Trash2, Edit2, X, RefreshCw, BookOpen, User, Clock } from 'lucide-react';

interface Kelas {
  id: string;
  nama: string;
  tahunAjaran: { tahun: string; aktif: boolean };
}

interface Mapel {
  id: string;
  nama: string;
  kode: string;
}

interface Guru {
  id: string;
  nama: string;
}

interface Jadwal {
  id: string;
  kelasId: string;
  mataPelajaranId: string;
  guruId: string;
  hari: string;
  jamMulai: string;
  jamSelesai: string;
  kelas: { nama: string };
  mataPelajaran: { nama: string; kode: string };
  guru: { nama: string };
}

const HARI_LIST = ['SENIN', 'SELASA', 'RABU', 'KAMIS', 'JUMAT', 'SABTU'];

export default function JadwalPelajaranPage() {
  const [kelasList, setKelasList] = useState<Kelas[]>([]);
  const [mapelList, setMapelList] = useState<Mapel[]>([]);
  const [guruList, setGuruList] = useState<Guru[]>([]);
  const [jadwalList, setJadwalList] = useState<Jadwal[]>([]);
  
  const [selectedKelasId, setSelectedKelasId] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingConfig, setLoadingConfig] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingJadwal, setEditingJadwal] = useState<Jadwal | null>(null);
  const [formData, setFormData] = useState({
    mataPelajaranId: '',
    guruId: '',
    hari: 'SENIN',
    jamMulai: '',
    jamSelesai: '',
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (selectedKelasId) {
      fetchJadwal(selectedKelasId);
    } else {
      setJadwalList([]);
    }
  }, [selectedKelasId]);

  const fetchInitialData = async () => {
    setLoadingConfig(true);
    setError('');
    try {
      // Fetch classes, subjects, and teachers in parallel
      const [resKelas, resMapel, resGuru] = await Promise.all([
        fetch('/api/admin/kelas'),
        fetch('/api/admin/mapel'),
        fetch('/api/admin/guru'),
      ]);

      if (!resKelas.ok || !resMapel.ok || !resGuru.ok) {
        throw new Error('Gagal memuat data konfigurasi');
      }

      const classes = await resKelas.json();
      const mapels = await resMapel.json();
      const gurus = await resGuru.json();

      setKelasList(classes);
      setMapelList(mapels);
      setGuruList(gurus);

      if (classes.length > 0) {
        setSelectedKelasId(classes[0].id);
      }
    } catch (err: any) {
      setError(err.message || 'Gagal memuat data dasar');
    } finally {
      setLoadingConfig(false);
    }
  };

  const fetchJadwal = async (kelasId: string) => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/admin/jadwal?kelasId=${kelasId}`);
      if (!res.ok) {
        throw new Error('Gagal memuat data jadwal');
      }
      const data = await res.json();
      setJadwalList(data);
    } catch (err: any) {
      setError(err.message || 'Gagal mengambil jadwal');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAddModal = () => {
    if (!selectedKelasId) {
      alert('Pilih kelas terlebih dahulu!');
      return;
    }
    setEditingJadwal(null);
    setFormData({
      mataPelajaranId: mapelList.length > 0 ? mapelList[0].id : '',
      guruId: guruList.length > 0 ? guruList[0].id : '',
      hari: 'SENIN',
      jamMulai: '07:30',
      jamSelesai: '09:00',
    });
    setError('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (jadwal: Jadwal) => {
    setEditingJadwal(jadwal);
    setFormData({
      mataPelajaranId: jadwal.mataPelajaranId,
      guruId: jadwal.guruId,
      hari: jadwal.hari,
      jamMulai: jadwal.jamMulai,
      jamSelesai: jadwal.jamSelesai,
    });
    setError('');
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string, mapelName: string, hari: string, jam: string) => {
    if (!confirm(`Hapus jadwal "${mapelName}" pada hari ${hari} jam ${jam}?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/jadwal?id=${id}`, {
        method: 'DELETE',
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Gagal menghapus jadwal');
      }

      setSuccess('Jadwal pelajaran berhasil dihapus!');
      fetchJadwal(selectedKelasId);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.message || 'Gagal menghapus jadwal');
      setTimeout(() => setError(''), 5000);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    const url = '/api/admin/jadwal';
    const method = editingJadwal ? 'PUT' : 'POST';
    const body = editingJadwal
      ? { id: editingJadwal.id, kelasId: selectedKelasId, ...formData }
      : { kelasId: selectedKelasId, ...formData };

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Gagal menyimpan jadwal');
      }

      setSuccess(editingJadwal ? 'Jadwal berhasil diperbarui!' : 'Jadwal berhasil ditambahkan!');
      setIsModalOpen(false);
      fetchJadwal(selectedKelasId);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.message || 'Gagal menyimpan jadwal');
    } finally {
      setSubmitting(false);
    }
  };

  // Group jadwal by hari
  const groupedJadwal = HARI_LIST.reduce((acc, hari) => {
    acc[hari] = jadwalList.filter((j) => j.hari === hari);
    return acc;
  }, {} as Record<string, Jadwal[]>);

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
            <Calendar className="text-indigo-400" />
            Jadwal Pelajaran
          </h1>
          <p className="text-slate-400 mt-1">Kelola jadwal pelajaran mingguan per kelas.</p>
        </div>
        {selectedKelasId && (
          <button
            onClick={handleOpenAddModal}
            className="flex items-center gap-2 px-4 py-2.5 bg-linear-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white rounded-xl font-semibold text-sm shadow-lg shadow-indigo-500/20 transition-all duration-200"
          >
            <Plus size={16} />
            Tambah Jadwal
          </button>
        )}
      </div>

      {/* Alert Notifikasi */}
      {success && (
        <div className="p-4 bg-emerald-950/60 border border-emerald-800 text-emerald-300 rounded-2xl text-sm font-medium">
          {success}
        </div>
      )}
      {error && !isModalOpen && (
        <div className="p-4 bg-rose-950/60 border border-rose-800 text-rose-300 rounded-2xl text-sm font-medium">
          {error}
        </div>
      )}

      {/* Pemilihan Kelas */}
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
                {k.nama} ({k.tahunAjaran.tahun})
              </option>
            ))}
          </select>
        </div>
        {selectedKelasId && (
          <button
            onClick={() => fetchJadwal(selectedKelasId)}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-sm font-medium transition-colors w-full sm:w-auto"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            Segarkan Jadwal
          </button>
        )}
      </div>

      {/* Grid Mingguan */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <RefreshCw className="animate-spin text-indigo-400" size={32} />
        </div>
      ) : !selectedKelasId ? (
        <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-12 text-center">
          <Calendar className="mx-auto text-slate-600 mb-3" size={40} />
          <p className="text-slate-400 text-sm font-medium">Silakan tambahkan data kelas terlebih dahulu di menu Siswa/Dashboard.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {HARI_LIST.map((hari) => {
            const jadwalHari = groupedJadwal[hari] || [];
            return (
              <div
                key={hari}
                className="bg-slate-900/30 border border-slate-800/60 rounded-2xl p-5 space-y-4 hover:border-slate-800 transition-all"
              >
                <div className="flex justify-between items-center pb-3 border-b border-slate-800/60">
                  <h3 className="font-extrabold text-sm tracking-wider text-slate-300 uppercase">{hari}</h3>
                  <span className="text-xs px-2.5 py-1 rounded-full bg-slate-800/80 text-slate-400 font-semibold">
                    {jadwalHari.length} Pelajaran
                  </span>
                </div>

                {jadwalHari.length === 0 ? (
                  <p className="text-slate-500 text-xs py-4 text-center italic">Tidak ada jadwal</p>
                ) : (
                  <div className="space-y-3">
                    {jadwalHari.map((j) => (
                      <div
                        key={j.id}
                        className="bg-slate-950/40 border border-slate-900 hover:border-slate-800 rounded-xl p-3.5 relative group transition-all"
                      >
                        <div className="flex items-center gap-2.5 text-xs text-indigo-400 font-semibold mb-1">
                          <Clock size={12} />
                          {j.jamMulai} - {j.jamSelesai}
                        </div>
                        <h4 className="text-sm font-bold text-slate-200 mb-1 flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                          {j.mataPelajaran.nama} ({j.mataPelajaran.kode})
                        </h4>
                        <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-1">
                          <User size={12} className="text-slate-500" />
                          {j.guru.nama}
                        </p>

                        {/* Hover Actions */}
                        <div className="absolute top-3 right-3 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => handleOpenEditModal(j)}
                            className="p-1.5 bg-slate-800 hover:bg-indigo-600/30 text-slate-400 hover:text-indigo-400 rounded-md transition-colors"
                            title="Edit"
                          >
                            <Edit2 size={12} />
                          </button>
                          <button
                            onClick={() => handleDelete(j.id, j.mataPelajaran.nama, j.hari, `${j.jamMulai}-${j.jamSelesai}`)}
                            className="p-1.5 bg-slate-800 hover:bg-rose-600/30 text-slate-400 hover:text-rose-400 rounded-md transition-colors"
                            title="Hapus"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Add / Edit */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 relative animate-in fade-in zoom-in-95 duration-150">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-lg transition-all"
            >
              <X size={16} />
            </button>

            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Calendar className="text-indigo-400" size={20} />
              {editingJadwal ? 'Edit Jadwal Pelajaran' : 'Tambah Jadwal Pelajaran'}
            </h2>

            {error && (
              <div className="p-3 mb-4 bg-rose-950/60 border border-rose-800 text-rose-300 rounded-xl text-xs font-semibold">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Hari */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">Hari</label>
                <select
                  value={formData.hari}
                  onChange={(e) => setFormData({ ...formData, hari: e.target.value })}
                  disabled={submitting}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-850 rounded-xl text-white text-sm focus:outline-hidden focus:border-indigo-500 transition-all"
                  required
                >
                  {HARI_LIST.map((h) => (
                    <option key={h} value={h}>
                      {h}
                    </option>
                  ))}
                </select>
              </div>

              {/* Mata Pelajaran */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">Mata Pelajaran</label>
                {mapelList.length === 0 ? (
                  <p className="text-xs text-rose-400">Belum ada mata pelajaran. Tambahkan mapel terlebih dahulu.</p>
                ) : (
                  <select
                    value={formData.mataPelajaranId}
                    onChange={(e) => setFormData({ ...formData, mataPelajaranId: e.target.value })}
                    disabled={submitting}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-850 rounded-xl text-white text-sm focus:outline-hidden focus:border-indigo-500 transition-all"
                    required
                  >
                    {mapelList.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.nama} ({m.kode})
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Guru Pengampu */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">Guru Pengajar</label>
                {guruList.length === 0 ? (
                  <p className="text-xs text-rose-400">Belum ada data guru. Tambahkan guru terlebih dahulu.</p>
                ) : (
                  <select
                    value={formData.guruId}
                    onChange={(e) => setFormData({ ...formData, guruId: e.target.value })}
                    disabled={submitting}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-850 rounded-xl text-white text-sm focus:outline-hidden focus:border-indigo-500 transition-all"
                    required
                  >
                    {guruList.map((g) => (
                      <option key={g.id} value={g.id}>
                        {g.nama}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Jam Pelajaran */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">Jam Mulai</label>
                  <input
                    type="text"
                    placeholder="Contoh: 07:30"
                    value={formData.jamMulai}
                    onChange={(e) => setFormData({ ...formData, jamMulai: e.target.value })}
                    disabled={submitting}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-850 rounded-xl text-white placeholder-slate-700 text-sm focus:outline-hidden focus:border-indigo-500 transition-all"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">Jam Selesai</label>
                  <input
                    type="text"
                    placeholder="Contoh: 09:00"
                    value={formData.jamSelesai}
                    onChange={(e) => setFormData({ ...formData, jamSelesai: e.target.value })}
                    disabled={submitting}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-850 rounded-xl text-white placeholder-slate-700 text-sm focus:outline-hidden focus:border-indigo-500 transition-all"
                    required
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-semibold text-sm transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting || mapelList.length === 0 || guruList.length === 0}
                  className="flex-1 py-2.5 bg-linear-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white rounded-xl font-semibold text-sm shadow-md transition-all flex items-center justify-center gap-2"
                >
                  {submitting ? 'Menyimpan...' : 'Simpan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
