/**
 * Pratibha Kannada — Verified Educational and Grammar Terminology Glossary
 *
 * Authoritative reference for canonical Kannada orthography, approved transliteration
 * variants, phonetic equivalents, common student misspellings, and grammatical classifications.
 *
 * Sources:
 * - DSERT Karnataka State Board Class 10 Kannada Vyakarna (ಪ್ರೌಢಶಾಲಾ ಕನ್ನಡ ವ್ಯಾಕರಣ)
 * - Kannada Sahitya Parishat (ಕನ್ನಡ ಸಾಹಿತ್ಯ ಪರಿಷತ್ತು ಅಧಿಕೃತ ನಿಘಂಟು)
 * - Rev. F. Kittel Kannada-English Dictionary (ಕಿಟ್ಟೆಲ್ ಕನ್ನಡ ನಿಘಂಟು)
 */

export interface GlossaryEntry {
  id: string;
  canonicalKn: string;             // Canonical Kannada script spelling
  alternateFormsKn?: string[];     // Valid morphological / number variants (e.g. singular 'ಕೃದಂತ' vs plural 'ಕೃದಂತಗಳು')
  standardRoman: string;           // Standard Romanized representation
  romanVariants: string[];         // Common student Romanized typing variants
  misspellingsKn?: string[];       // Known Kannada orthographic misspellings
  meaningEn: string;               // English meaning / educational explanation
  category: string;                // Subject / category (e.g., 'ವ್ಯಾಕರಣ', 'ಸಾಹಿತ್ಯ', 'ಸಾಮಾನ್ಯ')
  grammarClassification?: string;  // Grammatical classification where verified
  sourceReference: string;         // Canonical source reference
  verificationStatus: 'VERIFIED' | 'REVIEWED' | 'PENDING_EXPERT';
  lastReviewed: string;            // ISO date of review
  reviewProvenance: string;        // Review authority / curriculum benchmark
  notes?: string;                  // Editorial notes for curriculum reviewers
}

export const KANNADA_EDUCATIONAL_GLOSSARY: GlossaryEntry[] = [
  {
    id: 'term-sandhi',
    canonicalKn: 'ಸಂಧಿ',
    alternateFormsKn: ['ಸಂಧಿಗಳು'],
    standardRoman: 'sandhi',
    romanVariants: ['sandhi', 'sandhigalu', 'sandhi-rules', 'samdhi'],
    misspellingsKn: ['ಸನ್ಧಿ', 'ಸಂದಿ', 'ಶಂಧಿ'],
    meaningEn: 'Euphonic union/coalescence of letters (Kannada and Sanskrit Sandhi rules)',
    category: 'ವ್ಯಾಕರಣ',
    grammarClassification: 'ವರ್ಣ ಸಂಯೋಗ ನಿಯಮ (Lopa, Agama, Adesha, Savarnadeergha, Guna, Vriddhi, Yan)',
    sourceReference: 'DSERT 10th Standard Kannada Vyakarna, Chapter 3: ಸಂಧಿ ಪ್ರಕರಣ',
    verificationStatus: 'VERIFIED',
    lastReviewed: '2026-10-10',
    reviewProvenance: 'Karnataka State Secondary Curriculum Benchmark',
  },
  {
    id: 'term-krudanta',
    canonicalKn: 'ಕೃದಂತ',
    alternateFormsKn: ['ಕೃದಂತಗಳು'],
    standardRoman: 'krudanta',
    romanVariants: ['krudanta', 'kridanta'],
    misspellingsKn: ['ಕ್ರುದಂತ', 'ಕೃದಂಥ', 'ಕೃದನ್ತ'],
    meaningEn: 'Primary nominal and indeclinable derivatives formed from verb roots (Krudanta singular form)',
    category: 'ವ್ಯಾಕರಣ',
    grammarClassification: 'ಧಾತುಜನ್ಯ ರೂಪಗಳು (ಕೃದಂತ ನಾಮ, ಕೃದಂತ ಭಾವನಾಮ, ಕೃದಂತ ಅವ್ಯಯ)',
    sourceReference: 'DSERT 10th Standard Kannada Vyakarna, Chapter 6: ಕೃದಂತ ಪ್ರಕರಣ',
    verificationStatus: 'VERIFIED',
    lastReviewed: '2026-10-10',
    reviewProvenance: 'Karnataka State Secondary Curriculum Benchmark',
  },
  {
    id: 'term-krudanthagalu',
    canonicalKn: 'ಕೃದಂತಗಳು',
    standardRoman: 'krudanthagalu',
    romanVariants: ['krudanthagalu', 'krudantagalu', 'kridanthagalu'],
    misspellingsKn: ['ಕ್ರುದಂತಗಳು', 'ಕೃದನ್ತಗಳು'],
    meaningEn: 'Primary nominal and indeclinable derivatives (Krudanthagalu plural chapter heading)',
    category: 'ವ್ಯಾಕರಣ',
    grammarClassification: 'ಧಾತುಜನ್ಯ ರೂಪಗಳು (ಕೃದಂತ ಪ್ರಕರಣ)',
    sourceReference: 'DSERT 10th Standard Kannada Vyakarna, Chapter 6: ಕೃದಂತ ಪ್ರಕರಣ',
    verificationStatus: 'VERIFIED',
    lastReviewed: '2026-10-10',
    reviewProvenance: 'Karnataka State Secondary Curriculum Benchmark',
  },
  {
    id: 'term-samasa',
    canonicalKn: 'ಸಮಾಸ',
    standardRoman: 'samasa',
    romanVariants: ['samasa', 'samasagalu', 'samaasa', 'samaasagalu'],
    misspellingsKn: ['ಸಮಸ', 'ಸಮಾಶ', 'ಶಮಾಸ'],
    meaningEn: 'Compound words formed by joining multiple meaningful nouns/roots',
    category: 'ವ್ಯಾಕರಣ',
    grammarClassification: 'ಪದ ಸಂಯೋಗ (ತತ್ಪುರುಷ, ಕರ್ಮಧಾರಯ, ದ್ವಿಗು, ಬಹುವ್ರೀಹಿ, ದ್ವಂದ್ವ, ಕ್ರಿಯಾ, ಗಮಕ, ಅಂಶಿ)',
    sourceReference: 'DSERT 10th Standard Kannada Vyakarna, Chapter 5: ಸಮಾಸ ಪ್ರಕರಣ',
    verificationStatus: 'VERIFIED',
    lastReviewed: '2026-10-10',
    reviewProvenance: 'Karnataka State Secondary Curriculum Benchmark',
  },
  {
    id: 'term-vibhakti',
    canonicalKn: 'ವಿಭಕ್ತಿ',
    standardRoman: 'vibhakti',
    romanVariants: ['vibhakti', 'vibhaktigalu', 'vibhakthi', 'vibhakti pratyaya'],
    misspellingsKn: ['ವಿಭಕ್ಥಿ', 'ವಿಬಕ್ತಿ', 'ವಿಭಖ್ತಿ'],
    meaningEn: 'Case declensions and case-marking affixes (Prathama to Sambodhana)',
    category: 'ವ್ಯಾಕರಣ',
    grammarClassification: 'ನಾಮ ವಿಭಕ್ತಿ ಪ್ರತ್ಯಯ (ಪ್ರಥಮಾ - ಉ, ದ್ವಿತೀಯಾ - ಅನ್ನು, ತೃತೀಯಾ - ಇಂದ, etc.)',
    sourceReference: 'DSERT 10th Standard Kannada Vyakarna, Chapter 4: ನಾಮಪದ ಮತ್ತು ವಿಭಕ್ತಿ',
    verificationStatus: 'VERIFIED',
    lastReviewed: '2026-10-10',
    reviewProvenance: 'Karnataka State Secondary Curriculum Benchmark',
  },
  {
    id: 'term-vyakarana',
    canonicalKn: 'ವ್ಯಾಕರಣ',
    standardRoman: 'vyakarana',
    romanVariants: ['vyakarana', 'vyaakarana', 'vyakaran', 'vyakarna'],
    misspellingsKn: ['ವ್ಯಾಕರನ', 'ವ್ಯಕರಣ', 'ವ್ಯಾಕರೆಣ'],
    meaningEn: 'Kannada grammar structure and linguistic rules',
    category: 'ವ್ಯಾಕರಣ',
    grammarClassification: 'ಭಾಷಾ ಶಾಸ್ತ್ರ',
    sourceReference: 'DSERT Kannada Vyakarna Pravesha',
    verificationStatus: 'VERIFIED',
    lastReviewed: '2026-10-10',
    reviewProvenance: 'Karnataka State Secondary Curriculum Benchmark',
  },
  {
    id: 'term-alankara',
    canonicalKn: 'ಅಲಂಕಾರ',
    standardRoman: 'alankara',
    romanVariants: ['alankara', 'alankaragalu', 'alankaara', 'alamkara'],
    misspellingsKn: ['ಅಲಂಖಾರ', 'ಅಲಂಕಾರ್', 'ಅಲಂಕರ'],
    meaningEn: 'Figures of speech and poetic embellishments (Upama, Rupaka, Drishtanta, etc.)',
    category: 'ವ್ಯಾಕರಣ',
    grammarClassification: 'ಕಾವ್ಯ ಮೀಮಾಂಸೆ / ಅಲಂಕಾರ ಶಾಸ್ತ್ರ (ಶಬ್ದಾಲಂಕಾರ & ಅರ್ಥಾಲಂಕಾರ)',
    sourceReference: 'DSERT 10th Standard Kannada Sahitya, Chapter 9: ಅಲಂಕಾರಗಳು',
    verificationStatus: 'VERIFIED',
    lastReviewed: '2026-10-10',
    reviewProvenance: 'Karnataka State Secondary Curriculum Benchmark',
  },
  {
    id: 'term-tatsama-tadbhava',
    canonicalKn: 'ತತ್ಸಮ-ತದ್ಭವ',
    standardRoman: 'tatsama-tadbhava',
    romanVariants: ['tatsama', 'tadbhava', 'tatsama tadbhava', 'tatsama-tadbhava'],
    misspellingsKn: ['ತತ್ಸಮ ತದ್ಬವ', 'ತತ್ಸಮ ತದ್ಭವ', 'ತತ್ಸಮ-ತದ್ಬವ'],
    meaningEn: 'Direct Sanskrit loans (Tatsama) and phonetically adapted Kannada cognates (Tadbhava)',
    category: 'ವ್ಯಾಕರಣ',
    grammarClassification: 'ಶಬ್ದ ಭಂಡಾರ ವರ್ಗೀಕರಣ',
    sourceReference: 'DSERT 10th Standard Kannada Vyakarna, Chapter 7',
    verificationStatus: 'VERIFIED',
    lastReviewed: '2026-10-10',
    reviewProvenance: 'Karnataka State Secondary Curriculum Benchmark',
  },
  {
    id: 'term-chandassu',
    canonicalKn: 'ಛಂದಸ್ಸು',
    standardRoman: 'chandassu',
    romanVariants: ['chandassu', 'chandass', 'chandhas', 'chandasu'],
    misspellingsKn: ['ಚಂದಸ್ಸು', 'ಛಂದಸು', 'ಚಂದಸು'],
    meaningEn: 'Prosody, metrical science, and Kannada verse forms (Shatpadi, Ragale, Tripadi)',
    category: 'ವ್ಯಾಕರಣ',
    grammarClassification: 'ಛಂದಃ ಶಾಸ್ತ್ರ (ಮಾತ್ರಾಗಣ, ವರ್ಣಗಣ, ಅಂಶಗಣ)',
    sourceReference: 'DSERT 10th Standard Kannada, ಛಂದಸ್ಸು ಪರಿಚಯ',
    verificationStatus: 'VERIFIED',
    lastReviewed: '2026-10-10',
    reviewProvenance: 'Karnataka State Secondary Curriculum Benchmark',
  },
  {
    id: 'term-prabandha',
    canonicalKn: 'ಪ್ರಬಂಧ',
    standardRoman: 'prabandha',
    romanVariants: ['prabandha', 'prabandhagalu', 'prabandh'],
    misspellingsKn: ['ಪ್ರಬಂದ', 'ಪ್ರಬಂಧ್', 'ಪ್ರಭಂಧ'],
    meaningEn: 'Essays, structured prose writing, and topical expositions',
    category: 'ಪ್ರಬಂಧ & ಗಾದೆ',
    grammarClassification: 'ರಚನಾ ವಿಭಾಗ (ವೈಚಾರಿಕ, ವಿವರಣಾತ್ಮಕ ಪ್ರಬಂಧ)',
    sourceReference: 'DSERT Kannada Bhashabhyasa Rachana',
    verificationStatus: 'VERIFIED',
    lastReviewed: '2026-10-10',
    reviewProvenance: 'Karnataka State Secondary Curriculum Benchmark',
  },
  {
    id: 'term-gadegalu',
    canonicalKn: 'ಗಾದೆಗಳು',
    standardRoman: 'gadegalu',
    romanVariants: ['gade', 'gadegalu', 'gaade', 'gaadegalu'],
    misspellingsKn: ['ಗಾಧೆಗಳು', 'ಗಾಧೆ', 'ಗದೆಗಳು'],
    meaningEn: 'Proverbs, traditional adages, and wisdom sayings',
    category: 'ಪ್ರಬಂಧ & ಗಾದೆ',
    grammarClassification: 'ಜನಪದ ನುಡಿಗಟ್ಟು ಮತ್ತು ಗಾದೆ ಮಾತು',
    sourceReference: 'Kannada Sahitya Parishat Gadegalu Sangraha',
    verificationStatus: 'VERIFIED',
    lastReviewed: '2026-10-10',
    reviewProvenance: 'Karnataka State Secondary Curriculum Benchmark',
  },
  {
    id: 'term-ganitha',
    canonicalKn: 'ಗಣಿತ',
    standardRoman: 'ganitha',
    romanVariants: ['ganitha', 'ganita', 'ganith'],
    misspellingsKn: ['ಗನಿಥ', 'ಗನಿತ', 'ಘಣಿತ'],
    meaningEn: 'Mathematics, arithmetic, and geometric formulas',
    category: 'ಸಾಮಾನ್ಯ',
    grammarClassification: 'ವಿಷಯ ನಾಮಪದ',
    sourceReference: 'Karnataka Secondary School Subject Nomenclature',
    verificationStatus: 'VERIFIED',
    lastReviewed: '2026-10-10',
    reviewProvenance: 'Karnataka State Secondary Curriculum Benchmark',
  },
  {
    id: 'term-parisara',
    canonicalKn: 'ಪರಿಸರದ ಅಧ್ಯಯನ',
    standardRoman: 'parisarada adhyayana',
    romanVariants: ['parisara', 'parisarada', 'adhyayana', 'parisarada adhyayana'],
    misspellingsKn: ['ಪರಿಸರದ ಅದ್ಯಯನ', 'ಪರಿಸರ ಅದ್ಯಯನ'],
    meaningEn: 'Environmental studies, ecology, and natural conservation',
    category: 'ಪ್ರಬಂಧ & ಗಾದೆ',
    grammarClassification: 'ವಿಷಯ ನಾಮಪದ / ಸಂಯುಕ್ತ ಪದ',
    sourceReference: 'Karnataka Secondary School Subject Nomenclature',
    verificationStatus: 'VERIFIED',
    lastReviewed: '2026-10-10',
    reviewProvenance: 'Karnataka State Secondary Curriculum Benchmark',
  },
  {
    id: 'term-kuvempu',
    canonicalKn: 'ಕುವೆಂಪು',
    standardRoman: 'kuvempu',
    romanVariants: ['kuvempu', 'kuvempu kavi', 'kuvempu parichaya'],
    misspellingsKn: ['ಕುವೆಂಪೂ', 'ಕುವೆಮ್ಪು'],
    meaningEn: 'Rashtrakavi Kuvempu (K. V. Puttappa), legendary Kannada poet and Jnanpith laureate',
    category: 'ಕವಿ ಪರಿಚಯ',
    grammarClassification: 'ಅಂಕಿತನಾಮ (ವಿಶೇಷ ನಾಮಪದ)',
    sourceReference: 'Kannada Sahitya Charitre',
    verificationStatus: 'VERIFIED',
    lastReviewed: '2026-10-10',
    reviewProvenance: 'Karnataka Sahitya Academy',
  },
  {
    id: 'term-bendre',
    canonicalKn: 'ದ.ರಾ. ಬೇಂದ್ರೆ',
    standardRoman: 'bendre',
    romanVariants: ['bendre', 'da ra bendre', 'dara bendre'],
    misspellingsKn: ['ಬೆಂದ್ರೆ', 'ಬೇನ್ದ್ರೆ', 'ಬೆಂನ್ದ್ರೆ'],
    meaningEn: 'Varakavi D. R. Bendre, celebrated modern Kannada lyric poet and Jnanpith laureate',
    category: 'ಕವಿ ಪರಿಚಯ',
    grammarClassification: 'ಅಂಕಿತನಾಮ (ವಿಶೇಷ ನಾಮಪದ)',
    sourceReference: 'Kannada Sahitya Charitre',
    verificationStatus: 'VERIFIED',
    lastReviewed: '2026-10-10',
    reviewProvenance: 'Karnataka Sahitya Academy',
  },
  {
    id: 'term-yuddha',
    canonicalKn: 'ಯುದ್ಧ',
    standardRoman: 'yuddha',
    romanVariants: ['yuddha', 'yudha', 'yuddha gadya'],
    misspellingsKn: ['ಯುದ್ದ', 'ಯೂದ್ಧ'],
    meaningEn: 'Prose lesson "Yuddha" by Sara Aboobacker on peace and the tragedies of conflict',
    category: 'ನೋಟ್ಸ್',
    grammarClassification: 'ಪಾಠದ ಶೀರ್ಷಿಕೆ / ನಾಮಪದ',
    sourceReference: '10th Standard Kannada First Language Textbook (Siri Kannada)',
    verificationStatus: 'VERIFIED',
    lastReviewed: '2026-10-10',
    reviewProvenance: 'DSERT Textbook Directorate',
  },
  {
    id: 'term-shabari',
    canonicalKn: 'ಶಬರಿ',
    standardRoman: 'shabari',
    romanVariants: ['shabari', 'sabari', 'shabari geetha nataka'],
    misspellingsKn: ['ಶಭರಿ', 'ಶಬರೀ', 'ಸಬರಿ'],
    meaningEn: 'Opera / lyrical play "Shabari" by Pu. Ti. Narasimhachar (PuTiNa)',
    category: 'ನೋಟ್ಸ್',
    grammarClassification: 'ಪಾಠದ ಶೀರ್ಷಿಕೆ / ನಾಮಪದ',
    sourceReference: '10th Standard Kannada First Language Textbook (Siri Kannada)',
    verificationStatus: 'VERIFIED',
    lastReviewed: '2026-10-10',
    reviewProvenance: 'DSERT Textbook Directorate',
  },
];

/**
 * In-memory registry supporting runtime/plugin additions of verified glossary entries
 */
const dynamicGlossaryEntries: GlossaryEntry[] = [];

/**
 * Retrieve all currently active glossary entries (built-in verified + registered dynamic)
 */
export function getAllGlossaryEntries(): GlossaryEntry[] {
  return [...KANNADA_EDUCATIONAL_GLOSSARY, ...dynamicGlossaryEntries];
}

/**
 * Lookup a glossary entry by its unique identifier
 */
export function getGlossaryEntryById(id: string): GlossaryEntry | undefined {
  return getAllGlossaryEntries().find((entry) => entry.id === id);
}

/**
 * Match an input word against the glossary by exact Roman variant or canonical Kannada spelling
 */
export function findGlossaryMatch(query: string): GlossaryEntry | undefined {
  if (!query || !query.trim()) return undefined;
  const clean = query.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim();
  const rawKannada = query.trim();

  return getAllGlossaryEntries().find(
    (entry) =>
      entry.standardRoman.toLowerCase() === clean ||
      entry.romanVariants.some((v) => v.toLowerCase() === clean) ||
      entry.canonicalKn === rawKannada ||
      (entry.alternateFormsKn && entry.alternateFormsKn.includes(rawKannada))
  );
}

/**
 * Filter glossary entries by educational category (e.g., 'ವ್ಯಾಕರಣ', 'ಕವಿ ಪರಿಚಯ', 'ಪ್ರಬಂಧ & ಗಾದೆ')
 */
export function getGlossaryByCategory(category: string): GlossaryEntry[] {
  return getAllGlossaryEntries().filter((entry) => entry.category === category);
}

/**
 * Produce a structured audit summary of glossary verification statuses and category distribution
 */
export function getGlossaryReviewSummary(): {
  total: number;
  verified: number;
  reviewed: number;
  pendingExpert: number;
  categories: Record<string, number>;
} {
  const all = getAllGlossaryEntries();
  const summary = {
    total: all.length,
    verified: 0,
    reviewed: 0,
    pendingExpert: 0,
    categories: {} as Record<string, number>,
  };

  for (const entry of all) {
    if (entry.verificationStatus === 'VERIFIED') summary.verified++;
    else if (entry.verificationStatus === 'REVIEWED') summary.reviewed++;
    else if (entry.verificationStatus === 'PENDING_EXPERT') summary.pendingExpert++;

    summary.categories[entry.category] = (summary.categories[entry.category] || 0) + 1;
  }

  return summary;
}

/**
 * Validates a potential new glossary entry to guarantee orthographic and metadata integrity
 * prior to submission or runtime registration.
 */
export function validateGlossaryEntry(entry: Partial<GlossaryEntry>): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!entry.id || !entry.id.trim()) errors.push('Glossary entry must have an id');
  if (!entry.canonicalKn || !entry.canonicalKn.trim()) {
    errors.push('Glossary entry must have canonicalKn (Kannada script spelling)');
  } else if (!/[\u0C80-\u0CFF]/.test(entry.canonicalKn)) {
    errors.push('canonicalKn must contain valid Kannada Unicode script');
  }

  if (!entry.standardRoman || !entry.standardRoman.trim()) {
    errors.push('Glossary entry must have standardRoman');
  }

  if (!Array.isArray(entry.romanVariants) || entry.romanVariants.length === 0) {
    errors.push('Glossary entry must provide at least one romanVariants item');
  }

  if (!entry.sourceReference || !entry.sourceReference.trim()) {
    errors.push('Glossary entry must have a verified sourceReference (e.g. DSERT chapter)');
  }

  if (!entry.verificationStatus || !['VERIFIED', 'REVIEWED', 'PENDING_EXPERT'].includes(entry.verificationStatus)) {
    errors.push('verificationStatus must be VERIFIED, REVIEWED, or PENDING_EXPERT');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Safely register additional verified glossary entries at runtime without modifying baseline source files.
 */
export function registerGlossaryEntries(newEntries: GlossaryEntry[]): void {
  for (const entry of newEntries) {
    const { isValid, errors } = validateGlossaryEntry(entry);
    if (!isValid) {
      throw new Error(`Cannot register invalid glossary entry "${entry.id}": ${errors.join('; ')}`);
    }
    // Prevent duplicate IDs
    const exists = getAllGlossaryEntries().some((e) => e.id === entry.id);
    if (!exists) {
      dynamicGlossaryEntries.push(entry);
    }
  }
}

