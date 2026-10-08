-- ============================================================
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

-- Categories

INSERT INTO public.categories (id, subject_id, name, name_en, slug, sort_order)
SELECT gen_random_uuid(), s.id, 'ನೋಟ್ಸ್', 'Notes', 'notes', 1
FROM public.subjects s
WHERE s.slug = 'kannada'
ON CONFLICT (subject_id, slug) DO NOTHING;

INSERT INTO public.categories (id, subject_id, name, name_en, slug, sort_order)
SELECT gen_random_uuid(), s.id, 'ವ್ಯಾಕರಣ', 'Grammar', 'grammar', 1
FROM public.subjects s
WHERE s.slug = 'kannada'
ON CONFLICT (subject_id, slug) DO NOTHING;

INSERT INTO public.categories (id, subject_id, name, name_en, slug, sort_order)
SELECT gen_random_uuid(), s.id, 'ಪ್ರಶ್ನೆ ಪತ್ರಿಕೆ', 'Question Papers', 'question-papers', 1
FROM public.subjects s
WHERE s.slug = 'kannada'
ON CONFLICT (subject_id, slug) DO NOTHING;

INSERT INTO public.categories (id, subject_id, name, name_en, slug, sort_order)
SELECT gen_random_uuid(), s.id, 'ಹಿಂದಿನ ಪ್ರಶ್ನೆ ಪತ್ರಿಕೆ', 'Previous Year Papers', 'previous-year', 1
FROM public.subjects s
WHERE s.slug = 'kannada'
ON CONFLICT (subject_id, slug) DO NOTHING;

INSERT INTO public.categories (id, subject_id, name, name_en, slug, sort_order)
SELECT gen_random_uuid(), s.id, 'ಕವಿ ಪರಿಚಯ', 'Authors & Poets', 'poets', 1
FROM public.subjects s
WHERE s.slug = 'kannada'
ON CONFLICT (subject_id, slug) DO NOTHING;

INSERT INTO public.categories (id, subject_id, name, name_en, slug, sort_order)
SELECT gen_random_uuid(), s.id, 'ಪ್ರಬಂಧ & ಗಾದೆ', 'Essays & Sayings', 'essay', 1
FROM public.subjects s
WHERE s.slug = 'kannada'
ON CONFLICT (subject_id, slug) DO NOTHING;

INSERT INTO public.categories (id, subject_id, name, name_en, slug, sort_order)
SELECT gen_random_uuid(), s.id, 'ಪ್ರಶ್ನೋತ್ತರ', 'Q & A', 'qa', 1
FROM public.subjects s
WHERE s.slug = 'kannada'
ON CONFLICT (subject_id, slug) DO NOTHING;

INSERT INTO public.categories (id, subject_id, name, name_en, slug, sort_order)
SELECT gen_random_uuid(), s.id, 'ಅಭ್ಯಾಸ ಪರೀಕ್ಷೆ', 'Practice', 'practice', 1
FROM public.subjects s
WHERE s.slug = 'kannada'
ON CONFLICT (subject_id, slug) DO NOTHING;

-- Resources

INSERT INTO public.resources (
  title,
  title_kn,
  description,
  resource_type,
  year,
  is_published
) VALUES (
  '10ನೇ ತರಗತಿ ಗದ್ಯ 1: ಯುದ್ಧ — ಸಾರಾಂಶ ಮತ್ತು ಪ್ರಶ್ನೋತ್ತರ',
  'ಯುದ್ಧ',
  'ಯುದ್ಧ ಪಾಠದ ಸಂಪೂರ್ಣ ಸಾರಾಂಶ, ಲೇಖಕಿ ಪರಿಚಯ, ಮುಖ್ಯ ಅಂಶಗಳು ಮತ್ತು ಪರೀಕ್ಷೋಪಯೋಗಿ ಪ್ರಶ್ನೋತ್ತರ.',
  'notes',
  NULL,
  TRUE
);

INSERT INTO public.resources (
  title,
  title_kn,
  description,
  resource_type,
  year,
  is_published
) VALUES (
  '10ನೇ ತರಗತಿ ಗದ್ಯ 2: ಶಬರಿ — ಸಾರಾಂಶ ಮತ್ತು ಪ್ರಶ್ನೋತ್ತರ',
  'ಶಬರಿ',
  'ಪು.ತಿ.ನ ಅವರ ಗೀತ ನಾಟಕ ಶಬರಿಯ ಸಾರಾಂಶ, ಪಾತ್ರ ಪರಿಚಯ ಮತ್ತು ಪ್ರಶ್ನೋತ್ತರ.',
  'notes',
  NULL,
  TRUE
);

INSERT INTO public.resources (
  title,
  title_kn,
  description,
  resource_type,
  year,
  is_published
) VALUES (
  '10ನೇ ತರಗತಿ ಗದ್ಯ 3: ಹಲಗಲಿ ಬೇಡರು — ಸಾರಾಂಶ ಮತ್ತು ಪ್ರಶ್ನೋತ್ತರ',
  'ಹಲಗಲಿ ಬೇಡರು',
  'ಬ್ರಿಟಿಷ್ ವಿರೋಧಿ ಸಶಸ್ತ್ರ ಹೋರಾಟ ನಡೆಸಿದ ಹಲಗಲಿ ಬೇಡರ ಶೌರ್ಯ ಗಾಥೆ.',
  'notes',
  NULL,
  TRUE
);

INSERT INTO public.resources (
  title,
  title_kn,
  description,
  resource_type,
  year,
  is_published
) VALUES (
  '10ನೇ ತರಗತಿ ಪದ್ಯ 1: ಸಂಕಲ್ಪ ಗೀತೆ — ಭಾವಾರ್ಥ ಮತ್ತು ಪ್ರಶ್ನೋತ್ತರ',
  'ಸಂಕಲ್ಪ ಗೀತೆ',
  'ಸಂಕಲ್ಪ ಗೀತೆ ಪದ್ಯದ ಕವಿ ಪರಿಚಯ, ಭಾವಾರ್ಥ, ಪದಗಳ ಅರ್ಥ ಹಾಗೂ ಸಂದರ್ಭ ಸಹಿತ ಸ್ಪಷ್ಟೀಕರಣ.',
  'notes',
  NULL,
  TRUE
);

INSERT INTO public.resources (
  title,
  title_kn,
  description,
  resource_type,
  year,
  is_published
) VALUES (
  '10ನೇ ತರಗತಿ ಪದ್ಯ 2: ಭಾರತ ಭೂಮಿ — ಭಾವಾರ್ಥ ಮತ್ತು ಪ್ರಶ್ನೋತ್ತರ',
  'ಭಾರತ ಭೂಮಿ',
  'ಕನ್ನಡ ಕವಿ ಕಯ್ಯಾರ ಅವರ ರಾಷ್ಟ್ರ ಭಕ್ತಿ ಗೀತೆ ಭಾರತ ಭೂಮಿ ಕವಿತೆಯ ಭಾವಾರ್ಥ.',
  'notes',
  NULL,
  TRUE
);

INSERT INTO public.resources (
  title,
  title_kn,
  description,
  resource_type,
  year,
  is_published
) VALUES (
  '9ನೇ ತರಗತಿ ಗದ್ಯ 1: ಬೆಡಗು — ಸಾರಾಂಶ ಮತ್ತು ಪ್ರಶ್ನೋತ್ತರ',
  'ಬೆಡಗು',
  'ಕಾರಂತರ ಪ್ರವಾಸ ಸಾಹಿತ್ಯ "ಅಬೂವಿನಿಂದ ಬರಾಮಕ್ಕೆ" ದಿಂದ ಆಯ್ದ ಬೆಡಗು ಪಾಠದ ಸಾರಾಂಶ.',
  'notes',
  NULL,
  TRUE
);

INSERT INTO public.resources (
  title,
  title_kn,
  description,
  resource_type,
  year,
  is_published
) VALUES (
  '9ನೇ ತರಗತಿ ಗದ್ಯ 2: ವಿವೇಕಾನಂದ — ಸಾರಾಂಶ ಮತ್ತು ಪ್ರಶ್ನೋತ್ತರ',
  'ವಿವೇಕಾನಂದ',
  'ತೇಜಸ್ವಿ ಅವರ ಜೀವನ ಚರಿತ್ರೆ ಸಂಗ್ರಹದಿಂದ ವಿವೇಕಾನಂದರ ಅಮೆರಿಕ ಪ್ರವಾಸ ಕಥೆ.',
  'notes',
  NULL,
  TRUE
);

INSERT INTO public.resources (
  title,
  title_kn,
  description,
  resource_type,
  year,
  is_published
) VALUES (
  '9ನೇ ತರಗತಿ ಪದ್ಯ 1: ಹೊಯ್ಸಳ — ಭಾವಾರ್ಥ ಮತ್ತು ಪ್ರಶ್ನೋತ್ತರ',
  'ಹೊಯ್ಸಳ',
  'ರಾಷ್ಟ್ರಕವಿ ಕುವೆಂಪು ವಿರಚಿತ ಹೊಯ್ಸಳ ಕವಿತೆಯ ಭಾವಾರ್ಥ ಮತ್ತು ಪ್ರಶ್ನೋತ್ತರ.',
  'notes',
  NULL,
  TRUE
);

INSERT INTO public.resources (
  title,
  title_kn,
  description,
  resource_type,
  year,
  is_published
) VALUES (
  '8ನೇ ತರಗತಿ ಗದ್ಯ 1: ಮಗ್ಗದ ಸಾಹೇಬ — ಸಾರಾಂಶ ಮತ್ತು ಪ್ರಶ್ನೋತ್ತರ',
  'ಮಗ್ಗದ ಸಾಹೇಬ',
  'ಮಗ್ಗದ ಸಾಹೇಬ ಪಾಠದ ಸಾರಾಂಶ, ಕಾಯಕ ನಿಷ್ಠೆ ಮತ್ತು ಧಾರ್ಮಿಕ ಸಾಮರಸ್ಯದ ಸಂದೇಶ.',
  'notes',
  NULL,
  TRUE
);

INSERT INTO public.resources (
  title,
  title_kn,
  description,
  resource_type,
  year,
  is_published
) VALUES (
  '8ನೇ ತರಗತಿ ಗದ್ಯ 2: ಹಾವಿನ ಅರಮನೆ — ಸಾರಾಂಶ ಮತ್ತು ಪ್ರಶ್ನೋತ್ತರ',
  'ಹಾವಿನ ಅರಮನೆ',
  '8ನೇ ತರಗತಿ ಹಾವಿನ ಅರಮನೆ ಗದ್ಯ ಪಾಠದ ಸಾರಾಂಶ ಮತ್ತು ಪ್ರಶ್ನೋತ್ತರ.',
  'notes',
  NULL,
  TRUE
);

INSERT INTO public.resources (
  title,
  title_kn,
  description,
  resource_type,
  year,
  is_published
) VALUES (
  'ಕನ್ನಡ ಸಂಧಿಗಳು — ಸಂಪೂರ್ಣ ವಿವರಣೆ ಮತ್ತು ಉದಾಹರಣೆ',
  'ಸಂಧಿಗಳು',
  'ಕನ್ನಡ ಸಂಧಿಗಳು (ಲೋಪ, ಆಗಮ, ಆದೇಶ) ಮತ್ತು ಸಂಸ್ಕೃತ ಸಂಧಿಗಳ ನಿಯಮಗಳು ಮತ್ತು ಉದಾಹರಣೆಗಳು.',
  'grammar',
  NULL,
  TRUE
);

INSERT INTO public.resources (
  title,
  title_kn,
  description,
  resource_type,
  year,
  is_published
) VALUES (
  'ಕನ್ನಡ ಸಮಾಸಗಳು — ವಿಧಗಳು, ಬಿಡಿಸುವ ವಿಧಾನ ಮತ್ತು ಉದಾಹರಣೆ',
  'ಸಮಾಸಗಳು',
  'ತತ್ಪುರುಷ, ಕರ್ಮಧಾರಯ, ದ್ವಿಗು, ಬಹುವ್ರೀಹಿ, ದ್ವಂದ್ವ, ಕ್ರಿಯಾ ಸಮಾಸಗಳ ವಿವರಣೆ.',
  'grammar',
  NULL,
  TRUE
);

INSERT INTO public.resources (
  title,
  title_kn,
  description,
  resource_type,
  year,
  is_published
) VALUES (
  'ವಿಭಕ್ತಿ ಪ್ರತ್ಯಯಗಳು ಮತ್ತು ಕಾರಕಾರ್ಥ — ಪರೀಕ್ಷೋಪಯೋಗಿ ಚಾರ್ಟ್',
  'ವಿಭಕ್ತಿ ಪ್ರತ್ಯಯ',
  'ಪ್ರಥಮಾದಿ ಸಪ್ತಮೀ ವಿಭಕ್ತಿಗಳ ಪ್ರತ್ಯಯ ಮತ್ತು ಕಾರಕಾರ್ಥ ಚಾರ್ಟ್.',
  'grammar',
  NULL,
  TRUE
);

INSERT INTO public.resources (
  title,
  title_kn,
  description,
  resource_type,
  year,
  is_published
) VALUES (
  'ಕ್ರಿಯಾಜನ್ಯ ಪದಗಳು (ಕೃದಂತ) ಮತ್ತು ಅವ್ಯಯ ಕ್ರಿಯಾ ರೂಪಗಳು',
  'ಕೃದಂತ',
  'ಕ್ರಿಯಾ ಜನ್ಯ ಪದಗಳ ಪ್ರಕಾರಗಳು — ಭೂತ ಕೃದಂತ, ವರ್ತಮಾನ ಕೃದಂತ, ಭವಿಷ್ಯ ಕೃದಂತ.',
  'grammar',
  NULL,
  TRUE
);

INSERT INTO public.resources (
  title,
  title_kn,
  description,
  resource_type,
  year,
  is_published
) VALUES (
  'ಪರೀಕ್ಷೆಗೆ ಬರುವ ಮುಖ್ಯ ಗಾದೆ ಮಾತುಗಳು ಮತ್ತು ವಿಸ್ತರಣೆ',
  'ಗಾದೆಗಳು',
  'ಪ್ರಮುಖ ಗಾದೆ ಮಾತುಗಳ ಪಟ್ಟಿ ಮತ್ತು ಪರೀಕ್ಷೋಪಯೋಗಿ ವಿಸ್ತರಣೆ.',
  'grammar',
  NULL,
  TRUE
);

INSERT INTO public.resources (
  title,
  title_kn,
  description,
  resource_type,
  year,
  is_published
) VALUES (
  'ಕನ್ನಡ ಅಲಂಕಾರಗಳು — ಉಪಮಾ, ರೂಪಕ, ಅನುಪ್ರಾಸ ಮತ್ತಿತರ',
  'ಅಲಂಕಾರ',
  'ಪ್ರಮುಖ ಕಾವ್ಯ ಅಲಂಕಾರಗಳ ಲಕ್ಷಣ, ಉದಾಹರಣೆ ಮತ್ತು ಪ್ರಶ್ನೋತ್ತರ.',
  'grammar',
  NULL,
  TRUE
);

INSERT INTO public.resources (
  title,
  title_kn,
  description,
  resource_type,
  year,
  is_published
) VALUES (
  '2025 SSLC ಕನ್ನಡ ಮಾದರಿ ಪ್ರಶ್ನೆ ಪತ್ರಿಕೆ — ಉತ್ತರ ಸಹಿತ',
  '2025 ಮಾದರಿ ಪ್ರಶ್ನೆ ಪತ್ರಿಕೆ',
  'KSEAB 2025 SSLC ಕನ್ನಡ ಮಾದರಿ ಪ್ರಶ್ನೆ ಪತ್ರಿಕೆ ಮತ್ತು ಅಧಿಕೃತ ಕೀ ಉತ್ತರಗಳು.',
  'question_paper',
  2025,
  TRUE
);

INSERT INTO public.resources (
  title,
  title_kn,
  description,
  resource_type,
  year,
  is_published
) VALUES (
  '2024 SSLC ವಾರ್ಷಿಕ ಪರೀಕ್ಷಾ ಪ್ರಶ್ನೆ ಪತ್ರಿಕೆ — ಪ್ರಮುಖ ಪ್ರಶ್ನೆ ಮತ್ತು ಉತ್ತರ',
  '2024 ವಾರ್ಷಿಕ ಪರೀಕ್ಷೆ',
  '2024 ಮಾರ್ಚ್-ಏಪ್ರಿಲ್ SSLC ಬೋರ್ಡ್ ಪ್ರಶ್ನೆ ಪತ್ರಿಕೆ ಮತ್ತು ಕೀ ಉತ್ತರ.',
  'question_paper',
  2024,
  TRUE
);

INSERT INTO public.resources (
  title,
  title_kn,
  description,
  resource_type,
  year,
  is_published
) VALUES (
  '9ನೇ ತರಗತಿ 2024 ವಾರ್ಷಿಕ ಪರೀಕ್ಷಾ ಪ್ರಶ್ನೆ ಪತ್ರಿಕೆ',
  '2024 ವಾರ್ಷಿಕ ಪರೀಕ್ಷೆ',
  '9ನೇ ತರಗತಿ 2024 ವಾರ್ಷಿಕ ಕನ್ನಡ ಪ್ರಶ್ನೆ ಪತ್ರಿಕೆ ಮತ್ತು ಪ್ರಮುಖ ಉತ್ತರಗಳು.',
  'question_paper',
  2024,
  TRUE
);

INSERT INTO public.resources (
  title,
  title_kn,
  description,
  resource_type,
  year,
  is_published
) VALUES (
  'ಕವಿ ಪರಿಚಯ: ರಾಷ್ಟ್ರಕವಿ ಕುವೆಂಪು — ಜೀವನ, ಸಾಹಿತ್ಯ ಮತ್ತು ಪ್ರಶಸ್ತಿ',
  'ಕುವೆಂಪು',
  'ಜ್ಞಾನಪೀಠ ಪ್ರಶಸ್ತಿ ಪಡೆದ ರಾಷ್ಟ್ರಕವಿ ಕುವೆಂಪು ಅವರ ಸಂಪೂರ್ಣ ಪರಿಚಯ.',
  'notes',
  NULL,
  TRUE
);

INSERT INTO public.resources (
  title,
  title_kn,
  description,
  resource_type,
  year,
  is_published
) VALUES (
  'ಕವಿ ಪರಿಚಯ: ವರಕವಿ ದ.ರಾ. ಬೇಂದ್ರೆ — ಜೀವನ ಮತ್ತು ಕಾವ್ಯ ಪ್ರಯಾಣ',
  'ದ.ರಾ. ಬೇಂದ್ರೆ',
  'ನಾಕುತಂತಿ ಕೃತಿಗೆ ಜ್ಞಾನಪೀಠ ಪಡೆದ ವರಕವಿ ಬೇಂದ್ರೆ ಅವರ ಜೀವನ ಮತ್ತು ಸಾಹಿತ್ಯ.',
  'notes',
  NULL,
  TRUE
);

INSERT INTO public.resources (
  title,
  title_kn,
  description,
  resource_type,
  year,
  is_published
) VALUES (
  'ಕವಿ ಪರಿಚಯ: ಜಿ.ಎಸ್. ಶಿವರುದ್ರಪ್ಪ — ಕಾವ್ಯ ಲೋಕ ಮತ್ತು ಕೊಡುಗೆ',
  'ಜಿ.ಎಸ್. ಶಿವರುದ್ರಪ್ಪ',
  'ರಾಷ್ಟ್ರಕವಿ ಜಿ.ಎಸ್. ಶಿವರುದ್ರಪ್ಪ ಅವರ ಜೀವನ, ಕಾವ್ಯ ಮತ್ತು ಪ್ರಶಸ್ತಿ ಪರಿಚಯ.',
  'notes',
  NULL,
  TRUE
);

INSERT INTO public.resources (
  title,
  title_kn,
  description,
  resource_type,
  year,
  is_published
) VALUES (
  'ಅಂತರ್ಜಾಲದ ಮಹತ್ವ ಮತ್ತು ದುರುಪಯೋಗ — ಪ್ರಬಂಧ',
  'ಅಂತರ್ಜಾಲ',
  'ಪರೀಕ್ಷೆಯಲ್ಲಿ ಹೆಚ್ಚು ಬರುವ ಅಂತರ್ಜಾಲ ವಿಷಯದ ಪ್ರಬಂಧ ಮಾದರಿ.',
  'essay',
  NULL,
  TRUE
);

INSERT INTO public.resources (
  title,
  title_kn,
  description,
  resource_type,
  year,
  is_published
) VALUES (
  'ಪರಿಸರ ಸಂರಕ್ಷಣೆ — ನಮ್ಮ ಹೊಣೆ (ಪ್ರಬಂಧ)',
  'ಪರಿಸರ ಸಂರಕ್ಷಣೆ',
  'ಪರಿಸರ ಸಂರಕ್ಷಣೆ ಬಗ್ಗೆ ಪರೀಕ್ಷಾ ಪ್ರಬಂಧ ಮಾದರಿ.',
  'essay',
  NULL,
  TRUE
);

INSERT INTO public.resources (
  title,
  title_kn,
  description,
  resource_type,
  year,
  is_published
) VALUES (
  '10ನೇ ತರಗತಿ — ಎಲ್ಲ ಪಾಠಗಳ ಮುಖ್ಯ ಪ್ರಶ್ನೋತ್ತರ ಸಂಗ್ರಹ',
  'ಎಲ್ಲ ಪಾಠ ಪ್ರಶ್ನೋತ್ತರ',
  '10ನೇ ತರಗತಿ ಎಲ್ಲ ಪಾಠಗಳ ಪರೀಕ್ಷಾ ಮುಖ್ಯ ಪ್ರಶ್ನೋತ್ತರ ಒಟ್ಟಾರೆ ಸಂಗ್ರಹ.',
  'qa',
  NULL,
  TRUE
);

INSERT INTO public.resources (
  title,
  title_kn,
  description,
  resource_type,
  year,
  is_published
) VALUES (
  'ಕನ್ನಡ ವ್ಯಾಕರಣ — ಅಭ್ಯಾಸ ಪ್ರಶ್ನೆಗಳ ಸಂಗ್ರಹ',
  'ವ್ಯಾಕರಣ ಅಭ್ಯಾಸ',
  'ಸಂಧಿ, ಸಮಾಸ, ವಿಭಕ್ತಿ, ಅಲಂಕಾರ ಅಭ್ಯಾಸ ಪ್ರಶ್ನೆಗಳ ಸಂಗ್ರಹ.',
  'practice',
  NULL,
  TRUE
);
