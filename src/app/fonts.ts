import { Anek_Malayalam, Anton, Archivo, Geist, Geist_Mono } from 'next/font/google';

// Self-hosted at build by next/font — no render-blocking font CDN (§4.2). Only the faces the
// first screen needs (Anton, Geist, Geist Mono for the scrubber/slate) are preloaded; a late
// mono swap measurably shifted layout.
const anton = Anton({ weight: '400', subsets: ['latin'], display: 'swap', variable: '--font-anton' });
const archivo = Archivo({ subsets: ['latin'], weight: '700', display: 'swap', variable: '--font-archivo', preload: false });
const geistSans = Geist({ subsets: ['latin'], display: 'swap', variable: '--font-geist-sans' });
const geistMono = Geist_Mono({ subsets: ['latin'], display: 'swap', variable: '--font-geist-mono' });
const anek = Anek_Malayalam({ subsets: ['malayalam'], axes: ['wdth'], display: 'swap', variable: '--font-anek', preload: false });

export const fontVariables = [anton, archivo, geistSans, geistMono, anek].map((f) => f.variable).join(' ');
