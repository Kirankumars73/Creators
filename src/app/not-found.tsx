import Link from 'next/link';
import { Star } from '@/components/brand/Star';

export default function NotFound() {
  return (
    <main className="flex min-h-dvh flex-col items-start justify-center gap-6 px-4 md:px-10">
      <p className="text-label text-chalk-mute">404 · NO SUCH SCENE</p>
      <h1 className="text-title text-chalk">Cut. This frame isn’t in the film.</h1>
      <Link href="/" className="text-label inline-flex min-h-11 items-center gap-2 border-b border-chalk-dim text-chalk hover:border-chalk">
        <Star size={12} /> Back to the start
      </Link>
    </main>
  );
}
