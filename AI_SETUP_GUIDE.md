# AyurVAID AI Models Setup Guide

This guide explains how to implement and use your own AI models in the AyurVAID system instead of relying on OpenAI's GPT-4.

## Available AI Providers

### 1. Custom Rule-Based AI (Default - No Setup Required)
- **Provider**: `custom`
- **Description**: Rule-based AI using traditional Ayurvedic knowledge
- **Pros**: No external dependencies, always available, privacy-focused
- **Cons**: Less conversational, limited to predefined responses
- **Setup**: Already configured and ready to use

### 2. Local AI with Ollama (Recommended)
- **Provider**: `local`
- **Description**: Run AI models locally using Ollama
- **Pros**: Privacy, no API costs, customizable models
- **Cons**: Requires local setup and resources

#### Setup Ollama:
```bash
# Install Ollama (macOS/Linux)
curl -fsSL https://ollama.ai/install.sh | sh

# Windows: Download from https://ollama.ai/download

# Pull a model (choose one)
ollama pull llama2          # 7B parameters, good balance
ollama pull mistral         # 7B parameters, fast
ollama pull codellama       # 7B parameters, code-focused
ollama pull llama2:13b      # 13B parameters, better quality
ollama pull medllama2       # Medical-focused (if available)

# Start Ollama server
ollama serve
```

#### Configure AyurVAID:
```bash
# In your .env file
AI_PROVIDER=local
LOCAL_AI_URL=http://localhost:11434
LOCAL_AI_MODEL=llama2
```

### 3. Hugging Face Models
- **Provider**: `huggingface`
- **Description**: Use Hugging Face transformers locally
- **Pros**: Wide model selection, local execution
- **Cons**: Requires Python setup, more complex

#### Setup Python Environment:
```bash
# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install transformers torch accelerate

# For medical models, consider:
# - microsoft/BioGPT-Large
# - dmis-lab/biobert-base-cased-v1.1
# - allenai/scibert_scivocab_uncased
```

#### Configure AyurVAID:
```bash
# In your .env file
AI_PROVIDER=huggingface
HF_MODEL=microsoft/DialoGPT-medium
```

### 4. OpenAI (Fallback)
- **Provider**: `openai`
- **Description**: Use OpenAI's GPT models
- **Pros**: High quality responses
- **Cons**: Requires API key, costs money, privacy concerns

## Switching AI Providers

### Method 1: Environment Variable
```bash
# Edit .env file
AI_PROVIDER=custom  # or local, huggingface, openai
```

### Method 2: Runtime API Call
```javascript
// Switch provider via API
fetch('/api/chat/switch-provider', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ provider: 'local' })
});
```

### Method 3: Admin Interface (Future Enhancement)
Create an admin panel to switch providers dynamically.

## Model Recommendations by Use Case

### Privacy-First Setup
```bash
AI_PROVIDER=custom
# Uses only rule-based responses, no external calls
```

### Best Quality (Local)
```bash
AI_PROVIDER=local
LOCAL_AI_MODEL=llama2:13b
# Larger model for better responses
```

### Medical Focus
```bash
AI_PROVIDER=huggingface
HF_MODEL=microsoft/BioGPT-Large
# Specialized medical knowledge
```

### Development/Testing
```bash
AI_PROVIDER=custom
# Fast, predictable responses for testing
```

## Custom Model Integration

### Adding Your Own Model Service

1. **Create a new service file**:
```javascript
// server/services/YourCustomAI.js
class YourCustomAI {
  async generateResponse(messages, options = {}) {
    // Your model logic here
    return {
      message: "Your AI response",
      model: "your-model-name",
      usage: { prompt_tokens: 0, completion_tokens: 0 }
    };
  }

  async isAvailable() {
    return true; // Check if your model is ready
  }
}

module.exports = YourCustomAI;
```

2. **Register in AIServiceManager**:
```javascript
// server/services/AIServiceManager.js
const YourCustomAI = require('./YourCustomAI');

// In constructor:
this.providers.yourcustom = new YourCustomAI();
```

3. **Update environment**:
```bash
AI_PROVIDER=yourcustom
```

## Performance Optimization

### For Local Models:
- Use GPU acceleration if available
- Choose appropriate model size for your hardware
- Consider quantized models for faster inference

### For Rule-Based AI:
- Extend the knowledge base in `server/data/`
- Add more response templates
- Improve intent classification

## Monitoring and Debugging

### Check Current Provider:
```bash
curl http://localhost:3001/api/chat/ai-info
```

### View Available Providers:
```javascript
// Returns status of all providers
{
  "current": "custom",
  "fallback": "custom",
  "available": {
    "openai": false,
    "local": true,
    "huggingface": false,
    "custom": true
  }
}
```

## Troubleshooting

### Ollama Issues:
```bash
# Check if Ollama is running
curl http://localhost:11434/api/tags

# Restart Ollama
ollama serve

# Check model list
ollama list
```

### Python/Hugging Face Issues:
```bash
# Test Python environment
python server/python/hf_model.py --model microsoft/DialoGPT-medium --prompt "Hello"

# Check transformers installation
python -c "import transformers; print(transformers.__version__)"
```

### Custom AI Issues:
- Check server logs for errors
- Verify knowledge base files are accessible
- Test with simple queries first

## Security Considerations

1. **Local Models**: Keep models updated for security patches
2. **API Keys**: Never commit API keys to version control
3. **Input Validation**: Sanitize user inputs before processing
4. **Rate Limiting**: Implement rate limiting for API endpoints
5. **Data Privacy**: Local models provide better privacy than cloud APIs

## Cost Comparison

| Provider | Setup Cost | Runtime Cost | Privacy | Quality |
|----------|------------|--------------|---------|---------|
| Custom | Free | Free | Excellent | Good |
| Local (Ollama) | Free | Electricity | Excellent | Very Good |
| Hugging Face | Free | Electricity | Excellent | Good-Very Good |
| OpenAI | Free | $0.01-0.06/1K tokens | Poor | Excellent |

## Next Steps

1. Start with the custom provider (already configured)
2. Set up Ollama for better conversational AI
3. Experiment with different models
4. Monitor performance and user satisfaction
5. Consider hybrid approaches (rule-based + AI)

For questions or issues, check the server logs and ensure all dependencies are properly installed.