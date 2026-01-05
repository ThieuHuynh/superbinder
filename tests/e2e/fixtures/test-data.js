/**
 * Test Data Fixtures for E2E Tests
 */

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

  // Selectors for common elements
  selectors: {
    // Section tree
    treeNode: '.tree-node',
    sectionTreeViewer: '.section-tree-viewer',
    treeContainer: '.tree-container',

    // Buttons
    addRootSectionButton: '[title="Add Root Section"], button:has(.pi-plus)',
    addChildSectionButton: 'button:has(.pi-plus)',
    editButton: 'button:has(.pi-pencil)',
    deleteButton: 'button:has(.pi-trash)',
    uploadButton: 'button:has(.pi-upload)',
    renderButton: 'button:has(.pi-eye)',

    // Expand/collapse
    expandToggle: '.expand-collapse',
    caretRight: '.pi-caret-right',
    caretDown: '.pi-caret-down',

    // Checkbox
    checkbox: '.checkbox',
    checkboxChecked: '.checkbox svg',

    // Input fields
    editInput: 'input[id^="edit-"]',
    renameInput: 'input[placeholder*="Rename"]',

    // Navigation
    sectionsTab: 'text=Sections, button:has-text("Sections")',

    // Session setup
    channelInput: 'input[placeholder*="channel" i], input[name="channelName"]',
    displayNameInput: 'input[placeholder*="name" i], input[name="displayName"]',
    joinButton: 'button:has-text("Join"), button[type="submit"]',

    // Action buttons container
    actionButtons: '.action-buttons',

    // Text elements
    sectionName: '.truncate, span:not(:has(*))',
  },

  /**
   * Generate unique test identifiers
   */
  generateId: () => Date.now().toString(36) + Math.random().toString(36).substr(2),

  /**
   * Generate unique channel name
   */
  generateChannelName: (prefix = 'test-') => prefix + Date.now(),

  /**
   * Generate unique section name
   */
  generateSectionName: (prefix = 'Section ') => prefix + Date.now(),
};
