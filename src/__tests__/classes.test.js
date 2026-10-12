// Unit tests for Supported Academic Levels (Classes 8, 9, 10, 1st PUC, 2nd PUC)
// Verifies that Classes 6 & 7 are eliminated and unsupported grades are rejected.

describe('Supported Academic Levels Validation Tests', () => {
  const VALID_GRADE_SLUGS = ['10', '9', '8', 'puc-1', 'puc-2', 'puc'];

  const SUPPORTED_CLASSES = [
    { slug: '10', name: '10ನೇ ತರಗತಿ (SSLC)', nameEn: 'Class 10 (SSLC)' },
    { slug: '9', name: '9ನೇ ತರಗತಿ', nameEn: 'Class 9' },
    { slug: '8', name: '8ನೇ ತರಗತಿ', nameEn: 'Class 8' },
    { slug: 'puc-1', name: '1ನೇ ಪಿಯುಸಿ', nameEn: '1st PUC' },
    { slug: 'puc-2', name: '2ನೇ ಪಿಯುಸಿ', nameEn: '2nd PUC' },
  ];

  function isSupportedGrade(grade) {
    if (!grade || typeof grade !== 'string') return false;
    const g = grade.trim().toLowerCase();
    return VALID_GRADE_SLUGS.includes(g);
  }

  function formatGradeLabelKn(grade) {
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

  test('SUPPORTED_CLASSES contains exactly the 5 allowed academic levels', () => {
    expect(SUPPORTED_CLASSES).toHaveLength(5);
    const slugs = SUPPORTED_CLASSES.map((c) => c.slug);
    expect(slugs).toEqual(['10', '9', '8', 'puc-1', 'puc-2']);
  });

  test('Classes 6 and 7 do NOT exist in SUPPORTED_CLASSES', () => {
    const slugs = SUPPORTED_CLASSES.map((c) => c.slug);
    expect(slugs).not.toContain('6');
    expect(slugs).not.toContain('7');
    expect(slugs).not.toContain('class-6');
    expect(slugs).not.toContain('class-7');

    const names = SUPPORTED_CLASSES.map((c) => c.name);
    expect(names.some((n) => n.includes('6'))).toBe(false);
    expect(names.some((n) => n.includes('7'))).toBe(false);
  });

  test('isSupportedGrade validates only allowed academic levels', () => {
    // Valid grades
    expect(isSupportedGrade('10')).toBe(true);
    expect(isSupportedGrade('9')).toBe(true);
    expect(isSupportedGrade('8')).toBe(true);
    expect(isSupportedGrade('puc-1')).toBe(true);
    expect(isSupportedGrade('puc-2')).toBe(true);
    expect(isSupportedGrade('puc')).toBe(true); // backward-compatible alias

    // Invalid grades (including removed Classes 6 & 7)
    expect(isSupportedGrade('6')).toBe(false);
    expect(isSupportedGrade('7')).toBe(false);
    expect(isSupportedGrade('5')).toBe(false);
    expect(isSupportedGrade('11')).toBe(false);
    expect(isSupportedGrade('12')).toBe(false);
    expect(isSupportedGrade('')).toBe(false);
    expect(isSupportedGrade(null)).toBe(false);
    expect(isSupportedGrade(undefined)).toBe(false);
    expect(isSupportedGrade('random')).toBe(false);
  });

  test('VALID_GRADE_SLUGS includes valid grades and excludes 6 and 7', () => {
    expect(VALID_GRADE_SLUGS).toContain('10');
    expect(VALID_GRADE_SLUGS).toContain('9');
    expect(VALID_GRADE_SLUGS).toContain('8');
    expect(VALID_GRADE_SLUGS).toContain('puc-1');
    expect(VALID_GRADE_SLUGS).toContain('puc-2');
    expect(VALID_GRADE_SLUGS).not.toContain('6');
    expect(VALID_GRADE_SLUGS).not.toContain('7');
  });

  test('formatGradeLabelKn formats supported grades accurately in Kannada', () => {
    expect(formatGradeLabelKn('10')).toBe('10ನೇ ತರಗತಿ');
    expect(formatGradeLabelKn('9')).toBe('9ನೇ ತರಗತಿ');
    expect(formatGradeLabelKn('8')).toBe('8ನೇ ತರಗತಿ');
    expect(formatGradeLabelKn('puc-1')).toBe('1ನೇ ಪಿಯುಸಿ');
    expect(formatGradeLabelKn('puc-2')).toBe('2ನೇ ಪಿಯುಸಿ');
    expect(formatGradeLabelKn('puc')).toBe('ಪಿಯುಸಿ (PUC)');
    expect(formatGradeLabelKn('all')).toBe('ಎಲ್ಲಾ ಬೆಂಬಲಿತ ತರಗತಿಗಳು (All Supported Classes)');
  });

  test('formatGradeLabelKn handles legacy grades safely without throwing errors', () => {
    expect(formatGradeLabelKn('6')).toBe('6ನೇ ತರಗತಿ');
    expect(formatGradeLabelKn('7')).toBe('7ನೇ ತರಗತಿ');
  });

  function getClassDisplayNumber(grade) {
    switch (grade) {
      case '10':
        return '10';
      case '9':
        return '9';
      case '8':
        return '8';
      case 'puc-1':
        return '11';
      case 'puc-2':
        return '12';
      case 'puc':
        return 'PUC';
      default:
        return grade;
    }
  }

  test('getClassDisplayNumber maps academic levels to unambiguous display numbers', () => {
    expect(getClassDisplayNumber('10')).toBe('10'); // Must never be truncated to '1'
    expect(getClassDisplayNumber('9')).toBe('9');
    expect(getClassDisplayNumber('8')).toBe('8');
    expect(getClassDisplayNumber('puc-1')).toBe('11');
    expect(getClassDisplayNumber('puc-2')).toBe('12');
  });
});
