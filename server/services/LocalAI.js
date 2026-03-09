// Local AI Service using Ollama
const axios = require('axios');

class LocalAI {
  constructor(options = {}) {
    this.baseURL = options.baseURL || 'http://localhost:11434';
    this.model = options.model || 'llama2'; // or 'mistral', 'codellama', etc.
    this.timeout = options.timeout || 30000;
  }

  async generateResponse(messages, options = {}) {
    try {
      // Convert OpenAI format to Ollama format
      const prompt = this.formatMessagesForOllama(messages);
      
      const response = await axios.post(`${this.baseURL}/api/generate`, {
        model: this.model,
        prompt: prompt,
        stream: false,
        options: {
          temperature: options.temperature || 0.7,
          top_p: options.top_p || 0.9,
          max_tokens: options.max_tokens || 600,
          ...options
        }
      }, {
        timeout: this.timeout
      });

      return {
        message: response.data.response,
        model: this.model,
        usage: {
          prompt_tokens: response.data.prompt_eval_count || 0,
          completion_tokens: response.data.eval_count || 0
        }
      };
    } catch (error) {
      console.error('Local AI error:', error.message);
      throw new Error('Local AI service unavailable');
    }
  }

  formatMessagesForOllama(messages) {
    let prompt = '';
    
    messages.forEach(msg => {
      if (msg.role === 'system') {
        prompt += `System: ${msg.content}\n\n`;
      } else if (msg.role === 'user') {
        prompt += `Human: ${msg.content}\n\n`;
      } else if (msg.role === 'assistant') {
        prompt += `Assistant: ${msg.content}\n\n`;
      }
    });
    
    prompt += 'Assistant: ';
    return prompt;
  }

  async isAvailable() {
    try {
      const response = await axios.get(`${this.baseURL}/api/tags`, {
        timeout: 5000
      });
      return response.status === 200;
    } catch (error) {
      return false;
    }
  }

  async listModels() {
    try {
      const response = await axios.get(`${this.baseURL}/api/tags`);
      return response.data.models || [];
    } catch (error) {
      console.error('Error listing models:', error.message);
      return [];
    }
  }
}

module.exports = LocalAI;