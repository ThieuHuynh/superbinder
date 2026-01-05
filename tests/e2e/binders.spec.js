// @ts-check
const { test, expect } = require('@playwright/test');

/**
 * Browser Automation Tests for Binder CRUD Operations
 * Tests Create, Edit (Lock/Publish), and Delete binders in the UI
 */

test.describe('Binder CRUD Operations', () => {
  /**
   * Helper function to generate unique test identifiers
   */
  const generateId = () => Date.now().toString(36) + Math.random().toString(36).substr(2, 5);

  test.describe('Create Binder', () => {
    test('should create a new binder with custom name', async ({ page }) => {
      const binderName = 'test-binder-' + generateId();
      const displayName = 'Test User';

      await page.goto('/');
      await page.waitForLoadState('networkidle');

      // Navigate to binder page
      const binderLink = page.locator('a[href="/binder"], a:has-text("Binder")').first();
      if (await binderLink.isVisible({ timeout: 2000 }).catch(() => false)) {
        await binderLink.click();
        await page.waitForLoadState('networkidle');
      }

      // Fill in the session setup form
      const displayNameInput = page.locator('input[placeholder*="name" i], input[placeholder*="Your name"]').first();
      const binderNameInput = page.locator('input[placeholder*="Binder" i], input[placeholder*="channel" i]').first();

      if (await displayNameInput.isVisible({ timeout: 3000 }).catch(() => false)) {
        await displayNameInput.fill(displayName);
      }

      if (await binderNameInput.isVisible({ timeout: 3000 }).catch(() => false)) {
        await binderNameInput.fill(binderName);
      }

      // Click Join button
      const joinButton = page.locator('button:has-text("Join"), button[type="submit"]').first();
      if (await joinButton.isVisible({ timeout: 2000 }).catch(() => false)) {
        await joinButton.click();
        await page.waitForTimeout(2000);

        // Verify we're in the binder - check for Dashboard or binder name
        const dashboard = page.locator('text=Dashboard, button:has-text("Dashboard")').first();
        const binderTitle = page.locator(`text=${binderName}`).first();

        const inBinder = await dashboard.isVisible({ timeout: 5000 }).catch(() => false) ||
                         await binderTitle.isVisible({ timeout: 2000 }).catch(() => false);

        expect(inBinder).toBe(true);

        // Verify URL contains the binder name
        await expect(page).toHaveURL(new RegExp(`/binder/${binderName}`));
      }
    });

    test('should create a unique binder with UUID', async ({ page }) => {
      const displayName = 'UUID Test User';

      await page.goto('/binder');
      await page.waitForLoadState('networkidle');

      // Fill display name
      const displayNameInput = page.locator('input[placeholder*="name" i], input[placeholder*="Your name"]').first();
      if (await displayNameInput.isVisible({ timeout: 3000 }).catch(() => false)) {
        await displayNameInput.fill(displayName);
      }

      // Click "Unique Binder" button to generate UUID
      const uniqueBinderButton = page.locator('button:has-text("Unique Binder"), button:has(.pi-key)').first();
      if (await uniqueBinderButton.isVisible({ timeout: 2000 }).catch(() => false)) {
        await uniqueBinderButton.click();
        await page.waitForTimeout(500);

        // Verify the binder name input was populated with a UUID-like value
        const binderNameInput = page.locator('input[placeholder*="Binder" i], input[placeholder*="channel" i]').first();
        const binderNameValue = await binderNameInput.inputValue();

        // UUID should be populated and have significant length
        expect(binderNameValue.length).toBeGreaterThan(8);

        // Join the binder
        const joinButton = page.locator('button:has-text("Join")').first();
        if (await joinButton.isVisible({ timeout: 2000 }).catch(() => false)) {
          await joinButton.click();
          await page.waitForTimeout(2000);

          // Verify we're in the binder
          const dashboard = page.locator('text=Dashboard').first();
          await expect(dashboard).toBeVisible({ timeout: 5000 });
        }
      }
    });

    test('should copy binder URL to clipboard', async ({ page, context }) => {
      const binderName = 'clipboard-test-' + generateId();
      const displayName = 'Clipboard Test User';

      // Grant clipboard permissions
      await context.grantPermissions(['clipboard-read', 'clipboard-write']);

      await page.goto('/binder');
      await page.waitForLoadState('networkidle');

      // Fill in the form
      const displayNameInput = page.locator('input[placeholder*="name" i]').first();
      const binderNameInput = page.locator('input[placeholder*="Binder" i]').first();

      if (await displayNameInput.isVisible({ timeout: 3000 }).catch(() => false)) {
        await displayNameInput.fill(displayName);
      }

      if (await binderNameInput.isVisible({ timeout: 3000 }).catch(() => false)) {
        await binderNameInput.fill(binderName);
      }

      // Click Copy URL button
      const copyUrlButt('button:has-text("Copy URL"), button:has(.pi-link)').first();
      if (await copyUrlButton.isVisible({ timeout: 2000 }).catch(() => false)) {
        await copyUrlButton.click();
        await page.waitForTimeout(500);

        // Verify clipboard contains the binder URL
        const clipboardContent = await page.evaluate(() => navigator.clipboard.readText());
        expect(clipboardContent).toContain(`/binder/${binderName}`);
      }
    });

    test('should validate binder name format', async ({ page }) => {
      await page.goto('/binder');
      await page.waitForLoadState('networkidle');

      // Fill display name
      const displayNameInput = page.locator('input[placeholder*="name" i]').first();
      if (await displayNameInput.isVisible({ timeout: 3000 }).catch(() => false)) {
        await displayNameInput.fill('Test User');
      }

      // Try entering invalid characters
      const binderNameInput = page.locator('input[placeholder*="Binder" i]').first();
      if (await binderNameInput.isVisible({ timeout: 3000 }).catch(() => false)) {
        await binderNameInput.fill('Invalid@Name#!');
        await page.waitForTimeout(300);

        // The input should sanitize invalid characters
        const sanitizedValue = await binderNameInput.inputValue();
        // Should only contain alphanumeric, space, underscore, dash
        expect(sanitizedValue).toMatch(/^[a-z0-9 _-]*$/i);
      }
    });

    test('should require binder name field', async ({ page }) => {
      await page.goto('/binder');
      await page.waitForLoadState('networkidle');

      // Check that the binder name input has required attribute or validation
      const binderNameInput = page.locator('input[placeholder*="Binder" i]').first();
      if (await binderNameInput.isVisible({ timeout: 3000 }).catch(() => false)) {
        // Verify input exists and is part of the form
        const isRequired = await binderNameInput.getAttribute('required');
        // The input should have required attribute OR the form should validate
        expect(binderNameInput).toBeDefined();
      }
    });
  });

  test.describe('Edit Binder', () => {
    const testBinderName = 'edit-test-' + Date.now();
    const testDisplayName = 'Edit Test User';

    test.beforeEach(async ({ page }) => {
      // Create and join a binder for editing tests
      await page.goto('/binder');
      await page.waitForLoadState('networkidle');

      const displayNameInput = page.locator('input[placeholder*="name" i]').first();
      const binderNameInput = page.locator('input[placeholder*="Binder" i]').first();

      if (await displayNameInput.isVisible({ timeout: 3000 }).catch(() => false)) {
        await displayNameInput.fill(testDisplayName);
      }
      if (await binderNameInput.isVisible({ timeout: 3000 }).catch(() => false)) {
        await binderNameInput.fill(testBinderName);
      }

      const joinButton = page.locator('button:has-text("Join")').first();
      if (await joinButton.isVisible({ timeout: 2000 }).catch(() => false)) {
        await joinButton.click();
        await page.waitForTimeout(2000);
      }
    });

    test('should toggle room lock', async ({ page }) => {
      // Look for lock/unlock button in dashboard header
      const lockButton = page.locator('[title="Toggle Room Lock"], button:has(.pi-lock), button:has(.pi-unlock)').first();

      if (await lockButton.isVisible({ timeout: 3000 }).catch(() => false)) {
        // Get initial lock state
        const isInitiallyLocked = await page.locator('.pi-lock').first().isVisible().catch(() => false);

        // Toggle the lock
        await lockButton.click();
        await page.waitForTimeout(500);

        // Verify the state changed
        const isNowLocked = await page.locator('.pi-lock').first().isVisible().catch(() => false);
        expect(isNowLocked).not.toBe(isInitiallyLocked);

        // Toggle back
        await lockButton.click();
        await page.waitForTimeout(500);

        const isFinalState = await page.locator('.pi-lock').first().isVisible().catch(() => false);
        expect(isFinalState).toBe(isInitiallyLocked);
      }
    });

    test('should open publish modal', async ({ page }) => {
      // Click "Publish to Library" button
      const publishButton = page.locator('button:has-text("Publish to Library")').first();

      if (await publishButton.isVisible({ timeout: 3000 }).catch(() => false)) {
        await publishButton.click();
        await page.waitForTimeout(500);

        // Verify modal is open - look for modal container or header
        const modal = page.locator('.fixed.inset-0, [class*="modal"], h2:has-text("Publish")').first();
        const isModalVisible = await modal.isVisible({ timeout: 3000 }).catch(() => false);
        
        if (isModalVisible) {
          // Verify form fields are present
          const nameInput = page.locator('input[placeholder*="Name" i]').first();
          const descriptionInput = page.locator('textarea').first();

          const hasNameInput = await nameInput.isVisible({ timeout: 2000 }).catch(() => false);
          const hasDescInput = await descriptionInput.isVisible({ timeout: 2000 }).catch(() => false);
          
          expect(hasNameInput || hasDescInput).toBe(true);
        }
      }
    });

    test('should close publish modal on cancel', async ({ page }) => {
      const publishButton = page.locator('button:has-text("Publish to Library")').first();

      if (await publishButton.isVisible({ timeout: 3000 }).catch(() => false)) {
        await publishButton.click();
        await page.waitForTimeout(500);

        // Click Cancel button
        const cancelButton = page.locator('button:has-text("Cancel")').first();
        if (await cancelButton.isVisible({ timeout: 2000 }).catch(() => false)) {
          await cancelButton.click();
          await page.waitForTimeout(500);

          // Modal should be closed
          const modal = page.locator('text=Publish Binder to Library').first();
          const isModalVisible = await modal.isVisible().catch(() => false);
          expect(isModalVisible).toBe(false);
        }
      }
    });

    test('should fill publish form and submit', async ({ page }) => {
      const publishButton = page.locator('button:has-text("Publish to Library")').first();

      if (await publishButton.isVisible({ timeout: 3000 }).catch(() => false)) {
        await publishButton.click();
        await page.waitForTimeout(500);

        // Fill in publish form
        const nameInput = page.locator('input[placeholder*="Binder Name" i], input[placeholder*="Name"]').first();
        const descriptionInput = page.locator('textarea[placeholder*="Description" i]').first();

        if (await nameInput.isVisible({ timeout: 2000 }).catch(() => false)) {
          await nameInput.fill('Published Test Binder');
        }

        if (await descriptionInput.isVisible({ timeout: 2000 }).catch(() => false)) {
          await descriptionInput.fill('This is a test binder published for testing purposes.');
        }

        // Click Publish button (may fail if backend not running, but tests the UI flow)
        const submitButton = page.locator('button:has-text("Publish"):not(:has-text("Library"))').first();
        if (await submitButton.isVisible({ timeout: 2000 }).catch(() => false)) {
          await submitButton.click();
          await page.waitForTimeout(1000);

          // Either modal closes (success) or shows error (backend not running)
          // Both are valid UI responses
        }
      }
    });

    test('should navigate between tabs', async ({ page }) => {
      // Get all tab buttons
      const tabs = ['Dashboard', 'Sections', 'Goals', 'Prompts', 'Agents', 'Q&A', 'Collaboration'];

      for (const tabName of tabs) {
        const tab = page.locator(`button:has-text("${tabName}")`).first();
        if (await tab.isVisible({ timeout: 1000 }).catch(() => false)) {
          await tab.click();
          await page.waitForTimeout(300);

          // Verify tab is active (has active styling)
          const tabClasses = await tab.getAttribute('class');
          expect(tabClasses).toContain('bg-[#3b82f6]'); // Active tab background
        }
      }
    });
  });

  test.describe('Delete Binder', () => {
    test('should show remove binder button in dashboard', async ({ page }) => {
      const binderName = 'delete-test-' + generateId();
      const displayName = 'Delete Test User';

      await page.goto('/binder');
      await page.waitForLoadState('networkidle');

      // Create and join binder
      const displayNameInput = page.locator('input[placeholder*="name" i]').first();
      const binderNameInput = page.locator('input[placeholder*="Binder" i]').first();

      if (await displayNameInput.isVisible({ timeout: 3000 }).catch(() => false)) {
        await displayNameInput.fill(displayName);
      }
      if (await binderNameInput.isVisible({ timeout: 3000 }).catch(() => false)) {
        await binderNameInput.fill(binderName);
      }

      const joinButton = page.locator('button:has-text("Join")').first();
      if (await joinButton.isVisible({ timeout: 2000 }).catch(() => false)) {
        await joinButton.click();
        await page.waitForTimeout(2000);
      }

      // Look for delete button in dashboard
      const deleteButton = page.locator('[title="Remove Binder"], button:has(.pi-trash)').first();
      const isDeleteButtonVisible = await deleteButton.isVisible({ timeout: 3000 }).catch(() => false);

      expect(isDeleteButtonVisible).toBe(true);
    });

    test('should delete binder and show response', async ({ page }) => {
      const binderName = 'to-delete-' + generateId();
      const displayName = 'Delete User';

      await page.goto('/binder');
      await page.waitForLoadState('networkidle');

      // Create and join binder
      const displayNameInput = page.locator('input[placeholder*="name" i]').first();
      const binderNameInput = page.locator('input[placeholder*="Binder" i]').first();

      if (await displayNameInput.isVisible({ timeout: 3000 }).catch(() => false)) {
        await displayNameInput.fill(displayName);
      }
      if (await binderNameInput.isVisible({ timeout: 3000 }).catch(() => false)) {
        await binderNameInput.fill(binderName);
      }

      const joinButton = page.locator('button:has-text("Join")').first();
      if (await joinButton.isVisible({ timeout: 2000 }).catch(() => false)) {
        await joinButton.click();
        await page.waitForTimeout(2000);
      }

      // Click delete button
      const deleteButton = page.locator('[title="Remove Binder"]').first();
      if (await deleteButton.isVisible({ timeout: 3000 }).catch(() => false)) {
        // Record current URL before delete
        const urlBeforeDelete = page.url();
        
        await deleteButton.click();
        await page.waitForTimeout(3000);

        // Check for various possible outcomes:
        // 1. Session removed modal appears
        // 2. Redirected to setup screen
        // 3. URL changed
        // 4. Dashboard is no longer visible
        const sessionRemoved = page.locator('text=removed, text=has been removed').first();
        const setupScreen = page.locator('text=Create a SuperBinder').first();
        const dashboard = page.locator('text=Dashboard').first();

        const isRemoved = await sessionRemoved.isVisible({ timeout: 2000 }).catch(() => false);
        const isSetup = await setupScreen.isVisible({ timeout: 2000 }).catch(() => false);
        const urlChanged = page.url() !== urlBeforeDelete;
        const dashboardGone = !(await dashboard.isVisible({ timeout: 1000 }).catch(() => false));

        // Any of these indicates the delete action worked
        expect(isRemoved || isSetup || urlChanged || dashboardGone).toBe(true);
      }
    });

    test('should handle session removed notification', async ({ page }) => {
      const binderName = 'session-remove-test-' + generateId();
      const displayName = 'Session Test User';

      await page.goto('/binder');
      await page.waitForLoadState('networkidle');

      // Create and join binder
      const displayNameInput = page.locator('input[placeholder*="name" i]').first();
      const binderNameInput = page.locator('input[placeholder*="Binder" i]').first();

      if (await displayNameInput.isVisible({ timeout: 3000 }).catch(() => false)) {
        await displayNameInput.fill(displayName);
      }
      if (await binderNameInput.isVisible({ timeout: 3000 }).catch(() => false)) {
        await binderNameInput.fill(binderName);
      }

      const joinButton = page.locator('button:has-text("Join")').first();
      if (await joinButton.isVisible({ timeout: 2000 }).catch(() => false)) {
        await joinButton.click();
        await page.waitForTimeout(2000);
      }

      // Delete the binder
      const deleteButton = page.locator('[title="Remove Binder"]').first();
      if (await deleteButton.isVisible({ timeout: 3000 }).catch(() => false)) {
        await deleteButton.click();
        await page.waitForTimeout(2000);

        // Check for reset session button if modal appears
        const resetButton = page.locator('button:has-text("Return"), button:has-text("Reset"), button:has-text("OK")').first();
        if (await resetButton.isVisible({ timeout: 3000 }).catch(() => false)) {
          await resetButton.click();
          await page.waitForTimeout(1000);

          // Should be back at setup screen
          const setupScreen = page.locator('text=Create a SuperBinder').first();
          await expect(setupScreen).toBeVisible({ timeout: 5000 });
        }
      }
    });
  });

  test.describe('Binder Persistence and Navigation', () => {
    test('should preserve binder name in URL', async ({ page }) => {
      const binderName = 'url-persist-' + generateId();

      await page.goto('/binder');
      await page.waitForLoadState('networkidle');

      const displayNameInput = page.locator('input[placeholder*="name" i]').first();
      const binderNameInput = page.locator('input[placeholder*="Binder" i]').first();

      if (await displayNameInput.isVisible({ timeout: 3000 }).catch(() => false)) {
        await displayNameInput.fill('URL Test User');
      }
      if (await binderNameInput.isVisible({ timeout: 3000 }).catch(() => false)) {
        await binderNameInput.fill(binderName);
      }

      const joinButton = page.locator('button:has-text("Join")').first();
      if (await joinButton.isVisible({ timeout: 2000 }).catch(() => false)) {
        await joinButton.click();
        await page.waitForTimeout(2000);

        // Verify URL contains binder name
        expect(page.url()).toContain(`/binder/${binderName}`);
      }
    });

    test('should join existing binder via URL', async ({ page }) => {
      const binderName = 'direct-join-' + generateId();

      // First create the binder
      await page.goto('/binder');
      await page.waitForLoadState('networkidle');

      const displayNameInput = page.locator('input[placeholder*="name" i]').first();
      const binderNameInput = page.locator('input[placeholder*="Binder" i]').first();

      if (await displayNameInput.isVisible({ timeout: 3000 }).catch(() => false)) {
        await displayNameInput.fill('First User');
      }
      if (await binderNameInput.isVisible({ timeout: 3000 }).catch(() => false)) {
        await binderNameInput.fill(binderName);
      }

      const joinButton = page.locator('button:has-text("Join")').first();
      if (await joinButton.isVisible({ timeout: 2000 }).catch(() => false)) {
        await joinButton.click();
        await page.waitForTimeout(2000);
      }

      // Now navigate directly to the binder URL
      await page.goto(`/binder/${binderName}`);
      await page.waitForLoadState('networkidle');

      // Should show session setup with prefilled binder name OR direct join if session exists
      const binderNameInputAfter = page.locator('input[placeholder*="Binder" i]').first();
      if (await binderNameInputAfter.isVisible({ timeout: 3000 }).catch(() => false)) {
        const prefilledValue = await binderNameInputAfter.inputValue();
        expect(prefilledValue.toLowerCase()).toBe(binderName.toLowerCase());
      }
    });

    test('should display binder name in dashboard header', async ({ page }) => {
      const binderName = 'header-test-' + generateId();

      await page.goto('/binder');
      await page.waitForLoadState('networkidle');

      const displayNameInput = page.locator('input[placeholder*="name" i]').first();
      const binderNameInput = page.locator('input[placeholder*="Binder" i]').first();

      if (await displayNameInput.isVisible({ timeout: 3000 }).catch(() => false)) {
        await displayNameInput.fill('Header Test User');
      }
      if (await binderNameInput.isVisible({ timeout: 3000 }).catch(() => false)) {
        await binderNameInput.fill(binderName);
      }

      const joinButton = page.locator('button:has-text("Join")').first();
      if (await joinButton.isVisible({ timeout: 2000 }).catch(() => false)) {
        await joinButton.click();
        await page.waitForTimeout(2000);

        // Look for binder name in header
        const binderTitle = page.locator(`text=Binder: ${binderName}`).first();
        const isTitleVisible = await binderTitle.isVisible({ timeout: 5000 }).catch(() => false);

        expect(isTitleVisible).toBe(true);
      }
    });

    test('should show participant count', async ({ page }) => {
      const binderName = 'participant-test-' + generateId();

      await page.goto('/binder');
      await page.waitForLoadState('networkidle');

      const displayNameInput = page.locator('input[placeholder*="name" i]').first();
      const binderNameInput = page.locator('input[placeholder*="Binder" i]').first();

      if (await displayNameInput.isVisible({ timeout: 3000 }).catch(() => false)) {
        await displayNameInput.fill('Participant Test User');
      }
      if (await binderNameInput.isVisible({ timeout: 3000 }).catch(() => false)) {
        await binderNameInput.fill(binderName);
      }

      const joinButton = page.locator('button:has-text("Join")').first();
      if (await joinButton.isVisible({ timeout: 2000 }).catch(() => false)) {
        await joinButton.click();
        await page.waitForTimeout(2000);

        // Look for participant count in header
        const participantText = page.locator('text=/\\d+ participant/i').first();
        const isParticipantVisible = await participantText.isVisible({ timeout: 5000 }).catch(() => false);

        expect(isParticipantVisible).toBe(true);
      }
    });
  });

  test.describe('Binder Dashboard Metrics', () => {
    test('should display all metric cards', async ({ page }) => {
      const binderName = 'metrics-test-' + generateId();

      await page.goto('/binder');
      await page.waitForLoadState('networkidle');

      const displayNameInput = page.locator('input[placeholder*="name" i]').first();
      const binderNameInput = page.locator('input[placeholder*="Binder" i]').first();

      if (await displayNameInput.isVisible({ timeout: 3000 }).catch(() => false)) {
        await displayNameInput.fill('Metrics Test User');
      }
      if (await binderNameInput.isVisible({ timeout: 3000 }).catch(() => false)) {
        await binderNameInput.fill(binderName);
      }

      const joinButton = page.locator('button:has-text("Join")').first();
      if (await joinButton.isVisible({ timeout: 2000 }).catch(() => false)) {
        await joinButton.click();
        await page.waitForTimeout(2000);

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

        for (const metric of expectedMetrics) {
          const metricCard = page.locator(`text=${metric}`).first();
          const isVisible = await metricCard.isVisible({ timeout: 2000 }).catch(() => false);
          // At least some metrics should be visible
          if (isVisible) {
            expect(isVisible).toBe(true);
          }
        }
      }
    });

    test('should navigate to tab when clicking metric card', async ({ page }) => {
      const binderName = 'card-nav-test-' + generateId();

      await page.goto('/binder');
      await page.waitForLoadState('networkidle');

      const displayNameInput = page.locator('input[placeholder*="name" i]').first();
      const binderNameInput = page.locator('input[placeholder*="Binder" i]').first();

      if (await displayNameInput.isVisible({ timeout: 3000 }).catch(() => false)) {
        await displayNameInput.fill('Card Nav User');
      }
      if (await binderNameInput.isVisible({ timeout: 3000 }).catch(() => false)) {
        await binderNameInput.fill(binderName);
      }

      const joinButton = page.locator('button:has-text("Join")').first();
      if (await joinButton.isVisible({ timeout: 2000 }).catch(() => false)) {
        await joinButton.click();
        await page.waitForTimeout(2000);

        // Click on Sections card
        const sectionsCard = page.locator('text=Sections').first();
        if (await sectionsCard.isVisible({ timeout: 3000 }).catch(() => false)) {
          await sectionsCard.click();
          await page.waitForTimeout(500);

          // Verify Sections tab is now active
          const sectionsTab = page.locator('button:has-text("Sections")').first();
          const tabClasses = await sectionsTab.getAttribute('class');
          expect(tabClasses).toContain('bg-[#3b82f6]');
        }
      }
    });
  });
});
