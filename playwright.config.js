// @ts-check
const { defineConfig, devices } = require('@playwright/test');

/**
 * Playwright Configuration for SuperBinder Browser Tests
 * @see https://playwright.dev/docs/test-configuration
 * 
 * IMPORTANT: E2E tests require the server to be running.
 * Start the server with: npm start
 * Then run tests with: npm run test:e2e
 */
module.exports = defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 1,
  workers: process.env.CI ? 1 : undefined,
  timeout: 30000,
  expect: {
    timeout: 5000,
  },
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['list'],
  ],
  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:3000',
    trace: 'on-first-retry',
    // Screenshot options: 'off' | 'on' | 'only-on-failure'
    // Use SCREENSHOT=on env var to capture all screenshots
    screenshot: process.env.SCREENSHOT === 'on' ? 'on' : 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 10000,
    navigationTimeout: 15000,
  },
  
  /* Output folders for screenshots and other artifacts */
  outputDir: 'test-results',
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  /* Auto-start server before running E2E tests */
  webServer: {
    command: 'npm start',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
    stdout: 'pipe',
    stderr: 'pipe',
  },
});
