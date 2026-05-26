const path = require('path');
const fs = require('fs');

describe('KnowledgeBase', () => {
  let KnowledgeBase;

  beforeEach(() => {
    jest.resetModules();
    KnowledgeBase = require('../services/KnowledgeBase');
    KnowledgeBase.isLoaded = false;
  });

  it('should load data correctly', () => {
    KnowledgeBase.load();
    expect(KnowledgeBase.isLoaded).toBe(true);
    expect(KnowledgeBase.herbs.length).toBeGreaterThan(1);
    expect(KnowledgeBase.principles.length).toBeGreaterThan(0);
    expect(KnowledgeBase.medicines.length).toBeGreaterThan(0);
  });

  it('should return empty results for unmatched query', () => {
    const results = KnowledgeBase.search('xyz123abc', 5);
    expect(results.length).toBe(0);
  });

  it('should match keywords and prioritize exact matches', () => {
    const results = KnowledgeBase.search('ashwagandha', 5);
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].name.toLowerCase()).toContain('ashwagandha');
  });

  it('should apply dosha disambiguation score correctly', () => {
    // Ashwagandha pacifies Vata.
    // Querying 'vata ashwagandha' should boost Ashwagandha.
    const resultsVata = KnowledgeBase.search('vata ashwagandha', 5);
    const vataMatch = resultsVata.find(r => r.name.toLowerCase().includes('ashwagandha'));
    const vataScore = vataMatch ? vataMatch.score : 0;

    // Chandana pacifies Pitta (not Vata).
    // Querying 'vata chandana' should penalize Chandana for Vata.
    const resultsChandana = KnowledgeBase.search('vata chandana', 5);
    const chandanaMatch = resultsChandana.find(r => r.name.toLowerCase().includes('chandana'));
    const chandanaScore = chandanaMatch ? chandanaMatch.score : 0;

    expect(vataScore).toBeGreaterThan(chandanaScore);
  });
});
