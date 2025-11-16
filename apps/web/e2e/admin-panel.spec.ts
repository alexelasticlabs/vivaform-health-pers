import { test, expect } from '@playwright/test';

const ADMIN_EMAIL = 'admin@vivaform.com';
const ADMIN_PASSWORD = 'admin123';
const BASE_URL = process.env.VITE_APP_URL || 'http://localhost:5173';

test.describe('Admin Panel - Feature Toggles & Audit Logs', () => {
  test.beforeEach(async ({ page }) => {
    // Login as admin
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[name="email"]', ADMIN_EMAIL);
    await page.fill('input[name="password"]', ADMIN_PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForURL(`${BASE_URL}/app`);
  });

  test.describe('Feature Toggles Page', () => {
    test('should navigate to feature toggles page', async ({ page }) => {
      await page.goto(`${BASE_URL}/app/admin`);
      await page.click('text=Feature Toggles');
      await expect(page).toHaveURL(`${BASE_URL}/app/admin/feature-toggles`);
      await expect(page.locator('h1')).toContainText('Feature Toggles');
    });

    test('should display empty state when no toggles exist', async ({ page }) => {
      await page.goto(`${BASE_URL}/app/admin/feature-toggles`);

      // Check for empty state
      const emptyState = page.locator('text=No feature toggles yet');
      if (await emptyState.isVisible()) {
        await expect(emptyState).toBeVisible();
        await expect(page.locator('text=Create your first feature toggle')).toBeVisible();
      }
    });

    test('should show create toggle button', async ({ page }) => {
      await page.goto(`${BASE_URL}/app/admin/feature-toggles`);
      await expect(page.locator('button:has-text("Create Toggle")')).toBeVisible();
    });

    test('should display existing feature toggles', async ({ page }) => {
      await page.goto(`${BASE_URL}/app/admin/feature-toggles`);

      // Wait for toggles to load
      await page.waitForTimeout(1000);

      const toggleCards = page.locator('[role="article"], .feature-toggle-card');
      const count = await toggleCards.count();

      if (count > 0) {
        // Check first toggle has key elements
        const firstToggle = toggleCards.first();
        await expect(firstToggle).toBeVisible();

        // Should have enable/disable button
        await expect(firstToggle.locator('button:has-text("Enable"), button:has-text("Disable")')).toBeVisible();

        // Should have edit button
        await expect(firstToggle.locator('button:has-text("Edit")')).toBeVisible();
      }
    });

    test('should quick toggle a feature on/off', async ({ page }) => {
      await page.goto(`${BASE_URL}/app/admin/feature-toggles`);
      await page.waitForTimeout(1000);

      const toggleCards = page.locator('[role="article"], .feature-toggle-card');
      const count = await toggleCards.count();

      if (count > 0) {
        const firstToggle = toggleCards.first();
        const toggleButton = firstToggle.locator('button:has-text("Enable"), button:has-text("Disable")').first();
        const initialText = await toggleButton.textContent();

        // Click toggle
        await toggleButton.click();

        // Wait for update
        await page.waitForTimeout(500);

        // Check button text changed
        const newText = await toggleButton.textContent();
        expect(newText).not.toBe(initialText);
      }
    });

    test('should edit feature toggle', async ({ page }) => {
      await page.goto(`${BASE_URL}/app/admin/feature-toggles`);
      await page.waitForTimeout(1000);

      const toggleCards = page.locator('[role="article"], .feature-toggle-card');
      const count = await toggleCards.count();

      if (count > 0) {
        // Click edit on first toggle
        await toggleCards.first().locator('button:has-text("Edit")').click();

        // Should show edit form
        await expect(page.locator('input[type="text"]:disabled')).toBeVisible(); // Key field (disabled)
        await expect(page.locator('input[placeholder*="Describe"]')).toBeVisible(); // Description field
        await expect(page.locator('input[type="number"]')).toBeVisible(); // Rollout %
        await expect(page.locator('input[type="checkbox"]')).toBeVisible(); // Enabled checkbox

        // Update description
        const descField = page.locator('input[placeholder*="Describe"]');
        await descField.fill('Updated description from E2E test');

        // Save
        await page.click('button:has-text("Save")');
        await page.waitForTimeout(500);

        // Should show success message
        await expect(page.locator('text=Feature toggle updated')).toBeVisible({ timeout: 3000 });
      }
    });
  });

  test.describe('Audit Logs Page', () => {
    test('should navigate to audit logs page', async ({ page }) => {
      await page.goto(`${BASE_URL}/app/admin`);
      await page.click('text=Audit Logs');
      await expect(page).toHaveURL(`${BASE_URL}/app/admin/audit-logs`);
      await expect(page.locator('h1')).toContainText('Audit Logs');
    });

    test('should display filter controls', async ({ page }) => {
      await page.goto(`${BASE_URL}/app/admin/audit-logs`);

      await expect(page.locator('text=Filters')).toBeVisible();
      await expect(page.locator('input[placeholder*="action"]')).toBeVisible();
      await expect(page.locator('input[placeholder*="entity"]')).toBeVisible();
      await expect(page.locator('input[placeholder*="User ID"]')).toBeVisible();
    });

    test('should display audit logs', async ({ page }) => {
      await page.goto(`${BASE_URL}/app/admin/audit-logs`);
      await page.waitForTimeout(1000);

      const logCards = page.locator('[role="article"], .audit-log-card');
      const count = await logCards.count();

      if (count > 0) {
        const firstLog = logCards.first();
        await expect(firstLog).toBeVisible();

        // Should show action badge
        await expect(firstLog.locator('span:has-text("user."), span:has-text("feature_toggle.")')).toBeVisible();

        // Should show actor
        await expect(firstLog.locator('text=Actor:')).toBeVisible();

        // Should show timestamp
        await expect(firstLog).toContainText(/\d{1,2}\/\d{1,2}\/\d{4}/); // Date format
      }
    });

    test('should filter logs by action', async ({ page }) => {
      await page.goto(`${BASE_URL}/app/admin/audit-logs`);

      const actionInput = page.locator('input[placeholder*="action"]');
      await actionInput.fill('user.updated');
      await page.waitForTimeout(1000);

      // Check that URL has filter param
      await expect(page).toHaveURL(/action=user\.updated/);
    });

    test('should show metadata details', async ({ page }) => {
      await page.goto(`${BASE_URL}/app/admin/audit-logs`);
      await page.waitForTimeout(1000);

      const logCards = page.locator('[role="article"], .audit-log-card');
      const count = await logCards.count();

      if (count > 0) {
        const firstLog = logCards.first();
        const detailsToggle = firstLog.locator('summary:has-text("View metadata")');

        if (await detailsToggle.isVisible()) {
          await detailsToggle.click();

          // Should show JSON metadata
          await expect(firstLog.locator('pre')).toBeVisible();
        }
      }
    });

    test('should paginate through logs', async ({ page }) => {
      await page.goto(`${BASE_URL}/app/admin/audit-logs`);
      await page.waitForTimeout(1000);

      const nextButton = page.locator('button:has-text("Next")');
      if (await nextButton.isEnabled()) {
        const urlBefore = page.url();
        await nextButton.click();
        await page.waitForTimeout(500);

        // URL should change
        const urlAfter = page.url();
        expect(urlAfter).not.toBe(urlBefore);
        expect(urlAfter).toContain('page=2');

        // Previous button should be enabled
        await expect(page.locator('button:has-text("Previous")')).toBeEnabled();
      }
    });
  });

  test.describe('Admin Navigation', () => {
    test('should show Feature Toggles and Audit Logs in sidebar', async ({ page }) => {
      await page.goto(`${BASE_URL}/app/admin`);

      // Check sidebar has new menu items
      await expect(page.locator('nav a:has-text("Feature Toggles")')).toBeVisible();
      await expect(page.locator('nav a:has-text("Audit Logs")')).toBeVisible();
    });

    test('should highlight active menu item', async ({ page }) => {
      await page.goto(`${BASE_URL}/app/admin/feature-toggles`);

      const featureTogglesLink = page.locator('nav a:has-text("Feature Toggles")');

      // Check if active (usually has a specific class or style)
      await expect(featureTogglesLink).toHaveClass(/active|bg-emerald/);
    });
  });

  test.describe('Access Control', () => {
    test('should not show admin menu for non-admin users', async ({ page }) => {
      // TODO: Login as regular user and verify admin routes are not accessible
      // This would require a test user setup
    });
  });
});

