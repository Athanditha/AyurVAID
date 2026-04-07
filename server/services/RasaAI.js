const axios = require('axios');
const { GoogleGenerativeAI } = require('@google/generative-ai');

class RasaAI {
  constructor() {
    this.name = 'rasa';
    // Default local Rasa server port is 5005
    this.baseUrl = process.env.RASA_SERVER_URL || 'http://localhost:5005';
    
    // Hybrid Mode Generative Brain Initialized using Gemini
    if (process.env.GEMINI_API_KEY) {
      this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    }
  }

  async isAvailable() {
    // HYBRID MODE: If Gemini is active, this provider never truly goes offline.
    if (this.genAI) return true;

    try {
      // In production, we'd ping the / status endpoint or similar
      const response = await axios.get(`${this.baseUrl}/`, { timeout: 1500 });
      return response.status === 200 || response.status === 404; // 404 indicates server is active but root has no path
    } catch (error) {
      console.warn('Rasa NLP unavailable locally on 5005');
      return false;
    }
  }

  async generateResponse(messages, doshaProfile = null) {
    try {
      // We extract the user's latest query
      const lastUserMessage = messages[messages.length - 1].content;
      
      // Inject Dosha context into the Rasa message payload if needed by custom python actions
      const metadata = doshaProfile ? { doshaContext: doshaProfile.primary } : {};

      const response = await axios.post(`${this.baseUrl}/webhooks/rest/webhook`, {
        sender: 'ayurvaid_user',
        message: lastUserMessage,
        metadata: metadata
      });

      if (response.data && response.data.length > 0) {
        const combinedText = response.data.map(m => m.text).join('\n\n');
        
        // HYBRID MODE INTERCEPTOR: If Rasa hits its fallback rule
        if (combinedText.includes("I'm still learning the depths")) {
          console.log('[AyurVAID Hybrid] Rasa NLP Ambiguous -> Triggering Generative LLM Fallback');
          return await this.generativeFallback(messages, doshaProfile);
        }
        
        return { message: combinedText };
      }

      console.log('[AyurVAID Hybrid] Rasa Empty Response -> Triggering Generative LLM Fallback');
      return await this.generativeFallback(messages, doshaProfile);

    } catch (error) {
      console.error('Rasa integration error:', error.message);
      // If Rasa server is explicitly down, fallback purely to LLM
      console.log('[AyurVAID Hybrid] Rasa Offline -> Handing complete control to Generative LLM Fallback');
      return await this.generativeFallback(messages, doshaProfile);
    }
  }

  async generativeFallback(messages, doshaProfile) {
    if (!this.genAI) {
      return { message: "I'm having trouble analyzing your request, and the generative fallback engine requires a GEMINI_API_KEY in .env." };
    }
    
    // Inject intelligent systemic context securely
    let systemPrompt = "You are AyurVAID's Generative AI core. The user asked a conversational question that our strict rules engine couldn't map. Provide a warm, conversational, interactive answer in Markdown.";
    if (doshaProfile && doshaProfile.primary) {
      systemPrompt += ` Focus advice securely around their ${doshaProfile.primary.toUpperCase()}-dominant constitution.`;
    }

    try {
      // Accessing Gemini 2.0 Flash natively (gemini-1.5-flash deprecated)
      const model = this.genAI.getGenerativeModel({ 
        model: "gemini-2.0-flash",
        systemInstruction: systemPrompt
      });

      // Format messages into Gemini conversational history array
      const history = [];
      for (let i = 0; i < messages.length - 1; i++) {
        const msg = messages[i];
        if (msg.role === 'system') continue; 
        history.push({
          role: msg.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: msg.content }]
        });
      }

      // Initialize seamless chat stream memory
      const chat = model.startChat({ history });
      const lastUserMessage = messages[messages.length - 1].content;
      
      const result = await chat.sendMessage(lastUserMessage);

      return {
        message: result.response.text(),
        provider: 'hybrid-rasa-gemini', // Tracking origin precisely
        model: 'gemini-2.0-flash'
      };
    } catch (llmError) {
      console.error('Hybrid Fallback Gemini Error:', llmError);
      return { message: "Apologies, both my Ayurvedic core and conversational engines are experiencing network issues." };
    }
  }
}

module.exports = RasaAI;
