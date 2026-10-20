import { beforeEach, describe, expect, test, vi } from 'vitest';

const next = vi.hoisted(() => ({ updateTag: vi.fn(), revalidateTag: vi.fn() }));
vi.mock('next/cache', () => ({ updateTag: next.updateTag, revalidateTag: next.revalidateTag, cacheTag: vi.fn(), cacheLife: vi.fn() }));

import { refreshOnOk, refreshWallFromRoute, refreshWallNow } from '@/lib/wall/revalidate';
import { WALL_TAG } from '@/lib/wall/tags';

beforeEach(() => {
  next.updateTag.mockClear();
  next.revalidateTag.mockClear();
});

describe('refreshing the cached member wall', () => {
  test('from a server action it expires the wall data so the member sees their own change at once', () => {
    refreshWallNow();
    expect(next.updateTag).toHaveBeenCalledWith(WALL_TAG);
  });

  test('from a route handler (where updateTag is not allowed) it expires it immediately, serving nothing stale', () => {
    refreshWallFromRoute();
    expect(next.revalidateTag).toHaveBeenCalledWith(WALL_TAG, { expire: 0 });
  });
});

describe('refreshOnOk: only a change that happened refreshes the wall', () => {
  test('a successful change refreshes, and hands the result back untouched', () => {
    const refresh = vi.fn();
    const result = { ok: true as const, extra: 1 };
    expect(refreshOnOk(result, refresh)).toBe(result);
    expect(refresh).toHaveBeenCalledTimes(1);
  });

  test('a refused or failed change refreshes nothing', () => {
    const refresh = vi.fn();
    refreshOnOk({ ok: false as const, reason: 'invalid' }, refresh);
    expect(refresh).not.toHaveBeenCalled();
  });

  test('a refresh that itself throws never turns a saved change into a failure', () => {
    const result = { ok: true as const };
    expect(refreshOnOk(result, () => { throw new Error('cache down'); })).toBe(result);
  });

  test('by default it uses the server-action refresh', () => {
    refreshOnOk({ ok: true });
    expect(next.updateTag).toHaveBeenCalledWith(WALL_TAG);
  });
});
