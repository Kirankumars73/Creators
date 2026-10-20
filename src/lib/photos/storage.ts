import 'server-only';
import { createAdminSupabase } from '@/lib/supabase/admin';

// The private member-photos bucket, reached only with the service role from server code.
const BUCKET = 'member-photos';

export async function uploadPhotoObject(path: string, jpeg: Buffer): Promise<boolean> {
  const { error } = await createAdminSupabase().storage.from(BUCKET).upload(path, jpeg, { contentType: 'image/jpeg', upsert: false, cacheControl: '3600' });
  if (error) console.error('[photos] upload', error.message);
  return !error;
}

export async function removePhotoObject(path: string): Promise<void> {
  const { error } = await createAdminSupabase().storage.from(BUCKET).remove([path]);
  // A leftover file is untidy, not harmful (nothing points at it): log, don't fail the request.
  if (error) console.error('[photos] remove', error.message);
}

export async function readPhotoObject(path: string): Promise<Buffer | null> {
  const { data, error } = await createAdminSupabase().storage.from(BUCKET).download(path);
  if (error || !data) return null;
  return Buffer.from(await data.arrayBuffer());
}

/** A public member's photo path: only on the wall, active, and with the photo switched on. */
export async function publicPhotoPath(handle: string): Promise<string | null> {
  const { data, error } = await createAdminSupabase()
    .from('members')
    .select('photo_path')
    .eq('instagram', handle.toLowerCase()) // stored lowercase by the join form
    .eq('show_on_wall', true)
    .eq('status', 'active')
    .eq('photo_public', true)
    .not('photo_path', 'is', null)
    .maybeSingle();
  if (error) throw error;
  return (data as { photo_path: string } | null)?.photo_path ?? null;
}
