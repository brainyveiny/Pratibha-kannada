/**
 * Pratibha Kannada — Authoritative Definition of Supported Academic Levels
 *
 * Supported classes:
 * - 8th Class (8ನೇ ತರಗತಿ)
 * - 9th Class (9ನೇ ತರಗತಿ)
 * - 10th Class / SSLC (10ನೇ ತರಗತಿ)
 * - 1st PUC (1ನೇ ಪಿಯುಸಿ)
 * - 2nd PUC (2ನೇ ಪಿಯುಸಿ)
 *
 * Classes 6 and 7 are deliberately excluded and unsupported across the platform.
 */

export interface SupportedClass {
  slug: '10' | '9' | '8' | 'puc-1' | 'puc-2';
  labelKn: string;
  labelEn: string;
  subKn: string;
  subEn: string;
  href: string;
}

export const SUPPORTED_CLASSES: SupportedClass[] = [
  {
    slug: '10',
    labelKn: '10ನೇ ತರಗತಿ',
    labelEn: 'Class 10 (SSLC)',
    subKn: 'ಎಸ್.ಎಸ್.ಎಲ್.ಸಿ ಬೋರ್ಡ್',
    subEn: 'SSLC Board',
    href: '/dashboard?class=10',
  },
  {
    slug: '9',
    labelKn: '9ನೇ ತರಗತಿ',
    labelEn: 'Class 9',
    subKn: 'ಪ್ರೌಢಶಾಲೆ',
    subEn: 'High School',
    href: '/dashboard?class=9',
  },
  {
    slug: '8',
    labelKn: '8ನೇ ತರಗತಿ',
    labelEn: 'Class 8',
    subKn: 'ಪ್ರೌಢಶಾಲೆ',
    subEn: 'High School',
    href: '/dashboard?class=8',
  },
  {
    slug: 'puc-1',
    labelKn: '1ನೇ ಪಿಯುಸಿ',
    labelEn: '1st PUC',
    subKn: 'ಪದವಿ ಪೂರ್ವ',
    subEn: '1st PUC',
    href: '/dashboard?class=puc-1',
  },
  {
    slug: 'puc-2',
    labelKn: '2ನೇ ಪಿಯುಸಿ',
    labelEn: '2nd PUC',
    subKn: 'ಪದವಿ ಪೂರ್ವ',
    subEn: '2nd PUC',
    href: '/dashboard?class=puc-2',
  },
];

export const VALID_GRADE_SLUGS = ['10', '9', '8', 'puc-1', 'puc-2', 'puc'] as const;
export type ValidGradeSlug = (typeof VALID_GRADE_SLUGS)[number];

export function isSupportedGrade(grade: string): boolean {
  if (!grade) return false;
  const normalized = grade.trim().toLowerCase();
  return (VALID_GRADE_SLUGS as readonly string[]).includes(normalized);
}

export function formatGradeLabelKn(grade: string): string {
  switch (grade) {
    case '10':
      return '10ನೇ ತರಗತಿ';
    case '9':
      return '9ನೇ ತರಗತಿ';
    case '8':
      return '8ನೇ ತರಗತಿ';
    case 'puc-1':
      return '1ನೇ ಪಿಯುಸಿ';
    case 'puc-2':
      return '2ನೇ ಪಿಯುಸಿ';
    case 'puc':
      return 'ಪಿಯುಸಿ (PUC)';
    case 'all':
      return 'ಎಲ್ಲಾ ಬೆಂಬಲಿತ ತರಗತಿಗಳು (All Supported Classes)';
    default:
      return `${grade}ನೇ ತರಗತಿ`;
  }
}
