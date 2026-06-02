const fs = require('fs');
const path = require('path');
const KnowledgeBase = require('./KnowledgeBase');

// Mock fs to avoid reading actual files during tests
jest.mock('fs');

describe('KnowledgeBase (RAG) Unit Tests', () => {
  beforeEach(() => {
    // Reset the singleton state
    KnowledgeBase.isLoaded = false;
    KnowledgeBase.herbs = [];
    KnowledgeBase.principles = [];
    KnowledgeBase.medicines = [];
    jest.clearAllMocks();

    // Mock data to simulate the JSON files
    const mockHerbs = [
      { name: 'Ashwagandha', preview: 'Adaptogenic herb', rasa: 'Sweet, Bitter', pacify: 'Vata, Kapha' },
      { name: 'Brahmi', preview: 'Brain tonic', rasa: 'Bitter', pacify: 'Vata, Pitta, Kapha' }
    ];
    
    const mockPrinciples = [
      { name: 'Dinacharya', explanation: 'Daily routine', clinical_importance: 'Maintains circadian rhythm' }
    ];
    
    const mockMedicines = {
      Medicine: {
        'Triphala': { plantname: 'Triphala', botanicalname: 'Emblica officinalis', therapeuticuses: 'Digestion', dosage: '1 tsp', parts: 'Fruit' }
      }
    };

    fs.readFileSync.mockImplementation((filePath) => {
      if (filePath.includes('herbs.json')) return JSON.stringify(mockHerbs);
      if (filePath.includes('principles.json')) return JSON.stringify(mockPrinciples);
      if (filePath.includes('medicines.json')) return JSON.stringify(mockMedicines);
      return '[]';
    });
  });

  describe('Initialization', () => {
    test('should load data from JSON files correctly', () => {
      KnowledgeBase.load();
      
      expect(KnowledgeBase.isLoaded).toBe(true);
      expect(KnowledgeBase.herbs.length).toBe(2);
      expect(KnowledgeBase.principles.length).toBe(1);
      expect(KnowledgeBase.medicines.length).toBe(1);
      expect(KnowledgeBase.medicines[0].name).toBe('Triphala');
    });

    test('should not reload if already loaded', () => {
      KnowledgeBase.load();
      KnowledgeBase.load();
      // readFileSync is called 3 times per load
      expect(fs.readFileSync).toHaveBeenCalledTimes(3); 
    });
  });

  describe('Search Functionality', () => {
    test('should find relevant herbs based on keyword', () => {
      const results = KnowledgeBase.search('ashwagandha benefits');
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].name.toLowerCase()).toBe('ashwagandha');
    });

    test('should boost score if target dosha is mentioned and herb pacifies it', () => {
      // Query specifically mentions Vata
      const results = KnowledgeBase.search('ashwagandha for vata');
      
      const ashwagandha = results.find(r => r.name.toLowerCase() === 'ashwagandha');
      expect(ashwagandha).toBeDefined();
      expect(ashwagandha.score).toBeGreaterThan(10); // Verifies the dosha disambiguation +10 boost
    });
    
    test('should find principles based on keyword', () => {
      const results = KnowledgeBase.search('daily routine dinacharya');
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].name.toLowerCase()).toBe('dinacharya');
    });
  });

  describe('Context Formatting', () => {
    test('should format herb results into readable context string', () => {
      const results = KnowledgeBase.search('ashwagandha');
      const formatted = KnowledgeBase.formatContext(results);
      
      expect(formatted).toContain('HERB: Ashwagandha');
      expect(formatted).toContain('Sweet, Bitter');
    });

    test('should return default message if no results found', () => {
      const formatted = KnowledgeBase.formatContext([]);
      expect(formatted).toBe('No specific records found in the local knowledge base.');
    });
  });
});
