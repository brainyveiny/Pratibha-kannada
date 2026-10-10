/**
 * Pratibha Kannada — Kannada Morphological Normalization Engine
 *
 * Implements linguistically validated singular/plural (ವಚನ) matching for educational
 * search queries across Kannada script and Romanized inputs.
 *
 * References:
 * - DSERT Class 10 Siri Kannada Vyakarana: Chapter 4 (ನಾಮಪದ ಮತ್ತು ವಚನ ವ್ಯವಸ್ಥೆ)
 * - Kannada Sahitya Parishat Shikshana Nighantu (ಕನ್ನಡ ಶಿಕ್ಷಣ ನಿಘಂಟು)
 */

import { normalizeKannadaUnicode } from './kannadaTransliteration';

/**
 * Curated exception dictionary for irregular plurals and human nouns with -ರು (-ru)
 * to avoid incorrect regular suffix stripping or appending.
 */
const IRREGULAR_NOUN_PAIRS: Array<{ singular: string; plural: string; romanSingular: string; romanPlural: string }> = [
  { singular: 'ಮಗು', plural: 'ಮಕ್ಕಳು', romanSingular: 'magu', romanPlural: 'makkalu' },
  { singular: 'ಬೇಡ', plural: 'ಬೇಡರು', romanSingular: 'beda', romanPlural: 'bedaru' },
  { singular: 'ಶಿಕ್ಷಕ', plural: 'ಶಿಕ್ಷಕರು', romanSingular: 'shikshaka', romanPlural: 'shikshakaru' },
  { singular: 'ಲೇಖಕ', plural: 'ಲೇಖಕರು', romanSingular: 'lekhaka', romanPlural: 'lekhakaru' },
  { singular: 'ಸ್ನೇಹಿತ', plural: 'ಸ್ನೇಹಿತರು', romanSingular: 'snehita', romanPlural: 'snehitaru' },
  { singular: 'ವಿದ್ಯಾರ್ಥಿ', plural: 'ವಿದ್ಯಾರ್ಥಿಗಳು', romanSingular: 'vidyarthi', romanPlural: 'vidyarthigalu' },
  { singular: 'ಕವಿ', plural: 'ಕವಿಗಳು', romanSingular: 'kavi', romanPlural: 'kavigalu' },
  { singular: 'ಹೆಣ್ಣು', plural: 'ಹೆಣ್ಣುಮಕ್ಕಳು', romanSingular: 'hennu', romanPlural: 'hennumakkalu' },
  { singular: 'ಗಂಡು', plural: 'ಗಂಡುಮಕ್ಕಳು', romanSingular: 'gandu', romanPlural: 'gandumakkalu' },
];

/**
 * Derives grammatical singular and plural variants for a given Kannada script word.
 *
 * Rules:
 * 1. Checks curated irregular pairs first.
 * 2. If word ends in 'ಗಳು' (and stem length >= 2 with at least one Kannada consonant):
 *    derive singular stem by stripping 'ಗಳು'.
 * 3. If word does not end in 'ಗಳು' (and length >= 2 with Kannada consonants):
 *    derive regular plural by appending 'ಗಳು'.
 */
export function getKannadaNumberVariants(wordKn: string): string[] {
  if (!wordKn || !wordKn.trim()) return [];
  const norm = normalizeKannadaUnicode(wordKn.trim());
  const variants = [norm];

  // 1. Check irregular pairs
  for (const pair of IRREGULAR_NOUN_PAIRS) {
    if (norm === pair.singular) {
      if (!variants.includes(pair.plural)) variants.push(pair.plural);
      return variants;
    } else if (norm === pair.plural) {
      if (!variants.includes(pair.singular)) variants.push(pair.singular);
      return variants;
    }
  }

  // 2. Plural to singular: strip 'ಗಳು' (U+0C97 U+0CB3 U+0CC1)
  if (norm.endsWith('ಗಳು') && norm.length > 3) {
    const stem = norm.slice(0, -3);
    // Ensure stem contains at least one Kannada consonant and reasonable length
    if (stem.length >= 2 && /[\u0C95-\u0CB9]/.test(stem)) {
      if (!variants.includes(stem)) {
        variants.push(stem);
      }
    }
  }

  // 3. Singular to plural: regular append 'ಗಳು'
  if (!norm.endsWith('ಗಳು') && norm.length >= 2 && /[\u0C80-\u0CFF]/.test(norm)) {
    // Avoid appending if word ends in virama or is a single letter
    const plural = norm + 'ಗಳು';
    if (!variants.includes(plural)) {
      variants.push(plural);
    }
  }

  return variants;
}

/**
 * Derives grammatical singular and plural variants for Romanized Kannada input.
 *
 * Rules:
 * 1. Checks irregular pairs.
 * 2. Suffix -galu / -gala -> strip to singular stem.
 * 3. Suffix not -galu -> append -galu.
 */
export function getRomanNumberVariants(wordRoman: string): string[] {
  if (!wordRoman || !wordRoman.trim()) return [];
  const clean = wordRoman.trim().toLowerCase();
  const variants = [clean];

  // 1. Check irregular pairs
  for (const pair of IRREGULAR_NOUN_PAIRS) {
    if (clean === pair.romanSingular) {
      if (!variants.includes(pair.romanPlural)) variants.push(pair.romanPlural);
      return variants;
    } else if (clean === pair.romanPlural) {
      if (!variants.includes(pair.romanSingular)) variants.push(pair.romanSingular);
      return variants;
    }
  }

  // 2. Strip plural suffix -galu / -gala
  if ((clean.endsWith('galu') || clean.endsWith('gala')) && clean.length > 5) {
    const stem = clean.slice(0, -4);
    if (stem.length >= 2 && !variants.includes(stem)) {
      variants.push(stem);
    }
  }

  // 3. Append plural suffix -galu
  if (!clean.endsWith('galu') && !clean.endsWith('gala') && clean.length >= 2) {
    const plural = clean + 'galu';
    if (!variants.includes(plural)) {
      variants.push(plural);
    }
  }

  return variants;
}

/**
 * Expands a full query phrase (single word or multi-word) into all plausible
 * grammatical variations in both Kannada and Romanized scripts.
 */
export function expandQueryGrammaticalVariants(
  query: string,
  transliteratedCandidates: string[] = []
): { kannadaVariants: string[]; romanVariants: string[] } {
  if (!query || !query.trim()) {
    return { kannadaVariants: [], romanVariants: [] };
  }

  const raw = query.trim();
  const tokens = raw.split(/\s+/).filter(Boolean);

  const kannadaVariantsSet = new Set<string>();
  const romanVariantsSet = new Set<string>();

  // Include direct transliterated candidates
  for (const tc of transliteratedCandidates) {
    kannadaVariantsSet.add(normalizeKannadaUnicode(tc));
    for (const v of getKannadaNumberVariants(tc)) {
      kannadaVariantsSet.add(v);
    }
  }

  // If query is pure or partial Kannada, expand each token
  if (/[\u0C80-\u0CFF]/.test(raw)) {
    kannadaVariantsSet.add(normalizeKannadaUnicode(raw));
    for (const v of getKannadaNumberVariants(raw)) {
      kannadaVariantsSet.add(v);
    }
    for (const t of tokens) {
      for (const v of getKannadaNumberVariants(t)) {
        kannadaVariantsSet.add(v);
      }
    }
  }

  // Expand Roman tokens
  if (/[a-zA-Z]/.test(raw)) {
    romanVariantsSet.add(raw.toLowerCase());
    for (const v of getRomanNumberVariants(raw)) {
      romanVariantsSet.add(v);
    }
    for (const t of tokens) {
      for (const v of getRomanNumberVariants(t)) {
        romanVariantsSet.add(v);
      }
    }
  }

  return {
    kannadaVariants: Array.from(kannadaVariantsSet).filter(Boolean),
    romanVariants: Array.from(romanVariantsSet).filter(Boolean),
  };
}
