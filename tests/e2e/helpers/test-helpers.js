/**
 * Shared test utilities and helper functions
 */

/**
 * Generate unique test identifier
 * @returns {string}
 */
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
}

/**
 * Generate unique channel/binder name
 * @param {string} prefix - Prefix for the name
 * @returns {string}
 */
function generateBinderName(prefix = 'test') {
  return `${prefix}-${generateId()}`;
}

/**
 * Wait with a safe timeout
 * @param {number} ms - Milliseconds to wait
 * @returns {Promise<void>}
 */
async function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Retry an async function with exponential backoff
 * @param {Function} fn - Async function to retry
 * @param {number} maxRetries - Maximum number of retries
 * @param {number} baseDelay - Base delay in ms
 * @returns {Promise<any>}
 */
async function retryWithBackoff(fn, maxRetries = 3, baseDelay = 100) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await wait(baseDelay * Math.pow(2, i));
    }
  }
}

/**
 * Common timeout values
 */
const TIMEOUTS = {
  SHORT: 300,
  MEDIUM: 500,
  LONG: 1000,
  NETWORK: 2000,
  VISIBILITY: 3000,
  ANIMATION: 5000,
};

/**
 * Common test user data
 */
const TEST_USERS = {
  primary: {
    displayName: 'Test User',
  },
  secondary: {
    displayName: 'Secondary User',
  },
  goals: {
    displayName: 'Goals Test User',
  },
  sections: {
    displayName: 'Sections Test User',
  },
};

module.exports = {
  generateId,
  generateBinderName,
  wait,
  retryWithBackoff,
  TIMEOUTS,
  TEST_USERS,
};
