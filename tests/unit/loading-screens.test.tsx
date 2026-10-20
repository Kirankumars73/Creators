// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, test } from 'vitest';
import { BadgeSkeleton } from '@/components/cards/BadgeSkeleton';
import { MemberCard } from '@/components/members/MemberCard';
import { CardGridSkeleton, JoinLoading, LoadingPage, MeLoading } from '@/components/ui/Loading';

afterEach(cleanup);

describe('loading screens', () => {
  test('each announces itself once to screen readers, and its shapes are silent', () => {
    for (const ui of [<MeLoading key="a" />, <JoinLoading key="b" />, <LoadingPage key="c" label="Loading the members"><CardGridSkeleton /></LoadingPage>, <BadgeSkeleton key="d" role="editor" />]) {
      const { container, unmount } = render(ui);
      expect(container.querySelectorAll('[role="status"]')).toHaveLength(1);
      unmount();
    }
  });

  test('the member list skeleton is a grid of card shapes', () => {
    const { container } = render(<CardGridSkeleton count={6} />);
    expect(container.querySelectorAll('li')).toHaveLength(6);
  });

  test('a member card keeps their initials under the photo while it loads, then fades the photo in', () => {
    const { container } = render(<MemberCard name="Anu Krishna" instagram="anu.k" role="editor" roomLabel="Editors" hasPhoto />);
    expect(screen.getByText('AK')).toBeInTheDocument();
    const img = container.querySelector('img')!;
    expect(img.className).toContain('opacity-0');
    img.dispatchEvent(new Event('load'));
  });
});
