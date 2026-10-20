// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { PhotoPicker } from '@/components/join/PhotoPicker';
import type { JoinPhoto } from '@/lib/photos/client';

beforeEach(() => {
  URL.createObjectURL = vi.fn(() => 'blob:preview');
  URL.revokeObjectURL = vi.fn();
});
afterEach(cleanup);

const file = (name = 'me.jpg', type = 'image/jpeg', size = 1000) => new File([new Uint8Array(size)], name, { type });
const setup = (props: Partial<Parameters<typeof PhotoPicker>[0]> = {}) => {
  const onChange = vi.fn<(p: JoinPhoto | null) => void>();
  render(<PhotoPicker value={null} onChange={onChange} googlePhotoUrl="https://lh3.googleusercontent.com/a/x=s96-c" canShow {...props} />);
  return onChange;
};

describe('PhotoPicker (the join form)', () => {
  test('it is optional, and starts with nothing chosen and nothing to show', () => {
    setup();
    expect(screen.getByText('Photo (optional)')).toBeInTheDocument();
    expect(screen.queryByRole('checkbox')).toBeNull();
    expect(screen.queryByRole('img')).toBeNull();
  });

  test('picking a file reports it as private (not shown) until they tick the box', async () => {
    const onChange = setup();
    await userEvent.upload(screen.getByLabelText('Add a photo'), file());
    expect(onChange).toHaveBeenCalledWith({ choice: { kind: 'file', file: expect.any(File) }, show: false });
  });

  test('the Google photo is offered only when the account has one, and picks the google source', async () => {
    const onChange = setup();
    await userEvent.click(screen.getByRole('button', { name: 'Use my Google photo' }));
    expect(onChange).toHaveBeenCalledWith({ choice: { kind: 'google' }, show: false });
    cleanup();
    setup({ googlePhotoUrl: null });
    expect(screen.queryByRole('button', { name: 'Use my Google photo' })).toBeNull();
  });

  test('a non-image or oversized file is refused right here, in plain words, and nothing is chosen', async () => {
    const onChange = setup();
    await userEvent.upload(screen.getByLabelText('Add a photo'), file('a.pdf', 'application/pdf'), { applyAccept: false });
    expect(await screen.findByText(/jpeg, png or webp/i)).toBeInTheDocument();
    await userEvent.upload(screen.getByLabelText('Add a photo'), file('big.jpg', 'image/jpeg', 7 * 1024 * 1024));
    expect(await screen.findByText(/under 6 MB/i)).toBeInTheDocument();
    expect(onChange).not.toHaveBeenCalled();
  });

  test('with a photo chosen it shows it, offers "show my photo" (unticked), and can be removed', async () => {
    const onChange = setup({ value: { choice: { kind: 'file', file: file() }, show: false } });
    expect(screen.getByRole('img', { name: 'Your photo' })).toHaveAttribute('src', 'blob:preview');
    const box = screen.getByRole('checkbox', { name: /show my photo/i });
    expect(box).not.toBeChecked();
    await userEvent.click(box);
    expect(onChange).toHaveBeenLastCalledWith({ choice: expect.objectContaining({ kind: 'file' }), show: true });
    await userEvent.click(screen.getByRole('button', { name: 'Remove photo' }));
    expect(onChange).toHaveBeenLastCalledWith(null);
  });

  test('someone who is off the member wall can add a photo for their pass but isn’t offered to show it', () => {
    setup({ value: { choice: { kind: 'google' }, show: false }, canShow: false });
    expect(screen.getByRole('img', { name: 'Your photo' })).toHaveAttribute('src', 'https://lh3.googleusercontent.com/a/x=s96-c');
    expect(screen.queryByRole('checkbox')).toBeNull();
    expect(screen.getByText(/stays on your own pass/i)).toBeInTheDocument();
  });
});
