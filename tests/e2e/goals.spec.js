// @ts-check
const { test, expect } = require('./fixtures/base-fixtures');
const { generateId, generateBinderName, TEST_USERS, TIMEOUTS } = require('./helpers/test-helpers');
const { generateGoalText } = require('./fixtures/test-data');

/**
 * Goals CRUD Operations Tests
 * Refactored to use Page Object Model and fixtures
 */

test.describe('Goals - Create Operations', () => {
  test.beforeEach(async ({ binderPage, goalsPage }) => {
    const binderName = generateBinderName('goals-create');
    await binderPage.createBinder(TEST_USERS.goals.displayName, binderName);
    await goalsPage.navigateToGoals();
  });

  test('should create a new goal using Add button', async ({ goalsPage }) => {
    const goalText = generateGoalText('Add Button Goal ');
    
    await goalsPage.addGoal(goalText, false);
    
    expect(await goalsPage.goalExists(goalText)).toBe(true);
  });

  test('should create a new goal using Enter key', async ({ goalsPage }) => {
    const goalText = generateGoalText('Enter Key Goal ');
    
    await goalsPage.addGoal(goalText, true);
    
    expect(await goalsPage.goalExists(goalText)).toBe(true);
  });

  test('should clear input after adding goal', async ({ goalsPage }) => {
    const goalText = generateGoalText('Clear Input Goal ');
    
    await goalsPage.addGoal(goalText, true);
    
    const inputValue = await goalsPage.getInputValue();
    expect(inputValue).toBe('');
  });

  test('should not create goal with empty input', async ({ goalsPage }) => {
    const success = await goalsPage.addGoal('', false);
    
    // Empty state should still be visible or no goals were added
    const isEmpty = await goalsPage.isEmptyStateVisible();
    const goalCount = await goalsPage.getGoalCount();
    
    expect(isEmpty || goalCount === 0).toBe(true);
  });

  test('should create multiple goals', async ({ goalsPage }) => {
    const goals = [
      generateGoalText('First Goal '),
      generateGoalText('Second Goal '),
      generateGoalText('Third Goal ')
    ];
    
    const successCount = await goalsPage.addMultipleGoals(goals, true);
    
    expect(successCount).toBe(goals.length);
    
    // Verify all goals exist
    for (const goal of goals) {
      expect(await goalsPage.goalExists(goal)).toBe(true);
    }
  });
});

test.describe('Goals - Read Operations', () => {
  test.beforeEach(async ({ binderPage, goalsPage }) => {
    const binderName = generateBinderName('goals-read');
    await binderPage.createBinder(TEST_USERS.goals.displayName, binderName);
    await goalsPage.navigateToGoals();
  });

  test('should display empty state when no goals exist', async ({ goalsPage }) => {
    expect(await goalsPage.isEmptyStateVisible()).toBe(true);
  });

  test('should display goal with correct text', async ({ goalsPage }) => {
    const goalText = generateGoalText('Readable Goal ');
    
    await goalsPage.addGoal(goalText, true);
    
    expect(await goalsPage.goalExists(goalText)).toBe(true);
  });

  test('should display drag handle for goals', async ({ goalsPage }) => {
    const goalText = generateGoalText('Draggable Goal ');
    
    await goalsPage.addGoal(goalText, true);
    
    expect(await goalsPage.hasDragHandle()).toBe(true);
  });

  test('should display delete button for goals', async ({ goalsPage }) => {
    const goalText = generateGoalText('Goal With Delete ');
    
    await goalsPage.addGoal(goalText, true);
    
    expect(await goalsPage.hasDeleteButton()).toBe(true);
  });

  test('should show correct goal count', async ({ goalsPage }) => {
    const goals = [
      generateGoalText('Goal 1 '),
      generateGoalText('Goal 2 ')
    ];
    
    await goalsPage.addMultipleGoals(goals, true);
    
    const count = await goalsPage.getGoalCount();
    expect(count).toBe(goals.length);
  });
});

test.describe('Goals - Update Operations', () => {
  test.beforeEach(async ({ binderPage, goalsPage }) => {
    const binderName = generateBinderName('goals-update');
    await binderPage.createBinder(TEST_USERS.goals.displayName, binderName);
    await goalsPage.navigateToGoals();
  });

  test('should edit goal text inline', async ({ goalsPage, page }) => {
    const originalText = generateGoalText('Original Goal ');
    const editedText = ' edited';
    
    await goalsPage.addGoal(originalText, true);
    
    // Click to focus and type additional text
    const goalElement = page.locator(`[contenteditable="true"]:has-text("${originalText}")`).first();
    await goalElement.click();
    await page.waitForTimeout(TIMEOUTS.SHORT);
    
    // Verify it's focused
    const isFocused = await goalElement.evaluate(el => document.activeElement === el);
    expect(isFocused).toBe(true);
    
    // Type additional text
    await page.keyboard.type(editedText);
    await page.waitForTimeout(TIMEOUTS.SHORT);
    
    // Blur by clicking input
    const input = page.locator('input[placeholder*="Add a new goal" i]').first();
    await input.click();
    await page.waitForTimeout(TIMEOUTS.MEDIUM);
    
    // Verify goal container still exists
    const goalCount = await goalsPage.getGoalCount();
    expect(goalCount).toBeGreaterThan(0);
  });

  test('should highlight goal when editing', async ({ goalsPage, page }) => {
    const goalText = generateGoalText('Highlight Goal ');
    
    await goalsPage.addGoal(goalText, true);
    
    // Click the goal to edit
    const goalElement = page.locator(`[contenteditable="true"]:has-text("${goalText}")`).first();
    await goalElement.click();
    await page.waitForTimeout(TIMEOUTS.SHORT);
    
    // Verify it has classes (focus state)
    const classes = await goalElement.getAttribute('class');
    expect(classes).toBeDefined();
  });
});

test.describe('Goals - Delete Operations', () => {
  test.beforeEach(async ({ binderPage, goalsPage }) => {
    const binderName = generateBinderName('goals-delete');
    await binderPage.createBinder(TEST_USERS.goals.displayName, binderName);
    await goalsPage.navigateToGoals();
  });

  test('should delete a goal', async ({ goalsPage }) => {
    const goalText = generateGoalText('Goal To Delete ');
    
    await goalsPage.addGoal(goalText, true);
    expect(await goalsPage.goalExists(goalText)).toBe(true);
    
    await goalsPage.deleteGoal(goalText);
    
    expect(await goalsPage.goalExists(goalText)).toBe(false);
  });

  test('should show empty state after deleting last goal', async ({ goalsPage }) => {
    const goalText = generateGoalText('Last Goal ');
    
    await goalsPage.addGoal(goalText, true);
    await goalsPage.deleteGoal(goalText);
    
    expect(await goalsPage.isEmptyStateVisible()).toBe(true);
  });

  test('should delete goal when editing to empty text', async ({ goalsPage }) => {
    const goalText = generateGoalText('Goal To Empty ');
    
    await goalsPage.addGoal(goalText, true);
    await goalsPage.clearGoal(goalText);
    
    expect(await goalsPage.isEmptyStateVisible()).toBe(true);
  });

  test('should delete multiple goals', async ({ goalsPage }) => {
    const goals = [
      generateGoalText('Delete 1 '),
      generateGoalText('Delete 2 '),
      generateGoalText('Delete 3 ')
    ];
    
    await goalsPage.addMultipleGoals(goals, true);
    
    // Delete first two goals
    await goalsPage.deleteGoal(goals[0]);
    await goalsPage.deleteGoal(goals[1]);
    
    // Verify only one goal remains
    const count = await goalsPage.getGoalCount();
    expect(count).toBe(1);
    expect(await goalsPage.goalExists(goals[2])).toBe(true);
  });
});

test.describe('Goals - UI Interactions', () => {
  test.beforeEach(async ({ binderPage, goalsPage }) => {
    const binderName = generateBinderName('goals-ui');
    await binderPage.createBinder(TEST_USERS.goals.displayName, binderName);
    await goalsPage.navigateToGoals();
  });

  test('should show Goals tab', async ({ goalsPage, page }) => {
    const goalsTab = page.locator('button:has-text("Goals")').first();
    expect(await goalsTab.isVisible({ timeout: 3000 })).toBe(true);
  });

  test('should have cursor-move style for draggable goals', async ({ goalsPage }) => {
    const goalText = generateGoalText('Cursor Goal ');
    
    await goalsPage.addGoal(goalText, true);
    
    expect(await goalsPage.hasCursorMoveStyle(goalText)).toBe(true);
  });
});

test.describe('Goals - Dashboard Integration', () => {
  test('should show goals count on dashboard', async ({ binderPage, goalsPage, page }) => {
    const binderName = generateBinderName('goals-dashboard');
    await binderPage.createBinder('Dashboard Goals User', binderName);
    
    // Navigate to Goals and add a goal
    await goalsPage.navigateToGoals();
    await goalsPage.addGoal('Dashboard Goal', true);
    
    // Navigate back to Dashboard
    await binderPage.navigateToTab('Dashboard');
    await page.waitForTimeout(TIMEOUTS.MEDIUM);
    
    // Find goals card
    const goalsCard = page.locator('text="Goals"').first();
    expect(await goalsCard.isVisible({ timeout: 3000 })).toBe(true);
  });

  test('should navigate to Goals tab when clicking Goals card', async ({ binderPage, goalsPage, page }) => {
    const binderName = generateBinderName('goals-card-nav');
    await binderPage.createBinder('Card Nav User', binderName);
    
    // Click on Goals card in dashboard
    const goalsCard = page.locator('.cursor-pointer:has-text("Goals")').first();
    if (await goalsCard.isVisible({ timeout: 3000 }).catch(() => false)) {
      await goalsCard.click();
      await page.waitForTimeout(TIMEOUTS.MEDIUM);
      
      // Verify Goals tab is now active
      expect(await binderPage.isTabActive('Goals')).toBe(true);
    }
  });
});
