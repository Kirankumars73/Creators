// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { PassPreview } from '@/components/join/PassPreview';
import { PassShowcase } from '@/components/landing/PassShowcase';
import { Signoff } from '@/components/landing/Signoff';

beforeEach(() => {
  URL.createObjectURL = vi.fn(() => 'blob:photo');
  URL.revokeObjectURL = vi.fn();
});
afterEach(cleanup);

describe('Signoff: only the word', () => {
  test('is the Malayalam sign-off and nothing else: no label, no explanation, no founder name', () => {
    const { container } = render(<Signoff />);
    expect(container.textContent).toBe('നമോവാധം');
    expect(container.textContent).not.toMatch(/gowtham|video|thank|see you/i);
  });
});

describe('PassShowcase: the sample card in each room', () => {
  test('starts in the creators room and switches when a room is chosen', async () => {
    render(<PassShowcase />);
    const group = screen.getByRole('group', { name: 'See the card in each room' });
    const [creators, editors, other] = ['Content creators', 'Editors', 'Something else'].map((n) => screen.getByRole('button', { name: n }));
    expect(group).toContainElement(creators!);
    expect(creators).toHaveAttribute('aria-pressed', 'true');
    await userEvent.click(editors!);
    expect(editors).toHaveAttribute('aria-pressed', 'true');
    expect(creators).toHaveAttribute('aria-pressed', 'false');
    await userEvent.click(other!);
    expect(screen.getByLabelText('A sample member card')).toHaveAttribute('data-lane', 'other');
  });
});

describe('PassPreview (the join page card)', () => {
  test('before anything is picked: a blank card that says to pick a room', () => {
    render(<PassPreview lane={null} />);
    expect(screen.getByText('PICK YOUR ROOM')).toBeInTheDocument();
    expect(screen.getByText('Your name')).toBeInTheDocument();
    expect(screen.getByText('Your badge, taking shape')).toBeInTheDocument();
  });

  test('shows the room, name, handle and initials as they are filled in', () => {
    render(<PassPreview lane="editor" name="Anu Krishna" handle="@anu.k" />);
    expect(screen.getByText('EDITORS')).toBeInTheDocument();
    expect(screen.getByText('Anu Krishna')).toBeInTheDocument();
    expect(screen.getByText('@anu.k')).toBeInTheDocument();
    expect(screen.getByText('AK')).toBeInTheDocument();
  });

  test('a chosen photo fills the card in place of the initials', () => {
    const file = new File([new Uint8Array(10)], 'me.jpg', { type: 'image/jpeg' });
    const { container } = render(<PassPreview lane="creator" name="Anu" photo={{ choice: { kind: 'file', file }, show: false }} />);
    expect(container.querySelector('img')?.getAttribute('src')).toBe('blob:photo');
    expect(screen.queryByText('A')).toBeNull();
  });
});
