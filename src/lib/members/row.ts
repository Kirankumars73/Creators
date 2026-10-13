import type { SessionUser } from '@/lib/auth/session';
import type { MemberInput } from './schema';
import type { MemberInsert } from './types';

/** Form → row. Identity (user_id, email, avatar) comes from the verified session only. */
export function buildMemberInsert(user: SessionUser, input: MemberInput): MemberInsert {
  return {
    user_id: user.id,
    email: user.email,
    avatar_url: user.avatarUrl,
    display_name: input.displayName,
    instagram: input.instagram,
    role: input.role,
    role_other_text: input.role === 'other' ? input.roleOtherText : null,
    city: input.city,
    tags: input.tags,
    portfolio_url: input.portfolioUrl ?? null,
    show_on_wall: input.showOnWall,
    accepted_code: input.acceptedCode,
  };
}

export function mapInsertError(code: string | undefined): 'already_member' | 'invalid' | 'unknown' {
  if (code === '23505') return 'already_member';
  if (code === '23514' || code === '22P02') return 'invalid';
  return 'unknown';
}
