import type { Metadata } from 'next';
import Link from 'next/link';
import { cookies } from 'next/headers';
import { KANNADA_RESOURCES } from '@/data/resources';
import { getAuthContext } from '@/lib/authServer';
import { SearchModeToggle } from '@/components/search/SearchModeToggle';
import { matchResourceQuery, scoreResourceMatch, transliterateToKannada } from '@/lib/kannadaTransliteration';
import { LiveSearchAutocomplete } from '@/components/search/LiveSearchAutocomplete';
import { ShieldCheck, ArrowRight, LogOut } from 'lucide-react';

import { SUPPORTED_CLASSES, formatGradeLabelKn } from '@/data/classes';

export const metadata: Metadata = {
  title: 'ಡ್ಯಾಶ್‌ಬೋರ್ಡ್ — ಪ್ರತಿಭಾ ಕನ್ನಡ',
  description: 'ಕನ್ನಡ ಸಂಪನ್ಮೂಲಗಳ ಉಚಿತ ಡಿಜಿಟಲ್ ಲೈಬ್ರರಿ',
};

const CLASSES = SUPPORTED_CLASSES.map((c) => ({
  label: c.labelKn,
  slug: c.slug,
}));

const CATEGORIES = [
  { label: 'ನೋಟ್ಸ್',                sub: 'Notes',           slug: 'notes' },
  { label: 'ವ್ಯಾಕರಣ',               sub: 'Grammar',         slug: 'grammar' },
  { label: 'ಪ್ರಶ್ನೆ ಪತ್ರಿಕೆ',       sub: 'Question Papers', slug: 'question-papers' },
  { label: 'ಹಿಂದಿನ ಪ್ರಶ್ನೆ ಪತ್ರಿಕೆ', sub: 'Previous Papers', slug: 'previous-year' },
  { label: 'ಪ್ರಶ್ನೋತ್ತರ',           sub: 'Q & A',           slug: 'qa' },
  { label: 'ಪ್ರಬಂಧ & ಗಾದೆ',         sub: 'Essays & Sayings', slug: 'essay' },
  { label: 'ಕವಿ ಪರಿಚಯ',            sub: 'Poets & Authors', slug: 'poets' },
  { label: 'ಅಭ್ಯಾಸ ಪರೀಕ್ಷೆ',        sub: 'Practice',        slug: 'practice' },
];

interface DashboardPageProps {
  searchParams: Promise<{ q?: string; class?: string; cat?: string; welcome?: string; mode?: string }>;
}

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const params = await searchParams;
  const rawQuery = (params.q ?? '').trim();
  const query = rawQuery.toLowerCase();
  const activeClass = params.class ?? '';
  const activeCat = params.cat ?? '';

  // Resolve server-side authentication context
  const auth = await getAuthContext();
  const currentStudent = auth.user;

  // Search mode: defaults to 'kn' (Kannada), activated to 'en' (English letters) via query param or persistent cookie
  const cookieStore = await cookies();
  const cookieMode =
    cookieStore.get('pratibha_language_mode')?.value ||
    cookieStore.get('pratibha_search_mode')?.value;
  const isEnRequested =
    params.mode === 'en' ||
    params.mode === 'english' ||
    (!params.mode && (cookieMode === 'en' || cookieMode === 'english'));
  const searchMode: 'kn' | 'en' = isEnRequested ? 'en' : 'kn';

  // Load dynamic published resources from Supabase
  let allResources = [...KANNADA_RESOURCES];
  if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    try {
      const { createClient } = await import('@/lib/supabase/server');
      const supabase = await createClient();
      const { data: dbResources } = await supabase
        .from('resources')
        .select(`
          id,
          title,
          title_kn,
          description,
          resource_type,
          file_url,
          is_published,
          topics (
            name,
            categories (
              slug,
              subjects (
                classes (
                  slug
                )
              )
            )
          )
        `)
        .eq('is_published', true);

      if (dbResources && dbResources.length > 0) {
        const mapped: any[] = dbResources.map((db: any) => {
          const clsSlug = (db.topics?.categories?.subjects?.classes?.slug || '').replace('class-', '');
          const catSlug = db.topics?.categories?.slug || 'notes';
          return {
            id: db.id,
            slug: db.id,
            title: db.title_kn || db.title,
            classGrade: (clsSlug || '10') as any,
            category: (catSlug || 'notes') as any,
            topic: db.topics?.name || 'ಸಾಮಾನ್ಯ',
            summary: db.description || db.title,
            content: db.description || db.title,
            pdfUrl: db.file_url || undefined,
            tags: [db.resource_type, catSlug],
          };
        });
        allResources = [...mapped, ...KANNADA_RESOURCES];
      }
    } catch {
      // Fallback cleanly to static
    }
  }

  // Deduplicate resources by id and slug to ensure static and database resources never appear twice
  const seenIds = new Set<string>();
  const uniqueResources = allResources.filter((res) => {
    const key = res.id || res.slug;
    if (seenIds.has(key)) return false;
    seenIds.add(key);
    return true;
  });

  // Calculate transliteration candidates for search UI transparency
  const transliteratedCandidates =
    rawQuery && searchMode === 'en' ? transliterateToKannada(rawQuery) : [];

  // Filter & rank resources by relevance score
  const scoredResources = uniqueResources
    .filter((res) => {
      // Class filter (strictly supported levels: 8, 9, 10, puc-1, puc-2)
      if (activeClass && res.classGrade !== 'all') {
        const isPucMatch =
          (activeClass === 'puc' && (res.classGrade === 'puc' || res.classGrade === 'puc-1' || res.classGrade === 'puc-2')) ||
          ((activeClass === 'puc-1' || activeClass === 'puc-2') && res.classGrade === 'puc');
        if (!isPucMatch && res.classGrade !== activeClass) {
          return false;
        }
      }
      // Category filter
      if (activeCat && res.category !== activeCat) {
        return false;
      }
      return true;
    })
    .map((res) => {
      const score = query
        ? scoreResourceMatch(
            [
              res.title,
              res.topic,
              res.summary,
              ...(res.tags || []),
              res.content,
              res.authorOrSource,
            ],
            rawQuery,
            searchMode
          )
        : 1;
      return { res, score };
    })
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score);

  const filtered = scoredResources.map(({ res }) => res);

  return (
    <div className="min-h-screen flex flex-col font-kannada relative">

      {/* ─── Sticky Header with search (iOS Liquid Glass Panel) ─── */}
      <header className="sticky top-0 z-50 liquid-glass border-b border-white/60">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-3 flex items-center justify-between gap-3 sm:gap-4">
          <Link href="/dashboard" className="text-lg sm:text-xl font-extrabold text-orange-600 shrink-0">
            ಪ್ರತಿಭಾ ಕನ್ನಡ
          </Link>

          {/* Search bar with Live Autocomplete */}
          <div className="flex-1 max-w-xl">
            <LiveSearchAutocomplete
              variant="compact"
              defaultValue={rawQuery}
              activeClass={activeClass}
              activeCat={activeCat}
              formAction="/dashboard"
              inputId="dash-search-input"
              formId="dash-search-form"
              buttonId="dash-search-btn"
            />
          </div>

          {/* Top-Right Area: Search Mode Toggle, Authenticated Admin, and Student Profile */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <SearchModeToggle initialMode={searchMode} showHelperBadge />

            {/* Authenticated Admin quick capsule */}
            {auth.isAdmin && (
              <Link
                href="/admin"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-orange-500/15 border border-orange-500/30 text-orange-950 text-xs font-semibold hover:bg-orange-500/25 transition shadow-2xs"
                id="dash-nav-admin"
                title="ನಿರ್ವಾಹಕ ಕಂಟ್ರೋಲ್ ಸೆಂಟರ್"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-orange-600" />
                <span className="kn hidden sm:inline">ನಿರ್ವಾಹಕ ಪ್ಯಾನೆಲ್</span>
                <span className="kn sm:hidden">Admin</span>
              </Link>
            )}

            {currentStudent ? (
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-orange-500 to-amber-500 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                  {currentStudent.name.charAt(0).toUpperCase()}
                </div>
                <div className="hidden lg:block text-left">
                  <div className="text-xs font-bold text-neutral-800 leading-tight">
                    {currentStudent.name}
                  </div>
                  <div className="text-[10px] text-emerald-600 font-medium">
                    {auth.isAdmin ? 'ನಿರ್ವಾಹಕ' : 'ಉಚಿತ ಪ್ರವೇಶ'}
                  </div>
                </div>
                <form action="/api/auth/logout" method="POST">
                  <button type="submit" className="text-xs text-neutral-400 hover:text-red-600 ml-1 font-medium">
                    ಲಾಗ್ ಔಟ್
                  </button>
                </form>
              </div>
            ) : (
              <Link href="/login" className="btn-notion-glass text-xs !py-1.5 !px-3.5 !rounded-full hidden xs:inline-flex">
                ಲಾಗಿನ್
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Main container */}
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-6 flex-1 w-full">

        {/* Welcome banner if newly logged in */}
        {params.welcome && (
          <div className="mb-6 p-4 rounded-2xl liquid-glass border border-orange-200/60 bg-gradient-to-r from-orange-500/15 to-pink-500/15 text-neutral-900 flex items-center justify-between shadow-sm">
            <div>
              <h3 className="font-bold text-sm">ಸ್ವಾಗತ! ನಿಮ್ಮ ಖಾತೆ ಸಕ್ರಿಯವಾಗಿದೆ.</h3>
              <p className="text-xs text-neutral-600">ಎಲ್ಲಾ ನೋಟ್ಸ್, ಪ್ರಶ್ನೆ ಪತ್ರಿಕೆ ಮತ್ತು ವ್ಯಾಕರಣ ಸಂಪೂರ್ಣ ಉಚಿತವಾಗಿ ಲಭ್ಯವಿದೆ.</p>
            </div>
            <Link href="/dashboard" className="text-xs bg-neutral-900 text-white px-3 py-1.5 rounded-full font-bold">
              ಸರಿ
            </Link>
          </div>
        )}

        {/* ─── Class filter tabs ─── */}
        <section className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-neutral-500">ತರಗತಿ ಆಯ್ಕೆಮಾಡಿ</h2>
            {activeClass && (
              <Link href={activeCat ? `/dashboard?cat=${activeCat}${searchMode === 'en' ? '&mode=en' : ''}` : searchMode === 'en' ? '/dashboard?mode=en' : '/dashboard'} className="text-xs sm:text-sm font-bold text-orange-600 hover:underline min-h-[36px] flex items-center">
                ಎಲ್ಲಾ ಬೆಂಬಲಿತ ತರಗತಿಗಳನ್ನು ತೋರಿಸಿ
              </Link>
            )}
          </div>
          <div className="flex flex-wrap gap-2 sm:gap-2.5" role="group" aria-label="ತರಗತಿ ಫಿಲ್ಟರ್">
            <Link
              href={activeCat ? `/dashboard?cat=${activeCat}${searchMode === 'en' ? '&mode=en' : ''}` : searchMode === 'en' ? '/dashboard?mode=en' : '/dashboard'}
              id="class-filter-all"
              className={`px-4 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer min-h-[40px] flex items-center ${
                !activeClass
                  ? 'bg-neutral-900 text-white shadow-sm'
                  : 'liquid-glass-pill text-neutral-800 hover:text-neutral-950'
              }`}
            >
              ಎಲ್ಲಾ ಬೆಂಬಲಿತ ತರಗತಿಗಳು
            </Link>
            {CLASSES.map((c) => (
              <Link
                key={c.slug}
                href={`/dashboard?class=${c.slug}${activeCat ? `&cat=${activeCat}` : ''}${searchMode === 'en' ? '&mode=en' : ''}`}
                id={`class-filter-${c.slug}`}
                className={`px-4 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer min-h-[40px] flex items-center ${
                  activeClass === c.slug
                    ? 'bg-neutral-900 text-white shadow-sm'
                    : 'liquid-glass-pill text-neutral-800 hover:text-neutral-950'
                }`}
              >
                {c.label}
              </Link>
            ))}
          </div>
        </section>

        {/* ─── Category grid ─── */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-neutral-500">ವಿಷಯ ಪ್ರಕಾರ</h2>
            {activeCat && (
              <Link href={activeClass ? `/dashboard?class=${activeClass}${searchMode === 'en' ? '&mode=en' : ''}` : searchMode === 'en' ? '/dashboard?mode=en' : '/dashboard'} className="text-xs sm:text-sm font-bold text-orange-600 hover:underline min-h-[36px] flex items-center">
                ಎಲ್ಲಾ ಪ್ರಕಾರಗಳನ್ನು ತೋರಿಸಿ
              </Link>
            )}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            {CATEGORIES.map((cat) => {
              const isSelected = activeCat === cat.slug;
              return (
                <Link
                  key={cat.slug}
                  href={`/dashboard?cat=${cat.slug}${activeClass ? `&class=${activeClass}` : ''}${searchMode === 'en' ? '&mode=en' : ''}`}
                  id={`cat-${cat.slug}`}
                  className={`p-3.5 sm:p-4 rounded-2xl transition-all flex items-center gap-3 group min-h-[64px] border ${
                    isSelected
                      ? 'border-orange-500/80 bg-orange-500/20 shadow-md ring-2 ring-orange-400/30'
                      : 'border-white/60 liquid-glass-card hover:border-orange-300/80'
                  }`}
                >
                  <div className="w-10 h-10 rounded-xl bg-orange-500/15 text-orange-800 border border-orange-200/50 flex items-center justify-center font-bold text-sm shrink-0 group-hover:bg-orange-500 group-hover:text-white transition-colors">
                    {cat.label.charAt(0)}
                  </div>
                  <div>
                    <div className={`text-sm sm:text-base font-bold leading-tight kn ${isSelected ? 'text-orange-950 font-extrabold' : 'text-neutral-900 group-hover:text-orange-700'}`}>
                      {cat.label}
                    </div>
                    <div className="text-xs text-neutral-500 mt-0.5">{cat.sub}</div>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        {/* Search transliteration mode indicator banner */}
        {rawQuery && searchMode === 'en' && transliteratedCandidates.length > 0 && (
          <div className="mb-6 p-3.5 rounded-2xl liquid-glass border border-orange-200/80 text-xs text-orange-950 flex flex-wrap items-center justify-between gap-2 shadow-xs">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-orange-800 inline-flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
                English ಲಿಪಿ ಹುಡುಕಾಟ:
              </span>
              <span className="font-mono bg-white/70 backdrop-blur-md px-2.5 py-0.5 rounded-lg border border-orange-200 font-medium text-neutral-800">
                &ldquo;{rawQuery}&rdquo;
              </span>
              <ArrowRight className="w-3.5 h-3.5 text-orange-600 inline shrink-0" />
              <span className="font-bold text-neutral-900 kn">
                {transliteratedCandidates.join(' / ')}
              </span>
            </div>
            <span className="text-[11px] text-orange-700 font-medium">
              ಮೂಲ ಕನ್ನಡ ಸಂಪನ್ಮೂಲಗಳನ್ನು ಹುಡುಕಲಾಗಿದೆ
            </span>
          </div>
        )}

        {/* ─── Resources Listing Area ─── */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-neutral-950 kn">
                {query
                  ? `"${query}" ಗಾಗಿ ಹುಡುಕಾಟದ ಫಲಿತಾಂಶಗಳು (${filtered.length})`
                  : activeCat
                  ? `${CATEGORIES.find((c) => c.slug === activeCat)?.label ?? ''} ಸಂಪನ್ಮೂಲಗಳು (${filtered.length})`
                  : activeClass
                  ? `${CLASSES.find((c) => c.slug === activeClass)?.label ?? ''} ಸಂಪನ್ಮೂಲಗಳು (${filtered.length})`
                  : `ಲಭ್ಯವಿರುವ ಎಲ್ಲಾ ಸಂಪನ್ಮೂಲಗಳು (${filtered.length})`}
              </h2>
              <p className="text-xs sm:text-sm text-neutral-500 mt-1 kn">
                ಯಾವುದೇ ಸಂಪನ್ಮೂಲದ ಮೇಲೆ ಕ್ಲಿಕ್ ಮಾಡಿ ಸಂಪೂರ್ಣ ವಿವರಗಳನ್ನು ಉಚಿತವಾಗಿ ಅಧ್ಯಯನ ಮಾಡಿ.
              </p>
            </div>
          </div>

          {filtered.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-white/60 liquid-glass p-10 sm:p-12 text-center">
              <h3 className="text-lg font-bold text-neutral-900 mb-1 kn">
                ಯಾವುದೇ ಸಂಪನ್ಮೂಲಗಳು ಕಂಡುಬಂದಿಲ್ಲ
              </h3>
              <p className="text-sm text-neutral-500 mb-4 kn">
                ದಯವಿಟ್ಟು ಬೇರೆ ಹುಡುಕಾಟ ಪದ ಅಥವಾ ಫಿಲ್ಟರ್ ಆಯ್ಕೆಮಾಡಿ
              </p>
              <Link href="/dashboard" className="btn-primary text-sm px-5 py-2.5 min-h-[44px]">
                ಎಲ್ಲಾ ಸಂಪನ್ಮೂಲಗಳನ್ನು ತೋರಿಸಿ
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
              {filtered.map((item) => (
                <article
                  key={item.id}
                  className="liquid-glass-card rounded-2xl p-5 sm:p-6 flex flex-col justify-between group border border-white/60 hover:border-orange-200/80 transition-all"
                >
                  <div>
                    {/* Badges */}
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="text-xs font-semibold px-3 py-1 rounded-full bg-orange-500/15 border border-orange-500/20 text-orange-950">
                        {formatGradeLabelKn(item.classGrade)}
                      </span>
                      <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                        {item.category}
                      </span>
                    </div>

                    {/* Title (Target: 17-20px) */}
                    <h3 className="font-bold text-neutral-950 group-hover:text-orange-600 transition text-lg sm:text-xl leading-snug mb-2 kn">
                      <Link href={`/dashboard/resource/${item.slug}`}>
                        {item.title}
                      </Link>
                    </h3>

                    {/* Summary (Target: 15-16px, line-height 1.6) */}
                    <p className="text-sm sm:text-base text-neutral-600 line-clamp-3 leading-relaxed mb-4 kn">
                      {item.summary}
                    </p>
                  </div>

                  <div>
                    {/* Tags */}
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {item.tags.slice(0, 3).map((tag) => (
                        <span key={tag} className="text-xs bg-white/60 border border-white/70 text-neutral-600 px-2.5 py-0.5 rounded-md">
                          #{tag}
                        </span>
                      ))}
                    </div>

                    {/* Action buttons (Target: 44x44px touch area) */}
                    <div className="pt-3.5 border-t border-slate-200/60 flex items-center justify-between gap-2">
                      <Link
                        href={`/dashboard/resource/${item.slug}`}
                        className="text-sm font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1.5 group-hover:translate-x-0.5 transition-transform min-h-[44px] py-1 kn"
                      >
                        <span>ಓದಿ & ಅಧ್ಯಯನ ಮಾಡಿ</span>
                        <ArrowRight className="w-4 h-4 inline" />
                      </Link>
                      <Link
                        href={`/dashboard/resource/${item.slug}`}
                        className="text-xs sm:text-sm bg-white/70 hover:bg-orange-100 text-slate-800 hover:text-orange-900 px-3.5 py-2 rounded-xl transition font-semibold min-h-[44px] flex items-center border border-slate-200/60 kn"
                      >
                        ವಿವರ ನೋಡಿ
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

      </div>

      {/* Footer */}
      <footer className="bg-white/80 backdrop-blur-md border-t border-slate-200/60 py-6 text-center text-xs text-neutral-500">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="kn">© {new Date().getFullYear()} ಪ್ರತಿಭಾ ಕನ್ನಡ — ಉಚಿತ ಶೈಕ್ಷಣಿಕ ವೇದಿಕೆ</p>
          <div className="flex items-center gap-4 text-neutral-600 font-medium">
            <Link href="/" className="hover:text-orange-600 transition">ಮುಖಪುಟ</Link>
            <span>·</span>
            <Link href="/dashboard" className="hover:text-orange-600 transition">ಸಂಪನ್ಮೂಲಗಳು</Link>
          </div>
        </div>
      </footer>

    </div>
  );
}
