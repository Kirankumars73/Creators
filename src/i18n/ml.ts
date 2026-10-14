// Every Malayalam string on the site. `confirmed` means a native speaker settled it (Kiran,
// 2026-10-14). `ml: null` renders the English; confirmed with null means English by choice.
// After editing a string, run `pnpm render:ml` (a test fails until you do).

export type MlEntry = { ml: string | null; en: string; confirmed: boolean };

const entries = {
  wordmark: { ml: 'കൂട്ടം', en: 'KOOTAM', confirmed: true },
  name: { ml: 'ക്രിയേറ്റേഴ്‌സ് കൂട്ടം', en: 'Creators Kootam', confirmed: true },
  youreIn: { ml: 'നിങ്ങൾ കൂട്ടത്തിലാണ്.', en: "You're in the kootam.", confirmed: true },
  codeEyebrow: { ml: null, en: 'THE CODE', confirmed: true },
  codeFooter: { ml: null, en: 'Kerala is small. Credit loudly.', confirmed: true },
  footerSignoff: { ml: 'നമോവാധം', en: 'See you in the kootam.', confirmed: true },
} satisfies Record<string, MlEntry>;

export type MlKey = keyof typeof entries;

export const ML: Record<MlKey, MlEntry> = entries;

export function t(key: MlKey): { ml: string | null; en: string } {
  const { ml, en } = ML[key];
  return { ml, en };
}

export function unconfirmedMlKeys(): MlKey[] {
  return (Object.keys(ML) as MlKey[]).filter((k) => !ML[k].confirmed);
}
