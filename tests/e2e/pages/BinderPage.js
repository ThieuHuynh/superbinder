/**
 * Page Object Model for Binder functionality
 * Provides reusable methods for interacting with binders in E2E tests
 */

class BinderPage {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    this.page = page;

    // Selectors
    this.selectors = {
      // Session Setup
      displayNameInput: 'input[placeholder*="name" i], input[placeholder*="Your name"]',
      binderNameInput: 'input[placeholder*="Binder" i], input[placeholder*="channel" i]',
      joinButton: 'button:has-text("Join"), button[type="submit"]',
      uniqueBinderButton: 'button:has-text("Unique Binder"), button:has(.pi-key)',
      copyUrlButton: 'button:has-text("Copy URL"), button:has(.pi-link)',
      setupForm: 'text=Create a SuperBinder',
      errorMessage: '.bg-red-600, [class*="error"]',

      // Dashboard
      dashboard: 'text=Dashboard',
      binderTitle: 'text=Binder:',
      participantCount: 'text=/\\d+ participant/i',
      lockButton: '[title="Toggle Room Lock"], button:has(.pi-lock), button:has(.pi-unlock)',
      deleteButton: '[title="Remove Binder"], button:has(.pi-trash)',
      publishButton: 'button:has-text("Publish to Library")',
      lockedIcon: '.pi-lock',
      unlockedIcon: '.pi-unlock',

      // Publish Modal
      publishModal: 'text=Publish Binder to Library',
      publishNameInput: 'input[placeholder*="Binder Name" i], input[placeholder*="Name"]',
      publishDescriptionInput: 'textarea[placeholder*="Description" i]',
      publishSubmitButton: 'button:has-text("Publish"):not(:has-text("Library"))',
      cancelButton: 'button:has-text("Cancel")',

      // Session Removed
      sessionRemoved: 'text=removed, text=Session Removed',
      resetButton: 'button:has-text("Return"), button:has-text("Reset"), button:has-text("OK")',

      // Tabs
      tabButton: (name) => `button:has-text("${name}")`,
      activeTabClass: 'bg-[#3b82f6]',

      // Metric Cards
      metricCard: (name) => `text=${name}`,
      usersCard: 'text=Users in Room',
      sectionsCard: 'text=Sections',
      documentsCard: 'text=Documents',
      goalsCard: 'text=Goals',
      agentsCard: 'text=Agents',
    };
  }

  /**
   * Navigate to binder page
   */
  async goto() {
    await this.page.goto('/binder');
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Navigate to a specific binder by name
   * @param {string} binderName
   */
  async gotoBinderByName(binderName) {
    await this.page.goto(`/binder/${binderName}`);
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Create and join a new binder
   * @param {string} displayName
   * @param {string} binderName
   */
  async createBinder(displayName, binderName) {
    await this.goto();

    const displayInput = this.page.locator(this.selectors.displayNameInput).first();
    const binderInput = this.page.locator(this.selectors.binderNameInput).first();

    if (await displayInput.isVisible({ timeout: 3000 }).catch(() => false)) {
      await displayInput.fill(displayName);
    }

    if (await binderInput.isVisible({ timeout: 3000 }).catch(() => false)) {
      await binderInput.fill(binderName);
    }

    await this.clickJoin();
  }

  /**
   * Create a binder with unique UUID
   * @param {string} displayName
   * @returns {Promise<string>} The generated binder name
   */
  async createUniqueBinder(displayName) {
    await this.goto();

    const displayInput = this.page.locator(this.selectors.displayNameInput).first();
    if (await displayInput.isVisible({ timeout: 3000 }).catch(() => false)) {
      await displayInput.fill(displayName);
    }

    const uniqueButton = this.page.locator(this.selectors.uniqueBinderButton).first();
    if (await uniqueButton.isVisible({ timeout: 2000 }).catch(() => false)) {
      await uniqueButton.click();
      await this.page.waitForTimeout(500);
    }

    const binderInput = this.page.locator(this.selectors.binderNameInput).first();
    const binderName = await binderInput.inputValue();

    await this.clickJoin();
    return binderName;
  }

  /**
   * Click the Join button
   */
  async clickJoin() {
    const joinButton = this.page.locator(this.selectors.joinButton).first();
    if (await joinButton.isVisible({ timeout: 2000 }).catch(() => false)) {
      await joinButton.click();
      await this.page.waitForTimeout(2000);
    }
  }

  /**
   * Copy the binder URL
   */
  async copyUrl() {
    const copyButton = this.page.locator(this.selectors.copyUrlButton).first();
    if (await copyButton.isVisible({ timeout: 2000 }).catch(() => false)) {
      await copyButton.click();
      await this.page.waitForTimeout(500);
    }
  }

  /**
   * Check if we're in a binder (dashboard visible)
   * @returns {Promise<boolean>}
   */
  async isInBinder() {
    const dashboard = this.page.locator(this.selectors.dashboard).first();
    return await dashboard.isVisible({ timeout: 5000 }).catch(() => false);
  }

  /**
   * Check if the setup form is visible
   * @returns {Promise<boolean>}
   */
  async isOnSetupScreen() {
    const setupForm = this.page.locator(this.selectors.setupForm).first();
    return await setupForm.isVisible({ timeout: 3000 }).catch(() => false);
  }

  /**
   * Toggle room lock
   */
  async toggleLock() {
    const lockButton = this.page.locator(this.selectors.lockButton).first();
    if (await lockButton.isVisible({ timeout: 3000 }).catch(() => false)) {
      await lockButton.click();
      await this.page.waitForTimeout(500);
    }
  }

  /**
   * Check if room is locked
   * @returns {Promise<boolean>}
   */
  async isLocked() {
    return await this.page.locator(this.selectors.lockedIcon).first().isVisible().catch(() => false);
  }

  /**
   * Delete the current binder
   */
  async deleteBinder() {
    const deleteButton = this.page.locator(this.selectors.deleteButton).first();
    if (await deleteButton.isVisible({ timeout: 3000 }).catch(() => false)) {
      await deleteButton.click();
      await this.page.waitForTimeout(2000);
    }
  }

  /**
   * Open publish modal
   */
  async openPublishModal() {
    const publishButton = this.page.locator(this.selectors.publishButton).first();
    if (await publishButton.isVisible({ timeout: 3000 }).catch(() => false)) {
      await publishButton.click();
      await this.page.waitForTimeout(500);
    }
  }

  /**
   * Check if publish modal is open
   * @returns {Promise<boolean>}
   */
  async isPublishModalOpen() {
    const modal = this.page.locator(this.selectors.publishModal).first();
    return await modal.isVisible({ timeout: 3000 }).catch(() => false);
  }

  /**
   * Fill and submit publish form
   * @param {string} name
   * @param {string} description
   */
  async publishBinder(name, description) {
    await this.openPublishModal();

    const nameInput = this.page.locator(this.selectors.publishNameInput).first();
    const descInput = this.page.locator(this.selectors.publishDescriptionInput).first();

    if (await nameInput.isVisible({ timeout: 2000 }).catch(() => false)) {
      await nameInput.fill(name);
    }

    if (await descInput.isVisible({ timeout: 2000 }).catch(() => false)) {
      await descInput.fill(description);
    }

    const submitButton = this.page.locator(this.selectors.publishSubmitButton).first();
    if (await submitButton.isVisible({ timeout: 2000 }).catch(() => false)) {
      await submitButton.click();
      await this.page.waitForTimeout(1000);
    }
  }

  /**
   * Close publish modal
   */
  async closePublishModal() {
    const cancelButton = this.page.locator(this.selectors.cancelButton).first();
    if (await cancelButton.isVisible({ timeout: 2000 }).catch(() => false)) {
      await cancelButton.click();
      await this.page.waitForTimeout(500);
    }
  }

  /**
   * Navigate to a specific tab
   * @param {string} tabName
   */
  async navigateToTab(tabName) {
    const tab = this.page.locator(this.selectors.tabButton(tabName)).first();
    if (await tab.isVisible({ timeout: 2000 }).catch(() => false)) {
      await tab.click();
      await this.page.waitForTimeout(300);
    }
  }

  /**
   * Check if a tab is active
   * @param {string} tabName
   * @returns {Promise<boolean>}
   */
  async isTabActive(tabName) {
    const tab = this.page.locator(this.selectors.tabButton(tabName)).first();
    const classes = await tab.getAttribute('class');
    return classes?.includes(this.selectors.activeTabClass) || false;
  }

  /**
   * Get binder name from URL
   * @returns {string}
   */
  getBinderNameFromUrl() {
    const url = this.page.url();
    const match = url.match(/\/binder\/([^/?]+)/);
    return match ? match[1] : '';
  }

  /**
   * Check if session removed message is visible
   * @returns {Promise<boolean>}
   */
  async isSessionRemoved() {
    const removed = this.page.locator(this.selectors.sessionRemoved).first();
    return await removed.isVisible({ timeout: 3000 }).catch(() => false);
  }

  /**
   * Click reset session button after removal
   */
  async resetSession() {
    const resetButton = this.page.locator(this.selectors.resetButton).first();
    if (await resetButton.isVisible({ timeout: 3000 }).catch(() => false)) {
      await resetButton.click();
      await this.page.waitForTimeout(1000);
    }
  }

  /**
   * Get participant count from header
   * @returns {Promise<number>}
   */
  async getParticipantCount() {
    const countText = this.page.locator(this.selectors.participantCount).first();
    if (await countText.isVisible({ timeout: 3000 }).catch(() => false)) {
      const text = await countText.textContent();
      const match = text?.match(/(\d+)/);
      return match ? parseInt(match[1], 10) : 0;
    }
    return 0;
  }

  /**
   * Click on a metric card
   * @param {string} metricName
   */
  async clickMetricCard(metricName) {
    const card = this.page.locator(this.selectors.metricCard(metricName)).first();
    if (await card.isVisible({ timeout: 3000 }).catch(() => false)) {
      await card.click();
      await this.page.waitForTimeout(500);
    }
  }

  /**
   * Wait for binder to load
   */
  async waitForBinderToLoad() {
    await this.page.waitForTimeout(2000);
  }

  /**
   * Generate unique ID for test data
   * @returns {string}
   */
  static generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
  }
}

module.exports = { BinderPage };
