import { KANNADA_EDUCATIONAL_GLOSSARY } from '../data/kannadaGlossary';
import type { GlossaryEntry } from '../data/kannadaGlossary';
import { KANNADA_RESOURCES } from '../data/resources';
import type { ResourceItem } from '../data/resources';
import { normalizeKannadaUnicode, transliterateToKannada } from './kannadaTransliteration';

export type SuggestionType = 'topic' | 'resource' | 'category' | 'query';

export interface SearchSuggestion {
  id: string;
  title: string;              // Kannada or primary display title
  titleEn?: string;           // Optional Romanized label
  type: SuggestionType;
  subtitle?: string;          // Category, class, or chapter information
  url: string;                // Navigation target
  matchedTerm: string;        // Exact term or prefix that triggered the match
  badge?: string;             // Tag pill (e.g., 'ವ್ಯಾಕರಣ', '10ನೇ ತರಗತಿ', 'ಗದ್ಯ')
  score: number;              // Relevance score for sorting (higher = better)
}

export interface SuggestionOptions {
  classGrade?: string;        // Optional class filter context ('10', '9', etc.)
  category?: string;          // Optional category filter ('notes', 'grammar', etc.)
  limit?: number;             // Maximum suggestions to return (default: 8)
}

/**
 * Common morphological endings in Kannada to handle singular/plural expansions in search suggestions
 */
function getMorphologicalVariants(termKn: string): string[] {
  const norm = normalizeKannadaUnicode(termKn);
  const variants = [norm];

  // Plural to singular: strip -ಗಳು (U+0C97 U+0CB3 U+0CC1)
  if (norm.endsWith('ಗಳು') && norm.length > 3) {
    const singular = norm.slice(0, -3);
    if (!variants.includes(singular)) variants.push(singular);
  }

  // Singular to plural: append -ಗಳು
  if (!norm.endsWith('ಗಳು') && norm.length >= 2) {
    const plural = norm + 'ಗಳು';
    if (!variants.includes(plural)) variants.push(plural);
  }

  return variants;
}

/**
 * Common Romanized plural endings (-galu, -gala) to singular stems
 */
function getRomanVariants(roman: string): string[] {
  const clean = roman.toLowerCase().trim();
  const variants = [clean];

  if (clean.endsWith('galu') && clean.length > 4) {
    variants.push(clean.slice(0, -4));
  } else if (clean.endsWith('gala') && clean.length > 4) {
    variants.push(clean.slice(0, -4));
  } else if (!clean.endsWith('galu') && clean.length >= 2) {
    variants.push(clean + 'galu');
  }

  return variants;
}

/**
 * Fast prefix and progressive matcher for educational search suggestions.
 * Supports:
 * - Keystroke-by-keystroke progressive typing ('s' -> 'sa' -> 'sam' -> 'sama')
 * - Full Kannada script queries
 * - Romanized transliteration
 * - Singular/plural morphological variants
 * - Class-aware ranking
 */
export function getSearchSuggestions(
  query: string,
  mode: 'kn' | 'en' | 'kannada' | 'english' = 'kannada',
  options: SuggestionOptions = {},
  customResources?: ResourceItem[]
): SearchSuggestion[] {
  if (!query || !query.trim()) return [];

  const rawQuery = query.trim();
  const isEnglish = mode === 'en' || mode === 'english';
  const cleanQuery = rawQuery.toLowerCase();
  const limit = options.limit || 8;
  const activeClass = options.classGrade;

  const suggestions: SearchSuggestion[] = [];
  const seenIds = new Set<string>();

  // Helper to add suggestion uniquely
  function addSuggestion(item: SearchSuggestion) {
    if (seenIds.has(item.id)) return;
    seenIds.add(item.id);
    suggestions.push(item);
  }

  // Generate transliterated Kannada candidate prefixes if English mode
  const translitCandidates = isEnglish ? transliterateToKannada(rawQuery) : [normalizeKannadaUnicode(rawQuery)];
  const nfcRaw = normalizeKannadaUnicode(rawQuery);

  // 1. Search Verified Terminology Glossary (Topics / Grammar concepts)
  for (const entry of KANNADA_EDUCATIONAL_GLOSSARY) {
    let matchScore = 0;
    let matchedTerm = '';

    // A. Check exact Roman matches or prefixes
    const romanTerms = [entry.standardRoman.toLowerCase(), ...entry.romanVariants.map((v) => v.toLowerCase())];
    for (const r of romanTerms) {
      if (r === cleanQuery) {
        matchScore = Math.max(matchScore, 100);
        matchedTerm = entry.standardRoman;
        break;
      } else if (r.startsWith(cleanQuery)) {
        // Strong prefix match (e.g. 's' or 'sam' in 'samasa')
        const prefixScore = 80 - Math.min(20, r.length - cleanQuery.length);
        if (prefixScore > matchScore) {
          matchScore = prefixScore;
          matchedTerm = entry.standardRoman;
        }
      }
    }

    // B. Check Kannada script exact matches or prefixes
    const knForms = [entry.canonicalKn, ...(entry.alternateFormsKn || [])];
    for (const kn of knForms) {
      const normKn = normalizeKannadaUnicode(kn);
      // Exact Kannada match
      if (normKn === nfcRaw) {
        matchScore = Math.max(matchScore, 100);
        matchedTerm = normKn;
      } else if (normKn.startsWith(nfcRaw)) {
        matchScore = Math.max(matchScore, 85);
        matchedTerm = normKn;
      } else if (normKn.includes(nfcRaw) && nfcRaw.length >= 2) {
        matchScore = Math.max(matchScore, 65);
        matchedTerm = normKn;
      }

      // If in English mode, check if any transliterated candidate is a prefix of Kannada term
      if (isEnglish) {
        for (const cand of translitCandidates) {
          if (normKn === cand) {
            matchScore = Math.max(matchScore, 95);
            matchedTerm = normKn;
          } else if (normKn.startsWith(cand) && cand.length >= 1) {
            matchScore = Math.max(matchScore, 75);
            matchedTerm = normKn;
          }
        }
      }
    }

    // C. Check singular/plural variants
    if (matchScore === 0) {
      const morphKn = getMorphologicalVariants(entry.canonicalKn);
      for (const m of morphKn) {
        if (m.startsWith(nfcRaw) || (isEnglish && translitCandidates.some((c) => m.startsWith(c)))) {
          matchScore = 60;
          matchedTerm = m;
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
        url: `/dashboard?q=${encodeURIComponent(entry.canonicalKn)}${activeClass ? `&class=${activeClass}` : ''}`,
        matchedTerm: matchedTerm || entry.canonicalKn,
        badge: entry.category,
        score: matchScore + 10, // Glossary terms get slight priority boost for topic discovery
      });
    }
  }

  // 2. Search Educational Resources (Specific notes, question papers, lessons)
  const resourceCatalog = customResources || KANNADA_RESOURCES;

  for (const res of resourceCatalog) {
    // Respect active class filter if provided
    if (activeClass && res.classGrade !== 'all' && res.classGrade !== activeClass) {
      continue;
    }

    let matchScore = 0;
    let matchedField = '';

    const titleNorm = normalizeKannadaUnicode(res.title.toLowerCase());
    const topicNorm = normalizeKannadaUnicode(res.topic.toLowerCase());
    const tagsNorm = (res.tags || []).map((t) => normalizeKannadaUnicode(t.toLowerCase()));

    // A. Check direct query in Kannada
    if (titleNorm.startsWith(nfcRaw.toLowerCase())) {
      matchScore = 90;
      matchedField = res.title;
    } else if (topicNorm.startsWith(nfcRaw.toLowerCase())) {
      matchScore = 85;
      matchedField = res.topic;
    } else if (titleNorm.includes(nfcRaw.toLowerCase())) {
      matchScore = 70;
      matchedField = res.title;
    } else if (tagsNorm.some((t) => t.includes(nfcRaw.toLowerCase()))) {
      matchScore = 65;
      matchedField = res.tags.join(', ');
    }

    // B. Check Romanized input in English mode
    if (isEnglish) {
      // Check transliterated candidates against resource title & topic
      for (const cand of translitCandidates) {
        const candLower = cand.toLowerCase();
        if (titleNorm.includes(candLower)) {
          matchScore = Math.max(matchScore, 80);
          matchedField = res.title;
        } else if (topicNorm.includes(candLower)) {
          matchScore = Math.max(matchScore, 75);
          matchedField = res.topic;
        } else if (tagsNorm.some((t) => t.includes(candLower))) {
          matchScore = Math.max(matchScore, 65);
          matchedField = 'ಟ್ಯಾಗ್‌ಗಳು';
        }
      }

      // Check common Roman title keywords (e.g. 'yuddha', 'shabari', 'maths', 'sslc')
      const romanQueryVariants = getRomanVariants(cleanQuery);
      for (const v of romanQueryVariants) {
        if (res.slug.toLowerCase().includes(v) || (res.id && res.id.toLowerCase().includes(v))) {
          matchScore = Math.max(matchScore, 60);
          matchedField = res.slug;
        }
      }
    }

    // Boost score if resource matches active class
    if (activeClass && res.classGrade === activeClass) {
      matchScore += 5;
    }

    if (matchScore > 0) {
      addSuggestion({
        id: `res-${res.id || res.slug}`,
        title: res.title,
        type: 'resource',
        subtitle: `${res.classGrade !== 'all' ? `${res.classGrade}ನೇ ತರಗತಿ • ` : ''}${res.category === 'notes' ? 'ನೋಟ್ಸ್' : res.category === 'grammar' ? 'ವ್ಯಾಕರಣ' : 'ಅಧ್ಯಯನ ಸಾಮಗ್ರಿ'}`,
        url: `/dashboard/resource/${res.slug || res.id}`,
        matchedTerm: matchedField,
        badge: res.classGrade !== 'all' ? `${res.classGrade}ನೇ ತರಗತಿ` : 'ಎಲ್ಲಾ ತರಗತಿ',
        score: matchScore,
      });
    }
  }

  // 3. Add explicit Transliteration / Search Action if query is non-empty
  if (isEnglish && translitCandidates.length > 0 && translitCandidates[0] !== rawQuery) {
    const primaryTranslit = translitCandidates[0];
    addSuggestion({
      id: `query-translit-${primaryTranslit}`,
      title: `"${primaryTranslit}" ಗಾಗಿ ಹುಡುಕಿ`,
      titleEn: `Search for "${rawQuery}"`,
      type: 'query',
      subtitle: `English ಅಕ್ಷರಗಳಿಂದ "${primaryTranslit}" ಗೆ ಲಿಪ್ಯಂತರ ಹುಡುಕಾಟ`,
      url: `/dashboard?q=${encodeURIComponent(rawQuery)}&mode=en${activeClass ? `&class=${activeClass}` : ''}`,
      matchedTerm: primaryTranslit,
      badge: 'ಲಿಪ್ಯಂತರ',
      score: 50,
    });
  }

  // Sort suggestions by relevance score descending
  suggestions.sort((a, b) => b.score - a.score);

  return suggestions.slice(0, limit);
}
