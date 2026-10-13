import { defineConfig, devices } from '@playwright/test';

const PORT = 3100;

// Public pages must work with no Supabase configured, so the e2e server gets none.
export default defineConfig({
  testDir: 'tests/e2e',
  timeout: 30_000,
  fullyParallel: true,
  // One local Next server + N Chromiums: past 4 workers, frame timing starves and motion tests flake.
  workers: process.env.CI ? 2 : 4,
  reporter: [['list']],
  use: { baseURL: `http://localhost:${PORT}` },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: `pnpm build && pnpm start -p ${PORT}`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: false,
    timeout: 300_000,
    env: { NEXT_PUBLIC_SITE_URL: `http://localhost:${PORT}` },
  },
});
