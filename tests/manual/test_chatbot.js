/**
 * AyurVAID Chatbot Comprehensive Test Suite
 * Tests: Auth, Chat Pipeline, AI Services, Edge Cases, CustomAI, RasaAI, Gemini Fallback
 */

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const axios = require('axios');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const BASE_URL = `http://localhost:${process.env.PORT || 3001}/api`;
const RASA_URL = process.env.RASA_SERVER_URL || 'http://localhost:5005';
const GEMINI_KEY = process.env.GEMINI_API_KEY;
const AI_PROVIDER = process.env.AI_PROVIDER || 'custom';

// Test result tracking
const results = [];
let authToken = null;
let testConversationId = null;

function record(suite, name, status, details = '', duration = 0, response = null) {
  results.push({ suite, name, status, details, duration, response });
  const icon = status === 'PASS' ? '✓' : status === 'FAIL' ? '✗' : '⚠';
  const color = status === 'PASS' ? '\x1b[32m' : status === 'FAIL' ? '\x1b[31m' : '\x1b[33m';
  console.log(`${color}  ${icon} [${status}]\x1b[0m  ${name}${details ? ' — ' + details.slice(0, 100) : ''}`);
}

async function time(fn) {
  const start = Date.now();
  const result = await fn();
  return { result, duration: Date.now() - start };
}

// ─── SUITE 1: Environment & Config ────────────────────────────────────────────
async function suite1_Environment() {
  console.log('\n\x1b[1m\x1b[36m━━━ SUITE 1: Environment & Configuration ━━━\x1b[0m');

  // Test 1.1: Server reachability
  try {
    const { result, duration } = await time(() => axios.get(`${BASE_URL}/health`, { timeout: 3000 }));
    if (result.data.status === 'OK') {
      record('Environment', 'Server Health Check', 'PASS', `Responded in ${duration}ms`, duration, result.data);
    } else {
      record('Environment', 'Server Health Check', 'FAIL', 'Unexpected response body', duration);
    }
  } catch (e) {
    record('Environment', 'Server Health Check', 'FAIL', `Server not reachable: ${e.message}`);
  }

  // Test 1.2: GEMINI_API_KEY configured
  if (GEMINI_KEY && GEMINI_KEY.length > 10) {
    record('Environment', 'GEMINI_API_KEY Configured', 'PASS', `Key present (${GEMINI_KEY.slice(0, 12)}...)`);
  } else {
    record('Environment', 'GEMINI_API_KEY Configured', 'FAIL', 'Missing or too short');
  }

  // Test 1.3: AI_PROVIDER configured
  if (['custom', 'rasa', 'openai', 'local', 'huggingface'].includes(AI_PROVIDER)) {
    record('Environment', 'AI_PROVIDER Valid', 'PASS', `Provider set to: ${AI_PROVIDER}`);
  } else {
    record('Environment', 'AI_PROVIDER Valid', 'FAIL', `Unknown provider: ${AI_PROVIDER}`);
  }

  // Test 1.4: JWT_SECRET configured
  if (process.env.JWT_SECRET && process.env.JWT_SECRET.length >= 16) {
    record('Environment', 'JWT_SECRET Configured', 'PASS', 'Key present and long enough');
  } else {
    record('Environment', 'JWT_SECRET Configured', 'FAIL', 'Missing or too short');
  }
}

// ─── SUITE 2: Authentication API ─────────────────────────────────────────────
async function suite2_Auth() {
  console.log('\n\x1b[1m\x1b[36m━━━ SUITE 2: Authentication API ━━━\x1b[0m');

  const testEmail = `testuser_${Date.now()}@ayurvaid.test`;
  const testPassword = 'TestPass123!';

  // Test 2.1: Registration with valid data
  try {
    const { result, duration } = await time(() => axios.post(`${BASE_URL}/auth/register`, {
      email: testEmail, password: testPassword, firstName: 'Test', lastName: 'User'
    }));
    if (result.data.success && result.data.token) {
      authToken = result.data.token;
      record('Auth', 'User Registration (valid)', 'PASS', `Token received, userId: ${result.data.user?.id?.slice(0, 12)}`, duration, result.data);
    } else {
      record('Auth', 'User Registration (valid)', 'FAIL', 'No token in response', duration);
    }
  } catch (e) {
    record('Auth', 'User Registration (valid)', 'FAIL', e.response?.data?.error || e.message);
  }

  // Test 2.2: Registration with missing fields
  try {
    await axios.post(`${BASE_URL}/auth/register`, { email: 'incomplete@test.com' });
    record('Auth', 'Registration Missing Fields', 'FAIL', 'Should have rejected incomplete data');
  } catch (e) {
    if (e.response?.status === 400) {
      record('Auth', 'Registration Missing Fields', 'PASS', 'Correctly returned 400');
    } else {
      record('Auth', 'Registration Missing Fields', 'FAIL', `Wrong error status: ${e.response?.status}`);
    }
  }

  // Test 2.3: Registration with invalid email
  try {
    await axios.post(`${BASE_URL}/auth/register`, {
      email: 'not-an-email', password: 'Pass123', firstName: 'A', lastName: 'B'
    });
    record('Auth', 'Registration Invalid Email', 'FAIL', 'Should reject invalid email');
  } catch (e) {
    if (e.response?.status === 400) {
      record('Auth', 'Registration Invalid Email', 'PASS', 'Correctly rejected invalid email');
    } else {
      record('Auth', 'Registration Invalid Email', 'FAIL', `Wrong status: ${e.response?.status}`);
    }
  }

  // Test 2.4: Registration with short password
  try {
    await axios.post(`${BASE_URL}/auth/register`, {
      email: 'valid@test.com', password: '123', firstName: 'A', lastName: 'B'
    });
    record('Auth', 'Registration Short Password', 'FAIL', 'Should reject short password');
  } catch (e) {
    if (e.response?.status === 400) {
      record('Auth', 'Registration Short Password', 'PASS', 'Correctly rejected short password');
    } else {
      record('Auth', 'Registration Short Password', 'FAIL', `Wrong status: ${e.response?.status}`);
    }
  }

  // Test 2.5: Login with valid credentials
  try {
    const { result, duration } = await time(() => axios.post(`${BASE_URL}/auth/login`, {
      email: testEmail, password: testPassword
    }));
    if (result.data.success && result.data.token) {
      authToken = result.data.token; // refresh token
      record('Auth', 'Login (valid credentials)', 'PASS', `Login successful in ${duration}ms`, duration, result.data);
    } else {
      record('Auth', 'Login (valid credentials)', 'FAIL', 'No token returned', duration);
    }
  } catch (e) {
    record('Auth', 'Login (valid credentials)', 'FAIL', e.response?.data?.error || e.message);
  }

  // Test 2.6: Login with wrong password
  try {
    await axios.post(`${BASE_URL}/auth/login`, { email: testEmail, password: 'WrongPass' });
    record('Auth', 'Login Wrong Password', 'FAIL', 'Should have rejected auth');
  } catch (e) {
    if (e.response?.status === 401) {
      record('Auth', 'Login Wrong Password', 'PASS', 'Correctly returned 401');
    } else {
      record('Auth', 'Login Wrong Password', 'FAIL', `Wrong status: ${e.response?.status}`);
    }
  }

  // Test 2.7: /me endpoint with token
  if (authToken) {
    try {
      const { result, duration } = await time(() => axios.get(`${BASE_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${authToken}` }
      }));
      if (result.data.success && result.data.user) {
        record('Auth', 'GET /me with valid token', 'PASS', `User id: ${result.data.user.id?.slice(0, 12)}`, duration);
      } else {
        record('Auth', 'GET /me with valid token', 'FAIL', 'No user in response', duration);
      }
    } catch (e) {
      record('Auth', 'GET /me with valid token', 'FAIL', e.response?.data?.error || e.message);
    }
  }

  // Test 2.8: /me without token
  try {
    await axios.get(`${BASE_URL}/auth/me`);
    record('Auth', 'GET /me without token', 'FAIL', 'Should have returned 401');
  } catch (e) {
    if (e.response?.status === 401) {
      record('Auth', 'GET /me without token', 'PASS', 'Correctly returned 401');
    } else {
      record('Auth', 'GET /me without token', 'FAIL', `Wrong status: ${e.response?.status}`);
    }
  }
}

// ─── SUITE 3: Chat API — Core Functionality ───────────────────────────────────
async function suite3_ChatCore() {
  console.log('\n\x1b[1m\x1b[36m━━━ SUITE 3: Chat API — Core Functionality ━━━\x1b[0m');

  if (!authToken) {
    console.log('  \x1b[33m⚠ Skipped — no auth token available\x1b[0m');
    record('Chat Core', 'All Tests', 'WARN', 'Skipped — could not obtain auth token');
    return;
  }

  const authHeaders = { Authorization: `Bearer ${authToken}` };

  // Test 3.1: Send a basic message without dosha profile
  try {
    const { result, duration } = await time(() => axios.post(`${BASE_URL}/chat/message`, {
      message: 'Hello, what is Ayurveda?'
    }, { headers: authHeaders, timeout: 30000 }));

    if (result.data.success && result.data.response?.message) {
      testConversationId = result.data.conversationId;
      record('Chat Core', 'Basic Message (no profile)', 'PASS',
        `Reply: "${result.data.response.message.slice(0, 80)}..." [${duration}ms]`, duration, result.data.response);
    } else {
      record('Chat Core', 'Basic Message (no profile)', 'FAIL', 'Empty or malformed response', duration);
    }
  } catch (e) {
    record('Chat Core', 'Basic Message (no profile)', 'FAIL', e.response?.data?.error || e.message);
  }

  // Test 3.2: Continue conversation (use previous conversationId)
  if (testConversationId) {
    try {
      const { result, duration } = await time(() => axios.post(`${BASE_URL}/chat/message`, {
        message: 'Tell me more about Vata dosha',
        conversationId: testConversationId
      }, { headers: authHeaders, timeout: 30000 }));

      if (result.data.success && result.data.response?.message) {
        record('Chat Core', 'Conversation Continuity', 'PASS',
          `Continued conv ${testConversationId.slice(0, 12)} [${duration}ms]`, duration);
      } else {
        record('Chat Core', 'Conversation Continuity', 'FAIL', 'Failed to continue conversation', duration);
      }
    } catch (e) {
      record('Chat Core', 'Conversation Continuity', 'FAIL', e.response?.data?.error || e.message);
    }
  }

  // Test 3.3: Message with invalid conversationId
  try {
    await axios.post(`${BASE_URL}/chat/message`, {
      message: 'Test', conversationId: 'nonexistent-conv-id-123'
    }, { headers: authHeaders, timeout: 10000 });
    record('Chat Core', 'Invalid ConversationId', 'FAIL', 'Should have returned 404');
  } catch (e) {
    if (e.response?.status === 404) {
      record('Chat Core', 'Invalid ConversationId', 'PASS', 'Correctly returned 404');
    } else {
      record('Chat Core', 'Invalid ConversationId', 'FAIL', `Wrong status: ${e.response?.status} — ${e.response?.data?.error}`);
    }
  }

  // Test 3.4: Empty message validation
  try {
    await axios.post(`${BASE_URL}/chat/message`, {
      message: ''
    }, { headers: authHeaders });
    record('Chat Core', 'Empty Message Validation', 'FAIL', 'Should have rejected empty message');
  } catch (e) {
    if (e.response?.status === 400) {
      record('Chat Core', 'Empty Message Validation', 'PASS', 'Correctly returned 400');
    } else {
      record('Chat Core', 'Empty Message Validation', 'FAIL', `Wrong status: ${e.response?.status}`);
    }
  }

  // Test 3.5: Missing message field
  try {
    await axios.post(`${BASE_URL}/chat/message`, {}, { headers: authHeaders });
    record('Chat Core', 'Missing Message Field', 'FAIL', 'Should reject missing message');
  } catch (e) {
    if (e.response?.status === 400) {
      record('Chat Core', 'Missing Message Field', 'PASS', 'Correctly returned 400');
    } else {
      record('Chat Core', 'Missing Message Field', 'FAIL', `Wrong status: ${e.response?.status}`);
    }
  }

  // Test 3.6: No auth token
  try {
    await axios.post(`${BASE_URL}/chat/message`, { message: 'Hello' });
    record('Chat Core', 'No Auth Token on Chat', 'FAIL', 'Should have returned 401');
  } catch (e) {
    if (e.response?.status === 401) {
      record('Chat Core', 'No Auth Token on Chat', 'PASS', 'Correctly returned 401');
    } else {
      record('Chat Core', 'No Auth Token on Chat', 'FAIL', `Wrong status: ${e.response?.status}`);
    }
  }
}

// ─── SUITE 4: Chat Content Quality ────────────────────────────────────────────
async function suite4_ChatContent() {
  console.log('\n\x1b[1m\x1b[36m━━━ SUITE 4: Chat Content Quality ━━━\x1b[0m');

  if (!authToken) {
    record('Chat Content', 'All Tests', 'WARN', 'Skipped — no auth token');
    return;
  }

  const authHeaders = { Authorization: `Bearer ${authToken}` };

  const queries = [
    { msg: 'What foods should I eat for Vata dosha?', keyword: 'vata', label: 'Vata Food Query' },
    { msg: 'How should a Pitta person manage stress?', keyword: 'pitta', label: 'Pitta Stress Query' },
    { msg: 'What exercise is good for Kapha dosha?', keyword: 'kapha', label: 'Kapha Exercise Query' },
    { msg: 'I have digestive problems, what should I do?', keyword: null, label: 'Digestive Health Query' },
    { msg: 'Suggest a morning routine for me', keyword: null, label: 'Lifestyle Routine Query' },
  ];

  for (const q of queries) {
    try {
      const { result, duration } = await time(() => axios.post(`${BASE_URL}/chat/message`, {
        message: q.msg
      }, { headers: authHeaders, timeout: 30000 }));

      if (result.data.success && result.data.response?.message) {
        const reply = result.data.response.message.toLowerCase();
        const hasKeyword = !q.keyword || reply.includes(q.keyword);
        const isLongEnough = result.data.response.message.length > 50;

        if (isLongEnough && hasKeyword) {
          record('Chat Content', q.label, 'PASS',
            `${result.data.response.message.length} chars, ${duration}ms`, duration);
        } else if (!isLongEnough) {
          record('Chat Content', q.label, 'FAIL', `Response too short: ${result.data.response.message.length} chars`);
        } else {
          record('Chat Content', q.label, 'WARN', `Missing expected keyword "${q.keyword}"`);
        }
      } else {
        record('Chat Content', q.label, 'FAIL', 'Empty or failed response');
      }
    } catch (e) {
      record('Chat Content', q.label, 'FAIL', e.response?.data?.error || e.message);
    }
  }

  // Test: Response has explanation field
  try {
    const { result } = await time(() => axios.post(`${BASE_URL}/chat/message`, {
      message: 'What is turmeric good for?'
    }, { headers: authHeaders, timeout: 30000 }));

    if (result.data.response?.explanation) {
      record('Chat Content', 'Explanation Field Present', 'PASS', 'Explanation object returned');
    } else {
      record('Chat Content', 'Explanation Field Present', 'FAIL', 'No explanation field in response');
    }
  } catch (e) {
    record('Chat Content', 'Explanation Field Present', 'FAIL', e.message);
  }
}

// ─── SUITE 5: AI Service Layer ─────────────────────────────────────────────────
async function suite5_AIServices() {
  console.log('\n\x1b[1m\x1b[36m━━━ SUITE 5: AI Service Layer ━━━\x1b[0m');

  // 5.1 CustomAI unit test
  try {
    const CustomAI = require('./services/CustomAI');
    const ai = new CustomAI();
    const msgs = [{ role: 'user', content: 'I need food advice for Vata constitution' }];
    const doshaProfile = { primary: 'vata', secondary: 'pitta', scores: { vata: 65, pitta: 25, kapha: 10 } };
    const { result, duration } = await time(() => ai.generateResponse(msgs, doshaProfile));
    if (result.message && result.message.length > 20) {
      record('AI Services', 'CustomAI — Personalized Response', 'PASS',
        `"${result.message.slice(0, 80)}"`, duration);
    } else {
      record('AI Services', 'CustomAI — Personalized Response', 'FAIL', 'Empty or short response');
    }
  } catch (e) {
    record('AI Services', 'CustomAI — Personalized Response', 'FAIL', e.message);
  }

  // 5.2 CustomAI without dosha profile
  try {
    const CustomAI = require('./services/CustomAI');
    const ai = new CustomAI();
    const msgs = [{ role: 'user', content: 'How can I sleep better?' }];
    const { result, duration } = await time(() => ai.generateResponse(msgs, null));
    if (result.message && result.message.length > 20) {
      record('AI Services', 'CustomAI — Generic Response (no profile)', 'PASS',
        `"${result.message.slice(0, 80)}"`, duration);
    } else {
      record('AI Services', 'CustomAI — Generic Response (no profile)', 'FAIL', 'Empty or short response');
    }
  } catch (e) {
    record('AI Services', 'CustomAI — Generic Response (no profile)', 'FAIL', e.message);
  }

  // 5.3 CustomAI intent classification
  try {
    const CustomAI = require('./services/CustomAI');
    const ai = new CustomAI();
    const testCases = [
      ['I want to know what to eat', 'food'],
      ['help me with my sleep issues', 'sleep'],
      ['what yoga exercises should I do', 'exercise'],
      ['I have stomach bloating and gas', 'digestion'],
      ['I feel stressed and anxious', 'mental'],
    ];
    let allPassed = true;
    for (const [msg, expectedIntent] of testCases) {
      const detected = ai.classifyIntent(msg.toLowerCase());
      if (detected !== expectedIntent) {
        allPassed = false;
        record('AI Services', `Intent: "${msg.slice(0, 30)}"`, 'FAIL',
          `Expected "${expectedIntent}", got "${detected}"`);
      }
    }
    if (allPassed) {
      record('AI Services', 'CustomAI Intent Classification (5 cases)', 'PASS', 'All intents correctly classified');
    }
  } catch (e) {
    record('AI Services', 'CustomAI Intent Classification', 'FAIL', e.message);
  }

  // 5.4 RasaAI availability check
  try {
    const RasaAI = require('./services/RasaAI');
    const rasa = new RasaAI();
    const { result: available, duration } = await time(() => rasa.isAvailable());
    if (available) {
      record('AI Services', 'RasaAI.isAvailable()', 'PASS', `Available (Gemini present: ${!!rasa.genAI}) [${duration}ms]`, duration);
    } else {
      record('AI Services', 'RasaAI.isAvailable()', 'FAIL', 'Returned false');
    }
  } catch (e) {
    record('AI Services', 'RasaAI.isAvailable()', 'FAIL', e.message);
  }

  // 5.5 Gemini API direct call
  if (GEMINI_KEY) {
    try {
      const genAI = new GoogleGenerativeAI(GEMINI_KEY);
      const model = genAI.getGenerativeModel({
        model: 'gemini-2.0-flash',
        systemInstruction: 'You are a helpful Ayurvedic health assistant. Be concise.'
      });
      const { result, duration } = await time(async () => {
        const chat = model.startChat({ history: [] });
        return chat.sendMessage('In one sentence, what is Pitta dosha?');
      });
      const text = result.response.text();
      if (text && text.length > 10) {
        record('AI Services', 'Gemini API Direct Call', 'PASS', `"${text.slice(0, 100)}" [${duration}ms]`, duration);
      } else {
        record('AI Services', 'Gemini API Direct Call', 'FAIL', 'Empty response');
      }
    } catch (e) {
      record('AI Services', 'Gemini API Direct Call', 'FAIL', e.message);
    }
  } else {
    record('AI Services', 'Gemini API Direct Call', 'WARN', 'GEMINI_API_KEY not set');
  }

  // 5.6 RasaAI generativeFallback
  try {
    const RasaAI = require('./services/RasaAI');
    const rasa = new RasaAI();
    if (rasa.genAI) {
      const msgs = [{ role: 'user', content: 'What herbs help with digestion for a Vata person?' }];
      const { result, duration } = await time(() => rasa.generativeFallback(msgs, { primary: 'vata' }));
      if (result.message && result.message.length > 20) {
        record('AI Services', 'RasaAI Gemini Fallback', 'PASS',
          `Provider: ${result.provider} [${duration}ms]`, duration);
      } else {
        record('AI Services', 'RasaAI Gemini Fallback', 'FAIL', 'Empty response from fallback');
      }
    } else {
      record('AI Services', 'RasaAI Gemini Fallback', 'WARN', 'genAI not initialized');
    }
  } catch (e) {
    record('AI Services', 'RasaAI Gemini Fallback', 'FAIL', e.message);
  }

  // 5.7 AIServiceManager initialization
  try {
    const AIServiceManager = require('./services/AIServiceManager');
    const manager = new AIServiceManager();
    await new Promise(r => setTimeout(r, 1000));
    const provider = manager.getCurrentProvider();
    if (['custom', 'rasa', 'openai', 'local', 'huggingface'].includes(provider)) {
      record('AI Services', 'AIServiceManager Init', 'PASS', `Active provider: ${provider}`);
    } else {
      record('AI Services', 'AIServiceManager Init', 'FAIL', `Invalid provider: ${provider}`);
    }
  } catch (e) {
    record('AI Services', 'AIServiceManager Init', 'FAIL', e.message);
  }

  // 5.8 AIServiceManager generate via current provider
  try {
    const AIServiceManager = require('./services/AIServiceManager');
    const manager = new AIServiceManager();
    await new Promise(r => setTimeout(r, 1000));
    const msgs = [
      { role: 'system', content: 'You are AyurVAID.' },
      { role: 'user', content: 'What are some calming herbs for Pitta dosha?' }
    ];
    const { result, duration } = await time(() => manager.generateResponse(msgs, null, {}));
    if (result.message && result.message.length > 20) {
      record('AI Services', 'AIServiceManager.generateResponse()', 'PASS',
        `Via: ${result.provider} [${duration}ms]`, duration);
    } else {
      record('AI Services', 'AIServiceManager.generateResponse()', 'FAIL', 'Empty or missing message');
    }
  } catch (e) {
    record('AI Services', 'AIServiceManager.generateResponse()', 'FAIL', e.message);
  }
}

// ─── SUITE 6: Rasa Connectivity ───────────────────────────────────────────────
async function suite6_Rasa() {
  console.log('\n\x1b[1m\x1b[36m━━━ SUITE 6: Rasa Server Connectivity ━━━\x1b[0m');

  let rasaUp = false;

  try {
    const { result, duration } = await time(() => axios.get(`${RASA_URL}/`, { timeout: 3000 }));
    rasaUp = true;
    record('Rasa', 'Rasa Server Connectivity', 'PASS', `HTTP ${result.status} in ${duration}ms`, duration);
  } catch (e) {
    if (e.response) {
      rasaUp = true;
      record('Rasa', 'Rasa Server Connectivity', 'PASS', `Running (HTTP ${e.response.status})`);
    } else {
      record('Rasa', 'Rasa Server Connectivity', 'WARN', `Offline at ${RASA_URL} — Gemini fallback will handle chat`);
    }
  }

  if (rasaUp) {
    const testMessages = [
      'What foods should I eat for Vata dosha?',
      'I have digestive problems, help me',
      'Hello, who are you?'
    ];
    for (const msg of testMessages) {
      try {
        const { result, duration } = await time(() => axios.post(`${RASA_URL}/webhooks/rest/webhook`, {
          sender: 'test_suite', message: msg
        }, { timeout: 5000 }));

        if (result.data && result.data.length > 0) {
          const text = result.data.map(m => m.text).join(' | ');
          const isFallback = text.includes("I'm still learning");
          record('Rasa', `Webhook: "${msg.slice(0, 35)}..."`, isFallback ? 'WARN' : 'PASS',
            `"${text.slice(0, 80)}" ${isFallback ? '[FALLBACK → Gemini]' : ''}`, duration);
        } else {
          record('Rasa', `Webhook: "${msg.slice(0, 35)}..."`, 'WARN', 'Empty response → Gemini fallback triggered');
        }
      } catch (e) {
        record('Rasa', `Webhook: "${msg.slice(0, 35)}..."`, 'FAIL', e.message);
      }
    }
  } else {
    record('Rasa', 'Rasa Webhook Tests', 'WARN', 'Skipped — server offline');
  }
}

// ─── SUITE 7: AI Provider Info Endpoint ──────────────────────────────────────
async function suite7_ProviderInfo() {
  console.log('\n\x1b[1m\x1b[36m━━━ SUITE 7: AI Provider Info Endpoint ━━━\x1b[0m');

  if (!authToken) {
    record('Provider Info', 'All Tests', 'WARN', 'Skipped — no auth token');
    return;
  }
  const authHeaders = { Authorization: `Bearer ${authToken}` };

  try {
    const { result, duration } = await time(() => axios.get(`${BASE_URL}/chat/ai-info`, { headers: authHeaders }));
    if (result.data.success && result.data.providerInfo) {
      record('Provider Info', 'GET /chat/ai-info', 'PASS',
        `Current: ${result.data.providerInfo.current} [${duration}ms]`, duration, result.data.providerInfo);
    } else {
      record('Provider Info', 'GET /chat/ai-info', 'FAIL', 'No providerInfo in response');
    }
  } catch (e) {
    record('Provider Info', 'GET /chat/ai-info', 'FAIL', e.response?.data?.error || e.message);
  }
}

// ─── SUITE 8: Edge Cases & Robustness ─────────────────────────────────────────
async function suite8_EdgeCases() {
  console.log('\n\x1b[1m\x1b[36m━━━ SUITE 8: Edge Cases & Robustness ━━━\x1b[0m');

  if (!authToken) {
    record('Edge Cases', 'All Tests', 'WARN', 'Skipped — no auth token');
    return;
  }
  const authHeaders = { Authorization: `Bearer ${authToken}` };

  // 8.1 Very long message
  const longMsg = 'What Ayurvedic remedy is good for me? '.repeat(50);
  try {
    const { result, duration } = await time(() => axios.post(`${BASE_URL}/chat/message`, {
      message: longMsg
    }, { headers: authHeaders, timeout: 30000 }));
    if (result.data.success) {
      record('Edge Cases', 'Very Long Message (1800 chars)', 'PASS', `Handled in ${duration}ms`);
    } else {
      record('Edge Cases', 'Very Long Message (1800 chars)', 'FAIL', 'Failed to handle');
    }
  } catch (e) {
    if (e.response?.status === 400 || e.response?.status === 413) {
      record('Edge Cases', 'Very Long Message (1800 chars)', 'PASS', `Correctly rejected (${e.response.status})`);
    } else {
      record('Edge Cases', 'Very Long Message (1800 chars)', 'FAIL', e.response?.data?.error || e.message);
    }
  }

  // 8.2 Special characters / SQL injection
  try {
    const { result, duration } = await time(() => axios.post(`${BASE_URL}/chat/message`, {
      message: "'; DROP TABLE users; -- <script>alert('xss')</script>"
    }, { headers: authHeaders, timeout: 20000 }));
    if (result.data.success) {
      record('Edge Cases', 'Special Characters / Injection Attempt', 'PASS', `Handled safely in ${duration}ms`);
    } else {
      record('Edge Cases', 'Special Characters / Injection Attempt', 'FAIL', 'Failed');
    }
  } catch (e) {
    record('Edge Cases', 'Special Characters / Injection Attempt', 'FAIL', e.response?.data?.error || e.message);
  }

  // 8.3 Non-Ayurveda off-topic question
  try {
    const { result, duration } = await time(() => axios.post(`${BASE_URL}/chat/message`, {
      message: 'What is the capital of France?'
    }, { headers: authHeaders, timeout: 25000 }));
    if (result.data.success && result.data.response?.message) {
      record('Edge Cases', 'Off-Topic Question (Geography)', 'PASS',
        `Responded: "${result.data.response.message.slice(0, 80)}" [${duration}ms]`);
    } else {
      record('Edge Cases', 'Off-Topic Question (Geography)', 'FAIL', 'No response');
    }
  } catch (e) {
    record('Edge Cases', 'Off-Topic Question (Geography)', 'FAIL', e.message);
  }

  // 8.4 Emoji message
  try {
    const { result, duration } = await time(() => axios.post(`${BASE_URL}/chat/message`, {
      message: '🌿 Tell me about Ayurveda 🌱'
    }, { headers: authHeaders, timeout: 25000 }));
    if (result.data.success) {
      record('Edge Cases', 'Emoji Message', 'PASS', `Handled in ${duration}ms`);
    } else {
      record('Edge Cases', 'Emoji Message', 'FAIL', 'Not handled');
    }
  } catch (e) {
    record('Edge Cases', 'Emoji Message', 'FAIL', e.message);
  }

  // 8.5 Response time under 30s
  try {
    const start = Date.now();
    const result = await axios.post(`${BASE_URL}/chat/message`, {
      message: 'Give me a detailed Vata diet plan for a week'
    }, { headers: authHeaders, timeout: 35000 });
    const elapsed = Date.now() - start;
    if (elapsed < 30000 && result.data.success) {
      record('Edge Cases', 'Response Time < 30s', 'PASS', `Responded in ${elapsed}ms`);
    } else if (elapsed >= 30000) {
      record('Edge Cases', 'Response Time < 30s', 'FAIL', `Took too long: ${elapsed}ms`);
    }
  } catch (e) {
    record('Edge Cases', 'Response Time < 30s', 'FAIL', e.message);
  }
}

// ─── MAIN RUNNER ───────────────────────────────────────────────────────────────
async function main() {
  console.log('\x1b[1m\x1b[36m╔══════════════════════════════════════════════════════╗');
  console.log('║      AyurVAID Chatbot Comprehensive Test Suite       ║');
  console.log('║      Full API + AI Services + Edge Cases Testing     ║');
  console.log('╚══════════════════════════════════════════════════════╝\x1b[0m\n');

  await suite1_Environment();
  await suite2_Auth();
  await suite3_ChatCore();
  await suite4_ChatContent();
  await suite5_AIServices();
  await suite6_Rasa();
  await suite7_ProviderInfo();
  await suite8_EdgeCases();

  // Summary
  const totalPass = results.filter(r => r.status === 'PASS').length;
  const totalFail = results.filter(r => r.status === 'FAIL').length;
  const totalWarn = results.filter(r => r.status === 'WARN').length;
  const total = results.length;

  console.log('\n\x1b[1m\x1b[36m━━━ FINAL SUMMARY ━━━\x1b[0m');
  console.log(`  Total Tests : ${total}`);
  console.log(`  \x1b[32mPassed\x1b[0m      : ${totalPass}`);
  console.log(`  \x1b[31mFailed\x1b[0m      : ${totalFail}`);
  console.log(`  \x1b[33mWarnings\x1b[0m    : ${totalWarn}`);
  console.log(`  Pass Rate   : ${Math.round((totalPass / total) * 100)}%`);

  // Export results as JSON for report generation
  const output = {
    timestamp: new Date().toISOString(),
    summary: { total, totalPass, totalFail, totalWarn, passRate: Math.round((totalPass / total) * 100) },
    aiProvider: AI_PROVIDER,
    rasaUrl: RASA_URL,
    results
  };

  require('fs').writeFileSync(
    require('path').join(__dirname, '../test_results.json'),
    JSON.stringify(output, null, 2)
  );

  console.log('\n  ✅ Results saved to test_results.json\n');
}

main().catch(err => {
  console.error('\nTest runner crashed:', err);
  process.exit(1);
});
