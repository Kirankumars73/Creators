import { describe, expect, test } from 'vitest';
import { toPassData } from '@/lib/pass/data';
import type { MemberRow } from '@/lib/members/types';

const row: MemberRow = {
  id: '6b1f3c2e-0000-4000-8000-000000000001',
  user_id: 'u1',
  email: 'g@example.com',
  display_name: 'Gowtham Das',
  avatar_url: null,
  instagram: 'the.gowtham_das',
  role: 'editor',
  role_other_text: null,
  city: 'Ernakulam',
  tags: [],
  portfolio_url: null,
  show_on_wall: true,
  profile_public: false,
  photo_path: null,
  photo_public: false,
  accepted_code: true,
  status: 'active',
  role_changes: 0,
  created_at: '2026-10-13T20:00:00Z',
  updated_at: '2026-10-13T20:00:00Z',
};

describe('toPassData', () => {
  test.each(['flagged', 'removed'] as const)('a %s member has no pass', (status) => expect(toPassData({ ...row, status })).toBeNull());

  test('never carries the email', () => expect(Object.keys(toPassData(row)!)).not.toContain('email'));

  test('names the room and lane', () => expect(toPassData(row)).toMatchObject({ roomName: 'EDITORS', laneLabel: 'LANE 02 · EDITORS', role: 'editor' }));

  test('the join date is Kerala time', () => expect(toPassData(row)!.joined).toBe('14.10.2026'));

  test('a Latin name is the headline', () => expect(toPassData(row)!.headline).toBe('Gowtham Das'));

  test('a Malayalam name falls back to the handle (next/og cannot shape it)', () =>
    expect(toPassData({ ...row, display_name: 'ഗൗതം ദാസ്' })!.headline).toBe('@the.gowtham_das'));

  describe('the photo on the pass', () => {
    const withPhoto = { ...row, photo_path: `${row.id}/p.jpg` };

    test('the member’s own pass carries their photo whether or not it is switched on publicly', () =>
      expect(toPassData(withPhoto)!.photoPath).toBe(withPhoto.photo_path));

    test('a shared (public) pass carries it only when they switched it on', () => {
      expect(toPassData(withPhoto, { public: true })!.photoPath).toBeNull();
      expect(toPassData({ ...withPhoto, photo_public: true }, { public: true })!.photoPath).toBe(withPhoto.photo_path);
    });

    test('no photo means no photo, whatever the switch says', () => expect(toPassData({ ...row, photo_public: true }, { public: true })!.photoPath).toBeNull());
  });
});
