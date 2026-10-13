import type { Metadata, Viewport } from 'next';
import { Grain } from '@/components/texture/Grain';
import { brand } from '@/config/brand';
import { TOKENS } from '@/config/tokens';
import { siteUrl } from '@/lib/site';
import { fontVariables } from './fonts';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { template: brand.titleTemplate, default: brand.name },
  description: brand.description,
};

const PRE_PAINT = `(function(){var d=document.documentElement;d.classList.add('js');try{if(sessionStorage.getItem('ck:cold-open')||matchMedia('(prefers-reduced-motion: reduce)').matches)d.classList.add('no-cold-open')}catch(e){d.classList.add('no-cold-open')}})();`;

export const viewport: Viewport = {
  themeColor: TOKENS.ink,
  colorScheme: 'dark',
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="en" data-surface="poster" className={fontVariables} suppressHydrationWarning>
      <head>
        {/* Before first paint: mark JS, and skip the cold open on repeat visits, reduced motion, or blocked storage. */}
        <script dangerouslySetInnerHTML={{ __html: PRE_PAINT }} />
      </head>
      <body>
        {children}
        <Grain />
      </body>
    </html>
  );
}
