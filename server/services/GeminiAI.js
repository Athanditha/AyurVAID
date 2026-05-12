// GeminiAI.js — Dedicated Gemini LLM Provider for AyurVAID
const { GoogleGenerativeAI } = require('@google/generative-ai');

class GeminiAI {
  constructor() {
    this.name = 'gemini';
    this.genAI = null;
    this.model = null;

    if (process.env.GEMINI_API_KEY) {
      this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      console.log('✅ Gemini AI provider initialized');
    } else {
      console.warn('⚠️  GEMINI_API_KEY not found — Gemini provider will be unavailable');
    }
  }

  async isAvailable() {
    return !!this.genAI;
  }

  /**
   * Generate a response using Gemini generative AI.
   * @param {Array} messages - OpenAI-style messages array [{role, content}]
   * @param {Object|null} doshaProfile - User's dosha analysis profile
   * @param {Object} options - Additional options (temperature, max_tokens, etc.)
   */
  async generateResponse(messages, doshaProfile = null, options = {}) {
    if (!this.genAI) {
      throw new Error('Gemini AI is not initialised — GEMINI_API_KEY missing from .env');
    }

    // ── Build the system instruction ──────────────────────────────────
    let systemInstruction = this._buildSystemPrompt(messages, doshaProfile);

    // ── Initialise the model ─────────────────────────────────────────
    const modelName = options.model || 'gemini-2.5-flash';
    const model = this.genAI.getGenerativeModel({
      model: modelName,
      systemInstruction,
      generationConfig: {
        temperature: options.temperature ?? 0.7,
        maxOutputTokens: options.max_tokens ?? 4096,
        topP: 0.9,
        topK: 40,
      },
      // Safety settings — allow health/medical discussions
      safetySettings: [
        { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_ONLY_HIGH' },
        { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_ONLY_HIGH' },
        { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_ONLY_HIGH' },
        { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_ONLY_HIGH' },
      ],
    });

    // ── Build Gemini chat history from messages ──────────────────────
    const history = [];
    for (let i = 0; i < messages.length - 1; i++) {
      const msg = messages[i];
      if (msg.role === 'system') continue; // system prompt is handled via systemInstruction
      history.push({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }],
      });
    }

    // Ensure history alternates user/model (Gemini requirement)
    const sanitisedHistory = this._sanitiseHistory(history);

    // ── Start chat and send the latest user message ──────────────────
    const chat = model.startChat({ history: sanitisedHistory });
    const lastUserMessage = messages[messages.length - 1]?.content || '';

    // Retry logic for rate limits (429 / 503)
    const MAX_RETRIES = 3;
    let lastError = null;
    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      try {
        const result = await chat.sendMessage(lastUserMessage);
        const responseText = result.response.text();

        return {
          message: responseText,
          provider: 'gemini',
          model: modelName,
          usage: {
            prompt_tokens: lastUserMessage.split(' ').length,
            completion_tokens: responseText.split(' ').length,
          },
        };
      } catch (err) {
        lastError = err;
        const isRateLimit = err.message && (err.message.includes('429') || err.message.includes('503') || err.message.includes('RESOURCE_EXHAUSTED'));
        if (isRateLimit && attempt < MAX_RETRIES) {
          const delay = Math.pow(2, attempt + 1) * 1000; // 2s, 4s, 8s
          console.log(`⏳ Gemini rate-limited. Retrying in ${delay / 1000}s (attempt ${attempt + 1}/${MAX_RETRIES})...`);
          await new Promise(r => setTimeout(r, delay));
        } else {
          throw err;
        }
      }
    }
    throw lastError;
  }

  // ════════════════════════════════════════════════════════════════════
  //  PRIVATE HELPERS
  // ════════════════════════════════════════════════════════════════════

  /**
   * Build an Ayurvedic-aware system prompt. If the messages array already
   * contains a 'system' role entry, we prepend it to our base prompt so
   * that RAG context injected upstream is preserved.
   */
  _buildSystemPrompt(messages, doshaProfile) {
    let base = `You are AyurVAID, a premium Ayurvedic health intelligence advisor powered by classical Ayurvedic wisdom and modern research.

CORE DIRECTIVES:
1. Provide evidence-based, personalised Ayurvedic health recommendations.
2. Use Markdown formatting (bold, lists, headings) for clear, readable responses.
3. Reference specific herbs, foods, and practices from the Ayurvedic pharmacopoeia.
4. Always include safety disclaimers when discussing health conditions — recommend consulting healthcare professionals for serious issues.
5. Be warm, supportive, and interactive. Keep responses VERY concise and direct, ideally no more than 2-3 short paragraphs (100-200 words).
6. When discussing dietary advice, mention the Rasa (taste), Virya (potency), and Vipaka (post-digestive effect) of key foods/herbs.
7. Consider seasonal (Ritucharya) and daily routine (Dinacharya) context.`;

    // Inject dosha profile context if available
    if (doshaProfile) {
      const primary = doshaProfile.primary || doshaProfile;
      base += `\n\nUSER CONSTITUTION:
- Primary Dosha: ${typeof primary === 'string' ? primary.toUpperCase() : JSON.stringify(primary)}`;
      
      if (doshaProfile.secondary) {
        base += `\n- Secondary Dosha: ${doshaProfile.secondary.toUpperCase()}`;
      }
      if (doshaProfile.scores) {
        base += `\n- Dosha Scores: Vata ${doshaProfile.scores.vata}%, Pitta ${doshaProfile.scores.pitta}%, Kapha ${doshaProfile.scores.kapha}%`;
      }
      if (doshaProfile.constitutionType) {
        base += `\n- Constitution Type: ${doshaProfile.constitutionType}`;
      }

      base += `\n\nTailor ALL advice to this user's ${typeof primary === 'string' ? primary.toUpperCase() : ''}-dominant constitution. Explain WHY each recommendation suits their specific constitution.`;
    }

    // Merge any upstream system message (e.g. RAG context from AIServiceManager)
    const systemMsg = messages.find(m => m.role === 'system');
    if (systemMsg) {
      base += '\n\n' + systemMsg.content;
    }

    return base;
  }

  /**
   * Gemini's chat API requires strict user/model alternation.
   * This helper merges consecutive same-role messages and ensures
   * the history starts with a 'user' turn.
   */
  _sanitiseHistory(history) {
    if (history.length === 0) return [];

    const sanitised = [];
    for (const msg of history) {
      const last = sanitised[sanitised.length - 1];
      if (last && last.role === msg.role) {
        // Merge consecutive messages from the same role
        last.parts[0].text += '\n\n' + msg.parts[0].text;
      } else {
        sanitised.push({ ...msg, parts: [{ text: msg.parts[0].text }] });
      }
    }

    // Gemini requires history to start with a 'user' message
    while (sanitised.length > 0 && sanitised[0].role !== 'user') {
      sanitised.shift();
    }

    return sanitised;
  }
}

module.exports = GeminiAI;
