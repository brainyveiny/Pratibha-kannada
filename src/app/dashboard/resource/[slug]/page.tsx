import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { KANNADA_RESOURCES } from '@/data/resources';

interface ResourcePageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ResourcePageProps): Promise<Metadata> {
  const { slug } = await params;
  const item = KANNADA_RESOURCES.find((r) => r.slug === slug);
  if (!item) {
    return { title: 'ಸಂಪನ್ಮೂಲ ಸಿಗಲಿಲ್ಲ — ಪ್ರತಿಭಾ ಕನ್ನಡ' };
  }
  return {
    title: `${item.title} — ಪ್ರತಿಭಾ ಕನ್ನಡ`,
    description: item.summary,
  };
}

export default async function ResourceDetailPage({ params }: ResourcePageProps) {
  const { slug } = await params;
  const item = KANNADA_RESOURCES.find((r) => r.slug === slug);

  if (!item) {
    notFound();
  }

  // Related resources in same class or category
  const related = KANNADA_RESOURCES.filter(
    (r) => r.slug !== slug && (r.classGrade === item.classGrade || r.category === item.category)
  ).slice(0, 3);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-kannada">

      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-gray-100 shadow-xs">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 py-3 flex items-center justify-between">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-orange-600 transition"
          >
            <span>←</span>
            <span>ಡ್ಯಾಶ್‌ಬೋರ್ಡ್‌ಗೆ ಹಿಂತಿರುಗಿ</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="text-sm font-bold text-orange-600">
              ಪ್ರತಿಭಾ ಕನ್ನಡ
            </Link>
          </div>
        </div>
      </header>

      {/* Article Container */}
      <main className="mx-auto max-w-4xl px-4 sm:px-6 py-8 flex-1 w-full">

        <article className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 sm:p-10 mb-8">

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
            {item.content.split('\n\n').map((block, idx) => {
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
                const headers = headerLine.split('|').filter(Boolean).map(h => h.trim());

                return (
                  <div key={idx} className="overflow-x-auto my-4">
                    <table className="min-w-full text-xs sm:text-sm border border-slate-200 rounded-xl overflow-hidden">
                      <thead className="bg-orange-50 text-orange-900 font-bold border-b border-slate-200">
                        <tr>
                          {headers.map((h, i) => (
                            <th key={i} className="py-2.5 px-3 text-left">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 bg-white">
                        {dataLines.map((row, rIdx) => {
                          const cols = row.split('|').filter(Boolean).map(c => c.trim());
                          return (
                            <tr key={rIdx} className="hover:bg-slate-50">
                              {cols.map((col, cIdx) => (
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
              {item.tags.map((tag) => (
                <span key={tag} className="text-xs bg-slate-100 text-slate-600 px-3 py-1 rounded-full">
                  #{tag}
                </span>
              ))}
            </div>

            <Link
              href="/dashboard"
              className="btn-primary text-xs px-5 py-2.5"
            >
              ಇನ್ನಷ್ಟು ಸಂಪನ್ಮೂಲಗಳನ್ನು ಓದಿ →
            </Link>
          </div>

        </article>

        {/* Related resources */}
        {related.length > 0 && (
          <section>
            <h2 className="text-base font-bold text-slate-800 mb-4">
              ಸಂಬಂಧಿತ ಇತರ ಸಂಪನ್ಮೂಲಗಳು:
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {related.map((rel) => (
                <Link
                  key={rel.id}
                  href={`/dashboard/resource/${rel.slug}`}
                  className="bg-white p-4 rounded-2xl border border-slate-200 hover:border-orange-300 hover:shadow-xs transition group flex flex-col justify-between"
                >
                  <div>
                    <span className="text-[10px] font-bold text-orange-600 uppercase mb-1 block">
                      {rel.category}
                    </span>
                    <h3 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-orange-600 transition leading-snug">
                      {rel.title}
                    </h3>
                  </div>
                  <span className="text-xs text-orange-500 font-semibold mt-3 flex items-center gap-1">
                    ಓದಿ →
                  </span>
                </Link>
              ))}
            </div>
          </section>
        )}

      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-100 py-6 text-center text-xs text-slate-400">
        <p>© {new Date().getFullYear()} ಪ್ರತಿಭಾ ಕನ್ನಡ — ಉಚಿತ ಶೈಕ್ಷಣಿಕ ವೇದಿಕೆ</p>
      </footer>

    </div>
  );
}
