// @vitest-environment jsdom
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, test, vi } from 'vitest';
import { LanePicker } from '@/components/join/LanePicker';

afterEach(cleanup);

describe('LanePicker — a real radiogroup (§11)', () => {
  test('three lanes, named by their rooms', () => {
    render(<LanePicker value={null} onCommit={() => {}} />);
    expect(screen.getByRole('radiogroup', { name: 'Pick your lane' })).toBeInTheDocument();
    const radios = screen.getAllByRole('radio');
    expect(radios).toHaveLength(3);
    expect(radios[0]).toHaveAccessibleName(/FRAME KOOTAM/);
    expect(radios[1]).toHaveAccessibleName(/CUT KOOTAM/);
    expect(radios[2]).toHaveAccessibleName(/SOMETHING ELSE/);
  });

  test('arrow keys move focus and the checked lane', async () => {
    render(<LanePicker value={null} onCommit={() => {}} />);
    const [frame, cut] = screen.getAllByRole('radio');
    frame!.focus();
    await userEvent.keyboard('{ArrowRight}');
    expect(cut).toHaveFocus();
    expect(cut).toHaveAttribute('aria-checked', 'true');
    expect(frame).toHaveAttribute('aria-checked', 'false');
  });

  test('only the checked (or first) lane is in the tab order', () => {
    render(<LanePicker value="editor" onCommit={() => {}} />);
    const tabbable = screen.getAllByRole('radio').map((r) => r.getAttribute('tabindex'));
    expect(tabbable).toEqual(['-1', '0', '-1']);
  });

  test('space on CUT KOOTAM commits the editor lane', async () => {
    const onCommit = vi.fn();
    render(<LanePicker value={null} onCommit={onCommit} />);
    screen.getAllByRole('radio')[1]!.focus();
    await userEvent.keyboard(' ');
    await waitFor(() => expect(onCommit).toHaveBeenCalledWith('editor'), { timeout: 2000 });
  });

  test('a click commits too', async () => {
    const onCommit = vi.fn();
    render(<LanePicker value={null} onCommit={onCommit} />);
    await userEvent.click(screen.getAllByRole('radio')[0]!);
    await waitFor(() => expect(onCommit).toHaveBeenCalledWith('creator'), { timeout: 2000 });
  });

  test('SOMETHING ELSE asks what they do, 2–60 characters', async () => {
    const onCommit = vi.fn();
    render(<LanePicker value={null} onCommit={onCommit} />);
    await userEvent.click(screen.getAllByRole('radio')[2]!);
    const input = await screen.findByRole('textbox', { name: /what do you do/i });
    await userEvent.type(input, 'x');
    await userEvent.click(screen.getByRole('button', { name: /continue/i }));
    expect(onCommit).not.toHaveBeenCalled();
    expect(input).toHaveAttribute('aria-invalid', 'true');
    await userEvent.clear(input);
    await userEvent.type(input, 'DOP');
    await userEvent.click(screen.getByRole('button', { name: /continue/i }));
    expect(onCommit).toHaveBeenCalledWith('other', 'DOP');
  });
});
