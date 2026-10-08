import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'ಲಾಗಿನ್ — ಪ್ರತಿಭಾ ಕನ್ನಡ',
};

interface LoginPageProps {
  searchParams: Promise<{ error?: string; registered?: string }>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const hasError = params.error;
  const justRegistered = params.registered;

  return (
    <div className="min-h-screen bg-white flex flex-col font-kannada">

      {/* Blobs */}
      <div className="blob blob-1 w-72 h-72 opacity-40 -top-20 -left-20 bg-orange-300 fixed" />
      <div className="blob blob-2 w-64 h-64 opacity-35 top-10 right-[-6rem] bg-pink-300 fixed" />
      <div className="blob blob-3 w-48 h-48 opacity-30 bottom-20 right-20 bg-yellow-200 fixed" />

      {/* Navbar */}
      <header className="relative z-50 border-b border-gray-100 bg-white/80 backdrop-blur-md">
        <div className="mx-auto max-w-6xl px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold kn text-orange-600">
            ಪ್ರತಿಭಾ ಕನ್ನಡ
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="text-xs sm:text-sm text-gray-500 hover:text-orange-600">
              ಸಂಪನ್ಮೂಲಗಳು
            </Link>
            <Link href="/register" className="btn-primary text-xs sm:text-sm px-4 py-1.5" id="nav-create-account">
              ಖಾತೆ ತೆರೆಯಿರಿ
            </Link>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm fade-up">

          {/* Title */}
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold kn text-gray-900 mb-1">ಸ್ವಾಗತ</h1>
            <p className="text-sm text-gray-500 kn">ನಿಮ್ಮ ಇಮೇಲ್ ಬಳಸಿ ತಕ್ಷಣ ಲಾಗಿನ್ ಮಾಡಿ</p>
          </div>

          {/* Alert messages */}
          {hasError && (
            <div className="mb-4 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs text-center font-medium">
              ಮಾನ್ಯವಾದ ಇಮೇಲ್ ವಿಳಾಸವನ್ನು ನಮೂದಿಸಿ.
            </div>
          )}
          {justRegistered && (
            <div className="mb-4 p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs text-center font-medium">
              ನೋಂದಣಿ ಯಶಸ್ವಿಯಾಗಿದೆ! ದಯವಿಟ್ಟು ಲಾಗಿನ್ ಮಾಡಿ.
            </div>
          )}

          {/* Card */}
          <div className="rounded-3xl border border-gray-100 bg-white shadow-xl shadow-gray-100 p-7 space-y-5">

            <form id="login-form" action="/api/auth/login" method="POST" className="space-y-4">

              <div>
                <label htmlFor="login-email" className="label kn">ಇಮೇಲ್ (Email)</label>
                <input
                  id="login-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="input-square"
                  placeholder="name@example.com"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label htmlFor="login-password" className="label kn mb-0">ಪಾಸ್‌ವರ್ಡ್ (Password)</label>
                </div>
                <input
                  id="login-password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  className="input-square"
                  placeholder="••••••••"
                />
                <p className="text-[11px] text-gray-400 mt-1">
                  ಪಾಸ್‌ವರ್ಡ್ ನೆನಪಿಲ್ಲದಿದ್ದರೂ ಇಮೇಲ್ ಮೂಲಕ ಮುಂದುವರಿಯಬಹುದು
                </p>
              </div>

              <button
                id="login-submit"
                type="submit"
                className="btn-brand w-full py-3 text-base mt-2"
              >
                ಲಾಗಿನ್ ಮಾಡಿ →
              </button>

            </form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-100" />
              </div>
              <div className="relative flex justify-center text-xs text-gray-400">
                <span className="bg-white px-3">ಅಥವಾ</span>
              </div>
            </div>

            <p className="text-center text-sm text-gray-500 kn">
              ಖಾತೆ ಇಲ್ಲವೇ?{' '}
              <Link href="/register" id="login-to-register" className="text-orange-600 font-semibold hover:underline">
                ಉಚಿತವಾಗಿ ನೋಂದಾಯಿಸಿ
              </Link>
            </p>

          </div>

          {/* Free note */}
          <p className="text-center text-xs text-gray-400 mt-5 kn">
            ಸಂಪೂರ್ಣ ಉಚಿತ · ಯಾವುದೇ ಶುಲ್ಕ ಇಲ್ಲ
          </p>
        </div>
      </main>

    </div>
  );
}
