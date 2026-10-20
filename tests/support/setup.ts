import '@testing-library/jest-dom/vitest';

// jsdom has no matchMedia. Default: no reduced-motion preference, fine pointer.
if (typeof window !== 'undefined' && !window.matchMedia) {
  window.matchMedia = (query: string) =>
    ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: () => {},
      removeEventListener: () => {},
      addListener: () => {},
      removeListener: () => {},
      dispatchEvent: () => false,
    }) as MediaQueryList;
}

// jsdom has no IntersectionObserver / ResizeObserver; the React Bits components use both to
// pause off screen. A no-op stand-in: nothing in jsdom is ever "visible" to animate.
if (typeof window !== 'undefined') {
  class NoopObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
    takeRecords() {
      return [];
    }
  }
  window.IntersectionObserver ??= NoopObserver as unknown as typeof IntersectionObserver;
  window.ResizeObserver ??= NoopObserver as unknown as typeof ResizeObserver;
}
