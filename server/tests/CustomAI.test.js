const CustomAI = require('../services/CustomAI');

// Mock KnowledgeBase so we don't need to load the real one during tests
jest.mock('../services/KnowledgeBase', () => ({
  search: jest.fn(() => []),
  formatContext: jest.fn(() => '')
}));

describe('CustomAI (Rule-Based Engine)', () => {
  let customAI;

  beforeEach(() => {
    customAI = new CustomAI();
  });

  it('should correctly classify intents based on keywords', () => {
    expect(customAI.classifyIntent('I cannot sleep at night')).toBe('sleep');
    expect(customAI.classifyIntent('What food should I eat?')).toBe('food');
    expect(customAI.classifyIntent('My stomach hurts and bloating')).toBe('digestion');
    expect(customAI.classifyIntent('Hello there')).toBe('general'); // default
  });

  it('should extract correct symptoms from the message', () => {
    const context = customAI.extractContext('I have bloating and stress');
    expect(context.symptoms).toContain('digestive');
    expect(context.symptoms).toContain('mental');
  });

  it('should generate personalized response tailored for Vata dosha', async () => {
    const messages = [{ content: 'I am having trouble with my sleep' }];
    const doshaProfile = { primary: 'vata' };
    
    const response = await customAI.generateResponse(messages, doshaProfile);
    expect(response.message).toContain('VATA');
    expect(response.message).toContain('Warm oil massage'); // Specific to Vata sleep
    expect(response.explanation.constitutionalBasis.primaryDosha).toBe('vata');
  });

  it('should generate personalized response tailored for Kapha dosha', async () => {
    const messages = [{ content: 'I am having trouble with my sleep' }];
    const doshaProfile = { primary: 'kapha' };
    
    const response = await customAI.generateResponse(messages, doshaProfile);
    expect(response.message).toContain('KAPHA');
    expect(response.message).toContain('Avoid daytime naps'); // Specific to Kapha sleep
  });

  it('should return a generic response if dosha is unknown', async () => {
    const messages = [{ content: 'What should I eat?' }];
    const doshaProfile = null;
    
    const response = await customAI.generateResponse(messages, doshaProfile);
    expect(response.message).toContain('Focus on fresh, whole foods'); // generic food response
  });
});
