import type { Metadata } from 'next';
import Link from 'next/link';
import { getAllUsers, getUserStats } from '@/lib/userStore';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { verifySessionToken } from '@/lib/security';

export const metadata: Metadata = {
  title: 'ನಿರ್ವಾಹಕ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್ — ಬಳಕೆದಾರರ ವಿವರ | Pratibha Kannada',
  description: 'ನೋಂದಾಯಿತ ವಿದ್ಯಾರ್ಥಿಗಳ ಪಟ್ಟಿ ಮತ್ತು ಅಂಕಿಅಂಶಗಳ ವಿವರ',
};

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  const cookieStore = await cookies();
  const sessionToken =
    cookieStore.get('pratibha_user')?.value ||
    cookieStore.get('pratibha_session')?.value;

  const verification = verifySessionToken(sessionToken);
  const adminEmails = (
    process.env.ADMIN_EMAILS ||
    'admin@pratibhakannada.org,vamshi@pratibhakannada.org'
  )
    .toLowerCase()
    .split(',')
    .map((e) => e.trim());

  const isAdmin =
    verification.valid &&
    verification.session &&
    (verification.session.role === 'admin' ||
      (verification.session.email &&
        adminEmails.includes(verification.session.email.toLowerCase())));

  if (!isAdmin) {
    redirect('/login?error=admin_required');
  }
  const users = getAllUsers();
  const stats = getUserStats();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      {/* Top Navbar */}
      <header className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-xl font-bold kn text-orange-600">
              ಪ್ರತಿಭಾ ಕನ್ನಡ
            </Link>
            <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-mono font-medium">
              Admin Portal
            </span>
          </div>
          <div className="flex items-center gap-3">
            <a
              href="/api/admin/users?export=csv"
              className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-4 py-2 rounded-xl transition shadow-sm"
              id="export-csv-btn"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
              </svg>
              <span>CSV ಡೌನ್‌ಲೋಡ್ (Export Users)</span>
            </a>
            <Link
              href="/dashboard"
              className="text-xs text-slate-500 hover:text-slate-900 border border-slate-200 px-3 py-1.5 rounded-lg"
            >
              ಡ್ಯಾಶ್‌ಬೋರ್ಡ್ ವೀಕ್ಷಿಸಿ →
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 sm:px-6 py-8">
        {/* Intro */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 kn">ಬಳಕೆದಾರರ ವಿವರ ಮತ್ತು ಅಂಕಿಅಂಶ</h1>
            <p className="text-sm text-slate-500 mt-1 kn">
              ನಿಮ್ಮ ವೆಬ್‌ಸೈಟ್‌ನಲ್ಲಿ ನೋಂದಾಯಿಸಿಕೊಂಡಿರುವ ಎಲ್ಲಾ ವಿದ್ಯಾರ್ಥಿಗಳ ವಿವರಗಳನ್ನು ಇಲ್ಲಿ ಪರಿಶೀಲಿಸಬಹುದು ಮತ್ತು ಡೌನ್‌ಲೋಡ್ ಮಾಡಿಕೊಳ್ಳಬಹುದು.
            </p>
          </div>
          <a
            href="/api/admin/users?export=csv"
            className="sm:hidden inline-flex items-center justify-center gap-2 bg-emerald-600 text-white text-sm font-semibold px-4 py-2.5 rounded-xl shadow-sm"
          >
            CSV ಡೌನ್‌ಲೋಡ್
          </a>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1 kn">
              ಒಟ್ಟು ವಿದ್ಯಾರ್ಥಿಗಳು
            </div>
            <div className="text-3xl font-bold text-slate-900 font-mono">
              {stats.total}
            </div>
            <div className="text-xs text-emerald-600 mt-1 flex items-center gap-1">
              <span>● ಲೈವ್ ಟ್ರ್ಯಾಕಿಂಗ್</span>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1 kn">
              10ನೇ ತರಗತಿ
            </div>
            <div className="text-3xl font-bold text-orange-600 font-mono">
              {stats.gradeCounts['10'] || 0}
            </div>
            <div className="text-xs text-slate-400 mt-1">SSLC ವಿದ್ಯಾರ್ಥಿಗಳು</div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1 kn">
              9ನೇ & 8ನೇ ತರಗತಿ
            </div>
            <div className="text-3xl font-bold text-blue-600 font-mono">
              {(stats.gradeCounts['9'] || 0) + (stats.gradeCounts['8'] || 0)}
            </div>
            <div className="text-xs text-slate-400 mt-1">ಪ್ರೌಢಶಾಲಾ ವಿದ್ಯಾರ್ಥಿಗಳು</div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1 kn">
              ಪಿ.ಯು.ಸಿ & ಇತರ
            </div>
            <div className="text-3xl font-bold text-purple-600 font-mono">
              {(stats.gradeCounts['puc'] || 0) + (stats.gradeCounts['ಇತರ'] || 0)}
            </div>
            <div className="text-xs text-slate-400 mt-1">ಉನ್ನತ ಶಿಕ್ಷಣ</div>
          </div>
        </div>

        {/* User Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 kn">
              ನೋಂದಾಯಿತ ವಿದ್ಯಾರ್ಥಿಗಳ ಪಟ್ಟಿ ({users.length})
            </h2>
            <span className="text-xs text-slate-400">
              ಹೊಸ ನೋಂದಣಿಗಳು ತಕ್ಷಣ ಇಲ್ಲಿ ದಾಖಲಾಗುತ್ತವೆ
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold uppercase tracking-wider text-slate-500">
                  <th className="py-3 px-6">ವಿದ್ಯಾರ್ಥಿ ಹೆಸರು</th>
                  <th className="py-3 px-6">ಇಮೇಲ್</th>
                  <th className="py-3 px-6">ತರಗತಿ</th>
                  <th className="py-3 px-6">ನೋಂದಣಿ ದಿನಾಂಕ</th>
                  <th className="py-3 px-6">ಕೊನೆಯ ಲಾಗಿನ್</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-400 kn">
                      ಯಾವುದೇ ವಿದ್ಯಾರ್ಥಿಗಳು ಇನ್ನೂ ನೋಂದಾಯಿಸಿಕೊಂಡಿಲ್ಲ.
                    </td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr key={user.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-6 font-medium text-slate-900 flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-orange-400 to-pink-500 text-white flex items-center justify-center font-bold text-xs">
                          {(user.name || 'S').charAt(0).toUpperCase()}
                        </div>
                        <span className="kn">{user.name}</span>
                      </td>
                      <td className="py-3.5 px-6 text-slate-600 font-mono text-xs">
                        {user.email}
                      </td>
                      <td className="py-3.5 px-6">
                        <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800 kn">
                          {user.grade ? `${user.grade}ನೇ ತರಗತಿ` : 'ಸಾಮಾನ್ಯ'}
                        </span>
                      </td>
                      <td className="py-3.5 px-6 text-slate-500 text-xs">
                        {new Date(user.registeredAt).toLocaleDateString('kn-IN', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </td>
                      <td className="py-3.5 px-6 text-slate-500 text-xs">
                        {new Date(user.lastLoginAt).toLocaleTimeString('kn-IN', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
