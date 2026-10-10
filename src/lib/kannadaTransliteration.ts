import Sanscript from '@indic-transliteration/sanscript';
import { KANNADA_EDUCATIONAL_GLOSSARY } from '../data/kannadaGlossary';
import {
  getKannadaNumberVariants,
  getRomanNumberVariants,
  expandQueryGrammaticalVariants,
} from './kannadaMorphology';

export { getKannadaNumberVariants, getRomanNumberVariants, expandQueryGrammaticalVariants };

/**
 * High-frequency educational and syllabus terms mapped to standard Kannada orthography.
 * Helps resolve ambiguous Roman representations where everyday casual typing differs
 * from formal academic transliteration schemes (e.g. students typing "ganitha" instead of "gaNita").
 */
const HIGH_FREQUENCY_EDUCATIONAL_TERMS: Record<string, string> = {
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

/**
 * Normalizes Kannada Unicode text using NFC and converts conjunct nasals
 * to standard anusvara (ಂ) before stop consonants, matching standard Kannada orthography.
 * Crucially preserves geminate nasals like ನ್ನ (kannada) and ಮ್ಮ (amma).
 */
export function normalizeKannadaUnicode(text: string): string {
  if (!text) return '';
  return text
    .normalize('NFC')
    // ನ್ + [ತಥದಧ] -> ಂ + [ತಥದಧ]
    .replace(/\u0CA8\u0CCD([\u0CA4\u0CA5\u0CA6\u0CA7])/g, '\u0C82$1')
    // ಮ್ + [ಪಫಬಭ] -> ಂ + [ಪಫಬಭ]
    .replace(/\u0CAE\u0CCD([\u0CAA\u0CAB\u0CAC\u0CAD])/g, '\u0C82$1')
    // ಙ್ + [ಕಖಗಘ] -> ಂ + [ಕಖಗಘ]
    .replace(/\u0C99\u0CCD([\u0C95\u0C96\u0C97\u0C98])/g, '\u0C82$1')
    // ಞ್ + [ಚಛಜಝ] -> ಂ + [ಚಛಜಝ]
    .replace(/\u0C9E\u0CCD([\u0C9A\u0C9B\u0C9C\u0C9D])/g, '\u0C82$1')
    // ಣ್ + [ಟಠಡಢ] -> ಂ + [ಟಠಡಢ]
    .replace(/\u0CA3\u0CCD([\u0C9F\u0CA0\u0CA1\u0CA2])/g, '\u0C82$1');
}

/**
 * Converts casual Roman phonetic representations into Baraha scheme characters.
 * Handles casual QWERTY typing patterns:
 * - 'ee' -> long I, 'oo' -> long U, 'aa' -> long A
 * - 'th' -> dental t (casual English typing uses 'th' for Kannada 'ತ')
 * - Nasals before stops -> anusvara 'M'
 */
function romanToBarahaPhonetic(token: string): string {
  let s = token.toLowerCase();

  // Vowels
  s = s.replace(/ee/g, 'I');
  s = s.replace(/oo/g, 'U');
  s = s.replace(/aa/g, 'A');

  // 'th' -> 't' (casual English typing uses 'th' for dental ತ)
  s = s.replace(/th/g, 't');

  // Nasals before stops (e.g. sandhi -> saMdhi, kuvempu -> kuveMpu)
  // Ensure we do NOT match geminate 'nn' or 'mm'
  s = s.replace(/n([kkgcjdDtTpbshvy])/gi, 'M$1');
  s = s.replace(/m([pb])/gi, 'M$1');
  s = s.replace(/ng([gk])/gi, 'M$1');

  // Specific common retroflex patterns
  s = s.replace(/kannada/gi, 'kannaDa');
  s = s.replace(/vyakarana/gi, 'vyAkaraNa');
  s = s.replace(/ganita/gi, 'gaNita');

  return s;
}

/**
 * Transliterates Romanized Kannada input to one or more plausible Kannada-script candidates.
 *
 * Rules:
 * 1. If input is already Kannada script, it is returned normalized via NFC without alteration.
 * 2. Multi-word phrases are preserved with spaces and punctuation.
 * 3. Handles mixed Kannada and English queries gracefully.
 * 4. Generates deduplicated candidates to resolve Roman-to-Kannada phonetic ambiguity.
 */
export function transliterateToKannada(input: string): string[] {
  if (!input || !input.trim()) return [];
  const text = input.trim();

  const hasKannada = /[\u0C80-\u0CFF]/.test(text);
  const hasLatin = /[a-zA-Z]/.test(text);

  // Pure Kannada query: normalize and return immediately
  if (hasKannada && !hasLatin) {
    return [normalizeKannadaUnicode(text)];
  }

  // Tokenize into words while preserving whitespace and punctuation
  const tokens = text.split(/(\s+)/);

  // Generate candidate set
  const candidateSets: string[] = [];

  // Candidate 0: Exact match in verified educational glossary
  const cleanInput = text.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim();
  for (const entry of KANNADA_EDUCATIONAL_GLOSSARY) {
    if (
      entry.standardRoman.toLowerCase() === cleanInput ||
      entry.romanVariants.some((v) => v.toLowerCase() === cleanInput)
    ) {
      candidateSets.push(entry.canonicalKn);
      if (entry.alternateFormsKn) {
        candidateSets.push(...entry.alternateFormsKn);
      }
      break;
    }
  }

  // Candidate 1: Verified glossary term mapping + High-frequency mapping + phonetic Baraha
  const candPhonetic = tokens
    .map((token) => {
      if (/^\s+$/.test(token)) return token;
      if (/^[\u0C80-\u0CFF]+$/.test(token)) return normalizeKannadaUnicode(token);

      const cleanWord = token.toLowerCase().replace(/[^a-z]/g, '');
      if (!cleanWord) return token;

      // Check verified glossary
      const glossaryMatch = KANNADA_EDUCATIONAL_GLOSSARY.find(
        (g) =>
          g.standardRoman.toLowerCase() === cleanWord ||
          g.romanVariants.some((v) => v.toLowerCase() === cleanWord)
      );
      if (glossaryMatch) {
        return token.toLowerCase().replace(cleanWord, glossaryMatch.canonicalKn);
      }

      if (HIGH_FREQUENCY_EDUCATIONAL_TERMS[cleanWord]) {
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

  // Candidate 2: Direct Baraha transliteration
  try {
    const candBaraha = Sanscript.t(text, 'baraha', 'kannada');
    candidateSets.push(candBaraha);
  } catch {
    // Ignore error
  }

  // Candidate 3: Direct ITRANS Dravidian transliteration
  try {
    const candItrans = Sanscript.t(text, 'itrans_dravidian', 'kannada');
    candidateSets.push(candItrans);
  } catch {
    // Ignore error
  }

  // Normalize, deduplicate and filter
  const candidates: string[] = [];
  for (const raw of candidateSets) {
    const normalized = normalizeKannadaUnicode(raw).trim();
    if (normalized && !candidates.includes(normalized)) {
      candidates.push(normalized);
    }
  }

  // If query contains Kannada script alongside Latin (mixed query), ensure pure NFC Kannada is in candidates
  if (hasKannada) {
    const pureNorm = normalizeKannadaUnicode(text).trim();
    if (pureNorm && !candidates.includes(pureNorm)) {
      candidates.unshift(pureNorm);
    }
  }

  return candidates;
}

/**
 * Helper to check if a resource matches a search query given the search mode.
 *
 * @param resourceFields - Array of textual fields to search (title, topic, summary, tags, content)
 * @param query - The user search string
 * @param mode - 'kn' | 'en' | 'kannada' | 'english'
 */
/**
 * Calculates a search relevance score for a resource given a query and mode.
 * Scores:
 * - 100: Exact direct match in primary title
 * - 85: Exact direct match in topic, tags, or summary
 * - 80: Direct transliteration match in primary title
 * - 65: Morphological / singular-plural variant match in title or topic
 * - 45: Partial word / substring match in summary or content
 * - 0: No match
 */
export function scoreResourceMatch(
  resourceFields: (string | undefined)[],
  query: string,
  mode: 'kn' | 'en' | 'kannada' | 'english' = 'kannada'
): number {
  if (!query || !query.trim()) return 1;

  const rawQuery = query.trim().toLowerCase();
  const isEnglishMode = mode === 'en' || mode === 'english';

  const titleField = resourceFields[0] ? normalizeKannadaUnicode(resourceFields[0].toLowerCase()) : '';
  const topicField = resourceFields[1] ? normalizeKannadaUnicode(resourceFields[1].toLowerCase()) : '';

  const searchStrings = resourceFields
    .filter((f): f is string => typeof f === 'string' && f.length > 0)
    .map((f) => normalizeKannadaUnicode(f.toLowerCase()));

  // 1. Direct query match (case-insensitive & NFC normalized)
  const nfcQuery = normalizeKannadaUnicode(rawQuery);
  if (titleField.includes(nfcQuery) || titleField.includes(rawQuery)) {
    return 100;
  }
  if (searchStrings.some((field) => field.includes(nfcQuery) || field.includes(rawQuery))) {
    return 85;
  }

  // 2. Transliteration matching (English mode)
  const translitCandidates = isEnglishMode ? transliterateToKannada(query) : [];
  if (isEnglishMode && translitCandidates.length > 0) {
    for (const cand of translitCandidates) {
      const lowerCand = cand.toLowerCase();
      if (titleField.includes(lowerCand)) {
        return 80;
      }
      if (topicField.includes(lowerCand)) {
        return 75;
      }
      if (searchStrings.some((field) => field.includes(lowerCand))) {
        return 70;
      }
    }
  }

  // 3. Website-wide Singular/Plural Grammatical Matching
  const { kannadaVariants, romanVariants } = expandQueryGrammaticalVariants(
    query,
    translitCandidates
  );

  // Check Kannada grammatical variants (e.g. 'ನಿಯಮ' when query is 'ನಿಯಮಗಳು' or vice versa)
  for (const variant of kannadaVariants) {
    const lowerVar = variant.toLowerCase();
    if (lowerVar === nfcQuery) continue; // Already checked in step 1

    if (titleField.includes(lowerVar) || topicField.includes(lowerVar)) {
      return 65;
    }
    if (searchStrings.some((field) => field.includes(lowerVar))) {
      return 55;
    }
  }

  // Check Roman grammatical variants (e.g. 'niyama' when query is 'niyamagalu')
  if (isEnglishMode) {
    for (const rVar of romanVariants) {
      if (rVar === rawQuery) continue;
      // Transliterate Roman variant and test
      const varCandidates = transliterateToKannada(rVar);
      for (const vc of varCandidates) {
        const lowerVc = vc.toLowerCase();
        if (titleField.includes(lowerVc) || topicField.includes(lowerVc)) {
          return 65;
        }
        if (searchStrings.some((field) => field.includes(lowerVc))) {
          return 50;
        }
      }
    }
  }

  // 4. Multi-word phrase token matching (e.g. 'sandhi niyamagalu' -> at least significant word matches)
  if (translitCandidates.length > 0) {
    for (const cand of translitCandidates) {
      const words = cand.toLowerCase().split(/\s+/).filter((w) => w.length >= 2);
      if (words.length > 1) {
        const anyWordMatches = words.some((word) => {
          const stem = word.length > 4 ? word.slice(0, -1) : word;
          return searchStrings.some((field) => field.includes(word) || field.includes(stem));
        });
        if (anyWordMatches) {
          return 45;
        }
      }
    }
  }

  return 0;
}

/**
 * Helper to check if a resource matches a search query given the search mode.
 * Preserves boolean return type for existing caller contracts while utilizing
 * relevance scoring and website-wide singular/plural normalization.
 */
export function matchResourceQuery(
  resourceFields: (string | undefined)[],
  query: string,
  mode: 'kn' | 'en' | 'kannada' | 'english' = 'kannada'
): boolean {
  return scoreResourceMatch(resourceFields, query, mode) > 0;
}
