# AyurVAID: AI Modules Implementation Documentation

This document dissects the technical implementation of each artificial intelligence module running within the AyurVAID ecosystem. The architecture is heavily hybridised, blending **Gradient Boosting (CatBoost)** for deterministic classification, **Retrieval-Augmented Generation (RAG)** for contextual NLP search, **Explainable AI (XAI)** for logic transparency, and **Generative LLMs (Gemini Pro)** for conversational orchestration.

---

## Table of Contents
- [1. Predictive Prakriti Modeling (CatBoost)](#1-predictive-prakriti-modeling-catboost)
- [2. Generative LLM Integration (Gemini 3.1 Pro)](#2-generative-llm-integration-gemini-31-pro)
- [3. Retrieval-Augmented Generation (RAG) Architecture](#3-retrieval-augmented-generation-rag-architecture)
- [4. Native Explainable AI (SHAP & XAI)](#4-native-explainable-ai-shap--xai)
- [5. Master Orchestration (AIServiceManager)](#5-master-orchestration-aiservicemanager)
- [6. The Fallback Mechanism (Custom Rule-Based Engine)](#6-the-fallback-mechanism-custom-rule-based-engine)

---
## 1. Predictive Prakriti Modeling (CatBoost)

The core dosha assessment engine relies not on generic point scales, but on a trained Machine Learning classifier capable of non-linear symptom evaluation. 

### Implementation: The Python Inference Engine (`catboost_model.py`)
The heavy lifting is pushed to Python using `CatBoostClassifier`. Rather than passing raw strings into the algorithm in production, the data is dynamically encoded just as it was during training.

```python
# Extract from /server/python/catboost_model.py (predict_dict)

for col in expected_features:
    le = feature_encoders[col]
    val = df_input[col].iloc[0]
    if val in le.classes_:
        encoded_val = le.transform([val])[0]
    else:
        # Fallback to the first available class if an unrecognized string comes in
        encoded_val = le.transform([le.classes_[0]])[0] 
    df_encoded[col] = [encoded_val]

# Make prediction (returns numerical probabilities for each Dosha)
probs = model.predict_proba(df_encoded)[0]
classes = target_encoder.classes_

# Calculate percentage scores out of 100
scores = {classes[i].lower(): round(prob * 100) for i, prob in enumerate(probs)}
```
**Functionality Breakdown:**
This block iterates over the exact 25 characteristics submitted by a user (e.g. Skin, Hair, Memory). It uses `joblib` localized `LabelEncoders` to instantly map user-text into the exact vectors the CatBoost forest expects. It then extracts the probability distribution to determine the dominant Dosha composition.

### Implementation: Node.js Orchestrator Interop (`DoshaAnalyzer.js`)
Because the backend is Node.js, we safely wrap the Python executable allowing it to crash or freeze without destroying the active server states.

```javascript
// Extract from /server/models/DoshaAnalyzer.js

const pythonProcess = spawn('python', [
  this.pythonScriptPath,
  JSON.stringify(inputData)
]);

pythonProcess.on('close', (code) => {
  if (code !== 0) {
    return reject(new Error(`Python process exited with code ${code}. Error: ${errorData}`));
  }
  const parsed = JSON.parse(jsonMatch[0]);
  resolve(parsed);
});
```
**Functionality Breakdown:**
The Node.js server spawns a discrete process to run the inference execution. By wrapping `stdout` buffers, Node captures the literal JSON dictionary the Python script streams to the terminal, parses it natively, and passes it along to the rest of the JavaScript runtime.

---

## 2. Generative LLM Integration (Gemini 3.1 Pro)

To make interactions organic and interactive, a conversational wrapper parses incoming messages and leverages a fine-tuned prompt system.

### Implementation: System Initialization & Configuration (`GeminiAI.js`)
We use Google Generative AI SDK, rigidly capping token throughput and explicitly layering Ayurvedic heuristics to prime the prompt.

```javascript
// Extract from /server/services/GeminiAI.js (generateResponse)

const modelName = options.model || 'gemini-3.1-pro-preview';
const model = this.genAI.getGenerativeModel({
  model: modelName,
  systemInstruction,
  generationConfig: {
    temperature: options.temperature ?? 0.7,
    maxOutputTokens: options.max_tokens ?? 800,
    topP: 0.9,
    topK: 40,
  },
  // Safety settings — critically allow health/medical discussions
  safetySettings: [
    { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_ONLY_HIGH' },
  ]
});
```
**Functionality Breakdown:**
This initializes the Gemini generative model. Notably, the `temperature` is maintained at a middle-tier 0.7—allowing warmth and conversational unpredictability, but retaining strict enough adherence to factual medical responses. `maxOutputTokens` prevents runaway billing or unreadable walls of text.

### Implementation: The Dosha-Injection Prompt Strategy (`GeminiAI.js`)
The model is functionally useless as a medical aide without user context. The below logic forcefully binds the patient's dosha limits into the prompt memory.

```javascript
// Extract from /server/services/GeminiAI.js 

if (doshaProfile) {
  const primary = doshaProfile.primary;
  base += `\n\nUSER CONSTITUTION:
- Primary Dosha: ${primary.toUpperCase()}`;
  if (doshaProfile.scores) {
    base += `\n- Dosha Scores: Vata ${doshaProfile.scores.vata}%, Pitta ${doshaProfile.scores.pitta}%, Kapha ${doshaProfile.scores.kapha}%`;
  }
  base += `\n\nTailor ALL advice to this user's ${primary.toUpperCase()}-dominant constitution. Explain WHY each recommendation suits their specific constitution.`;
}
```
**Functionality Breakdown:**
This is the "Prompt Secret Source". Before the user's message is even sent, the framework concatenates the raw CatBoost percentage scores directly into the system wrapper boundary. The AI literally cannot generate answers without knowing the strict Vata/Pitta/Kapha percentages attached to the session.

---

## 3. Retrieval-Augmented Generation (RAG) Architecture

AyurVAID doesn't solely rely on the generative hallucination of large models. It retrieves exact traditional texts and forces the LLM to read them first.

### Implementation: Search and Dosha Disambiguation (`KnowledgeBase.js`)
Most classical text retrievers fail because they blindly search words. AyurVAID alters search scoring depending on the Dosha properties of the actual herbs interacting with the user's query.

```javascript
// Extract from /server/services/KnowledgeBase.js (search)

// --- DOSHA DISAMBIGUATION ---
const queryLower = query.toLowerCase();
const doshas = ['vata', 'pitta', 'kapha'];
const mentionedDoshas = doshas.filter(d => queryLower.includes(d));

if (mentionedDoshas.length > 0) {
  const itemPacifies = (item.data.pacify || "").toString().toLowerCase();
  const pacifiesTarget = mentionedDoshas.some(d => itemPacifies.includes(d));
  
  if (pacifiesTarget) {
    score += 10; // Massive boost for herbs that balance the user's mentioned Dosha
  } else if (mentionedDoshas.some(d => itemText.includes(d))) {
    score += 3; // Minor boost if the text mentions the Dosha
  } else {
    score -= 5; // Penalty for herbs that don't match the specific Dosha query
  }
}
```
**Functionality Breakdown:**
When the system scans `herbs.json`, it looks closely at the `pacify` array associated with each botanical element. If a user asks "What treats kapha congestion?", the NLP engine violently up-weights (`score += 10`) any herb exactly capable of pacifying Kapha, and actively penalizes (`score -= 5`) herbs that might harm Kapha, ensuring the LLM is only handed *safe* literature to read.

---

## 4. Native Explainable AI (SHAP & XAI)

Because ML models are notorious black boxes, we run SHapley Additive exPlanations (SHAP) directly against the CatBoost decision trees to offer logical transparency.

### Implementation: Mathematical Feature Interception (`catboost_model.py`)
SHAP values show the explicit mathematical push/pull of every individual feature on the final prediction score. 

```python
# Extract from /server/python/catboost_model.py

# Calculate native shap values using CatBoost 
pool = Pool(df_encoded)
shap_values = model.get_feature_importance(type='ShapValues', data=pool)
        
# Extract explanation for the primary predicted class
class_shap_values = shap_values[0, primary_idx, :-1]  

feature_importance = []
for i, feature_name in enumerate(expected_features):
    contribution = class_shap_values[i]
    feature_importance.append({
        "feature": feature_name,
        "contribution": float(contribution)
    })
             
feature_importance.sort(key=lambda x: abs(x["contribution"]), reverse=True)
```
**Functionality Breakdown:**
This computes exact SHAP impact coefficients. It reveals exactly which of the 25 user variables dragged the percentage toward a specific dosha. For example, it exposes mathematically if "Skin Type" pushed the user towards Pitta, or if "Size of Teeth" actually counteracted it. This transparency acts as the fundamental trust anchor between the raw algorithm and the patient.

---

## 5. Master Orchestration (AIServiceManager)

Since the system supports multiple LLM providers concurrently, an orchestrator class acts as a single pane of glass between the HTTP layers and the actual generative algorithms.

### Implementation: Automatic Provider Fallback and Upstream RAG (`AIServiceManager.js`)
If the API rate limits trigger or the system gets disconnected from the active internet, the system automatically swaps out the generative LLM for a hard-coded fallback AI without dropping the user's conversational chain. 

```javascript
// Extract from /server/services/AIServiceManager.js (generateResponse)

// --- UPSTREAM RAG INJECTION ---
const userMessage = messages[messages.length - 1].content;
const searchResults = KnowledgeBase.search(userMessage, 3);

if (searchResults.length > 0) {
  const knowledgeContext = KnowledgeBase.formatContext(searchResults);
  let systemMsgIndex = messages.findIndex(m => m.role === 'system');
  const ragInstruction = `\n\nADDITIONAL AYURVEDIC KNOWLEDGE (verified from classical texts):\n${knowledgeContext}`;
  
  if (systemMsgIndex !== -1) {
    messages[systemMsgIndex].content += ragInstruction;
  } else {
    messages.unshift({ role: 'system', content: `You are AyurVAID...` + ragInstruction });
  }
}

// ... Execution block
try {
   response = await provider.generateResponse(messages, doshaProfile, options);
} catch (error) {
  // Try fallback if current provider fails
  if (this.currentProvider !== this.fallbackProvider) {
    this.currentProvider = this.fallbackProvider;
    const fallbackResponse = await this.generateResponse(messages, doshaProfile, options);
    return { ...fallbackResponse, fallbackUsed: true };
  }
}
```
**Functionality Breakdown:**
The orchestrator operates upstream of both Gemini and CustomAI. This means RAG happens **before** the system delegates generation. It queries the local internal database using `KnowledgeBase.js`, appends that formatted text permanently into the `system` parameter of the interaction, and dynamically catches crashes to hot-swap to the `CustomAI` rule-based engine.

---

## 6. The Fallback Mechanism (Custom Rule-Based Engine)

If network connectivity crashes or tokens are exhausted, the generative system fails cleanly over to a bespoke offline heuristic engine. 

### Implementation: Keyword Disambiguation & Template Injection (`CustomAI.js`)
The offline fallback does not use language modeling, but instead parses strings physically against a hardcoded taxonomy mapping of intent characteristics.

```javascript
// Extract from /server/services/CustomAI.js

this.intentClassifier = {
  food: ['food', 'diet', 'eat', 'meal', 'nutrition', 'hungry', 'recipe', 'cook'],
  lifestyle: ['lifestyle', 'routine', 'daily', 'habit', 'schedule', 'morning', 'evening'],
  exercise: ['exercise', 'yoga', 'workout', 'fitness', 'movement', 'physical', 'activity'],
  health: ['health', 'wellness', 'healing', 'medicine', 'treatment', 'cure', 'remedy'],
  mental: ['stress', 'anxiety', 'mind', 'mental', 'emotion', 'mood', 'depression', 'calm'],
  sleep: ['sleep', 'rest', 'tired', 'insomnia', 'bed', 'night', 'dream'],
  digestion: ['digestion', 'stomach', 'bloating', 'gas', 'constipation', 'diarrhea']
};

// ... Later down in generation
generateFoodResponse(dosha, doshaData, context) {
  const favorFoods = doshaData.balancingFoods.favor.slice(0, 4);
  const avoidFoods = doshaData.balancingFoods.avoid.slice(0, 3);
  
  let response = `For your ${dosha.toUpperCase()} constitution, I recommend focusing on ${favorFoods.join(', ')}. `;
  if (context.timeOfDay === 'morning') {
    response += `Start your day with warm, nourishing foods like oatmeal with ghee and dates. `;
  }
  return response;
}
```
**Functionality Breakdown:**
The AI determines interaction parameters via strict literal sweeps. If it scores high on `exercise` keywords, it breaks off down the `generateExerciseResponse()` pipeline and populates pre-templated text segments with exact arrays stored dynamically in `ayurvedic-knowledge.js`. It ensures that even fundamentally without internet access, a robust, highly specific constitution consultation remains available to the patient.
