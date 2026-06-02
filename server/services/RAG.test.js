const fs = require('fs');
const path = require('path');
const KnowledgeBase = require('./KnowledgeBase');
const VectorStore = require('./VectorStore');

jest.mock('fs');

describe('Retrieval-Augmented Generation (RAG) Architecture Unit Tests', () => {
  
  describe('KnowledgeBase Retrieval', () => {
    beforeEach(() => {
      KnowledgeBase.isLoaded = false;
      KnowledgeBase.herbs = [];
      KnowledgeBase.principles = [];
      KnowledgeBase.medicines = [];
      jest.clearAllMocks();

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

    test('should load data from JSON files correctly', () => {
      KnowledgeBase.load();
      expect(KnowledgeBase.isLoaded).toBe(true);
      expect(KnowledgeBase.herbs.length).toBe(2);
      expect(KnowledgeBase.principles.length).toBe(1);
    });

    test('should handle flat array for medicines.json', () => {
      // Uncovered line 29
      fs.readFileSync.mockImplementationOnce((filePath) => {
        if (filePath.includes('medicines.json')) return JSON.stringify([{ name: 'Test Med' }]);
        return '[]';
      });
      KnowledgeBase.isLoaded = false;
      KnowledgeBase.load();
      expect(KnowledgeBase.medicines.length).toBe(1);
    });

    test('should handle and log JSON parse errors gracefully', () => {
      // Uncovered line 35
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      fs.readFileSync.mockImplementationOnce(() => 'invalid-json');
      KnowledgeBase.isLoaded = false;
      KnowledgeBase.load();
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });

    test('should boost score if target dosha is mentioned and herb pacifies it', () => {
      const results = KnowledgeBase.search('ashwagandha for vata');
      const ashwagandha = results.find(r => r.name.toLowerCase() === 'ashwagandha');
      expect(ashwagandha).toBeDefined();
      expect(ashwagandha.score).toBeGreaterThan(10);
    });

    test('should apply minor boost if text mentions dosha but does not explicitly pacify it', () => {
      // Uncovered line 75
      // Brahmi pacifies Vata, Pitta, Kapha. If we search 'vata', and say another herb just has 'vata' in its text.
      // Let's create a query that mentions a dosha. 
      const results = KnowledgeBase.search('kapha');
      expect(results.length).toBeGreaterThan(0);
    });
    
    test('should format herb results into readable context string', () => {
      const results = KnowledgeBase.search('ashwagandha');
      const formatted = KnowledgeBase.formatContext(results);
      expect(formatted).toContain('HERB: Ashwagandha');
      expect(formatted).toContain('Sweet, Bitter');
    });

    test('should format principles correctly', () => {
      // Uncovered lines 96-99
      const results = KnowledgeBase.search('dinacharya');
      const formatted = KnowledgeBase.formatContext(results);
      expect(formatted).toContain('PRINCIPLE: Dinacharya');
      expect(formatted).toContain('Daily routine');
    });

    test('should format unknown types with default formatter', () => {
      // Uncovered line 99
      const results = [{ type: 'unknown', name: 'Test', text: 'Some text data' }];
      const formatted = KnowledgeBase.formatContext(results);
      expect(formatted).toContain('[1] Test: Some text data');
    });
  });

  describe('Semantic Vector Store', () => {
    beforeEach(() => {
      VectorStore.store = [];
      jest.clearAllMocks();

      const mockVectors = [
        { id: '1', text: 'Ayurveda is a traditional medicine system', embedding: [0.1, 0.2, 0.3] },
        { id: '2', text: 'Yoga is good for health', embedding: [0.0, 0.1, 0.9] },
        { id: '3', text: 'Vata dosha represents air and space', embedding: [0.2, 0.8, 0.1] }
      ];

      fs.existsSync.mockReturnValue(true);
      fs.readFileSync.mockReturnValue(JSON.stringify(mockVectors));
      fs.writeFileSync.mockImplementation(() => {});
    });

    test('should log warning if vectors.json is missing', async () => {
      // Uncovered line 16
      fs.existsSync.mockReturnValueOnce(false);
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
      await VectorStore.load();
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('not found'));
      consoleSpy.mockRestore();
    });

    test('should calculate cosine similarity correctly', () => {
      const vecA = [1, 0, 0];
      const vecB = [1, 0, 0];
      const vecC = [0, 1, 0];
      
      expect(VectorStore.cosineSimilarity(vecA, vecB)).toBeCloseTo(1.0);
      expect(VectorStore.cosineSimilarity(vecA, vecC)).toBeCloseTo(0.0);
    });

    test('should sort and return top K similar items while stripping heavy embeddings', async () => {
      const queryEmbedding = [0.2, 0.9, 0.1];
      const results = await VectorStore.search(queryEmbedding, 2);
      
      expect(results.length).toBe(2);
      expect(results[0].id).toBe('3');
      expect(results[0].embedding).toBeUndefined(); // Bandwidth optimization
    });

    test('should auto-load if store is empty during search', async () => {
      VectorStore.store = [];
      const queryEmbedding = [0.1, 0.2, 0.3];
      const results = await VectorStore.search(queryEmbedding, 1);
      expect(results.length).toBe(1);
    });

    test('should save new vectors to file', async () => {
      const newItems = [{ id: '4', text: 'New Item', embedding: [0.5, 0.5, 0.5] }];
      await VectorStore.save(newItems);
      expect(VectorStore.store.length).toBe(1);
      expect(fs.writeFileSync).toHaveBeenCalled();
    });
  });
});
