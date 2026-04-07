const fs = require('fs');
const path = require('path');

class KnowledgeBase {
  constructor() {
    this.herbs = [];
    this.principles = [];
    this.medicines = [];
    this.isLoaded = false;
  }

  load() {
    if (this.isLoaded) return;
    
    const dataDir = path.join(__dirname, '..', 'data');
    try {
      this.herbs = JSON.parse(fs.readFileSync(path.join(dataDir, 'herbs.json'), 'utf8'));
      this.principles = JSON.parse(fs.readFileSync(path.join(dataDir, 'principles.json'), 'utf8'));
      
      const medicinesRaw = JSON.parse(fs.readFileSync(path.join(dataDir, 'medicines.json'), 'utf8'));
      // medicines.json has a nested "Medicine" object
      if (medicinesRaw.Medicine) {
        this.medicines = Object.entries(medicinesRaw.Medicine).map(([key, val]) => ({
          name: val.plantname || key,
          preview: `Botanical: ${val.botanicalname}. Uses: ${val.therapeuticuses}. Dosage: ${val.dosage}. Part: ${val.parts}.`,
          ...val
        }));
      } else {
        this.medicines = Array.isArray(medicinesRaw) ? medicinesRaw : [];
      }

      this.isLoaded = true;
      console.log(`📚 Knowledge Base loaded: ${this.herbs.length} herbs, ${this.principles.length} principles, ${this.medicines.length} medicines.`);
    } catch (error) {
      console.error('Error loading knowledge base:', error.message);
    }
  }

  // Simple weighted keyword search
  search(query, topK = 5) {
    this.load();
    const keywords = query.toLowerCase().split(/\s+/).filter(k => k.length > 2);
    
    const allItems = [
      ...(this.herbs || []).map(h => ({ type: 'herb', name: h.name || 'Unknown', text: `${h.name} ${h.preview} ${h.rasa} ${h.pacify}`, data: h })),
      ...(this.principles || []).map(p => ({ type: 'principle', name: p.name || 'Unknown', text: `${p.name} ${p.explanation} ${p.clinical_importance}`, data: p })),
      ...(this.medicines || []).map(m => ({ type: 'medicine', name: m.name || m.plantname || 'Unknown', text: `${m.name} ${m.preview} ${m.therapeuticuses}`, data: m }))
    ].filter(item => item && item.name && item.text);

    const scored = allItems.map(item => {
      let score = 0;
      const itemText = item.text.toLowerCase();
      const itemName = item.name.toLowerCase();
      
      keywords.forEach(keyword => {
        if (itemText.includes(keyword)) {
          score += 2; 
          if (itemName.includes(keyword)) score += 5; // Direct name match is high signal
          if (itemName === keyword) score += 10; // Exact match is highest
        }
      });

      // --- DOSHA DISAMBIGUATION ---
      const queryLower = query.toLowerCase();
      const doshas = ['vata', 'pitta', 'kapha'];
      const mentionedDoshas = doshas.filter(d => queryLower.includes(d));
      
      if (mentionedDoshas.length > 0) {
        const itemPacifies = (item.data.pacify || "").toString().toLowerCase();
        const pacifiesTarget = mentionedDoshas.some(d => itemPacifies.includes(d));
        
        if (pacifiesTarget) {
          score += 10; // Massive boost for herbs that balance the user's mentioned Dosha
        } else if (mentionedDoshas.some(d => itemText.includes(d))) {
          score += 3; // Minor boost if the text mentions the Dosha
        } else {
          score -= 5; // Penalty for herbs that don't match the specific Dosha query
        }
      }

      return { ...item, score };
    });

    return scored
      .filter(item => item.score > 5) // Increased threshold to filter out weak 'digestion' matches
      .sort((a, b) => b.score - a.score)
      .slice(0, topK);
  }

  formatContext(results) {
    if (results.length === 0) return "No specific records found in the local knowledge base.";
    
    return results.map((r, i) => {
      if (r.type === 'herb') {
        return `[${i+1}] HERB: ${r.data.name}. ${r.data.preview}. Properties: Rasa: ${r.data.rasa}, Virya: ${r.data.virya}, Vipaka: ${r.data.vipaka}. Balances: ${r.data.pacify}.`;
      } else if (r.type === 'principle') {
        return `[${i+1}] PRINCIPLE: ${r.data.name}. ${r.data.explanation} Clinical Use: ${r.data.clinical_importance}`;
      }
      return `[${i+1}] ${r.name}: ${r.text.substring(0, 200)}...`;
    }).join('\n\n');
  }
}

module.exports = new KnowledgeBase();
