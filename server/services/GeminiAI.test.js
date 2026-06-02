const GeminiAI = require('./GeminiAI');

// Mock the Google Generative AI SDK
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
    // Export mocks so we can manipulate them in tests
    mockSendMessage,
    mockStartChat,
    mockGetGenerativeModel
  };
});

describe('GeminiAI Provider Unit Tests', () => {
  let originalEnv;

  beforeEach(() => {
    // Save original env
    originalEnv = process.env.GEMINI_API_KEY;
    process.env.GEMINI_API_KEY = 'test-api-key';
    
    // Clear all mocks
    jest.clearAllMocks();
  });

  afterEach(() => {
    process.env.GEMINI_API_KEY = originalEnv;
  });

  test('should initialize successfully when API key is present', async () => {
    const gemini = new GeminiAI();
    expect(gemini.name).toBe('gemini');
    expect(await gemini.isAvailable()).toBe(true);
    expect(gemini.genAI).toBeDefined();
  });

  test('should not initialize when API key is missing', async () => {
    delete process.env.GEMINI_API_KEY;
    const gemini = new GeminiAI();
    expect(await gemini.isAvailable()).toBe(false);
    expect(gemini.genAI).toBeNull();
  });

  test('should throw error when generateResponse is called without API key', async () => {
    delete process.env.GEMINI_API_KEY;
    const gemini = new GeminiAI();
    
    await expect(gemini.generateResponse([{ role: 'user', content: 'hello' }]))
      .rejects.toThrow('Gemini AI is not initialised');
  });

  test('should generate a response successfully', async () => {
    const gemini = new GeminiAI();
    const { mockSendMessage } = require('@google/generative-ai');
    
    // Setup mock successful response
    mockSendMessage.mockResolvedValueOnce({
      response: { text: () => 'Namaste! How can I help you balance your doshas today?' }
    });

    const messages = [{ role: 'user', content: 'Hello' }];
    const response = await gemini.generateResponse(messages);

    expect(response.message).toBe('Namaste! How can I help you balance your doshas today?');
    expect(response.provider).toBe('gemini');
    expect(mockSendMessage).toHaveBeenCalledWith('Hello');
  });

  test('should build system prompt with Dosha Profile context', async () => {
    const gemini = new GeminiAI();
    const { mockGetGenerativeModel } = require('@google/generative-ai');
    const { mockSendMessage } = require('@google/generative-ai');

    mockSendMessage.mockResolvedValueOnce({
      response: { text: () => 'Advice tailored for Vata.' }
    });

    const doshaProfile = {
      primary: 'vata',
      secondary: 'pitta',
      scores: { vata: 60, pitta: 30, kapha: 10 },
      constitutionType: 'Vata-Pitta'
    };

    const messages = [{ role: 'user', content: 'What should I eat?' }];
    await gemini.generateResponse(messages, doshaProfile);

    // Verify the model was initialized with the dosha profile injected into the system prompt
    expect(mockGetGenerativeModel).toHaveBeenCalled();
    const callArgs = mockGetGenerativeModel.mock.calls[0][0];
    
    expect(callArgs.systemInstruction).toContain('Primary Dosha: VATA');
    expect(callArgs.systemInstruction).toContain('Secondary Dosha: PITTA');
    expect(callArgs.systemInstruction).toContain('Vata 60%');
  });

  test('should retry on rate limit errors (429)', async () => {
    const gemini = new GeminiAI();
    const { mockSendMessage } = require('@google/generative-ai');
    
    // Setup mock: Fail first time with rate limit, succeed second time
    mockSendMessage
      .mockRejectedValueOnce(new Error('429 Too Many Requests'))
      .mockResolvedValueOnce({
        response: { text: () => 'Recovered from rate limit.' }
      });

    const messages = [{ role: 'user', content: 'Hello' }];
    
    // Speed up setTimeout for tests
    jest.spyOn(global, 'setTimeout').mockImplementation((cb) => cb());

    const response = await gemini.generateResponse(messages);

    expect(response.message).toBe('Recovered from rate limit.');
    expect(mockSendMessage).toHaveBeenCalledTimes(2);
    
    global.setTimeout.mockRestore();
  });
});
