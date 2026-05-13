import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: false,
  retries: 0,
  timeout: 15000,
  use: {
    baseURL: 'http://localhost:5174',
    headless: true,
    browserName: 'chromium',
    viewport: { width: 390, height: 844 },
    hasTouch: true,
  },
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5174',
    reuseExistingServer: true,
  },
});
