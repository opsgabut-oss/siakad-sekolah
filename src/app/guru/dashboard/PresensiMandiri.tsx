'use client';

import { useState, useEffect } from 'react';
import { CheckCircle2, Clock, Loader2, AlertCircle, FileText, Calendar, Send, HelpCircle } from 'lucide-react';

interface AttendanceRecord {
  id: string;
  tanggal: string;
  status: 'HADIR' | 'SAKIT' | 'IZIN' | 'ALPA';
  keterangan: string | null;
  createdAt: string;
}

export default function PresensiMandiri() {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [todayRecord, setTodayRecord] = useState<AttendanceRecord | null>(null);
  const [history, setHistory] = useState<AttendanceRecord[]>([]);

  // Form State for Sakit/Izin
  const [showModal, setShowModal] = useState(false);
  const [formStatus, setFormStatus] = useState<'SAKIT' | 'IZIN'>('SAKIT');
  const [formKeterangan, setFormKeterangan] = useState('');

  useEffect(() => {
    fetchStatus();
  }, []);

  const fetchStatus = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/guru/absensi-mandiri');
      if (!res.ok) throw new Error('Gagal memuat status absensi');
      const data = await res.json();
      setTodayRecord(data.today);
      setHistory(data.history);
    } catch (err: any) {
      setError(err.message || 'Gagal mengambil data absensi');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckInHadir = async () => {
    setSubmitting(true);
    setError('');
    setSuccess('');
    try {
      const res = await fetch('/api/guru/absensi-mandiri', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'HADIR' }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Gagal merekam absensi');

      setSuccess('Presensi Hadir hari ini berhasil disimpan!');
      setTodayRecord(data.record);
      // Refresh history
      fetchStatus();
      setTimeout(() => setSuccess(''), 4000);
    } catch (err: any) {
      setError(err.message || 'Gagal mengirim presensi');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitSakitIzin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formKeterangan.trim()) {
      alert('Keterangan / alasan wajib diisi');
      return;
    }

    setSubmitting(true);
    setError('');
    setSuccess('');
    try {
      const res = await fetch('/api/guru/absensi-mandiri', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: formStatus,
          keterangan: formKeterangan
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Gagal merekam absensi');

      setSuccess(`Laporan ${formStatus === 'SAKIT' ? 'Sakit' : 'Izin'} hari ini berhasil dikirim!`);
      setTodayRecord(data.record);
      setShowModal(false);
      setFormKeterangan('');
      // Refresh history
      fetchStatus();
      setTimeout(() => setSuccess(''), 4000);
    } catch (err: any) {
      setError(err.message || 'Gagal mengirim laporan');
    } finally {
      setSubmitting(false);
    }
  };

  const formatTanggalIndo = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const formatWaktuCheckIn = (isoString: string) => {
    const d = new Date(isoString);
    const h = String(d.getHours()).padStart(2, '0');
    const m = String(d.getMinutes()).padStart(2, '0');
    return `${h}:${m} WIB`;
  };

  if (loading) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 flex justify-center items-center gap-3">
        <Loader2 className="animate-spin text-indigo-400" size={20} />
        <span className="text-xs text-slate-400 font-semibold">Memeriksa status kehadiran hari ini...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Notifikasi Status */}
      {success && (
        <div className="p-4 bg-emerald-950/60 border border-emerald-800 text-emerald-300 rounded-2xl text-sm font-medium animate-in fade-in slide-in-from-top-4 duration-200">
          ✨ {success}
        </div>
      )}

      {error && (
        <div className="p-4 bg-rose-955/60 border border-rose-800 text-rose-300 rounded-2xl text-sm font-medium">
          ⚠️ {error}
        </div>
      )}

      {/* Main Check-in Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-[-10%] right-[-5%] w-24 h-24 rounded-full bg-indigo-500/5 blur-xl pointer-events-none" />
        
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800/80 pb-4 mb-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-1.5">
              <Calendar size={18} className="text-indigo-400" />
              Presensi Mandiri Pendidik & Staf
            </h3>
            <p className="text-[11px] text-slate-400 font-semibold mt-0.5">
              Hari ini: {formatTanggalIndo(new Date().toISOString())}
            </p>
          </div>

          {/* Today Status Badge */}
          {todayRecord ? (
            <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
              todayRecord.status === 'HADIR' 
                ? 'bg-emerald-950/40 border border-emerald-800/60 text-emerald-400' 
                : todayRecord.status === 'SAKIT'
                ? 'bg-amber-955/40 border border-amber-800/60 text-amber-400'
                : 'bg-sky-955/40 border border-sky-800/60 text-sky-400'
            }`}>
              {todayRecord.status}
            </span>
          ) : (
            <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-950 border border-slate-800 text-slate-500">
              Belum Presensi
            </span>
          )}
        </div>

        {/* Card Body */}
        {todayRecord ? (
          <div className="bg-slate-950/40 border border-slate-850 rounded-2xl p-4 flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
              <CheckCircle2 size={18} />
            </div>
            <div className="space-y-1 text-xs">
              <p className="text-slate-200 font-semibold leading-relaxed">
                {todayRecord.status === 'HADIR' ? (
                  <>Anda telah melakukan **Presensi Hadir** hari ini pada pukul <strong>{formatWaktuCheckIn(todayRecord.createdAt)}</strong>.</>
                ) : (
                  <>Status kehadiran Anda hari ini tercatat sebagai **{todayRecord.status === 'SAKIT' ? 'Sakit' : 'Izin'}**.</>
                )}
              </p>
              {todayRecord.keterangan && (
                <p className="text-[11px] text-slate-400 italic mt-1 leading-relaxed bg-slate-900/50 p-2 rounded-lg border border-slate-800/50">
                  Keterangan: "{todayRecord.keterangan}"
                </p>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-xs text-slate-400 leading-relaxed">
              Silakan lakukan presensi kehadiran mandiri harian Anda. Anda dapat langsung mengklik tombol hadir atau mengajukan laporan jika berhalangan (sakit/izin).
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleCheckInHadir}
                disabled={submitting}
                className="flex-1 py-3 bg-linear-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-500/10 hover:shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 select-none"
              >
                {submitting ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <CheckCircle2 size={16} />
                )}
                Absen Hadir Sekarang
              </button>

              <button
                onClick={() => {
                  setFormStatus('SAKIT');
                  setFormKeterangan('');
                  setShowModal(true);
                }}
                disabled={submitting}
                className="py-3 px-5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 select-none"
              >
                <FileText size={16} />
                Lapor Sakit / Izin
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Monthly History Dot Bar */}
      {history.length > 0 && (
        <div className="bg-slate-900/40 border border-slate-800/80 rounded-3xl p-5 space-y-3">
          <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            Riwayat Presensi Bulan Ini (Terbaru)
          </h4>
          
          <div className="overflow-x-auto">
            <div className="flex gap-2 min-w-max pb-1">
              {history.slice(0, 15).map((rec) => (
                <div 
                  key={rec.id} 
                  className="bg-slate-950/60 border border-slate-850 rounded-xl p-2.5 flex flex-col items-center justify-center text-center space-y-1 w-20 shrink-0"
                  title={rec.keterangan ? `Keterangan: ${rec.keterangan}` : `Status: ${rec.status}`}
                >
                  <span className="text-[9px] text-slate-500 font-bold">
                    {new Date(rec.tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                  </span>
                  <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[8px] font-bold ${
                    rec.status === 'HADIR' 
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                      : rec.status === 'SAKIT'
                      ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      : 'bg-sky-500/20 text-sky-400 border border-sky-500/30'
                  }`}>
                    {rec.status[0]}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Dialog Modal Form Sakit / Izin */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            
            <div className="px-6 py-4 border-b border-slate-800/80 flex items-center justify-between">
              <h3 className="text-sm font-bold text-white uppercase tracking-wide">
                Laporan Ketidakhadiran Mandiri
              </h3>
              <button 
                onClick={() => setShowModal(false)}
                className="text-slate-500 hover:text-slate-350"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmitSakitIzin} className="p-6 space-y-4">
              {/* Pilihan Status */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300 uppercase block">
                  Status Berhalangan
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setFormStatus('SAKIT')}
                    className={`py-2.5 rounded-xl text-xs font-bold border transition-all ${
                      formStatus === 'SAKIT'
                        ? 'bg-amber-500/10 border-amber-500/50 text-amber-400'
                        : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Sakit
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormStatus('IZIN')}
                    className={`py-2.5 rounded-xl text-xs font-bold border transition-all ${
                      formStatus === 'IZIN'
                        ? 'bg-sky-500/10 border-sky-500/50 text-sky-400'
                        : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Izin
                  </button>
                </div>
              </div>

              {/* Keterangan */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300 uppercase block">
                  Keterangan / Alasan Lengkap
                </label>
                <textarea
                  rows={3}
                  value={formKeterangan}
                  onChange={(e) => setFormKeterangan(e.target.value)}
                  placeholder={`Contoh: ${
                    formStatus === 'SAKIT' 
                      ? 'Sakit Demam Tinggi, butuh istirahat sesuai surat dokter' 
                      : 'Izin menghadiri acara wisuda keluarga'
                  }`}
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-650 text-xs focus:outline-hidden focus:border-indigo-500 resize-none"
                  required
                />
              </div>

              {/* Buttons */}
              <div className="pt-3 flex justify-end gap-3 border-t border-slate-800/80">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
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
                  <Send size={12} />
                  Kirim Laporan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// X icon helper for modal
function X({ size, className, onClick }: { size: number; className?: string; onClick?: () => void }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
      onClick={onClick}
      style={{ cursor: 'pointer' }}
    >
      <line x1="18" y1="6" x2="6" y2="18"></line>
      <line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>
  );
}
