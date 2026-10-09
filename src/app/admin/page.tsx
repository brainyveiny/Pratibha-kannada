import type { Metadata } from 'next';
import Link from 'next/link';
import { getAllUsers, getUserStats } from '@/lib/userStore';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { verifySessionToken } from '@/lib/security';
import AdminContentManager from './AdminContentManager';

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
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-sm">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-xl font-bold kn text-orange-600">
              ಪ್ರತಿಭಾ ಕನ್ನಡ
            </Link>
            <span className="text-xs bg-orange-50 text-orange-700 border border-orange-200 px-2 py-0.5 rounded font-mono font-medium">
              Admin CMS
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="text-xs text-slate-600 hover:text-slate-900 border border-slate-200 px-3.5 py-2 rounded-xl transition hover:bg-slate-50 kn font-medium flex items-center gap-1.5"
            >
              <span>ವಿದ್ಯಾರ್ಥಿ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್ ವೀಕ್ಷಿಸಿ</span>
              <span>→</span>
            </Link>
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
