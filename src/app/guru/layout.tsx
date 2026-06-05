import { redirect } from 'next/navigation';
import { getAuthenticatedUser } from '@/lib/auth';
import Link from 'next/link';
import { School, Calendar, GraduationCap, BookOpen } from 'lucide-react';
import { prisma } from '@/lib/db';
import MiniLogoutButton from './MiniLogoutButton';

export default async function GuruLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getAuthenticatedUser();

  // Validasi peran guru di server
  if (!user || user.role !== 'GURU') {
    redirect('/login');
  }

  const profil = await prisma.profilSekolah.findFirst();

  return (
    <div className="flex-1 min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Top Mobile Navbar */}
      <header className="sticky top-0 z-40 bg-slate-900 border-b border-slate-800 shadow-md">
        <div className="px-4 py-3 flex items-center justify-between max-w-5xl mx-auto w-full">
          {/* Brand Logo */}
          <Link href="/guru/dashboard" className="flex items-center gap-2 select-none">
            {profil?.logoSekolahUrl ? (
              <img src={profil.logoSekolahUrl} alt="Logo" className="w-8 h-8 rounded-lg object-contain bg-slate-950/20" />
            ) : (
              <div className="w-8 h-8 rounded-lg bg-linear-to-tr from-indigo-500 to-violet-600 flex items-center justify-center font-bold text-sm text-white shrink-0">
                SK
              </div>
            )}
            <div className="overflow-hidden">
              <h2 className="font-extrabold text-xs text-white tracking-wide leading-none truncate max-w-[120px]" title={profil?.namaSekolah || 'SIAKAD GURU'}>
                {profil?.namaSekolah || 'SIAKAD GURU'}
              </h2>
              <p className="text-[8px] text-slate-500 font-semibold tracking-wider uppercase mt-0.5">Panel Absensi</p>
            </div>
          </Link>

          {/* User Sesi */}
          <div className="text-right overflow-hidden max-w-[150px] md:max-w-xs pr-2">
            <p className="text-xs font-semibold text-slate-200 truncate">
              {user.guru?.nama || user.username}
            </p>
            <p className="text-[9px] text-indigo-400 font-bold uppercase tracking-wider">
              NIP: {user.guru?.nip || '-'}
            </p>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-y-auto">
        <div className="px-4 py-6 max-w-2xl w-full mx-auto space-y-6 flex-1 flex flex-col">
          {children}
        </div>
      </main>

      {/* Footer Nav / Quick Actions (Mobile Bottom Bar) */}
      <footer className="bg-slate-900 border-t border-slate-800 py-3 px-4 sticky bottom-0 z-40">
        <div className="max-w-2xl mx-auto flex items-center justify-around gap-2 text-center">
          <Link
            href="/guru/dashboard"
            className="flex flex-col items-center gap-1 text-[10px] font-semibold text-slate-400 hover:text-indigo-400 select-none transition-colors"
          >
            <School size={18} />
            Absensi
          </Link>
          <Link
            href="/guru/jadwal"
            className="flex flex-col items-center gap-1 text-[10px] font-semibold text-slate-400 hover:text-indigo-400 select-none transition-colors"
          >
            <Calendar size={18} />
            Jadwal Ajar
          </Link>
          <Link
            href="/guru/nilai"
            className="flex flex-col items-center gap-1 text-[10px] font-semibold text-slate-400 hover:text-indigo-400 select-none transition-colors"
          >
            <GraduationCap size={18} />
            Input Nilai
          </Link>
          <Link
            href="/guru/jurnal"
            className="flex flex-col items-center gap-1 text-[10px] font-semibold text-slate-400 hover:text-indigo-400 select-none transition-colors"
          >
            <BookOpen size={18} />
            Jurnal Harian
          </Link>
          <MiniLogoutButton />
        </div>
      </footer>
    </div>
  );
}
