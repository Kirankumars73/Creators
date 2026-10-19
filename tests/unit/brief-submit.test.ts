import { describe, expect, test, vi } from 'vitest';
import { MIN_FILL_MS, submitBriefCore } from '@/lib/briefs/submit';

const NOW = 1_800_000_000_000;
const valid = {
  brand: 'Malabar Café',
  contact_name: 'Anjali Menon',
  email: 'anjali@malabar.cafe',
  phone: '+91 98470 12345',
  brief: 'Launch week, Kozhikode. Two reels and a story. Paid.',
  website: '',
  t: String(NOW - 20_000),
};

function deps(errorCode: string | null = null) {
  return { insert: vi.fn(async () => ({ errorCode })), now: () => NOW };
}

describe('brand briefs (public form, server-validated)', () => {
  test('a valid brief is stored, trimmed, with the email lower-cased', async () => {
    const d = deps();
    await expect(submitBriefCore(d, { ...valid, brand: '  Malabar Café ', email: 'Anjali@Malabar.Cafe' })).resolves.toEqual({ ok: true });
    expect(d.insert).toHaveBeenCalledWith({
      brand: 'Malabar Café',
      contact_name: 'Anjali Menon',
      email: 'anjali@malabar.cafe',
      phone: '+91 98470 12345',
      brief: 'Launch week, Kozhikode. Two reels and a story. Paid.',
    });
  });

  test('phone and brief are optional and stored as null when blank', async () => {
    const d = deps();
    await expect(submitBriefCore(d, { ...valid, phone: '  ', brief: '' })).resolves.toEqual({ ok: true });
    expect(d.insert).toHaveBeenCalledWith(expect.objectContaining({ phone: null, brief: null }));
  });

  test('each bad field gets its own message and nothing is stored', async () => {
    const d = deps();
    const r = await submitBriefCore(d, { ...valid, brand: 'x', email: 'not-an-email', phone: 'call me', brief: 'a'.repeat(1501) });
    expect(r).toMatchObject({ ok: false, error: 'invalid' });
    if (r.ok || r.error !== 'invalid') return;
    expect(Object.keys(r.fieldErrors ?? {}).sort()).toEqual(['brand', 'brief', 'email', 'phone']);
    expect(d.insert).not.toHaveBeenCalled();
  });

  test('a filled honeypot looks like success to the bot but stores nothing', async () => {
    const d = deps();
    await expect(submitBriefCore(d, { ...valid, website: 'http://spam.example' })).resolves.toEqual({ ok: true });
    expect(d.insert).not.toHaveBeenCalled();
  });

  test('a form submitted faster than a person can type is dropped the same way', async () => {
    const d = deps();
    await expect(submitBriefCore(d, { ...valid, t: String(NOW - MIN_FILL_MS + 1) })).resolves.toEqual({ ok: true });
    await expect(submitBriefCore(d, { ...valid, t: 'garbage' })).resolves.toEqual({ ok: true });
    expect(d.insert).not.toHaveBeenCalled();
  });

  test('a database failure is reported as unavailable, so the form can offer email instead', async () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    await expect(submitBriefCore(deps('42P01'), valid)).resolves.toEqual({ ok: false, error: 'unavailable' });
    spy.mockRestore();
  });

  test('non-object input is invalid, not a crash', async () => {
    await expect(submitBriefCore(deps(), null)).resolves.toMatchObject({ ok: false, error: 'invalid' });
  });
});
