/**
 * Test Data Fixtures for E2E Tests
 * Centralized test data, selectors, and configuration
 */

/**
 * Generate unique test identifier
 * @returns {string}
 */
const generateId = () => Date.now().toString(36) + Math.random().toString(36).substr(2, 5);

/**
 * Generate unique channel/binder name
 * @param {string} prefix - Prefix for the name
 * @returns {string}
 */
const generateChannelName = (prefix = 'test-') => prefix + generateId();

/**
 * Generate unique section name
 * @param {string} prefix - Prefix for the section name
 * @returns {string}
 */
const generateSectionName = (prefix = 'Section ') => prefix + Date.now();

/**
 * Generate unique goal text
 * @param {string} prefix - Prefix for the goal text
 * @returns {string}
 */
const generateGoalText = (prefix = 'Goal ') => prefix + Date.now();

module.exports = {
  // Section test data
  sections: {
    rootSection: {
      name: 'Root Section',
      expectedOrder: 0,
    },
    childSection: {
      name: 'Child Section',
      expectedOrder: 0,
    },
    renamedSection: {
      originalName: 'Original Name',
      newName: 'Renamed Section',
    },
  },

  // Goals test data
  goals: {
    sample: [
      'Complete project documentation',
      'Review pull requests',
      'Update test coverage',
    ],
    testGoal: 'Test Goal',
    longGoal: 'This is a very long goal text that should wrap properly in the UI and be fully visible to users',
  },

  // User test data
  users: {
    primary: {
      displayName: 'Test User',
      channelPrefix: 'test-channel-',
    },
    secondary: {
      displayName: 'Other User',
      channelPrefix: 'collab-test-',
    },
    goals: {
      displayName: 'Goals Test User',
    },
    sections: {
      displayName: 'Sections Test User',
    },
  },

  // Binder test data
  binders: {
    testBinder: {
      name: generateChannelName('test-binder-'),
      displayName: 'Test User',
    },
  },

  // Timeouts and delays
  timeouts: {
    short: 300,
    medium: 500,
    long: 1000,
    networkIdle: 2000,
    visibility: 3000,
    animation: 5000,
  },

  // Helper functions
  generateId,
  generateChannelName,
  generateSectionName,
  generateGoalText,
};
