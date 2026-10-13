import { defineConfig } from '@playwright/test';

// Runs against the live site: BASE_URL=https://… pnpm test:deployed
// Reads WA_* from .env.local (same values as production) to assert what must NOT appear.
try {
  process.loadEnvFile('.env.local');
} catch {
  // no local env: the tests that need it will say so
}

export default defineConfig({
  testDir: 'tests/deployed',
  timeout: 30_000,
  reporter: [['list']],
  use: { baseURL: process.env.BASE_URL },
});
