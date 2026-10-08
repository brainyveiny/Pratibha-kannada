import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'ಉಚಿತ ಖಾತೆ ತೆರೆಯಿರಿ — ಪ್ರತಿಭಾ ಕನ್ನಡ',
};

interface RegisterPageProps {
  searchParams: Promise<{ error?: string }>;
}

export default async function RegisterPage({ searchParams }: RegisterPageProps) {
  const params = await searchParams;
  const hasError = params.error;

  return (
    <div className="min-h-screen bg-white flex flex-col font-kannada">

      {/* Blobs */}
      <div className="blob blob-2 w-72 h-72 opacity-40 -top-10 right-[-6rem] bg-yellow-300 fixed" />
      <div className="blob blob-1 w-64 h-64 opacity-35 top-20 -left-16 bg-orange-300 fixed" />
      <div className="blob blob-3 w-48 h-48 opacity-25 bottom-16 left-1/2 bg-pink-200 fixed" />

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
            <Link href="/login" className="btn-outline text-xs sm:text-sm px-4 py-1.5" id="nav-login">
              ಲಾಗಿನ್
            </Link>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm fade-up">

          {/* Title */}
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold kn text-gray-900 mb-1">ಉಚಿತ ಖಾತೆ</h1>
            <p className="text-sm text-gray-500 kn">ಎಲ್ಲಾ ನೋಟ್ಸ್ ಮತ್ತು ಪ್ರಶ್ನೆ ಪತ್ರಿಕೆಗಳಿಗೆ ಉಚಿತ ಪ್ರವೇಶ</p>
          </div>

          {/* Alert messages */}
          {hasError && (
            <div className="mb-4 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs text-center font-medium">
              ದಯವಿಟ್ಟು ಸರಿಯಾದ ವಿವರಗಳನ್ನು ಭರ್ತಿ ಮಾಡಿ.
            </div>
          )}

          {/* Card */}
          <div className="rounded-3xl border border-gray-100 bg-white shadow-xl shadow-gray-100 p-7 space-y-5">

            <form id="register-form" action="/api/auth/register" method="POST" className="space-y-4">

              <div>
                <label htmlFor="register-name" className="label kn">ವಿದ್ಯಾರ್ಥಿ ಹೆಸರು (Student Name)</label>
                <input
                  id="register-name"
                  name="display_name"
                  type="text"
                  autoComplete="name"
                  required
                  className="input-square"
                  placeholder="ಉದಾ: ರಾಹುಲ್ ಕುಮಾರ್"
                />
              </div>

              <div>
                <label htmlFor="register-email" className="label kn">ಇಮೇಲ್ (Email)</label>
                <input
                  id="register-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="input-square"
                  placeholder="student@example.com"
                />
              </div>

              <div>
                <label htmlFor="register-password" className="label kn">ಪಾಸ್‌ವರ್ಡ್ (Password)</label>
                <input
                  id="register-password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  className="input-square"
                  placeholder="ಸುಲಭ ಪಾಸ್‌ವರ್ಡ್ ಆಯ್ಕೆಮಾಡಿ"
                />
              </div>

              <div>
                <label htmlFor="register-grade" className="label kn">
                  ನಿಮ್ಮ ತರಗತಿ (Class / Grade)
                </label>
                <select id="register-grade" name="grade" defaultValue="10" className="input-square">
                  <option value="10">10ನೇ ತರಗತಿ (SSLC)</option>
                  <option value="9">9ನೇ ತರಗತಿ</option>
                  <option value="8">8ನೇ ತರಗತಿ</option>
                  <option value="7">7ನೇ ತರಗತಿ</option>
                  <option value="6">6ನೇ ತರಗತಿ</option>
                  <option value="puc">ಪಿ.ಯು.ಸಿ (PUC)</option>
                </select>
              </div>

              <button
                id="register-submit"
                type="submit"
                className="btn-brand w-full py-3 text-base mt-2"
              >
                ಉಚಿತ ಖಾತೆ ತೆರೆಯಿರಿ
              </button>

            </form>

            <p className="text-center text-sm text-gray-500 kn">
              ಈಗಾಗಲೇ ಖಾತೆ ಇದೆಯೇ?{' '}
              <Link href="/login" id="register-to-login" className="text-orange-600 font-semibold hover:underline">
                ಲಾಗಿನ್ ಮಾಡಿ
              </Link>
            </p>

          </div>

          <p className="text-center text-xs text-gray-400 mt-5 kn">
            100% ಉಚಿತ · ಯಾವುದೇ ಶುಲ್ಕ ಎಂದಿಗೂ ಇರುವುದಿಲ್ಲ
          </p>
        </div>
      </main>

    </div>
  );
}
