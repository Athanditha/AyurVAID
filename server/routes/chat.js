const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { authenticateToken } = require('../middleware/auth');
const ayurvedicKnowledge = require('../data/ayurvedic-knowledge');
const foodDatabase = require('../data/food-database');
const researchStudies = require('../data/research-studies');
const ExplainableAI = require('../models/ExplainableAI');
const AIServiceManager = require('../services/AIServiceManager');

// Initialize AI Service Manager and ExplainableAI engine
const aiServiceManager = new AIServiceManager();
const explainableAI = new ExplainableAI();

// Chat with AI based on dosha profile and conversation
router.post('/message', authenticateToken, async (req, res) => {
  try {
    const { conversationId, profileId, message } = req.body;

    if (!message) {
      return res.status(400).json({
        success: false,
        error: 'Message is required'
      });
    }

    let conversation = null;
    let actualConversationId = conversationId;

    // If no conversation ID provided, create a new conversation
    if (!conversationId) {
      actualConversationId = await User.createConversation(req.user.id);
      conversation = await User.getConversation(req.user.id, actualConversationId);
    } else {
      // Get existing conversation
      conversation = await User.getConversation(req.user.id, conversationId);
      if (!conversation) {
        return res.status(404).json({
          success: false,
          error: 'Conversation not found'
        });
      }
    }

    // Get user profile if provided
    let userProfile = null;
    if (profileId) {
      const profile = await User.getUserProfile(req.user.id, profileId);
      if (profile) {
        userProfile = profile.analysis;
      }
    }

    // Add user message to conversation
    await User.addMessageToConversation(req.user.id, actualConversationId, {
      type: 'user',
      content: message
    });

    // Generate AI response with comprehensive explainable AI
    const aiResponse = await generateAIResponse(message, userProfile, conversation.messages);

    // Generate comprehensive explanation using ExplainableAI engine
    const comprehensiveExplanation = generateComprehensiveExplanation(
      message,
      aiResponse.message,
      userProfile,
      aiResponse.doshaContext
    );

    // Add AI response to conversation with comprehensive explanation
    await User.addMessageToConversation(req.user.id, actualConversationId, {
      type: 'bot',
      content: aiResponse.message,
      explanation: comprehensiveExplanation,
      doshaContext: aiResponse.doshaContext
    });

    res.json({
      success: true,
      response: {
        ...aiResponse,
        explanation: comprehensiveExplanation
      },
      conversationId: actualConversationId
    });

  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process message'
    });
  }
});

// Get AI provider information
router.get('/ai-info', authenticateToken, async (req, res) => {
  try {
    const providerInfo = await aiServiceManager.getProviderInfo();
    res.json({
      success: true,
      providerInfo
    });
  } catch (error) {
    console.error('Error getting AI provider info:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get AI provider information'
    });
  }
});

// Switch AI provider
router.post('/switch-provider', authenticateToken, async (req, res) => {
  try {
    const { provider } = req.body;

    if (!provider) {
      return res.status(400).json({
        success: false,
        error: 'Provider name is required'
      });
    }

    await aiServiceManager.switchProvider(provider);

    res.json({
      success: true,
      message: `Switched to ${provider} provider`,
      currentProvider: aiServiceManager.getCurrentProvider()
    });
  } catch (error) {
    console.error('Error switching AI provider:', error);
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

async function generateAIResponse(userMessage, doshaAnalysis, conversationHistory) {
  let systemPrompt = `You are AyurVAID, an expert Ayurvedic health advisor AI with access to comprehensive traditional knowledge and modern research. You provide evidence-based, personalized health recommendations.

KNOWLEDGE BASE ACCESS:
You have access to extensive datasets including:
- Classical Ayurvedic texts (Charaka Samhita, Sushruta Samhita, Ashtanga Hridaya)
- Comprehensive food database with dosha-specific recommendations
- Modern research studies validating Ayurvedic principles
- Seasonal guidelines and lifestyle practices
- Herb and remedy databases
- Yoga and exercise recommendations`;

  if (doshaAnalysis) {
    const { primary, secondary, scores, profile, recommendations } = doshaAnalysis;

    // Get dosha-specific knowledge from dataset
    const primaryDoshaData = ayurvedicKnowledge.doshaProfiles[primary];
    const secondaryDoshaData = ayurvedicKnowledge.doshaProfiles[secondary];

    systemPrompt += `

USER'S DOSHA PROFILE:
- Primary Dosha: ${primary.toUpperCase()} (${scores[primary]}%)
- Secondary Dosha: ${secondary.toUpperCase()} (${scores[secondary]}%)
- Constitution Type: ${doshaAnalysis.constitutionType}

PRIMARY DOSHA CHARACTERISTICS (${primary.toUpperCase()}):
- Elements: ${primaryDoshaData.element.join(' + ')}
- Qualities: ${primaryDoshaData.qualities.join(', ')}
- Functions: ${primaryDoshaData.functions.join(', ')}
- Physical: ${JSON.stringify(primaryDoshaData.physicalCharacteristics)}
- Mental: ${JSON.stringify(primaryDoshaData.mentalCharacteristics)}

BALANCING FOODS FOR ${primary.toUpperCase()}:
- Favor: ${primaryDoshaData.balancingFoods.favor.join(', ')}
- Avoid: ${primaryDoshaData.balancingFoods.avoid.join(', ')}

LIFESTYLE RECOMMENDATIONS:
- Routine: ${primaryDoshaData.lifestyle.routine}
- Exercise: ${primaryDoshaData.lifestyle.exercise}
- Environment: ${primaryDoshaData.lifestyle.environment}
- Sleep: ${primaryDoshaData.lifestyle.sleep}

YOGA PRACTICES: ${ayurvedicKnowledge.yogaPractices[primary].join(', ')}

MENTAL HEALTH PRACTICES: ${JSON.stringify(ayurvedicKnowledge.mentalHealth[primary])}`;
  }

  // Add seasonal context
  const currentMonth = new Date().getMonth();
  let currentSeason = 'spring';
  if (currentMonth >= 5 && currentMonth <= 7) currentSeason = 'summer';
  else if (currentMonth >= 8 && currentMonth <= 10) currentSeason = 'autumn';
  else if (currentMonth >= 11 || currentMonth <= 1) currentSeason = 'winter';

  const seasonalGuidance = ayurvedicKnowledge.seasonalWisdom[currentSeason];
  systemPrompt += `

CURRENT SEASON: ${currentSeason.toUpperCase()}
- Dominant Dosha: ${seasonalGuidance.dominantDosha}
- Seasonal Recommendations: ${seasonalGuidance.recommendations.join(', ')}`;

  // Add research context
  systemPrompt += `

MODERN RESEARCH SUPPORT:
- Strong Evidence: ${researchStudies.evidenceLevels.strongEvidence.join(', ')}
- Moderate Evidence: ${researchStudies.evidenceLevels.moderateEvidence.join(', ')}

INSTRUCTIONS:
1. Use the comprehensive knowledge base to provide accurate, evidence-based advice
2. Reference specific foods from the database when making dietary recommendations
3. Cite relevant research when appropriate
4. Consider seasonal factors in your recommendations
5. Provide practical, actionable advice tailored to their dosha
6. Include explanations for WHY recommendations work for their constitution
7. Mention relevant herbs or practices from the knowledge base
8. Be supportive and encouraging while being scientifically accurate
9. If discussing serious health conditions, recommend consulting healthcare professionals
10. Keep responses informative but concise (300-500 words)

Remember: You are providing educational information based on traditional Ayurvedic principles and modern research, not medical diagnosis or treatment.`;

  try {
    // Build conversation context
    const messages = [
      { role: "system", content: systemPrompt }
    ];

    // Add recent conversation history for context (last 6 messages)
    const recentMessages = conversationHistory.slice(-6);
    recentMessages.forEach(msg => {
      if (msg.type === 'user') {
        messages.push({ role: "user", content: msg.content });
      } else if (msg.type === 'bot') {
        messages.push({ role: "assistant", content: msg.content });
      }
    });

    // Add current user message
    messages.push({ role: "user", content: userMessage });

    // Use AI Service Manager instead of direct OpenAI call
    const aiResponse = await aiServiceManager.generateResponse(messages, doshaAnalysis, {
      max_tokens: 600,
      temperature: 0.7
    });

    const aiMessage = aiResponse.message;

    // Generate basic explanation for compatibility
    const basicExplanation = generateEnhancedExplanation(userMessage, aiMessage, doshaAnalysis);

    return {
      message: aiMessage,
      explanation: basicExplanation,
      doshaContext: doshaAnalysis ? {
        primaryDosha: doshaAnalysis.primary,
        relevantQualities: ayurvedicKnowledge.doshaProfiles[doshaAnalysis.primary].qualities,
        whyThisAdvice: `This advice is specifically tailored for your ${doshaAnalysis.primary}-dominant constitution, considering the ${ayurvedicKnowledge.doshaProfiles[doshaAnalysis.primary].element.join(' + ')} elements and their ${ayurvedicKnowledge.doshaProfiles[doshaAnalysis.primary].qualities.join(', ').toLowerCase()} qualities.`,
        seasonalContext: `Current ${currentSeason} season recommendations included`
      } : null,
      aiProvider: aiResponse.provider,
      timestamp: new Date().toISOString()
    };

  } catch (error) {
    console.error('AI Service error:', error);

    // Enhanced fallback response using datasets
    return generateDatasetBasedFallback(userMessage, doshaAnalysis);
  }
}

function generateComprehensiveExplanation(userMessage, aiResponse, doshaAnalysis, doshaContext) {
  // Determine the type of explanation needed based on user query
  let explanationType = explainableAI.explanationTypes.RECOMMENDATION;

  if (userMessage.toLowerCase().includes('food') || userMessage.toLowerCase().includes('diet') || userMessage.toLowerCase().includes('eat')) {
    explanationType = explainableAI.explanationTypes.FOOD_ADVICE;
  } else if (userMessage.toLowerCase().includes('lifestyle') || userMessage.toLowerCase().includes('routine') || userMessage.toLowerCase().includes('exercise')) {
    explanationType = explainableAI.explanationTypes.LIFESTYLE;
  } else if (userMessage.toLowerCase().includes('research') || userMessage.toLowerCase().includes('study') || userMessage.toLowerCase().includes('evidence')) {
    explanationType = explainableAI.explanationTypes.RESEARCH_BACKED;
  }

  // Prepare data for explanation generation
  const explanationData = {
    recommendation: aiResponse,
    userProfile: doshaAnalysis,
    messageContext: {
      userMessage: userMessage,
      responseType: explanationType
    }
  };

  // Generate comprehensive explanation using ExplainableAI engine
  const comprehensiveExplanation = explainableAI.generateExplanation(
    explanationType,
    explanationData,
    { doshaContext }
  );

  // Enhance with food-specific explanations if relevant
  if (explanationType === explainableAI.explanationTypes.FOOD_ADVICE) {
    const foodMentions = extractFoodMentions(aiResponse);
    if (foodMentions.length > 0) {
      const foodExplanation = explainableAI.generateExplanation(
        explainableAI.explanationTypes.FOOD_ADVICE,
        {
          foods: foodMentions,
          userDosha: doshaAnalysis?.primary || 'vata',
          season: getCurrentSeason(),
          userQuery: userMessage
        }
      );

      // Merge food explanations
      if (foodExplanation.foodExplanations) {
        comprehensiveExplanation.foodDetails = foodExplanation.foodExplanations;
        comprehensiveExplanation.foodPrinciples = foodExplanation.principles;
      }
    }
  }

  return comprehensiveExplanation;
}

function extractFoodMentions(text) {
  const foods = [];
  const foodKeywords = [
    'rice', 'wheat', 'oats', 'quinoa', 'barley',
    'ginger', 'turmeric', 'cumin', 'coriander', 'fennel',
    'ghee', 'coconut', 'almonds', 'dates', 'honey',
    'spinach', 'carrots', 'beets', 'cucumber', 'tomato',
    'mango', 'apple', 'banana', 'grapes', 'pomegranate',
    'lentils', 'chickpeas', 'mung', 'kidney beans'
  ];

  const textLower = text.toLowerCase();
  foodKeywords.forEach(food => {
    if (textLower.includes(food)) {
      foods.push(food);
    }
  });

  return [...new Set(foods)]; // Remove duplicates
}

function getCurrentSeason() {
  const currentMonth = new Date().getMonth();
  if (currentMonth >= 2 && currentMonth <= 4) return 'spring';
  if (currentMonth >= 5 && currentMonth <= 7) return 'summer';
  if (currentMonth >= 8 && currentMonth <= 10) return 'autumn';
  return 'winter';
}

function generateEnhancedExplanation(userMessage, aiResponse, doshaAnalysis) {
  const reasoning = [
    "Response generated using comprehensive Ayurvedic knowledge base",
    "Incorporates classical texts (Charaka Samhita, Sushruta Samhita, Ashtanga Hridaya)",
    "References modern research validating traditional practices"
  ];

  if (doshaAnalysis) {
    const primaryDoshaData = ayurvedicKnowledge.doshaProfiles[doshaAnalysis.primary];
    reasoning.push(`Tailored for ${doshaAnalysis.primary.toUpperCase()}-dominant constitution (${doshaAnalysis.scores[doshaAnalysis.primary]}%)`);
    reasoning.push(`Considers ${primaryDoshaData.element.join(' + ')} elements and ${primaryDoshaData.qualities.join(', ').toLowerCase()} qualities`);
    reasoning.push(`Includes seasonal and lifestyle factors from traditional guidelines`);
  }

  // Add research backing
  const relevantResearch = [];
  if (userMessage.toLowerCase().includes('stress') || userMessage.toLowerCase().includes('anxiety')) {
    relevantResearch.push("Ashwagandha stress studies (2020)");
  }
  if (userMessage.toLowerCase().includes('inflammation') || userMessage.toLowerCase().includes('pain')) {
    relevantResearch.push("Turmeric anti-inflammatory research (2021)");
  }
  if (userMessage.toLowerCase().includes('digestion') || userMessage.toLowerCase().includes('stomach')) {
    relevantResearch.push("Ayurvedic spices digestive studies (2020)");
  }

  return {
    reasoning: reasoning,
    confidence: doshaAnalysis && doshaAnalysis.scores[doshaAnalysis.primary] >= 50 ? "High" : "Medium",
    sources: [
      "Classical Ayurvedic texts database",
      "Comprehensive food and nutrition database",
      "Modern research studies validation",
      "Seasonal and lifestyle guidelines",
      ...relevantResearch
    ],
    methodology: "AI analysis combines traditional Ayurvedic knowledge with modern research validation and personalized constitutional assessment",
    datasetUsed: [
      "Ayurvedic knowledge base (3000+ data points)",
      "Food database (200+ items with dosha classifications)",
      "Research studies database (50+ validated studies)",
      "Seasonal and lifestyle guidelines"
    ]
  };
}

function generateDatasetBasedFallback(userMessage, doshaAnalysis) {
  let fallbackMessage = "Thank you for your question. ";

  if (doshaAnalysis) {
    const primaryDoshaData = ayurvedicKnowledge.doshaProfiles[doshaAnalysis.primary];

    // Generate response based on dataset
    if (userMessage.toLowerCase().includes('food') || userMessage.toLowerCase().includes('diet')) {
      fallbackMessage += `For your ${doshaAnalysis.primary}-dominant constitution, I recommend focusing on ${primaryDoshaData.balancingFoods.favor.slice(0, 3).join(', ')} while avoiding ${primaryDoshaData.balancingFoods.avoid.slice(0, 2).join(' and ')}. `;
    }

    if (userMessage.toLowerCase().includes('exercise') || userMessage.toLowerCase().includes('yoga')) {
      fallbackMessage += `${ayurvedicKnowledge.yogaPractices[doshaAnalysis.primary].slice(0, 2).join(' and ')} would be beneficial for your constitution. `;
    }

    fallbackMessage += `Your ${primaryDoshaData.element.join(' + ')} constitution benefits from ${primaryDoshaData.lifestyle.routine.toLowerCase()}.`;

    // Generate comprehensive explanation using ExplainableAI
    const comprehensiveExplanation = explainableAI.generateExplanation(
      explainableAI.explanationTypes.RECOMMENDATION,
      {
        recommendation: fallbackMessage,
        userProfile: doshaAnalysis,
        messageContext: {
          userMessage: userMessage,
          responseType: 'fallback'
        }
      }
    );

    return {
      message: fallbackMessage,
      explanation: comprehensiveExplanation,
      doshaContext: {
        primaryDosha: doshaAnalysis.primary,
        relevantQualities: ayurvedicKnowledge.doshaProfiles[doshaAnalysis.primary].qualities,
        whyThisAdvice: `Based on your ${doshaAnalysis.primary}-dominant constitution from our comprehensive knowledge base.`
      },
      timestamp: new Date().toISOString()
    };
  } else {
    fallbackMessage += "For personalized recommendations, please complete your dosha assessment first. I'm here to help you on your wellness journey with evidence-based Ayurvedic guidance.";

    const genericExplanation = explainableAI.generateGenericExplanation(
      { message: fallbackMessage },
      { userMessage }
    );

    return {
      message: fallbackMessage,
      explanation: genericExplanation,
      doshaContext: null,
      timestamp: new Date().toISOString()
    };
  }
}

function getDoshaQualities(dosha) {
  const qualities = {
    vata: ["Dry", "Light", "Cold", "Rough", "Subtle", "Mobile"],
    pitta: ["Hot", "Sharp", "Light", "Oily", "Liquid", "Mobile"],
    kapha: ["Heavy", "Slow", "Cold", "Oily", "Smooth", "Stable"]
  };
  return qualities[dosha] || [];
}

function getFallbackResponse(message, primaryDosha) {
  const responses = {
    vata: "For your Vata constitution, focus on warm, grounding practices. Regular routines, warm foods, and gentle exercise like yoga can help balance your naturally mobile and light qualities. Oil massage and adequate rest are particularly beneficial for Vata types.",
    pitta: "With your Pitta constitution, cooling and calming practices are key. Avoid excessive heat, spicy foods, and intense competition. Sweet, bitter, and astringent tastes, along with moderate exercise and stress management, will help maintain your natural balance.",
    kapha: "Your Kapha constitution benefits from stimulating and energizing practices. Regular vigorous exercise, light and warm foods with spices, and maintaining an active lifestyle will help balance your naturally stable and heavy qualities."
  };

  return responses[primaryDosha] || "Thank you for your question. For personalized recommendations, please complete your dosha assessment first. I'm here to help you on your wellness journey with traditional Ayurvedic wisdom.";
}

module.exports = router;