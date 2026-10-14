import { describe, expect, test } from 'vitest';
import { ML, t, unconfirmedMlKeys } from '@/i18n/ml';

describe('malayalam strings', () => {
  test('every entry carries a non-empty English fallback', () => {
    for (const entry of Object.values(ML)) expect(entry.en.trim().length).toBeGreaterThan(0);
  });

  test('every line is settled by a native speaker (Kiran, 2026-10-14)', () => {
    expect(unconfirmedMlKeys()).toEqual([]);
  });

  test('the footer sign-off is exactly as Kiran wrote it — do not "correct" it', () => {
    expect(ML.footerSignoff.ml).toBe('നമോവാധം');
  });

  test('t() returns the Malayalam and English pair', () => {
    expect(t('youreIn')).toEqual({ ml: 'നിങ്ങൾ കൂട്ടത്തിലാണ്.', en: "You're in the kootam." });
  });

  test('the working name keeps its zero-width non-joiner', () => {
    expect(ML.name.ml).toBe('ക്രിയേറ്റേഴ്‌സ് കൂട്ടം');
  });

  test('lines kept in English by choice have no Malayalam', () => {
    expect(t('codeFooter').ml).toBeNull();
  });
});
