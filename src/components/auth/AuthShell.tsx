import React from 'react';
import Link from 'next/link';
import { SearchModeToggle } from '@/components/search/SearchModeToggle';
import { KannadaParticleBackground } from '@/components/background/KannadaParticleBackground';

interface AuthShellProps {
  activeTab: 'login' | 'register';
  badgeText?: string;
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footerPrompt: string;
  footerActionText: string;
  footerActionHref: string;
  footerActionId: string;
}

export function AuthShell({
  activeTab,
  badgeText = 'ಕನ್ನಡ ಕಲಿಕೆಗೆ ಉಚಿತ ಡಿಜಿಟಲ್ ವೇದಿಕೆ',
  title,
  subtitle,
  children,
  footerPrompt,
  footerActionText,
  footerActionHref,
  footerActionId,
}: AuthShellProps) {
  return (
    <div className="relative min-h-screen font-kannada text-neutral-900 overflow-x-clip selection:bg-neutral-900/10 selection:text-neutral-950 flex flex-col justify-between bg-[#fafafa]">
      {/* ─────────────────────────────────────────────────────────────
          1. LIVE ANIMATED KANNADA TYPOGRAPHY CANVAS BACKGROUND
      ───────────────────────────────────────────────────────────── */}
      <KannadaParticleBackground />

      {/* ─────────────────────────────────────────────────────────────
          2. FLOATING IPHONE GLASS NAVBAR (Neutral iOS Liquid Glass)
      ───────────────────────────────────────────────────────────── */}
      <header className="sticky top-3 sm:top-4 z-50 px-3 sm:px-6 pointer-events-none">
        <div className="mx-auto max-w-5xl liquid-glass-navbar rounded-full px-3.5 sm:px-5 py-2.5 sm:py-3 flex items-center justify-between transition-all pointer-events-auto">
          <Link href="/" className="flex items-center gap-1.5 sm:gap-2 group shrink-0">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-tr from-orange-500 to-amber-500 flex items-center justify-center text-white font-extrabold text-xs sm:text-sm shadow-sm group-hover:scale-105 transition-transform shrink-0">
              ಪ್ರ
            </div>
            <span className="text-base sm:text-lg font-bold text-neutral-900 tracking-tight kn group-hover:text-orange-600 transition-colors whitespace-nowrap">
              ಪ್ರತಿಭಾ ಕನ್ನಡ
            </span>
          </Link>

          <nav className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            <SearchModeToggle />
            <Link
              href="/dashboard"
              className="hidden sm:inline-flex text-xs sm:text-sm font-medium text-neutral-600 hover:text-neutral-900 px-3 py-1.5 rounded-full hover:bg-white/60 transition whitespace-nowrap"
            >
              ಸಂಪನ್ಮೂಲಗಳು
            </Link>
            <Link
              href="/login"
              id="nav-login"
              className={
                activeTab === 'login'
                  ? 'btn-notion-dark text-xs sm:text-sm !py-1.5 !px-3 sm:!px-4 !rounded-full whitespace-nowrap'
                  : 'text-xs sm:text-sm font-medium text-neutral-600 hover:text-neutral-900 px-2 sm:px-3 py-1.5 rounded-full hover:bg-white/60 transition whitespace-nowrap'
              }
            >
              ಲಾಗಿನ್
            </Link>
            <Link
              href="/register"
              id="nav-register"
              className={
                activeTab === 'register'
                  ? 'btn-notion-dark text-xs sm:text-sm !py-1.5 !px-3 sm:!px-4 !rounded-full whitespace-nowrap'
                  : 'text-xs sm:text-sm font-medium text-neutral-600 hover:text-neutral-900 px-2 sm:px-3 py-1.5 rounded-full hover:bg-white/60 transition whitespace-nowrap'
              }
            >
              <span className="hidden min-[380px]:inline">ಖಾತೆ ತೆರೆಯಿರಿ</span>
              <span className="min-[380px]:hidden">ನೋಂದಣಿ</span>
            </Link>
          </nav>
        </div>
      </header>

      {/* ─────────────────────────────────────────────────────────────
          3. MAIN CONTENT (Centered Elevated Frosted Glass Card)
      ───────────────────────────────────────────────────────────── */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-3.5 sm:px-6 py-6 sm:py-12">
        <div className="w-full max-w-md fade-up">
          {/* Header pill & Title */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-3.5 py-1 sm:py-1.5 rounded-full iphone-glass-pill text-[11px] sm:text-xs font-semibold text-neutral-700 mb-3 sm:mb-4 shadow-sm max-w-full">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
              <span className="truncate">{badgeText}</span>
              <span className="text-neutral-400">·</span>
              <span className="text-orange-700 font-bold shrink-0">100% Free</span>
            </div>

            <h1 className="text-[26px] sm:text-3xl font-extrabold text-neutral-950 tracking-tight kn mb-2">
              {title}
            </h1>
            <p className="text-sm sm:text-base text-neutral-600 max-w-sm mx-auto kn font-normal leading-relaxed">
              {subtitle}
            </p>
          </div>

          {/* Frosted Glass Form Card */}
          <div className="iphone-glass rounded-3xl p-5 sm:p-8 shadow-[0_16px_45px_-8px_rgba(30,20,10,0.06)] border border-white/85">
            {children}

            {/* Card Footer Divider & Alternate Action */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200/60" />
              </div>
              <div className="relative flex justify-center text-xs text-neutral-400">
                <span className="bg-white/80 px-3 rounded-full text-xs font-medium backdrop-blur-sm">
                  ಅಥವಾ
                </span>
              </div>
            </div>

            <p className="text-center text-sm sm:text-base text-neutral-600 kn">
              {footerPrompt}{' '}
              <Link
                href={footerActionHref}
                id={footerActionId}
                className="text-orange-600 hover:text-orange-700 font-bold underline-offset-2 hover:underline transition-colors"
              >
                {footerActionText}
              </Link>
            </p>
          </div>

          {/* Privacy & Free Guarantee */}
          <div className="text-center mt-6">
            <p className="text-xs text-neutral-400 kn font-medium">
              ಸಂಪೂರ್ಣ ಉಚಿತ · ಯಾವುದೇ ಜಾಹೀರಾತುಗಳಿಲ್ಲ · 100% ಮುಕ್ತ ಶಿಕ್ಷಣ
            </p>
          </div>
        </div>
      </main>

      {/* ─────────────────────────────────────────────────────────────
          4. FROSTED FOOTER (Matches Home Page)
      ───────────────────────────────────────────────────────────── */}
      <footer className="relative z-10 border-t border-slate-200/50 py-6 text-center bg-white/40 backdrop-blur-md mt-6">
        <div className="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-neutral-500">
          <p className="kn">
            © {new Date().getFullYear()} ಪ್ರತಿಭಾ ಕನ್ನಡ · ಕನ್ನಡ ಕಲಿಕೆಗೆ ಉಚಿತ ಡಿಜಿಟಲ್ ವೇದಿಕೆ
          </p>
          <div className="flex items-center gap-3 font-medium">
            <Link href="/" className="hover:text-orange-600 transition">ಮುಖಪುಟ</Link>
            <span>·</span>
            <Link href="/dashboard" className="hover:text-orange-600 transition">ಸಂಪನ್ಮೂಲಗಳು</Link>
            <span>·</span>
            <Link href="/login" className="hover:text-orange-600 transition">ಲಾಗಿನ್</Link>
            <span>·</span>
            <Link href="/register" className="hover:text-orange-600 transition">ನೋಂದಣಿ</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
