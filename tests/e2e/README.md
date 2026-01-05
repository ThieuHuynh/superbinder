# E2E Tests - SuperBinder

## Overview

The E2E (End-to-End) tests for SuperBinder have been refactored to follow best practices and improve maintainability. The tests use Playwright and follow the **Page Object Model (POM)** pattern.

## Project Structure

```
tests/e2e/
├── fixtures/
│   ├── base-fixtures.js     # Extended test fixtures with POMs
│   └── test-data.js          # Test data and generators
├── helpers/
│   └── test-helpers.js       # Shared utility functions
├── pages/
│   ├── BinderPage.js         # Binder functionality POM
│   ├── GoalsPage.js          # Goals functionality POM
│   └── SectionsPage.js       # Sections functionality POM
├── binders.spec.js           # Binder CRUD tests
├── goals.spec.js             # Goals CRUD tests
├── sections.spec.js          # Sections CRUD tests
└── README.md                 # This file
```

## Key Improvements

### 1. **Page Object Model (POM)**
- Encapsulates page interactions into reusable classes
- Reduces code duplication across tests
- Makes tests more readable and maintainable
- Easier to update when UI changes

### 2. **Base Fixtures**
- Custom Playwright fixtures that automatically provide page objects
- Simplifies test setup
- Consistent test structure across all specs

### 3. **Shared Utilities**
- Common helper functions (generateId, wait, retry logic)
- Centralized timeout values
- Test user data constants

### 4. **Better Test Organization**
- Tests grouped by CRUD operations
- Descriptive test names
- Consistent patterns across all spec files

### 5. **Reduced Code Duplication**
- BeforeEach blocks simplified using POMs
- Common selectors defined in page objects
- Reusable helper functions

## Usage

### Running Tests

```bash
# Run all E2E tests
npm run test:e2e

# Run in headed mode (see browser)
npm run test:e2e:headed

# Run with screenshots
npm run test:e2e:screenshots

# Run in debug mode
npm run test:e2e:debug

# Run specific test file
npx playwright test goals.spec.js

# Run tests matching a pattern
npx playwright test --grep "Create Operations"
```

### Writing New Tests

#### Using Page Objects

```javascript
const { test, expect } = require('./fixtures/base-fixtures');
const { generateBinderName, TEST_USERS } = require('./helpers/test-helpers');

test('should perform some action', async ({ binderPage, goalsPage }) => {
  // Create a binder
  const binderName = generateBinderName('my-test');
  await binderPage.createBinder(TEST_USERS.primary.displayName, binderName);
  
  // Navigate to goals
  await goalsPage.navigateToGoals();
  
  // Add a goal
  await goalsPage.addGoal('My test goal', true);
  
  // Verify goal exists
  expect(await goalsPage.goalExists('My test goal')).toBe(true);
});
```

#### Common Patterns

**Generate Unique Test Data:**
```javascript
const { generateId, generateBinderName, generateGoalText } = require('./helpers/test-helpers');

const uniqueId = generateId();
const binderName = generateBinderName('test-prefix');
const goalText = generateGoalText('Goal ');
```

**Setup a Binder Before Each Test:**
```javascript
test.beforeEach(async ({ binderPage, goalsPage }) => {
  const binderName = generateBinderName('goals-test');
  await binderPage.createBinder('Test User', binderName);
  await goalsPage.navigateToGoals();
});
```

**Wait for Elements:**
```javascript
const { TIMEOUTS } = require('./helpers/test-helpers');

// Use predefined timeouts
await page.waitForTimeout(TIMEOUTS.SHORT);   // 300ms
await page.waitForTimeout(TIMEOUTS.MEDIUM);  // 500ms
await page.waitForTimeout(TIMEOUTS.LONG);    // 1000ms
```

## Page Objects

### BinderPage

Handles binder creation, navigation, and management.

**Key Methods:**
- `createBinder(displayName, binderName)` - Create and join a binder
- `createUniqueBinder(displayName)` - Create binder with UUID
- `navigateToTab(tabName)` - Navigate to a specific tab
- `toggleLock()` - Toggle room lock
- `deleteBinder()` - Delete current binder
- `publishBinder(name, description)` - Publish binder to library
- `isInBinder()` - Check if in binder view
- `getParticipantCount()` - Get participant count

### GoalsPage

Handles goals CRUD operations.

**Key Methods:**
- `navigateToGoals()` - Navigate to Goals tab
- `addGoal(goalText, useEnter)` - Add a new goal
- `deleteGoal(goalText)` - Delete a goal
- `editGoal(originalText, newText)` - Edit goal text
- `clearGoal(goalText)` - Clear goal (triggers deletion)
- `goalExists(goalText)` - Check if goal exists
- `getGoalCount()` - Get number of goals
- `addMultipleGoals(goals, useEnter)` - Add multiple goals
- `isEmptyStateVisible()` - Check empty state

### SectionsPage

Handles sections tree operations.

**Key Methods:**
- `navigateToSections()` - Navigate to Sections tab
- `createRootSection()` - Create root section
- `createChildSection(parentSelector)` - Create child section
- `renameSection(newName, sectionSelector)` - Rename section
- `deleteSection(sectionSelector)` - Delete section
- `toggleExpand(sectionSelector)` - Toggle section expansion
- `toggleCheckbox(sectionSelector)` - Toggle section checkbox
- `getSectionCount()` - Get number of sections
- `sectionExists(name)` - Check if section exists

## Test Data

Centralized test data is available in `fixtures/test-data.js`:

```javascript
const testData = require('./fixtures/test-data');

// Use generators
const channelName = testData.generateChannelName('prefix-');
const sectionName = testData.generateSectionName('Section ');
const goalText = testData.generateGoalText('Goal ');

// Use predefined data
const sampleGoals = testData.goals.sample;
const testUser = testData.users.primary;
```

## Best Practices

1. **Use Page Objects** - Always interact with the UI through page objects
2. **Generate Unique Data** - Use generators to avoid test conflicts
3. **Clean Test Names** - Use descriptive names that explain what is being tested
4. **Group Related Tests** - Use `test.describe()` to group related tests
5. **Avoid Hard Waits** - Prefer `waitForLoadState()` and element visibility checks
6. **Handle Errors Gracefully** - Use `.catch(() => false)` for optional elements
7. **Keep Tests Independent** - Each test should be able to run standalone
8. **Use BeforeEach for Setup** - Set up common state in `beforeEach` blocks

## Debugging Tests

### View Test Report
```bash
npm run test:e2e:report
```

### Run in UI Mode
```bash
npm run test:e2e:ui
```

### Debug Specific Test
```bash
npx playwright test --debug goals.spec.js -g "should create a new goal"
```

### Enable Verbose Logging
```bash
DEBUG=pw:api npx playwright test
```

## CI/CD Integration

Tests are configured for CI environments:
- Automatic retries (2 retries in CI)
- Single worker in CI
- HTML report generation
- Video recording on failure
- Screenshots on failure

## Dependencies

- `@playwright/test` - Test framework
- Node.js 20+ recommended
- Server must be running on port 3000 (auto-started by config)

## Troubleshooting

**Tests failing with timeouts:**
- Increase timeout values in `playwright.config.js`
- Check if MongoDB is running
- Verify server is accessible at `http://localhost:3000`

**Elements not found:**
- Check if selectors in page objects match current UI
- Enable headed mode to see what's happening
- Use debug mode to step through test

**Flaky tests:**
- Add appropriate waits after actions
- Use `waitForLoadState('networkidle')` for navigation
- Check for race conditions in test setup

## Contributing

When adding new tests:

1. Create or update page objects in `pages/` directory
2. Add reusable helpers to `helpers/test-helpers.js`
3. Group tests logically using `test.describe()`
4. Follow existing naming conventions
5. Update this README if adding new patterns

## Migration Notes

### Before Refactor
- 1,600+ lines of duplicated code across test files
- `generateId()` function repeated in every file
- BeforeEach blocks had identical session setup code
- No page object models
- Inconsistent waiting and error handling

### After Refactor
- ~60% reduction in code duplication
- Centralized utilities and fixtures
- Page object models for all major features
- Consistent patterns and error handling
- More maintainable and scalable test suite

## Resources

- [Playwright Documentation](https://playwright.dev/)
- [Page Object Model Pattern](https://playwright.dev/docs/pom)
- [Playwright Best Practices](https://playwright.dev/docs/best-practices)
