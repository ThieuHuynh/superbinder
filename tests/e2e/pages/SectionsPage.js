/**
 * Page Object Model for Sections functionality
 * Provides reusable methods for interacting with sections in E2E tests
 */

class SectionsPage {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    this.page = page;

    // Selectors
    this.selectors = {
      treeNode: '.tree-node',
      addRootButton: '[title="Add Root Section"], button:has(.pi-plus)',
      editButton: 'button:has(.pi-pencil)',
      deleteButton: 'button:has(.pi-trash)',
      addChildButton: 'button:has(.pi-plus)',
      editInput: 'input[id^="edit-"]',
      expandToggle: '.expand-collapse',
      checkbox: '.checkbox',
      sectionName: '.truncate',
      sectionsTab: 'text=Sections',
    };
  }

  /**
   * Navigate to the sections view
   */
  async navigateToSections() {
    const sectionsTab = this.page.locator(this.selectors.sectionsTab).first();
    if (await sectionsTab.isVisible({ timeout: 2000 }).catch(() => false)) {
      await sectionsTab.click();
      await this.page.waitForTimeout(300);
    }
  }

  /**
   * Create a new root section
   * @returns {Promise<string|null>} The ID of the created section or null
   */
  async createRootSection() {
    const addButton = this.page.locator(this.selectors.addRootButton).first();
    if (await addButton.isVisible({ timeout: 3000 }).catch(() => false)) {
      await addButton.click();
      await this.page.waitForTimeout(500);
      return this.getFirstSectionId();
    }
    return null;
  }

  /**
   * Create a child section under a parent
   * @param {string} parentSelector - Selector for the parent section
   */
  async createChildSection(parentSelector) {
    const parent = this.page.locator(parentSelector || this.selectors.treeNode).first();
    if (await parent.isVisible({ timeout: 3000 }).catch(() => false)) {
      await parent.hover();
      const addChildBtn = parent.locator(this.selectors.addChildButton).first();
      if (await addChildBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
        await addChildBtn.click();
        await this.page.waitForTimeout(500);
      }
    }
  }

  /**
   * Rename a section
   * @param {string} newName - The new name for the section
   * @param {string} sectionSelector - Optional selector for specific section
   */
  async renameSection(newName, sectionSelector) {
    const section = this.page.locator(sectionSelector || this.selectors.treeNode).first();
    if (await section.isVisible({ timeout: 3000 }).catch(() => false)) {
      await section.hover();
      
      const editBtn = section.locator(this.selectors.editButton).first();
      if (await editBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
        await editBtn.click();
        await this.page.waitForTimeout(300);
        
        const input = this.page.locator(this.selectors.editInput).first();
        if (await input.isVisible({ timeout: 2000 }).catch(() => false)) {
          await input.clear();
          await input.fill(newName);
          await input.press('Enter');
          await this.page.waitForTimeout(500);
          return true;
        }
      }
    }
    return false;
  }

  /**
   * Delete a section
   * @param {string} sectionSelector - Optional selector for specific section
   */
  async deleteSection(sectionSelector) {
    const section = this.page.locator(sectionSelector || this.selectors.treeNode).first();
    if (await section.isVisible({ timeout: 3000 }).catch(() => false)) {
      await section.hover();
      
      const deleteBtn = section.locator(this.selectors.deleteButton).first();
      if (await deleteBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
        await deleteBtn.click();
        await this.page.waitForTimeout(500);
        return true;
      }
    }
    return false;
  }

  /**
   * Toggle section expansion
   * @param {string} sectionSelector - Optional selector for specific section
   */
  async toggleExpand(sectionSelector) {
    const section = this.page.locator(sectionSelector || this.selectors.treeNode).first();
    if (await section.isVisible({ timeout: 3000 }).catch(() => false)) {
      const toggle = section.locator(this.selectors.expandToggle).first();
      if (await toggle.isVisible({ timeout: 2000 }).catch(() => false)) {
        await toggle.click();
        await this.page.waitForTimeout(300);
        return true;
      }
    }
    return false;
  }

  /**
   * Toggle section checkbox
   * @param {string} sectionSelector - Optional selector for specific section
   */
  async toggleCheckbox(sectionSelector) {
    const section = this.page.locator(sectionSelector || this.selectors.treeNode).first();
    if (await section.isVisible({ timeout: 3000 }).catch(() => false)) {
      const checkbox = section.locator(this.selectors.checkbox).first();
      if (await checkbox.isVisible({ timeout: 2000 }).catch(() => false)) {
        await checkbox.click();
        await this.page.waitForTimeout(300);
        return true;
      }
    }
    return false;
  }

  /**
   * Get the count of visible sections
   * @returns {Promise<number>}
   */
  async getSectionCount() {
    return await this.page.locator(this.selectors.treeNode).count();
  }

  /**
   * Get section name by index
   * @param {number} index - Section index (0-based)
   * @returns {Promise<string|null>}
   */
  async getSectionName(index = 0) {
    const section = this.page.locator(this.selectors.treeNode).nth(index);
    if (await section.isVisible({ timeout: 3000 }).catch(() => false)) {
      const nameElement = section.locator(this.selectors.sectionName).first();
      return await nameElement.textContent();
    }
    return null;
  }

  /**
   * Check if a section with specific name exists
   * @param {string} name - Section name to find
   * @returns {Promise<boolean>}
   */
  async sectionExists(name) {
    const section = this.page.locator(`${this.selectors.treeNode}:has-text("${name}")`);
    return await section.isVisible({ timeout: 3000 }).catch(() => false);
  }

  /**
   * Check if section is expanded
   * @param {string} sectionSelector - Optional selector for specific section
   * @returns {Promise<boolean>}
   */
  async isExpanded(sectionSelector) {
    const section = this.page.locator(sectionSelector || this.selectors.treeNode).first();
    return await section.locator('.pi-caret-down').isVisible().catch(() => false);
  }

  /**
   * Check if section is selected (checkbox checked)
   * @param {string} sectionSelector - Optional selector for specific section
   * @returns {Promise<boolean>}
   */
  async isSelected(sectionSelector) {
    const section = this.page.locator(sectionSelector || this.selectors.treeNode).first();
    return await section.locator('.checkbox svg').isVisible().catch(() => false);
  }

  /**
   * Get first section's ID from DOM
   * @returns {Promise<string|null>}
   */
  async getFirstSectionId() {
    const section = this.page.locator(this.selectors.treeNode).first();
    // Try to get ID from edit input if available
    await section.hover();
    const editBtn = section.locator(this.selectors.editButton).first();
    if (await editBtn.isVisible({ timeout: 1000 }).catch(() => false)) {
      await editBtn.click();
      const input = this.page.locator(this.selectors.editInput).first();
      if (await input.isVisible({ timeout: 1000 }).catch(() => false)) {
        const id = await input.getAttribute('id');
        await this.page.keyboard.press('Escape');
        return id?.replace('edit-', '') || null;
      }
    }
    return null;
  }

  /**
   * Wait for sections to load
   */
  async waitForSectionsToLoad() {
    await this.page.waitForTimeout(1000);
  }
}

module.exports = { SectionsPage };
