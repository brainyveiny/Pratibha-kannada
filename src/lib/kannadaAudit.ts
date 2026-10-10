import { KANNADA_EDUCATIONAL_GLOSSARY, type GlossaryEntry } from '../data/kannadaGlossary';
import { normalizeKannadaUnicode, transliterateToKannada } from './kannadaTransliteration';
import type { ResourceItem } from '../data/resources';

export type ScriptComposition = 'PURE_KANNADA' | 'MIXED_SCRIPT' | 'PURE_LATIN' | 'NUMERIC_OR_EMPTY';

export interface AuditFinding {
  sourceText: string;
  suggestedCorrection?: string;
  reason: string;
  severity: 'ERROR' | 'WARNING' | 'INFO';
  confidence: number; // 0.0 - 1.0
  reference: string;
  termId?: string;
  category?: string;
}

export interface ContentAuditReport {
  resourceId: string;
  field: string;
  originalText: string;
  scriptComposition: ScriptComposition;
  findings: AuditFinding[];
  isClean: boolean;
}

/**
 * Detect script composition of text string
 */
export function detectScriptComposition(text: string): ScriptComposition {
  if (!text || !text.trim()) return 'NUMERIC_OR_EMPTY';
  const hasKannada = /[\u0C80-\u0CFF]/.test(text);
  const hasLatin = /[a-zA-Z]/.test(text);

  if (hasKannada && hasLatin) return 'MIXED_SCRIPT';
  if (hasKannada && !hasLatin) return 'PURE_KANNADA';
  if (!hasKannada && hasLatin) return 'PURE_LATIN';
  return 'NUMERIC_OR_EMPTY';
}

/**
 * Common orthographic misspelling pattern rules in Kannada educational writing
 */
const KNOWN_ORTHOGRAPHIC_RULES: Array<{
  words: string[];
  replacement: string;
  reason: string;
  reference: string;
}> = [
  {
    // Sandhi: ಸನ್ಧಿ / ಸಂದಿ -> ಸಂಧಿ (dental nasal ligature before aspirated dha)
    words: ['ಸನ್ಧಿ', 'ಸಂದಿ'],
    replacement: 'ಸಂಧಿ',
    reason: 'ಅನುಸ್ವಾರ ಮತ್ತು ಮಹಾಪ್ರಾಣ ವ್ಯತ್ಯಾಸ: "ಸಂಧಿ" ಪ್ರಮಾಣಿತ ರೂಪ.',
    reference: 'DSERT 10th Standard Kannada Vyakarna, Chapter 3',
  },
  {
    // Krudanta: ಕ್ರುದಂತ / ಕೃದಂಥ -> ಕೃದಂತಗಳು / ಕೃದಂತ (Vocalic R ಋ-ಕಾರ vs R-vattu ರ-ಒತ್ತು)
    words: ['ಕ್ರುದಂತ', 'ಕ್ರುದಂತಗಳು', 'ಕೃದಂಥ', 'ಕೃದನ್ತ', 'ಕೃದನ್ತಗಳು'],
    replacement: 'ಕೃದಂತಗಳು',
    reason: 'ಸ್ವರ ಋ-ಕಾರ (ಕೃ) ಬದಲು ರ-ಒತ್ತು (ಕ್ರು) ದೋಷ: "ಕೃದಂತಗಳು" ಪ್ರಮಾಣಿತ ರೂಪ.',
    reference: 'DSERT 10th Standard Kannada Vyakarna, Chapter 6',
  },
  {
    // Vyakarana: ವ್ಯಾಕರನ -> ವ್ಯಾಕರಣ (retroflex Na ಣ vs dental Na ನ)
    words: ['ವ್ಯಾಕರನ', 'ವ್ಯಕರಣ', 'ವ್ಯಾಕರೆಣ'],
    replacement: 'ವ್ಯಾಕರಣ',
    reason: 'ದಂತ ನ ಬದಲು ಮೂರ್ಧನ್ಯ ಣ: "ವ್ಯಾಕರಣ" ಪ್ರಮಾಣಿತ ರೂಪ.',
    reference: 'DSERT Kannada Vyakarna Pravesha',
  },
  {
    // Samasa: ಸಮಸ / ಸಮಾಶ -> ಸಮಾಸ (dental Sa ಸ vs palatal Sha ಶ)
    words: ['ಸಮಸ', 'ಸಮಾಶ'],
    replacement: 'ಸಮಾಸ',
    reason: 'ದೀರ್ಘ ಸ್ವರ ಮತ್ತು ಶ/ಸ ವ್ಯತ್ಯಾಸ: "ಸಮಾಸ" ಪ್ರಮಾಣಿತ ರೂಪ.',
    reference: 'DSERT 10th Standard Kannada Vyakarna, Chapter 5',
  },
  {
    // Vibhakti: ವಿಭಕ್ಥಿ / ವಿಬಕ್ತಿ -> ವಿಭಕ್ತಿ
    words: ['ವಿಭಕ್ಥಿ', 'ವಿಬಕ್ತಿ', 'ವಿಭಖ್ತಿ'],
    replacement: 'ವಿಭಕ್ತಿ',
    reason: 'ಅಲ್ಪಪ್ರಾಣ-ಮಹಾಪ್ರಾಣ ದೋಷ: "ವಿಭಕ್ತಿ" ಪ್ರಮಾಣಿತ ರೂಪ.',
    reference: 'DSERT 10th Standard Kannada Vyakarna, Chapter 4',
  },
  {
    // Alankara: ಅಲಂಖಾರ -> ಅಲಂಕಾರ (aspirated kha vs unaspirated ka)
    words: ['ಅಲಂಖಾರ', 'ಅಲಂಖಾರಗಳು', 'ಅಲಂಕಾರ್'],
    replacement: 'ಅಲಂಕಾರ',
    reason: 'ಅಲ್ಪಪ್ರಾಣ ಕ ಬದಲು ಮಹಾಪ್ರಾಣ ಖ: "ಅಲಂಕಾರ" ಪ್ರಮಾಣಿತ ರೂಪ.',
    reference: 'DSERT 10th Standard Kannada Sahitya, Chapter 9',
  },
  {
    // Chandassu: ಚಂದಸ್ಸು / ಛಂದಸು -> ಛಂದಸ್ಸು
    words: ['ಚಂದಸ್ಸು', 'ಛಂದಸು', 'ಚಂದಸು'],
    replacement: 'ಛಂದಸ್ಸು',
    reason: 'ಮಹಾಪ್ರಾಣ ಛ ಮತ್ತು ದ್ವಿತ್ವ ಸ: "ಛಂದಸ್ಸು" ಪ್ರಮಾಣಿತ ರೂಪ.',
    reference: 'DSERT 10th Standard Kannada, ಛಂದಸ್ಸು ಪರಿಚಯ',
  },
  {
    // Ganitha: ಗನಿಥ / ಗನಿತ -> ಗಣಿತ
    words: ['ಗನಿಥ', 'ಗನಿತ', 'ಘಣಿತ'],
    replacement: 'ಗಣಿತ',
    reason: 'ಮೂರ್ಧನ್ಯ ಣ ಮತ್ತು ಅಲ್ಪಪ್ರಾಣ ತ: "ಗಣಿತ" ಪ್ರಮಾಣಿತ ರೂಪ.',
    reference: 'Karnataka Secondary School Subject Nomenclature',
  },
];

/**
 * Inspect a piece of Kannada text and produce structured audit findings
 * WITHOUT altering the source text.
 */
export function auditKannadaText(text: string, fieldName = 'text'): AuditFinding[] {
  if (!text || !text.trim()) return [];

  const findings: AuditFinding[] = [];
  const normalized = normalizeKannadaUnicode(text);

  // 1. Check known orthographic misspelling rules
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

  // 2. Check against verified glossary entries
  for (const entry of KANNADA_EDUCATIONAL_GLOSSARY) {
    // Check known misspellings registered in the glossary
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
            termId: entry.id,
            category: entry.category,
          });
        }
      }
    }
  }

  // 3. Check for un-normalized Kannada Unicode issues (such as raw conjunct nasals that should be anusvara in modern orthography)
  const rawNasalConjuncts = text.match(/\u0CA8\u0CCD[\u0CA4\u0CA5\u0CA6\u0CA7]/g);
  if (rawNasalConjuncts) {
    findings.push({
      sourceText: rawNasalConjuncts.join(', '),
      suggestedCorrection: normalizeKannadaUnicode(rawNasalConjuncts[0]),
      reason: 'ಆಧುನಿಕ ಕನ್ನಡ ಶಿಷ್ಟ ವರ್ಣವಿನ್ಯಾಸದಲ್ಲಿ ಸಂಯುಕ್ತ ನ-ವರ್ಣದ ಬದಲು ಅನುಸ್ವಾರ (ಂ) ಶಿಫಾರಸು ಮಾಡಲಾಗಿದೆ.',
      severity: 'INFO',
      confidence: 0.85,
      reference: 'Kannada Sahitya Parishat Orthography Guide',
    });
  }

  return findings;
}

/**
 * Audit an individual educational resource across all its text fields
 */
export function auditResource(resource: ResourceItem): ContentAuditReport[] {
  const reports: ContentAuditReport[] = [];

  const fieldsToCheck: Array<{ name: string; value: string | undefined }> = [
    { name: 'title', value: resource.title },
    { name: 'topic', value: resource.topic },
    { name: 'summary', value: resource.summary },
    { name: 'authorOrSource', value: resource.authorOrSource },
    { name: 'tags', value: resource.tags ? resource.tags.join(' ') : '' },
  ];

  for (const { name, value } of fieldsToCheck) {
    if (!value) continue;
    const script = detectScriptComposition(value);
    const findings = auditKannadaText(value, name);

    reports.push({
      resourceId: resource.id,
      field: name,
      originalText: value,
      scriptComposition: script,
      findings,
      isClean: findings.length === 0,
    });
  }

  return reports;
}

/**
 * Audit an entire resource collection and generate an aggregated audit report
 */
export function auditCatalog(resources: ResourceItem[]): {
  totalResources: number;
  totalFieldsAudited: number;
  totalIssuesFound: number;
  reportsWithIssues: ContentAuditReport[];
  cleanCount: number;
} {
  let totalFields = 0;
  let totalIssues = 0;
  const reportsWithIssues: ContentAuditReport[] = [];
  let cleanResources = 0;

  for (const res of resources) {
    const fieldReports = auditResource(res);
    totalFields += fieldReports.length;

    const resourceIssues = fieldReports.flatMap((r) => r.findings);
    totalIssues += resourceIssues.length;

    const hasIssues = fieldReports.some((r) => !r.isClean);
    if (hasIssues) {
      reportsWithIssues.push(...fieldReports.filter((r) => !r.isClean));
    } else {
      cleanResources++;
    }
  }

  return {
    totalResources: resources.length,
    totalFieldsAudited: totalFields,
    totalIssuesFound: totalIssues,
    reportsWithIssues,
    cleanCount: cleanResources,
  };
}
