const pad = (n: number, width = 2) => String(n).padStart(width, '0');

/** HH:MM:SS:FF. PAL (25fps) by default — Kerala shoots PAL. */
export function formatTimecode(frames: number, fps = 25): string {
  const total = Math.max(0, Math.floor(frames));
  const ff = total % fps;
  const totalSeconds = Math.floor(total / fps);
  const ss = totalSeconds % 60;
  const mm = Math.floor(totalSeconds / 60) % 60;
  const hh = Math.floor(totalSeconds / 3600);
  return `${pad(hh)}:${pad(mm)}:${pad(ss)}:${pad(ff)}`;
}

/** Zero-padded counter, e.g. 147 → "000147". */
export function padCount(n: number, width = 6): string {
  return pad(Math.max(0, Math.floor(n)), width);
}

/** Fixed-width digit array for odometers; values past the width pin to all nines. */
export function toDigits(n: number, width: number): number[] {
  const max = 10 ** width - 1;
  const clamped = Math.min(max, Math.max(0, Math.floor(n)));
  return [...padCount(clamped, width)].map(Number);
}
