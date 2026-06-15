/**
 * AyurVAID Hybrid AI Diagnostic Test
 * Tests: Rasa connectivity, Gemini API, fallback chain, and full chat pipeline
 */

require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const axios = require('axios');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const RASA_URL = process.env.RASA_SERVER_URL || 'http://localhost:5005';
const GEMINI_KEY = process.env.GEMINI_API_KEY;
const AI_PROVIDER = process.env.AI_PROVIDER || 'custom';

const GREEN  = '\x1b[32m';
const RED    = '\x1b[31m';
const YELLOW = '\x1b[33m';
const CYAN   = '\x1b[36m';
const RESET  = '\x1b[0m';
const BOLD   = '\x1b[1m';

const pass  = (msg) => console.log(`${GREEN}  ✓ PASS${RESET}  ${msg}`);
const fail  = (msg) => console.log(`${RED}  ✗ FAIL${RESET}  ${msg}`);
const warn  = (msg) => console.log(`${YELLOW}  ⚠ WARN${RESET}  ${msg}`);
const info  = (msg) => console.log(`${CYAN}  ℹ INFO${RESET}  ${msg}`);
const section = (msg) => console.log(`\n${BOLD}${CYAN}━━━ ${msg} ━━━${RESET}`);

let passCount = 0, failCount = 0, warnCount = 0;

function recordPass(msg) { pass(msg); passCount++; }
function recordFail(msg) { fail(msg); failCount++; }
function recordWarn(msg) { warn(msg); warnCount++; }

// ─── TEST 1: Environment Variables ───────────────────────────────────────────
async function testEnvironment() {
  section('TEST 1: Environment Variables');

  info(`AI_PROVIDER  = ${AI_PROVIDER}`);
  info(`RASA_URL     = ${RASA_URL}`);
  info(`GEMINI_KEY   = ${GEMINI_KEY ? GEMINI_KEY.slice(0, 12) + '...' : 'NOT SET'}`);

  if (AI_PROVIDER === 'rasa') {
    recordPass('AI_PROVIDER is set to "rasa" (hybrid mode active)');
  } else {
    recordWarn(`AI_PROVIDER is "${AI_PROVIDER}" — not using Rasa provider. Change to "rasa" in .env for hybrid mode.`);
  }

  if (GEMINI_KEY && GEMINI_KEY.length > 10) {
    recordPass('GEMINI_API_KEY is present');
  } else {
    recordFail('GEMINI_API_KEY is missing or too short — generative fallback will not work');
  }
}

// ─── TEST 2: Rasa Server Connectivity ────────────────────────────────────────
async function testRasaConnectivity() {
  section('TEST 2: Rasa Server Connectivity');

  try {
    const response = await axios.get(`${RASA_URL}/`, { timeout: 3000 });
    recordPass(`Rasa server responded with HTTP ${response.status}`);
    return true;
  } catch (error) {
    if (error.response) {
      // Server responded but with an error code — it is still running
      recordPass(`Rasa server is RUNNING (responded HTTP ${error.response.status})`);
      return true;
    } else {
      recordFail(`Rasa server is OFFLINE at ${RASA_URL}: ${error.message}`);
      info('→ Start Rasa with: rasa run --enable-api --cors "*" (inside server/rasa)');
      return false;
    }
  }
}

// ─── TEST 3: Rasa Webhook ─────────────────────────────────────────────────────
async function testRasaWebhook(rasaUp) {
  section('TEST 3: Rasa NLP Webhook');

  if (!rasaUp) {
    recordWarn('Skipped — Rasa server is offline');
    return;
  }

  const testMessages = [
    'What foods should I eat for Vata dosha?',
    'I have digestive problems',
    'Hello'
  ];

  for (const msg of testMessages) {
    try {
      const response = await axios.post(`${RASA_URL}/webhooks/rest/webhook`, {
        sender: 'test_diagnostic',
        message: msg
      }, { timeout: 5000 });

      const data = response.data;
      if (data && data.length > 0) {
        const text = data.map(m => m.text).join(' | ');
        recordPass(`"${msg}" → Rasa replied: "${text.slice(0, 80)}..."`);

        // Check if it's a fallback response
        if (text.includes("I'm still learning the depths")) {
          recordWarn('↳ This is the Rasa fallback phrase → Gemini will be triggered');
        }
      } else if (data && data.length === 0) {
        recordWarn(`"${msg}" → Rasa returned EMPTY response (will trigger Gemini fallback)`);
      }
    } catch (error) {
      recordFail(`"${msg}" → Rasa webhook error: ${error.message}`);
    }
  }
}

// ─── TEST 4: Gemini API ───────────────────────────────────────────────────────
async function testGeminiAPI() {
  section('TEST 4: Gemini API (Generative Fallback Engine)');

  if (!GEMINI_KEY) {
    recordFail('Cannot test Gemini — GEMINI_API_KEY is not set');
    return false;
  }

  try {
    const genAI = new GoogleGenerativeAI(GEMINI_KEY);
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash',
      systemInstruction: "You are a helpful Ayurvedic health assistant."
    });

    const chat = model.startChat({ history: [] });
    const result = await chat.sendMessage('In one sentence: what is Vata dosha?');
    const text = result.response.text();

    if (text && text.length > 10) {
      recordPass(`Gemini API responded: "${text.slice(0, 100)}..."`);
      return true;
    } else {
      recordFail('Gemini response was empty or too short');
      return false;
    }
  } catch (error) {
    recordFail(`Gemini API error: ${error.message}`);
    if (error.message.includes('API_KEY_INVALID') || error.message.includes('API key')) {
      info('→ Check that GEMINI_API_KEY in .env is valid and active');
    }
    return false;
  }
}

// ─── TEST 5: Full Hybrid Pipeline (RasaAI class) ──────────────────────────────
async function testHybridPipeline(rasaUp, geminiUp) {
  section('TEST 5: Full Hybrid Pipeline (RasaAI class)');

  const RasaAI = require('../../server/services/RasaAI');
  const rasa = new RasaAI();

  // Check isAvailable()
  const available = await rasa.isAvailable();
  if (available) {
    recordPass(`RasaAI.isAvailable() → ${available} (Gemini present: ${!!rasa.genAI})`);
  } else {
    recordFail('RasaAI.isAvailable() returned false');
  }

  // Simulate a full chat message
  const mockMessages = [
    { role: 'system', content: 'You are AyurVAID.' },
    { role: 'user', content: 'What yoga should a Pitta person do?' }
  ];
  const mockDoshaProfile = { primary: 'pitta', secondary: 'vata', scores: { pitta: 60, vata: 25, kapha: 15 } };

  try {
    info('Sending test message through full hybrid pipeline...');
    const response = await rasa.generateResponse(mockMessages, mockDoshaProfile);

    if (response && response.message && response.message.length > 10) {
      recordPass(`Hybrid pipeline responded (${response.provider || 'rasa-direct'})`);
      info(`Response preview: "${response.message.slice(0, 150)}..."`);
    } else {
      recordFail('Hybrid pipeline returned empty or invalid response');
      console.log('Raw response:', response);
    }
  } catch (error) {
    recordFail(`Hybrid pipeline threw an error: ${error.message}`);
    console.error(error);
  }
}

// ─── TEST 6: Pure Gemini Fallback Path ───────────────────────────────────────
async function testGeminiFallbackPath() {
  section('TEST 6: Gemini Standalone Fallback (generativeFallback method)');

  const RasaAI = require('../../server/services/RasaAI');
  const rasa = new RasaAI();

  if (!rasa.genAI) {
    recordFail('genAI not initialized — GEMINI_API_KEY missing or invalid');
    return;
  }

  const mockMessages = [
    { role: 'user', content: 'Can Kapha types have caffeine in the morning?' }
  ];
  const mockDoshaProfile = { primary: 'kapha' };

  try {
    const response = await rasa.generativeFallback(mockMessages, mockDoshaProfile);
    if (response && response.message && response.message.length > 10) {
      recordPass(`generativeFallback() works — provider: ${response.provider}`);
      info(`Preview: "${response.message.slice(0, 150)}..."`);
    } else {
      recordFail('generativeFallback() returned empty or invalid response');
    }
  } catch (error) {
    recordFail(`generativeFallback() threw: ${error.message}`);
  }
}

// ─── TEST 7: AIServiceManager Integration ────────────────────────────────────
async function testAIServiceManager() {
  section('TEST 7: AIServiceManager → Rasa Provider');

  const AIServiceManager = require('../../server/services/AIServiceManager');
  const manager = new AIServiceManager();

  // Wait for async initialization
  await new Promise(r => setTimeout(r, 1000));

  const currentProvider = manager.getCurrentProvider();
  info(`Active provider: ${currentProvider}`);

  if (currentProvider === 'rasa') {
    recordPass('AIServiceManager is using the Rasa provider');
  } else {
    recordWarn(`AIServiceManager is using "${currentProvider}" — expected "rasa". Check AI_PROVIDER in .env`);
  }

  // Test a message through the manager
  const mockMessages = [
    { role: 'system', content: 'You are AyurVAID.' },
    { role: 'user', content: 'What are the best herbs for Vata imbalance?' }
  ];

  try {
    const response = await manager.generateResponse(mockMessages, null, {});
    if (response && response.message) {
      recordPass(`AIServiceManager.generateResponse() succeeded via "${response.provider}"`);
      info(`Preview: "${response.message.slice(0, 150)}..."`);
    } else {
      recordFail('AIServiceManager returned empty response');
    }
  } catch (error) {
    recordFail(`AIServiceManager.generateResponse() threw: ${error.message}`);
  }
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────
async function main() {
  console.log(`\n${BOLD}${CYAN}╔══════════════════════════════════════════════╗`);
  console.log(`║   AyurVAID Hybrid AI Diagnostic v1.0        ║`);
  console.log(`║   Rasa NLP + Gemini Fallback Integration     ║`);
  console.log(`╚══════════════════════════════════════════════╝${RESET}\n`);

  await testEnvironment();
  const rasaUp    = await testRasaConnectivity();
  await testRasaWebhook(rasaUp);
  const geminiUp  = await testGeminiAPI();
  await testGeminiFallbackPath();
  await testHybridPipeline(rasaUp, geminiUp);
  await testAIServiceManager();

  // ─── Summary ──────────────────────────────────────────────────────────────
  section('DIAGNOSTIC SUMMARY');
  console.log(`  ${GREEN}Passed${RESET}: ${passCount}`);
  console.log(`  ${RED}Failed${RESET}: ${failCount}`);
  console.log(`  ${YELLOW}Warnings${RESET}: ${warnCount}`);

  if (failCount === 0) {
    console.log(`\n${GREEN}${BOLD}✅ All critical tests passed — hybrid integration is healthy!${RESET}`);
  } else if (!rasaUp && geminiUp) {
    console.log(`\n${YELLOW}${BOLD}⚠️  Rasa is offline but Gemini fallback is operational.`);
    console.log(`   The chatbot will still respond via Gemini for all queries.${RESET}`);
  } else if (failCount > 0 && !geminiUp) {
    console.log(`\n${RED}${BOLD}❌ Critical failure — both Rasa and Gemini are non-functional.`);
    console.log(`   Users will get static fallback responses only.${RESET}`);
  }

  console.log('');
}

main().catch(err => {
  console.error('\nDiagnostic runner crashed:', err);
  process.exit(1);
});
