import { describe, expect, test, vi } from 'vitest';
import { removePhotoCore, setPhotoCore, setPhotoPublicCore, type PhotoDeps } from '@/lib/photos/actions';
import type { MemberRow } from '@/lib/members/types';

const user = { id: 'u1', email: 'a@example.com', name: 'A', avatarUrl: 'https://lh3.googleusercontent.com/a/x=s96-c' };
const member = { id: 'm1', user_id: 'u1', status: 'active', show_on_wall: true, photo_path: null, photo_public: false } as MemberRow;
const JPEG = Buffer.from('jpeg-bytes');

function deps(over: Partial<PhotoDeps> = {}) {
  const d: PhotoDeps = {
    getUser: vi.fn(async () => user),
    getMember: vi.fn(async () => member),
    process: vi.fn(async () => ({ ok: true as const, jpeg: JPEG })),
    fetchAvatar: vi.fn(async () => ({ ok: true as const, bytes: new Uint8Array([1, 2, 3]) })),
    upload: vi.fn(async () => true),
    removeObject: vi.fn(async () => {}),
    update: vi.fn(async () => 1),
    newName: () => 'abc123',
    ...over,
  };
  return d;
}

describe('setPhotoCore (upload)', () => {
  test('stores the processed jpeg under the member’s own folder, points the row at it, and keeps the photo private until they say so', async () => {
    const d = deps();
    await expect(setPhotoCore(d, { source: 'upload', bytes: new Uint8Array([9]) })).resolves.toEqual({ ok: true });
    expect(d.upload).toHaveBeenCalledWith('m1/abc123.jpg', JPEG);
    expect(d.update).toHaveBeenCalledWith('m1', { photo_path: 'm1/abc123.jpg' });
  });

  test('replacing a photo removes the old file, after the new one is safely in place', async () => {
    const order: string[] = [];
    const d = deps({
      getMember: vi.fn(async () => ({ ...member, photo_path: 'm1/old.jpg' })),
      upload: vi.fn(async () => (order.push('upload'), true)),
      update: vi.fn(async () => (order.push('update'), 1)),
      removeObject: vi.fn(async () => void order.push('remove')),
    });
    await setPhotoCore(d, { source: 'upload', bytes: new Uint8Array([9]) });
    expect(order).toEqual(['upload', 'update', 'remove']);
    expect(d.removeObject).toHaveBeenCalledWith('m1/old.jpg');
  });

  test('if the row can’t be updated, the new file is cleaned up and the old photo stays', async () => {
    const d = deps({ getMember: vi.fn(async () => ({ ...member, photo_path: 'm1/old.jpg' })), update: vi.fn(async () => 0) });
    await expect(setPhotoCore(d, { source: 'upload', bytes: new Uint8Array([9]) })).resolves.toEqual({ ok: false, reason: 'unknown' });
    expect(d.removeObject).toHaveBeenCalledWith('m1/abc123.jpg');
    expect(d.removeObject).not.toHaveBeenCalledWith('m1/old.jpg');
  });

  test('a failed upload writes nothing', async () => {
    const d = deps({ upload: vi.fn(async () => false) });
    await expect(setPhotoCore(d, { source: 'upload', bytes: new Uint8Array([9]) })).resolves.toEqual({ ok: false, reason: 'unknown' });
    expect(d.update).not.toHaveBeenCalled();
  });

  test('a file that isn’t a photo, or is too big, is refused with its own reason', async () => {
    for (const error of ['not_an_image', 'too_big'] as const) {
      const d = deps({ process: vi.fn(async () => ({ ok: false as const, error })) });
      await expect(setPhotoCore(d, { source: 'upload', bytes: new Uint8Array([9]) })).resolves.toEqual({ ok: false, reason: error });
      expect(d.upload).not.toHaveBeenCalled();
    }
  });

  test('signed out, not a member, or on hold: nothing happens', async () => {
    for (const [over, reason] of [
      [{ getUser: vi.fn(async () => null) }, 'unauthenticated'],
      [{ getMember: vi.fn(async () => null) }, 'no_member'],
      [{ getMember: vi.fn(async () => ({ ...member, status: 'flagged' as const })) }, 'inactive'],
    ] as const) {
      const d = deps(over as Partial<PhotoDeps>);
      await expect(setPhotoCore(d, { source: 'upload', bytes: new Uint8Array([9]) })).resolves.toEqual({ ok: false, reason });
      expect(d.process).not.toHaveBeenCalled();
      expect(d.upload).not.toHaveBeenCalled();
    }
  });
});

describe('setPhotoCore (Google photo)', () => {
  test('fetches the signed-in user’s own Google avatar — never a url from the request — and runs it through the same pipeline', async () => {
    const d = deps();
    await expect(setPhotoCore(d, { source: 'google' })).resolves.toEqual({ ok: true });
    expect(d.fetchAvatar).toHaveBeenCalledWith(user.avatarUrl);
    expect(d.process).toHaveBeenCalledWith(new Uint8Array([1, 2, 3]));
  });

  test('no Google photo on the account, or Google not answering, say so', async () => {
    const none = deps({ getUser: vi.fn(async () => ({ ...user, avatarUrl: null })) });
    await expect(setPhotoCore(none, { source: 'google' })).resolves.toEqual({ ok: false, reason: 'no_google_photo' });
    const down = deps({ fetchAvatar: vi.fn(async () => ({ ok: false as const, error: 'unavailable' as const })) });
    await expect(setPhotoCore(down, { source: 'google' })).resolves.toEqual({ ok: false, reason: 'unavailable' });
    expect(down.upload).not.toHaveBeenCalled();
  });
});

describe('removePhotoCore', () => {
  test('removes the file, clears the path, and switches the photo off', async () => {
    const d = deps({ getMember: vi.fn(async () => ({ ...member, photo_path: 'm1/old.jpg', photo_public: true })) });
    await expect(removePhotoCore(d)).resolves.toEqual({ ok: true });
    expect(d.update).toHaveBeenCalledWith('m1', { photo_path: null, photo_public: false });
    expect(d.removeObject).toHaveBeenCalledWith('m1/old.jpg');
  });

  test('with no photo there is nothing to remove, and that is fine', async () => {
    const d = deps();
    await expect(removePhotoCore(d)).resolves.toEqual({ ok: true });
    expect(d.update).not.toHaveBeenCalled();
  });
});

describe('setPhotoPublicCore (the "show my photo" switch)', () => {
  const withPhoto = { ...member, photo_path: 'm1/p.jpg' } as MemberRow;

  test('on and off, writing only photo_public on their own row', async () => {
    const d = deps({ getMember: vi.fn(async () => withPhoto) });
    await expect(setPhotoPublicCore(d, true)).resolves.toEqual({ ok: true });
    expect(d.update).toHaveBeenCalledWith('m1', { photo_public: true });
    await expect(setPhotoPublicCore(d, false)).resolves.toEqual({ ok: true });
    expect(d.update).toHaveBeenLastCalledWith('m1', { photo_public: false });
  });

  test('can’t be switched on with no photo, or when off the member wall', async () => {
    await expect(setPhotoPublicCore(deps(), true)).resolves.toEqual({ ok: false, reason: 'no_photo' });
    const off = deps({ getMember: vi.fn(async () => ({ ...withPhoto, show_on_wall: false })) });
    await expect(setPhotoPublicCore(off, true)).resolves.toEqual({ ok: false, reason: 'off_wall' });
  });

  test('signed out or not a boolean: nothing is written', async () => {
    const out = deps({ getUser: vi.fn(async () => null) });
    await expect(setPhotoPublicCore(out, true)).resolves.toEqual({ ok: false, reason: 'unauthenticated' });
    const d = deps({ getMember: vi.fn(async () => withPhoto) });
    await expect(setPhotoPublicCore(d, 'yes' as unknown as boolean)).resolves.toEqual({ ok: false, reason: 'invalid' });
    expect(d.update).not.toHaveBeenCalled();
  });
});
