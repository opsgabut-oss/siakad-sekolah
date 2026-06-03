import { redirect } from 'next/navigation';
import { getAuthenticatedUser } from '@/lib/auth';
import Link from 'next/link';
import { Users, GraduationCap, LayoutDashboard, LogOut, ShieldAlert } from 'lucide-react';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getAuthenticatedUser();

  // Validasi peran admin di server side
  if (!user || user.role !== 'ADMIN') {
    redirect('/login');
  }

  return (
    <div className="flex-1 min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row">
      {/* Sidebar Navigasi */}
      <aside className="w-full md:w-64 bg-slate-900 border-b md:border-b-0 md:border-r border-slate-800 flex flex-col justify-between shrink-0">
        <div>
          {/* Logo Brand */}
          <div className="p-6 border-b border-slate-800 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-linear-to-tr from-indigo-500 to-violet-600 flex items-center justify-center font-bold text-lg text-white shadow-md shadow-indigo-500/10">
              SK
            </div>
            <div>
              <h2 className="font-extrabold text-white text-md tracking-wide">SIAKAD ADMIN</h2>
              <p className="text-xs text-slate-500 font-medium">Fase 1: TU & Absensi</p>
            </div>
          </div>

          {/* Sesi User */}
          <div className="px-6 py-4 border-b border-slate-800 bg-slate-950/30 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-indigo-400">
              TU
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-semibold text-slate-200 truncate">{user.username}</p>
              <p className="text-[10px] text-emerald-400 font-semibold uppercase tracking-wider flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block animate-ping" />
                Admin TU
              </p>
            </div>
          </div>

          {/* Menu Link */}
          <nav className="p-4 space-y-1.5">
            <Link
              href="/admin/dashboard"
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800/50 transition-all duration-200"
            >
              <LayoutDashboard size={18} />
              Dashboard
            </Link>
            <Link
              href="/admin/guru"
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800/50 transition-all duration-200"
            >
              <Users size={18} />
              Data Guru
            </Link>
            <Link
              href="/admin/siswa"
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800/50 transition-all duration-200"
            >
              <GraduationCap size={18} />
              Data Siswa
            </Link>
          </nav>
        </div>

        {/* Action Logout */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/20">
          <LogoutButton />
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-y-auto">
        <div className="p-6 md:p-8 max-w-7xl w-full mx-auto space-y-8">
          {children}
        </div>
      </main>
    </div>
  );
}

// Client Component Logout Button
import ClientLogoutButton from './LogoutButton';
function LogoutButton() {
  return <ClientLogoutButton />;
}
