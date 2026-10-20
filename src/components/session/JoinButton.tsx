'use client';

import type { ReactNode } from 'react';
import { Button, type Size, type Variant } from '@/components/ui/Button';
import { SESSION_COPY } from '@/config/landing';
import { useSession } from '@/lib/session/store';

type JoinButtonProps = {
  variant?: Variant;
  size?: Size;
  className?: string;
  /** What a visitor sees; members and half-joined people see their own label. */
  children?: ReactNode;
  /** Where a visitor goes (default /join). */
  href?: string;
};

/**
 * The site's main call to action, aware of who is looking: a visitor is invited to join, someone
 * signed in who hasn't finished is taken back to where they stopped, and a member is taken to
 * their pass instead of being asked to join a community they are already in.
 */
export function JoinButton({ children, href = '/join', ...rest }: JoinButtonProps) {
  const session = useSession();
  if (session.state === 'member')
    return (
      <Button {...rest} href="/me">
        {SESSION_COPY.member}
      </Button>
    );
  if (session.state === 'no-member')
    return (
      <Button {...rest} href="/join?step=lane">
        {SESSION_COPY.finish}
      </Button>
    );
  return (
    <Button {...rest} href={href}>
      {children ?? SESSION_COPY.visitor}
    </Button>
  );
}
