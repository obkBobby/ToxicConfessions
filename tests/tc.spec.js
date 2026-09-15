const { test, expect } = require('@playwright/test');

test('fast-entry mobile layout and consent-gated recorder work', async ({ page }) => {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(process.env.TC_URL || 'http://127.0.0.1:8765/', { waitUntil: 'networkidle' });

  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1)).toBeTruthy();
  expect(await page.locator('img').evaluateAll(images => images.every(img => img.complete && img.naturalWidth > 0))).toBeTruthy();
  await expect(page.locator('.site-header')).toContainText('TOXIC CONFESSIONS');
  await expect(page.locator('.site-header')).toContainText('HOTLINE OPEN');
  await expect(page.locator('.toxic-logo')).toBeVisible();
  await expect(page.getByText('LEAVE A VOICE MESSAGE', { exact: true })).toHaveCount(0);
  await expect(page.getByText('ONE QUICK THING.', { exact: true })).toHaveCount(0);
  await expect(page.getByRole('heading', { name: 'Leave Your Confession', exact: true })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Leave your confession.' })).toBeVisible();
  await expect(page.getByText('You did the mess. Now tell the Classmates.')).toBeVisible();
  await expect(page.getByText('Give us what happened, what you did, and the part that makes you look bad. You have up to 90 seconds.')).toBeVisible();
  await expect(page.locator('.callback-plain')).toHaveText('Want a callback? Leave your phone number after the name you want us to use. We might call you back on the show.');
  await expect(page.getByText('YES', { exact: true })).toHaveCount(0);
  await expect(page.getByText('Use an alias.', { exact: false })).toHaveCount(0);
  await expect(page.locator('.host-proof')).toBeVisible();

  const button = page.locator('#open-recorder');
  const mobileButtonBox = await button.boundingBox();
  expect(mobileButtonBox.y).toBeLessThan(820);
  await expect(button).toBeDisabled();
  await expect(page.locator('.check-row')).toHaveCount(1);
  await page.locator('#consent-check').check();
  await expect(button).toBeEnabled();
  await expect(button).toHaveText('CONTINUE TO THE RECORDER.');
  await Promise.all([
    page.waitForURL('https://podline.fm/toxic-confessions'),
    button.click()
  ]);

  await expect(page.getByText('Drop your message. Want a callback? Add your phone number after the name you want us to use. We might call you back on the show.')).toBeVisible();
  await page.goBack({ waitUntil: 'networkidle' });
  const events = await page.evaluate(() => JSON.parse(localStorage.getItem('tc_event_history')).map(event => event.event));
  expect(events).toContain('tc_landing_view');
  expect(events).toContain('tc_consent_ready');
  expect(events).toContain('tc_recorder_open');
  expect(errors).toEqual([]);
});

test('source tags persist into recorder tracking', async ({ page }) => {
  const base = process.env.TC_URL || 'http://127.0.0.1:8765/';
  const tagged = new URL(base);
  tagged.search = 'utm_source=instagram&utm_medium=flow_dm&utm_campaign=tc_launch&utm_content=confess_keyword';
  await page.goto(tagged.toString());
  const attribution = await page.evaluate(() => JSON.parse(localStorage.getItem('tc_attribution')));
  expect(attribution).toMatchObject({
    source: 'instagram',
    medium: 'flow_dm',
    campaign: 'tc_launch',
    content: 'confess_keyword'
  });

  await page.goto(new URL('thanks/', base).toString());
  await expect(page.getByRole('heading', { name: 'CONFESSION RECEIVED.' })).toBeVisible();
  const completion = await page.evaluate(() => JSON.parse(localStorage.getItem('tc_last_event')));
  expect(completion).toMatchObject({ event: 'tc_submission_complete', source: 'instagram' });
});

test('desktop opens on the recorder and host photo is below intake', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1100 });
  await page.goto(process.env.TC_URL || 'http://127.0.0.1:8765/', { waitUntil: 'networkidle' });

  await expect(page.locator('.recorder-section--first')).toBeVisible();
  await expect(page.locator('.toxic-logo')).toBeVisible();
  const buttonBox = await page.locator('#open-recorder').boundingBox();
  const hostBox = await page.locator('.host-proof').boundingBox();
  const recorderBox = await page.locator('.recorder-section--first').boundingBox();
  expect(buttonBox.y).toBeLessThan(900);
  expect(hostBox.y).toBeGreaterThan(recorderBox.y + 500);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1)).toBeTruthy();
});
