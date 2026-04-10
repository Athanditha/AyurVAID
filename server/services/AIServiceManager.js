// AI Service Manager - Unified interface for AI providers
const CustomAI = require('./CustomAI');
const GeminiAI = require('./GeminiAI');
const KnowledgeBase = require('./KnowledgeBase');

class AIServiceManager {
  constructor() {
    this.providers = {
      custom: new CustomAI(),
      gemini: new GeminiAI()
    };
    
    this.currentProvider = process.env.AI_PROVIDER || 'gemini';
    this.fallbackProvider = 'custom';
    
    this.initializeProvider();
  }

  async initializeProvider() {
    console.log(`Initializing AI provider: ${this.currentProvider}`);
    
    // Check if current provider is available
    const isAvailable = await this.checkProviderAvailability(this.currentProvider);
    
    if (!isAvailable) {
      console.warn(`Provider ${this.currentProvider} not available, falling back to ${this.fallbackProvider}`);
      this.currentProvider = this.fallbackProvider;
    }
    
    console.log(`Active AI provider: ${this.currentProvider}`);
  }

  async checkProviderAvailability(providerName) {
    try {
      const provider = this.providers[providerName];
      if (!provider) return false;
      
      if (provider.isAvailable) {
        return await provider.isAvailable();
      }
      
      return true; // Assume available if no check method
    } catch (error) {
      console.error(`Error checking ${providerName} availability:`, error.message);
      return false;
    }
  }

  async generateResponse(messages, doshaProfile = null, options = {}) {
    try {
      const provider = this.providers[this.currentProvider];
      
      if (!provider) {
        throw new Error(`Provider ${this.currentProvider} not initialized`);
      }

      // --- RAG (Retrieval Augmented Generation) STEP ---
      const userMessage = messages[messages.length - 1].content;
      const searchResults = KnowledgeBase.search(userMessage, 3);
      
      if (searchResults.length > 0) {
        const knowledgeContext = KnowledgeBase.formatContext(searchResults);
        console.log(`🧠 RAG: Found ${searchResults.length} relevant context items.`);
        
        // Find existing system message or create new one
        let systemMsgIndex = messages.findIndex(m => m.role === 'system');
        const ragInstruction = `\n\nADDITIONAL AYURVEDIC KNOWLEDGE (verified from classical texts):\n${knowledgeContext}\n\nUse this specific knowledge to enhance your response where relevant.`;
        
        if (systemMsgIndex !== -1) {
          messages[systemMsgIndex].content += ragInstruction;
        } else {
          messages.unshift({ role: 'system', content: `You are AyurVAID, an expert Ayurvedic AI.` + ragInstruction });
        }
      }
      // --------------------------------------------------

      let response;
      
      switch (this.currentProvider) {
        case 'custom':
          response = await provider.generateResponse(messages, doshaProfile);
          break;
        case 'gemini':
          response = await provider.generateResponse(messages, doshaProfile, options);
          break;
        default:
          throw new Error(`Unknown provider: ${this.currentProvider}`);
      }

      return {
        ...response,
        provider: this.currentProvider,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      console.error(`Error with ${this.currentProvider} provider:`, error.message);
      
      // Try fallback if current provider fails
      if (this.currentProvider !== this.fallbackProvider) {
        console.log(`Attempting fallback to ${this.fallbackProvider}`);
        const originalProvider = this.currentProvider;
        this.currentProvider = this.fallbackProvider;
        
        try {
          const fallbackResponse = await this.generateResponse(messages, doshaProfile, options);
          return {
            ...fallbackResponse,
            fallbackUsed: true,
            originalProvider: originalProvider
          };
        } catch (fallbackError) {
          console.error('Fallback also failed:', fallbackError.message);
          this.currentProvider = originalProvider; // Restore original
        }
      }
      
      throw error;
    }
  }

  async switchProvider(providerName) {
    if (!this.providers[providerName]) {
      throw new Error(`Unknown provider: ${providerName}. Available: ${Object.keys(this.providers).join(', ')}`);
    }

    const isAvailable = await this.checkProviderAvailability(providerName);
    if (!isAvailable) {
      throw new Error(`Provider ${providerName} is not available`);
    }

    this.currentProvider = providerName;
    console.log(`Switched to AI provider: ${providerName}`);
    return true;
  }

  getCurrentProvider() {
    return this.currentProvider;
  }

  async getAvailableProviders() {
    const available = {};
    
    for (const [name, provider] of Object.entries(this.providers)) {
      if (provider) {
        available[name] = await this.checkProviderAvailability(name);
      } else {
        available[name] = false;
      }
    }
    
    return available;
  }

  async getProviderInfo() {
    return {
      current: this.currentProvider,
      fallback: this.fallbackProvider,
      available: await this.getAvailableProviders()
    };
  }

  setTemperature(temperature) {
    Object.values(this.providers).forEach(provider => {
      if (provider && typeof provider === 'object') {
        provider.temperature = temperature;
      }
    });
  }
}

module.exports = AIServiceManager;