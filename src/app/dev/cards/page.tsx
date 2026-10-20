import { notFound } from 'next/navigation';
import { CardsPreview } from './CardsPreview';

// Dev-only: the heavy cards on a blank wall, one per room, for eyeballing. 404 in production.
export default function DevCards() {
  if (process.env.NODE_ENV === 'production') notFound();
  return <CardsPreview />;
}
