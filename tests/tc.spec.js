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
  await expect(page.getByText('If your confession makes the show, the Classmates get to judge you.')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'You get 90 seconds.' })).toBeVisible();
  await expect(page.getByText('Give us what happened, what you did, and the part that makes you look bad.')).toBeVisible();
  await expect(page.locator('.callback-plain')).toContainText('Want a callback?');
  await expect(page.locator('.callback-plain')).toContainText('add your phone number and YES');
  await expect(page.getByText('OBK contacts you first—there are no surprise calls.', { exact: false })).toHaveCount(0);
  await expect(page.getByText('Use an alias.', { exact: false })).toHaveCount(0);
  await expect(page.locator('.callback-card')).toHaveCount(0);
  await expect(page.locator('.recorder-handoff')).toHaveCount(0);
  await expect(page.locator('.safety-compact')).toHaveCount(0);

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
  await expect(button).toHaveText('I AGREE. CONTINUE TO THE RECORDER.');
  await expect(page.locator('.recorder-handoff')).toHaveCount(0);
  await expect(page.locator('#podline-frame')).toHaveCount(0);
  await Promise.all([
    page.waitForURL('https://podline.fm/toxic-confessions'),
    button.click()
  ]);

  await expect(page.getByText('You did the mess. Now tell the Classmates. In the name box, add phone + YES only if you want a callback.')).toBeVisible();
  await page.goBack({ waitUntil: 'networkidle' });
  const events = await page.evaluate(() => JSON.parse(localStorage.getItem('tc_event_history')).map(event => event.event));
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

test('desktop hero and intake stay within the viewport', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1100 });
  await page.goto(process.env.TC_URL || 'http://127.0.0.1:8765/', { waitUntil: 'networkidle' });

  const lineTops = await page.locator('.hero-dek').evaluate(element => {
    const range = document.createRange();
    range.selectNodeContents(element);
    return [...new Set(Array.from(range.getClientRects(), rect => Math.round(rect.top)))];
  });

  expect(lineTops).toHaveLength(1);
  await expect(page.locator('.recorder-section--compact')).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1)).toBeTruthy();
});
