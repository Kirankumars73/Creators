import 'server-only';
import { randomUUID } from 'node:crypto';
import { getSessionUser } from '@/lib/auth/session';
import { updateMember } from '@/lib/members/repo';
import { getOwnMember } from '@/lib/members/self';
import type { PhotoDeps } from './actions';
import { fetchGoogleAvatar } from './google';
import { processPhoto } from './process';
import { removePhotoObject, uploadPhotoObject } from './storage';

/** The real wiring for the photo rules in actions.ts. */
export const photoDeps: PhotoDeps = {
  getUser: getSessionUser,
  getMember: getOwnMember,
  process: processPhoto,
  fetchAvatar: (url) => fetchGoogleAvatar(url),
  upload: uploadPhotoObject,
  removeObject: removePhotoObject,
  update: (id, patch) => updateMember(id, patch),
  newName: () => randomUUID(),
};
