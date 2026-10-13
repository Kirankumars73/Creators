import { describe, expect, test } from 'vitest';
import { brand } from '@/config/brand';
import { CODE_ARTICLES } from '@/config/code';
import { REEL_STILLS } from '@/config/reels';
import { ML } from '@/i18n/ml';
import { findLaunchBlockers } from '../../scripts/check-launch.mjs';

const goodEnv = {
  WA_COMMUNITY_URL: 'https://chat.whatsapp.com/AbC1',
  WA_CREATORS_URL: 'https://chat.whatsapp.com/AbC2',
  WA_EDITORS_URL: 'https://chat.whatsapp.com/AbC3',
  ADMIN_EMAILS: 'gowtham@example.com',
};

describe('findLaunchBlockers', () => {
  test('the shipped config is not launch-ready yet, and says exactly why', () => {
    const blockers = findLaunchBlockers({ ml: ML, articles: CODE_ARTICLES, brand, env: {}, stills: REEL_STILLS });
    expect(blockers).toEqual(
      expect.arrayContaining(['ml:wordmark', 'ml:youreIn', 'code:04', 'code:07', 'brand:siteBy', 'brand:contact', 'brand:founder', 'reels:stills', 'env:WA_COMMUNITY_URL', 'env:ADMIN_EMAILS']),
    );
  });

  test('placeholder invite links block launch', () => {
    const blockers = findLaunchBlockers({ ml: {}, articles: [], brand: { siteBy: 'x', contact: 'x', founderConfirmed: true }, env: { ...goodEnv, WA_EDITORS_URL: 'https://chat.whatsapp.com/PENDINGEDITORS' }, stills: ['/reels/01.jpg'] });
    expect(blockers).toEqual(['env:WA_EDITORS_URL']);
  });

  test('a fully confirmed launch has no blockers', () => {
    expect(
      findLaunchBlockers({
        ml: { wordmark: { ml: 'കൂട്ടം', en: 'KOOTAM', confirmed: true } },
        articles: [{ n: '01', text: 'x', draft: false }],
        brand: { siteBy: 'Name', contact: 'hi@example.com', founderConfirmed: true },
        env: goodEnv,
        stills: ['/reels/01.jpg'],
      }),
    ).toEqual([]);
  });
});
