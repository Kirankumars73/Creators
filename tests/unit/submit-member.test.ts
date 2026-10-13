import { describe, expect, test, vi } from 'vitest';
import { submitMemberCore } from '@/lib/members/submit';

const user = { id: 'user-1', email: 'g@example.com', name: 'Gowtham Das', avatarUrl: null };
const valid = { role: 'creator', displayName: 'Gowtham Das', instagram: 'the.gowtham_das', city: 'Ernakulam', tags: [], acceptedCode: true };

describe('submitMemberCore', () => {
  test('no session → unauthenticated, nothing written', async () => {
    const insert = vi.fn();
    expect(await submitMemberCore({ getUser: async () => null, insert }, valid)).toEqual({ ok: false, error: 'unauthenticated' });
    expect(insert).not.toHaveBeenCalled();
  });

  test('invalid input → field errors, nothing written', async () => {
    const insert = vi.fn();
    const res = await submitMemberCore({ getUser: async () => user, insert }, { ...valid, instagram: 'a b' });
    expect(res).toMatchObject({ ok: false, error: 'invalid', fieldErrors: { instagram: expect.any(String) } });
    expect(insert).not.toHaveBeenCalled();
  });

  test('valid input is written once with the session identity', async () => {
    const insert = vi.fn(async () => ({ errorCode: null }));
    expect(await submitMemberCore({ getUser: async () => user, insert }, valid)).toEqual({ ok: true, alreadyMember: false });
    expect(insert).toHaveBeenCalledWith(expect.objectContaining({ user_id: 'user-1', email: 'g@example.com' }));
  });

  test('a second submit (double tap, two tabs) lands as "already in" (§8 test 8)', async () => {
    const insert = vi.fn(async () => ({ errorCode: '23505' }));
    expect(await submitMemberCore({ getUser: async () => user, insert }, valid)).toEqual({ ok: true, alreadyMember: true });
  });

  test('a database rejection is reported as invalid', async () => {
    const insert = vi.fn(async () => ({ errorCode: '23514' }));
    expect(await submitMemberCore({ getUser: async () => user, insert }, valid)).toEqual({ ok: false, error: 'invalid' });
  });
});
