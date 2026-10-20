import type { SessionUser } from '@/lib/auth/session';
import type { MemberRow } from '@/lib/members/types';
import type { GoogleAvatarResult } from './google';
import type { PhotoError } from './process';

export type PhotoReason =
  | 'unauthenticated'
  | 'no_member'
  | 'inactive'
  | 'invalid'
  | 'no_photo'
  | 'off_wall'
  | 'no_google_photo'
  | 'unavailable'
  | PhotoError
  | 'unknown';

export type PhotoResult = { ok: true } | { ok: false; reason: PhotoReason };

export type PhotoDeps = {
  getUser(): Promise<SessionUser | null>;
  getMember(): Promise<MemberRow | null>;
  process(bytes: Uint8Array): Promise<{ ok: true; jpeg: Buffer } | { ok: false; error: PhotoError }>;
  fetchAvatar(url: string): Promise<GoogleAvatarResult>;
  /** Writes into the private bucket; false on failure. */
  upload(path: string, jpeg: Buffer): Promise<boolean>;
  removeObject(path: string): Promise<void>;
  /** Writes only photo columns on the member's own row; returns rows changed. */
  update(id: string, patch: Partial<Pick<MemberRow, 'photo_path' | 'photo_public'>>): Promise<number>;
  newName(): string;
};

async function activeMember(deps: PhotoDeps): Promise<{ user: SessionUser; member: MemberRow } | { reason: PhotoReason }> {
  const user = await deps.getUser();
  if (!user) return { reason: 'unauthenticated' };
  const member = await deps.getMember();
  if (!member) return { reason: 'no_member' };
  if (member.status !== 'active') return { reason: 'inactive' };
  return { user, member };
}

/**
 * Sets the member's photo from an upload or from their own Google photo. The Google url comes
 * from the verified session, never from the request. The new file goes in first, the row is
 * pointed at it, and only then is the old file removed, so a failure never loses a photo.
 * A new photo starts private: showing it is a separate, explicit choice.
 */
export async function setPhotoCore(deps: PhotoDeps, input: { source: 'upload'; bytes: Uint8Array } | { source: 'google' }): Promise<PhotoResult> {
  const who = await activeMember(deps);
  if ('reason' in who) return { ok: false, reason: who.reason };
  const { user, member } = who;

  let bytes: Uint8Array;
  if (input.source === 'google') {
    if (!user.avatarUrl) return { ok: false, reason: 'no_google_photo' };
    const got = await deps.fetchAvatar(user.avatarUrl);
    if (!got.ok) return { ok: false, reason: got.error };
    bytes = got.bytes;
  } else {
    bytes = input.bytes;
  }

  const processed = await deps.process(bytes);
  if (!processed.ok) return { ok: false, reason: processed.error };

  const path = `${member.id}/${deps.newName()}.jpg`;
  if (!(await deps.upload(path, processed.jpeg))) return { ok: false, reason: 'unknown' };
  if (!(await deps.update(member.id, { photo_path: path }))) {
    await deps.removeObject(path);
    return { ok: false, reason: 'unknown' };
  }
  if (member.photo_path) await deps.removeObject(member.photo_path);
  return { ok: true };
}

export async function removePhotoCore(deps: PhotoDeps): Promise<PhotoResult> {
  const who = await activeMember(deps);
  if ('reason' in who) return { ok: false, reason: who.reason };
  const { member } = who;
  if (!member.photo_path) return { ok: true };
  if (!(await deps.update(member.id, { photo_path: null, photo_public: false }))) return { ok: false, reason: 'unknown' };
  await deps.removeObject(member.photo_path);
  return { ok: true };
}

/** The "show my photo" switch: only with a photo, and only for members on the wall. */
export async function setPhotoPublicCore(deps: PhotoDeps, value: boolean): Promise<PhotoResult> {
  const user = await deps.getUser();
  if (!user) return { ok: false, reason: 'unauthenticated' };
  if (typeof value !== 'boolean') return { ok: false, reason: 'invalid' };
  const member = await deps.getMember();
  if (!member) return { ok: false, reason: 'no_member' };
  if (member.status !== 'active') return { ok: false, reason: 'inactive' };
  if (value && !member.photo_path) return { ok: false, reason: 'no_photo' };
  if (value && !member.show_on_wall) return { ok: false, reason: 'off_wall' };
  return (await deps.update(member.id, { photo_public: value })) ? { ok: true } : { ok: false, reason: 'unknown' };
}
