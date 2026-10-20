// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, test } from 'vitest';
import { MemberCard } from '@/components/members/MemberCard';

afterEach(cleanup);

describe('MemberCard (the directory collector card)', () => {
  test('shows name, handle and room', () => {
    render(<MemberCard name="Anu Krishna" instagram="anu.k" role="editor" roomLabel="Editors" hasPhoto={false} />);
    expect(screen.getByText('Anu Krishna')).toBeInTheDocument();
    expect(screen.getByText('@anu.k')).toBeInTheDocument();
    expect(screen.getByText('Editors')).toBeInTheDocument();
  });

  test('without a photo: their initials, no image', () => {
    const { container } = render(<MemberCard name="Anu Krishna" instagram="anu.k" role="creator" roomLabel="Content creators" hasPhoto={false} />);
    expect(screen.getByText('AK')).toBeInTheDocument();
    expect(container.querySelector('img')).toBeNull();
  });

  test('with a photo: the small copy, lazy unless it is near the top of the page', () => {
    const { container, rerender } = render(<MemberCard name="Anu" instagram="anu.k" role="other" roomLabel="Something else" hasPhoto />);
    const img = container.querySelector('img')!;
    expect(img.getAttribute('src')).toBe('/api/photo/by/anu.k?size=thumb');
    expect(img.getAttribute('loading')).toBe('lazy');
    rerender(<MemberCard name="Anu" instagram="anu.k" role="other" roomLabel="Something else" hasPhoto eager />);
    expect(container.querySelector('img')!.getAttribute('loading')).toBe('eager');
  });
});
