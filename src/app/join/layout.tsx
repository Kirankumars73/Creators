import { SiteNav } from '@/components/landing/SiteNav';

// Joining happens on the wall too (2026-10-20): one site, the nav always one tap away.
// overflow-x: clip keeps frames sliding off-screen from ever widening the page.
export default function JoinLayout({ children }: LayoutProps<'/join'>) {
  return (
    <div data-surface="wall" className="limewash min-h-dvh overflow-x-clip text-chalk">
      <SiteNav />
      {children}
    </div>
  );
}
