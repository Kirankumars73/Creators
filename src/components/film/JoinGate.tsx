import { Button } from '@/components/ui/Button';
import { SectionCard } from './SectionCard';
import { sectionTitle } from './sections';

export function JoinGate() {
  return (
    <section id="join" data-on="rosso" className="relative bg-rosso px-4 py-28 text-chalk md:px-10 md:py-40">
      {/* A rosso card would vanish on the rosso field: this one cuts in ink. */}
      <SectionCard id="join" tone="ink" />
      <p className="sr-only">{sectionTitle('join')}</p>
      <h2 className="text-hero">
        <span className="block">TAKE</span> <span className="block">YOUR</span> <span className="block">PLACE.</span>
      </h2>
      <div className="mt-12 flex flex-col items-start gap-5">
        <Button href="/join" variant="ink">
          Join the kootam
        </Button>
        {/* Small text never sits directly on rosso: it fails AA in any color. */}
        <p className="text-label bg-ink px-3 py-2 text-chalk">GOOGLE SIGN-IN · 30 SECONDS · NO SPAM, EVER</p>
      </div>
    </section>
  );
}
