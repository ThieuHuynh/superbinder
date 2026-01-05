/**
 * Page Object Model for Goals functionality
 * Provides reusable methods for interacting with goals in E2E tests
 */

class GoalsPage {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    this.page = page;

    // Selectors
    this.selectors = {
      // Goals tab
      goalsTab: 'button:has-text("Goals")',
      
      // Input and actions
      goalInput: 'input[placeholder*="Add a new goal" i]',
      addButton: 'button:has-text("Add")',
      
      // Goal items
      goalContainer: '.bg-gray-700.rounded-lg.flex.items-center',
      goalEditableText: '[contenteditable="true"]',
      dragHandle: 'text="⋮⋮"',
      deleteButton: 'button:has(.pi-times)',
      
      // Empty state
      emptyMessage: 'text="No goals yet."',
      
      // Goal count in tab
      goalsTabWithCount: (count) => `button:has-text("Goals (${count})")`,
    };
  }

  /**
   * Navigate to Goals tab
   */
  async navigateToGoals() {
    const tab = this.page.locator(this.selectors.goalsTab).first();
    if (await tab.isVisible({ timeout: 3000 }).catch(() => false)) {
      await tab.click();
      await this.page.waitForTimeout(500);
    }
  }

  /**
   * Add a new goal
   * @param {string} goalText - Text for the goal
   * @param {boolean} useEnter - Use Enter key instead of Add button
   * @returns {Promise<boolean>} Success status
   */
  async addGoal(goalText, useEnter = false) {
    const input = this.page.locator(this.selectors.goalInput).first();
    
    if (await input.isVisible({ timeout: 3000 }).catch(() => false)) {
      await input.fill(goalText);
      
      if (useEnter) {
        await input.press('Enter');
      } else {
        const addButton = this.page.locator(this.selectors.addButton).first();
        if (await addButton.isVisible({ timeout: 2000 }).catch(() => false)) {
          await addButton.click();
        }
      }
      
      await this.page.waitForTimeout(500);
      return true;
    }
    
    return false;
  }

  /**
   * Delete a specific goal by text
   * @param {string} goalText - Text of the goal to delete
   * @returns {Promise<boolean>} Success status
   */
  async deleteGoal(goalText) {
    const goalContainer = this.page.locator(`${this.selectors.goalContainer}:has-text("${goalText}")`).first();
    
    if (await goalContainer.isVisible({ timeout: 3000 }).catch(() => false)) {
      const deleteBtn = goalContainer.locator(this.selectors.deleteButton).first();
      
      if (await deleteBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
        await deleteBtn.click();
        await this.page.waitForTimeout(500);
        return true;
      }
    }
    
    return false;
  }

  /**
   * Edit a goal's text
   * @param {string} originalText - Current text of the goal
   * @param {string} newText - New text to set
   * @returns {Promise<boolean>} Success status
   */
  async editGoal(originalText, newText) {
    const goalElement = this.page.locator(`${this.selectors.goalEditableText}:has-text("${originalText}")`).first();
    
    if (await goalElement.isVisible({ timeout: 3000 }).catch(() => false)) {
      await goalElement.click();
      await this.page.waitForTimeout(200);
      
      // Select all and replace
      await this.page.keyboard.press('Control+a');
      await this.page.keyboard.type(newText);
      
      // Blur by clicking input field
      const input = this.page.locator(this.selectors.goalInput).first();
      if (await input.isVisible({ timeout: 1000 }).catch(() => false)) {
        await input.click();
      }
      
      await this.page.waitForTimeout(500);
      return true;
    }
    
    return false;
  }

  /**
   * Clear a goal's text (triggers deletion)
   * @param {string} goalText - Text of the goal to clear
   * @returns {Promise<boolean>} Success status
   */
  async clearGoal(goalText) {
    const goalElement = this.page.locator(`${this.selectors.goalEditableText}:has-text("${goalText}")`).first();
    
    if (await goalElement.isVisible({ timeout: 3000 }).catch(() => false)) {
      await goalElement.click();
      await this.page.waitForTimeout(200);
      
      // Select all and delete
      await this.page.keyboard.press('Control+a');
      await this.page.keyboard.press('Backspace');
      
      // Blur
      const input = this.page.locator(this.selectors.goalInput).first();
      await input.click();
      await this.page.waitForTimeout(500);
      
      return true;
    }
    
    return false;
  }

  /**
   * Check if a goal exists
   * @param {string} goalText - Text to search for
   * @returns {Promise<boolean>}
   */
  async goalExists(goalText) {
    const goal = this.page.locator(`text="${goalText}"`).first();
    return await goal.isVisible({ timeout: 3000 }).catch(() => false);
  }

  /**
   * Check if empty state is visible
   * @returns {Promise<boolean>}
   */
  async isEmptyStateVisible() {
    const emptyMsg = this.page.locator(this.selectors.emptyMessage).first();
    return await emptyMsg.isVisible({ timeout: 3000 }).catch(() => false);
  }

  /**
   * Get the number of goals
   * @returns {Promise<number>}
   */
  async getGoalCount() {
    return await this.page.locator(this.selectors.goalContainer).count();
  }

  /**
   * Get input field value
   * @returns {Promise<string>}
   */
  async getInputValue() {
    const input = this.page.locator(this.selectors.goalInput).first();
    if (await input.isVisible({ timeout: 2000 }).catch(() => false)) {
      return await input.inputValue();
    }
    return '';
  }

  /**
   * Check if drag handle is visible
   * @returns {Promise<boolean>}
   */
  async hasDragHandle() {
    const handle = this.page.locator(this.selectors.dragHandle).first();
    return await handle.isVisible({ timeout: 3000 }).catch(() => false);
  }

  /**
   * Check if delete button is visible for any goal
   * @returns {Promise<boolean>}
   */
  async hasDeleteButton() {
    const deleteBtn = this.page.locator(this.selectors.deleteButton).first();
    return await deleteBtn.isVisible({ timeout: 3000 }).catch(() => false);
  }

  /**
   * Check if a goal element is focused
   * @param {string} goalText - Text of the goal
   * @returns {Promise<boolean>}
   */
  async isGoalFocused(goalText) {
    const goalElement = this.page.locator(`${this.selectors.goalEditableText}:has-text("${goalText}")`).first();
    if (await goalElement.isVisible({ timeout: 3000 }).catch(() => false)) {
      return await goalElement.evaluate(el => document.activeElement === el);
    }
    return false;
  }

  /**
   * Add multiple goals
   * @param {string[]} goals - Array of goal texts
   * @param {boolean} useEnter - Use Enter key instead of Add button
   * @returns {Promise<number>} Number of successfully added goals
   */
  async addMultipleGoals(goals, useEnter = true) {
    let successCount = 0;
    
    for (const goal of goals) {
      const success = await this.addGoal(goal, useEnter);
      if (success) successCount++;
      await this.page.waitForTimeout(300);
    }
    
    return successCount;
  }

  /**
   * Get goal tab count text
   * @returns {Promise<string|null>}
   */
  async getTabCountText() {
    const tab = this.page.locator(this.selectors.goalsTab).first();
    if (await tab.isVisible({ timeout: 2000 }).catch(() => false)) {
      return await tab.textContent();
    }
    return null;
  }

  /**
   * Check if goal has cursor-move class
   * @param {string} goalText - Text of the goal
   * @returns {Promise<boolean>}
   */
  async hasCursorMoveStyle(goalText) {
    const goalContainer = this.page.locator(`.cursor-move:has-text("${goalText}")`).first();
    return await goalContainer.isVisible({ timeout: 3000 }).catch(() => false);
  }

  /**
   * Wait for goals to load
   */
  async waitForGoalsToLoad() {
    await this.page.waitForTimeout(1000);
  }
}

module.exports = { GoalsPage };
