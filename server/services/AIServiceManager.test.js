const AIServiceManager = require('./AIServiceManager');
const KnowledgeBase = require('./KnowledgeBase');

// Mock KnowledgeBase
jest.mock('./KnowledgeBase', () => ({
  search: jest.fn(() => []),
  formatContext: jest.fn(() => 'Mocked RAG Context')
}));

// Mock the AI Providers
jest.mock('./GeminiAI', () => {
  return jest.fn().mockImplementation(() => {
    return {
      isAvailable: jest.fn().mockResolvedValue(true),
      generateResponse: jest.fn().mockResolvedValue({ message: 'Gemini Response' })
    };
  });
});

jest.mock('./CustomAI', () => {
  return jest.fn().mockImplementation(() => {
    return {
      isAvailable: jest.fn().mockResolvedValue(true),
      generateResponse: jest.fn().mockResolvedValue({ message: 'Custom Response' })
    };
  });
});

describe('AIServiceManager Unit Tests', () => {
  let serviceManager;

  beforeEach(() => {
    jest.clearAllMocks();
    serviceManager = new AIServiceManager();
  });

  describe('Initialization and Availability', () => {
    test('should initialize with gemini as default provider', () => {
      expect(serviceManager.getCurrentProvider()).toBe('gemini');
    });

    test('should fallback to custom if gemini is not available on init', async () => {
      // Temporarily mock gemini to be unavailable
      const GeminiAI = require('./GeminiAI');
      GeminiAI.mockImplementationOnce(() => ({
        isAvailable: jest.fn().mockResolvedValue(false)
      }));
      
      const manager = new AIServiceManager();
      await manager.initializeProvider();
      
      expect(manager.getCurrentProvider()).toBe('custom');
    });

    test('should return list of available providers', async () => {
      const available = await serviceManager.getAvailableProviders();
      expect(available).toEqual({ custom: true, gemini: true });
    });
  });

  describe('Provider Switching', () => {
    test('should successfully switch to available provider', async () => {
      await serviceManager.switchProvider('custom');
      expect(serviceManager.getCurrentProvider()).toBe('custom');
    });

    test('should throw error when switching to unknown provider', async () => {
      await expect(serviceManager.switchProvider('unknown_provider'))
        .rejects.toThrow('Unknown provider: unknown_provider');
    });
  });

  describe('Response Generation & Fallback', () => {
    test('should generate response using current provider', async () => {
      const messages = [{ role: 'user', content: 'hello' }];
      const response = await serviceManager.generateResponse(messages);
      
      expect(response.message).toBe('Gemini Response');
      expect(response.provider).toBe('gemini');
    });

    test('should execute fallback if primary provider throws error during generation', async () => {
      const messages = [{ role: 'user', content: 'hello' }];
      
      // Force the primary provider (gemini) to fail
      serviceManager.providers.gemini.generateResponse.mockRejectedValueOnce(new Error('API Down'));
      
      const response = await serviceManager.generateResponse(messages);
      
      // Should have successfully fallen back to custom
      expect(response.message).toContain('Custom Response');
      expect(response.fallbackUsed).toBe(true);
      expect(response.originalProvider).toBe('gemini');
      // After fallback, current provider should still be gemini for future requests
      expect(serviceManager.getCurrentProvider()).toBe('gemini');
    });
  });

  describe('RAG (Retrieval-Augmented Generation) Integration', () => {
    test('should inject KnowledgeBase context if search yields results', async () => {
      const messages = [{ role: 'user', content: 'what is ashwagandha?' }];
      
      // Mock KB to return a result
      KnowledgeBase.search.mockReturnValueOnce([{ type: 'herb', name: 'Ashwagandha' }]);
      KnowledgeBase.formatContext.mockReturnValueOnce('Ashwagandha is an adaptogen.');

      await serviceManager.generateResponse(messages);

      // Verify that the system message was injected into the messages array
      expect(messages[0].role).toBe('system');
      expect(messages[0].content).toContain('Ashwagandha is an adaptogen');
    });
  });
});
