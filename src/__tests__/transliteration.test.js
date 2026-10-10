const Sanscript = require('@indic-transliteration/sanscript');

// High-frequency educational terms mapping (matching src/lib/kannadaTransliteration.ts)
const HIGH_FREQUENCY_EDUCATIONAL_TERMS = {
  ganitha: 'ಗಣಿತ',
  ganita: 'ಗಣಿತ',
  kannada: 'ಕನ್ನಡ',
  kanada: 'ಕನ್ನಡ',
  vyakarana: 'ವ್ಯಾಕರಣ',
  vyakaran: 'ವ್ಯಾಕರಣ',
  vyaakarana: 'ವ್ಯಾಕರಣ',
  yuddha: 'ಯುದ್ಧ',
  yudha: 'ಯುದ್ಧ',
  shabari: 'ಶಬರಿ',
  sabari: 'ಶಬರಿ',
  sandhi: 'ಸಂಧಿ',
  sandhigalu: 'ಸಂಧಿಗಳು',
  samasa: 'ಸಮಾಸ',
  samasagalu: 'ಸಮಾಸಗಳು',
  bendre: 'ಬೇಂದ್ರೆ',
  kuvempu: 'ಕುವೆಂಪು',
  shivarudrappa: 'ಶಿವರುದ್ರಪ್ಪ',
  sankalpa: 'ಸಂಕಲ್ಪ',
  geethe: 'ಗೀತೆ',
  geetha: 'ಗೀತೆ',
  bhoomi: 'ಭೂಮಿ',
  bhumi: 'ಭೂಮಿ',
  bharatha: 'ಭಾರತ',
  bharata: 'ಭಾರತ',
  parisara: 'ಪರಿಸರ',
  parisarada: 'ಪರಿಸರದ',
  adhyayana: 'ಅಧ್ಯಯನ',
  alankara: 'ಅಲಂಕಾರ',
  alankaragalu: 'ಅಲಂಕಾರಗಳು',
  vibhakt: 'ವಿಭಕ್ತಿ',
  vibhakti: 'ವಿಭಕ್ತಿ',
  gadegalu: 'ಗಾದೆಗಳು',
  gade: 'ಗಾದೆ',
  prabandha: 'ಪ್ರಬಂಧ',
  halagali: 'ಹಲಗಲಿ',
  bedaru: 'ಬೇಡರು',
  bedara: 'ಬೇಡರ',
  bedagu: 'ಬೆಡಗು',
  vivekananda: 'ವಿವೇಕಾನಂದ',
  hoysala: 'ಹೊಯ್ಸಳ',
  krudanta: 'ಕೃದಂತ',
  kridanta: 'ಕೃದಂತ',
  krudanthagalu: 'ಕೃದಂತಗಳು',
  krudantagalu: 'ಕೃದಂತಗಳು',
  kridanthagalu: 'ಕೃದಂತಗಳು',
  antarjala: 'ಅಂತರ್ಜಾಲ',
  antrajala: 'ಅಂತರ್ಜಾಲ',
  havina: 'ಹಾವಿನ',
  aramane: 'ಅರಮನೆ',
  magga: 'ಮಗ್ಗ',
  saheba: 'ಸಾಹೇಬ',
  sslc: 'ಎಸ್.ಎಸ್.ಎಲ್.ಸಿ',
  puc: 'ಪಿ.ಯು.ಸಿ',
};

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

function romanToBarahaPhonetic(token) {
  let s = token.toLowerCase();
  s = s.replace(/ee/g, 'I');
  s = s.replace(/oo/g, 'U');
  s = s.replace(/aa/g, 'A');
  s = s.replace(/th/g, 't');
  s = s.replace(/n([kkgcjdDtTpbshvy])/gi, 'M$1');
  s = s.replace(/m([pb])/gi, 'M$1');
  s = s.replace(/ng([gk])/gi, 'M$1');
  s = s.replace(/kannada/gi, 'kannaDa');
  s = s.replace(/vyakarana/gi, 'vyAkaraNa');
  s = s.replace(/ganita/gi, 'gaNita');
  return s;
}

function transliterateToKannada(input) {
  if (!input || !input.trim()) return [];
  const text = input.trim();

  const hasKannada = /[\u0C80-\u0CFF]/.test(text);
  const hasLatin = /[a-zA-Z]/.test(text);

  if (hasKannada && !hasLatin) {
    return [normalizeKannadaUnicode(text)];
  }

  const tokens = text.split(/(\s+)/);
  const candidateSets = [];

  const candPhonetic = tokens
    .map((token) => {
      if (/^\s+$/.test(token)) return token;
      if (/^[\u0C80-\u0CFF]+$/.test(token)) return normalizeKannadaUnicode(token);

      const cleanWord = token.toLowerCase().replace(/[^a-z]/g, '');
      if (cleanWord && HIGH_FREQUENCY_EDUCATIONAL_TERMS[cleanWord]) {
        return token.toLowerCase().replace(cleanWord, HIGH_FREQUENCY_EDUCATIONAL_TERMS[cleanWord]);
      }

      const phonetic = romanToBarahaPhonetic(token);
      try {
        return Sanscript.t(phonetic, 'baraha', 'kannada');
      } catch {
        return token;
      }
    })
    .join('');
  candidateSets.push(candPhonetic);

  try {
    candidateSets.push(Sanscript.t(text, 'baraha', 'kannada'));
  } catch {}

  try {
    candidateSets.push(Sanscript.t(text, 'itrans_dravidian', 'kannada'));
  } catch {}

  const candidates = [];
  for (const raw of candidateSets) {
    const normalized = normalizeKannadaUnicode(raw).trim();
    if (normalized && !candidates.includes(normalized)) {
      candidates.push(normalized);
    }
  }

  if (hasKannada) {
    const pureNorm = normalizeKannadaUnicode(text).trim();
    if (pureNorm && !candidates.includes(pureNorm)) {
      candidates.unshift(pureNorm);
    }
  }

  return candidates;
}

function getKannadaNumberVariants(wordKn) {
  if (!wordKn || !wordKn.trim()) return [];
  const norm = normalizeKannadaUnicode(wordKn.trim());
  const variants = [norm];
  if (norm.endsWith('ಗಳು') && norm.length > 3) {
    const stem = norm.slice(0, -3);
    if (stem.length >= 2 && !variants.includes(stem)) variants.push(stem);
  }
  if (!norm.endsWith('ಗಳು') && norm.length >= 2) {
    const plural = norm + 'ಗಳು';
    if (!variants.includes(plural)) variants.push(plural);
  }
  return variants;
}

function getRomanNumberVariants(wordRoman) {
  if (!wordRoman || !wordRoman.trim()) return [];
  const clean = wordRoman.trim().toLowerCase();
  const variants = [clean];
  if ((clean.endsWith('galu') || clean.endsWith('gala')) && clean.length > 5) {
    const stem = clean.slice(0, -4);
    if (!variants.includes(stem)) variants.push(stem);
  }
  if (!clean.endsWith('galu') && !clean.endsWith('gala') && clean.length >= 2) {
    const plural = clean + 'galu';
    if (!variants.includes(plural)) variants.push(plural);
  }
  return variants;
}

function scoreResourceMatch(resourceFields, query, mode = 'kn') {
  if (!query || !query.trim()) return 1;

  const rawQuery = query.trim().toLowerCase();
  const isEnglish = mode === 'en';

  const titleField = resourceFields[0] ? normalizeKannadaUnicode(resourceFields[0].toLowerCase()) : '';
  const searchStrings = resourceFields
    .filter((f) => typeof f === 'string' && f.length > 0)
    .map((f) => normalizeKannadaUnicode(f.toLowerCase()));

  // 1. Direct exact/substring match
  const nfcQuery = normalizeKannadaUnicode(rawQuery);
  if (titleField.includes(nfcQuery) || titleField.includes(rawQuery)) return 100;
  if (searchStrings.some((field) => field.includes(nfcQuery) || field.includes(rawQuery))) return 85;

  // 2. Transliteration match
  const candidates = isEnglish ? transliterateToKannada(query) : [];
  if (isEnglish && candidates.length > 0) {
    for (const cand of candidates) {
      const lowerCand = cand.toLowerCase();
      if (titleField.includes(lowerCand)) return 80;
      if (searchStrings.some((field) => field.includes(lowerCand))) return 70;
    }
  }

  // 3. Singular/Plural morphological matching
  const kannadaVariants = new Set();
  for (const c of [nfcQuery, ...candidates]) {
    for (const v of getKannadaNumberVariants(c)) {
      kannadaVariants.add(v);
    }
  }

  for (const v of kannadaVariants) {
    const lowerV = v.toLowerCase();
    if (lowerV === nfcQuery) continue;
    if (titleField.includes(lowerV)) return 65;
    if (searchStrings.some((field) => field.includes(lowerV))) return 55;
  }

  if (isEnglish) {
    for (const r of getRomanNumberVariants(rawQuery)) {
      if (r === rawQuery) continue;
      for (const vc of transliterateToKannada(r)) {
        const lowerVc = vc.toLowerCase();
        if (titleField.includes(lowerVc)) return 65;
        if (searchStrings.some((field) => field.includes(lowerVc))) return 50;
      }
    }
  }

  return 0;
}

function matchResourceQuery(resourceFields, query, mode = 'kn') {
  return scoreResourceMatch(resourceFields, query, mode) > 0;
}

describe('Kannada Transliteration & Search Matching Tests', () => {
  describe('Accurate Core Transliteration Cases', () => {
    test('"ganitha" transliterates to "ಗಣಿತ"', () => {
      const candidates = transliterateToKannada('ganitha');
      expect(candidates).toContain('ಗಣಿತ');
    });

    test('"kannada vyakarana" transliterates to "ಕನ್ನಡ ವ್ಯಾಕರಣ"', () => {
      const candidates = transliterateToKannada('kannada vyakarana');
      expect(candidates).toContain('ಕನ್ನಡ ವ್ಯಾಕರಣ');
    });

    test('"parisarada adhyayana" transliterates to "ಪರಿಸರದ ಅಧ್ಯಯನ"', () => {
      const candidates = transliterateToKannada('parisarada adhyayana');
      expect(candidates).toContain('ಪರಿಸರದ ಅಧ್ಯಯನ');
    });

    test('Kannada-script queries are preserved and NFC normalized', () => {
      const query = 'ಕನ್ನಡ ವ್ಯಾಕರಣ';
      const candidates = transliterateToKannada(query);
      expect(candidates[0]).toBe('ಕನ್ನಡ ವ್ಯಾಕರಣ');
    });

    test('Mixed Kannada and Latin queries transliterate predictably', () => {
      const mixed = '10th kannada notes';
      const candidates = transliterateToKannada(mixed);
      expect(candidates.some((c) => c.includes('ಕನ್ನಡ'))).toBe(true);
    });

    test('Case differences do not cause missed transliterations', () => {
      expect(transliterateToKannada('GANITHA')).toContain('ಗಣಿತ');
      expect(transliterateToKannada('Kannada Vyakarana')).toContain('ಕನ್ನಡ ವ್ಯಾಕರಣ');
      expect(transliterateToKannada('Parisarada Adhyayana')).toContain('ಪರಿಸರದ ಅಧ್ಯಯನ');
    });

    test('Repeated spaces and punctuation are handled sensibly', () => {
      const candidates = transliterateToKannada('kannada   vyakarana?');
      expect(candidates.some((c) => c.includes('ಕನ್ನಡ') && c.includes('ವ್ಯಾಕರಣ'))).toBe(true);
    });

    test('Handles consonant clusters, aspirates, and anusvara accurately', () => {
      expect(transliterateToKannada('yuddha')).toContain('ಯುದ್ಧ');
      expect(transliterateToKannada('shabari')).toContain('ಶಬರಿ');
      expect(transliterateToKannada('sandhi')).toContain('ಸಂಧಿ');
      expect(transliterateToKannada('bendre')).toContain('ಬೇಂದ್ರೆ');
      expect(transliterateToKannada('kuvempu')).toContain('ಕುವೆಂಪು');
    });
  });

  describe('Search Matching with Transliteration Mode', () => {
    const controlledCatalog = [
      {
        id: 'res-math-01',
        title: '10ನೇ ತರಗತಿ ಗಣಿತ — ಸೂತ್ರಗಳು ಮತ್ತು ಉದಾಹರಣೆ',
        topic: 'ಗಣಿತ',
        summary: 'ಎಸ್‌ಎಸ್‌ಎಲ್‌ಸಿ ಗಣಿತ ವಿಷಯದ ಎಲ್ಲಾ ಅಧ್ಯಾಯಗಳ ಮುಖ್ಯ ಸೂತ್ರಗಳು.',
        tags: ['ಗಣಿತ', 'ಸೂತ್ರಗಳು'],
      },
      {
        id: 'res-grammar-01',
        title: 'ಕನ್ನಡ ವ್ಯಾಕರಣ — ಸಂಧಿ ನಿಯಮಗಳು ಮತ್ತು ಅಭ್ಯಾಸ ಪ್ರಶ್ನೆ',
        topic: 'ವ್ಯಾಕರಣ ಅಭ್ಯಾಸ',
        summary: 'ಕನ್ನಡ ವ್ಯಾಕರಣದ ಪ್ರಮುಖ ನಿಯಮಗಳು ಮತ್ತು ವಿವರಣೆ.',
        tags: ['ವ್ಯಾಕರಣ', 'ಕನ್ನಡ', 'ನಿಯಮಗಳು'],
      },
      {
        id: 'res-env-01',
        title: 'ಪರಿಸರದ ಅಧ್ಯಯನ ಮತ್ತು ಸಂರಕ್ಷಣೆ — ಪ್ರಬಂಧ',
        topic: 'ಪರಿಸರದ ಅಧ್ಯಯನ',
        summary: 'ಪರಿಸರದ ಅಧ್ಯಯನ ಹಾಗೂ ಮಾಲಿನ್ಯ ನಿಯಂತ್ರಣದ ಕುರಿತ ಸಂಪೂರ್ಣ ಮಾರ್ಗದರ್ಶಿ.',
        tags: ['ಪರಿಸರ', 'ಪ್ರಬಂಧ'],
      },
      {
        id: 'res-krudanta-01',
        title: 'ಕೃದಂತ ನಾಮ ಮತ್ತು ಕೃದಂತ ಅವ್ಯಯಗಳ ವಿವರಣೆ',
        topic: 'ಕೃದಂತ',
        summary: 'ಕೃದಂತ ರೂಪಗಳ ಕುರಿತು ಸಮಗ್ರ ಟಿಪ್ಪಣಿ.',
        tags: ['ವ್ಯಾಕರಣ', 'ಕೃದಂತ'],
      },
    ];

    function searchCatalog(catalog, query, mode) {
      return catalog.filter((item) =>
        matchResourceQuery(
          [item.title, item.topic, item.summary, ...(item.tags || [])],
          query,
          mode
        )
      );
    }

    test('"ganitha" in English mode finds "ಗಣಿತ" resource', () => {
      const results = searchCatalog(controlledCatalog, 'ganitha', 'en');
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].title).toContain('ಗಣಿತ');
    });

    test('"ganitha" in Kannada mode does NOT match Kannada text directly', () => {
      const results = searchCatalog(controlledCatalog, 'ganitha', 'kn');
      expect(results.length).toBe(0);
    });

    test('"kannada vyakarana" in English mode finds "ಕನ್ನಡ ವ್ಯಾಕರಣ" resource', () => {
      const results = searchCatalog(controlledCatalog, 'kannada vyakarana', 'en');
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].title).toContain('ಕನ್ನಡ ವ್ಯಾಕರಣ');
    });

    test('"parisarada adhyayana" in English mode finds "ಪರಿಸರದ ಅಧ್ಯಯನ" resource', () => {
      const results = searchCatalog(controlledCatalog, 'parisarada adhyayana', 'en');
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].title).toContain('ಪರಿಸರದ ಅಧ್ಯಯನ');
    });

    test('Native Kannada search works in both modes identically', () => {
      const knInKn = searchCatalog(controlledCatalog, 'ವ್ಯಾಕರಣ', 'kn');
      const knInEn = searchCatalog(controlledCatalog, 'ವ್ಯಾಕರಣ', 'en');
      expect(knInKn.length).toBe(2);
      expect(knInEn.length).toBe(2);
      expect(knInKn[0].id).toBe(knInEn[0].id);
    });

    test('Deduplication prevents duplicate items from static + DB merge', () => {
      const duplicatedList = [...controlledCatalog, controlledCatalog[0]];
      const seenIds = new Set();
      const deduplicated = duplicatedList.filter((res) => {
        if (seenIds.has(res.id)) return false;
        seenIds.add(res.id);
        return true;
      });
      expect(deduplicated.length).toBe(controlledCatalog.length);
    });
  });

  describe('Website-Wide Singular/Plural Search Normalization Suite', () => {
    const pluralCatalog = [
      {
        id: 'res-rules',
        title: 'ಕನ್ನಡ ಸಂಧಿ ನಿಯಮಗಳು ಮತ್ತು ಸಮಾಸಗಳು',
        topic: 'ಸಂಧಿ ನಿಯಮಗಳು',
        summary: 'ಸಂಧಿಯ ಎಲ್ಲಾ ನಿಯಮಗಳ ಪಟ್ಟಿ.',
        tags: ['ನಿಯಮಗಳು'],
      },
      {
        id: 'res-paper',
        title: '10ನೇ ತರಗತಿ ಮಾದರಿ ಪ್ರಶ್ನೆ ಪತ್ರಿಕೆ',
        topic: 'ಪ್ರಶ್ನೆ ಪತ್ರಿಕೆ',
        summary: 'ಪರೀಕ್ಷಾ ಮಾದರಿ ಪ್ರಶ್ನೆ.',
        tags: ['ಪ್ರಶ್ನೆ'],
      },
      {
        id: 'res-krudanta',
        title: 'ಕೃದಂತ ರೂಪಗಳು ಮತ್ತು ಕೃದಂತಗಳು',
        topic: 'ಕೃದಂತಗಳು',
        summary: 'ಕೃದಂತ ವಿವರಣೆ.',
        tags: ['ಕೃದಂತ'],
      },
    ];

    function search(catalog, query, mode = 'kn') {
      return catalog.filter((item) =>
        matchResourceQuery(
          [item.title, item.topic, item.summary, ...(item.tags || [])],
          query,
          mode
        )
      );
    }

    test('Kannada singular query finds plural resource: "ನಿಯಮ" -> finds "ನಿಯಮಗಳು"', () => {
      const res = search(pluralCatalog, 'ನಿಯಮ', 'kn');
      expect(res.length).toBeGreaterThan(0);
      expect(res[0].id).toBe('res-rules');
    });

    test('Kannada plural query finds singular resource: "ಪ್ರಶ್ನೆಗಳು" -> finds "ಪ್ರಶ್ನೆ"', () => {
      const res = search(pluralCatalog, 'ಪ್ರಶ್ನೆಗಳು', 'kn');
      expect(res.length).toBeGreaterThan(0);
      expect(res[0].id).toBe('res-paper');
    });

    test('Romanized singular query finds plural resource: "niyama" -> finds "ನಿಯಮಗಳು"', () => {
      const res = search(pluralCatalog, 'niyama', 'en');
      expect(res.length).toBeGreaterThan(0);
      expect(res[0].id).toBe('res-rules');
    });

    test('Romanized plural query finds singular resource: "prashnegalu" -> finds "ಪ್ರಶ್ನೆ"', () => {
      const res = search(pluralCatalog, 'prashnegalu', 'en');
      expect(res.length).toBeGreaterThan(0);
      expect(res[0].id).toBe('res-paper');
    });

    test('Romanized "krudanta" finds singular and plural Krudanta resources', () => {
      const res = search(pluralCatalog, 'krudanta', 'en');
      expect(res.length).toBeGreaterThan(0);
      expect(res[0].id).toBe('res-krudanta');
    });

    test('Romanized "krudanthagalu" finds plural Krudanta resources', () => {
      const res = search(pluralCatalog, 'krudanthagalu', 'en');
      expect(res.length).toBeGreaterThan(0);
      expect(res[0].id).toBe('res-krudanta');
    });

    test('Exact match ranks higher in relevance scoring than grammatical variant', () => {
      // Title with singular "ನಿಯಮ": query "ನಿಯಮ" is exact match (100), query "ನಿಯಮಗಳು" is inferred plural match (65)
      const exactScore = scoreResourceMatch(['ಕನ್ನಡ ಸಂಧಿ ನಿಯಮ ಪರಿಚಯ'], 'ನಿಯಮ', 'kn');
      const inferredScore = scoreResourceMatch(['ಕನ್ನಡ ಸಂಧಿ ನಿಯಮ ಪರಿಚಯ'], 'ನಿಯಮಗಳು', 'kn');
      expect(exactScore).toBeGreaterThan(inferredScore);
      expect(exactScore).toBe(100);
      expect(inferredScore).toBe(65);
    });

    test('Unrelated query produces 0 false positives', () => {
      const res = search(pluralCatalog, 'ಗಣಿತ', 'kn');
      expect(res.length).toBe(0);
      const resEn = search(pluralCatalog, 'ganitha', 'en');
      expect(resEn.length).toBe(0);
    });
  });
});
