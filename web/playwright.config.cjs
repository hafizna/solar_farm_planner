const { defineConfig } = require('@playwright/test');
const port = Number(process.env.PORT || 3000);
module.exports = defineConfig({
  testDir: './tests',
  testMatch: '**/*.spec.cjs',
  timeout: 45_000,
  retries: 1,
  use: { baseURL: `http://127.0.0.1:${port}`, headless: true, browserName:'chromium' },
  webServer: {
    command: 'npm run dev',
    url: `http://127.0.0.1:${port}`,
    reuseExistingServer: !process.env.CI,
    timeout: 90_000
  },
  reporter: 'list'
});
