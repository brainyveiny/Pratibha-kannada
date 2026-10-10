import { NextResponse, type NextRequest } from 'next/server';
import { getSearchSuggestions } from '@/lib/searchSuggestions';
import { KANNADA_RESOURCES, type ResourceItem } from '@/data/resources';
import { createClient } from '@supabase/supabase-js';

// In-memory cache for dynamic published resources to avoid round-tripping to Supabase on every keystroke
let cachedDbResources: ResourceItem[] | null = null;
let lastCacheTime = 0;
const CACHE_TTL_MS = 60 * 1000; // 1 minute

async function getPublishedResources(): Promise<ResourceItem[]> {
  const now = Date.now();
  if (cachedDbResources && now - lastCacheTime < CACHE_TTL_MS) {
    return cachedDbResources;
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    return KANNADA_RESOURCES;
  }

  try {
    const supabase = createClient(url, anonKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const { data: dbRows, error } = await supabase
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

    if (error || !dbRows) {
      return KANNADA_RESOURCES;
    }

    const mapped: ResourceItem[] = dbRows.map((db: any) => {
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
        tags: [db.resource_type || 'notes', catSlug],
      };
    });

    // Merge static + database resources uniquely
    const seen = new Set<string>();
    const combined: ResourceItem[] = [];
    for (const item of [...mapped, ...KANNADA_RESOURCES]) {
      const key = item.id || item.slug;
      if (!seen.has(key)) {
        seen.add(key);
        combined.push(item);
      }
    }

    cachedDbResources = combined;
    lastCacheTime = now;
    return combined;
  } catch {
    return KANNADA_RESOURCES;
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const q = (searchParams.get('q') || '').trim();
  const mode = (searchParams.get('mode') || 'kannada') as 'kn' | 'en' | 'kannada' | 'english';
  const classGrade = searchParams.get('class') || undefined;
  const category = searchParams.get('cat') || searchParams.get('category') || undefined;
  const limitParam = parseInt(searchParams.get('limit') || '8', 10);
  const limit = isNaN(limitParam) ? 8 : Math.min(Math.max(limitParam, 1), 15);

  if (!q) {
    return NextResponse.json({
      success: true,
      query: '',
      suggestions: [],
    });
  }

  const allResources = await getPublishedResources();
  const suggestions = getSearchSuggestions(
    q,
    mode,
    { classGrade, category, limit },
    allResources
  );

  return NextResponse.json(
    {
      success: true,
      query: q,
      mode,
      suggestions,
    },
    {
      headers: {
        'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=120',
      },
    }
  );
}
