import { notFound } from 'next/navigation';
import { ClipBlock } from '@/components/brand/ClipBlock';
import { CropMarks } from '@/components/brand/CropMarks';
import { Odometer } from '@/components/brand/Odometer';
import { SlateStripes } from '@/components/brand/SlateStripes';
import { Star } from '@/components/brand/Star';
import { Timecode } from '@/components/brand/Timecode';
import { Wordmark } from '@/components/brand/Wordmark';
import { LANES, brand } from '@/config/brand';

export const metadata = { title: 'Specimen', robots: { index: false } };

// Dev-only proof sheet for every primitive at real size.
export default function Specimen() {
  if (process.env.NODE_ENV === 'production') notFound();

  return (
    <main className="mx-auto flex max-w-6xl flex-col gap-16 px-4 py-12">
      <h1 className="text-label text-chalk-dim">Specimen — dev only</h1>

      <section className="flex flex-wrap items-end gap-10">
        {(['sm', 'md', 'lg'] as const).map((s) => (
          <Wordmark key={s} size={s} />
        ))}
        <Wordmark size="lg" lane="creator" />
        <Wordmark size="lg" lane="editor" />
      </section>
      <section>
        <Wordmark size="xl" />
      </section>

      <section className="flex flex-col gap-4">
        <p className="text-hero">We&apos;d rather</p>
        <p className="text-title">The Code</p>
        <p className="text-subhead">Editors get cropped out of the credits.</p>
        <p className="text-body max-w-prose text-chalk-dim">{brand.description}</p>
        <p className="text-label text-chalk-mute">Label · Geist Mono · +0.14em</p>
        <p className="text-ml text-2xl">ക്രിയേറ്റേഴ്‌സ് കൂട്ടം — നിങ്ങൾ കൂട്ടത്തിലാണ്.</p>
      </section>

      <section className="flex items-center gap-6">
        <Star size={16} />
        <Star size={32} />
        <Star size={72} className="halation-mustard" />
        <Timecode frames={37} className="text-chalk-mute" />
        <span className="text-title text-chalk">
          <Odometer value={147} digits={6} label="Members" />
        </span>
      </section>

      <section className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {LANES.map((lane) => (
          <ClipBlock key={lane} lane={lane} label={brand.rooms[lane].label} />
        ))}
        <ClipBlock label="03 WHO'S INSIDE" active={false} />
        <ClipBlock as="button" lane="editor" label="04 THE CODE" />
      </section>

      <section className="flex flex-wrap gap-8">
        <div className="group relative grid aspect-[9/16] w-40 place-items-center bg-carbon">
          <CropMarks draw tone="lane" />
          <span className="text-label">hover me</span>
        </div>
        <div className="relative grid aspect-[9/16] w-40 place-items-center bg-graphite">
          <CropMarks />
          <span className="text-label">static</span>
        </div>
        <div className="w-80">
          <SlateStripes />
        </div>
      </section>
    </main>
  );
}
