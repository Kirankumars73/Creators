'use server';

import { revalidatePath } from 'next/cache';
import { refreshWallNow } from '@/lib/wall/revalidate';
import { setMemberStatusCore } from '@/lib/auth/admin';
import { requireAdmin } from '@/lib/auth/require-admin';
import { updateStatus } from '@/lib/admin/queries';
import type { MemberStatus } from '@/lib/members/types';

export async function setMemberStatus(formData: FormData): Promise<void> {
  const id = String(formData.get('id') ?? '');
  const status = String(formData.get('status') ?? '') as MemberStatus;
  try {
    await setMemberStatusCore({ requireAdmin, update: updateStatus }, id, status);
  } catch (err) {
    console.error('[admin] setMemberStatus', err);
  }
  revalidatePath('/admin');
  // Flagging or removing someone takes them off the public wall at once.
  refreshWallNow();
}
