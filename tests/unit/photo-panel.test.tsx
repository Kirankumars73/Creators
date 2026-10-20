// @vitest-environment jsdom
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { PhotoPanel } from '@/components/me/PhotoPanel';
import { confirmCrop, stubCropDecoding } from '../support/crop';

const setPhotoPublic = vi.fn(async (value: boolean) => ({ ok: true as const, value }));
const fetchMock = vi.fn();

beforeEach(() => {
  stubCropDecoding();
  vi.stubGlobal('fetch', fetchMock);
  fetchMock.mockReset();
  fetchMock.mockResolvedValue(new Response('{"ok":true}', { status: 200 }));
  setPhotoPublic.mockClear();
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

const base = { hasPhoto: false, photoPublic: false, onWall: true, hasGoogle: true, instagram: 'anu', setPhotoPublic };
const file = () => new File([new Uint8Array(1000)], 'me.jpg', { type: 'image/jpeg' });

describe('PhotoPanel (/me)', () => {
  test('with no photo: upload or use the Google photo, and no switch yet', () => {
    render(<PhotoPanel {...base} />);
    expect(screen.getByLabelText('Upload a photo')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Use my Google photo' })).toBeInTheDocument();
    expect(screen.queryByRole('switch')).toBeNull();
  });

  test('no Google photo on the account: that option isn’t offered', () => {
    render(<PhotoPanel {...base} hasGoogle={false} />);
    expect(screen.queryByRole('button', { name: 'Use my Google photo' })).toBeNull();
  });

  test('uploading posts the file to /api/photo/me and then shows the photo', async () => {
    render(<PhotoPanel {...base} />);
    await userEvent.upload(screen.getByLabelText('Upload a photo'), file());
    await confirmCrop();
    await waitFor(() => expect(fetchMock).toHaveBeenCalled());
    const [url, init] = fetchMock.mock.calls[0]!;
    expect(url).toBe('/api/photo/me');
    expect(init.method).toBe('POST');
    expect(init.body).toBeInstanceOf(FormData);
    expect(await screen.findByRole('img', { name: 'Your photo' })).toHaveAttribute('src', expect.stringContaining('/api/photo/me'));
    expect(screen.getByRole('switch')).toBeInTheDocument();
  });

  test('the Google button asks the server to use the signed-in user’s own photo', async () => {
    render(<PhotoPanel {...base} />);
    await userEvent.click(screen.getByRole('button', { name: 'Use my Google photo' }));
    await waitFor(() => expect(fetchMock).toHaveBeenCalled());
    const [, init] = fetchMock.mock.calls[0]!;
    expect(JSON.parse(init.body)).toEqual({ source: 'google' });
  });

  test('a refused upload says why, in plain words, and keeps the old state', async () => {
    fetchMock.mockResolvedValue(new Response('{"error":"not_an_image"}', { status: 415 }));
    render(<PhotoPanel {...base} />);
    await userEvent.upload(screen.getByLabelText('Upload a photo'), file());
    await confirmCrop();
    expect(await screen.findByText(/jpeg, png or webp/i)).toBeInTheDocument();
    expect(screen.queryByRole('img', { name: 'Your photo' })).toBeNull();
  });

  test('with a photo: the switch is off by default and says so; turning it on calls the action', async () => {
    render(<PhotoPanel {...base} hasPhoto />);
    const sw = screen.getByRole('switch');
    expect(sw).toHaveAttribute('aria-checked', 'false');
    expect(screen.getByText('Your photo is hidden from everyone else')).toBeInTheDocument();
    await userEvent.click(sw);
    expect(setPhotoPublic).toHaveBeenCalledWith(true);
    expect(sw).toHaveAttribute('aria-checked', 'true');
  });

  test('if the switch fails it goes back and says so', async () => {
    setPhotoPublic.mockResolvedValueOnce({ ok: false, reason: 'unknown' } as never);
    render(<PhotoPanel {...base} hasPhoto />);
    await userEvent.click(screen.getByRole('switch'));
    await waitFor(() => expect(screen.getByRole('switch')).toHaveAttribute('aria-checked', 'false'));
    expect(screen.getByText(/didn’t save/i)).toBeInTheDocument();
  });

  test('removing asks the server, then the photo is gone', async () => {
    render(<PhotoPanel {...base} hasPhoto photoPublic />);
    await userEvent.click(screen.getByRole('button', { name: 'Remove photo' }));
    await waitFor(() => expect(fetchMock).toHaveBeenCalledWith('/api/photo/me', expect.objectContaining({ method: 'DELETE' })));
    await waitFor(() => expect(screen.queryByRole('img', { name: 'Your photo' })).toBeNull());
  });

  test('a member who is off the wall can keep a photo for their pass but can’t show it', () => {
    render(<PhotoPanel {...base} hasPhoto onWall={false} />);
    expect(screen.queryByRole('switch')).toBeNull();
    expect(screen.getByText(/not on the member wall/i)).toBeInTheDocument();
  });
});
