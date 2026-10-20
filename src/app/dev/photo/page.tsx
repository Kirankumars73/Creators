import { notFound } from 'next/navigation';
import { SiteNav } from '@/components/landing/SiteNav';
import { PhotoPanel } from '@/components/me/PhotoPanel';
import { ProfileSwitch } from '@/components/me/ProfileSwitch';
import { stubOk } from './actions';

export const metadata = { title: 'Photo panel preview', robots: { index: false } };

// Dev-only: the /me photo and profile controls with stubbed actions (no sign-in). 404 in production.
export default function DevPhoto() {
  if (process.env.NODE_ENV === 'production') notFound();
  return (
    <div data-surface="wall" data-lane="creator" className="limewash min-h-dvh text-chalk">
      <SiteNav />
      <main className="mx-auto flex max-w-3xl flex-col gap-10 px-4 pb-24 pt-28 md:pt-36">
        <PhotoPanel hasPhoto={false} photoPublic={false} onWall hasGoogle instagram="anu.shoots" setPhotoPublic={stubOk} />
        <ProfileSwitch handle="anu.shoots" initial onWall setProfilePublic={stubOk} />
      </main>
    </div>
  );
}
