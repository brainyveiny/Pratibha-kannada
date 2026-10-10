const Sanscript = require('@indic-transliteration/sanscript');

// Verified educational terms matching src/data/kannadaGlossary.ts
const TEST_GLOSSARY = [
  {
    id: 'term-sandhi',
    canonicalKn: 'ಸಂಧಿ',
    alternateFormsKn: ['ಸಂಧಿಗಳು'],
    standardRoman: 'sandhi',
    romanVariants: ['sandhi', 'sandhigalu', 'sandhi-rules'],
    category: 'ವ್ಯಾಕರಣ',
    sourceReference: 'DSERT 10th Standard Kannada Vyakarna, Chapter 3: ಸಂಧಿ ಪ್ರಕರಣ',
  },
  {
    id: 'term-krudanta',
    canonicalKn: 'ಕೃದಂತ',
    alternateFormsKn: ['ಕೃದಂತಗಳು'],
    standardRoman: 'krudanta',
    romanVariants: ['krudanta', 'kridanta'],
    category: 'ವ್ಯಾಕರಣ',
    sourceReference: 'DSERT 10th Standard Kannada Vyakarna, Chapter 6: ಕೃದಂತ ಪ್ರಕರಣ',
  },
  {
    id: 'term-krudanthagalu',
    canonicalKn: 'ಕೃದಂತಗಳು',
    alternateFormsKn: ['ಕೃದಂತ'],
    standardRoman: 'krudanthagalu',
    romanVariants: ['krudanthagalu', 'krudantagalu', 'kridanthagalu'],
    category: 'ವ್ಯಾಕರಣ',
    sourceReference: 'DSERT 10th Standard Kannada Vyakarna, Chapter 6: ಕೃದಂತ ಪ್ರಕರಣ',
  },
  {
    id: 'term-samasa',
    canonicalKn: 'ಸಮಾಸ',
    alternateFormsKn: ['ಸಮಾಸಗಳು'],
    standardRoman: 'samasa',
    romanVariants: ['samasa', 'samasagalu', 'samaasa'],
    category: 'ವ್ಯಾಕರಣ',
    sourceReference: 'DSERT 10th Standard Kannada Vyakarna, Chapter 5: ಸಮಾಸ ಪ್ರಕರಣ',
  },
  {
    id: 'term-vibhakti',
    canonicalKn: 'ವಿಭಕ್ತಿ',
    alternateFormsKn: ['ವಿಭಕ್ತಿಗಳು'],
    standardRoman: 'vibhakti',
    romanVariants: ['vibhakti', 'vibhaktigalu'],
    category: 'ವ್ಯಾಕರಣ',
    sourceReference: 'DSERT 10th Standard Kannada Vyakarna, Chapter 4',
  },
  {
    id: 'term-vyakarana',
    canonicalKn: 'ವ್ಯಾಕರಣ',
    standardRoman: 'vyakarana',
    romanVariants: ['vyakarana', 'vyaakarana'],
    category: 'ವ್ಯಾಕರಣ',
    sourceReference: 'DSERT Kannada Vyakarna Pravesha',
  },
  {
    id: 'term-alankara',
    canonicalKn: 'ಅಲಂಕಾರ',
    alternateFormsKn: ['ಅಲಂಕಾರಗಳು'],
    standardRoman: 'alankara',
    romanVariants: ['alankara', 'alankaragalu'],
    category: 'ವ್ಯಾಕರಣ',
    sourceReference: 'DSERT 10th Standard Kannada Sahitya, Chapter 9',
  },
  {
    id: 'term-gadegalu',
    canonicalKn: 'ಗಾದೆಗಳು',
    alternateFormsKn: ['ಗಾದೆ'],
    standardRoman: 'gadegalu',
    romanVariants: ['gadegalu', 'gade', 'gaadegalu'],
    category: 'ಪ್ರಬಂಧ & ಗಾದೆ',
    sourceReference: 'Kannada Sahitya Parishat Gadegalu Sangraha',
  },
  {
    id: 'term-ganitha',
    canonicalKn: 'ಗಣಿತ',
    standardRoman: 'ganitha',
    romanVariants: ['ganitha', 'ganita'],
    category: 'ಸಾಮಾನ್ಯ',
    sourceReference: 'Karnataka Secondary School Subject Nomenclature',
  },
  {
    id: 'term-kuvempu',
    canonicalKn: 'ಕುವೆಂಪು',
    standardRoman: 'kuvempu',
    romanVariants: ['kuvempu', 'kuvempu kavi'],
    category: 'ಕವಿ ಪರಿಚಯ',
    sourceReference: 'Kannada Sahitya Charitre',
  },
  {
    id: 'term-yuddha',
    canonicalKn: 'ಯುದ್ಧ',
    standardRoman: 'yuddha',
    romanVariants: ['yuddha', 'yudha'],
    category: 'ನೋಟ್ಸ್',
    sourceReference: '10th Standard Kannada First Language Textbook',
  },
  {
    id: 'term-shabari',
    canonicalKn: 'ಶಬರಿ',
    standardRoman: 'shabari',
    romanVariants: ['shabari', 'sabari'],
    category: 'ನೋಟ್ಸ್',
    sourceReference: '10th Standard Kannada First Language Textbook',
  },
];

const TEST_RESOURCES = [
  {
    id: 'res-10-yuddha',
    slug: '10th-yuddha-prose-notes',
    title: '10ನೇ ತರಗತಿ ಗದ್ಯ 1: ಯುದ್ಧ — ಸಾರಾಂಶ ಮತ್ತು ಪ್ರಶ್ನೋತ್ತರ',
    classGrade: '10',
    category: 'notes',
    topic: 'ಯುದ್ಧ',
    summary: 'ಯುದ್ಧ ಪಾಠದ ಸಂಪೂರ್ಣ ಸಾರಾಂಶ, ಲೇಖಕಿ ಪರಿಚಯ ಮತ್ತು ಪ್ರಶ್ನೋತ್ತರ.',
    tags: ['10ನೇ ತರಗತಿ', 'ಗದ್ಯ', 'ಯುದ್ಧ', 'ಪ್ರಶ್ನೋತ್ತರ'],
  },
  {
    id: 'res-10-shabari',
    slug: '10th-shabari-prose-notes',
    title: '10ನೇ ತರಗತಿ ಗದ್ಯ 2: ಶಬರಿ — ಸಾರಾಂಶ ಮತ್ತು ಪ್ರಶ್ನೋತ್ತರ',
    classGrade: '10',
    category: 'notes',
    topic: 'ಶಬರಿ',
    summary: 'ಪು.ತಿ.ನ ಅವರ ಗೀತ ನಾಟಕ ಶಬರಿಯ ಸಾರಾಂಶ ಮತ್ತು ಪ್ರಶ್ನೋತ್ತರ.',
    tags: ['10ನೇ ತರಗತಿ', 'ಗದ್ಯ', 'ಶಬರಿ'],
  },
  {
    id: 'res-10-sandhi',
    slug: '10th-kannada-sandhi-rules',
    title: 'ಕನ್ನಡ ಸಂಧಿ ನಿಯಮಗಳು ಮತ್ತು ಉದಾಹರಣೆಗಳು',
    classGrade: '10',
    category: 'grammar',
    topic: 'ಸಂಧಿ',
    summary: 'ಕನ್ನಡ ಮತ್ತು ಸಂಸ್ಕೃತ ಸಂಧಿಗಳ ಸಂಪೂರ್ಣ ವಿವರಣೆ.',
    tags: ['ವ್ಯಾಕರಣ', 'ಸಂಧಿ', 'ನಿಯಮಗಳು'],
  },
  {
    id: 'res-10-krudanta',
    slug: '10th-kannada-krudanta-notes',
    title: 'ಕೃದಂತ ನಾಮ ಮತ್ತು ಅವ್ಯಯಗಳು — ವ್ಯಾಕರಣ',
    classGrade: '10',
    category: 'grammar',
    topic: 'ಕೃದಂತ',
    summary: 'ಕೃದಂತ ರೂಪಗಳ ವಿವರಣೆ ಮತ್ತು ಪರೀಕ್ಷಾ ಪ್ರಶ್ನೆಗಳು.',
    tags: ['ವ್ಯಾಕರಣ', 'ಕೃದಂತ', 'ಧಾತು'],
  },
  {
    id: 'res-10-maths-01',
    slug: '10th-maths-formulas',
    title: '10ನೇ ತರಗತಿ ಗಣಿತ — ಸೂತ್ರಗಳು ಮತ್ತು ಮಾದರಿ ಲೆಕ್ಕಗಳು',
    classGrade: '10',
    category: 'practice',
    topic: 'ಗಣಿತ',
    summary: 'ಎಸ್‌ಎಸ್‌ಎಲ್‌ಸಿ ಗಣಿತ ಮುಖ್ಯ ಸೂತ್ರಗಳ ಪಟ್ಟಿ.',
    tags: ['ಗಣಿತ', 'ಸೂತ್ರಗಳು', '10ನೇ ತರಗತಿ'],
  },
];

function normalizeKannadaUnicode(text) {
  if (!text) return '';
  return text
    .normalize('NFC')
    .replace(/\u0CA8\u0CCD([\u0CA4\u0CA5\u0CA6\u0CA7])/g, '\u0C82$1')
    .replace(/\u0CAE\u0CCD([\u0CAA\u0CAB\u0CAC\u0CAD])/g, '\u0C82$1')
    .replace(/\u0C99\u0CCD([\u0C95\u0C96\u0C97\u0C98])/g, '\u0C82$1')
    .replace(/\u0C9E\u0CCD([\u0C9A\u0C9B\u0C9C\u0C9D])/g, '\u0C82$1')
    .replace(/\u0CA3\u0CCD([\u0C9F\u0CA0\u0CA1\u0CA2])/g, '\u0C82$1');
}

function transliterateToKannada(input) {
  if (!input || !input.trim()) return [];
  const text = input.trim();
  const hasKannada = /[\u0C80-\u0CFF]/.test(text);
  const hasLatin = /[a-zA-Z]/.test(text);
  if (hasKannada && !hasLatin) return [normalizeKannadaUnicode(text)];

  const clean = text.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim();
  const candidates = [];

  // Check glossary
  for (const entry of TEST_GLOSSARY) {
    if (
      entry.standardRoman.toLowerCase() === clean ||
      entry.romanVariants.some((v) => v.toLowerCase() === clean)
    ) {
      candidates.push(entry.canonicalKn);
      if (entry.alternateFormsKn) candidates.push(...entry.alternateFormsKn);
      break;
    }
  }

  // Baraha phonetic
  let s = text.toLowerCase();
  s = s.replace(/ee/g, 'I').replace(/oo/g, 'U').replace(/aa/g, 'A').replace(/th/g, 't');
  s = s.replace(/n([kkgcjdDtTpbshvy])/gi, 'M$1').replace(/m([pb])/gi, 'M$1');
  s = s.replace(/kannada/gi, 'kannaDa').replace(/vyakarana/gi, 'vyAkaraNa').replace(/ganita/gi, 'gaNita');

  try {
    const b = Sanscript.t(s, 'baraha', 'kannada');
    if (b) candidates.push(normalizeKannadaUnicode(b));
  } catch {}

  return Array.from(new Set(candidates));
}

function getMorphologicalVariants(termKn) {
  const norm = normalizeKannadaUnicode(termKn);
  const variants = [norm];
  if (norm.endsWith('ಗಳು') && norm.length > 3) {
    const singular = norm.slice(0, -3);
    if (!variants.includes(singular)) variants.push(singular);
  }
  if (!norm.endsWith('ಗಳು') && norm.length >= 2) {
    const plural = norm + 'ಗಳು';
    if (!variants.includes(plural)) variants.push(plural);
  }
  return variants;
}

function getRomanVariants(roman) {
  const clean = roman.toLowerCase().trim();
  const variants = [clean];
  if (clean.endsWith('galu') && clean.length > 4) {
    variants.push(clean.slice(0, -4));
  } else if (!clean.endsWith('galu') && clean.length >= 2) {
    variants.push(clean + 'galu');
  }
  return variants;
}

function getSearchSuggestions(query, mode = 'kannada', options = {}) {
  if (!query || !query.trim()) return [];
  const rawQuery = query.trim();
  const isEnglish = mode === 'en' || mode === 'english';
  const cleanQuery = rawQuery.toLowerCase();
  const limit = options.limit || 8;
  const activeClass = options.classGrade;

  const suggestions = [];
  const seenIds = new Set();

  function addSuggestion(item) {
    if (seenIds.has(item.id)) return;
    seenIds.add(item.id);
    suggestions.push(item);
  }

  const translitCandidates = isEnglish ? transliterateToKannada(rawQuery) : [normalizeKannadaUnicode(rawQuery)];
  const nfcRaw = normalizeKannadaUnicode(rawQuery);

  // 1. Check Glossary
  for (const entry of TEST_GLOSSARY) {
    let matchScore = 0;
    const romanTerms = [entry.standardRoman.toLowerCase(), ...entry.romanVariants.map((v) => v.toLowerCase())];

    for (const r of romanTerms) {
      if (r === cleanQuery) {
        matchScore = Math.max(matchScore, 100);
        break;
      } else if (r.startsWith(cleanQuery)) {
        matchScore = Math.max(matchScore, 80 - Math.min(20, r.length - cleanQuery.length));
      }
    }

    const knForms = [entry.canonicalKn, ...(entry.alternateFormsKn || [])];
    for (const kn of knForms) {
      const normKn = normalizeKannadaUnicode(kn);
      if (normKn === nfcRaw) {
        matchScore = Math.max(matchScore, 100);
      } else if (normKn.startsWith(nfcRaw)) {
        matchScore = Math.max(matchScore, 85);
      }
      if (isEnglish) {
        for (const cand of translitCandidates) {
          if (normKn === cand) matchScore = Math.max(matchScore, 95);
          else if (normKn.startsWith(cand)) matchScore = Math.max(matchScore, 75);
        }
      }
    }

    // Morphological check
    if (matchScore === 0) {
      const morphKn = getMorphologicalVariants(entry.canonicalKn);
      for (const m of morphKn) {
        if (m.startsWith(nfcRaw) || (isEnglish && translitCandidates.some((c) => m.startsWith(c)))) {
          matchScore = 65;
          break;
        }
      }
    }

    if (matchScore > 0) {
      addSuggestion({
        id: `glossary-${entry.id}`,
        title: entry.canonicalKn,
        titleEn: entry.standardRoman,
        type: 'topic',
        subtitle: `${entry.category} • ${entry.sourceReference.split(':')[0]}`,
        url: `/dashboard?q=${encodeURIComponent(entry.canonicalKn)}`,
        badge: entry.category,
        score: matchScore + 10,
      });
    }
  }

  // 2. Check Resources
  for (const res of TEST_RESOURCES) {
    if (activeClass && res.classGrade !== 'all' && res.classGrade !== activeClass) continue;

    let matchScore = 0;
    const titleNorm = normalizeKannadaUnicode(res.title.toLowerCase());
    const topicNorm = normalizeKannadaUnicode(res.topic.toLowerCase());

    if (titleNorm.startsWith(nfcRaw.toLowerCase())) matchScore = 90;
    else if (topicNorm.startsWith(nfcRaw.toLowerCase())) matchScore = 85;
    else if (titleNorm.includes(nfcRaw.toLowerCase())) matchScore = 70;

    if (isEnglish) {
      for (const cand of translitCandidates) {
        const candLower = cand.toLowerCase();
        if (titleNorm.includes(candLower)) matchScore = Math.max(matchScore, 80);
        else if (topicNorm.includes(candLower)) matchScore = Math.max(matchScore, 75);
      }
      const romanQueryVariants = getRomanVariants(cleanQuery);
      for (const v of romanQueryVariants) {
        if (res.slug.toLowerCase().includes(v)) matchScore = Math.max(matchScore, 60);
      }
    }

    if (activeClass && res.classGrade === activeClass) matchScore += 5;

    if (matchScore > 0) {
      addSuggestion({
        id: `res-${res.id}`,
        title: res.title,
        type: 'resource',
        subtitle: `${res.classGrade}ನೇ ತರಗತಿ • ${res.category}`,
        url: `/dashboard/resource/${res.slug}`,
        badge: `${res.classGrade}ನೇ ತರಗತಿ`,
        score: matchScore,
      });
    }
  }

  suggestions.sort((a, b) => b.score - a.score);
  return suggestions.slice(0, limit);
}

describe('Live Search Suggestions & Autocomplete Tests', () => {
  describe('Progressive Keystroke Matching (English Mode)', () => {
    test('Keystroke progression "s" -> "sa" -> "sam" -> "sama" progressively refines to "ಸಮಾಸ"', () => {
      const resS = getSearchSuggestions('s', 'en');
      expect(resS.length).toBeGreaterThan(0);
      expect(resS.some((item) => item.title === 'ಸಮಾಸ' || item.title === 'ಸಂಧಿ')).toBe(true);

      const resSa = getSearchSuggestions('sa', 'en');
      expect(resSa.length).toBeGreaterThan(0);
      expect(resSa.some((item) => item.title === 'ಸಮಾಸ')).toBe(true);

      const resSam = getSearchSuggestions('sam', 'en');
      expect(resSam.length).toBeGreaterThan(0);
      expect(resSam.some((item) => item.title === 'ಸಮಾಸ')).toBe(true);

      const resSama = getSearchSuggestions('sama', 'en');
      expect(resSama.length).toBeGreaterThan(0);
      expect(resSama[0].title).toBe('ಸಮಾಸ');
      expect(resSama[0].titleEn).toBe('samasa');
    });

    test('"yud" finds "ಯುದ್ಧ" (Yuddha) resource and topic', () => {
      const suggestions = getSearchSuggestions('yud', 'en');
      expect(suggestions.length).toBeGreaterThan(0);
      expect(suggestions.some((s) => s.title.includes('ಯುದ್ಧ'))).toBe(true);
    });

    test('"gan" finds "ಗಣಿತ" (Ganitha)', () => {
      const suggestions = getSearchSuggestions('gan', 'en');
      expect(suggestions.length).toBeGreaterThan(0);
      expect(suggestions.some((s) => s.title === 'ಗಣಿತ')).toBe(true);
    });

    test('"shab" finds "ಶಬರಿ" (Shabari)', () => {
      const suggestions = getSearchSuggestions('shab', 'en');
      expect(suggestions.length).toBeGreaterThan(0);
      expect(suggestions.some((s) => s.title.includes('ಶಬರಿ'))).toBe(true);
    });

    test('"kuv" finds "ಕುವೆಂಪು" (Kuvempu)', () => {
      const suggestions = getSearchSuggestions('kuv', 'en');
      expect(suggestions.length).toBeGreaterThan(0);
      expect(suggestions.some((s) => s.title === 'ಕುವೆಂಪು')).toBe(true);
    });
  });

  describe('Kannada Script Progressive Matching (Kannada Mode)', () => {
    test('"ಸಮ" prefix matches "ಸಮಾಸ"', () => {
      const suggestions = getSearchSuggestions('ಸಮ', 'kn');
      expect(suggestions.length).toBeGreaterThan(0);
      expect(suggestions.some((s) => s.title === 'ಸಮಾಸ')).toBe(true);
    });

    test('"ಸಂಧಿ" matches Sandhi topic and notes', () => {
      const suggestions = getSearchSuggestions('ಸಂಧಿ', 'kn');
      expect(suggestions.length).toBeGreaterThan(0);
      expect(suggestions[0].title).toContain('ಸಂಧಿ');
    });

    test('"ಗ" prefix matches "ಗಣಿತ" and "ಗಾದೆಗಳು"', () => {
      const suggestions = getSearchSuggestions('ಗ', 'kn');
      expect(suggestions.length).toBeGreaterThan(0);
      expect(suggestions.some((s) => s.title === 'ಗಣಿತ' || s.title === 'ಗಾದೆಗಳು')).toBe(true);
    });
  });

  describe('Singular/Plural Normalization in Suggestions', () => {
    test('"krudanta" suggests both singular "ಕೃದಂತ" and plural "ಕೃದಂತಗಳು"', () => {
      const suggestions = getSearchSuggestions('krudanta', 'en');
      const titles = suggestions.map((s) => s.title);
      expect(titles).toContain('ಕೃದಂತ');
      expect(titles).toContain('ಕೃದಂತಗಳು');
    });

    test('"krudanthagalu" suggests plural "ಕೃದಂತಗಳು"', () => {
      const suggestions = getSearchSuggestions('krudanthagalu', 'en');
      expect(suggestions.length).toBeGreaterThan(0);
      expect(suggestions[0].title).toBe('ಕೃದಂತಗಳು');
    });

    test('Singular "gade" suggests plural "ಗಾದೆಗಳು"', () => {
      const suggestions = getSearchSuggestions('gade', 'en');
      expect(suggestions.some((s) => s.title === 'ಗಾದೆಗಳು')).toBe(true);
    });

    test('Plural "gadegalu" suggests "ಗಾದೆಗಳು"', () => {
      const suggestions = getSearchSuggestions('gadegalu', 'en');
      expect(suggestions.some((s) => s.title === 'ಗಾದೆಗಳು')).toBe(true);
    });
  });

  describe('Relevance Ranking, Context and Deduplication', () => {
    test('Exact match has higher score than partial prefix match', () => {
      const suggestions = getSearchSuggestions('samasa', 'en');
      expect(suggestions.length).toBeGreaterThan(0);
      expect(suggestions[0].title).toBe('ಸಮಾಸ');
      expect(suggestions[0].score).toBeGreaterThanOrEqual(90);
    });

    test('Class context filter filters resources by grade', () => {
      const suggestionsClass10 = getSearchSuggestions('ಯುದ್ಧ', 'kn', { classGrade: '10' });
      for (const item of suggestionsClass10.filter((s) => s.type === 'resource')) {
        expect(item.subtitle).toContain('10ನೇ ತರಗತಿ');
      }
    });

    test('Suggestions are strictly deduplicated by id', () => {
      const suggestions = getSearchSuggestions('kannada', 'en');
      const ids = suggestions.map((s) => s.id);
      const uniqueIds = new Set(ids);
      expect(ids.length).toBe(uniqueIds.size);
    });

    test('Empty or whitespace query returns empty array cleanly', () => {
      expect(getSearchSuggestions('', 'en')).toEqual([]);
      expect(getSearchSuggestions('   ', 'kn')).toEqual([]);
    });
  });
});
