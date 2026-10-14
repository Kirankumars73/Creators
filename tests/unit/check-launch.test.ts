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
  NEXT_PUBLIC_SITE_URL: 'https://creatorskootam.in',
  NEXT_PUBLIC_SUPABASE_URL: 'https://abc.supabase.co',
  NEXT_PUBLIC_SUPABASE_ANON_KEY: 'anon',
  SUPABASE_SERVICE_ROLE_KEY: 'secret',
};

describe('findLaunchBlockers', () => {
  test('the shipped config is not launch-ready yet, and says exactly why', () => {
    const blockers = findLaunchBlockers({ ml: ML, articles: CODE_ARTICLES, brand, env: {}, stills: REEL_STILLS });
    expect(blockers).toEqual(
      expect.arrayContaining(['ml:wordmark', 'ml:youreIn', 'code:04', 'code:07', 'reels:stills', 'env:WA_COMMUNITY_URL', 'env:ADMIN_EMAILS']),
    );
    // Decided 2026-10-14: his name is spelled Gowtham.
    expect(blockers).not.toContain('brand:founder');
    // Decided 2026-10-14: no SITE BY credit; the contact is Gowtham's address.
    expect(blockers).not.toContain('brand:siteBy');
    expect(blockers).not.toContain('brand:contact');
  });

  test('placeholder invite links block launch', () => {
    const blockers = findLaunchBlockers({ ml: {}, articles: [], brand: { contact: 'x', founderConfirmed: true }, env: { ...goodEnv, WA_EDITORS_URL: 'https://chat.whatsapp.com/PENDINGEDITORS' }, stills: ['/reels/01.jpg'] });
    expect(blockers).toEqual(['env:WA_EDITORS_URL']);
  });

  test('a fully confirmed launch has no blockers', () => {
    expect(
      findLaunchBlockers({
        ml: { wordmark: { ml: 'കൂട്ടം', en: 'KOOTAM', confirmed: true } },
        articles: [{ n: '01', text: 'x', draft: false }],
        brand: { contact: 'hi@example.com', founderConfirmed: true },
        env: goodEnv,
        stills: ['/reels/01.jpg'],
      }),
    ).toEqual([]);
  });
});

describe('findLaunchBlockers — env is checked for shape, not just presence (final review F10)', () => {
  const base = { ml: {}, articles: [], brand: { contact: 'x', founderConfirmed: true }, stills: ['/r.jpg'] };
  const env = {
    WA_COMMUNITY_URL: 'https://chat.whatsapp.com/AbC1',
    WA_CREATORS_URL: 'https://chat.whatsapp.com/AbC2',
    WA_EDITORS_URL: 'https://chat.whatsapp.com/AbC3',
    ADMIN_EMAILS: 'a@b.c',
    NEXT_PUBLIC_SITE_URL: 'https://creatorskootam.in',
    NEXT_PUBLIC_SUPABASE_URL: 'https://abc.supabase.co',
    NEXT_PUBLIC_SUPABASE_ANON_KEY: 'anon',
    SUPABASE_SERVICE_ROLE_KEY: 'secret',
  };
  test('a complete, well-formed env passes', () => expect(findLaunchBlockers({ ...base, env })).toEqual([]));
  test('a link that is not a WhatsApp invite is a blocker', () =>
    expect(findLaunchBlockers({ ...base, env: { ...env, WA_CREATORS_URL: 'https://wa.me/123' } })).toEqual(['env:WA_CREATORS_URL']));
  test('site URL and Supabase keys are required', () =>
    expect(findLaunchBlockers({ ...base, env: { ...env, NEXT_PUBLIC_SITE_URL: '', SUPABASE_SERVICE_ROLE_KEY: undefined } })).toEqual([
      'env:NEXT_PUBLIC_SITE_URL',
      'env:SUPABASE_SERVICE_ROLE_KEY',
    ]));
  test('a localhost site URL is not a launch URL', () =>
    expect(findLaunchBlockers({ ...base, env: { ...env, NEXT_PUBLIC_SITE_URL: 'http://localhost:3000' } })).toEqual(['env:NEXT_PUBLIC_SITE_URL']));
});

describe('findLaunchBlockers — the privacy page speaks for Gowtham', () => {
  test('it blocks launch until he has read it', () =>
    expect(findLaunchBlockers({ ml: {}, articles: [], brand: { contact: 'x', founderConfirmed: true, privacyReviewed: false }, env: {}, stills: [] })).toContain('brand:privacy'));
});
