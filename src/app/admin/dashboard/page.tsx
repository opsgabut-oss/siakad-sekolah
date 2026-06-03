import { prisma } from '@/lib/db';
import Link from 'next/link';
import { Users, GraduationCap, School, BookOpen, ChevronRight, Calendar } from 'lucide-react';

export const revalidate = 0; // Disable caching to ensure real-time data

export default async function AdminDashboardPage() {
  // Fetch stats directly in server component
  const guruCount = await prisma.guru.count();
  const siswaCount = await prisma.siswa.count();
  const kelasCount = await prisma.kelas.count();
  const activeYear = await prisma.tahunAjaran.findFirst({
    where: { aktif: true }
  });

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Selamat Datang di SIAKAD</h1>
        <p className="text-slate-400 mt-2 text-sm md:text-base">
          Kelola data guru, data siswa, dan pantau administrasi sekolah dengan mudah dari dashboard Tata Usaha.
        </p>
      </div>

      {/* Grid Status / Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Card Guru */}
        <div className="relative overflow-hidden bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl transition-all duration-300 hover:border-slate-700/50 group">
          <div className="absolute -top-10 -right-10 w-24 h-24 rounded-full bg-indigo-500/10 blur-xl group-hover:bg-indigo-500/20 transition-all duration-300" />
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center font-bold">
              <Users size={24} />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Guru</p>
              <h3 className="text-3xl font-extrabold text-white mt-1">{guruCount}</h3>
            </div>
          </div>
          <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between">
            <Link href="/admin/guru" className="text-xs text-indigo-400 font-semibold hover:text-indigo-300 flex items-center gap-1 select-none">
              Kelola Guru <ChevronRight size={14} />
            </Link>
          </div>
        </div>

        {/* Card Siswa */}
        <div className="relative overflow-hidden bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl transition-all duration-300 hover:border-slate-700/50 group">
          <div className="absolute -top-10 -right-10 w-24 h-24 rounded-full bg-violet-500/10 blur-xl group-hover:bg-violet-500/20 transition-all duration-300" />
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-violet-500/10 text-violet-400 flex items-center justify-center font-bold">
              <GraduationCap size={24} />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Siswa</p>
              <h3 className="text-3xl font-extrabold text-white mt-1">{siswaCount}</h3>
            </div>
          </div>
          <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between">
            <Link href="/admin/siswa" className="text-xs text-violet-400 font-semibold hover:text-violet-300 flex items-center gap-1 select-none">
              Kelola Siswa <ChevronRight size={14} />
            </Link>
          </div>
        </div>

        {/* Card Kelas */}
        <div className="relative overflow-hidden bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl transition-all duration-300 hover:border-slate-700/50 group">
          <div className="absolute -top-10 -right-10 w-24 h-24 rounded-full bg-emerald-500/10 blur-xl group-hover:bg-emerald-500/20 transition-all duration-300" />
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold">
              <School size={24} />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Kelas</p>
              <h3 className="text-3xl font-extrabold text-white mt-1">{kelasCount}</h3>
            </div>
          </div>
          <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between">
            <p className="text-xs text-slate-500 font-medium">Tahun Ajaran Aktif:</p>
            <span className="bg-emerald-950/40 border border-emerald-800/60 text-emerald-300 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide flex items-center gap-1">
              <Calendar size={10} />
              {activeYear ? activeYear.tahun : 'Belum Ada'}
            </span>
          </div>
        </div>

      </div>

      {/* Info Card Tambahan */}
      <div className="bg-linear-to-r from-slate-900 via-slate-900 to-slate-950 border border-slate-800 rounded-3xl p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
        <div className="space-y-2">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <BookOpen className="text-indigo-400" size={22} />
            Fase 1 SIAKAD: Absensi Digital
          </h2>
          <p className="text-slate-400 text-sm max-w-2xl leading-relaxed">
            Pada fase ini, Guru dapat melakukan absensi secara mobile-friendly dari perangkat smartphone mereka. 
            Pastikan data Guru memiliki NUPTK yang valid dan Siswa memiliki NISN yang terhubung ke kelas aktif agar 
            dapat diabsen hari ini.
          </p>
        </div>
        <div className="flex flex-wrap gap-3 shrink-0">
          <Link
            href="/admin/siswa"
            className="px-5 py-3 bg-linear-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white rounded-2xl text-xs font-semibold shadow-lg shadow-indigo-500/10 hover:shadow-indigo-500/20 transition-all duration-200 block text-center"
          >
            Import Data Siswa (CSV)
          </Link>
        </div>
      </div>
    </div>
  );
}
