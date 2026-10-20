import type { Metadata, Viewport } from 'next';
import ClickSpark from '@/components/bits/ClickSpark';
import { SmoothScroll } from '@/components/motion/SmoothScroll';
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
  openGraph: { type: 'website', locale: 'en_IN', siteName: brand.name, title: brand.name, description: brand.description },
  twitter: { card: 'summary_large_image', title: brand.name, description: brand.description },
};

export const viewport: Viewport = {
  themeColor: TOKENS.ink,
  colorScheme: 'dark',
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="en" data-surface="poster" className={fontVariables} suppressHydrationWarning>
      <body>
        {/* React Bits ClickSpark: a burst of mustard sparks wherever someone taps (off under reduced motion). */}
        <ClickSpark sparkColor={TOKENS.mustard} sparkCount={10} sparkRadius={22} sparkSize={9} duration={450}>
          {children}
        </ClickSpark>
        <SmoothScroll />
        <Grain />
      </body>
    </html>
  );
}
