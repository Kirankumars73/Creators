import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, vi } from 'vitest';

/** jsdom can't decode or draw images; stand in for just enough of it that the crop dialog can finish. */
export function stubCropDecoding() {
  vi.stubGlobal('createImageBitmap', async () => ({ width: 800, height: 1000, close() {} }));
  // Only the 2d context (drawing the crop); WebGL stays "unavailable", as in a plain jsdom.
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockImplementation(((type: string) => (type === '2d' ? { drawImage() {} } : null)) as never);
  vi.spyOn(HTMLCanvasElement.prototype, 'toBlob').mockImplementation((cb) => cb(new Blob([new Uint8Array(500)], { type: 'image/jpeg' })));
}

/** After picking a file, the member frames it; this accepts the default framing. */
export async function confirmCrop() {
  const button = await screen.findByRole('button', { name: 'Use this photo' });
  await waitFor(() => expect(button).toBeEnabled());
  await userEvent.click(button);
}
