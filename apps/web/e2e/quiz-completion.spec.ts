﻿import { test, expect } from '@playwright/test';

// Quiz completion flow: 25-step enhanced quiz

test('quiz completion flow - guest user redirects to register', async ({ page }) => {
  // Minimal network stubs to avoid backend dependency
  await page.route('**/api/quiz/preview', async (route) => {
    if (route.request().method() === 'POST') {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ok: true, savedAt: new Date().toISOString() }) });
    } else {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ clientId: 'cid', version: 1, answers: {}, savedAt: new Date().toISOString() }) });
    }
  });

  await page.route('**/api/quiz/capture-email', async (route) => {
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ok: true, message: 'Email saved' }) });
  });

  await page.goto('/quiz');

  // Step 0: Splash - click "Start Now" or similar
  const startBtn = page.getByRole('button', { name: /start now|get started|begin/i }).first();
  if (await startBtn.isVisible({ timeout: 3000 })) {
    await startBtn.click();
  }

  // Helper to click Next
  const clickNext = async () => {
    const nextBtn = page.getByRole('button', { name: /next|→/i }).first();
    await nextBtn.click();
    await page.waitForTimeout(300); // Small delay for animations
  };

  // Step 1: Primary Goal
  const goalOption = page.locator('button').filter({ hasText: /lose weight|build muscle|stay healthy|more energy/i }).first();
  if (await goalOption.isVisible({ timeout: 2000 })) {
    await goalOption.click();
  }
  await clickNext();

  // Step 2: Personal Story (pain points) - select at least one
  const painPoint = page.locator('label').filter({ hasText: /energy|junk food|no time|don't know/i }).first();
  if (await painPoint.isVisible({ timeout: 2000 })) {
    await painPoint.click();
  }
  await clickNext();

  // Step 3: Quick Win - just proceed
  await clickNext();

  // Step 4: Body Type
  const bodyType = page.locator('button').filter({ hasText: /ectomorph|mesomorph|endomorph/i }).first();
  if (await bodyType.isVisible({ timeout: 2000 })) {
    await bodyType.click();
  }
  await clickNext();

  // Step 5: Body Metrics Extended (height & weight)
  const heightInput = page.getByLabel(/height/i).or(page.locator('input[placeholder*="cm"]').or(page.locator('input[type="number"]').first()));
  if (await heightInput.isVisible({ timeout: 2000 })) {
    await heightInput.fill('175');
  }
  const weightInput = page.getByLabel(/weight/i).or(page.locator('input[placeholder*="kg"]').or(page.locator('input[type="number"]').nth(1)));
  if (await weightInput.isVisible({ timeout: 2000 })) {
    await weightInput.fill('70');
  }
  await clickNext();

  // Step 6: Age & Gender
  const ageGender = page.locator('button').filter({ hasText: /male|female|years/i }).first();
  if (await ageGender.isVisible({ timeout: 2000 })) {
    await ageGender.click();
  }
  await clickNext();

  // Steps 7-12: Optional or simple clicks
  for (let i = 0; i < 6; i++) {
    // Try to select any available option
    const anyOption = page.locator('button, label').filter({ hasText: /yes|no|none|select|option/i }).first();
    if (await anyOption.isVisible({ timeout: 1000 }).catch(() => false)) {
      await anyOption.click().catch(() => {});
    }
    await clickNext();
  }

  // Step 13: Midpoint Celebration - just proceed (skip email if modal appears)
  await clickNext();

  // Step 14: Activity Level
  const activity = page.locator('button').filter({ hasText: /sedentary|light|moderate|active/i }).first();
  if (await activity.isVisible({ timeout: 2000 })) {
    await activity.click();
  }
  await clickNext();

  // Steps 15-21: Fill minimal required fields or proceed
  for (let i = 0; i < 7; i++) {
    const anyInput = page.locator('input[type="number"], input[type="text"]').first();
    if (await anyInput.isVisible({ timeout: 1000 }).catch(() => false)) {
      await anyInput.fill('5').catch(() => {});
    }
    const anyOption = page.locator('button').first();
    if (await anyOption.isVisible({ timeout: 1000 }).catch(() => false)) {
      await anyOption.click().catch(() => {});
    }
    await clickNext();
  }

  // Steps 22-24: Preview and final
  await clickNext(); // Results preview
  await clickNext(); // Meal plan preview

  // Final step - Complete Quiz as guest should redirect to /register
  const completeBtn = page.getByRole('button', { name: /complete quiz|finish|submit/i }).first();
  if (await completeBtn.isVisible({ timeout: 2000 })) {
    await completeBtn.click();
  }

  // Expect redirect to register page
  await expect(page).toHaveURL(/\/register/, { timeout: 5000 });
});
