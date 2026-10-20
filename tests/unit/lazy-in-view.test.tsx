// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, test, vi } from 'vitest';
import { LazyInView } from '@/components/cards/LazyInView';

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe('LazyInView: the heavy card only loads when it can run and is about to be seen', () => {
  test('starts as the plain fallback', () => {
    render(<LazyInView fallback={<p>plain</p>}>heavy</LazyInView>);
    expect(screen.getByText('plain')).toBeInTheDocument();
    expect(screen.queryByText('heavy')).toBeNull();
  });

  test('a browser without WebGL 2 keeps the plain card, and never even watches the scroll', async () => {
    vi.resetModules();
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(null);
    const io = vi.fn();
    vi.stubGlobal('IntersectionObserver', io);
    const { LazyInView: Fresh } = await import('@/components/cards/LazyInView');
    render(<Fresh fallback={<p>plain</p>}>heavy</Fresh>);
    expect(screen.getByText('plain')).toBeInTheDocument();
    expect(io).not.toHaveBeenCalled();
  });

  test('with WebGL, scrolling near it swaps in the heavy card', async () => {
    vi.resetModules();
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue({} as never);
    let fire: (e: { isIntersecting: boolean }[]) => void = () => {};
    vi.stubGlobal(
      'IntersectionObserver',
      class {
        constructor(cb: typeof fire) {
          fire = cb;
        }
        observe() {}
        disconnect() {}
      },
    );
    const { LazyInView: Fresh } = await import('@/components/cards/LazyInView');
    const { act } = await import('@testing-library/react');
    render(<Fresh fallback={<p>plain</p>}>heavy</Fresh>);
    act(() => fire([{ isIntersecting: true }]));
    expect(screen.getByText('heavy')).toBeInTheDocument();
    expect(screen.queryByText('plain')).toBeNull();
  });
});
