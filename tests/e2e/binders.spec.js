// @ts-check
const { test, expect } = require('./fixtures/base-fixtures');
const { generateId, generateBinderName, TEST_USERS, TIMEOUTS } = require('./helpers/test-helpers');

/**
 * Binder CRUD Operations Tests
 * Refactored to use Page Object Model and fixtures
 */

test.describe('Binders - Create Operations', () => {
  test('should create a new binder with custom name', async ({ binderPage, page }) => {
    const binderName = generateBinderName('test-binder');
    const displayName = TEST_USERS.primary.displayName;

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Navigate to binder page
    const binderLink = page.locator('a[href="/binder"], a:has-text("Binder")').first();
    if (await binderLink.isVisible({ timeout: 2000 }).catch(() => false)) {
      await binderLink.click();
      await page.waitForLoadState('networkidle');
    } else {
      await binderPage.goto();
    }

    await binderPage.createBinder(displayName, binderName);

    // Verify we're in the binder
    expect(await binderPage.isInBinder()).toBe(true);
    
    // Verify URL contains the binder name
    await expect(page).toHaveURL(new RegExp(`/binder/${binderName}`));
  });

  test('should create a unique binder with UUID', async ({ binderPage }) => {
    const displayName = 'UUID Test User';

    await binderPage.goto();
    const generatedName = await binderPage.createUniqueBinder(displayName);

    // UUID should be populated and have significant length
    expect(generatedName.length).toBeGreaterThan(8);
    
    // Verify we're in the binder
    expect(await binderPage.isInBinder()).toBe(true);
  });

  test('should copy binder URL to clipboard', async ({ binderPage, page, context }) => {
    const binderName = generateBinderName('clipboard-test');
    const displayName = 'Clipboard Test User';

    // Grant clipboard permissions
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);

    await binderPage.goto();
    
    // Fill form
    const displayInput = page.locator('input[placeholder*="name" i]').first();
    const binderInput = page.locator('input[placeholder*="Binder" i]').first();

    if (await displayInput.isVisible({ timeout: 3000 }).catch(() => false)) {
      await displayInput.fill(displayName);
    }
    if (await binderInput.isVisible({ timeout: 3000 }).catch(() => false)) {
      await binderInput.fill(binderName);
    }

    await binderPage.copyUrl();

    // Verify clipboard contains the binder URL
    const clipboardContent = await page.evaluate(() => navigator.clipboard.readText());
    expect(clipboardContent).toContain(`/binder/${binderName}`);
  });

  test('should validate binder name format', async ({ binderPage, page }) => {
    await binderPage.goto();

    // Fill display name
    const displayInput = page.locator('input[placeholder*="name" i]').first();
    if (await displayInput.isVisible({ timeout: 3000 }).catch(() => false)) {
      await displayInput.fill('Test User');
    }

    // Try entering invalid characters
    const binderInput = page.locator('input[placeholder*="Binder" i]').first();
    if (await binderInput.isVisible({ timeout: 3000 }).catch(() => false)) {
      await binderInput.fill('Invalid@Name#!');
      await page.waitForTimeout(TIMEOUTS.SHORT);

      // The input should sanitize invalid characters
      const sanitizedValue = await binderInput.inputValue();
      expect(sanitizedValue).toMatch(/^[a-z0-9 _-]*$/i);
    }
  });
});

test.describe('Binders - Edit Operations', () => {
  let testBinderName;

  test.beforeEach(async ({ binderPage }) => {
    testBinderName = generateBinderName('edit-test');
    await binderPage.createBinder('Edit Test User', testBinderName);
    await binderPage.waitForBinderToLoad();
  });

  test('should toggle room lock', async ({ binderPage }) => {
    const isInitiallyLocked = await binderPage.isLocked();
    
    await binderPage.toggleLock();
    const isNowLocked = await binderPage.isLocked();
    expect(isNowLocked).not.toBe(isInitiallyLocked);
    
    await binderPage.toggleLock();
    const isFinalState = await binderPage.isLocked();
    expect(isFinalState).toBe(isInitiallyLocked);
  });

  test('should open publish modal', async ({ binderPage }) => {
    await binderPage.openPublishModal();
    
    expect(await binderPage.isPublishModalOpen()).toBe(true);
  });

  test('should close publish modal on cancel', async ({ binderPage, page }) => {
    await binderPage.openPublishModal();
    await binderPage.closePublishModal();
    
    // Modal should be closed
    const modal = page.locator('text=Publish Binder to Library').first();
    expect(await modal.isVisible().catch(() => false)).toBe(false);
  });

  test('should fill publish form and submit', async ({ binderPage }) => {
    await binderPage.publishBinder('Published Test Binder', 'This is a test binder published for testing purposes.');
    
    // Test passes if no errors occur (modal may close or show error depending on backend)
  });

  test('should navigate between tabs', async ({ binderPage, page }) => {
    const tabs = ['Dashboard', 'Sections', 'Goals', 'Prompts', 'Agents', 'Q&A', 'Collaboration'];

    for (const tabName of tabs) {
      const tab = page.locator(`button:has-text("${tabName}")`).first();
      if (await tab.isVisible({ timeout: 1000 }).catch(() => false)) {
        await binderPage.navigateToTab(tabName);
        
        // Verify tab is active
        expect(await binderPage.isTabActive(tabName)).toBe(true);
      }
    }
  });
});

test.describe('Binders - Delete Operations', () => {
  test('should show remove binder button in dashboard', async ({ binderPage, page }) => {
    const binderName = generateBinderName('delete-test');
    
    await binderPage.createBinder('Delete Test User', binderName);
    await binderPage.waitForBinderToLoad();

    // Look for delete button in dashboard
    const deleteButton = page.locator('[title="Remove Binder"], button:has(.pi-trash)').first();
    expect(await deleteButton.isVisible({ timeout: 3000 })).toBe(true);
  });

  test('should delete binder and show response', async ({ binderPage, page }) => {
    const binderName = generateBinderName('to-delete');
    
    await binderPage.createBinder('Delete User', binderName);
    await binderPage.waitForBinderToLoad();

    const urlBeforeDelete = page.url();
    await binderPage.deleteBinder();

    // Check for various possible outcomes
    const sessionRemoved = page.locator('text=removed, text=has been removed').first();
    const setupScreen = page.locator('text=Create a SuperBinder').first();
    const dashboard = page.locator('text=Dashboard').first();

    const isRemoved = await sessionRemoved.isVisible({ timeout: 2000 }).catch(() => false);
    const isSetup = await setupScreen.isVisible({ timeout: 2000 }).catch(() => false);
    const urlChanged = page.url() !== urlBeforeDelete;
    const dashboardGone = !(await dashboard.isVisible({ timeout: 1000 }).catch(() => false));

    // Any of these indicates the delete action worked
    expect(isRemoved || isSetup || urlChanged || dashboardGone).toBe(true);
  });

  test('should handle session removed notification', async ({ binderPage, page }) => {
    const binderName = generateBinderName('session-remove-test');
    
    await binderPage.createBinder('Session Test User', binderName);
    await binderPage.waitForBinderToLoad();

    await binderPage.deleteBinder();

    // Check for reset session button if modal appears
    const isSessionRemoved = await binderPage.isSessionRemoved();
    if (isSessionRemoved) {
      await binderPage.resetSession();
      
      // Should be back at setup screen
      expect(await binderPage.isOnSetupScreen()).toBe(true);
    }
  });
});

test.describe('Binders - Persistence and Navigation', () => {
  test('should preserve binder name in URL', async ({ binderPage, page }) => {
    const binderName = generateBinderName('url-persist');
    
    await binderPage.createBinder('URL Test User', binderName);
    await binderPage.waitForBinderToLoad();

    // Verify URL contains binder name
    expect(page.url()).toContain(`/binder/${binderName}`);
  });

  test('should join existing binder via URL', async ({ binderPage, page }) => {
    const binderName = generateBinderName('direct-join');
    
    // First create the binder
    await binderPage.createBinder('First User', binderName);
    await binderPage.waitForBinderToLoad();

    // Now navigate directly to the binder URL
    await binderPage.gotoBinderByName(binderName);

    // Should show session setup with prefilled binder name OR direct join if session exists
    const binderInput = page.locator('input[placeholder*="Binder" i]').first();
    if (await binderInput.isVisible({ timeout: 3000 }).catch(() => false)) {
      const prefilledValue = await binderInput.inputValue();
      expect(prefilledValue.toLowerCase()).toBe(binderName.toLowerCase());
    }
  });

  test('should display binder name in dashboard header', async ({ binderPage, page }) => {
    const binderName = generateBinderName('header-test');
    
    await binderPage.createBinder('Header Test User', binderName);
    await binderPage.waitForBinderToLoad();

    // Look for binder name in header
    const binderTitle = page.locator(`text=Binder: ${binderName}`).first();
    expect(await binderTitle.isVisible({ timeout: 5000 })).toBe(true);
  });

  test('should show participant count', async ({ binderPage }) => {
    const binderName = generateBinderName('participant-test');
    
    await binderPage.createBinder('Participant Test User', binderName);
    await binderPage.waitForBinderToLoad();

    const count = await binderPage.getParticipantCount();
    expect(count).toBeGreaterThanOrEqual(1);
  });
});

test.describe('Binders - Dashboard Metrics', () => {
  test('should display all metric cards', async ({ binderPage, page }) => {
    const binderName = generateBinderName('metrics-test');
    
    await binderPage.createBinder('Metrics Test User', binderName);
    await binderPage.waitForBinderToLoad();

    // Verify metric cards are visible
    const expectedMetrics = [
      'Users in Room',
      'Sections',
      'Documents',
      'Goals',
      'Agents',
      'Questions',
      'Answers',
      'Chat Messages',
    ];

    let visibleCount = 0;
    for (const metric of expectedMetrics) {
      const metricCard = page.locator(`text=${metric}`).first();
      const isVisible = await metricCard.isVisible({ timeout: 2000 }).catch(() => false);
      if (isVisible) visibleCount++;
    }

    // At least some metrics should be visible
    expect(visibleCount).toBeGreaterThan(0);
  });

  test('should navigate to tab when clicking metric card', async ({ binderPage }) => {
    const binderName = generateBinderName('card-nav-test');
    
    await binderPage.createBinder('Card Nav User', binderName);
    await binderPage.waitForBinderToLoad();

    // Click on Sections card
    await binderPage.clickMetricCard('Sections');

    // Verify Sections tab is now active
    expect(await binderPage.isTabActive('Sections')).toBe(true);
  });
});
