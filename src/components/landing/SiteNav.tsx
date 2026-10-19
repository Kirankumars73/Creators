'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { Star } from '@/components/brand/Star';
import { Wordmark } from '@/components/brand/Wordmark';
import { Button } from '@/components/ui/Button';
import { brand } from '@/config/brand';
import { NAV_LINKS } from '@/config/landing';

/**
 * The top bar on every public page: wordmark, the page's main links, sign in and join. A 2px
 * rosso hairline under it tracks scroll (a CSS scroll-driven animation, no JavaScript). On phones
 * the links fold into a full-screen rosso menu whose links stagger in (after React Bits'
 * StaggeredMenu); it traps focus and closes on Escape.
 */
export function SiteNav() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const menu = useRef<HTMLDivElement>(null);
  const toggle = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (!open) return;
    const panel = menu.current;
    const opener = toggle.current;
    const focusables = () => [...(panel?.querySelectorAll<HTMLElement>('a, button') ?? [])];
    focusables()[0]?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
      if (e.key !== 'Tab') return;
      const els = focusables();
      const first = els[0];
      const last = els[els.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last?.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first?.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    document.documentElement.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.documentElement.style.overflow = '';
      opener?.focus();
    };
  }, [open]);

  return (
    <>
      <a
        href="#main"
        className="text-label fixed left-3 top-3 z-[90] inline-flex min-h-11 -translate-y-[200%] items-center bg-chalk px-4 text-ink focus:translate-y-0"
      >
        Skip to content
      </a>
      <header
        data-scrolled={scrolled || undefined}
        className="site-nav fixed inset-x-0 top-0 z-50 border-b border-transparent transition-[background-color,border-color] duration-200 data-[scrolled]:border-rule data-[scrolled]:bg-ink/85 data-[scrolled]:backdrop-blur-md"
      >
        <div className="mx-auto flex h-16 max-w-[90rem] items-center justify-between gap-6 px-4 md:h-[4.5rem] md:px-10">
          <Link href="/" aria-label={`${brand.name} — home`} className="inline-flex min-h-11 items-center">
            <Wordmark size="xs" />
          </Link>
          <nav aria-label="Main" className="hidden items-center gap-1 lg:flex">
            {NAV_LINKS.map((l) => (
              <Link key={l.href} href={l.href} className="nav-link text-label inline-flex min-h-11 items-center px-3 text-chalk-dim hover:text-chalk">
                {l.label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-2 md:gap-4">
            <Link href="/me" className="text-label hidden min-h-11 items-center px-2 text-chalk-dim hover:text-chalk sm:inline-flex">
              Sign in
            </Link>
            <Button href="/join" size="sm">
              Join
            </Button>
            <button
              ref={toggle}
              type="button"
              aria-expanded={open}
              aria-controls="mobile-menu"
              onClick={() => setOpen(true)}
              className="text-label inline-flex min-h-11 items-center gap-2 border border-rule px-3 text-chalk lg:hidden"
            >
              Menu <Star size={10} />
            </button>
          </div>
        </div>
        <span aria-hidden="true" className="scroll-progress absolute inset-x-0 bottom-[-1px] h-[2px] origin-left bg-rosso" />
      </header>

      {open ? (
        <div
          id="mobile-menu"
          ref={menu}
          role="dialog"
          aria-modal="true"
          aria-label="Menu"
          data-on="rosso"
          className="menu-in fixed inset-0 z-[80] flex flex-col overflow-y-auto bg-rosso px-4 pb-10 pt-4"
        >
          <div className="flex items-center justify-between">
            <Wordmark size="xs" />
            <button type="button" onClick={() => setOpen(false)} className="text-label inline-flex min-h-11 items-center border border-chalk px-3 text-chalk">
              Close
            </button>
          </div>
          <nav aria-label="Mobile" className="mt-12 flex flex-col">
            {[{ href: '/join', label: 'Join the kootam' }, ...NAV_LINKS, { href: '/me', label: 'Sign in' }].map((l, i) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                style={{ animationDelay: `${80 + i * 45}ms` }}
                className="menu-link flex min-h-14 items-baseline gap-3 border-b border-chalk/30 py-2 font-display text-[clamp(2.5rem,12vw,4rem)] uppercase leading-none text-chalk"
              >
                <span className="font-mono text-xs tracking-[0.14em] text-chalk/80">{String(i + 1).padStart(2, '0')}</span>
                {l.label}
              </Link>
            ))}
          </nav>
          <p className="text-label mt-auto pt-10 text-chalk">{brand.region} · {brand.year}</p>
        </div>
      ) : null}
    </>
  );
}
