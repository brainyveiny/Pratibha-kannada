import fs from 'fs';
import { KANNADA_RESOURCES } from '../src/data/resources.ts';

function escapeSql(str) {
  if (!str) return 'NULL';
  return `'${str.replace(/'/g, "''")}'`;
}

let sql = `-- ============================================================
-- PRATIBHA KANNADA — Database Seed File
-- Populates categories, topics, and educational resources
-- ============================================================

-- Ensure Kannada subject exists for classes
INSERT INTO public.subjects (id, class_id, name, name_en, slug, sort_order)
SELECT 
  gen_random_uuid(),
  c.id,
  'ಕನ್ನಡ',
  'Kannada',
  'kannada',
  1
FROM public.classes c
ON CONFLICT (class_id, slug) DO NOTHING;

`;

// Group resources by category & topic
const categoriesMap = new Map();
for (const res of KANNADA_RESOURCES) {
  const catSlug = res.category;
  if (!categoriesMap.has(catSlug)) {
    categoriesMap.set(catSlug, new Set());
  }
  categoriesMap.get(catSlug).add(res.topic);
}

// Generate category inserts
sql += `-- Categories\n`;
const categoryNames = {
  'notes': { kn: 'ನೋಟ್ಸ್', en: 'Notes' },
  'grammar': { kn: 'ವ್ಯಾಕರಣ', en: 'Grammar' },
  'question-papers': { kn: 'ಪ್ರಶ್ನೆ ಪತ್ರಿಕೆ', en: 'Question Papers' },
  'previous-year': { kn: 'ಹಿಂದಿನ ಪ್ರಶ್ನೆ ಪತ್ರಿಕೆ', en: 'Previous Year Papers' },
  'qa': { kn: 'ಪ್ರಶ್ನೋತ್ತರ', en: 'Q & A' },
  'essay': { kn: 'ಪ್ರಬಂಧ & ಗಾದೆ', en: 'Essays & Sayings' },
  'poets': { kn: 'ಕವಿ ಪರಿಚಯ', en: 'Authors & Poets' },
  'practice': { kn: 'ಅಭ್ಯಾಸ ಪರೀಕ್ಷೆ', en: 'Practice' },
};

for (const [catSlug, topics] of categoriesMap.entries()) {
  const meta = categoryNames[catSlug] || { kn: catSlug, en: catSlug };
  sql += `
INSERT INTO public.categories (id, subject_id, name, name_en, slug, sort_order)
SELECT gen_random_uuid(), s.id, ${escapeSql(meta.kn)}, ${escapeSql(meta.en)}, ${escapeSql(catSlug)}, 1
FROM public.subjects s
WHERE s.slug = 'kannada'
ON CONFLICT (subject_id, slug) DO NOTHING;
`;
}

sql += `\n-- Resources\n`;
for (const res of KANNADA_RESOURCES) {
  const resType = (res.category === 'question-papers' || res.category === 'previous-year')
    ? 'question_paper'
    : (res.category === 'grammar')
    ? 'grammar'
    : (res.category === 'essay')
    ? 'essay'
    : (res.category === 'practice')
    ? 'practice'
    : (res.category === 'qa')
    ? 'qa'
    : 'notes';

  const yearNum = res.year ? parseInt(res.year.replace(/\D/g, '')) || null : null;

  sql += `
INSERT INTO public.resources (
  title,
  title_kn,
  description,
  resource_type,
  year,
  is_published
) VALUES (
  ${escapeSql(res.title)},
  ${escapeSql(res.topic)},
  ${escapeSql(res.summary)},
  '${resType}',
  ${yearNum ? yearNum : 'NULL'},
  TRUE
);
`;
}

fs.writeFileSync('supabase/seed.sql', sql, 'utf-8');
console.log('Successfully generated supabase/seed.sql');
