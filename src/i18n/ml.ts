// [ASK GOUTHAM] Every Malayalam string on the site. None ships as final until a
// native speaker signs off: flip `confirmed` to true per entry once he has.
// `ml: null` means not supplied yet; surfaces render the English instead.

export type MlEntry = { ml: string | null; en: string; confirmed: boolean };

const entries = {
  wordmark: { ml: 'കൂട്ടം', en: 'KOOTAM', confirmed: false },
  name: { ml: 'ക്രിയേറ്റേഴ്‌സ് കൂട്ടം', en: 'Creators Kootam', confirmed: false },
  youreIn: { ml: 'നിങ്ങൾ കൂട്ടത്തിലാണ്.', en: "You're in the kootam.", confirmed: false },
  codeEyebrow: { ml: null, en: 'THE CODE', confirmed: false },
  codeFooter: { ml: null, en: 'Kerala is small. Credit loudly.', confirmed: false },
  footerSignoff: { ml: 'നമോവാകം', en: 'See you in the kootam.', confirmed: false },
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
