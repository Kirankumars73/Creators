import { describe, expect, test } from 'vitest';
import { buildMemberInsert, mapInsertError } from '@/lib/members/row';
import { memberInputSchema } from '@/lib/members/schema';

const user = { id: 'user-1', email: 'g@example.com', name: 'Gowtham Das', avatarUrl: 'https://lh3.example/a.png' };
const input = memberInputSchema.parse({
  role: 'editor',
  displayName: 'Gowtham Das',
  instagram: '@the.gowtham_das',
  city: 'Ernakulam',
  tags: ['davinci'],
  portfolioUrl: '',
  acceptedCode: true,
});

describe('buildMemberInsert', () => {
  test('identity comes from the session, never the form', () => {
    const row = buildMemberInsert(user, input);
    expect(row).toMatchObject({ user_id: 'user-1', email: 'g@example.com', avatar_url: 'https://lh3.example/a.png' });
  });

  test('maps the form onto columns', () => {
    expect(buildMemberInsert(user, input)).toEqual({
      user_id: 'user-1',
      email: 'g@example.com',
      avatar_url: 'https://lh3.example/a.png',
      display_name: 'Gowtham Das',
      instagram: 'the.gowtham_das',
      role: 'editor',
      role_other_text: null,
      city: 'Ernakulam',
      tags: ['davinci'],
      portfolio_url: null,
      show_on_wall: true,
      accepted_code: true,
    });
  });

  test('server-owned columns are never set', () => {
    const row = buildMemberInsert(user, input) as Record<string, unknown>;
    expect(row).not.toHaveProperty('status');
    expect(row).not.toHaveProperty('role_changes');
  });
});

describe('mapInsertError', () => {
  test('a duplicate user means they are already in (§8 test 8)', () => expect(mapInsertError('23505')).toBe('already_member'));
  test.each(['23514', '22P02'])('%s is invalid input', (code) => expect(mapInsertError(code)).toBe('invalid'));
  test.each([undefined, 'XX000'])('%s is unknown', (code) => expect(mapInsertError(code)).toBe('unknown'));
});
