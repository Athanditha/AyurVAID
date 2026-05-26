const request = require('supertest');
const express = require('express');
const fs = require('fs');
const path = require('path');
const chatRoutes = require('../routes/chat');

// Mock Auth Middleware
jest.mock('../middleware/auth', () => ({
  authenticateToken: (req, res, next) => {
    req.user = { id: 'test_user_id' };
    next();
  }
}));

// We need to mock fs to avoid writing actual files during tests
jest.mock('fs', () => {
  const actualFs = jest.requireActual('fs');
  return {
    ...actualFs,
    existsSync: jest.fn(() => true),
    mkdirSync: jest.fn(),
    readFileSync: jest.fn(() => '[]'),
    writeFileSync: jest.fn()
  };
});

describe('Feedback Loop (chat.js)', () => {
  let app;
  
  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use('/api/chat', chatRoutes);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should successfully record positive feedback', async () => {
    const payload = {
      conversationId: 'conv_123',
      messageId: 'msg_456',
      feedback: 'positive',
      rating: 5,
      comment: 'Very helpful'
    };

    const res = await request(app)
      .post('/api/chat/feedback')
      .send(payload);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(fs.writeFileSync).toHaveBeenCalled();
    
    // Check what was written to the mock DB
    const writeArgs = fs.writeFileSync.mock.calls[0];
    expect(writeArgs[0]).toContain('rule_based_feedback.json');
    
    const writtenData = JSON.parse(writeArgs[1]);
    expect(writtenData[0].rating).toBe(5);
    expect(writtenData[0].userId).toBe('test_user_id');
  });

  it('should return 400 if feedback and rating are missing', async () => {
    const payload = {
      conversationId: 'conv_123',
      messageId: 'msg_456'
      // missing rating and feedback
    };

    const res = await request(app)
      .post('/api/chat/feedback')
      .send(payload);

    expect(res.status).toBe(400);
    expect(res.body.error).toContain('Feedback or rating is required');
    expect(fs.writeFileSync).not.toHaveBeenCalled();
  });
});
