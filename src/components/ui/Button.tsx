import Link from 'next/link';
import type { ComponentPropsWithoutRef, ReactNode } from 'react';
import { CropMarks } from '@/components/brand/CropMarks';

type Variant = 'poster' | 'ghost' | 'ink' | 'bay' | 'chalk';

type Size = 'md' | 'sm';

const BASE =
  'group relative inline-flex items-center justify-center gap-3 rounded-hairline font-display text-[1.5rem] uppercase leading-none tracking-[-0.01em] transition-colors duration-[var(--dur-cut)] ease-cut disabled:cursor-not-allowed disabled:opacity-50';

// Both sizes keep the 24px label: below it, chalk on rosso drops under AA.
const SIZES: Record<Size, string> = {
  md: 'min-h-14 px-6',
  sm: 'min-h-11 px-4',
};

// Labels are Anton at 24px: the large-text threshold, so chalk on rosso (4.11:1) passes.
const VARIANTS: Record<Variant, string> = {
  poster: 'bg-rosso text-chalk halation-rosso hover:bg-rosso-deep',
  ghost: 'border border-chalk-dim text-chalk hover:border-chalk',
  ink: 'bg-ink text-chalk focus-visible:outline-chalk',
  bay: 'bg-lane text-ink',
  chalk: 'bg-chalk text-ink hover:bg-mustard',
};

/** Button styling for elements that can't be <Button>, e.g. an `intent://` anchor. */
export function buttonClasses(variant: Variant = 'poster', className = '', size: Size = 'md'): string {
  return `${BASE} ${SIZES[size]} ${VARIANTS[variant]} ${className}`;
}

type Common = { variant?: Variant; size?: Size; children: ReactNode; className?: string };
type ButtonProps =
  | (Common & { href: string } & Omit<ComponentPropsWithoutRef<typeof Link>, 'href' | 'className' | 'children'>)
  | (Common & { href?: undefined } & Omit<ComponentPropsWithoutRef<'button'>, 'className' | 'children'>);

export function Button({ variant = 'poster', size = 'md', children, className = '', ...rest }: ButtonProps) {
  const classes = buttonClasses(variant, className, size);
  const marks = variant === 'poster' ? <CropMarks draw tone="chalk" offset={6} /> : null;
  if ('href' in rest && rest.href !== undefined) {
    return (
      <Link className={classes} {...rest}>
        {marks}
        {children}
      </Link>
    );
  }
  const { type = 'button', ...buttonRest } = rest as ComponentPropsWithoutRef<'button'>;
  return (
    <button type={type} className={classes} {...buttonRest}>
      {marks}
      {children}
    </button>
  );
}
