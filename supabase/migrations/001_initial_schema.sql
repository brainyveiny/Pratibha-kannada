-- ============================================================
-- PRATIBHA KANNADA — Initial Database Schema
-- Run this in the Supabase SQL Editor (or via migrations)
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
-- Enable pg_trgm for Kannada text search
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- ─────────────────────────────────────────────
-- 1. PROFILES (extends Supabase auth.users)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.profiles (
  id             UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name   TEXT,
  grade          TEXT,               -- e.g. "10", "9", "8", "PUC"
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Auto-create profile on new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'display_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ─────────────────────────────────────────────
-- 2. CLASSES (10ನೇ ತರಗತಿ, 9ನೇ ತರಗತಿ, etc.)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.classes (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        TEXT NOT NULL,               -- "10ನೇ ತರಗತಿ"
  name_en     TEXT,                        -- "Class 10"
  slug        TEXT NOT NULL UNIQUE,        -- "class-10"
  sort_order  INT NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────────
-- 3. SUBJECTS (ಕನ್ನಡ, ಗಣಿತ, etc.)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.subjects (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  class_id    UUID REFERENCES public.classes(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  name_en     TEXT,
  slug        TEXT NOT NULL,
  sort_order  INT NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (class_id, slug)
);

-- ─────────────────────────────────────────────
-- 4. CATEGORIES (ಗದ್ಯ, ಪದ್ಯ, ವ್ಯಾಕರಣ, etc.)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.categories (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  subject_id  UUID REFERENCES public.subjects(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  name_en     TEXT,
  slug        TEXT NOT NULL,
  sort_order  INT NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (subject_id, slug)
);

-- ─────────────────────────────────────────────
-- 5. TOPICS (ಪಾಠ 01, ಸಂಧಿ, etc.)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.topics (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category_id  UUID REFERENCES public.categories(id) ON DELETE CASCADE,
  name         TEXT NOT NULL,
  name_en      TEXT,
  slug         TEXT NOT NULL,
  description  TEXT,
  sort_order   INT NOT NULL DEFAULT 0,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (category_id, slug)
);

-- ─────────────────────────────────────────────
-- 6. RESOURCES (the actual content items)
-- ─────────────────────────────────────────────
CREATE TYPE public.resource_type AS ENUM (
  'notes',
  'question_paper',
  'previous_year_paper',
  'qa',
  'essay',
  'practice',
  'textbook',
  'grammar',
  'other'
);

CREATE TABLE IF NOT EXISTS public.resources (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  topic_id       UUID REFERENCES public.topics(id) ON DELETE SET NULL,
  title          TEXT NOT NULL,
  title_kn       TEXT,                 -- Kannada title
  description    TEXT,
  resource_type  public.resource_type NOT NULL DEFAULT 'notes',
  file_url       TEXT,                 -- Supabase Storage URL
  thumbnail_url  TEXT,
  year           INT,                  -- for question papers
  is_published   BOOLEAN NOT NULL DEFAULT FALSE,
  view_count     INT NOT NULL DEFAULT 0,
  search_vector  TSVECTOR,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Full-text search index (Kannada + English)
CREATE INDEX IF NOT EXISTS resources_search_idx
  ON public.resources USING GIN (search_vector);

-- Trigram index for partial/fuzzy search
CREATE INDEX IF NOT EXISTS resources_title_trgm_idx
  ON public.resources USING GIN (title gin_trgm_ops);

CREATE INDEX IF NOT EXISTS resources_title_kn_trgm_idx
  ON public.resources USING GIN (title_kn gin_trgm_ops);

CREATE INDEX IF NOT EXISTS resources_published_idx
  ON public.resources (is_published);

-- Auto-update search_vector
CREATE OR REPLACE FUNCTION public.resources_search_vector_update()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector := to_tsvector('simple',
    COALESCE(NEW.title, '') || ' ' ||
    COALESCE(NEW.title_kn, '') || ' ' ||
    COALESCE(NEW.description, '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS resources_search_vector_trigger ON public.resources;
CREATE TRIGGER resources_search_vector_trigger
  BEFORE INSERT OR UPDATE ON public.resources
  FOR EACH ROW EXECUTE FUNCTION public.resources_search_vector_update();

-- ─────────────────────────────────────────────
-- 7. QUESTION PAPERS (structured metadata)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.question_papers (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  resource_id  UUID REFERENCES public.resources(id) ON DELETE CASCADE,
  class_id     UUID REFERENCES public.classes(id) ON DELETE SET NULL,
  subject_id   UUID REFERENCES public.subjects(id) ON DELETE SET NULL,
  board        TEXT DEFAULT 'KSEAB',
  exam_year    INT NOT NULL,
  exam_month   TEXT,
  file_url     TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────────
-- 8. FAVORITES (user-specific)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.favorites (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id      UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  resource_id  UUID NOT NULL REFERENCES public.resources(id) ON DELETE CASCADE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, resource_id)
);

-- ─────────────────────────────────────────────
-- 9. RECENT VIEWS
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.recent_views (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id      UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  resource_id  UUID NOT NULL REFERENCES public.resources(id) ON DELETE CASCADE,
  viewed_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, resource_id)
);

CREATE INDEX IF NOT EXISTS recent_views_user_idx ON public.recent_views (user_id, viewed_at DESC);

-- ─────────────────────────────────────────────
-- ROW LEVEL SECURITY
-- ─────────────────────────────────────────────

-- profiles: users can read/update only their own
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "profiles_select_own" ON public.profiles
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- classes, subjects, categories, topics: public read
ALTER TABLE public.classes    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subjects   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.topics     ENABLE ROW LEVEL SECURITY;

CREATE POLICY "classes_public_read"    ON public.classes    FOR SELECT USING (TRUE);
CREATE POLICY "subjects_public_read"   ON public.subjects   FOR SELECT USING (TRUE);
CREATE POLICY "categories_public_read" ON public.categories FOR SELECT USING (TRUE);
CREATE POLICY "topics_public_read"     ON public.topics     FOR SELECT USING (TRUE);

-- resources: published resources are public
ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;
CREATE POLICY "resources_public_read" ON public.resources
  FOR SELECT USING (is_published = TRUE);

-- question_papers: public read
ALTER TABLE public.question_papers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "qpapers_public_read" ON public.question_papers FOR SELECT USING (TRUE);

-- favorites: user owns their favorites
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
CREATE POLICY "favorites_select_own" ON public.favorites
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "favorites_insert_own" ON public.favorites
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "favorites_delete_own" ON public.favorites
  FOR DELETE USING (auth.uid() = user_id);

-- recent_views: user owns their history
ALTER TABLE public.recent_views ENABLE ROW LEVEL SECURITY;
CREATE POLICY "recent_views_select_own" ON public.recent_views
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "recent_views_upsert_own" ON public.recent_views
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ─────────────────────────────────────────────
-- ADMIN ROLE (use service_role key on server only)
-- ─────────────────────────────────────────────
-- Admin operations (INSERT/UPDATE/DELETE on content tables)
-- must be performed via Supabase service_role key in server
-- actions only. Never expose service_role key to the browser.

-- ─────────────────────────────────────────────
-- SEED: initial class data
-- ─────────────────────────────────────────────
INSERT INTO public.classes (name, name_en, slug, sort_order) VALUES
  ('10ನೇ ತರಗತಿ', 'Class 10', 'class-10', 10),
  ('9ನೇ ತರಗತಿ',  'Class 9',  'class-9',  9),
  ('8ನೇ ತರಗತಿ',  'Class 8',  'class-8',  8),
  ('7ನೇ ತರಗತಿ',  'Class 7',  'class-7',  7),
  ('6ನೇ ತರಗತಿ',  'Class 6',  'class-6',  6),
  ('ಪಿ.ಯು.ಸಿ',   'PUC',      'puc',      11),
  ('ಕನ್ನಡ ವ್ಯಾಕರಣ', 'Kannada Grammar', 'grammar', 0)
ON CONFLICT (slug) DO NOTHING;
