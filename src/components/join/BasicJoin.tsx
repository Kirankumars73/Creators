'use client';

// Phase 2 scaffolding: correct but unstyled. Replaced by JoinFlow in Phase 3.
import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import { submitMember } from '@/app/join/actions';
import { LANES, brand, type Lane } from '@/config/brand';
import { DISTRICTS, TAGS } from '@/config/join';
import type { InAppInfo } from '@/lib/join/in-app-browser';
import type { JoinStep } from '@/lib/join/step';
import { SignIn } from './SignIn';

type Props = {
  step: JoinStep;
  lane: Lane | null;
  userName: string | null;
  inApp: InAppInfo;
  siteUrl: string;
  currentUrl: string;
  authError: boolean;
};

export function BasicJoin({ step, lane, userName, inApp, siteUrl, currentUrl, authError }: Props) {
  if (step === 'signin') return <SignIn inApp={inApp} siteUrl={siteUrl} currentUrl={currentUrl} error={authError} />;
  if (step === 'lane') {
    return (
      <ul className="flex flex-col gap-3">
        {LANES.map((l) => (
          <li key={l}>
            <a className="text-label underline" href={`/join?step=details&lane=${l}`}>
              {brand.rooms[l].label} — {brand.rooms[l].name}
            </a>
          </li>
        ))}
      </ul>
    );
  }
  if (step === 'details' && lane) return <Details lane={lane} userName={userName} />;
  return <Reveal />;
}

function Details({ lane, userName }: { lane: Lane; userName: string | null }) {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    const f = new FormData(e.currentTarget);
    const result = await submitMember({
      role: lane,
      ...(lane === 'other' ? { roleOtherText: f.get('roleOtherText') } : {}),
      displayName: f.get('displayName'),
      instagram: f.get('instagram'),
      city: f.get('city'),
      tags: f.getAll('tags'),
      portfolioUrl: f.get('portfolioUrl'),
      showOnWall: f.get('showOnWall') === 'on',
      acceptedCode: f.get('acceptedCode') === 'on',
    });
    setPending(false);
    if (result.ok) {
      router.replace('/join');
      router.refresh();
    } else {
      setMessage(result.fieldErrors ? Object.entries(result.fieldErrors).map(([k, v]) => `${k}: ${v}`).join(' · ') : result.error);
    }
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-3 font-mono text-sm">
      {lane === 'other' ? <input name="roleOtherText" placeholder="What do you do?" className="bg-graphite p-2" /> : null}
      <input name="displayName" defaultValue={userName ?? ''} placeholder="Display name" className="bg-graphite p-2" />
      <input name="instagram" placeholder="Instagram handle" className="bg-graphite p-2" />
      <select name="city" className="bg-graphite p-2" defaultValue="">
        <option value="" disabled>
          City / district
        </option>
        {DISTRICTS.map((d) => (
          <option key={d}>{d}</option>
        ))}
      </select>
      {lane !== 'other'
        ? TAGS[lane].map((t) => (
            <label key={t}>
              <input type="checkbox" name="tags" value={t} /> {t}
            </label>
          ))
        : null}
      <input name="portfolioUrl" placeholder="Portfolio or reel link" className="bg-graphite p-2" />
      <label>
        <input type="checkbox" name="showOnWall" defaultChecked /> Show me on the member wall
      </label>
      <label>
        <input type="checkbox" name="acceptedCode" /> I&apos;ve read The Code and I&apos;m in
      </label>
      <button disabled={pending} className="bg-rosso p-2 text-chalk">
        Submit
      </button>
      {message ? <p role="alert">{message}</p> : null}
    </form>
  );
}

function Reveal() {
  const [links, setLinks] = useState<{ community: string; lane: string | null } | null>(null);
  const [error, setError] = useState<string | null>(null);
  async function get() {
    const res = await fetch('/api/invite', { method: 'POST' });
    const body = await res.json();
    if (res.ok) setLinks(body);
    else setError(body.error ?? String(res.status));
  }
  return (
    <div className="flex flex-col gap-3 font-mono text-sm">
      <button onClick={get} className="bg-rosso p-2 text-chalk">
        Get my links
      </button>
      {links ? (
        <ul>
          <li>
            <a href={links.community}>01 {brand.rooms.community.name}</a>
          </li>
          {links.lane ? (
            <li>
              <a href={links.lane}>02 your lane</a>
            </li>
          ) : null}
        </ul>
      ) : null}
      {error ? <p role="alert">{error}</p> : null}
    </div>
  );
}
