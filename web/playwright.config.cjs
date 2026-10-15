const { defineConfig } = require('@playwright/test');
module.exports = defineConfig({
  testDir: './tests',
  timeout: 45_000,
  retries: 1,
  use: { baseURL: 'http://127.0.0.1:3000', headless: true, browserName:'chromium' },
  webServer: {
    command: 'npm run dev',
    url: 'http://127.0.0.1:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 90_000
  },
  reporter: 'list'
});
