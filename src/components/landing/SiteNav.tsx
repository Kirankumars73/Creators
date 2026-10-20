'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { Wordmark } from '@/components/brand/Wordmark';
import { Button } from '@/components/ui/Button';
import { brand } from '@/config/brand';
import { NAV_LINKS } from '@/config/landing';

/**
 * The top bar on every public page: wordmark, the main links, sign in and join. Transparent on
 * the wall until you scroll. On phones the links fold into a full-screen red menu that traps
 * focus and closes on Escape.
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
        className="fixed left-3 top-3 z-[90] inline-flex min-h-11 -translate-y-[200%] items-center bg-print px-4 font-semibold text-paper focus:translate-y-0"
      >
        Skip to content
      </a>
      <header
        data-surface="wall"
        data-scrolled={scrolled || undefined}
        className="fixed inset-x-0 top-0 z-50 bg-transparent text-chalk transition-[background-color,box-shadow] duration-200 data-[scrolled]:bg-wall/90 data-[scrolled]:shadow-[0_1px_0_var(--wall-rule)] data-[scrolled]:backdrop-blur-md"
      >
        <div className="mx-auto flex h-16 max-w-[90rem] items-center justify-between gap-6 px-4 md:h-[4.5rem] md:px-10">
          <Link href="/" aria-label={`${brand.name} — home`} className="inline-flex min-h-11 items-center">
            <Wordmark size="xs" />
          </Link>
          <nav aria-label="Main" className="hidden items-center gap-1 lg:flex">
            {NAV_LINKS.map((l) => (
              <Link key={l.href} href={l.href} className="inline-flex min-h-11 items-center rounded-full px-3.5 text-[0.9375rem] font-semibold text-chalk-dim hover:bg-chalk/5 hover:text-chalk">
                {l.label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-2 md:gap-3">
            <Link href="/me" className="hidden min-h-11 items-center px-2 text-[0.9375rem] font-semibold text-chalk-dim hover:text-chalk sm:inline-flex">
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
              className="inline-flex min-h-11 items-center rounded-full border-2 border-chalk/20 px-4 text-sm font-semibold text-chalk lg:hidden"
            >
              Menu
            </button>
          </div>
        </div>
      </header>

      {open ? (
        <div
          id="mobile-menu"
          ref={menu}
          role="dialog"
          aria-modal="true"
          aria-label="Menu"
          data-lenis-prevent=""
          data-on="rosso"
          className="menu-in fixed inset-0 z-[80] flex flex-col overflow-y-auto bg-rosso px-4 pb-10 pt-4 text-paper"
        >
          <div className="flex items-center justify-between">
            <span data-surface="night" className="text-chalk">
              <Wordmark size="xs" />
            </span>
            <button type="button" onClick={() => setOpen(false)} className="inline-flex min-h-11 items-center rounded-full border-2 border-paper px-4 text-sm font-semibold">
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
                className="menu-link flex min-h-14 items-center py-1 font-display text-[clamp(2.5rem,12vw,4rem)] uppercase leading-none"
              >
                {l.label}
              </Link>
            ))}
          </nav>
        </div>
      ) : null}
    </>
  );
}
