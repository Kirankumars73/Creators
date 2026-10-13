import { describe, expect, test } from 'vitest';
import { INSTAGRAM_RE, memberInputSchema, normalizeInstagram } from '@/lib/members/schema';

const validCreator = {
  role: 'creator',
  displayName: 'Gowtham Das',
  instagram: 'the.gowtham_das',
  city: 'Ernakulam',
  tags: ['reels', 'fashion'],
  showOnWall: true,
  acceptedCode: true,
};

describe('INSTAGRAM_RE (§8 test 7)', () => {
  test('accepts a real handle', () => expect(INSTAGRAM_RE.test('the.gowtham_das')).toBe(true));
  test('rejects a URL', () => expect(INSTAGRAM_RE.test('https://instagram.com/x')).toBe(false));
  test('rejects spaces', () => expect(INSTAGRAM_RE.test('a b')).toBe(false));
});

describe('normalizeInstagram (Review Focus 2)', () => {
  test.each([
    '@the.gowtham_das',
    'instagram.com/the.gowtham_das',
    'https://www.instagram.com/the.gowtham_das/?igsh=abc',
    '  The.Gowtham_Das ',
    'instagr.am/the.gowtham_das',
    'https://instagram.com/@the.gowtham_das',
  ])('%s → the.gowtham_das', (raw) => expect(normalizeInstagram(raw)).toBe('the.gowtham_das'));

  test('a non-Instagram link is left alone so validation rejects it', () => {
    expect(INSTAGRAM_RE.test(normalizeInstagram('https://linktr.ee/gowtham'))).toBe(false);
  });

  test('a post or reel link is not mistaken for a handle', () => {
    expect(INSTAGRAM_RE.test(normalizeInstagram('https://www.instagram.com/reel/Cx12ab/'))).toBe(false);
    expect(INSTAGRAM_RE.test(normalizeInstagram('instagram.com/p/Cx12ab'))).toBe(false);
  });
});

describe('memberInputSchema', () => {
  test('a valid creator parses, with the handle normalised', () => {
    const r = memberInputSchema.safeParse({ ...validCreator, instagram: '@The.Gowtham_Das' });
    expect(r.success).toBe(true);
    expect(r.data).toMatchObject({ role: 'creator', instagram: 'the.gowtham_das', tags: ['reels', 'fashion'] });
  });

  test.each([
    ['acceptedCode false', { acceptedCode: false }],
    ['other without roleOtherText', { role: 'other', tags: [] }],
    ['other with one character', { role: 'other', roleOtherText: 'x', tags: [] }],
    ['editor carrying a creator tag', { role: 'editor', tags: ['fashion'] }],
    ['a smuggled status', { status: 'active' }],
    ['a smuggled userId', { userId: '00000000-0000-0000-0000-000000000000' }],
    ['a blank display name', { displayName: '   ' }],
    ['a javascript: portfolio link', { portfolioUrl: 'javascript:alert(1)' }],
    ['a city outside the list', { city: 'Chennai' }],
  ])('rejects %s', (_label, patch) => {
    expect(memberInputSchema.safeParse({ ...validCreator, ...patch }).success).toBe(false);
  });

  test('a Malayalam display name is welcome', () => {
    expect(memberInputSchema.safeParse({ ...validCreator, displayName: 'ഗൗതം ദാസ്' }).success).toBe(true);
  });

  test('length is counted in characters, not UTF-16 units, matching the database', () => {
    expect(memberInputSchema.safeParse({ ...validCreator, displayName: '😀' }).success).toBe(false);
  });

  test('other with a real answer parses and keeps no tags', () => {
    const r = memberInputSchema.safeParse({ ...validCreator, role: 'other', roleOtherText: ' DOP ', tags: [] });
    expect(r.success).toBe(true);
    expect(r.data).toMatchObject({ role: 'other', roleOtherText: 'DOP', tags: [] });
  });

  test('an empty portfolio link is treated as none; https links are kept', () => {
    expect(memberInputSchema.parse({ ...validCreator, portfolioUrl: '' }).portfolioUrl).toBeUndefined();
    expect(memberInputSchema.parse({ ...validCreator, portfolioUrl: 'https://vimeo.com/123' }).portfolioUrl).toBe('https://vimeo.com/123');
  });

  test('show on the wall defaults to on', () => {
    const withoutWallChoice: Record<string, unknown> = { ...validCreator };
    delete withoutWallChoice.showOnWall;
    expect(memberInputSchema.parse(withoutWallChoice).showOnWall).toBe(true);
  });
});

describe('normalizeInstagram — pasted-handle edge cases (Phase 2 review)', () => {
  test('the /_u/ deep-link form keeps the real handle', () =>
    expect(normalizeInstagram('https://instagram.com/_u/the.gowtham_das')).toBe('the.gowtham_das'));
  test('a space after the @ is forgiven', () => expect(normalizeInstagram('@ the.gowtham_das')).toBe('the.gowtham_das'));
  test('invisible characters picked up by copy-paste are dropped', () =>
    expect(normalizeInstagram('​the.gowtham_das‎')).toBe('the.gowtham_das'));
});
