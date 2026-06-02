const CustomAI = require('./CustomAI');
const KnowledgeBase = require('./KnowledgeBase');

// Mock KnowledgeBase so we don't depend on file system reads in tests
jest.mock('./KnowledgeBase', () => ({
  search: jest.fn(() => []),
  formatContext: jest.fn(() => 'Mocked RAG Context')
}));

describe('CustomAI (Rule-Based Fallback Engine) Unit Tests', () => {
  let customAI;

  beforeEach(() => {
    customAI = new CustomAI();
    jest.clearAllMocks();
  });

  describe('Intent Classification', () => {
    test('should classify "what should I eat" as food intent', () => {
      const intent = customAI.classifyIntent('what should i eat for dinner?');
      expect(intent).toBe('food');
    });

    test('should classify "how to reduce stress" as mental intent', () => {
      const intent = customAI.classifyIntent('how do i reduce my stress and anxiety?');
      expect(intent).toBe('mental');
    });

    test('should fallback to general intent if no keywords match', () => {
      const intent = customAI.classifyIntent('hello there');
      expect(intent).toBe('general');
    });
  });

  describe('Context Extraction', () => {
    test('should extract urgency and time of day', () => {
      const context = customAI.extractContext('i need immediate help this morning');
      expect(context.urgency).toBe(true);
      expect(context.timeOfDay).toBe('morning');
    });

    test('should extract symptoms correctly', () => {
      const context = customAI.extractContext('i have terrible bloating and insomnia');
      expect(context.severity).toBe(true);
      expect(context.symptoms).toContain('digestive');
      expect(context.symptoms).toContain('sleep');
    });
  });

  describe('Response Generation (End-to-End)', () => {
    test('should generate personalized food response with dosha profile', async () => {
      const messages = [{ role: 'user', content: 'what is a good diet for me?' }];
      const doshaProfile = { primary: 'Vata' };

      const response = await customAI.generateResponse(messages, doshaProfile);
      
      expect(response.model).toBe('CustomAI-v1.0');
      expect(response.message).toContain('VATA');
      // Should mention Vata balancing foods from the mocked/imported knowledge base
      expect(response.message.toLowerCase()).toContain('warm'); 
      expect(response.explanation.reasoning[0]).toContain('VATA');
    });

    test('should extract dosha from message if profile is missing', async () => {
      const messages = [{ role: 'user', content: 'what is a good diet for pitta?' }];
      
      const response = await customAI.generateResponse(messages, null);
      
      expect(response.message).toContain('PITTA');
      expect(response.explanation.reasoning[0]).toContain('PITTA');
    });

    test('should generate generic response if no dosha is known', async () => {
      const messages = [{ role: 'user', content: 'what is a good diet?' }];
      
      const response = await customAI.generateResponse(messages, null);
      
      // Intent should be food, generic food response
      expect(response.message).toContain('Focus on fresh, whole foods');
      expect(response.explanation.confidence).toBe('Medium');
    });

    test('should generate lifestyle response', async () => {
      const messages = [{ role: 'user', content: 'what is a good daily routine?' }];
      const response = await customAI.generateResponse(messages, { primary: 'Pitta' });
      expect(response.message).toContain('constitution');
    });

    test('should generate exercise response', async () => {
      const messages = [{ role: 'user', content: 'what exercise should I do in the morning?' }];
      const response = await customAI.generateResponse(messages, { primary: 'Kapha' });
      expect(response.message).toContain('constitution');
    });

    test('should generate sleep response', async () => {
      const messages = [{ role: 'user', content: 'I cant sleep' }];
      const response = await customAI.generateResponse(messages, { primary: 'Vata' });
      expect(response.message).toContain('sleep');
    });

    test('should generate digestion response', async () => {
      const messages = [{ role: 'user', content: 'my digestion is bad' }];
      const response = await customAI.generateResponse(messages, { primary: 'Kapha' });
      expect(response.message).toContain('digest');
    });
  });
});
