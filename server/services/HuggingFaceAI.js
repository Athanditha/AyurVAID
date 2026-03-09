// Hugging Face AI Service
const { spawn } = require('child_process');
const path = require('path');

class HuggingFaceAI {
  constructor(options = {}) {
    this.model = options.model || 'microsoft/DialoGPT-medium';
    this.pythonScript = path.join(__dirname, '../python/hf_model.py');
    this.maxLength = options.maxLength || 500;
    this.temperature = options.temperature || 0.7;
  }

  async generateResponse(messages, options = {}) {
    return new Promise((resolve, reject) => {
      const prompt = this.formatMessages(messages);
      
      const python = spawn('python', [
        this.pythonScript,
        '--model', this.model,
        '--prompt', prompt,
        '--max_length', options.max_tokens || this.maxLength,
        '--temperature', options.temperature || this.temperature
      ]);

      let output = '';
      let error = '';

      python.stdout.on('data', (data) => {
        output += data.toString();
      });

      python.stderr.on('data', (data) => {
        error += data.toString();
      });

      python.on('close', (code) => {
        if (code === 0) {
          try {
            const result = JSON.parse(output);
            resolve({
              message: result.response,
              model: this.model,
              usage: result.usage || {}
            });
          } catch (parseError) {
            reject(new Error('Failed to parse AI response'));
          }
        } else {
          reject(new Error(`Python script failed: ${error}`));
        }
      });
    });
  }

  formatMessages(messages) {
    return messages
      .filter(msg => msg.role !== 'system')
      .map(msg => msg.content)
      .join(' ');
  }

  async isAvailable() {
    return new Promise((resolve) => {
      const python = spawn('python', ['-c', 'import transformers; print("OK")']);
      python.on('close', (code) => {
        resolve(code === 0);
      });
    });
  }
}

module.exports = HuggingFaceAI;