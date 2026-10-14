// @vitest-environment jsdom
import { cleanup, render } from '@testing-library/react';
import { afterEach, describe, expect, test } from 'vitest';
import { LaneFrame } from '@/components/join/LaneFrame';

afterEach(cleanup);

describe('LaneFrame', () => {
  test('a creator frame shows the viewfinder, an editor frame the timeline — never an empty gate', () => {
    for (const [lane, craft] of [['creator', 'viewfinder'], ['editor', 'timeline']] as const) {
      const { container, unmount } = render(<LaneFrame lane={lane} />);
      const art = container.querySelector('svg[data-craft-art]');
      expect(art).not.toBeNull();
      expect(art!.getAttribute('data-craft-art')).toBe(craft);
      expect(art!.getAttribute('aria-hidden')).toBe('true');
      // The art lives on its own screen; the title and copy are never laid over it.
      const monitor = art!.closest('[data-monitor]');
      expect(monitor).not.toBeNull();
      expect(monitor!.contains(container.querySelector('h3'))).toBe(false);
      unmount();
    }
  });

  test('"something else" stays a plain, straight text card', () => {
    const { container } = render(<LaneFrame lane="other" />);
    expect(container.querySelector('svg[data-craft-art]')).toBeNull();
    expect(container.querySelector('article')!.className).not.toMatch(/rotate/);
  });
});
