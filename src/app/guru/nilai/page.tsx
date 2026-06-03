'use client';

import { useState, useEffect } from 'react';
import { GraduationCap, Save, RefreshCw, AlertCircle, Check } from 'lucide-react';

interface SesiMengajar {
  kelasId: string;
  kelasNama: string;
  mapelId: string;
  mapelNama: string;
  mapelKode: string;
}

interface SiswaNilaiRow {
  siswaId: string;
  nisn: string;
  nama: string;
  nilai: {
    TUGAS: { nilai: number; keterangan: string | null } | null;
    UTS: { nilai: number; keterangan: string | null } | null;
    UAS: { nilai: number; keterangan: string | null } | null;
  };
}

export default function InputNilaiPage() {
  const [sesiList, setSesiList] = useState<SesiMengajar[]>([]);
  const [selectedSesiIndex, setSelectedSesiIndex] = useState(-1);
  const [selectedJenis, setSelectedJenis] = useState<'TUGAS' | 'UTS' | 'UAS'>('TUGAS');
  
  const [siswaNilaiRows, setSiswaNilaiRows] = useState<SiswaNilaiRow[]>([]);
  const [gradesInput, setGradesInput] = useState<Record<string, { nilai: string; keterangan: string }>>({});
  
  const [loadingConfig, setLoadingConfig] = useState(true);
  const [loadingSiswa, setLoadingSiswa] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchSesiMengajar();
  }, []);

  useEffect(() => {
    if (selectedSesiIndex !== -1 && sesiList[selectedSesiIndex]) {
      const sesi = sesiList[selectedSesiIndex];
      fetchSiswaNilai(sesi.kelasId, sesi.mapelId);
    } else {
      setSiswaNilaiRows([]);
      setGradesInput({});
    }
  }, [selectedSesiIndex, selectedJenis]);

  const fetchSesiMengajar = async () => {
    setLoadingConfig(true);
    try {
      const res = await fetch('/api/admin/jadwal?my=true');
      if (!res.ok) throw new Error('Gagal memuat jadwal ajar');
      const data = await res.json();
      
      // Ekstrak kombinasi Kelas dan Mapel yang unik dari Jadwal
      const sesiUnikMap = new Map<string, SesiMengajar>();
      data.forEach((j: any) => {
        const key = `${j.kelasId}-${j.mataPelajaranId}`;
        if (!sesiUnikMap.has(key)) {
          sesiUnikMap.set(key, {
            kelasId: j.kelasId,
            kelasNama: j.kelas.nama,
            mapelId: j.mataPelajaranId,
            mapelNama: j.mataPelajaran.nama,
            mapelKode: j.mataPelajaran.kode,
          });
        }
      });
      
      const sesi = Array.from(sesiUnikMap.values());
      setSesiList(sesi);
      
      if (sesi.length > 0) {
        setSelectedSesiIndex(0);
      }
    } catch (err: any) {
      setError(err.message || 'Gagal memuat data mengajar');
    } finally {
      setLoadingConfig(false);
    }
  };

  const fetchSiswaNilai = async (kelasId: string, mapelId: string) => {
    setLoadingSiswa(true);
    setError('');
    try {
      const res = await fetch(`/api/guru/nilai?kelasId=${kelasId}&mataPelajaranId=${mapelId}`);
      if (!res.ok) throw new Error('Gagal memuat daftar nilai siswa');
      const data: SiswaNilaiRow[] = await res.json();
      
      setSiswaNilaiRows(data);
      
      // Inisialisasi input form
      const initialInputs: Record<string, { nilai: string; keterangan: string }> = {};
      data.forEach((row) => {
        const existingGrade = row.nilai[selectedJenis];
        initialInputs[row.siswaId] = {
          nilai: existingGrade ? existingGrade.nilai.toString() : '',
          keterangan: existingGrade?.keterangan || '',
        };
      });
      setGradesInput(initialInputs);
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan saat memuat siswa');
    } finally {
      setLoadingSiswa(false);
    }
  };

  const handleGradeChange = (siswaId: string, field: 'nilai' | 'keterangan', value: string) => {
    setGradesInput((prev) => ({
      ...prev,
      [siswaId]: {
        ...prev[siswaId],
        [field]: value,
      },
    }));
  };

  const handleSave = async () => {
    if (selectedSesiIndex === -1) return;
    const sesi = sesiList[selectedSesiIndex];
    
    setSubmitting(true);
    setError('');
    setSuccess('');

    // Siapkan payload
    const payloadGrades = Object.entries(gradesInput)
      .filter(([_, data]) => data.nilai !== '') // Hanya kirim yang ada nilainya
      .map(([siswaId, data]) => ({
        siswaId,
        nilai: data.nilai,
        keterangan: data.keterangan,
      }));

    try {
      const res = await fetch('/api/guru/nilai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mataPelajaranId: sesi.mapelId,
          jenis: selectedJenis,
          grades: payloadGrades,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Gagal menyimpan nilai');
      }

      setSuccess('Nilai siswa berhasil disimpan!');
      fetchSiswaNilai(sesi.kelasId, sesi.mapelId);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan saat menyimpan');
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingConfig) {
    return (
      <div className="flex justify-center items-center py-20 flex-1">
        <RefreshCw className="animate-spin text-indigo-400" size={28} />
      </div>
    );
  }

  const currentSesi = sesiList[selectedSesiIndex];

  return (
    <div className="space-y-5 flex-1 flex flex-col">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
          <GraduationCap className="text-indigo-400" size={24} />
          Input Nilai Rapor
        </h1>
        <p className="text-xs text-slate-400 mt-1">Masukkan dan kelola nilai tugas serta ujian siswa.</p>
      </div>

      {/* Alert */}
      {success && (
        <div className="p-4 bg-emerald-950/60 border border-emerald-800 text-emerald-300 rounded-2xl text-xs font-semibold flex items-center gap-2 animate-bounce">
          <Check size={14} />
          {success}
        </div>
      )}
      {error && (
        <div className="p-4 bg-rose-950/60 border border-rose-800 text-rose-300 rounded-2xl text-xs font-semibold flex items-center gap-2">
          <AlertCircle size={14} />
          {error}
        </div>
      )}

      {/* Dropdown Pemilihan Kelas & Mapel */}
      <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-4 space-y-4">
        {sesiList.length === 0 ? (
          <div className="p-2 text-center text-slate-400 text-xs italic">
            Anda tidak terdaftar mengajar di kelas manapun.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Kelas & Mata Pelajaran</label>
              <select
                value={selectedSesiIndex}
                onChange={(e) => setSelectedSesiIndex(parseInt(e.target.value, 10))}
                className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs font-medium focus:outline-hidden focus:border-indigo-500 transition-colors"
              >
                {sesiList.map((s, idx) => (
                  <option key={idx} value={idx}>
                    {s.kelasNama} - {s.mapelNama} ({s.mapelKode})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Kategori Penilaian</label>
              <select
                value={selectedJenis}
                onChange={(e: any) => setSelectedJenis(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs font-medium focus:outline-hidden focus:border-indigo-500 transition-colors"
              >
                <option value="TUGAS">Tugas / Nilai Harian</option>
                <option value="UTS">Ujian Tengah Semester (UTS)</option>
                <option value="UAS">Ujian Akhir Semester (UAS)</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Form Input Tabel Siswa */}
      {selectedSesiIndex !== -1 && currentSesi && (
        <div className="flex-1 flex flex-col space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">
              Daftar Siswa {currentSesi.kelasNama}
            </h3>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-900 text-slate-450 border border-slate-800 font-bold">
              {siswaNilaiRows.length} Siswa
            </span>
          </div>

          {loadingSiswa ? (
            <div className="flex justify-center items-center py-20 flex-1">
              <RefreshCw className="animate-spin text-indigo-400" size={24} />
            </div>
          ) : siswaNilaiRows.length === 0 ? (
            <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-8 text-center my-auto">
              <p className="text-slate-500 text-xs italic">Tidak ada siswa terdaftar di kelas ini.</p>
            </div>
          ) : (
            <div className="flex-1 flex flex-col justify-between">
              {/* Form Scrollable Area */}
              <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl overflow-hidden overflow-y-auto max-h-[calc(100vh-360px)] pr-1">
                <div className="divide-y divide-slate-850">
                  {siswaNilaiRows.map((row) => (
                    <div
                      key={row.siswaId}
                      className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-900/10 transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-bold text-slate-350">{row.nisn}</h4>
                        <p className="text-sm font-bold text-slate-100 truncate mt-0.5">{row.nama}</p>
                      </div>

                      <div className="flex items-center gap-3 w-full sm:w-auto shrink-0">
                        {/* Input Nilai Angka */}
                        <div className="w-20 shrink-0">
                          <input
                            type="number"
                            min="0"
                            max="100"
                            placeholder="0-100"
                            value={gradesInput[row.siswaId]?.nilai ?? ''}
                            onChange={(e) => handleGradeChange(row.siswaId, 'nilai', e.target.value)}
                            className="w-full text-center px-3 py-2 bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/25 rounded-xl text-sm font-bold text-white placeholder-slate-800"
                          />
                        </div>

                        {/* Input Keterangan Singkat */}
                        <div className="flex-1 sm:w-48">
                          <input
                            type="text"
                            placeholder="Keterangan / catatan..."
                            value={gradesInput[row.siswaId]?.keterangan ?? ''}
                            onChange={(e) => handleGradeChange(row.siswaId, 'keterangan', e.target.value)}
                            className="w-full px-3 py-2 bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl text-xs text-white placeholder-slate-700"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Simpan Button Sticky */}
              <div className="pt-4 mt-auto">
                <button
                  onClick={handleSave}
                  disabled={submitting}
                  className="w-full py-3 px-4 bg-linear-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 disabled:from-indigo-500/50 disabled:to-violet-600/50 text-white rounded-2xl font-bold text-sm shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/30 transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {submitting ? (
                    <RefreshCw size={16} className="animate-spin" />
                  ) : (
                    <Save size={16} />
                  )}
                  {submitting ? 'Menyimpan Nilai...' : 'Simpan Semua Nilai'}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
