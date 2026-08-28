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
  await expect(page.getByText('Cheated and somehow think you had a good reason?')).toHaveCount(0);
  await expect(page.getByText('THE ASSIGNMENT', { exact: true })).toHaveCount(0);
  await expect(page.getByText('If your confession makes the show then the Classmates get to judge you.')).toBeVisible();
  await expect(page.getByText('Set the scene. Tell on yourself. Give us the mess. Ask the Classmates.')).toBeVisible();
  await expect(page.locator('#callback-title')).toHaveText("Sometimes 90 seconds ain't enough.");
  await expect(page.getByText('Some confessions work as voice notes. The messiest ones may deserve a longer recorded conversation with OBK.')).toBeVisible();
  await expect(page.getByText('ALIAS / WHERE YOU FOUND US / PHONE + YES')).toBeVisible();
  await expect(page.getByText('OBK contacts you first—there are no surprise calls.', { exact: false })).toBeVisible();
  await expect(page.locator('.confession-formula')).toHaveCount(0);
  await expect(page.locator('.field-guide')).toHaveCount(0);
  await expect(page.locator('.verdict-banner')).toHaveCount(0);
  await expect(page.locator('.safety-compact')).toBeVisible();

  const cta = page.locator('.primary-cta');
  await expect(cta).toHaveAttribute('href', '#ready-to-confess');
  await cta.click();
  await expect(page).toHaveURL(/#ready-to-confess$/);
  await expect.poll(async () => Math.abs(await page.locator('#ready-to-confess').evaluate(element => element.getBoundingClientRect().top))).toBeLessThanOrEqual(2);

  const micLineTops = await page.locator('.gate-kicker .keep-together').evaluate(element => {
    const range = document.createRange();
    range.selectNodeContents(element);
    return [...new Set(Array.from(range.getClientRects(), rect => Math.round(rect.top)))];
  });
  expect(micLineTops).toHaveLength(1);

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
  await expect(recorder.getByText('Use an alias. After recording, enter: alias / source / phone + YES (optional callback).')).toBeVisible();
  const events = await page.evaluate(() => window.dataLayer.map(event => event.event));
  expect(events).toContain('tc_landing_view');
  expect(events).toContain('tc_primary_cta_click');
  expect(events).toContain('tc_consent_ready');
  expect(events).toContain('tc_recorder_open');
  expect(errors).toEqual([]);
});

test('source tags persist into recorder tracking', async ({ page }) => {
  const base = process.env.TC_URL || 'http://127.0.0.1:8765/';
  const tagged = new URL(base);
  tagged.search = 'utm_source=instagram&utm_medium=story&utm_campaign=tc_launch&utm_content=friday_prompt';
  await page.goto(tagged.toString());
  const attribution = await page.evaluate(() => JSON.parse(localStorage.getItem('tc_attribution')));
  expect(attribution).toMatchObject({
    source: 'instagram',
    medium: 'story',
    campaign: 'tc_launch',
    content: 'friday_prompt'
  });

  await page.goto(new URL('thanks/', base).toString());
  await expect(page.getByRole('heading', { name: 'CONFESSION RECEIVED.' })).toBeVisible();
  const completion = await page.evaluate(() => JSON.parse(localStorage.getItem('tc_last_event')));
  expect(completion).toMatchObject({ event: 'tc_submission_complete', source: 'instagram' });
});

test('desktop judge line stays on one line', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1100 });
  await page.goto(process.env.TC_URL || 'http://127.0.0.1:8765/', { waitUntil: 'networkidle' });

  const lineTops = await page.locator('.judge-line').evaluate(element => {
    const range = document.createRange();
    range.selectNodeContents(element);
    return [...new Set(Array.from(range.getClientRects(), rect => Math.round(rect.top)))];
  });

  expect(lineTops).toHaveLength(1);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1)).toBeTruthy();
});
