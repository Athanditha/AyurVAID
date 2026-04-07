require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const embeddingModel = genAI.getGenerativeModel({ model: "text-embedding-004" });

const DATA_DIR = path.join(__dirname, '..', 'data');
const HERBS_FILE = path.join(DATA_DIR, 'herbs.json');
const PRINCIPLES_FILE = path.join(DATA_DIR, 'principles.json');
const OUTPUT_FILE = path.join(DATA_DIR, 'vectors.json');

async function getEmbedding(text) {
  try {
    const result = await embeddingModel.embedContent(text);
    return result.embedding.values;
  } catch (error) {
    console.error(`Error embedding text: ${text.substring(0, 30)}...`, error.message);
    return null;
  }
}

async function ingest() {
  console.log('🚀 Starting Data Ingestion for RAG...');
  
  const herbs = JSON.parse(fs.readFileSync(HERBS_FILE, 'utf8'));
  const principles = JSON.parse(fs.readFileSync(PRINCIPLES_FILE, 'utf8'));

  const items = [];

  // Process Herbs
  console.log(`🌿 Processing ${herbs.length} herbs...`);
  for (const herb of herbs.slice(0, 50)) { // Limiting to 50 for prototype stability
    const content = `Herb: ${herb.name}. ${herb.preview}. Rasa: ${herb.rasa?.join(', ')}. Guna: ${herb.guna?.join(', ')}. Virya: ${herb.virya}. Vipaka: ${herb.vipaka}. Pacifies: ${herb.pacify?.join(', ')}.`;
    items.push({
      type: 'herb',
      id: herb.name,
      content,
      metadata: herb
    });
  }

  // Process Principles
  console.log(`📖 Processing ${principles.length} principles...`);
  for (const p of principles.slice(0, 50)) { // Limiting to 50 for prototype stability
    const content = `Principle: ${p.name}. Category: ${p.category}. Explanation: ${p.explanation}. Clinical Importance: ${p.clinical_importance}`;
    items.push({
      type: 'principle',
      id: p.name,
      content,
      metadata: p
    });
  }

  console.log(`🧪 Total items to embed: ${items.length}`);
  const store = [];

  // Batch embedding to stay within limits
  for (let i = 0; i < items.length; i++) {
    process.stdout.write(`进度: ${i+1}/${items.length} \r`);
    const embedding = await getEmbedding(items[i].content);
    if (embedding) {
      store.push({
        ...items[i],
        embedding
      });
    }
    // Small delay to prevent rate limiting
    await new Promise(r => setTimeout(r, 100));
  }

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(store, null, 2));
  console.log(`\n✅ Ingestion complete. ${store.length} embeddings saved to vectors.json`);
}

ingest().catch(console.error);
