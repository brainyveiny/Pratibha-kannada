import type { Metadata } from 'next';
import Link from 'next/link';
import { cookies } from 'next/headers';
import { KANNADA_RESOURCES } from '@/data/resources';

export const metadata: Metadata = {
  title: 'ಡ್ಯಾಶ್‌ಬೋರ್ಡ್ — ಪ್ರತಿಭಾ ಕನ್ನಡ',
  description: 'ಕನ್ನಡ ಸಂಪನ್ಮೂಲಗಳ ಉಚಿತ ಡಿಜಿಟಲ್ ಲೈಬ್ರರಿ',
};

const CLASSES = [
  { label: '10ನೇ ತರಗತಿ', slug: '10' },
  { label: '9ನೇ ತರಗತಿ',  slug: '9' },
  { label: '8ನೇ ತರಗತಿ',  slug: '8' },
  { label: '7ನೇ ತರಗತಿ',  slug: '7' },
  { label: '6ನೇ ತರಗತಿ',  slug: '6' },
  { label: 'ಪಿ.ಯು.ಸಿ',   slug: 'puc' },
];

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
  searchParams: Promise<{ q?: string; class?: string; cat?: string; welcome?: string }>;
}

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const params = await searchParams;
  const query = (params.q ?? '').trim().toLowerCase();
  const activeClass = params.class ?? '';
  const activeCat = params.cat ?? '';

  // Read student session cookie
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('pratibha_user');
  let currentStudent: { name: string; email: string; grade?: string } | null = null;
  if (sessionCookie?.value) {
    try {
      const decoded = Buffer.from(sessionCookie.value, 'base64').toString('utf-8');
      currentStudent = JSON.parse(decoded);
    } catch {
      // ignore
    }
  }

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

  // Filter resources
  const filtered = allResources.filter((res) => {
    // Class filter
    if (activeClass && res.classGrade !== 'all' && res.classGrade !== activeClass) {
      return false;
    }
    // Category filter
    if (activeCat && res.category !== activeCat) {
      return false;
    }
    // Search query filter
    if (query) {
      const matchTitle = res.title.toLowerCase().includes(query);
      const matchSummary = res.summary.toLowerCase().includes(query);
      const matchTopic = res.topic.toLowerCase().includes(query);
      const matchTags = res.tags.some((t) => t.toLowerCase().includes(query));
      if (!matchTitle && !matchSummary && !matchTopic && !matchTags) {
        return false;
      }
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-kannada">

      {/* ─── Sticky Header with search ─── */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-gray-100 shadow-sm">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
          <Link href="/dashboard" className="text-xl font-extrabold text-orange-600 shrink-0">
            ಪ್ರತಿಭಾ ಕನ್ನಡ
          </Link>

          {/* Search bar */}
          <form action="/dashboard" method="GET" className="flex-1 flex gap-2 max-w-xl" id="dash-search-form">
            {activeClass && <input type="hidden" name="class" value={activeClass} />}
            {activeCat && <input type="hidden" name="cat" value={activeCat} />}
            <div className="relative flex-1">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
              <input
                id="dash-search-input"
                name="q"
                type="search"
                defaultValue={params.q ?? ''}
                placeholder="ಹುಡುಕಿ — ಸಂಧಿ, ಯುದ್ಧ, ಗಾದೆ, 2025 ಪೇಪರ್, ಕುವೆಂಪು..."
                className="input pl-9 py-2 text-sm rounded-full w-full"
                aria-label="ಸಂಪನ್ಮೂಲ ಹುಡುಕಿ"
              />
            </div>
            <button type="submit" id="dash-search-btn" className="btn-primary text-sm px-5 shrink-0">
              ಹುಡುಕಿ
            </button>
          </form>

          {/* Student profile & Admin */}
          <div className="flex items-center gap-3 shrink-0">
            <Link
              href="/admin"
              className="text-xs text-slate-500 hover:text-orange-600 bg-slate-100 hover:bg-orange-50 px-2.5 py-1.5 rounded-lg font-medium transition"
              title="ಬಳಕೆದಾರರ ವರದಿ ಮತ್ತು ಅಂಕಿಅಂಶ"
            >
              ಬಳಕೆದಾರರ ಮಾಹಿತಿ
            </Link>

            {currentStudent ? (
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-orange-500 to-pink-500 text-white flex items-center justify-center font-bold text-xs shadow-sm">
                  {currentStudent.name.charAt(0).toUpperCase()}
                </div>
                <div className="hidden md:block text-left">
                  <div className="text-xs font-bold text-gray-800 leading-tight">
                    {currentStudent.name}
                  </div>
                  <div className="text-[10px] text-emerald-600 font-medium">
                    ಉಚಿತ ಪ್ರವೇಶ
                  </div>
                </div>
                <form action="/api/auth/logout" method="POST">
                  <button type="submit" className="text-xs text-gray-400 hover:text-red-600 ml-1">
                    ಲಾಗ್ ಔಟ್
                  </button>
                </form>
              </div>
            ) : (
              <Link href="/login" className="btn-outline text-xs px-3 py-1.5">
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
          <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-orange-500 to-pink-500 text-white flex items-center justify-between shadow-sm">
            <div>
              <h3 className="font-bold text-sm">ಸ್ವಾಗತ! ನಿಮ್ಮ ಖಾತೆ ಸಕ್ರಿಯವಾಗಿದೆ.</h3>
              <p className="text-xs text-orange-100">ಎಲ್ಲಾ ನೋಟ್ಸ್, ಪ್ರಶ್ನೆ ಪತ್ರಿಕೆ ಮತ್ತು ವ್ಯಾಕರಣ ಸಂಪೂರ್ಣ ಉಚಿತವಾಗಿ ಲಭ್ಯವಿದೆ.</p>
            </div>
            <Link href="/dashboard" className="text-xs bg-white text-orange-700 px-3 py-1.5 rounded-full font-bold">
              ಸರಿ
            </Link>
          </div>
        )}

        {/* ─── Class filter tabs ─── */}
        <section className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">ತರಗತಿ ಆಯ್ಕೆಮಾಡಿ</h2>
            {activeClass && (
              <Link href={activeCat ? `/dashboard?cat=${activeCat}` : '/dashboard'} className="text-xs text-orange-600 hover:underline">
                ಎಲ್ಲಾ ತರಗತಿಗಳನ್ನು ತೋರಿಸಿ
              </Link>
            )}
          </div>
          <div className="flex flex-wrap gap-2" role="group" aria-label="ತರಗತಿ ಫಿಲ್ಟರ್">
            <Link
              href={activeCat ? `/dashboard?cat=${activeCat}` : '/dashboard'}
              id="class-filter-all"
              className={`pill ${!activeClass ? 'pill-active' : 'pill-inactive'}`}
            >
              ಎಲ್ಲಾ ತರಗತಿಗಳು
            </Link>
            {CLASSES.map((c) => (
              <Link
                key={c.slug}
                href={`/dashboard?class=${c.slug}${activeCat ? `&cat=${activeCat}` : ''}`}
                id={`class-filter-${c.slug}`}
                className={`pill ${activeClass === c.slug ? 'pill-active' : 'pill-inactive'}`}
              >
                {c.label}
              </Link>
            ))}
          </div>
        </section>

        {/* ─── Category grid ─── */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">ವಿಷಯ ಪ್ರಕಾರ</h2>
            {activeCat && (
              <Link href={activeClass ? `/dashboard?class=${activeClass}` : '/dashboard'} className="text-xs text-orange-600 hover:underline">
                ಎಲ್ಲಾ ಪ್ರಕಾರಗಳನ್ನು ತೋರಿಸಿ
              </Link>
            )}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {CATEGORIES.map((cat) => {
              const isSelected = activeCat === cat.slug;
              return (
                <Link
                  key={cat.slug}
                  href={`/dashboard?cat=${cat.slug}${activeClass ? `&class=${activeClass}` : ''}`}
                  id={`cat-${cat.slug}`}
                  className={`p-3.5 rounded-2xl border transition-all flex items-center gap-3 group ${
                    isSelected
                      ? 'border-orange-400 bg-orange-50/80 shadow-sm ring-2 ring-orange-200'
                      : 'bg-white border-slate-200 hover:border-orange-300 hover:shadow-sm'
                  }`}
                >
                  <div className="w-9 h-9 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center font-bold text-sm group-hover:bg-orange-500 group-hover:text-white transition-colors">
                    {cat.label.charAt(0)}
                  </div>
                  <div>
                    <div className={`text-sm font-bold leading-tight ${isSelected ? 'text-orange-700' : 'text-slate-800 group-hover:text-orange-600'}`}>
                      {cat.label}
                    </div>
                    <div className="text-[11px] text-slate-400">{cat.sub}</div>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        {/* ─── Resources Listing Area ─── */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                {query
                  ? `"${query}" ಗಾಗಿ ಹುಡುಕಾಟದ ಫಲಿತಾಂಶಗಳು (${filtered.length})`
                  : activeCat
                  ? `${CATEGORIES.find((c) => c.slug === activeCat)?.label ?? ''} ಸಂಪನ್ಮೂಲಗಳು (${filtered.length})`
                  : activeClass
                  ? `${CLASSES.find((c) => c.slug === activeClass)?.label ?? ''} ಸಂಪನ್ಮೂಲಗಳು (${filtered.length})`
                  : `ಲಭ್ಯವಿರುವ ಎಲ್ಲಾ ಸಂಪನ್ಮೂಲಗಳು (${filtered.length})`}
              </h2>
              <p className="text-xs text-slate-500">
                ಯಾವುದೇ ಸಂಪನ್ಮೂಲದ ಮೇಲೆ ಕ್ಲಿಕ್ ಮಾಡಿ ಸಂಪೂರ್ಣ ವಿವರಗಳನ್ನು ಉಚಿತವಾಗಿ ಅಧ್ಯಯನ ಮಾಡಿ.
              </p>
            </div>
          </div>

          {filtered.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-200 bg-white p-12 text-center">
              <h3 className="text-base font-bold text-slate-700 mb-1">
                ಯಾವುದೇ ಸಂಪನ್ಮೂಲಗಳು ಕಂಡುಬಂದಿಲ್ಲ
              </h3>
              <p className="text-xs text-slate-400 mb-4">
                ದಯವಿಟ್ಟು ಬೇರೆ ಹುಡುಕಾಟ ಪದ ಅಥವಾ ಫಿಲ್ಟರ್ ಆಯ್ಕೆಮಾಡಿ
              </p>
              <Link href="/dashboard" className="btn-primary text-xs px-4 py-2">
                ಎಲ್ಲಾ ಸಂಪನ್ಮೂಲಗಳನ್ನು ತೋರಿಸಿ
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map((item) => (
                <article
                  key={item.id}
                  className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm hover:shadow-md hover:border-orange-300 transition-all flex flex-col justify-between group"
                >
                  <div>
                    {/* Badges */}
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-orange-100 text-orange-800">
                        {item.classGrade === 'all'
                          ? 'ಎಲ್ಲಾ ತರಗತಿಗಳು'
                          : `${item.classGrade}ನೇ ತರಗತಿ`}
                      </span>
                      <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
                        {item.category}
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className="font-bold text-slate-900 group-hover:text-orange-600 transition text-base leading-snug mb-2">
                      <Link href={`/dashboard/resource/${item.slug}`}>
                        {item.title}
                      </Link>
                    </h3>

                    {/* Summary */}
                    <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed mb-4">
                      {item.summary}
                    </p>
                  </div>

                  <div>
                    {/* Tags */}
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {item.tags.slice(0, 3).map((tag) => (
                        <span key={tag} className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md">
                          #{tag}
                        </span>
                      ))}
                    </div>

                    {/* Action buttons */}
                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                      <Link
                        href={`/dashboard/resource/${item.slug}`}
                        className="text-xs font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform"
                      >
                        <span>ಓದಿ & ಅಧ್ಯಯನ ಮಾಡಿ</span>
                        <span>→</span>
                      </Link>
                      <Link
                        href={`/dashboard/resource/${item.slug}`}
                        className="text-[11px] bg-slate-100 hover:bg-orange-100 text-slate-700 hover:text-orange-800 px-2.5 py-1 rounded-lg transition font-medium"
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
      <footer className="bg-white border-t border-slate-100 py-6 text-center text-xs text-slate-400">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>© {new Date().getFullYear()} ಪ್ರತಿಭಾ ಕನ್ನಡ — ಉಚಿತ ಶೈಕ್ಷಣಿಕ ವೇದಿಕೆ</p>
          <div className="flex items-center gap-4 text-slate-500">
            <Link href="/admin" className="hover:text-orange-600">ಅಂಕಿಅಂಶ</Link>
            <span>·</span>
            <Link href="/" className="hover:text-orange-600">ಮುಖಪುಟ</Link>
            <span>·</span>
            <Link href="/dashboard" className="hover:text-orange-600">ಸಂಪನ್ಮೂಲಗಳು</Link>
          </div>
        </div>
      </footer>

    </div>
  );
}
