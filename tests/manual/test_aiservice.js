const path = require('path');
const AIServiceManager = require('../../server/services/AIServiceManager');
const ayurvedicKnowledge = require('../../server/data/ayurvedic-knowledge');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

async function test() {
  try {
    const aiServiceManager = new AIServiceManager();
    // Wait for initialization
    await new Promise(r => setTimeout(r, 1000));
    
    await aiServiceManager.switchProvider('gemini');
    
    const messages = [
      { role: "system", content: "You are AyurVAID." },
      { role: "user", content: "what should i eat" }
    ];
    
    const doshaAnalysis = {
      primary: 'pitta',
      secondary: 'vata',
      scores: { pitta: 60, vata: 30, kapha: 10 },
      constitutionType: 'Pitta-Vata'
    };
    
    console.log("Sending prompt via AIServiceManager...");
    const aiResponse = await aiServiceManager.generateResponse(messages, doshaAnalysis, {
      max_tokens: 600,
      temperature: 0.7
    });
    
    console.log("\n--- AI Response ---");
    console.log(aiResponse.message);
    console.log("-------------------");
  } catch (error) {
    console.error('Error:', error);
  }
}

test();
