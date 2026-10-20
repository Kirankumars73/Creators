import { SiteNav } from '@/components/landing/SiteNav';
import { Bone, CardGridSkeleton, LoadingPage } from '@/components/ui/Loading';

export default function Loading() {
  return (
    <div data-surface="wall" className="limewash min-h-dvh text-chalk">
      <SiteNav />
      <main id="main" className="mx-auto max-w-[90rem] px-4 pb-28 pt-32 md:px-10 md:pt-40">
        <LoadingPage label="Loading the members">
          <Bone className="h-14 w-2/3 max-w-lg md:h-20" />
          <Bone className="h-5 w-full max-w-md" />
          <div aria-hidden="true" className="flex flex-wrap gap-2">
            {['w-28', 'w-44', 'w-24', 'w-36'].map((w) => (
              <Bone key={w} className={`h-11 rounded-full ${w}`} />
            ))}
          </div>
          <CardGridSkeleton />
        </LoadingPage>
      </main>
    </div>
  );
}
