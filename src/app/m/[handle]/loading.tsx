import { SiteNav } from '@/components/landing/SiteNav';
import { Bone, LoadingPage } from '@/components/ui/Loading';

export default function Loading() {
  return (
    <div data-surface="wall" className="limewash min-h-dvh text-chalk">
      <SiteNav />
      <main id="main" className="mx-auto max-w-[90rem] px-4 pb-24 pt-28 md:px-10 md:pt-36">
        <LoadingPage label="Loading the member page">
          <div className="grid grid-cols-1 items-start gap-12 lg:grid-cols-[22rem_minmax(0,1fr)] lg:gap-20">
            <span aria-hidden="true" className="mx-auto block aspect-[1.6/2.25] w-full max-w-[15rem] rounded-[0.8rem] bg-chalk/10 motion-safe:animate-pulse" />
            <div className="flex flex-col gap-5">
              <Bone className="h-16 w-4/5 md:h-24" />
              <Bone className="h-5 w-2/3 max-w-md" />
              <Bone className="h-11 w-full max-w-xs" />
            </div>
          </div>
        </LoadingPage>
      </main>
    </div>
  );
}
