'use client';

import { useState, useEffect } from 'react';
import { School, Save, Loader2, Link as LinkIcon, RefreshCw, AlertCircle, Building } from 'lucide-react';

export default function AdminProfilPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Form States
  const [pemerintah, setPemerintah] = useState('');
  const [dinas, setDinas] = useState('');
  const [namaSekolah, setNamaSekolah] = useState('');
  const [npsn, setNpsn] = useState('');
  const [alamat, setAlamat] = useState('');
  const [telepon, setTelepon] = useState('');
  const [email, setEmail] = useState('');
  const [website, setWebsite] = useState('');
  const [logoPemdaUrl, setLogoPemdaUrl] = useState('');
  const [logoSekolahUrl, setLogoSekolahUrl] = useState('');
  const [namaKepsek, setNamaKepsek] = useState('');
  const [nipKepsek, setNipKepsek] = useState('');
  const [tahunAjaranAktif, setTahunAjaranAktif] = useState('');


  useEffect(() => {
    fetchProfil();
  }, []);

  const fetchProfil = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/profil-sekolah');
      if (!res.ok) throw new Error('Gagal memuat profil sekolah');
      const data = await res.json();
      
      setPemerintah(data.pemerintah || '');
      setDinas(data.dinas || '');
      setNamaSekolah(data.namaSekolah || '');
      setNpsn(data.npsn || '');
      setAlamat(data.alamat || '');
      setTelepon(data.telepon || '');
      setEmail(data.email || '');
      setWebsite(data.website || '');
      setLogoPemdaUrl(data.logoPemdaUrl || '');
      setLogoSekolahUrl(data.logoSekolahUrl || '');
      setNamaKepsek(data.namaKepsek || '');
      setNipKepsek(data.nipKepsek || '');
      setTahunAjaranAktif(data.tahunAjaranAktif || '');
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan');
    } finally {
      setLoading(false);
    }

  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pemerintah || !dinas || !namaSekolah || !alamat || !namaKepsek) {
      setError('Kolom utama (Instansi Pemerintah, Dinas, Nama Sekolah, Alamat, dan Kepala Sekolah) wajib diisi');
      return;
    }

    setSaving(true);
    setError('');
    setSuccess(false);

    try {
      const res = await fetch('/api/admin/profil-sekolah', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pemerintah,
          dinas,
          namaSekolah,
          npsn,
          alamat,
          telepon,
          email,
          website,
          logoPemdaUrl: logoPemdaUrl || null,
          logoSekolahUrl: logoSekolahUrl || null,
          namaKepsek,
          nipKepsek: nipKepsek || null,
          tahunAjaranAktif
        }),
      });


      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Gagal menyimpan profil');

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message || 'Gagal menyimpan profil');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="animate-spin text-indigo-400" size={32} />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header Halaman */}
      <div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
          <School className="text-indigo-400" />
          Identitas & Profil Sekolah
        </h1>
        <p className="text-slate-400 mt-1 text-sm">
          Kelola informasi resmi sekolah, logo, dan penandatangan dokumen (Kepala Sekolah) untuk Kop Surat cetak.
        </p>
      </div>

      {error && (
        <div className="p-4 bg-rose-950/60 border border-rose-800 text-rose-300 rounded-2xl text-sm font-medium flex items-start gap-2">
          <AlertCircle className="shrink-0 mt-0.5" size={16} />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="p-4 bg-emerald-950/60 border border-emerald-800 text-emerald-300 rounded-2xl text-sm font-medium">
          ✨ Profil sekolah berhasil disimpan! Seluruh kop surat laporan cetak otomatis diperbarui.
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Seksi 1: Instansi & Sekolah */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
          <h2 className="text-base font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
            <Building size={18} className="text-indigo-400" />
            1. Instansi & Nama Sekolah (Kop Surat Utama)
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-350 uppercase block">Instansi Pemerintah (Baris 1)</label>
              <input
                type="text"
                value={pemerintah}
                onChange={(e) => setPemerintah(e.target.value)}
                placeholder="Contoh: Pemerintah Kabupaten Pati"
                className="w-full px-4 py-2.5 bg-slate-955 border border-slate-800 rounded-xl text-white text-sm focus:outline-hidden focus:border-indigo-500"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-350 uppercase block">Dinas Pendidikan (Baris 2)</label>
              <input
                type="text"
                value={dinas}
                onChange={(e) => setDinas(e.target.value)}
                placeholder="Contoh: Dinas Pendidikan dan Kebudayaan"
                className="w-full px-4 py-2.5 bg-slate-955 border border-slate-800 rounded-xl text-white text-sm focus:outline-hidden focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2 md:col-span-2">
              <label className="text-xs font-semibold text-slate-355 uppercase block">Nama Sekolah Resmi (Baris 3)</label>
              <input
                type="text"
                value={namaSekolah}
                onChange={(e) => setNamaSekolah(e.target.value)}
                placeholder="Contoh: SD Negeri Wedusan"
                className="w-full px-4 py-2.5 bg-slate-955 border border-slate-800 rounded-xl text-white text-sm focus:outline-hidden focus:border-indigo-500"
              />
            </div>

            <div className="space-y-2 md:col-span-1">
              <label className="text-xs font-semibold text-slate-355 uppercase block">NPSN</label>
              <input
                type="text"
                value={npsn || ''}
                onChange={(e) => setNpsn(e.target.value.replace(/[^0-9]/g, ''))}
                placeholder="Masukkan NPSN..."
                className="w-full px-4 py-2.5 bg-slate-955 border border-slate-800 rounded-xl text-white text-sm focus:outline-hidden focus:border-indigo-500"
              />
            </div>

            <div className="space-y-2 md:col-span-1">
              <label className="text-xs font-semibold text-slate-355 uppercase block">Tahun Ajaran Aktif</label>
              <input
                type="text"
                value={tahunAjaranAktif}
                onChange={(e) => setTahunAjaranAktif(e.target.value)}
                placeholder="Contoh: 2025/2026"
                className="w-full px-4 py-2.5 bg-slate-955 border border-slate-800 rounded-xl text-white text-sm focus:outline-hidden focus:border-indigo-500"
              />
            </div>
          </div>


          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-350 uppercase block">Alamat Sekolah Lengkap (Baris 4)</label>
            <textarea
              value={alamat}
              onChange={(e) => setAlamat(e.target.value)}
              placeholder="Masukkan jalan, desa/kelurahan, kecamatan, kabupaten, kode pos..."
              rows={2}
              className="w-full px-4 py-2.5 bg-slate-955 border border-slate-800 rounded-xl text-white text-sm focus:outline-hidden focus:border-indigo-500 resize-none"
            />
          </div>
        </div>

        {/* Seksi 2: Kontak & Media */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
          <h2 className="text-base font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
            <Building size={18} className="text-indigo-400" />
            2. Kontak & Media Informasi
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2 col-span-1">
              <label className="text-xs font-semibold text-slate-355 uppercase block">No. Telepon / HP</label>
              <input
                type="text"
                value={telepon}
                onChange={(e) => setTelepon(e.target.value)}
                placeholder="Contoh: (0295) 123456"
                className="w-full px-4 py-2.5 bg-slate-955 border border-slate-800 rounded-xl text-white text-sm focus:outline-hidden focus:border-indigo-500"
              />
            </div>

            <div className="space-y-2 col-span-1">
              <label className="text-xs font-semibold text-slate-355 uppercase block">Email Sekolah</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Contoh: sdnwedusan@gmail.com"
                className="w-full px-4 py-2.5 bg-slate-955 border border-slate-800 rounded-xl text-white text-sm focus:outline-hidden focus:border-indigo-500"
              />
            </div>

            <div className="space-y-2 col-span-1">
              <label className="text-xs font-semibold text-slate-355 uppercase block">Website Sekolah</label>
              <input
                type="text"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                placeholder="Contoh: www.sdnwedusan.sch.id"
                className="w-full px-4 py-2.5 bg-slate-955 border border-slate-800 rounded-xl text-white text-sm focus:outline-hidden focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Logo URLs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-355 uppercase block">URL Logo Pemda (Kiri Kop - Opsional)</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <LinkIcon size={14} />
                </div>
                <input
                  type="url"
                  value={logoPemdaUrl}
                  onChange={(e) => setLogoPemdaUrl(e.target.value)}
                  placeholder="Masukkan link gambar logo Pemda..."
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-955 border border-slate-800 rounded-xl text-white text-sm focus:outline-hidden focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-355 uppercase block">URL Logo Sekolah (Kanan Kop - Opsional)</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <LinkIcon size={14} />
                </div>
                <input
                  type="url"
                  value={logoSekolahUrl}
                  onChange={(e) => setLogoSekolahUrl(e.target.value)}
                  placeholder="Masukkan link gambar logo Sekolah..."
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-955 border border-slate-800 rounded-xl text-white text-sm focus:outline-hidden focus:border-indigo-500"
                />
              </div>
            </div>
          </div>
          <p className="text-[10px] text-slate-500">
            *Tautan URL logo ini akan dirender secara otomatis pada Kop Surat Resmi (Logo Pemda di sebelah kiri, Logo Sekolah di sebelah kanan).
          </p>
        </div>

        {/* Seksi 3: Kepala Sekolah (Penandatangan) */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
          <h2 className="text-base font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
            <Building size={18} className="text-indigo-400" />
            3. Kepala Sekolah (Penanda Tangan Dokumen)
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-355 uppercase block">Nama Kepala Sekolah Lengkap</label>
              <input
                type="text"
                value={namaKepsek}
                onChange={(e) => setNamaKepsek(e.target.value)}
                placeholder="Contoh: Sudarto, S.Pd"
                className="w-full px-4 py-2.5 bg-slate-955 border border-slate-800 rounded-xl text-white text-sm focus:outline-hidden focus:border-indigo-500"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-355 uppercase block">NIP Kepala Sekolah</label>
              <input
                type="text"
                value={nipKepsek}
                onChange={(e) => setNipKepsek(e.target.value.replace(/[^0-9]/g, ''))}
                placeholder="Masukkan 18 digit NIP..."
                className="w-full px-4 py-2.5 bg-slate-955 border border-slate-800 rounded-xl text-white text-sm focus:outline-hidden focus:border-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-4 bg-linear-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white rounded-2xl font-bold text-sm hover:shadow-indigo-500/20 shadow-lg shadow-indigo-500/10 transition-all duration-200 flex items-center gap-2 cursor-pointer select-none disabled:opacity-50"
          >
            {saving ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Menyimpan Perubahan...
              </>
            ) : (
              <>
                <Save size={18} />
                Simpan Identitas Sekolah
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
