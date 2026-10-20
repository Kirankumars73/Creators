import type { Metadata, Viewport } from 'next';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { SiteFooter } from '@/components/landing/SiteFooter';
import { SiteNav } from '@/components/landing/SiteNav';
import { brand } from '@/config/brand';
import { TOKENS } from '@/config/tokens';

export const metadata: Metadata = {
  title: 'Privacy',
  description: `What ${brand.name} collects, why, and who can see it.`,
};

// The public pages are the wall: light, so the browser chrome matches it.
export const viewport: Viewport = { themeColor: TOKENS.wall, colorScheme: 'light' };

const UPDATED = '21 October 2026';

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="border-t border-rule py-10">
      <h2 className="text-subhead text-chalk">{title}</h2>
      <div className="text-body mt-4 flex max-w-prose flex-col gap-4 text-chalk-dim">{children}</div>
    </section>
  );
}

// [ASK GOUTHAM] This page speaks for him: `pnpm check:launch` blocks until brand.privacyReviewed.
export default function PrivacyPage() {
  const ig = (
    <a href={brand.instagramUrl} className="text-chalk underline underline-offset-4">
      @{brand.founder.instagram}
    </a>
  );
  const contact = brand.contact ? (
    <>
        {' '}
        or email{' '}
        <a href={`mailto:${brand.contact}`} className="text-chalk underline underline-offset-4">
          {brand.contact}
        </a>
    </>
  ) : null;

  return (
    <div data-surface="wall" className="limewash min-h-dvh text-chalk">
      <SiteNav />
      <main id="main" className="mx-auto max-w-[90rem] px-4 pb-28 pt-28 md:px-10 md:pt-36">
        <header>
          <p className="text-label text-chalk-mute">Updated {UPDATED}</p>
          <h1 className="text-title mt-4 text-chalk">Privacy</h1>
          <p className="text-body mt-6 max-w-prose text-chalk-dim">Short version: we keep what it takes to put you in the right room. No ads, no tracking, and we never post anything.</p>
        </header>

        <Section title="Who runs this">
          <p>
            {brand.name} is a community for Kerala’s content creators and video editors, run by {brand.founder.fullName.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase())}. For anything on this page, message {ig} on Instagram{contact}.
          </p>
        </Section>

        <Section title="What we collect">
          <p>
            <strong className="text-chalk">From Google, when you sign in:</strong> your name, email address and profile photo link. Nothing else, and we never post anything on your behalf.
          </p>
          <p>
            <strong className="text-chalk">From the join form:</strong> your display name, Instagram handle, city or district, your lane (creator, editor or something else) and what you wrote about it, the tags you pick, an optional portfolio link, and whether you want to be on the member wall.
          </p>
          <p>
            <strong className="text-chalk">When you open your links:</strong> a timestamped note that they were shown to you. It’s how we stop abuse (at most 10 requests in 10 minutes).
          </p>
          <p>
            <strong className="text-chalk">When you signed up and last signed in</strong>, which the sign-in service records.
          </p>
          <p>
            <strong className="text-chalk">A sign-in cookie</strong> so you stay signed in. No analytics, no ads, no tracking pixels.
          </p>
          <p>
            <strong className="text-chalk">A photo</strong>, only if you add one from{' '}
            <Link href="/me" className="text-chalk underline underline-offset-4">
              your pass page
            </Link>
            : either one you upload or your Google profile photo. It is kept privately and used on your own pass. It shows on your public page and in the member list only if you switch that on, and you can switch it off or remove it any time. We re-save it as a plain picture, which removes any location or camera data hidden inside.
          </p>
          <p>
            <strong className="text-chalk">If you send a brand brief</strong> (no sign-in needed): the brand name, your name, email, optional phone number and what you wrote. Only the admins see it, and only to reply to you and pass the brief to the right members.
          </p>
        </Section>

        <Section title="Why">
          <p>To put you in the right WhatsApp room, to show you on the member wall if you said yes, to make your member pass, and so the community can be kept safe — members who break The Code can be flagged or removed.</p>
        </Section>

        <Section title="Who can see it">
          <p>
            <strong className="text-chalk">Everyone</strong>, only if you’re on the member wall: your display name, Instagram handle, lane and the date you joined. Untick “Show me on the member wall” and none of it is public.
          </p>
          <p>
            <strong className="text-chalk">Your public profile page</strong>, only if you turn it on (when you join, or from{' '}
            <Link href="/me" className="text-chalk underline underline-offset-4">
              your pass page
            </Link>
            ): it adds your district, the crafts you picked, what you do and your portfolio link to your page at /m/your-handle and to the member filters. Switch it off any time; members who joined before it existed start with it off.
          </p>
          <p>
            <strong className="text-chalk">The admins ({brand.founder.shortName}, and the person who runs this site for him):</strong> your email address and the name on your Google account, plus your name, handle, lane, city, tags, portfolio link, what you wrote, when you joined and when you last signed in — in the admin panel and its export. That includes anyone who signed in but didn’t finish joining.
          </p>
          <p>Your email is never shown publicly — only the admins see it. Your member pass (name, handle, lane) is made for you to share — only you decide where it goes.</p>
        </Section>

        <Section title="Where it lives">
          <p>Supabase runs the database and sign-in, on servers in Mumbai, India. Vercel hosts the site, also from Mumbai. Google handles sign-in. We don’t sell your data or share it with anyone else.</p>
          <p>Joining the WhatsApp groups happens inside WhatsApp. This site doesn’t send your details to WhatsApp; WhatsApp’s own privacy policy covers what happens there.</p>
        </Section>

        <Section title="Your choices">
          <p>
            You can change your lane once from{' '}
            <Link href="/me" className="text-chalk underline underline-offset-4">
              your pass page
            </Link>
            . To change your wall setting, correct your details, or delete everything we hold about you, message {ig}
            {contact}. Ask and we’ll delete your record. Deleting it doesn’t take you out of the WhatsApp groups — leave those in WhatsApp.
          </p>
        </Section>

        <Section title="Age">
          <p>This is for people 13 and over — the minimum age for WhatsApp and Instagram in India.</p>
        </Section>

        <Section title="Changes">
          <p>If this page changes, the date at the top changes with it.</p>
        </Section>
      </main>
      <SiteFooter />
    </div>
  );
}
