// @ts-check
const base = require('@playwright/test');
const { BinderPage } = require('../pages/BinderPage');
const { SectionsPage } = require('../pages/SectionsPage');
const { GoalsPage } = require('../pages/GoalsPage');

/**
 * Extended test fixtures with page objects and common utilities
 */
exports.test = base.test.extend({
  /**
   * Binder page object
   */
  binderPage: async ({ page }, use) => {
    const binderPage = new BinderPage(page);
    await use(binderPage);
  },

  /**
   * Sections page object
   */
  sectionsPage: async ({ page }, use) => {
    const sectionsPage = new SectionsPage(page);
    await use(sectionsPage);
  },

  /**
   * Goals page object
   */
  goalsPage: async ({ page }, use) => {
    const goalsPage = new GoalsPage(page);
    await use(goalsPage);
  },

  /**
   * Auto-setup: creates and joins a binder before each test
   * Usage: test.use({ autoSetup: true })
   */
  autoSetup: async ({ binderPage }, use, testInfo) => {
    const shouldSetup = testInfo.project.use?.autoSetup || false;
    
    if (shouldSetup) {
      const binderName = `test-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
      const displayName = testInfo.title || 'Test User';
      await binderPage.createBinder(displayName, binderName);
      await binderPage.waitForBinderToLoad();
    }
    
    await use(shouldSetup);
  },
});

exports.expect = base.expect;
