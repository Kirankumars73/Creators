'use client';

import { useState } from 'react';
import { Button, buttonClasses } from '@/components/ui/Button';
import { chromeIntentUrl, type InAppInfo } from '@/lib/join/in-app-browser';

type SignInProps = {
  inApp: InAppInfo;
  /** This page's URL on the origin the visitor is actually on, handed to the external browser. */
  currentUrl: string;
  /** The OAuth round-trip came back with an error. */
  error?: boolean;
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

export function SignIn({ inApp, currentUrl, error = false }: SignInProps) {
  const [pending, setPending] = useState(false);
  const [failed, setFailed] = useState(error);

  if (inApp.inApp) return <InAppEscape inApp={inApp} currentUrl={currentUrl} />;

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
        <p role="alert" className="border-l-[3px] border-rosso bg-graphite px-4 py-3 font-mono text-sm text-chalk">
          Sign-in didn’t go through. Nothing was saved. Try again.
        </p>
      ) : null}
      <Button variant="poster" onClick={signIn} disabled={pending} aria-busy={pending}>
        Continue with Google
      </Button>
      <p className="max-w-sm font-mono text-[0.8125rem] leading-relaxed text-chalk-dim">{PRIVACY}</p>
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
      <p className="max-w-sm font-mono text-[0.8125rem] leading-relaxed text-chalk-dim">{PRIVACY}</p>
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
      <p aria-live="polite" className="font-mono text-sm text-chalk-dim">
        {state === 'copied' ? `Link copied. Paste it into ${browser}.` : null}
      </p>
      {state === 'manual' ? (
        <input
          readOnly
          value={url}
          aria-label="Page link"
          onFocus={(e) => e.currentTarget.select()}
          className="w-full max-w-md border-b border-chalk-dim bg-graphite px-3 py-2 font-mono text-sm text-chalk"
        />
      ) : null}
    </div>
  );
}
