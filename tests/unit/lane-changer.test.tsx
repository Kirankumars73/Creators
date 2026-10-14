// @vitest-environment jsdom
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, test, vi } from 'vitest';
import { LaneChanger } from '@/components/me/LaneChanger';

vi.mock('next/navigation', () => ({ useRouter: () => ({ refresh: vi.fn() }) }));
afterEach(cleanup);

describe('LaneChanger', () => {
  test('says plainly that the old WhatsApp room is not left automatically', () => {
    render(<LaneChanger current="creator" changeLane={vi.fn()} />);
    expect(screen.getByText(/stay in CONTENT CREATORS on WhatsApp until you leave it there/i)).toBeInTheDocument();
  });

  test('offers only the other lanes and moves to the chosen one', async () => {
    const changeLane = vi.fn(async () => ({ ok: true as const }));
    render(<LaneChanger current="creator" changeLane={changeLane} />);
    expect(screen.queryByRole('radio', { name: /CONTENT CREATORS/ })).toBeNull();
    await userEvent.click(screen.getByRole('radio', { name: /EDITORS/ }));
    await userEvent.click(screen.getByRole('button', { name: /move to editors/i }));
    await waitFor(() => expect(changeLane).toHaveBeenCalledWith({ role: 'editor' }));
  });

  test('a spent change is explained', async () => {
    const changeLane = vi.fn(async () => ({ ok: false as const, reason: 'used' as const }));
    render(<LaneChanger current="creator" changeLane={changeLane} />);
    await userEvent.click(screen.getByRole('radio', { name: /EDITORS/ }));
    await userEvent.click(screen.getByRole('button', { name: /move to/i }));
    expect(await screen.findByRole('alert')).toHaveTextContent(/already used your one move/i);
  });
});
