import type { Metadata, Viewport } from 'next';
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

export const viewport: Viewport = {
  themeColor: TOKENS.ink,
  colorScheme: 'dark',
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="en" data-surface="poster" className={fontVariables}>
      <body>{children}</body>
    </html>
  );
}
