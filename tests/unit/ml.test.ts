import { describe, expect, test } from 'vitest';
import { ML, t, unconfirmedMlKeys } from '@/i18n/ml';

describe('malayalam strings', () => {
  test('every entry carries a non-empty English fallback', () => {
    for (const entry of Object.values(ML)) expect(entry.en.trim().length).toBeGreaterThan(0);
  });

  test('nothing ships as confirmed until Gowtham signs off', () => {
    expect(unconfirmedMlKeys()).toContain('wordmark');
    expect(unconfirmedMlKeys()).toHaveLength(Object.keys(ML).length);
  });

  test('t() returns the Malayalam and English pair', () => {
    expect(t('youreIn')).toEqual({ ml: 'നിങ്ങൾ കൂട്ടത്തിലാണ്.', en: "You're in the kootam." });
  });

  test('the working name keeps its zero-width non-joiner', () => {
    expect(ML.name.ml).toBe('ക്രിയേറ്റേഴ്‌സ് കൂട്ടം');
  });

  test('strings not yet supplied fall back to English only', () => {
    expect(t('codeFooter').ml).toBeNull();
  });
});
