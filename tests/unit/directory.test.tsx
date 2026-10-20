// @vitest-environment jsdom
import { cleanup, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, test } from 'vitest';
import { Directory } from '@/components/landing/Directory';
import type { WallMember } from '@/lib/wall/queries';

afterEach(cleanup);

const member = (over: Partial<WallMember>): WallMember => ({
  displayName: 'Anu K',
  instagram: 'anu.shoots',
  role: 'creator',
  createdAt: '2026-10-14T02:00:00Z',
  isNew: false,
  ...over,
});
const wall = [
  member({}),
  member({ displayName: 'Ravi Menon', instagram: 'ravicuts', role: 'editor', isNew: true }),
  member({ displayName: 'Meera', instagram: 'meera.writes', role: 'other' }),
];
const counts = { total: 3, creators: 1, editors: 1, other: 1 };
const cards = () => within(screen.getByRole('list')).queryAllByRole('link');

describe('Directory — the member wall, honest in every state', () => {
  test('at launch it never says "0 members" — it says scene one', () => {
    render(<Directory wall={[]} counts={{ total: 0, creators: 0, editors: 0, other: 0 }} />);
    expect(screen.getByText('Nobody’s on the wall yet. Join and be the first name on it.')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Join the kootam' })).toHaveAttribute('href', '/join');
    expect(screen.queryByText(/0 members/i)).toBeNull();
  });

  test('when Supabase is unreachable it says so, quietly', () => {
    render(<Directory wall={null} counts={null} />);
    expect(screen.getByText('The member list didn’t load. Refresh in a minute.')).toBeInTheDocument();
  });

  test('members show name, handle and room, link to Instagram — and never an email', () => {
    const { container } = render(<Directory wall={wall} counts={counts} />);
    expect(cards()).toHaveLength(3);
    const ravi = screen.getByText('Ravi Menon').closest('a')!;
    expect(ravi).toHaveAttribute('href', 'https://instagram.com/ravicuts');
    expect(ravi).toHaveAttribute('rel', 'noopener noreferrer');
    expect(within(ravi).getByText('Editors')).toBeInTheDocument();
    expect(within(ravi).getByText('New')).toBeInTheDocument();
    expect(container.innerHTML).not.toMatch(/@example\.com|email/i);
  });

  test('filtering by room and searching by handle narrow the wall', async () => {
    const user = userEvent.setup();
    render(<Directory wall={wall} counts={counts} />);
    await user.click(screen.getByRole('button', { name: /editors/i }));
    expect(screen.getByRole('button', { name: /editors/i })).toHaveAttribute('aria-pressed', 'true');
    expect(cards()).toHaveLength(1);
    await user.click(screen.getByRole('button', { name: /everyone/i }));
    await user.type(screen.getByRole('searchbox'), '@meera');
    expect(await screen.findByText('Meera')).toBeInTheDocument();
    expect(cards()).toHaveLength(1);
  });

  test('a search with no match says so instead of showing an empty grid', async () => {
    const user = userEvent.setup();
    render(<Directory wall={wall} counts={counts} />);
    await user.type(screen.getByRole('searchbox'), 'nobody-here');
    expect(await screen.findByText('Nobody on the wall matches that.')).toBeInTheDocument();
  });

  test('on the landing page it shows a slice and links to the full directory', () => {
    render(<Directory wall={wall} counts={counts} limit={2} />);
    expect(cards()).toHaveLength(2);
    expect(screen.getByRole('link', { name: 'See every member' })).toHaveAttribute('href', '/creators');
  });

  test('the counts are one plain sentence covering every room', () => {
    render(<Directory wall={wall} counts={counts} />);
    expect(screen.getByText('1 content creator, 1 editor and 1 other maker.')).toBeInTheDocument();
  });

  test('…and counts more than one in the plural', () => {
    render(<Directory wall={wall} counts={{ total: 9, creators: 5, editors: 3, other: 1 }} />);
    expect(screen.getByText('5 content creators, 3 editors and 1 other maker.')).toBeInTheDocument();
  });
});
