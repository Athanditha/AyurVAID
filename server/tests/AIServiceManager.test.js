const AIServiceManager = require('../services/AIServiceManager');

// Mock dependencies
jest.mock('../services/CustomAI', () => {
  return jest.fn().mockImplementation(() => {
    return {
      isAvailable: jest.fn().mockResolvedValue(true),
      generateResponse: jest.fn().mockResolvedValue({ message: 'Mocked Custom Response' })
    };
  });
});

jest.mock('../services/GeminiAI', () => {
  return jest.fn().mockImplementation(() => {
    return {
      isAvailable: jest.fn().mockResolvedValue(true),
      generateResponse: jest.fn().mockResolvedValue({ message: 'Mocked Gemini Response' })
    };
  });
});

jest.mock('../services/KnowledgeBase', () => ({
  search: jest.fn(() => []),
  formatContext: jest.fn(() => '')
}));

describe('AIServiceManager (Orchestrator)', () => {
  let manager;

  beforeEach(() => {
    process.env.AI_PROVIDER = 'gemini';
    manager = new AIServiceManager();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize with Gemini as default if available', async () => {
    await manager.initializeProvider();
    expect(manager.currentProvider).toBe('gemini');
  });

  it('should fallback to custom if gemini is unavailable during init', async () => {
    // Force gemini to be unavailable
    manager.providers.gemini.isAvailable.mockResolvedValueOnce(false);
    await manager.initializeProvider();
    expect(manager.currentProvider).toBe('custom');
  });

  it('should generate response using the current provider', async () => {
    const messages = [{ role: 'user', content: 'hello' }];
    const response = await manager.generateResponse(messages);
    expect(response.message).toBe('Mocked Gemini Response');
    expect(manager.providers.gemini.generateResponse).toHaveBeenCalled();
  });

  it('should seamlessy fallback to custom engine when gemini fails during generation', async () => {
    // Force gemini to throw an error (e.g. rate limit, timeout)
    manager.providers.gemini.generateResponse.mockRejectedValueOnce(new Error('API 429 Rate Limit'));
    
    const messages = [{ role: 'user', content: 'hello' }];
    const response = await manager.generateResponse(messages);
    
    // It should have failed over to Custom AI
    expect(response.fallbackUsed).toBe(true);
    expect(response.message).toBe('Mocked Custom Response');
    expect(manager.providers.custom.generateResponse).toHaveBeenCalled();
  });
});
