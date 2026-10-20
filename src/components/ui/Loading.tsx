import type { ReactNode } from 'react';

/** A soft pulsing bar or block: stands in for text or an image while it loads. */
export function Bone({ className = '' }: { className?: string }) {
  return <span aria-hidden="true" className={`block rounded-sm bg-chalk/10 motion-safe:animate-pulse ${className}`} />;
}

/**
 * What a page shows while its data loads: the real header and footer stay, only the content is
 * a skeleton, announced to screen readers as "loading" once.
 */
export function LoadingPage({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div role="status" aria-live="polite" aria-label={label} className="flex flex-col gap-8">
      <span className="sr-only">{label}</span>
      {children}
    </div>
  );
}

/** A grid of member-card shapes, for the member list. */
export function CardGridSkeleton({ count = 10 }: { count?: number }) {
  return (
    <ul aria-hidden="true" className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-5">
      {Array.from({ length: count }, (_, i) => (
        <li key={i} className="aspect-[4/5] rounded-[0.9rem] bg-chalk/10 motion-safe:animate-pulse" style={{ animationDelay: `${(i % 5) * 90}ms` }} />
      ))}
    </ul>
  );
}

/** /me while your pass loads: the card and a few panels. */
export function MeLoading() {
  return (
    <LoadingPage label="Loading your pass">
      <div className="grid grid-cols-1 gap-14 lg:grid-cols-[minmax(0,1fr)_19rem] lg:gap-16">
        <div className="flex flex-col gap-6">
          <Bone className="h-9 w-64" />
          <Bone className="h-40 w-full" />
          <Bone className="h-40 w-full" />
        </div>
        <span aria-hidden="true" className="order-first mx-auto block aspect-[0.72] w-full max-w-[19rem] rounded-[1rem] bg-chalk/10 motion-safe:animate-pulse lg:order-none" />
      </div>
    </LoadingPage>
  );
}

/** /join while the session is read: the four steps and the first panel. */
export function JoinLoading() {
  return (
    <LoadingPage label="Getting the join page ready">
      <div aria-hidden="true" className="flex items-center gap-6">
        {[0, 1, 2, 3].map((i) => (
          <span key={i} className="size-10 rounded-full bg-chalk/10 motion-safe:animate-pulse" />
        ))}
      </div>
      <Bone className="h-10 w-72" />
      <Bone className="h-14 w-64" />
    </LoadingPage>
  );
}
