'use client';

import { useState } from 'react';
import { Button, buttonClasses } from '@/components/ui/Button';
import { brand } from '@/config/brand';
import { chromeIntentUrl, type InAppInfo } from '@/lib/join/in-app-browser';

type SignInProps = {
  inApp: InAppInfo;
  /** This page's URL on the origin the visitor is actually on, handed to the external browser. */
  currentUrl: string;
  /** The OAuth round-trip came back with an error. */
  error?: boolean;
  /** False on a copy with no Supabase settings (a fresh clone, a preview without env). */
  configured?: boolean;
};

const PRIVACY = 'We read your name, email and profile photo. Nothing else. We never post anything.';
const APP_NAME = {
  instagram: 'Instagram',
  facebook: 'Facebook',
  threads: 'Threads',
  tiktok: 'TikTok',
  snapchat: 'Snapchat',
  linkedin: 'LinkedIn',
  webview: 'This app',
} as const;

export function SignIn({ inApp, currentUrl, error = false, configured = true }: SignInProps) {
  const [pending, setPending] = useState(false);
  const [failed, setFailed] = useState(error);

  if (inApp.inApp) return <InAppEscape inApp={inApp} currentUrl={currentUrl} />;
  if (!configured) return <NotConfigured />;

  async function signIn() {
    setPending(true);
    setFailed(false);
    // supabase-js is only fetched when someone actually taps the button.
    const { createBrowserSupabase } = await import('@/lib/supabase/browser');
    const supabase = createBrowserSupabase();
    const result = supabase
      ? await supabase.auth.signInWithOAuth({
          provider: 'google',
          // Back to wherever they are (production, a preview, localhost), never a build-time guess.
          options: { redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent('/join?step=lane')}` },
        })
      : { error: new Error('not configured') };
    // On success the browser is already leaving for Google.
    if (result.error) {
      setFailed(true);
      setPending(false);
    }
  }

  return (
    <div className="flex flex-col items-start gap-5">
      {failed ? (
        <p role="alert" className="border-l-[3px] border-rosso bg-graphite px-4 py-3 font-sans text-sm text-chalk">
          Sign-in didn’t go through. Nothing was saved. Try again.
        </p>
      ) : null}
      <Button variant="chalk" onClick={signIn} disabled={pending} aria-busy={pending} className="border-2 border-print/15 shadow-[0_10px_24px_-14px_var(--print)]">
        <GoogleMark />
        Continue with Google
      </Button>
      <p className="max-w-sm text-[0.875rem] font-medium leading-relaxed text-chalk-dim">{PRIVACY}</p>
    </div>
  );
}

/** Google's "G", as Google's sign-in branding asks for on a "Continue with Google" button. */
function GoogleMark() {
  return (
    <svg aria-hidden="true" viewBox="0 0 48 48" className="size-6 shrink-0">
      <path fill="#4285F4" d="M45.1 24.5c0-1.6-.1-2.8-.4-4.1H24v7.7h12.1c-.2 2-1.6 5-4.6 7l-.1.3 6.6 5.1.5.1c4.2-3.9 6.6-9.6 6.6-16.1" />
      <path fill="#34A853" d="M24 46c6 0 11-2 14.6-5.4l-7-5.4c-1.9 1.3-4.4 2.2-7.6 2.2-5.8 0-10.8-3.9-12.5-9.2l-.3.1-6.9 5.3-.1.3C7.8 41.1 15.3 46 24 46" />
      <path fill="#FBBC05" d="M11.5 28.2c-.5-1.4-.7-2.8-.7-4.2s.3-2.9.7-4.2v-.3l-7-5.4-.2.1C2.8 17.2 2 20.5 2 24s.8 6.8 2.3 9.8z" />
      <path fill="#EA4335" d="M24 10.6c4.1 0 6.9 1.8 8.5 3.3l6.2-6.1C34.9 4.3 30 2 24 2 15.3 2 7.8 7 4.3 14.2l7.1 5.6C13.2 14.5 18.2 10.6 24 10.6" />
    </svg>
  );
}

/** Honest about a copy that can't sign anyone in, and points at the one that can. */
function NotConfigured() {
  const live = `${brand.liveUrl}/join`;
  return (
    <div role="status" className="flex max-w-md flex-col items-start gap-4 border-l-[3px] border-mustard bg-graphite px-5 py-4">
      <p className="font-sans text-sm text-chalk">Sign-in isn’t set up on this copy of the site.</p>
      <p className="text-body text-chalk-dim">
        Join on{' '}
        <a href={live} className="inline-flex min-h-11 items-center text-chalk underline underline-offset-4">
          {brand.liveUrl.replace(/^https:\/\//, '')}
        </a>
      </p>
      <p className="font-sans text-xs leading-relaxed text-chalk-mute">Running it yourself? Add the Supabase values to .env.local — see the README.</p>
    </div>
  );
}

function InAppEscape({ inApp, currentUrl }: { inApp: InAppInfo; currentUrl: string }) {
  const app = APP_NAME[inApp.app ?? 'webview'];
  const browser = inApp.platform === 'ios' ? 'Safari' : inApp.platform === 'android' ? 'Chrome' : 'your browser';
  return (
    <div className="flex flex-col items-start gap-5">
      <h2 className="text-title text-chalk">Open this in {browser}.</h2>
      <p className="text-body max-w-md text-chalk-dim">
        {app}’s browser won’t let Google sign you in. {browser === 'your browser' ? 'Your browser' : browser} will.
      </p>
      {inApp.platform === 'android' ? (
        <>
          <a href={chromeIntentUrl(currentUrl)} className={buttonClasses('poster')}>
            Open in Chrome
          </a>
          <p className="text-body max-w-md text-chalk-dim">If that does nothing, tap ⋮ at the top right and pick Open in Chrome.</p>
        </>
      ) : (
        <p className="text-body max-w-md text-chalk">
          Tap <span aria-label="the three-dot menu">•••</span> at the top right, then <strong>Open in external browser</strong>.
        </p>
      )}
      <CopyLink url={currentUrl} browser={browser} />
      <p className="max-w-sm text-[0.875rem] font-medium leading-relaxed text-chalk-dim">{PRIVACY}</p>
    </div>
  );
}

function CopyLink({ url, browser }: { url: string; browser: string }) {
  const [state, setState] = useState<'idle' | 'copied' | 'manual'>('idle');
  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setState('copied');
    } catch {
      setState('manual');
    }
  }
  return (
    <div className="flex flex-col items-start gap-2">
      <Button variant="ghost" onClick={copy}>
        Copy link
      </Button>
      <p aria-live="polite" className="font-sans text-sm text-chalk-dim">
        {state === 'copied' ? `Link copied. Paste it into ${browser}.` : null}
      </p>
      {state === 'manual' ? (
        <input
          readOnly
          value={url}
          aria-label="Page link"
          onFocus={(e) => e.currentTarget.select()}
          className="w-full max-w-md border-b border-chalk-dim bg-graphite px-3 py-2 font-sans text-sm text-chalk"
        />
      ) : null}
    </div>
  );
}
