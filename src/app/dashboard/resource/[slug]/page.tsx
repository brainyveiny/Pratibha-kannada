import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { cache } from 'react';
import { KANNADA_RESOURCES, type ResourceItem } from '@/data/resources';
import { SearchModeToggle } from '@/components/search/SearchModeToggle';
import { getAuthContext } from '@/lib/authServer';
import { ArrowLeft, ArrowRight, ShieldCheck } from 'lucide-react';

interface ResourcePageProps {
  params: Promise<{ slug: string }>;
}

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/**
 * Unified resource resolver:
 * 1. Checks fast static catalog first.
 * 2. If not found, validates UUID format before querying Supabase.
 * 3. Enforces is_published = true for public access.
 * 4. Memoized with React cache() to avoid duplicate queries between generateMetadata and Page.
 */
const getResource = cache(async (slug: string): Promise<ResourceItem | null> => {
  // 1. Static resources check first
  const staticItem = KANNADA_RESOURCES.find((r) => r.slug === slug || r.id === slug);
  if (staticItem) {
    return staticItem;
  }

  // 2. Validate UUID format before querying Supabase
  if (!UUID_REGEX.test(slug)) {
    return null;
  }

  // 3. Check Supabase environment availability
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return null;
  }

  try {
    const { createClient } = await import('@/lib/supabase/server');
    const supabase = await createClient();

    const { data: db, error } = await supabase
      .from('resources')
      .select(`
        id,
        title,
        title_kn,
        description,
        resource_type,
        file_url,
        year,
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
      .eq('id', slug)
      .eq('is_published', true)
      .maybeSingle();

    if (error) {
      console.error('[ResourceResolver] Supabase query error for slug:', slug, error.message);
      throw new Error('Database error resolving resource');
    }

    if (!db) {
      return null;
    }

    const rawDb: any = db;
    const topicData = Array.isArray(rawDb.topics) ? rawDb.topics[0] : rawDb.topics;
    const catData = Array.isArray(topicData?.categories) ? topicData?.categories[0] : topicData?.categories;
    const subData = Array.isArray(catData?.subjects) ? catData?.subjects[0] : catData?.subjects;
    const clsData = Array.isArray(subData?.classes) ? subData?.classes[0] : subData?.classes;

    const clsSlug = (clsData?.slug || '').replace('class-', '');
    const catSlug = (catData?.slug || 'notes') as ResourceItem['category'];
    const topicName = topicData?.name || 'ಸಾಮಾನ್ಯ';
    const cleanContent = rawDb.description || '';
    const cleanSummary = cleanContent.length > 200 ? cleanContent.slice(0, 200) + '...' : cleanContent || (rawDb.title_kn || rawDb.title);

    return {
      id: rawDb.id,
      slug: rawDb.id,
      title: rawDb.title_kn || rawDb.title || 'ಶೀರ್ಷಿಕೆ ಇಲ್ಲ',
      classGrade: (clsSlug || '10') as ResourceItem['classGrade'],
      category: catSlug,
      topic: topicName,
      summary: cleanSummary,
      content: cleanContent,
      pdfUrl: rawDb.file_url || undefined,
      year: rawDb.year ? String(rawDb.year) : undefined,
      tags: [rawDb.resource_type, catSlug].filter(Boolean),
    };
  } catch (err: any) {
    // Re-throw genuine database/server errors to be handled as 500, rather than misreporting as 404
    if (err.message === 'Database error resolving resource') {
      throw err;
    }
    console.error('[ResourceResolver] Unexpected resolution error:', err.message);
    throw err;
  }
});

export async function generateMetadata({ params }: ResourcePageProps): Promise<Metadata> {
  const { slug } = await params;
  try {
    const item = await getResource(slug);
    if (!item) {
      return { title: 'ಸಂಪನ್ಮೂಲ ಸಿಗಲಿಲ್ಲ — ಪ್ರತಿಭಾ ಕನ್ನಡ' };
    }
    return {
      title: `${item.title} — ಪ್ರತಿಭಾ ಕನ್ನಡ`,
      description: item.summary,
    };
  } catch {
    return { title: 'ದೋಷ — ಪ್ರತಿಭಾ ಕನ್ನಡ' };
  }
}

export default async function ResourceDetailPage({ params }: ResourcePageProps) {
  const { slug } = await params;
  const item = await getResource(slug);
  const auth = await getAuthContext();

  if (!item) {
    notFound();
  }

  // Related resources in same class or category
  const related = KANNADA_RESOURCES.filter(
    (r) => r.slug !== slug && (r.classGrade === item.classGrade || r.category === item.category)
  ).slice(0, 3);

  return (
    <div className="min-h-screen flex flex-col font-kannada text-neutral-900 relative">

      {/* Header */}
      <header className="sticky top-0 z-50 liquid-glass border-b border-white/60">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-neutral-600 hover:text-orange-600 transition group"
          >
            <ArrowLeft className="w-4 h-4 text-neutral-500 group-hover:text-orange-600 transition" />
            <span>ಡ್ಯಾಶ್‌ಬೋರ್ಡ್‌ಗೆ ಹಿಂತಿರುಗಿ</span>
          </Link>
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <SearchModeToggle />

            {/* Authenticated Admin quick capsule */}
            {auth.isAdmin && (
              <Link
                href="/admin"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-orange-500/15 border border-orange-500/30 text-orange-950 text-xs font-semibold hover:bg-orange-500/25 transition shadow-2xs"
                title="ನಿರ್ವಾಹಕ ಕಂಟ್ರೋಲ್ ಸೆಂಟರ್"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-orange-600" />
                <span className="kn hidden sm:inline">ನಿರ್ವಾಹಕ ಪ್ಯಾನೆಲ್</span>
                <span className="kn sm:hidden">Admin</span>
              </Link>
            )}

            <Link href="/dashboard" className="text-sm font-bold text-orange-600 hidden xs:inline-flex">
              ಪ್ರತಿಭಾ ಕನ್ನಡ
            </Link>
          </div>
        </div>
      </header>

      {/* Article Container */}
      <main className="mx-auto max-w-4xl px-4 sm:px-6 py-8 flex-1 w-full">

        <article className="reading-surface rounded-3xl p-6 sm:p-10 mb-8 shadow-xs">

          {/* Top badges */}
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-orange-100 text-orange-800">
              {item.classGrade === 'all' ? 'ಎಲ್ಲಾ ತರಗತಿಗಳು' : `${item.classGrade}ನೇ ತರಗತಿ`}
            </span>
            <span className="text-xs font-medium px-3 py-1 rounded-full bg-slate-100 text-slate-700 uppercase tracking-wide">
              {item.category}
            </span>
            {item.year && (
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800">
                {item.year}
              </span>
            )}
            <span className="text-xs text-slate-400 ml-auto font-mono">
              ಉಚಿತ ಕಲಿಕಾ ಸಾಮಗ್ರಿ
            </span>
          </div>

          {/* Main Title */}
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-tight mb-4">
            {item.title}
          </h1>

          {/* Author/Source if present */}
          {item.authorOrSource && (
            <div className="flex items-center gap-2 text-xs text-slate-500 mb-6 pb-4 border-b border-slate-100">
              <span>ಮೂಲ / ಕವಿ:</span>
              <span className="font-semibold text-slate-700">{item.authorOrSource}</span>
            </div>
          )}

          {/* Summary Callout */}
          <div className="bg-orange-50/60 border-l-4 border-orange-500 p-4 rounded-r-2xl mb-8">
            <p className="text-xs sm:text-sm text-slate-700 font-medium leading-relaxed">
              {item.summary}
            </p>
          </div>

          {/* Content Body */}
          <div className="prose prose-slate max-w-none text-slate-800 leading-relaxed space-y-4">
            {item.content.split('\n\n').map((block: string, idx: number) => {
              const trimmed = block.trim();
              if (trimmed.startsWith('# ')) {
                return (
                  <h2 key={idx} className="text-xl sm:text-2xl font-bold text-slate-900 pt-4 pb-2 border-b border-slate-100">
                    {trimmed.replace('# ', '')}
                  </h2>
                );
              }
              if (trimmed.startsWith('## ')) {
                return (
                  <h3 key={idx} className="text-lg sm:text-xl font-bold text-orange-900 pt-3 pb-1">
                    {trimmed.replace('## ', '')}
                  </h3>
                );
              }
              if (trimmed.startsWith('### ')) {
                return (
                  <h4 key={idx} className="text-base font-bold text-slate-800 pt-2">
                    {trimmed.replace('### ', '')}
                  </h4>
                );
              }
              if (trimmed.startsWith('|')) {
                // Render table
                const lines = trimmed.split('\n').filter(Boolean);
                const headerLine = lines[0];
                const dataLines = lines.slice(2);
                const headers = headerLine.split('|').filter(Boolean).map((h: string) => h.trim());

                return (
                  <div key={idx} className="overflow-x-auto my-4">
                    <table className="min-w-full text-xs sm:text-sm border border-slate-200 rounded-xl overflow-hidden">
                      <thead className="bg-orange-50 text-orange-900 font-bold border-b border-slate-200">
                        <tr>
                          {headers.map((h: string, i: number) => (
                            <th key={i} className="py-2.5 px-3 text-left">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 bg-white">
                        {dataLines.map((row: string, rIdx: number) => {
                          const cols = row.split('|').filter(Boolean).map((c: string) => c.trim());
                          return (
                            <tr key={rIdx} className="hover:bg-slate-50">
                              {cols.map((col: string, cIdx: number) => (
                                <td key={cIdx} className="py-2 px-3 text-slate-700">{col}</td>
                              ))}
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                );
              }
              // Normal paragraphs or lists
              return (
                <div key={idx} className="text-sm sm:text-base leading-relaxed whitespace-pre-line text-slate-700">
                  {trimmed}
                </div>
              );
            })}
          </div>

          {/* Action Row */}
          <div className="mt-10 pt-6 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap gap-2">
              {item.tags.map((tag: string) => (
                <span key={tag} className="text-xs bg-slate-100 text-slate-600 px-3 py-1 rounded-full">
                  #{tag}
                </span>
              ))}
            </div>

            <div className="flex items-center gap-3">
              {item.pdfUrl && /^(https?:\/\/|\/)/i.test(item.pdfUrl) && (
                <a
                  href={item.pdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-orange-600 text-white text-xs font-bold hover:bg-orange-700 transition shadow-xs"
                >
                  <span>ಡೌನ್‌ಲೋಡ್ (PDF)</span>
                  <span>↓</span>
                </a>
              )}
              <Link
                href="/dashboard"
                className="btn-primary text-xs px-5 py-2.5"
              >
                <span>ಇನ್ನಷ್ಟು ಸಂಪನ್ಮೂಲಗಳನ್ನು ಓದಿ</span>
                <ArrowRight className="w-3.5 h-3.5 inline" />
              </Link>
            </div>
          </div>

        </article>

        {/* Related resources */}
        {related.length > 0 && (
          <section>
            <h2 className="text-base font-bold text-neutral-800 mb-4 kn">
              ಸಂಬಂಧಿತ ಇತರ ಸಂಪನ್ಮೂಲಗಳು:
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {related.map((rel) => (
                <Link
                  key={rel.id}
                  href={`/dashboard/resource/${rel.slug}`}
                  className="liquid-glass-card p-4 rounded-2xl flex flex-col justify-between group"
                >
                  <div>
                    <span className="text-[10px] font-bold text-orange-600 uppercase mb-1 block">
                      {rel.category}
                    </span>
                    <h3 className="text-xs sm:text-sm font-bold text-neutral-900 group-hover:text-orange-600 transition leading-snug kn">
                      {rel.title}
                    </h3>
                  </div>
                  <span className="text-xs text-orange-600 font-semibold mt-3 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                    <span>ಓದಿ</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </Link>
              ))}
            </div>
          </section>
        )}

      </main>

      {/* Footer */}
      <footer className="bg-white/80 backdrop-blur-md border-t border-neutral-200/60 py-6 text-center text-xs text-neutral-500">
        <p className="kn">© {new Date().getFullYear()} ಪ್ರತಿಭಾ ಕನ್ನಡ — ಉಚಿತ ಶೈಕ್ಷಣಿಕ ವೇದಿಕೆ</p>
      </footer>

    </div>
  );
}
