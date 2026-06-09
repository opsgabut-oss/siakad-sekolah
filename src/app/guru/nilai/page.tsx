'use client';

import { useState, useEffect } from 'react';
import { GraduationCap, Save, RefreshCw, AlertCircle, Check, BookOpen, Plus, Trash2, Printer, CheckSquare } from 'lucide-react';

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
  harian1: number | null;
  harian2: number | null;
  harian3: number | null;
  harian4: number | null;
  harian5: number | null;
  harian6: number | null;
  uts: number | null;
  uas: number | null;
  rapor: number | null;
}

export default function InputNilaiPage() {
  const [activeTab, setActiveTab] = useState<'nilai' | 'tp' | 'capaian'>('nilai');
  const [sesiList, setSesiList] = useState<SesiMengajar[]>([]);
  const [selectedSesiIndex, setSelectedSesiIndex] = useState(-1);
  
  // Tab Nilai States
  const [siswaNilaiRows, setSiswaNilaiRows] = useState<SiswaNilaiRow[]>([]);
  const [kktpSubject, setKktpSubject] = useState(70);
  const [gradesInput, setGradesInput] = useState<Record<string, {
    harian1: string;
    harian2: string;
    harian3: string;
    harian4: string;
    harian5: string;
    harian6: string;
    uts: string;
    uas: string;
  }>>({});
  
  // Tab TP (Prota) States
  const [tpList, setTpList] = useState<any[]>([]);
  const [newTp, setNewTp] = useState({
    deskripsi: '',
    alokasiJP: '4',
    semester: '1',
    kktp: '70'
  });
  const [savingTp, setSavingTp] = useState(false);
  const [loadingTp, setLoadingTp] = useState(false);

  // Tab Capaian TP States
  const [capaianData, setCapaianData] = useState<{ tps: any[]; students: any[] } | null>(null);
  const [capaianChecklist, setCapaianChecklist] = useState<Record<string, Record<string, boolean>>>({});
  const [savingCapaian, setSavingCapaian] = useState(false);

  // Common Loading & Status States
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
      setError('');
      setSuccess('');
      if (activeTab === 'nilai') {
        fetchSiswaNilai(sesi.kelasId, sesi.mapelId);
      } else if (activeTab === 'tp') {
        fetchTps(sesi.mapelId);
      } else if (activeTab === 'capaian') {
        fetchCapaian(sesi.kelasId, sesi.mapelId);
      }
    } else {
      setSiswaNilaiRows([]);
      setGradesInput({});
      setTpList([]);
      setCapaianData(null);
      setCapaianChecklist({});
    }
  }, [selectedSesiIndex, activeTab]);

  const fetchSesiMengajar = async () => {
    setLoadingConfig(true);
    try {
      const res = await fetch('/api/admin/jadwal?my=true');
      if (!res.ok) throw new Error('Gagal memuat jadwal ajar');
      const data = await res.json();
      
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
      
      const initialInputs: Record<string, any> = {};
      data.forEach((row) => {
        initialInputs[row.siswaId] = {
          harian1: row.harian1 !== null ? row.harian1.toString() : '',
          harian2: row.harian2 !== null ? row.harian2.toString() : '',
          harian3: row.harian3 !== null ? row.harian3.toString() : '',
          harian4: row.harian4 !== null ? row.harian4.toString() : '',
          harian5: row.harian5 !== null ? row.harian5.toString() : '',
          harian6: row.harian6 !== null ? row.harian6.toString() : '',
          uts: row.uts !== null ? row.uts.toString() : '',
          uas: row.uas !== null ? row.uas.toString() : '',
        };
      });
      setGradesInput(initialInputs);

      // Tarik juga Tujuan Pembelajaran untuk menentukan rata-rata KKTP default jika ada
      const resTps = await fetch(`/api/guru/tujuan-pembelajaran?mataPelajaranId=${mapelId}`);
      if (resTps.ok) {
        const tps = await resTps.json();
        if (tps.length > 0) {
          const avgKktp = Math.round(tps.reduce((sum: number, t: any) => sum + t.kktp, 0) / tps.length);
          setKktpSubject(avgKktp);
        }
      }
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan saat memuat siswa');
    } finally {
      setLoadingSiswa(false);
    }
  };

  const fetchTps = async (mapelId: string) => {
    setLoadingTp(true);
    setError('');
    try {
      const res = await fetch(`/api/guru/tujuan-pembelajaran?mataPelajaranId=${mapelId}`);
      if (!res.ok) throw new Error('Gagal memuat Tujuan Pembelajaran');
      const data = await res.json();
      setTpList(data);
    } catch (err: any) {
      setError(err.message || 'Gagal memuat Tujuan Pembelajaran');
    } finally {
      setLoadingTp(false);
    }
  };

  const fetchCapaian = async (kelasId: string, mapelId: string) => {
    setLoadingSiswa(true);
    setError('');
    try {
      const res = await fetch(`/api/guru/capaian-tp?kelasId=${kelasId}&mataPelajaranId=${mapelId}`);
      if (!res.ok) throw new Error('Gagal memuat Capaian TP');
      const data = await res.json();
      setCapaianData(data);
      
      const initialChecklist: Record<string, Record<string, boolean>> = {};
      data.students.forEach((student: any) => {
        initialChecklist[student.siswaId] = {};
        student.capaian.forEach((c: any) => {
          initialChecklist[student.siswaId][c.tujuanPembelajaranId] = c.tercapai;
        });
      });
      setCapaianChecklist(initialChecklist);
    } catch (err: any) {
      setError(err.message || 'Gagal memuat Capaian TP');
    } finally {
      setLoadingSiswa(false);
    }
  };

  const handleGradeChange = (siswaId: string, field: string, value: string) => {
    if (value !== '') {
      const num = parseInt(value, 10);
      if (isNaN(num) || num < 0 || num > 100) return;
    }

    setGradesInput((prev) => {
      const studentInput = {
        ...prev[siswaId],
        [field]: value,
      };

      const harianKeys = ['harian1', 'harian2', 'harian3', 'harian4', 'harian5', 'harian6'];
      const harianVals = harianKeys
        .map(k => studentInput[k as keyof typeof studentInput])
        .filter(v => v !== '')
        .map(v => parseInt(v, 10));
      
      const avgHarian = harianVals.length > 0 
        ? harianVals.reduce((sum, v) => sum + v, 0) / harianVals.length 
        : null;

      const components: number[] = [];
      if (avgHarian !== null) components.push(avgHarian);
      
      const utsVal = studentInput.uts;
      if (utsVal !== '') components.push(parseInt(utsVal, 10));

      const uasVal = studentInput.uas;
      if (uasVal !== '') components.push(parseInt(uasVal, 10));

      const computedRapor = components.length > 0 
        ? Math.round(components.reduce((sum, v) => sum + v, 0) / components.length)
        : null;

      setSiswaNilaiRows((currentRows) => 
        currentRows.map((row) => 
          row.siswaId === siswaId 
            ? { ...row, rapor: computedRapor } 
            : row
        )
      );

      return {
        ...prev,
        [siswaId]: studentInput,
      };
    });
  };

  const handleSaveGrades = async () => {
    if (selectedSesiIndex === -1) return;
    const sesi = sesiList[selectedSesiIndex];
    
    setSubmitting(true);
    setError('');
    setSuccess('');

    const payloadGrades = Object.entries(gradesInput).map(([siswaId, data]) => ({
      siswaId,
      harian1: data.harian1,
      harian2: data.harian2,
      harian3: data.harian3,
      harian4: data.harian4,
      harian5: data.harian5,
      harian6: data.harian6,
      uts: data.uts,
      uas: data.uas,
    }));

    try {
      const res = await fetch('/api/guru/nilai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mataPelajaranId: sesi.mapelId,
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

  const handleAddTp = async () => {
    if (selectedSesiIndex === -1) return;
    const sesi = sesiList[selectedSesiIndex];
    if (!newTp.deskripsi.trim()) return;

    setSavingTp(true);
    setError('');
    setSuccess('');
    try {
      const res = await fetch('/api/guru/tujuan-pembelajaran', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mataPelajaranId: sesi.mapelId,
          deskripsi: newTp.deskripsi,
          kktp: newTp.kktp,
          alokasiJP: newTp.alokasiJP,
          semester: newTp.semester
        })
      });
      if (!res.ok) throw new Error('Gagal menyimpan Tujuan Pembelajaran');
      setSuccess('Tujuan Pembelajaran berhasil ditambahkan!');
      setNewTp({ deskripsi: '', alokasiJP: '4', semester: '1', kktp: '70' });
      fetchTps(sesi.mapelId);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.message || 'Gagal menyimpan Tujuan Pembelajaran');
    } finally {
      setSavingTp(false);
    }
  };

  const handleDeleteTp = async (id: string) => {
    if (selectedSesiIndex === -1) return;
    const sesi = sesiList[selectedSesiIndex];
    if (!confirm('Apakah Anda yakin ingin menghapus Tujuan Pembelajaran ini?')) return;

    setError('');
    setSuccess('');
    try {
      const res = await fetch(`/api/guru/tujuan-pembelajaran?id=${id}`, {
        method: 'DELETE'
      });
      if (!res.ok) throw new Error('Gagal menghapus Tujuan Pembelajaran');
      setSuccess('Tujuan Pembelajaran berhasil dihapus!');
      fetchTps(sesi.mapelId);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.message || 'Gagal menghapus Tujuan Pembelajaran');
    }
  };

  const handleCapaianChecklistChange = (siswaId: string, tpId: string, val: boolean) => {
    setCapaianChecklist((prev) => ({
      ...prev,
      [siswaId]: {
        ...prev[siswaId],
        [tpId]: val
      }
    }));
  };

  const handleSaveCapaian = async () => {
    if (selectedSesiIndex === -1) return;
    const sesi = sesiList[selectedSesiIndex];
    setSavingCapaian(true);
    setError('');
    setSuccess('');

    const achievements: any[] = [];
    Object.entries(capaianChecklist).forEach(([siswaId, tpMap]) => {
      Object.entries(tpMap).forEach(([tujuanPembelajaranId, tercapai]) => {
        achievements.push({
          siswaId,
          tujuanPembelajaranId,
          tercapai
        });
      });
    });

    try {
      const res = await fetch('/api/guru/capaian-tp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ achievements })
      });
      if (!res.ok) throw new Error('Gagal menyimpan Capaian TP');
      setSuccess('Capaian TP siswa berhasil disimpan!');
      fetchCapaian(sesi.kelasId, sesi.mapelId);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.message || 'Gagal menyimpan Capaian TP');
    } finally {
      setSavingCapaian(false);
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-2">
            <GraduationCap className="text-indigo-400" size={28} />
            Administrasi Penilaian Siswa
          </h1>
          <p className="text-xs text-slate-400 mt-1">Kelola Tujuan Pembelajaran (Prota), Capaian Belajar, dan Nilai Rapor Kurikulum Merdeka.</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-800/80 bg-slate-950/20 p-1.5 rounded-2xl gap-2 w-full max-w-lg">
        <button
          onClick={() => setActiveTab('nilai')}
          className={`flex-1 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all ${
            activeTab === 'nilai' ? 'bg-slate-800 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Input Nilai
        </button>
        <button
          onClick={() => setActiveTab('tp')}
          className={`flex-1 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all ${
            activeTab === 'tp' ? 'bg-slate-800 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Tujuan Pembelajaran (Prota)
        </button>
        <button
          onClick={() => setActiveTab('capaian')}
          className={`flex-1 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all ${
            activeTab === 'capaian' ? 'bg-slate-800 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Ketercapaian TP Siswa
        </button>
      </div>

      {/* Alert Status */}
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
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Pilih Kelas & Mata Pelajaran Yang Diampu</label>
            <select
              value={selectedSesiIndex}
              onChange={(e) => setSelectedSesiIndex(parseInt(e.target.value, 10))}
              className="w-full px-3 py-2.5 bg-slate-955 border border-slate-800 rounded-xl text-white text-xs font-medium focus:outline-hidden focus:border-indigo-500 transition-colors"
            >
              {sesiList.map((s, idx) => (
                <option key={idx} value={idx}>
                  {s.kelasNama} - {s.mapelNama} ({s.mapelKode})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {selectedSesiIndex !== -1 && currentSesi && (
        <div className="flex-1 flex flex-col space-y-4">
          
          {/* TAB 1: INPUT NILAI */}
          {activeTab === 'nilai' && (
            <div className="flex-1 flex flex-col space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">
                  Daftar Nilai {currentSesi.kelasNama}
                </h3>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5 text-xs text-slate-400">
                    <span>KKTP Penentu Merah:</span>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={kktpSubject}
                      onChange={(e) => setKktpSubject(parseInt(e.target.value, 10) || 70)}
                      className="w-12 px-1.5 py-0.5 bg-slate-950 border border-slate-800 rounded-md text-center text-white font-bold"
                    />
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-900 text-slate-450 border border-slate-800 font-bold">
                    {siswaNilaiRows.length} Siswa
                  </span>
                </div>
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
                  <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl overflow-hidden overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[700px]">
                      <thead>
                        <tr className="border-b border-slate-800 bg-slate-950/40 text-slate-400 text-[10px] font-bold uppercase tracking-wider">
                          <th className="p-3">Nama Siswa</th>
                          {['Harian 1', 'Harian 2', 'Harian 3', 'Harian 4', 'Harian 5', 'Harian 6', 'UTS', 'UAS'].map((h) => (
                            <th key={h} className="p-3 text-center">{h}</th>
                          ))}
                          <th className="p-3 text-right bg-indigo-950/10 text-indigo-400">Nilai Rapor</th>
                          <th className="p-3 text-center w-24">Cetak Rapor</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-850">
                        {siswaNilaiRows.map((row) => {
                          const studentGrades = gradesInput[row.siswaId] || {
                            harian1: '', harian2: '', harian3: '', harian4: '', harian5: '', harian6: '', uts: '', uas: ''
                          };
                          const isUnderKktp = row.rapor !== null && row.rapor < kktpSubject;
                          return (
                            <tr key={row.siswaId} className="hover:bg-slate-900/10 transition-colors">
                              <td className="p-3">
                                <h4 className="text-[10px] font-bold text-slate-500">{row.nisn}</h4>
                                <p className="text-xs font-bold text-slate-200 truncate">{row.nama}</p>
                              </td>
                              {['harian1', 'harian2', 'harian3', 'harian4', 'harian5', 'harian6', 'uts', 'uas'].map((field) => (
                                <td key={field} className="p-2 text-center">
                                  <input
                                    type="number"
                                    min="0"
                                    max="100"
                                    placeholder="-"
                                    value={studentGrades[field as keyof typeof studentGrades] ?? ''}
                                    onChange={(e) => handleGradeChange(row.siswaId, field, e.target.value)}
                                    className="w-12 px-1 py-1.5 bg-slate-955 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/25 rounded-xl text-center text-xs font-bold text-white placeholder-slate-800 focus:outline-hidden"
                                  />
                                </td>
                              ))}
                              <td className={`p-3 text-right font-extrabold text-xs ${isUnderKktp ? 'text-rose-500 bg-rose-500/5' : 'text-indigo-350 bg-indigo-950/5'}`}>
                                {row.rapor !== null ? row.rapor : '-'}
                              </td>
                              <td className="p-2 text-center border-l border-slate-850/60 bg-indigo-950/5">
                                <a
                                  href={`/guru/cetak-rapor?kelasId=${currentSesi.kelasId}&siswaId=${row.siswaId}`}
                                  target="_blank"
                                  className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-slate-850 hover:bg-slate-800 text-slate-200 border border-slate-800 rounded-xl text-[10px] font-bold transition-all shadow-sm"
                                >
                                  <Printer size={11} /> Rapor
                                </a>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  <div className="pt-4 mt-auto">
                    <button
                      onClick={handleSaveGrades}
                      disabled={submitting}
                      className="w-full py-3 px-4 bg-linear-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 disabled:from-indigo-500/50 disabled:to-violet-600/50 text-white rounded-2xl font-bold text-sm shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/30 transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      {submitting ? <RefreshCw size={16} className="animate-spin" /> : <Save size={16} />}
                      {submitting ? 'Menyimpan Nilai...' : 'Simpan Semua Nilai'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: TUJUAN PEMBELAJARAN (PROTA) */}
          {activeTab === 'tp' && (
            <div className="flex-1 flex flex-col space-y-6">
              {/* Form Input TP */}
              <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-5 space-y-4">
                <h3 className="text-xs font-extrabold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <BookOpen size={15} className="text-indigo-400" /> Tambah Tujuan Pembelajaran Baru
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="md:col-span-2 space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Deskripsi Tujuan Pembelajaran</label>
                    <input
                      type="text"
                      placeholder="Contoh: Membaca dan menulis bilangan cacah..."
                      value={newTp.deskripsi}
                      onChange={(e) => setNewTp({ ...newTp, deskripsi: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs placeholder-slate-700 focus:outline-hidden focus:border-indigo-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Semester</label>
                    <select
                      value={newTp.semester}
                      onChange={(e) => setNewTp({ ...newTp, semester: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:outline-hidden"
                    >
                      <option value="1">Semester I (Ganjil)</option>
                      <option value="2">Semester II (Genap)</option>
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase">JP</label>
                      <input
                        type="number"
                        min="1"
                        value={newTp.alokasiJP}
                        onChange={(e) => setNewTp({ ...newTp, alokasiJP: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-center text-xs focus:outline-hidden"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase">KKTP</label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={newTp.kktp}
                        onChange={(e) => setNewTp({ ...newTp, kktp: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-center text-xs focus:outline-hidden"
                      />
                    </div>
                  </div>
                </div>
                <div className="flex justify-end">
                  <button
                    onClick={handleAddTp}
                    disabled={savingTp || !newTp.deskripsi.trim()}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-600/50 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    {savingTp ? <RefreshCw size={14} className="animate-spin" /> : <Plus size={14} />}
                    Tambah ke Program Tahunan (Prota)
                  </button>
                </div>
              </div>

              {/* List TP & Cetak Prota */}
              <div className="space-y-3 flex-1 flex flex-col">
                <div className="flex justify-between items-center">
                  <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">
                    Daftar TP (Program Tahunan)
                  </h3>
                  {tpList.length > 0 && (
                    <a
                      href={`/guru/cetak-prota?kelasId=${currentSesi.kelasId}&mapelId=${currentSesi.mapelId}`}
                      target="_blank"
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold transition-all shadow-md"
                    >
                      <Printer size={13} /> Cetak Lembar Prota
                    </a>
                  )}
                </div>

                {loadingTp ? (
                  <div className="flex justify-center items-center py-12 flex-1">
                    <RefreshCw className="animate-spin text-indigo-400" size={24} />
                  </div>
                ) : tpList.length === 0 ? (
                  <div className="bg-slate-900/30 border border-slate-800/60 rounded-2xl p-10 text-center text-slate-500 text-xs italic">
                    Belum ada Tujuan Pembelajaran yang ditambahkan untuk mata pelajaran ini.
                  </div>
                ) : (
                  <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl overflow-hidden">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-slate-800 bg-slate-950/40 text-slate-400 text-[10px] font-bold uppercase tracking-wider">
                          <th className="p-3 text-center w-12">No</th>
                          <th className="p-3">Deskripsi Tujuan Pembelajaran</th>
                          <th className="p-3 text-center w-36">Semester</th>
                          <th className="p-3 text-center w-20">Alokasi</th>
                          <th className="p-3 text-center w-20">KKTP</th>
                          <th className="p-3 text-center w-16">Aksi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-850 text-xs">
                        {tpList.map((tp, idx) => (
                          <tr key={tp.id} className="hover:bg-slate-900/10">
                            <td className="p-3 text-center text-slate-500 font-bold">{idx + 1}</td>
                            <td className="p-3 text-slate-200 font-semibold">{tp.deskripsi}</td>
                            <td className="p-3 text-center">
                              <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold border ${
                                tp.semester === 1 
                                  ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' 
                                  : 'bg-teal-500/10 text-teal-400 border-teal-500/20'
                              }`}>
                                {tp.semester === 1 ? 'Semester I (Ganjil)' : 'Semester II (Genap)'}
                              </span>
                            </td>
                            <td className="p-3 text-center font-bold text-slate-350">{tp.alokasiJP} JP</td>
                            <td className="p-3 text-center font-extrabold text-indigo-400">{tp.kktp}</td>
                            <td className="p-3 text-center">
                              <button
                                onClick={() => handleDeleteTp(tp.id)}
                                className="p-1.5 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-450 rounded-lg transition-colors cursor-pointer"
                              >
                                <Trash2 size={13} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: KETERCAPAIAN TP */}
          {activeTab === 'capaian' && (
            <div className="flex-1 flex flex-col space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">
                  Daftar Ketercapaian TP {currentSesi.kelasNama}
                </h3>
              </div>

              {loadingSiswa ? (
                <div className="flex justify-center items-center py-20 flex-1">
                  <RefreshCw className="animate-spin text-indigo-400" size={24} />
                </div>
              ) : !capaianData || capaianData.tps.length === 0 ? (
                <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-10 text-center">
                  <AlertCircle size={28} className="mx-auto text-slate-600 mb-2" />
                  <p className="text-slate-400 text-xs italic font-medium">
                    Belum ada Tujuan Pembelajaran yang diinput. Isi tab "Tujuan Pembelajaran" terlebih dahulu.
                  </p>
                </div>
              ) : (
                <div className="flex-1 flex flex-col justify-between">
                  <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl overflow-hidden overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[700px]">
                      <thead>
                        <tr className="border-b border-slate-800 bg-slate-950/40 text-slate-400 text-[9px] font-bold uppercase tracking-wider">
                          <th className="p-3 w-48">Nama Siswa</th>
                          {capaianData.tps.map((tp, idx) => (
                            <th key={tp.id} className="p-3 text-center text-[8px] font-semibold border-l border-slate-850" title={tp.deskripsi}>
                              <div className="truncate w-32 mx-auto">TP {idx + 1} ({tp.semester === 1 ? 'S1' : 'S2'})</div>
                              <div className="text-[7px] text-slate-500 font-normal mt-0.5 truncate w-32 mx-auto">{tp.deskripsi}</div>
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-850">
                        {capaianData.students.map((student) => (
                          <tr key={student.siswaId} className="hover:bg-slate-900/10">
                            <td className="p-3">
                              <h4 className="text-[9px] font-bold text-slate-500">{student.nisn}</h4>
                              <p className="text-xs font-bold text-slate-200 truncate">{student.nama}</p>
                            </td>
                            {capaianData.tps.map((tp) => {
                              const checked = capaianChecklist[student.siswaId]?.[tp.id] ?? true;
                              return (
                                <td key={tp.id} className="p-2 text-center border-l border-slate-850/60">
                                  <label className="inline-flex items-center justify-center p-1.5 cursor-pointer rounded-lg hover:bg-slate-800 transition-colors">
                                    <input
                                      type="checkbox"
                                      checked={checked}
                                      onChange={(e) => handleCapaianChecklistChange(student.siswaId, tp.id, e.target.checked)}
                                      className="sr-only peer"
                                    />
                                    <div className="w-5 h-5 border border-slate-800 peer-checked:border-indigo-500 rounded-md flex items-center justify-center peer-checked:bg-indigo-650 transition-all">
                                      {checked && <CheckSquare size={13} className="text-white" />}
                                    </div>
                                    <span className="ml-1.5 text-[10px] font-bold select-none text-slate-400 peer-checked:text-indigo-400">
                                      {checked ? 'Tercapai' : 'Bimbingan'}
                                    </span>
                                  </label>
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="pt-4 mt-auto">
                    <button
                      onClick={handleSaveCapaian}
                      disabled={savingCapaian}
                      className="w-full py-3 px-4 bg-linear-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 disabled:from-indigo-500/50 disabled:to-violet-600/50 text-white rounded-2xl font-bold text-sm shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/30 transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      {savingCapaian ? <RefreshCw size={16} className="animate-spin" /> : <Save size={16} />}
                      {savingCapaian ? 'Menyimpan Capaian...' : 'Simpan Capaian Pembelajaran Siswa'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
          
        </div>
      )}
    </div>
  );
}
