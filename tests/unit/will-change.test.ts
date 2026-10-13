// @vitest-environment jsdom
import { gsap } from 'gsap';
import { describe, expect, test } from 'vitest';
import { withWillChange } from '@/lib/motion/will-change';

describe('withWillChange (§10.3)', () => {
  test('sets will-change when the animation starts and removes it when it ends', () => {
    const el = document.createElement('div');
    document.body.append(el);
    const tween = withWillChange(gsap.to(el, { x: 10, duration: 1, paused: true }), [el]);
    expect(el.style.willChange).toBe('');
    tween.progress(0.5);
    expect(el.style.willChange).toBe('transform');
    tween.progress(1);
    expect(el.style.willChange).toBe('');
  });

  test('keeps callbacks the animation already had', () => {
    const el = document.createElement('div');
    let completed = false;
    const tween = withWillChange(gsap.to(el, { x: 10, duration: 1, paused: true, onComplete: () => (completed = true) }), [el], 'transform, opacity');
    tween.progress(0.2);
    expect(el.style.willChange).toBe('transform, opacity');
    tween.progress(1);
    expect(completed).toBe(true);
  });
});
