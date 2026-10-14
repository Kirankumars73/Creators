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
    // Blank (not unset): Next never lets .env.local override a variable that is already defined.
    env: {
      NEXT_PUBLIC_SITE_URL: `http://localhost:${PORT}`,
      NEXT_PUBLIC_SUPABASE_URL: '',
      NEXT_PUBLIC_SUPABASE_ANON_KEY: '',
      SUPABASE_SERVICE_ROLE_KEY: '',
      WA_COMMUNITY_URL: '',
      WA_CREATORS_URL: '',
      WA_EDITORS_URL: '',
      WA_OTHER_URL: '',
      ADMIN_EMAILS: '',
    },
  },
});
