const fs = require('fs');
const path = require('path');
const VectorStore = require('./VectorStore');

jest.mock('fs');

describe('VectorStore Unit Tests', () => {
  beforeEach(() => {
    // Reset singleton state
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

  describe('Loading and Saving', () => {
    test('should load vectors from file', async () => {
      await VectorStore.load();
      expect(VectorStore.store.length).toBe(3);
      expect(VectorStore.store[0].id).toBe('1');
    });

    test('should handle missing file gracefully', async () => {
      fs.existsSync.mockReturnValueOnce(false);
      await VectorStore.load();
      expect(VectorStore.store.length).toBe(0);
    });

    test('should save new vectors to file', async () => {
      const newItems = [{ id: '4', text: 'New Item', embedding: [0.5, 0.5, 0.5] }];
      await VectorStore.save(newItems);
      
      expect(VectorStore.store.length).toBe(1);
      expect(fs.writeFileSync).toHaveBeenCalled();
    });
  });

  describe('Cosine Similarity', () => {
    test('should correctly calculate cosine similarity', () => {
      const vecA = [1, 0, 0];
      const vecB = [1, 0, 0];
      const vecC = [0, 1, 0];
      
      // Identical vectors should have similarity of 1
      expect(VectorStore.cosineSimilarity(vecA, vecB)).toBeCloseTo(1.0);
      
      // Orthogonal vectors should have similarity of 0
      expect(VectorStore.cosineSimilarity(vecA, vecC)).toBeCloseTo(0.0);
    });
  });

  describe('Vector Search', () => {
    test('should return top K similar items', async () => {
      // Create a query embedding very similar to Item 3
      const queryEmbedding = [0.2, 0.9, 0.1];
      
      const results = await VectorStore.search(queryEmbedding, 2);
      
      expect(results.length).toBe(2);
      // Item 3 should be the most similar
      expect(results[0].id).toBe('3');
      // Ensure embeddings are removed from results to save bandwidth
      expect(results[0].embedding).toBeUndefined();
    });

    test('should auto-load if store is empty', async () => {
      const queryEmbedding = [0.1, 0.2, 0.3];
      
      const results = await VectorStore.search(queryEmbedding, 1);
      
      expect(results.length).toBe(1);
      expect(results[0].id).toBe('1');
      expect(fs.readFileSync).toHaveBeenCalled();
    });
  });
});
