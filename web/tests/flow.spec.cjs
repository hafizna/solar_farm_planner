const { test, expect } = require('@playwright/test');

test('demo entry, national GI/RUPTL navigation, theme and logout', async ({ page }) => {
  // External tile services are not needed to verify application navigation.
  await page.route(/^https?:\/\/(?!127\.0\.0\.1:3000)/, route => route.abort());
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.goto('/');
  await expect(page.locator('#demoGate')).toBeVisible();
  await page.locator('#demoUserName').fill('Engineer Demo');
  await page.locator('#demoLoginForm button').click();
  await expect(page.locator('.home-intro')).toBeVisible();
  await page.locator('#rail [data-page="gi"]').click();
  await expect(page.locator('#pageView tbody tr').first()).toBeVisible();
  expect(await page.locator('#pageView tbody tr').count()).toBeGreaterThan(10);
  await page.locator('#rail [data-page="ruptl"]').click();
  await expect(page.locator('#pageView tbody tr').first()).toBeVisible();
  expect(await page.locator('#pageView tbody tr').count()).toBeGreaterThan(10);
  await page.locator('#rail [data-page="peta"]').click();
  await expect(page.locator('#tabs [data-tab="gi"]')).toBeVisible();
  await page.locator('#tabs [data-tab="gi"]').click();
  await expect(page.locator('#pageView tbody tr').first()).toBeVisible();
  await page.locator('#rail [data-page="peta"]').click();
  await page.locator('#tabs [data-tab="ruptl"]').click();
  await expect(page.locator('#pageView tbody tr').first()).toBeVisible();
  await page.locator('#themeToggle').click();
  await expect(page.locator('html')).toHaveAttribute('data-theme','dark');
  await page.locator('#rail [data-act="logout"]').click();
  await expect(page.locator('#demoGate')).toBeVisible();
  expect(errors).toEqual([]);
});
