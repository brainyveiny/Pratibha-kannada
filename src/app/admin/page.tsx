import type { Metadata } from 'next';
import Link from 'next/link';
import { getAllUsers, getUserStats } from '@/lib/userStore';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { verifySessionToken } from '@/lib/security';
import AdminContentManager from './AdminContentManager';
import { SearchModeToggle } from '@/components/search/SearchModeToggle';
import { ShieldCheck, Home, BookOpen, LogOut } from 'lucide-react';

export const metadata: Metadata = {
  title: 'ನಿರ್ವಾಹಕ ಕಂಟೆಂಟ್ ಕಂಟ್ರೋಲ್ ಸೆಂಟರ್ (Admin CMS) | Pratibha Kannada',
  description: 'ಕನ್ನಡ ಶೈಕ್ಷಣಿಕ ಸಂಪನ್ಮೂಲಗಳ ನಿರ್ವಹಣೆ ಮತ್ತು ಬಳಕೆದಾರರ ವಿವರ',
};

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  const cookieStore = await cookies();
  const sessionToken =
    cookieStore.get('pratibha_user')?.value ||
    cookieStore.get('pratibha_session')?.value;

  const verification = verifySessionToken(sessionToken);
  const adminEmailsConfig = (process.env.ADMIN_EMAILS || '').trim();
  const adminEmails = adminEmailsConfig
    ? adminEmailsConfig
        .toLowerCase()
        .split(',')
        .map((e) => e.trim())
        .filter(Boolean)
    : [];

  const isAdmin = Boolean(
    verification.valid &&
      verification.session &&
      verification.session.email &&
      adminEmails.length > 0 &&
      adminEmails.includes(verification.session.email.toLowerCase())
  );

  if (!isAdmin) {
    redirect('/login?error=admin_required');
  }

  const users = getAllUsers();
  const stats = getUserStats();

  return (
    <div className="min-h-screen text-neutral-900 font-kannada relative">
      {/* Top Liquid Glass Navbar */}
      <header className="sticky top-0 z-40 liquid-glass border-b border-white/60">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-3.5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-orange-500 to-amber-500 flex items-center justify-center text-white font-extrabold text-sm shadow-xs group-hover:scale-105 transition-transform">
                ಪ್ರ
              </div>
              <span className="text-lg font-bold text-neutral-900 tracking-tight kn group-hover:text-orange-600 transition-colors">
                ಪ್ರತಿಭಾ ಕನ್ನಡ
              </span>
            </Link>
            <span className="inline-flex items-center gap-1 text-xs bg-orange-500/15 text-orange-950 border border-orange-500/25 px-2.5 py-0.5 rounded-full font-semibold shadow-xs">
              <ShieldCheck className="w-3.5 h-3.5 text-orange-600" />
              <span>Admin Console</span>
            </span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <SearchModeToggle />

            {/* Seamless navigation to public site */}
            <Link
              href="/"
              className="text-xs text-neutral-700 hover:text-neutral-950 liquid-glass-pill px-3 py-1.5 rounded-xl transition font-medium hidden md:inline-flex items-center gap-1.5"
              title="ಸಾರ್ವಜನಿಕ ಮುಖಪುಟಕ್ಕೆ ಹೋಗಿ"
            >
              <Home className="w-3.5 h-3.5 text-neutral-500" />
              <span>ಮುಖಪುಟ</span>
            </Link>

            <Link
              href="/dashboard"
              className="text-xs text-neutral-800 hover:text-orange-700 liquid-glass-pill px-3 py-1.5 rounded-xl transition font-medium flex items-center gap-1.5"
              title="ವಿದ್ಯಾರ್ಥಿ ಕಲಿಕಾ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್‌ಗೆ ಹೋಗಿ"
            >
              <BookOpen className="w-3.5 h-3.5 text-orange-600" />
              <span className="hidden sm:inline">ವಿದ್ಯಾರ್ಥಿ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್</span>
              <span className="sm:hidden">ಡ್ಯಾಶ್‌ಬೋರ್ಡ್</span>
            </Link>

            {/* Direct Logout */}
            <form action="/api/auth/logout" method="POST">
              <button
                type="submit"
                className="text-xs text-red-600 hover:text-red-700 hover:bg-red-50 border border-red-200/60 px-3 py-1.5 rounded-xl transition font-medium flex items-center gap-1"
                title="ನಿರ್ವಾಹಕ ಸೆಷನ್‌ನಿಂದ ಲಾಗ್ ಔಟ್ ಮಾಡಿ"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">ಲಾಗ್ ಔಟ್</span>
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 sm:px-6 py-8">
        {/* Intro */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900 kn">
            ಕಂಟೆಂಟ್ ಕಂಟ್ರೋಲ್ ಸೆಂಟರ್ (Content Management System)
          </h1>
          <p className="text-sm text-slate-500 mt-1 kn">
            ನಿಮ್ಮ ವೆಬ್‌ಸೈಟ್‌ನ ತರಗತಿಗಳು, ನೋಟ್ಸ್, ಪ್ರಶ್ನೆ ಪತ್ರಿಕೆಗಳು ಮತ್ತು ಬಳಕೆದಾರರನ್ನು ಇಲ್ಲಿ ಸುಲಭವಾಗಿ ನಿರ್ವಹಿಸಿ.
          </p>
        </div>

        {/* Content Manager Client Component */}
        <AdminContentManager initialUsers={users} initialStats={stats} />
      </main>
    </div>
  );
}
