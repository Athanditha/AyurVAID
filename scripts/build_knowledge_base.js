const fs = require('fs');
const path = require('path');
const https = require('https');

const DATA_DIR = path.join(__dirname, '..', 'server', 'data');
const DATASETS = [
  {
    name: 'herbs.json',
    url: 'https://raw.githubusercontent.com/sciencewithsaucee-sudo/herb-database/main/herb.json'
  },
  {
    name: 'principles.json',
    url: 'https://raw.githubusercontent.com/sciencewithsaucee-sudo/Siddhanta-Kosha/main/Siddhanta-Kosha.json'
  },
  {
    name: 'medicines.json',
    url: 'https://raw.githubusercontent.com/kuralamuthan300/ayurvedic-medicine-catalogue/master/Database.json'
  }
];

async function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode !== 200) {
        reject(new Error(`Failed to download: ${res.statusCode}`));
        return;
      }
      const file = fs.createWriteStream(dest);
      res.pipe(file);
      file.on('finish', () => {
        file.close();
        resolve();
      });
    }).on('error', reject);
  });
}

async function buildKnowledgeBase() {
  console.log('🌿 Building Expanded Ayurvedic Knowledge Base...');
  
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  for (const dataset of DATASETS) {
    const dest = path.join(DATA_DIR, dataset.name);
    console.log(`📥 Downloading ${dataset.name}...`);
    try {
      await downloadFile(dataset.url, dest);
      console.log(`✅ ${dataset.name} saved.`);
    } catch (err) {
      console.error(`❌ Failed to download ${dataset.name}:`, err.message);
    }
  }
  
  console.log('✨ Knowledge base build complete.');
}

buildKnowledgeBase();
