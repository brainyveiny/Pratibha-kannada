import type { Metadata } from 'next';
import Link from 'next/link';
import { cookies } from 'next/headers';
import { SearchModeToggle } from '@/components/search/SearchModeToggle';
import { HomeSearchForm } from '@/components/search/HomeSearchForm';

export const metadata: Metadata = {
  title: 'ಪ್ರತಿಭಾ ಕನ್ನಡ — ಕನ್ನಡ ಕಲಿಕೆಗೆ ಉಚಿತ ಡಿಜಿಟಲ್ ವೇದಿಕೆ',
  description:
    'ಕನ್ನಡ ವಿದ್ಯಾರ್ಥಿಗಳಿಗಾಗಿ ಉಚಿತ ಡಿಜಿಟಲ್ ಕಲಿಕಾ ವೇದಿಕೆ. ನೋಟ್ಸ್, ವ್ಯಾಕರಣ, ಪ್ರಶ್ನೆ ಪತ್ರಿಕೆ ಮತ್ತು ಸಂಪನ್ಮೂಲಗಳು.',
  keywords: ['ಕನ್ನಡ', 'ಕಲಿಕೆ', 'ನೋಟ್ಸ್', 'ಪ್ರಶ್ನೆ ಪತ್ರಿಕೆ', 'SSLC', 'Kannada education', '10th class'],
};

const CATEGORIES = [
  { label: 'ನೋಟ್ಸ್',                 sub: 'Notes & Summary',      href: '/dashboard?cat=notes',           code: 'N' },
  { label: 'ವ್ಯಾಕರಣ',                sub: 'Grammar Guide',        href: '/dashboard?cat=grammar',         code: 'G' },
  { label: 'ಪ್ರಶ್ನೆ ಪತ್ರಿಕೆ',        sub: 'Model Papers',         href: '/dashboard?cat=question-papers', code: 'Q' },
  { label: 'ಹಿಂದಿನ ಪ್ರಶ್ನೆ ಪತ್ರಿಕೆ', sub: 'Previous Exam Papers', href: '/dashboard?cat=previous-year',   code: 'P' },
  { label: 'ಪ್ರಶ್ನೋತ್ತರ',            sub: 'Questions & Answers',  href: '/dashboard?cat=qa',              code: 'A' },
  { label: 'ಪ್ರಬಂಧ & ಗಾದೆ',          sub: 'Essays & Expansions',  href: '/dashboard?cat=essay',           code: 'E' },
  { label: 'ಕವಿ ಪರಿಚಯ',             sub: 'Authors & Poets',      href: '/dashboard?cat=poets',           code: 'K' },
  { label: 'ಅಭ್ಯಾಸ ಪರೀಕ್ಷೆ',         sub: 'Practice Worksheets',  href: '/dashboard?cat=practice',        code: 'W' },
];

const CLASSES = [
  { label: '10ನೇ ತರಗತಿ', sub: 'SSLC Board', href: '/dashboard?class=10' },
  { label: '9ನೇ ತರಗತಿ',  sub: 'High School', href: '/dashboard?class=9' },
  { label: '8ನೇ ತರಗತಿ',  sub: 'High School', href: '/dashboard?class=8' },
  { label: '7ನೇ ತರಗತಿ',  sub: 'Middle School', href: '/dashboard?class=7' },
  { label: '6ನೇ ತರಗತಿ',  sub: 'Middle School', href: '/dashboard?class=6' },
  { label: 'ಪಿ.ಯು.ಸಿ',    sub: 'PUC I & II', href: '/dashboard?class=puc' },
];

export default async function HomePage() {
  const cookieStore = await cookies();
  const searchMode = (cookieStore.get('pratibha_search_mode')?.value as 'kn' | 'en') || 'kn';

  return (
    <div className="relative min-h-screen font-kannada bg-[#FAF9F6] text-neutral-900 overflow-hidden selection:bg-orange-500/20 selection:text-orange-950">

      {/* ─────────────────────────────────────────────────────────────
          1. NATURAL LIVE AMBIENT MESH GRADIENTS (OLED / iPhone Live Aura)
      ───────────────────────────────────────────────────────────── */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        {/* Soft morning amber glow */}
        <div
          className="aurora-live-1 absolute -top-[15%] left-[10%] w-[680px] h-[680px] rounded-full blur-[100px] opacity-60"
          style={{
            background: 'radial-gradient(circle, rgba(255, 185, 130, 0.55) 0%, rgba(254, 215, 170, 0.35) 45%, transparent 75%)',
          }}
        />

        {/* Delicate blush dawn glow */}
        <div
          className="aurora-live-2 absolute top-[20%] -right-[10%] w-[720px] h-[720px] rounded-full blur-[115px] opacity-55"
          style={{
            background: 'radial-gradient(circle, rgba(254, 205, 211, 0.50) 0%, rgba(253, 186, 116, 0.25) 45%, transparent 75%)',
          }}
        />

        {/* Honey sunlight base */}
        <div
          className="aurora-live-3 absolute top-[55%] -left-[15%] w-[650px] h-[650px] rounded-full blur-[110px] opacity-45"
          style={{
            background: 'radial-gradient(circle, rgba(254, 240, 138, 0.45) 0%, rgba(254, 215, 170, 0.25) 50%, transparent 70%)',
          }}
        />

        {/* Subtle bottom lavender warmth */}
        <div
          className="aurora-live-1 absolute -bottom-[10%] right-[15%] w-[620px] h-[620px] rounded-full blur-[105px] opacity-40"
          style={{
            background: 'radial-gradient(circle, rgba(243, 232, 255, 0.40) 0%, rgba(254, 205, 211, 0.20) 50%, transparent 75%)',
          }}
        />

        {/* Ultra-subtle paper grain texture overlay for tactile Notion feel */}
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage: `radial-gradient(#000 1px, transparent 1px)`,
            backgroundSize: '24px 24px',
          }}
        />
      </div>

      {/* ─────────────────────────────────────────────────────────────
          2. FLOATING IPHONE GLASS NAVBAR (Apple Dynamic Island / Notion style)
      ───────────────────────────────────────────────────────────── */}
      <header className="sticky top-4 z-50 px-4 sm:px-6">
        <div className="mx-auto max-w-5xl iphone-glass rounded-full px-4 sm:px-5 py-2.5 sm:py-3 flex items-center justify-between transition-all gap-2">
          <Link href="/" className="flex items-center gap-2 group shrink-0">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-orange-500 to-amber-500 flex items-center justify-center text-white font-extrabold text-sm shadow-sm group-hover:scale-105 transition-transform">
              ಪ್ರ
            </div>
            <span className="text-base sm:text-lg font-bold text-neutral-900 tracking-tight kn group-hover:text-orange-600 transition-colors">
              ಪ್ರತಿಭಾ ಕನ್ನಡ
            </span>
          </Link>

          <nav className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            <SearchModeToggle initialMode={searchMode} />
            <Link
              href="/dashboard"
              className="text-xs sm:text-sm font-medium text-neutral-600 hover:text-neutral-900 px-3 py-1.5 rounded-full hover:bg-white/60 transition hidden md:inline-flex"
            >
              ಸಂಪನ್ಮೂಲಗಳು
            </Link>
            <Link
              href="/login"
              className="btn-notion-glass text-xs sm:text-sm !py-1.5 !px-3 sm:!px-4 !rounded-full"
              id="nav-login"
            >
              ಲಾಗಿನ್
            </Link>
            <Link
              href="/register"
              className="btn-notion-dark text-xs sm:text-sm !py-1.5 !px-3.5 sm:!px-4 !rounded-full hidden sm:inline-flex"
              id="nav-register"
            >
              ಖಾತೆ ತೆರೆಯಿರಿ
            </Link>
          </nav>
        </div>
      </header>

      {/* ─────────────────────────────────────────────────────────────
          3. HERO SECTION (Notion Minimalist + iPhone Spotlight Glass)
      ───────────────────────────────────────────────────────────── */}
      <section className="relative z-10 pt-16 sm:pt-24 pb-16 px-4 sm:px-6">
        <div className="mx-auto max-w-3xl text-center">

          {/* Notion-style badge pill */}
          <div className="fade-up inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full iphone-glass-pill text-xs font-semibold text-neutral-700 mb-6 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>ಕನ್ನಡ ಕಲಿಕೆಗೆ ಉಚಿತ ಡಿಜಿಟಲ್ ವೇದಿಕೆ</span>
            <span className="text-neutral-400">·</span>
            <span className="text-orange-700">100% Free</span>
          </div>

          {/* Master Title */}
          <h1 className="fade-up fade-up-1 text-4xl sm:text-6xl font-extrabold text-neutral-950 tracking-tight leading-[1.15] mb-5 kn">
            ಪ್ರತಿಭಾ ಕನ್ನಡ
          </h1>

          {/* Subtitle */}
          <p className="fade-up fade-up-2 text-lg sm:text-2xl font-semibold text-neutral-800 leading-snug mb-3 kn">
            ಕನ್ನಡ ಸಾಹಿತ್ಯ, ವ್ಯಾಕರಣ ಮತ್ತು ಪರೀಕ್ಷಾ ಸಂಪನ್ಮೂಲಗಳ ಡಿಜಿಟಲ್ ಭಂಡಾರ
          </p>
          <p className="fade-up fade-up-2 text-sm sm:text-base text-neutral-500 max-w-xl mx-auto mb-8 font-normal">
            6ನೇ ತರಗತಿಯಿಂದ 10ನೇ ತರಗತಿ ಹಾಗೂ ಪಿಯುಸಿ ವಿದ್ಯಾರ್ಥಿಗಳಿಗಾಗಿ ಸಂಪೂರ್ಣ ಉಚಿತ ನೋಟ್ಸ್, ಪ್ರಶ್ನೋತ್ತರ ಮತ್ತು ವ್ಯಾಕರಣ ಮಾರ್ಗದರ್ಶಿ.
          </p>

          {/* ─── iPhone Spotlight Style Glass Search Bar ─── */}
          <HomeSearchForm initialMode={searchMode} />

          {/* Action Button Row */}
          <div className="fade-up fade-up-4 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/register"
              id="cta-get-started"
              className="btn-notion-dark w-full sm:w-auto text-sm sm:text-base !py-3 !px-7 !rounded-full shadow-md hover:shadow-lg"
            >
              ಉಚಿತವಾಗಿ ಪ್ರಾರಂಭಿಸಿ
            </Link>
            <Link
              href="/dashboard"
              id="cta-browse"
              className="btn-notion-glass w-full sm:w-auto text-sm sm:text-base !py-3 !px-7 !rounded-full"
            >
              ಸಂಪನ್ಮೂಲಗಳನ್ನು ಅನ್ವೇಷಿಸಿ →
            </Link>
          </div>

        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          4. IPHONE FROSTED STATS BAR (Live platform proof)
      ───────────────────────────────────────────────────────────── */}
      <section className="relative z-10 px-4 sm:px-6 mb-16">
        <div className="mx-auto max-w-4xl iphone-glass rounded-2xl sm:rounded-3xl p-4 sm:p-6 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          <div className="border-r border-slate-200/50 last:border-none">
            <div className="text-xl sm:text-2xl font-extrabold text-neutral-900 font-mono">100%</div>
            <div className="text-xs font-medium text-neutral-500 mt-0.5 kn">ಸಂಪೂರ್ಣ ಉಚಿತ</div>
          </div>
          <div className="border-r border-slate-200/50 last:border-none">
            <div className="text-xl sm:text-2xl font-extrabold text-neutral-900 font-mono">26+</div>
            <div className="text-xs font-medium text-neutral-500 mt-0.5 kn">ಸಂಪನ್ಮೂಲಗಳು</div>
          </div>
          <div className="border-r border-slate-200/50 last:border-none">
            <div className="text-xl sm:text-2xl font-extrabold text-neutral-900 font-mono">6–10</div>
            <div className="text-xs font-medium text-neutral-500 mt-0.5 kn">ತರಗತಿ & ಪಿಯುಸಿ</div>
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-extrabold text-neutral-900 font-mono">2–3</div>
            <div className="text-xs font-medium text-neutral-500 mt-0.5 kn">ಕ್ಲಿಕ್‌ನಲ್ಲಿ ಶೋಧನೆ</div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          5. CLASSES SECTION (Apple iOS Segmented Control Feel)
      ───────────────────────────────────────────────────────────── */}
      <section className="relative z-10 py-10 px-4 sm:px-6">
        <div className="mx-auto max-w-5xl">
          <div className="text-center mb-6">
            <span className="text-xs font-bold uppercase tracking-widest text-neutral-400">
              ತರಗತಿ ಆಯ್ಕೆಮಾಡಿ
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-neutral-900 mt-1 kn">
              ನಿಮ್ಮ ತರಗತಿಗೆ ತಕ್ಕ ಅಧ್ಯಯನ ಸಾಮಗ್ರಿಗಳು
            </h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {CLASSES.map((c) => (
              <Link
                key={c.href}
                href={c.href}
                id={`class-${c.label}`}
                className="iphone-glass-card rounded-2xl p-4 flex flex-col items-center text-center group cursor-pointer"
              >
                <div className="w-10 h-10 rounded-xl bg-orange-500/10 text-orange-700 flex items-center justify-center font-bold text-sm mb-2 group-hover:bg-neutral-900 group-hover:text-white transition-colors duration-200">
                  {c.label.split('')[0]}
                </div>
                <span className="text-sm font-bold text-neutral-900 group-hover:text-orange-700 kn">
                  {c.label}
                </span>
                <span className="text-[11px] text-neutral-400 mt-0.5 font-medium">
                  {c.sub}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          6. CATEGORIES SECTION (Notion Bento Grid + iPhone Glass Cards)
      ───────────────────────────────────────────────────────────── */}
      <section className="relative z-10 py-12 px-4 sm:px-6">
        <div className="mx-auto max-w-5xl">
          <div className="text-center mb-8">
            <span className="text-xs font-bold uppercase tracking-widest text-neutral-400">
              ವಿಷಯ ಪ್ರಕಾರಗಳು
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-neutral-900 mt-1 kn">
              ಸಂಪೂರ್ಣ ಶೈಕ್ಷಣಿಕ ವರ್ಗೀಕರಣ
            </h2>
            <p className="text-xs sm:text-sm text-neutral-500 mt-1">
              ನೋಟ್ಸ್, ವ್ಯಾಕರಣ, ಪ್ರಶ್ನೆ ಪತ್ರಿಕೆಗಳು ಹಾಗೂ ಕವಿ ಪರಿಚಯ
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {CATEGORIES.map((cat) => (
              <Link
                key={cat.href}
                href={cat.href}
                id={`cat-${cat.sub.toLowerCase().replace(/\s+/g, '-')}`}
                className="iphone-glass-card rounded-3xl p-5 flex flex-col justify-between group cursor-pointer"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-9 h-9 rounded-xl bg-neutral-900/5 text-neutral-800 flex items-center justify-center font-mono font-bold text-xs group-hover:bg-orange-500 group-hover:text-white transition-colors">
                      {cat.code}
                    </div>
                    <span className="text-neutral-400 text-xs group-hover:translate-x-1 group-hover:text-orange-600 transition-all">
                      →
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-neutral-900 group-hover:text-orange-700 kn mb-1 leading-snug">
                    {cat.label}
                  </h3>
                  <p className="text-xs text-neutral-500 font-medium leading-relaxed">
                    {cat.sub}
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-200/50 flex items-center justify-between text-[11px] text-neutral-400">
                  <span>ಮುಕ್ತ ಪ್ರವೇಶ</span>
                  <span className="text-orange-600 font-semibold group-hover:underline">ಓದಿ</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          7. NOTION-STYLE FEATURE SHOWCASE (Clean, live & distraction-free)
      ───────────────────────────────────────────────────────────── */}
      <section className="relative z-10 py-14 px-4 sm:px-6">
        <div className="mx-auto max-w-5xl iphone-glass rounded-3xl p-8 sm:p-12">
          <div className="max-w-2xl mx-auto text-center mb-10">
            <span className="text-xs font-bold uppercase tracking-widest text-orange-700">
              ಸುಲಭ ಕಲಿಕಾ ತತ್ವ
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-neutral-950 mt-1 kn">
              ಕೇವಲ ಮೂರು ಹಂತಗಳಲ್ಲಿ ನಿಮ್ಮ ಅಧ್ಯಯನ
            </h2>
            <p className="text-xs sm:text-sm text-neutral-500 mt-2">
              ಅನಗತ್ಯ ಜಾಹೀರಾತುಗಳು ಅಥವಾ ಅಡೆತಡೆಗಳಿಲ್ಲದೆ ನೇರವಾಗಿ ವಿಷಯವನ್ನು ಅಧ್ಯಯನ ಮಾಡಿ.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="iphone-glass-card rounded-2xl p-6 text-left">
              <div className="text-xs font-mono font-bold text-orange-600 mb-2">01 / DISCOVER</div>
              <h3 className="text-lg font-bold text-neutral-900 mb-2 kn">ಹುಡುಕಿ</h3>
              <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed kn">
                ಯಾವುದೇ ಸಂಧಿ, ಸಮಾಸ, ಪಾಠ ಅಥವಾ ಹಿಂದಿನ ವರ್ಷದ ಪತ್ರಿಕೆಯನ್ನು ಕೆಲವೇ ಅಕ್ಷರಗಳಲ್ಲಿ ಸರ್ಚ್ ಮಾಡಿ.
              </p>
            </div>

            <div className="iphone-glass-card rounded-2xl p-6 text-left">
              <div className="text-xs font-mono font-bold text-orange-600 mb-2">02 / OPEN</div>
              <h3 className="text-lg font-bold text-neutral-900 mb-2 kn">ತೆರೆಯಿರಿ</h3>
              <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed kn">
                ಒಂದೇ ಕ್ಲಿಕ್‌ನಲ್ಲಿ ಸುಲಭವಾಗಿ ಓದಲು ಸಿದ್ಧವಾದ ಅಕ್ಷರ ರೂಪದ ಸಾರಾಂಶ ಹಾಗೂ ಪ್ರಶ್ನೋತ್ತರ ವೀಕ್ಷಿಸಿ.
              </p>
            </div>

            <div className="iphone-glass-card rounded-2xl p-6 text-left">
              <div className="text-xs font-mono font-bold text-orange-600 mb-2">03 / STUDY</div>
              <h3 className="text-lg font-bold text-neutral-900 mb-2 kn">ಅಧ್ಯಯನ ಮಾಡಿ</h3>
              <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed kn">
                ಪರೀಕ್ಷಾ ತಯಾರಿಗಾಗಿ ವಿಶ್ವಾಸಾರ್ಹ ಶಿಕ್ಷಕರು ರೂಪಿಸಿದ ಪ್ರಶ್ನೆ ಪತ್ರಿಕೆಗಳನ್ನು ಉಚಿತವಾಗಿ ಅಭ್ಯಾಸ ಮಾಡಿ.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          8. FINAL CALL TO ACTION (Glassy Card)
      ───────────────────────────────────────────────────────────── */}
      <section className="relative z-10 py-16 px-4 sm:px-6 text-center">
        <div className="mx-auto max-w-xl iphone-glass rounded-3xl p-8 sm:p-12 shadow-lg">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-neutral-950 mb-3 kn">
            ಇಂದೇ ನಿಮ್ಮ ಕಲಿಕೆ ಆರಂಭಿಸಿ
          </h2>
          <p className="text-sm text-neutral-600 mb-6 kn max-w-md mx-auto">
            ಯಾವುದೇ ಶುಲ್ಕವಿಲ್ಲದೆ, ಎಲ್ಲಾ ತರಗತಿಗಳ ಕನ್ನಡ ಅಧ್ಯಯನ ಸಾಮಗ್ರಿಗಳನ್ನು ಉಚಿತವಾಗಿ ಪಡೆದುಕೊಳ್ಳಿ.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/register"
              id="cta-footer-register"
              className="btn-notion-dark text-sm sm:text-base !py-3 !px-8 !rounded-full w-full sm:w-auto"
            >
              ಉಚಿತ ಖಾತೆ ತೆರೆಯಿರಿ
            </Link>
            <Link
              href="/dashboard"
              className="btn-notion-glass text-sm sm:text-base !py-3 !px-8 !rounded-full w-full sm:w-auto"
            >
              ಡ್ಯಾಶ್‌ಬೋರ್ಡ್ ನೋಡಿ
            </Link>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          9. IPHONE FROSTED FOOTER
      ───────────────────────────────────────────────────────────── */}
      <footer className="relative z-10 border-t border-slate-200/50 py-8 text-center bg-white/40 backdrop-blur-md">
        <div className="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-neutral-500 kn">
            © {new Date().getFullYear()} ಪ್ರತಿಭಾ ಕನ್ನಡ · ಕನ್ನಡ ಕಲಿಕೆಗೆ ಉಚಿತ ಡಿಜಿಟಲ್ ವೇದಿಕೆ
          </p>
          <div className="flex items-center gap-4 text-xs text-neutral-500 font-medium">
            <Link href="/dashboard" className="hover:text-orange-600 transition">ಸಂಪನ್ಮೂಲಗಳು</Link>
            <span>·</span>
            <Link href="/admin" className="hover:text-orange-600 transition">ನಿರ್ವಾಹಕ (Admin)</Link>
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
