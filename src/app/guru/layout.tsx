import { redirect } from 'next/navigation';
import { getAuthenticatedUser } from '@/lib/auth';
import Link from 'next/link';
import { School, LogOut, Calendar, GraduationCap } from 'lucide-react';
import LogoutButton from '../admin/LogoutButton'; // Guna kembali tombol logout yang aman

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

  return (
    <div className="flex-1 min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Top Mobile Navbar */}
      <header className="sticky top-0 z-40 bg-slate-900 border-b border-slate-800 shadow-md">
        <div className="px-4 py-3 flex items-center justify-between max-w-5xl mx-auto w-full">
          {/* Brand Logo */}
          <Link href="/guru/dashboard" className="flex items-center gap-2 select-none">
            <div className="w-8 h-8 rounded-lg bg-linear-to-tr from-indigo-500 to-violet-600 flex items-center justify-center font-bold text-sm text-white">
              SK
            </div>
            <div>
              <h2 className="font-extrabold text-sm text-white tracking-wide leading-none">SIAKAD GURU</h2>
              <p className="text-[9px] text-slate-500 font-semibold tracking-wider uppercase">Panel Absensi</p>
            </div>
          </Link>

          {/* User Sesi */}
          <div className="text-right overflow-hidden max-w-[150px] md:max-w-xs pr-2">
            <p className="text-xs font-semibold text-slate-200 truncate">
              {user.guru?.nama || user.username}
            </p>
            <p className="text-[9px] text-indigo-400 font-bold uppercase tracking-wider">
              NUPTK: {user.guru?.nuptk || '-'}
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
        <div className="max-w-2xl mx-auto flex items-center justify-between gap-4">
          <Link
            href="/guru/dashboard"
            className="flex flex-col items-center gap-1 text-[10px] font-semibold text-indigo-400 select-none hover:text-indigo-300"
          >
            <School size={18} />
            Dashboard
          </Link>
          <div className="w-48 shrink-0">
            <LogoutButton />
          </div>
        </div>
      </footer>
    </div>
  );
}
