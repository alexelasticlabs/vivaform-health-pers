import { test, expect } from '@playwright/test';

// Quiz completion flow: fill minimal required fields per canGoNext()

test('quiz completion flow fills required fields and proceeds', async ({ page }) => {
  // Minimal network stubs to avoid backend dependency
  await page.route('**/api/quiz/preview', async (route) => {
    if (route.request().method() === 'POST') {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ok: true, savedAt: new Date().toISOString() }) });
    } else {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ clientId: 'cid', version: 1, answers: {}, savedAt: new Date().toISOString() }) });
    }
  });

  await page.goto('/quiz');

  // Step 0: choose diet plan
  const anyPlan = page.getByRole('button', { name: /keto|balanced|low carb|start|continue/i }).first();
  if (await anyPlan.isVisible()) {
    await anyPlan.click();
  }
  const nextBtn = page.getByRole('button', { name: /next|→/i }).first();
  await nextBtn.click();

  // Step 1: body metrics — try fill inputs by labels
  const heightInput = page.getByLabel(/height|cm/i).first();
  const weightInput = page.getByLabel(/weight|kg/i).first();
  if (await heightInput.isVisible()) await heightInput.fill('175');
  if (await weightInput.isVisible()) await weightInput.fill('70');
  await nextBtn.click();

  // Step 2: goal timeline
  const months = page.getByLabel(/months|eta/i).first();
  if (await months.isVisible()) await months.fill('3');
  await nextBtn.click();

  // Step 3: activity level
  const activity = page.getByRole('radio').first().or(page.getByRole('button').first());
  if (await activity.isVisible()) await activity.click();
  await nextBtn.click();

  // Step 4: meals per day
  const meals = page.getByLabel(/meals per day|meals/i).first();
  if (await meals.isVisible()) await meals.fill('3');
  await nextBtn.click();

  // Step 5: sleep hours
  const sleep = page.getByLabel(/sleep hours|sleep/i).first();
  if (await sleep.isVisible()) await sleep.fill('7');
  await nextBtn.click();

  // Step 6: meal complexity or allergies
  const complexity = page.getByLabel(/complexity|allerg/i).first().or(page.getByRole('radio').first());
  if (await complexity.isVisible()) await complexity.click();
  await nextBtn.click();

  // Step 7: main motivation
  const motivation = page.getByRole('radio').first();
  if (await motivation.isVisible()) await motivation.click();
  await nextBtn.click();

  // Step 8: daily water ml
  const water = page.getByLabel(/water|ml/i).first();
  if (await water.isVisible()) await water.fill('1500');
  await nextBtn.click();

  // Final step — as guest, expect redirect to register on submit
  const completeBtn = page.getByRole('button', { name: /complete quiz|submit/i }).first();
  if (await completeBtn.isVisible()) {
    await completeBtn.click();
  }
  await expect(page).toHaveURL(/\/register/);
});
