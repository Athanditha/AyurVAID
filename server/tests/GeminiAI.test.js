const GeminiAI = require('../services/GeminiAI');

jest.mock('@google/generative-ai', () => {
  const mockSendMessage = jest.fn();
  const mockStartChat = jest.fn(() => ({
    sendMessage: mockSendMessage
  }));
  const mockGetGenerativeModel = jest.fn(() => ({
    startChat: mockStartChat
  }));
  
  return {
    GoogleGenerativeAI: jest.fn(() => ({
      getGenerativeModel: mockGetGenerativeModel
    })),
    // Export mocks for assertions
    _mockSendMessage: mockSendMessage,
    _mockGetGenerativeModel: mockGetGenerativeModel
  };
});

describe('GeminiAI Provider', () => {
  let geminiAI;
  const { GoogleGenerativeAI, _mockSendMessage, _mockGetGenerativeModel } = require('@google/generative-ai');

  beforeEach(() => {
    process.env.GEMINI_API_KEY = 'test_key';
    jest.clearAllMocks();
    geminiAI = new GeminiAI();
  });

  it('should build system prompt with Dosha context', () => {
    const doshaProfile = { primary: 'pitta', scores: { pitta: 60, vata: 20, kapha: 20 } };
    const prompt = geminiAI._buildSystemPrompt([], doshaProfile);
    expect(prompt).toContain('Primary Dosha: PITTA');
    expect(prompt).toContain('Pitta 60%');
  });

  it('should integrate RAG context into the system prompt', () => {
    const messages = [{ role: 'system', content: 'RAG CONTEXT: Ashwagandha' }];
    const prompt = geminiAI._buildSystemPrompt(messages, null);
    expect(prompt).toContain('RAG CONTEXT: Ashwagandha');
  });

  it('should successfully generate response and return correctly formatted object', async () => {
    _mockSendMessage.mockResolvedValueOnce({
      response: { text: () => 'This is a mocked Gemini response' }
    });

    const messages = [{ role: 'user', content: 'Hello' }];
    const response = await geminiAI.generateResponse(messages);
    
    expect(response.message).toBe('This is a mocked Gemini response');
    expect(response.provider).toBe('gemini');
    expect(_mockSendMessage).toHaveBeenCalledWith('Hello');
  });

  it('should retry on rate limit error (429) and succeed', async () => {
    _mockSendMessage
      .mockRejectedValueOnce(new Error('429 Too Many Requests'))
      .mockResolvedValueOnce({
        response: { text: () => 'Success on second attempt' }
      });

    const messages = [{ role: 'user', content: 'Hello' }];
    const response = await geminiAI.generateResponse(messages);
    
    expect(response.message).toBe('Success on second attempt');
    expect(_mockSendMessage).toHaveBeenCalledTimes(2); // Retried once
  });
});
