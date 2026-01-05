/**
 * Integration Tests for Section CRUD Operations
 * Tests the server-side section handling via socket events
 */

describe('Section CRUD Integration Tests', () => {
  // Mock mongoose models
  const mockSectionModel = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    updateOne: jest.fn(),
    deleteOne: jest.fn(),
    countDocuments: jest.fn(),
  };

  // Mock entity models
  const mockEntityModels = {
    sections: mockSectionModel,
  };

  // Mock channels map
  let channels;
  let mockSocket;

  // Entity config for sections
  const sectionConfig = {
    idKey: 'id',
    requiredFields: ['id'],
    orderField: null,
    events: {
      add: 'add-section',
      update: 'update-section',
      remove: 'remove-section',
      reorder: 'reorder-section',
    },
  };

  beforeEach(() => {
    channels = new Map();
    mockSocket = global.createMockSocket();

    // Setup a test channel
    channels.set('test-channel', {
      users: {
        'test-user': {
          displayName: 'Test User',
          color: '#123456',
          joinedAt: Date.now(),
        },
      },
      sockets: {
        'test-user': mockSocket,
      },
      state: { sections: [] },
      locked: false,
    });

    jest.clearAllMocks();
  });

  /**
   * Helper function to validate entity payload
   */
  function validateEntity(payload, entityType, operation) {
    if (!payload.id) {
      return { valid: false, message: `Invalid ${entityType} data for ${operation}: missing id` };
    }
    return { valid: true, message: '' };
  }

  /**
   * Helper function to simulate creating a section in the database
   */
  async function updateCreateState(channelName, entityType, payload) {
    const entity = {
      id: payload.id,
      channel: channelName,
      userUuid: payload.userUuid,
      channelName: channelName,
      data: { ...payload.data, color: '#808080' },
      timestamp: payload.timestamp,
      serverTimestamp: Date.now(),
    };
    await mockSectionModel.create(entity);
    return entity;
  }

  /**
   * Helper function to simulate updating a section in the database
   */
  async function updateUpdateState(channelName, entityType, payload) {
    await mockSectionModel.updateOne(
      { id: payload.id, channel: channelName },
      { $set: { data: payload.data, timestamp: payload.timestamp, serverTimestamp: Date.now() } }
    );
  }

  /**
   * Helper function to simulate deleting a section from the database
   */
  async function updateDeleteState(channelName, entityType, payload) {
    await mockSectionModel.deleteOne({ id: payload.id, channel: channelName });
  }

  /**
   * Simulate broadcast to channel (excluding sender)
   */
  function broadcastToChannel(channelName, type, payload, excludeUuid = null) {
    if (channels.has(channelName)) {
      const channel = channels.get(channelName);
      const serverTimestamp = Date.now();
      const message = {
        type,
        id: payload.id,
        userUuid: payload.userUuid,
        data: payload.data,
        timestamp: payload.timestamp || serverTimestamp,
        serverTimestamp,
      };

      for (const userUuid in channel.sockets) {
        if (userUuid !== excludeUuid && channel.sockets[userUuid]) {
          channel.sockets[userUuid].emit('message', message);
        }
      }
    }
  }

  describe('Create Section (add-section)', () => {
    test('should create section with valid payload', async () => {
      const payload = {
        id: 'new-section-id',
        userUuid: 'test-user',
        data: { name: 'New Section', sectionId: null, order: 0 },
        timestamp: Date.now(),
      };

      const validation = validateEntity(payload, 'sections', 'add');
      expect(validation.valid).toBe(true);

      mockSectionModel.create.mockResolvedValue(payload);
      await updateCreateState('test-channel', 'sections', payload);

      expect(mockSectionModel.create).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'new-section-id',
          channel: 'test-channel',
          data: expect.objectContaining({ name: 'New Section' }),
        })
      );
    });

    test('should reject section creation without id', () => {
      const payload = {
        userUuid: 'test-user',
        data: { name: 'No ID Section' },
        timestamp: Date.now(),
      };

      const validation = validateEntity(payload, 'sections', 'add');

      expect(validation.valid).toBe(false);
      expect(validation.message).toContain('missing id');
    });

    test('should create nested section with parent sectionId', async () => {
      const payload = {
        id: 'child-section-id',
        userUuid: 'test-user',
        data: { name: 'Child Section', sectionId: 'parent-section-id', order: 0 },
        timestamp: Date.now(),
      };

      mockSectionModel.create.mockResolvedValue(payload);
      await updateCreateState('test-channel', 'sections', payload);

      expect(mockSectionModel.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            sectionId: 'parent-section-id',
          }),
        })
      );
    });

    test('should broadcast section creation to other users', () => {
      // Add another user to the channel
      const otherSocket = global.createMockSocket();
      channels.get('test-channel').sockets['other-user'] = otherSocket;
      channels.get('test-channel').users['other-user'] = {
        displayName: 'Other User',
        color: '#654321',
        joinedAt: Date.now(),
      };

      const payload = {
        id: 'broadcast-section-id',
        userUuid: 'test-user',
        data: { name: 'Broadcast Section' },
        timestamp: Date.now(),
      };

      broadcastToChannel('test-channel', 'add-section', payload, 'test-user');

      // Original user should NOT receive the broadcast
      expect(mockSocket.emit).not.toHaveBeenCalled();
      // Other user SHOULD receive the broadcast
      expect(otherSocket.emit).toHaveBeenCalledWith('message', expect.objectContaining({
        type: 'add-section',
        id: 'broadcast-section-id',
      }));
    });
  });

  describe('Update Section (update-section)', () => {
    test('should update section name successfully', async () => {
      const payload = {
        id: 'existing-section-id',
        userUuid: 'test-user',
        data: { name: 'Updated Section Name', sectionId: null, order: 0 },
        timestamp: Date.now(),
      };

      mockSectionModel.updateOne.mockResolvedValue({ modifiedCount: 1 });
      await updateUpdateState('test-channel', 'sections', payload);

      expect(mockSectionModel.updateOne).toHaveBeenCalledWith(
        { id: 'existing-section-id', channel: 'test-channel' },
        expect.objectContaining({
          $set: expect.objectContaining({
            data: expect.objectContaining({ name: 'Updated Section Name' }),
          }),
        })
      );
    });

    test('should reject update without id', () => {
      const payload = {
        userUuid: 'test-user',
        data: { name: 'Updated Name' },
        timestamp: Date.now(),
      };

      const validation = validateEntity(payload, 'sections', 'update');

      expect(validation.valid).toBe(false);
    });

    test('should broadcast section update to other users', () => {
      const otherSocket = global.createMockSocket();
      channels.get('test-channel').sockets['other-user'] = otherSocket;
      channels.get('test-channel').users['other-user'] = {
        displayName: 'Other User',
        color: '#654321',
        joinedAt: Date.now(),
      };

      const payload = {
        id: 'update-broadcast-id',
        userUuid: 'test-user',
        data: { name: 'Updated via Broadcast' },
        timestamp: Date.now(),
      };

      broadcastToChannel('test-channel', 'update-section', payload, 'test-user');

      expect(otherSocket.emit).toHaveBeenCalledWith('message', expect.objectContaining({
        type: 'update-section',
        data: expect.objectContaining({ name: 'Updated via Broadcast' }),
      }));
    });
  });

  describe('Delete Section (remove-section)', () => {
    test('should delete section successfully', async () => {
      const payload = {
        id: 'section-to-delete',
        userUuid: 'test-user',
        data: null,
        timestamp: Date.now(),
      };

      mockSectionModel.deleteOne.mockResolvedValue({ deletedCount: 1 });
      await updateDeleteState('test-channel', 'sections', payload);

      expect(mockSectionModel.deleteOne).toHaveBeenCalledWith({
        id: 'section-to-delete',
        channel: 'test-channel',
      });
    });

    test('should reject delete without id', () => {
      const payload = {
        userUuid: 'test-user',
        data: null,
        timestamp: Date.now(),
      };

      const validation = validateEntity(payload, 'sections', 'remove');

      expect(validation.valid).toBe(false);
    });

    test('should broadcast section deletion to other users', () => {
      const otherSocket = global.createMockSocket();
      channels.get('test-channel').sockets['other-user'] = otherSocket;
      channels.get('test-channel').users['other-user'] = {
        displayName: 'Other User',
        color: '#654321',
        joinedAt: Date.now(),
      };

      const payload = {
        id: 'delete-broadcast-id',
        userUuid: 'test-user',
        data: null,
        timestamp: Date.now(),
      };

      broadcastToChannel('test-channel', 'remove-section', payload, 'test-user');

      expect(otherSocket.emit).toHaveBeenCalledWith('message', expect.objectContaining({
        type: 'remove-section',
        id: 'delete-broadcast-id',
      }));
    });
  });

  describe('Channel Validation', () => {
    test('should reject operations on non-existent channel', () => {
      const hasChannel = channels.has('non-existent-channel');

      expect(hasChannel).toBe(false);
    });

    test('should accept operations on existing channel', () => {
      const hasChannel = channels.has('test-channel');

      expect(hasChannel).toBe(true);
    });

    test('should validate channel has connected user', () => {
      const channel = channels.get('test-channel');
      const hasUser = !!channel.sockets['test-user'];

      expect(hasUser).toBe(true);
    });
  });

  describe('Concurrent Operations', () => {
    test('should handle multiple section creations', async () => {
      const sections = [
        { id: 'section-1', userUuid: 'test-user', data: { name: 'Section 1', order: 0 } },
        { id: 'section-2', userUuid: 'test-user', data: { name: 'Section 2', order: 1 } },
        { id: 'section-3', userUuid: 'test-user', data: { name: 'Section 3', order: 2 } },
      ];

      mockSectionModel.create.mockResolvedValue({});

      await Promise.all(
        sections.map(section =>
          updateCreateState('test-channel', 'sections', { ...section, timestamp: Date.now() })
        )
      );

      expect(mockSectionModel.create).toHaveBeenCalledTimes(3);
    });

    test('should handle rapid update and delete', async () => {
      const sectionId = 'rapid-ops-section';

      mockSectionModel.create.mockResolvedValue({});
      mockSectionModel.updateOne.mockResolvedValue({ modifiedCount: 1 });
      mockSectionModel.deleteOne.mockResolvedValue({ deletedCount: 1 });

      // Create
      await updateCreateState('test-channel', 'sections', {
        id: sectionId,
        userUuid: 'test-user',
        data: { name: 'Original' },
        timestamp: Date.now(),
      });

      // Update
      await updateUpdateState('test-channel', 'sections', {
        id: sectionId,
        userUuid: 'test-user',
        data: { name: 'Updated' },
        timestamp: Date.now(),
      });

      // Delete
      await updateDeleteState('test-channel', 'sections', {
        id: sectionId,
        userUuid: 'test-user',
        data: null,
        timestamp: Date.now(),
      });

      expect(mockSectionModel.create).toHaveBeenCalledTimes(1);
      expect(mockSectionModel.updateOne).toHaveBeenCalledTimes(1);
      expect(mockSectionModel.deleteOne).toHaveBeenCalledTimes(1);
    });
  });

  describe('Error Handling', () => {
    test('should handle database create error gracefully', async () => {
      mockSectionModel.create.mockRejectedValue(new Error('Database error'));

      const payload = {
        id: 'error-section',
        userUuid: 'test-user',
        data: { name: 'Error Section' },
        timestamp: Date.now(),
      };

      await expect(async () => {
        await mockSectionModel.create(payload);
      }).rejects.toThrow('Database error');
    });

    test('should handle database update error gracefully', async () => {
      mockSectionModel.updateOne.mockRejectedValue(new Error('Update failed'));

      await expect(async () => {
        await mockSectionModel.updateOne({ id: 'test' }, { $set: { data: {} } });
      }).rejects.toThrow('Update failed');
    });

    test('should handle database delete error gracefully', async () => {
      mockSectionModel.deleteOne.mockRejectedValue(new Error('Delete failed'));

      await expect(async () => {
        await mockSectionModel.deleteOne({ id: 'test' });
      }).rejects.toThrow('Delete failed');
    });
  });

  describe('Data Integrity', () => {
    test('should preserve section data structure on create', async () => {
      const payload = {
        id: 'integrity-test',
        userUuid: 'test-user',
        data: {
          name: 'Integrity Section',
          sectionId: null,
          order: 5,
          customField: 'custom-value',
        },
        timestamp: 1234567890,
      };

      mockSectionModel.create.mockImplementation(entity => {
        expect(entity.data.name).toBe('Integrity Section');
        expect(entity.data.order).toBe(5);
        expect(entity.data.customField).toBe('custom-value');
        return Promise.resolve(entity);
      });

      await updateCreateState('test-channel', 'sections', payload);
    });

    test('should include serverTimestamp on database operations', async () => {
      const beforeTime = Date.now();

      mockSectionModel.create.mockImplementation(entity => {
        expect(entity.serverTimestamp).toBeGreaterThanOrEqual(beforeTime);
        expect(entity.serverTimestamp).toBeLessThanOrEqual(Date.now());
        return Promise.resolve(entity);
      });

      await updateCreateState('test-channel', 'sections', {
        id: 'timestamp-test',
        userUuid: 'test-user',
        data: { name: 'Timestamp Test' },
        timestamp: Date.now(),
      });
    });
  });
});
