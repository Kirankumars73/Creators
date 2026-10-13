// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, test, vi } from 'vitest';
import { RollCallBoard } from '@/components/film/RollCallBoard';

vi.mock('@/components/film/ScrollFilm', () => ({ useScrollFilm: () => ({ ready: false, reduced: true, add: () => () => {} }) }));
afterEach(cleanup);

const counts = { total: 3, creators: 2, editors: 1, other: 0 };

describe('RollCallBoard (§6.7)', () => {
  test('at launch it never says "0 members" — it says scene one', () => {
    render(<RollCallBoard wall={[]} counts={{ total: 0, creators: 0, editors: 0, other: 0 }} />);
    expect(screen.getByText('ROLL CALL — SCENE 01, TAKE 01. The room is empty. Somebody has to be first.')).toBeInTheDocument();
    expect(screen.queryByText(/0 members/i)).toBeNull();
  });

  test('when Supabase is unreachable it says so, quietly (Review Focus 5)', () => {
    render(<RollCallBoard wall={null} counts={null} />);
    expect(screen.getByText(/signal lost/i)).toBeInTheDocument();
  });

  test('members show name, handle and a lane in words — never email', () => {
    const { container } = render(
      <RollCallBoard
        counts={counts}
        wall={[{ displayName: 'Gowtham Das', instagram: 'the.gowtham_das', role: 'editor', createdAt: '2026-10-14T02:00:00Z', isNew: true }]}
      />,
    );
    expect(screen.getByText('Gowtham Das')).toBeInTheDocument();
    expect(screen.getByText('@the.gowtham_das')).toBeInTheDocument();
    expect(screen.getByText('LANE 02')).toBeInTheDocument();
    expect(container.innerHTML).not.toMatch(/@example\.com|email/i);
  });

  test('the counts line reads out every lane', () => {
    render(<RollCallBoard wall={[]} counts={counts} />);
    for (const label of ['Members 3', 'Creators 2', 'Editors 1', 'Other 0']) expect(screen.getByText(label)).toBeInTheDocument();
  });
});
