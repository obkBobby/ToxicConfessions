const { test, expect } = require('@playwright/test');
const base = process.env.TC_URL || 'http://127.0.0.1:8895/';

for (const width of [320, 390, 1440]) {
  test(`lean intake copy and consent work at ${width}px`, async ({ page }) => {
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    await page.setViewportSize({width, height: 900});
    await page.goto(base, {waitUntil: 'networkidle'});
    await expect(page.locator('.hero-dek')).toHaveText('You made the mess. Now spill the tea.');
    await expect(page.locator('.callback-plain strong')).toHaveText('Leave a confession.');
    await expect(page.locator('.callback-plain span')).toHaveText('You have 90 seconds.');
    const lines = await page.locator('.callback-plain').evaluate(e => {
      const a = e.querySelector('strong').getBoundingClientRect();
      const b = e.querySelector('span').getBoundingClientRect();
      return Math.abs(a.y - b.y) < 2;
    });
    expect(lines).toBeTruthy();
    await expect(page.locator('.site-header')).toHaveCount(0);
    await expect(page.locator('.privacy-reminder')).toHaveCount(0);
    await expect(page.locator('.hotline-status')).toHaveText('HOTLINE OPEN');
    await expect(page.locator('.recorder-label i')).toHaveCount(0);
    expect(await page.locator('.hotline-status .status-dot').evaluate(e => getComputedStyle(e).animationName)).toBe('pulse');
    await expect(page.locator('.gate-note')).toHaveText('Submission does not guarantee airtime.');
    expect(await page.locator('.callback-plain span').evaluate(e => getComputedStyle(e).fontWeight)).toBe('400');
    expect(await page.locator('.callback-plain').evaluate(e => getComputedStyle(e).backgroundColor)).toBe('rgb(244, 200, 74)');
    for (const text of ['LEAVE A VOICE MESSAGE','Give us what happened','Want a callback?','OBK REACTION ROOM','Your story hits the desk.','Send the clean version first.','You did the mess.']) {
      await expect(page.locator('body')).not.toContainText(text);
    }
    await expect(page.locator('.toxic-logo--below')).toHaveCount(0);
    await expect(page.locator('.host-card img')).toBeVisible();
    expect(await page.locator('img').evaluateAll(imgs => imgs.every(i => i.complete && i.naturalWidth > 0))).toBeTruthy();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBeTruthy();
    const button = page.locator('#open-recorder');
    await expect(button).toBeDisabled();
    await expect(page.locator('.check-row')).toHaveCount(1);
    await page.locator('#consent-check').check();
    await expect(button).toBeEnabled();
    await page.screenshot({path: `/tmp/tc-lean-${width}.png`, fullPage: true});
    await Promise.all([page.waitForURL('https://podline.fm/toxic-confessions'), button.click()]);
    await page.goBack({waitUntil:'networkidle'});
    const events = await page.evaluate(() => JSON.parse(localStorage.getItem('tc_event_history')).map(e => e.event));
    expect(events).toContain('tc_consent_ready');
    expect(events).toContain('tc_recorder_open');
    expect(errors).toEqual([]);
  });
}

test('source tags persist into recorder tracking', async ({ page }) => {
  const tagged = new URL(base);
  tagged.search = 'utm_source=instagram&utm_medium=flow_dm&utm_campaign=tc_launch&utm_content=confess_keyword';
  await page.goto(tagged.toString());
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('tc_attribution')))).toMatchObject({source:'instagram',medium:'flow_dm',campaign:'tc_launch',content:'confess_keyword'});
  await page.goto(new URL('thanks/',base).toString());
  await expect(page.getByRole('heading',{name:'CONFESSION RECEIVED.'})).toBeVisible();
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('tc_last_event')))).toMatchObject({event:'tc_submission_complete',source:'instagram'});
});
