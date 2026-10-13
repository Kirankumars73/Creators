import { describe, expect, test } from 'vitest';
import { resolveStep } from '@/lib/join/step';

const anon = { signedIn: false, hasMember: false };
const fresh = { signedIn: true, hasMember: false };
const member = { signedIn: true, hasMember: true };

describe('resolveStep — the URL can ask, the session decides', () => {
  test('signed out always starts at sign-in', () => expect(resolveStep({ step: 'reveal' }, anon)).toEqual({ step: 'signin', lane: null }));
  test('no member row cannot jump to the reveal', () => expect(resolveStep({ step: 'reveal' }, fresh).step).toBe('lane'));
  test('details with a chosen lane', () =>
    expect(resolveStep({ step: 'details', lane: 'editor' }, fresh)).toEqual({ step: 'details', lane: 'editor' }));
  test('details without a lane goes back to the lane picker', () => expect(resolveStep({ step: 'details' }, fresh).step).toBe('lane'));
  test('an invented lane is ignored', () => expect(resolveStep({ step: 'details', lane: 'admin' }, fresh)).toEqual({ step: 'lane', lane: null }));
  test('returning members skip straight to the reveal (§7)', () => expect(resolveStep({ step: 'lane' }, member).step).toBe('reveal'));
  test('a signed-in visitor with no step lands on the lane picker', () => expect(resolveStep({}, fresh).step).toBe('lane'));
});
