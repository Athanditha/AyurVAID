// AI Service Manager - Unified interface for multiple AI providers
const OpenAI = require('openai');
const LocalAI = require('./LocalAI');
const HuggingFaceAI = require('./HuggingFaceAI');
const CustomAI = require('./CustomAI');
const RasaAI = require('./RasaAI');
const KnowledgeBase = require('./KnowledgeBase');

class AIServiceManager {
  constructor() {
    this.providers = {
      openai: null,
      local: new LocalAI(),
      huggingface: new HuggingFaceAI(),
      custom: new CustomAI(),
      rasa: new RasaAI()
    };
    
    this.currentProvider = process.env.AI_PROVIDER || 'custom';
    this.fallbackProvider = 'custom';
    
    // Initialize OpenAI if API key is available
    if (process.env.OPENAI_API_KEY) {
      this.providers.openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY
      });
    }
    
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
        case 'openai':
          response = await this.generateOpenAIResponse(messages, options);
          break;
        case 'local':
          response = await provider.generateResponse(messages, options);
          break;
        case 'huggingface':
          response = await provider.generateResponse(messages, options);
          break;
        case 'custom':
          response = await provider.generateResponse(messages, doshaProfile);
          break;
        case 'rasa':
          response = await provider.generateResponse(messages, doshaProfile);
          break;
        default:
          throw new Error(`Unknown provider: ${this.currentProvider}`);
      }

      return {
        ...response,
        provider: this.currentProvider,
        innerProvider: response.provider || null, // preserve hybrid-rasa-gemini etc.
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

  async generateOpenAIResponse(messages, options = {}) {
    const completion = await this.providers.openai.chat.completions.create({
      model: options.model || "gpt-4",
      messages: messages,
      max_tokens: options.max_tokens || 600,
      temperature: options.temperature || 0.7
    });

    return {
      message: completion.choices[0].message.content,
      model: completion.model,
      usage: completion.usage
    };
  }

  async switchProvider(providerName) {
    if (!this.providers[providerName]) {
      throw new Error(`Unknown provider: ${providerName}`);
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
    const info = {
      current: this.currentProvider,
      fallback: this.fallbackProvider,
      available: await this.getAvailableProviders()
    };

    // Add model information for local provider
    if (this.providers.local && info.available.local) {
      try {
        info.localModels = await this.providers.local.listModels();
      } catch (error) {
        info.localModels = [];
      }
    }

    return info;
  }

  // Configuration methods
  setLocalModel(modelName) {
    if (this.providers.local) {
      this.providers.local.model = modelName;
    }
  }

  setHuggingFaceModel(modelName) {
    if (this.providers.huggingface) {
      this.providers.huggingface.model = modelName;
    }
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