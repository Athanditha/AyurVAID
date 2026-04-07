const fs = require('fs');
const path = require('path');

class VectorStore {
  constructor() {
    this.vectorsFile = path.join(__dirname, '..', 'data', 'vectors.json');
    this.store = [];
  }

  async load() {
    if (fs.existsSync(this.vectorsFile)) {
      const data = fs.readFileSync(this.vectorsFile, 'utf8');
      this.store = JSON.parse(data);
      console.log(`📡 Vector Store loaded with ${this.store.length} embeddings.`);
    } else {
      console.log('⚠️ Vector Store file not found. Please run ingestion script.');
    }
  }

  // Calculate cosine similarity between two vectors
  cosineSimilarity(vecA, vecB) {
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    for (let i = 0; i < vecA.length; i++) {
      dotProduct += vecA[i] * vecB[i];
      normA += vecA[i] * vecA[i];
      normB += vecB[i] * vecB[i];
    }
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  async search(queryEmbedding, topK = 5) {
    if (this.store.length === 0) await this.load();

    const results = this.store.map(item => ({
      ...item,
      score: this.cosineSimilarity(queryEmbedding, item.embedding)
    }));

    // Sort by similarity score descending
    return results
      .sort((a, b) => b.score - a.score)
      .slice(0, topK)
      .map(item => {
        const { embedding, ...rest } = item;
        return rest;
      });
  }

  async save(newItems) {
    this.store = newItems;
    fs.writeFileSync(this.vectorsFile, JSON.stringify(this.store, null, 2));
    console.log(`✅ Vector Store saved with ${this.store.length} items.`);
  }
}

module.exports = new VectorStore();
