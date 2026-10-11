import { NextResponse, type NextRequest } from 'next/server';
import { verifyAdminAccess, validateCsrfOrigin } from '@/lib/security';
import { createClient } from '@supabase/supabase-js';

function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

// ─────────────────────────────────────────────────────────────
// 1. GET: Fetch Content Overview, Hierarchy & Resources
// ─────────────────────────────────────────────────────────────
export async function GET(request: NextRequest) {
  const adminCheck = verifyAdminAccess(request);
  if (!adminCheck.authorized) {
    return NextResponse.json(
      { error: 'ಕೇವಲ ನಿರ್ವಾಹಕರಿಗೆ ಮಾತ್ರ ಪ್ರವೇಶವಿದೆ (Admin authorization required)' },
      { status: 403 }
    );
  }

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return NextResponse.json(
      { error: 'Supabase configuration missing on server' },
      { status: 500 }
    );
  }

  const { searchParams } = new URL(request.url);
  const q = (searchParams.get('q') || '').trim();
  const classFilter = searchParams.get('class') || '';
  const statusFilter = searchParams.get('status') || ''; // 'published', 'draft', or '' (all)

  try {
    // 1. Fetch counts
    const { count: totalResources } = await supabase
      .from('resources')
      .select('*', { count: 'exact', head: true });

    const { count: publishedCount } = await supabase
      .from('resources')
      .select('*', { count: 'exact', head: true })
      .eq('is_published', true);

    const { count: draftCount } = await supabase
      .from('resources')
      .select('*', { count: 'exact', head: true })
      .eq('is_published', false);

    // 2. Fetch classes & categories hierarchy (supported academic levels only: Class 8, 9, 10, 1st & 2nd PUC)
    const { data: rawClasses } = await supabase
      .from('classes')
      .select('id, name, name_en, slug, sort_order')
      .order('sort_order', { ascending: false });

    const classes = (rawClasses || []).filter(
      (c) => c.slug !== 'class-6' && c.slug !== 'class-7'
    );

    const { data: categories } = await supabase
      .from('categories')
      .select('id, name, name_en, slug, subject_id')
      .order('sort_order', { ascending: true });

    // 3. Query resources with topic relations
    let query = supabase
      .from('resources')
      .select(`
        id,
        title,
        title_kn,
        description,
        resource_type,
        file_url,
        thumbnail_url,
        year,
        is_published,
        view_count,
        created_at,
        updated_at,
        topics (
          id,
          name,
          slug,
          categories (
            id,
            name,
            slug,
            subjects (
              id,
              name,
              classes (
                id,
                name,
                slug
              )
            )
          )
        )
      `)
      .order('created_at', { ascending: false });

    if (statusFilter === 'published') {
      query = query.eq('is_published', true);
    } else if (statusFilter === 'draft') {
      query = query.eq('is_published', false);
    }

    if (q) {
      query = query.or(`title.ilike.%${q}%,title_kn.ilike.%${q}%,description.ilike.%${q}%`);
    }

    const { data: resources, error: resError } = await query;
    if (resError) throw resError;

    // Filter by class client-side if requested (through the joined relation)
    let filteredResources = resources || [];
    if (classFilter) {
      filteredResources = filteredResources.filter((r: any) => {
        const cls = r.topics?.categories?.subjects?.classes?.slug;
        return cls === classFilter;
      });
    }

    return NextResponse.json({
      success: true,
      stats: {
        total: totalResources || 0,
        published: publishedCount || 0,
        draft: draftCount || 0,
      },
      classes: classes || [],
      categories: categories || [],
      resources: filteredResources,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Failed to fetch content data' },
      { status: 500 }
    );
  }
}

// ─────────────────────────────────────────────────────────────
// 2. POST: Create New Educational Resource (Draft or Published)
// ─────────────────────────────────────────────────────────────
export async function POST(request: NextRequest) {
  if (!validateCsrfOrigin(request)) {
    return NextResponse.json({ error: 'CSRF validation failed' }, { status: 403 });
  }

  const adminCheck = verifyAdminAccess(request);
  if (!adminCheck.authorized) {
    return NextResponse.json({ error: 'Admin authorization required' }, { status: 403 });
  }

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return NextResponse.json({ error: 'Database client unavailable' }, { status: 500 });
  }

  try {
    const body = await request.json();
    const {
      title,
      title_kn,
      description,
      resource_type = 'notes',
      file_url,
      year,
      is_published = false, // Defaults safely to DRAFT
      class_id,
      category_slug,
      topic_name,
    } = body;

    if (!title || typeof title !== 'string' || title.trim().length === 0) {
      return NextResponse.json({ error: 'ಶೀರ್ಷಿಕೆ ಕಡ್ಡಾಯವಾಗಿದೆ (Title is required)' }, { status: 400 });
    }

    let topicId: string | null = null;

    // If class and category are specified, resolve or create the topic
    if (class_id && category_slug) {
      // Find subject for this class
      const { data: sub } = await supabase
        .from('subjects')
        .select('id')
        .eq('class_id', class_id)
        .eq('slug', 'kannada')
        .maybeSingle();

      if (sub) {
        const { data: cat } = await supabase
          .from('categories')
          .select('id')
          .eq('subject_id', sub.id)
          .eq('slug', category_slug)
          .maybeSingle();

        if (cat) {
          const tName = (topic_name || title_kn || title || 'ಸಾಮಾನ್ಯ').trim();
          const tSlug = tName
            .toLowerCase()
            .replace(/[^\w\u0C80-\u0CFF]+/g, '-')
            .slice(0, 50);

          // Find or create topic
          const { data: existingTopic } = await supabase
            .from('topics')
            .select('id')
            .eq('category_id', cat.id)
            .eq('slug', tSlug)
            .maybeSingle();

          if (existingTopic) {
            topicId = existingTopic.id;
          } else {
            const { data: newTopic } = await supabase
              .from('topics')
              .insert({
                category_id: cat.id,
                name: tName,
                name_en: title,
                slug: tSlug,
                sort_order: 1,
              })
              .select('id')
              .single();

            topicId = newTopic?.id || null;
          }
        }
      }
    }

    const { data: resource, error: insertErr } = await supabase
      .from('resources')
      .insert({
        topic_id: topicId,
        title: title.trim(),
        title_kn: (title_kn || title).trim(),
        description: (description || '').trim(),
        resource_type,
        file_url: file_url || null,
        year: year ? parseInt(year, 10) : null,
        is_published: Boolean(is_published),
      })
      .select('*')
      .single();

    if (insertErr) throw insertErr;

    // If question paper type, also link in question_papers table
    if (resource_type === 'question_paper' || resource_type === 'previous_year_paper') {
      await supabase.from('question_papers').insert({
        resource_id: resource.id,
        class_id: class_id || null,
        board: 'KSEAB',
        exam_year: year ? parseInt(year, 10) : new Date().getFullYear(),
        file_url: file_url || null,
      });
    }

    return NextResponse.json({
      success: true,
      resource,
      message: is_published ? 'ಸಂಪನ್ಮೂಲ ಯಶಸ್ವಿಯಾಗಿ ಪ್ರಕಟಿಸಲಾಗಿದೆ' : 'ಕರಡು ಉಳಿಸಲಾಗಿದೆ (Saved as Draft)',
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Resource creation failed' }, { status: 500 });
  }
}

// ─────────────────────────────────────────────────────────────
// 3. PUT: Update Resource (Title, PDF, or Publish/Draft Status)
// ─────────────────────────────────────────────────────────────
export async function PUT(request: NextRequest) {
  if (!validateCsrfOrigin(request)) {
    return NextResponse.json({ error: 'CSRF validation failed' }, { status: 403 });
  }

  const adminCheck = verifyAdminAccess(request);
  if (!adminCheck.authorized) {
    return NextResponse.json({ error: 'Admin authorization required' }, { status: 403 });
  }

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return NextResponse.json({ error: 'Database client unavailable' }, { status: 500 });
  }

  try {
    const body = await request.json();
    const { id, title, title_kn, description, file_url, is_published, resource_type } = body;

    if (!id) {
      return NextResponse.json({ error: 'Resource ID is required' }, { status: 400 });
    }

    const updates: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };

    if (title !== undefined) updates.title = title.trim();
    if (title_kn !== undefined) updates.title_kn = title_kn.trim();
    if (description !== undefined) updates.description = description.trim();
    if (file_url !== undefined) updates.file_url = file_url;
    if (is_published !== undefined) updates.is_published = Boolean(is_published);
    if (resource_type !== undefined) updates.resource_type = resource_type;

    const { data: updated, error: updateErr } = await supabase
      .from('resources')
      .update(updates)
      .eq('id', id)
      .select('*')
      .single();

    if (updateErr) throw updateErr;

    return NextResponse.json({
      success: true,
      resource: updated,
      message: 'ಸಂಪನ್ಮೂಲ ಯಶಸ್ವಿಯಾಗಿ ನವೀಕರಿಸಲಾಗಿದೆ (Updated successfully)',
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Update failed' }, { status: 500 });
  }
}

// ─────────────────────────────────────────────────────────────
// 4. DELETE: Delete Resource
// ─────────────────────────────────────────────────────────────
export async function DELETE(request: NextRequest) {
  if (!validateCsrfOrigin(request)) {
    return NextResponse.json({ error: 'CSRF validation failed' }, { status: 403 });
  }

  const adminCheck = verifyAdminAccess(request);
  if (!adminCheck.authorized) {
    return NextResponse.json({ error: 'Admin authorization required' }, { status: 403 });
  }

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return NextResponse.json({ error: 'Database client unavailable' }, { status: 500 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Resource ID is required' }, { status: 400 });
    }

    const { error: delErr } = await supabase.from('resources').delete().eq('id', id);
    if (delErr) throw delErr;

    return NextResponse.json({
      success: true,
      message: 'ಸಂಪನ್ಮೂಲವನ್ನು ಅಳಿಸಲಾಗಿದೆ (Resource deleted successfully)',
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Delete failed' }, { status: 500 });
  }
}
