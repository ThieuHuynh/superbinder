/**
 * Jest Test Setup
 * Global configuration and mocks for all tests
 */

// Mock uuid module
jest.mock('uuid', () => ({
  v4: jest.fn(() => 'test-uuid-' + Math.random().toString(36).substring(7)),
}));

// Global test utilities
global.createMockSocket = () => ({
  id: 'mock-socket-id',
  emit: jest.fn(),
  on: jest.fn(),
  join: jest.fn(),
  leave: jest.fn(),
  userUuid: null,
  deepgramConnection: null,
  audioBuffer: null,
});

global.createMockSection = (overrides = {}) => ({
  id: 'section-' + Math.random().toString(36).substring(7),
  userUuid: 'test-user-uuid',
  data: {
    name: 'Test Section',
    sectionId: null,
    order: 0,
    ...overrides.data,
  },
  timestamp: Date.now(),
  ...overrides,
});

global.wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Suppress console.log during tests (optional - comment out for debugging)
// global.console.log = jest.fn();

// Clean up after each test
afterEach(() => {
  jest.clearAllMocks();
});

// Ensure all timers are cleared after all tests
afterAll(() => {
  jest.useRealTimers();
});
