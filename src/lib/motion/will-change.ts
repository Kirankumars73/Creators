import type { gsap } from 'gsap';

/**
 * §10.3: will-change goes on when an animation starts and comes off when it ends.
 * Left on, it pins a compositor layer per element — why "animated" sites die on mid-range Android.
 */
export function withWillChange<T extends gsap.core.Animation>(anim: T, targets: Element[], props = 'transform'): T {
  const set = (value: string) => {
    for (const t of targets) (t as HTMLElement).style.willChange = value;
  };
  const chain = (event: 'onStart' | 'onComplete' | 'onInterrupt', value: string) => {
    const previous = anim.eventCallback(event) as (() => void) | null;
    anim.eventCallback(event, () => {
      set(value);
      previous?.();
    });
  };
  chain('onStart', props);
  chain('onComplete', '');
  chain('onInterrupt', '');
  return anim;
}
