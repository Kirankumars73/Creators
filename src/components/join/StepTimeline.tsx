import { ClipBlock } from '@/components/brand/ClipBlock';
import type { Lane } from '@/config/brand';
import type { JoinStep } from '@/lib/join/step';

const STEPS: { id: JoinStep; n: string; word: string }[] = [
  { id: 'signin', n: '01', word: 'SIGN IN' },
  { id: 'lane', n: '02', word: 'LANE' },
  { id: 'details', n: '03', word: 'DETAILS' },
  { id: 'reveal', n: '04', word: 'EXPORT' },
];

/** The scrubber's Editing Bay twin: four clips, the lane clip fills with the chosen color (§7). */
export function StepTimeline({ step, lane }: { step: JoinStep; lane: Lane | null }) {
  const at = STEPS.findIndex((s) => s.id === step);
  return (
    <nav aria-label="Join progress">
      <ol className="grid grid-cols-4 gap-1 border-y border-rule py-2">
        {STEPS.map((s, i) => (
          <li key={s.id}>
            <ClipBlock
              label={s.n}
              lane={s.id === 'lane' && lane ? lane : 'neutral'}
              active={i <= at}
              aria-current={i === at ? 'step' : undefined}
              className="w-full"
            >
              <span className="text-label hidden truncate text-chalk-dim sm:inline">{s.word}</span>
              <span className="sr-only sm:hidden">{s.word}</span>
            </ClipBlock>
          </li>
        ))}
      </ol>
    </nav>
  );
}
