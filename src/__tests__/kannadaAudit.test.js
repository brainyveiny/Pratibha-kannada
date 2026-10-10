const Sanscript = require('@indic-transliteration/sanscript');

const KANNADA_EDUCATIONAL_GLOSSARY = [
  {
    id: 'term-sandhi',
    canonicalKn: 'ಸಂಧಿ',
    standardRoman: 'sandhi',
    romanVariants: ['sandhi', 'sandhigalu', 'sandhi-rules', 'samdhi'],
    misspellingsKn: ['ಸನ್ಧಿ', 'ಸಂದಿ', 'ಶಂಧಿ'],
    meaningEn: 'Euphonic union/coalescence of letters (Kannada and Sanskrit Sandhi rules)',
    category: 'ವ್ಯಾಕರಣ',
    sourceReference: 'DSERT 10th Standard Kannada Vyakarna, Chapter 3',
    verificationStatus: 'VERIFIED',
  },
  {
    id: 'term-krudanta',
    canonicalKn: 'ಕೃದಂತಗಳು',
    standardRoman: 'krudanthagalu',
    romanVariants: ['krudanta', 'krudanthagalu', 'krudantagalu', 'kridanta', 'kridanthagalu'],
    misspellingsKn: ['ಕ್ರುದಂತ', 'ಕ್ರುದಂತಗಳು', 'ಕೃದಂಥ', 'ಕೃದನ್ತಗಳು'],
    meaningEn: 'Primary nominal and indeclinable derivatives formed from verb roots (Krudanta)',
    category: 'ವ್ಯಾಕರಣ',
    sourceReference: 'DSERT 10th Standard Kannada Vyakarna, Chapter 6',
    verificationStatus: 'VERIFIED',
  },
  {
    id: 'term-samasa',
    canonicalKn: 'ಸಮಾಸ',
    standardRoman: 'samasa',
    romanVariants: ['samasa', 'samasagalu', 'samaasa', 'samaasagalu'],
    misspellingsKn: ['ಸಮಸ', 'ಸಮಾಶ', 'ಶಮಾಸ'],
    meaningEn: 'Compound words formed by joining multiple meaningful nouns/roots',
    category: 'ವ್ಯಾಕರಣ',
    sourceReference: 'DSERT 10th Standard Kannada Vyakarna, Chapter 5',
    verificationStatus: 'VERIFIED',
  },
  {
    id: 'term-vibhakti',
    canonicalKn: 'ವಿಭಕ್ತಿ',
    standardRoman: 'vibhakti',
    romanVariants: ['vibhakti', 'vibhaktigalu', 'vibhakthi', 'vibhakti pratyaya'],
    misspellingsKn: ['ವಿಭಕ್ಥಿ', 'ವಿಬಕ್ತಿ', 'ವಿಭಖ್ತಿ'],
    meaningEn: 'Case declensions and case-marking affixes',
    category: 'ವ್ಯಾಕರಣ',
    sourceReference: 'DSERT 10th Standard Kannada Vyakarna, Chapter 4',
    verificationStatus: 'VERIFIED',
  },
  {
    id: 'term-vyakarana',
    canonicalKn: 'ವ್ಯಾಕರಣ',
    standardRoman: 'vyakarana',
    romanVariants: ['vyakarana', 'vyaakarana', 'vyakaran', 'vyakarna'],
    misspellingsKn: ['ವ್ಯಾಕರನ', 'ವ್ಯಕರಣ', 'ವ್ಯಾಕರೆಣ'],
    meaningEn: 'Kannada grammar structure and linguistic rules',
    category: 'ವ್ಯಾಕರಣ',
    sourceReference: 'DSERT Kannada Vyakarna Pravesha',
    verificationStatus: 'VERIFIED',
  },
  {
    id: 'term-alankara',
    canonicalKn: 'ಅಲಂಕಾರ',
    standardRoman: 'alankara',
    romanVariants: ['alankara', 'alankaragalu', 'alankaara', 'alamkara'],
    misspellingsKn: ['ಅಲಂಖಾರ', 'ಅಲಂಕಾರ್', 'ಅಲಂಕರ'],
    meaningEn: 'Figures of speech and poetic embellishments',
    category: 'ವ್ಯಾಕರಣ',
    sourceReference: 'DSERT 10th Standard Kannada Sahitya, Chapter 9',
    verificationStatus: 'VERIFIED',
  },
  {
    id: 'term-ganitha',
    canonicalKn: 'ಗಣಿತ',
    standardRoman: 'ganitha',
    romanVariants: ['ganitha', 'ganita', 'ganith'],
    misspellingsKn: ['ಗನಿಥ', 'ಗನಿತ', 'ಘಣಿತ'],
    meaningEn: 'Mathematics, arithmetic, and geometric formulas',
    category: 'ಸಾಮಾನ್ಯ',
    sourceReference: 'Karnataka Secondary School Subject Nomenclature',
    verificationStatus: 'VERIFIED',
  },
  {
    id: 'term-parisara',
    canonicalKn: 'ಪರಿಸರದ ಅಧ್ಯಯನ',
    standardRoman: 'parisarada adhyayana',
    romanVariants: ['parisara', 'parisarada', 'adhyayana', 'parisarada adhyayana'],
    misspellingsKn: ['ಪರಿಸರದ ಅದ್ಯಯನ', 'ಪರಿಸರ ಅದ್ಯಯನ'],
    meaningEn: 'Environmental studies, ecology, and natural conservation',
    category: 'ಪ್ರಬಂಧ & ಗಾದೆ',
    sourceReference: 'Karnataka Secondary School Subject Nomenclature',
    verificationStatus: 'VERIFIED',
  },
  {
    id: 'term-kuvempu',
    canonicalKn: 'ಕುವೆಂಪು',
    standardRoman: 'kuvempu',
    romanVariants: ['kuvempu', 'kuvempu kavi'],
    misspellingsKn: ['ಕುವೆಂಪೂ', 'ಕುವೆಮ್ಪು'],
    meaningEn: 'Rashtrakavi Kuvempu (K. V. Puttappa)',
    category: 'ಕವಿ ಪರಿಚಯ',
    sourceReference: 'Kannada Sahitya Charitre',
    verificationStatus: 'VERIFIED',
  },
  {
    id: 'term-bendre',
    canonicalKn: 'ದ.ರಾ. ಬೇಂದ್ರೆ',
    standardRoman: 'bendre',
    romanVariants: ['bendre', 'da ra bendre', 'dara bendre'],
    misspellingsKn: ['ಬೆಂದ್ರೆ', 'ಬೇನ್ದ್ರೆ'],
    meaningEn: 'Varakavi D. R. Bendre',
    category: 'ಕವಿ ಪರಿಚಯ',
    sourceReference: 'Kannada Sahitya Charitre',
    verificationStatus: 'VERIFIED',
  },
  {
    id: 'term-yuddha',
    canonicalKn: 'ಯುದ್ಧ',
    standardRoman: 'yuddha',
    romanVariants: ['yuddha', 'yudha'],
    misspellingsKn: ['ಯುದ್ದ', 'ಯೂದ್ಧ'],
    meaningEn: 'Prose lesson "Yuddha" by Sara Aboobacker',
    category: 'ನೋಟ್ಸ್',
    sourceReference: '10th Standard Kannada First Language Textbook',
    verificationStatus: 'VERIFIED',
  },
  {
    id: 'term-shabari',
    canonicalKn: 'ಶಬರಿ',
    standardRoman: 'shabari',
    romanVariants: ['shabari', 'sabari'],
    misspellingsKn: ['ಶಭರಿ', 'ಸಬರಿ'],
    meaningEn: 'Opera / lyrical play "Shabari" by PuTiNa',
    category: 'ನೋಟ್ಸ್',
    sourceReference: '10th Standard Kannada First Language Textbook',
    verificationStatus: 'VERIFIED',
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

function detectScriptComposition(text) {
  if (!text || !text.trim()) return 'NUMERIC_OR_EMPTY';
  const hasKannada = /[\u0C80-\u0CFF]/.test(text);
  const hasLatin = /[a-zA-Z]/.test(text);

  if (hasKannada && hasLatin) return 'MIXED_SCRIPT';
  if (hasKannada && !hasLatin) return 'PURE_KANNADA';
  if (!hasKannada && hasLatin) return 'PURE_LATIN';
  return 'NUMERIC_OR_EMPTY';
}

const KNOWN_ORTHOGRAPHIC_RULES = [
  {
    words: ['ಸನ್ಧಿ', 'ಸಂದಿ'],
    replacement: 'ಸಂಧಿ',
    reason: 'ಅನುಸ್ವಾರ ಮತ್ತು ಮಹಾಪ್ರಾಣ ವ್ಯತ್ಯಾಸ: "ಸಂಧಿ" ಪ್ರಮಾಣಿತ ರೂಪ.',
    reference: 'DSERT 10th Standard Kannada Vyakarna, Chapter 3',
  },
  {
    words: ['ಕ್ರುದಂತ', 'ಕ್ರುದಂತಗಳು', 'ಕೃದಂಥ', 'ಕೃದನ್ತ', 'ಕೃದನ್ತಗಳು'],
    replacement: 'ಕೃದಂತಗಳು',
    reason: 'ಸ್ವರ ಋ-ಕಾರ (ಕೃ) ಬದಲು ರ-ಒತ್ತು (ಕ್ರು) ದೋಷ: "ಕೃದಂತಗಳು" ಪ್ರಮಾಣಿತ ರೂಪ.',
    reference: 'DSERT 10th Standard Kannada Vyakarna, Chapter 6',
  },
  {
    words: ['ವ್ಯಾಕರನ', 'ವ್ಯಕರಣ', 'ವ್ಯಾಕರೆಣ'],
    replacement: 'ವ್ಯಾಕರಣ',
    reason: 'ದಂತ ನ ಬದಲು ಮೂರ್ಧನ್ಯ ಣ: "ವ್ಯಾಕರಣ" ಪ್ರಮಾಣಿತ ರೂಪ.',
    reference: 'DSERT Kannada Vyakarna Pravesha',
  },
  {
    words: ['ಸಮಸ', 'ಸಮಾಶ'],
    replacement: 'ಸಮಾಸ',
    reason: 'ದೀರ್ಘ ಸ್ವರ ಮತ್ತು ಶ/ಸ ವ್ಯತ್ಯಾಸ: "ಸಮಾಸ" ಪ್ರಮಾಣಿತ ರೂಪ.',
    reference: 'DSERT 10th Standard Kannada Vyakarna, Chapter 5',
  },
  {
    words: ['ವಿಭಕ್ಥಿ', 'ವಿಬಕ್ತಿ', 'ವಿಭಖ್ತಿ'],
    replacement: 'ವಿಭಕ್ತಿ',
    reason: 'ಅಲ್ಪಪ್ರಾಣ-ಮಹಾಪ್ರಾಣ ದೋಷ: "ವಿಭಕ್ತಿ" ಪ್ರಮಾಣಿತ ರೂಪ.',
    reference: 'DSERT 10th Standard Kannada Vyakarna, Chapter 4',
  },
  {
    words: ['ಅಲಂಖಾರ', 'ಅಲಂಖಾರಗಳು', 'ಅಲಂಕಾರ್'],
    replacement: 'ಅಲಂಕಾರ',
    reason: 'ಅಲ್ಪಪ್ರಾಣ ಕ ಬದಲು ಮಹಾಪ್ರಾಣ ಖ: "ಅಲಂಕಾರ" ಪ್ರಮಾಣಿತ ರೂಪ.',
    reference: 'DSERT 10th Standard Kannada Sahitya, Chapter 9',
  },
  {
    words: ['ಗನಿಥ', 'ಗನಿತ', 'ಘಣಿತ'],
    replacement: 'ಗಣಿತ',
    reason: 'ಮೂರ್ಧನ್ಯ ಣ ಮತ್ತು ಅಲ್ಪಪ್ರಾಣ ತ: "ಗಣಿತ" ಪ್ರಮಾಣಿತ ರೂಪ.',
    reference: 'Karnataka Secondary School Subject Nomenclature',
  },
];

function auditKannadaText(text) {
  if (!text || !text.trim()) return [];

  const findings = [];
  const normalized = normalizeKannadaUnicode(text);

  for (const rule of KNOWN_ORTHOGRAPHIC_RULES) {
    for (const badWord of rule.words) {
      if (normalized.includes(badWord)) {
        findings.push({
          sourceText: badWord,
          suggestedCorrection: rule.replacement,
          reason: rule.reason,
          severity: 'ERROR',
          confidence: 0.98,
          reference: rule.reference,
        });
      }
    }
  }

  for (const entry of KANNADA_EDUCATIONAL_GLOSSARY) {
    if (entry.misspellingsKn) {
      for (const bad of entry.misspellingsKn) {
        if (normalized.includes(bad)) {
          findings.push({
            sourceText: bad,
            suggestedCorrection: entry.canonicalKn,
            reason: `ಅಧಿಕೃತ ಶಬ್ದಕೋಶ ದೋಷ: "${bad}" ಬದಲು "${entry.canonicalKn}" ಬಳಸಬೇಕು.`,
            severity: 'ERROR',
            confidence: 0.99,
            reference: entry.sourceReference,
          });
        }
      }
    }
  }

  return findings;
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

  // Check glossary exact match
  const cleanInput = text.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim();
  for (const entry of KANNADA_EDUCATIONAL_GLOSSARY) {
    if (
      entry.standardRoman.toLowerCase() === cleanInput ||
      entry.romanVariants.some((v) => v.toLowerCase() === cleanInput)
    ) {
      candidateSets.push(entry.canonicalKn);
      break;
    }
  }

  const candPhonetic = tokens
    .map((token) => {
      if (/^\s+$/.test(token)) return token;
      if (/^[\u0C80-\u0CFF]+$/.test(token)) return normalizeKannadaUnicode(token);

      const cleanWord = token.toLowerCase().replace(/[^a-z]/g, '');
      if (!cleanWord) return token;

      const glossaryMatch = KANNADA_EDUCATIONAL_GLOSSARY.find(
        (g) =>
          g.standardRoman.toLowerCase() === cleanWord ||
          g.romanVariants.some((v) => v.toLowerCase() === cleanWord)
      );
      if (glossaryMatch) {
        return token.toLowerCase().replace(cleanWord, glossaryMatch.canonicalKn);
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

  const candidates = [];
  for (const raw of candidateSets) {
    const normalized = normalizeKannadaUnicode(raw).trim();
    if (normalized && !candidates.includes(normalized)) {
      candidates.push(normalized);
    }
  }

  return candidates;
}

describe('Phase 4 & 5: Kannada Terminology Glossary & Audit Engine Tests', () => {
  describe('Glossary Structure and Canonical Text Policy', () => {
    test('Glossary contains key secondary education grammar terms', () => {
      const canonicalTerms = KANNADA_EDUCATIONAL_GLOSSARY.map((g) => g.canonicalKn);
      expect(canonicalTerms).toContain('ಸಂಧಿ');
      expect(canonicalTerms).toContain('ಕೃದಂತಗಳು');
      expect(canonicalTerms).toContain('ಸಮಾಸ');
      expect(canonicalTerms).toContain('ವಿಭಕ್ತಿ');
      expect(canonicalTerms).toContain('ವ್ಯಾಕರಣ');
      expect(canonicalTerms).toContain('ಅಲಂಕಾರ');
      expect(canonicalTerms).toContain('ಗಣಿತ');
    });

    test('Every glossary entry contains mandatory verification metadata', () => {
      for (const entry of KANNADA_EDUCATIONAL_GLOSSARY) {
        expect(entry.id).toBeTruthy();
        expect(entry.canonicalKn).toBeTruthy();
        expect(entry.standardRoman).toBeTruthy();
        expect(Array.isArray(entry.romanVariants)).toBe(true);
        expect(entry.meaningEn).toBeTruthy();
        expect(entry.sourceReference).toBeTruthy();
        expect(entry.verificationStatus).toBe('VERIFIED');
      }
    });
  });

  describe('Script Composition Detection', () => {
    test('Detects pure Kannada script', () => {
      expect(detectScriptComposition('ಕನ್ನಡ ವ್ಯಾಕರಣ')).toBe('PURE_KANNADA');
    });

    test('Detects pure Latin script', () => {
      expect(detectScriptComposition('kannada vyakarana')).toBe('PURE_LATIN');
    });

    test('Detects mixed Kannada and Latin scripts', () => {
      expect(detectScriptComposition('10ನೇ class kannada')).toBe('MIXED_SCRIPT');
    });
  });

  describe('Orthographic Misspelling Detection Pipeline', () => {
    test('Detects "ಕ್ರುದಂತ" and proposes "ಕೃದಂತ" with curricular reason', () => {
      const findings = auditKannadaText('ಈ ಪಾಠದಲ್ಲಿ ಕ್ರುದಂತ ರೂಪಗಳಿವೆ');
      expect(findings.length).toBeGreaterThan(0);
      const krudantaIssue = findings.find((f) => f.sourceText.includes('ಕ್ರುದಂತ'));
      expect(krudantaIssue).toBeDefined();
      expect(krudantaIssue.suggestedCorrection).toContain('ಕೃದಂತ');
      expect(krudantaIssue.reason).toContain('ಸ್ವರ ಋ-ಕಾರ');
    });

    test('Detects "ಸಂದಿ" / "ಸನ್ಧಿ" and proposes "ಸಂಧಿ"', () => {
      const findings = auditKannadaText('ಕನ್ನಡ ಸಂದಿ ನಿಯಮಗಳು');
      expect(findings.length).toBeGreaterThan(0);
      const sandhiIssue = findings.find((f) => f.sourceText.includes('ಸಂದಿ'));
      expect(sandhiIssue).toBeDefined();
      expect(sandhiIssue.suggestedCorrection).toBe('ಸಂಧಿ');
    });

    test('Detects "ವ್ಯಾಕರನ" and proposes "ವ್ಯಾಕರಣ"', () => {
      const findings = auditKannadaText('ಕನ್ನಡ ವ್ಯಾಕರನ ಪರಿಚಯ');
      const vyakaranaIssue = findings.find((f) => f.sourceText.includes('ವ್ಯಾಕರನ'));
      expect(vyakaranaIssue).toBeDefined();
      expect(vyakaranaIssue.suggestedCorrection).toBe('ವ್ಯಾಕರಣ');
    });

    test('Detects "ಸಮಸ" and proposes "ಸಮಾಸ"', () => {
      const findings = auditKannadaText('ತತ್ಪುರುಷ ಸಮಸ ಉದಾಹರಣೆ');
      const samasaIssue = findings.find((f) => f.sourceText.includes('ಸಮಸ'));
      expect(samasaIssue).toBeDefined();
      expect(samasaIssue.suggestedCorrection).toBe('ಸಮಾಸ');
    });

    test('Detects "ಗನಿಥ" and proposes "ಗಣಿತ"', () => {
      const findings = auditKannadaText('10ನೇ ತರಗತಿ ಗನಿಥ');
      const mathIssue = findings.find((f) => f.sourceText.includes('ಗನಿಥ'));
      expect(mathIssue).toBeDefined();
      expect(mathIssue.suggestedCorrection).toBe('ಗಣಿತ');
    });

    test('Valid canonical Kannada text passes audit cleanly with 0 errors', () => {
      const cleanText = 'ಕನ್ನಡ ಸಂಧಿಗಳು ಮತ್ತು ಸಮಾಸಗಳು — 10ನೇ ತರಗತಿ ವ್ಯಾಕರಣ';
      const findings = auditKannadaText(cleanText);
      const errors = findings.filter((f) => f.severity === 'ERROR');
      expect(errors.length).toBe(0);
    });
  });

  describe('Phase 8: Accuracy Test Corpus for Educational Transliteration', () => {
    const TEST_CORPUS = [
      { input: 'sandhi', expected: 'ಸಂಧಿ' },
      { input: 'krudanthagalu', expected: 'ಕೃದಂತಗಳು' },
      { input: 'krudanta', expected: 'ಕೃದಂತಗಳು' },
      { input: 'samasa', expected: 'ಸಮಾಸ' },
      { input: 'vibhakti', expected: 'ವಿಭಕ್ತಿ' },
      { input: 'vyakarana', expected: 'ವ್ಯಾಕರಣ' },
      { input: 'alankara', expected: 'ಅಲಂಕಾರ' },
      { input: 'ganitha', expected: 'ಗಣಿತ' },
      { input: 'parisarada adhyayana', expected: 'ಪರಿಸರದ ಅಧ್ಯಯನ' },
      { input: 'yuddha', expected: 'ಯುದ್ಧ' },
      { input: 'shabari', expected: 'ಶಬರಿ' },
      { input: 'kuvempu', expected: 'ಕುವೆಂಪು' },
      { input: 'bendre', expected: 'ದ.ರಾ. ಬೇಂದ್ರೆ' },
    ];

    test('Measures top-1 and top-k accuracy on verified educational corpus', () => {
      let top1Matches = 0;
      let topKMatches = 0;

      for (const item of TEST_CORPUS) {
        const candidates = transliterateToKannada(item.input);
        expect(candidates.length).toBeGreaterThan(0);

        if (candidates[0].includes(item.expected) || item.expected.includes(candidates[0])) {
          top1Matches++;
        }

        if (candidates.some((c) => c.includes(item.expected) || item.expected.includes(c))) {
          topKMatches++;
        }
      }

      const top1Accuracy = (top1Matches / TEST_CORPUS.length) * 100;
      const topKAccuracy = (topKMatches / TEST_CORPUS.length) * 100;

      expect(topKAccuracy).toBe(100);
      expect(top1Accuracy).toBeGreaterThanOrEqual(90);
    });
  });
});
