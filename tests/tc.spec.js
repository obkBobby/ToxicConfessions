const { test, expect } = require('@playwright/test');

test('mobile layout and consent-gated recorder work', async ({ page }) => {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(process.env.TC_URL || 'http://127.0.0.1:8765/', { waitUntil: 'networkidle' });

  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1)).toBeTruthy();
  expect(await page.locator('img').evaluateAll(images => images.every(img => img.complete && img.naturalWidth > 0))).toBeTruthy();
  await expect(page.locator('h1')).toContainText('TOXICCONFESSIONS');
  await expect(page.getByText('You did the mess. Now tell the Classmates.')).toBeVisible();
  await expect(page.getByText('YOU DID WHAT?!')).toHaveCount(0);
  await expect(page.getByText('REACTION CAM')).toHaveCount(0);

  const button = page.locator('#open-recorder');
  await expect(button).toBeDisabled();
  await page.locator('#age-check').check();
  await page.locator('#rights-check').check();
  await expect(button).toBeEnabled();
  await button.click();

  await expect(page.locator('#consent-gate')).toBeHidden();
  await expect(page.locator('#podline-frame')).toBeVisible();
  await expect(page.locator('#podline-frame iframe')).toHaveAttribute('src', 'https://podline.fm/e/toxic-confessions');
  await page.waitForTimeout(2500);
  const recorder = page.frames().find(frame => frame.url().includes('/e/toxic-confessions'));
  expect(recorder).toBeTruthy();
  expect(errors).toEqual([]);
});
