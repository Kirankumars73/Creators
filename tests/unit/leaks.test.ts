import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, describe, expect, test } from 'vitest';
import { scanForLeaks } from '../../scripts/check-leaks.mjs';

const dirs: string[] = [];
function fixture(files: Record<string, string>): string {
  const root = mkdtempSync(join(tmpdir(), 'leaks-'));
  dirs.push(root);
  for (const [path, body] of Object.entries(files)) {
    mkdirSync(join(root, path, '..'), { recursive: true });
    writeFileSync(join(root, path), body);
  }
  return root;
}
afterEach(() => {
  for (const d of dirs.splice(0)) rmSync(d, { recursive: true, force: true });
});

describe('scanForLeaks', () => {
  test('finds a sentinel invite link buried in a nested chunk', async () => {
    const root = fixture({ 'static/chunks/app/page.js': 'x="https://chat.whatsapp.com/LEAKSENTINEL1"' });
    expect(await scanForLeaks([root], ['LEAKSENTINEL1'])).toEqual([{ file: join(root, 'static/chunks/app/page.js'), needle: 'LEAKSENTINEL1' }]);
  });

  test('a clean tree reports nothing', async () => {
    const root = fixture({ 'static/chunks/a.js': 'console.log(1)', 'server/app/index.html': '<html></html>' });
    expect(await scanForLeaks([root], ['LEAKSENTINEL1', 'chat.whatsapp.com'])).toEqual([]);
  });

  test('only scans the listed extensions when given', async () => {
    const root = fixture({ 'server/app/route.js': 'process.env.WA_COMMUNITY_URL', 'server/app/index.html': 'clean' });
    expect(await scanForLeaks([root], ['WA_COMMUNITY_URL'], ['.html', '.rsc'])).toEqual([]);
  });

  test('a missing directory is not an error', async () => {
    expect(await scanForLeaks([join(tmpdir(), 'does-not-exist-leaks')], ['x'])).toEqual([]);
  });
});
