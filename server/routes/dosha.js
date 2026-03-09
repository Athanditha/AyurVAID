const express = require('express');
const router = express.Router();
const doshaQuestions = require('../models/DoshaQuestions');
const DoshaAnalyzer = require('../models/DoshaAnalyzer');
const ExplainableAI = require('../models/ExplainableAI');
const AIServiceManager = require('../services/AIServiceManager');

const analyzer = new DoshaAnalyzer();
const explainableAI = new ExplainableAI();
const aiServiceManager = new AIServiceManager();

// Get all dosha assessment questions
router.get('/questions', (req, res) => {
  try {
    res.json({
      success: true,
      questions: doshaQuestions,
      totalQuestions: doshaQuestions.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch questions'
    });
  }
});

// Submit dosha assessment responses
router.post('/analyze', async (req, res) => {
  try {
    const { responses, userInfo } = req.body;

    if (!responses || !Array.isArray(responses)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid responses format'
      });
    }

    // Validate responses
    if (responses.length !== doshaQuestions.length) {
      return res.status(400).json({
        success: false,
        error: 'Incomplete assessment - all questions must be answered'
      });
    }

    // Analyze the responses using weighted algorithm
    const initialAnalysis = analyzer.analyzeResponses(responses);

    // Enrich with Explainable AI reasoning
    const explanation = explainableAI.generateExplanation(
      explainableAI.explanationTypes.DOSHA_ANALYSIS,
      {
        ...initialAnalysis,
        responses: responses
      }
    );

    // Generate a premium AI "Wisdom Summary" using LLM
    const aiInsight = await generateAIWisdomSummary(initialAnalysis);

    // Final consolidated analysis result
    const result = {
      success: true,
      timestamp: new Date().toISOString(),
      userInfo: userInfo || {},
      analysis: {
        ...initialAnalysis,
        explanation: explanation,
        aiInsight: aiInsight
      }
    };

    res.json(result);
  } catch (error) {
    console.error('Analysis error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to analyze dosha assessment'
    });
  }
});

/**
 * Uses the AI Service Manager to generate a high-level personalized summary
 * of the dosha analysis results.
 */
async function generateAIWisdomSummary(analysis) {
  const { scores, primary, secondary, constitutionType } = analysis;

  const prompt = [
    {
      role: "system",
      content: "You are a senior Ayurvedic physician. Provide a concise (2-3 sentences), poetic, and encouraging health perspective based on the following dosha scores. Focus on the harmony between the primary and secondary influences."
    },
    {
      role: "user",
      content: `Primary: ${primary} (${scores[primary]}%), Secondary: ${secondary} (${scores[secondary]}%). Constitution: ${constitutionType}.`
    }
  ];

  try {
    const aiResponse = await aiServiceManager.generateResponse(prompt, analysis);
    return aiResponse.message;
  } catch (error) {
    console.warn('AI Wisdom Summary failed, using fallback:', error.message);
    return `Your ${constitutionType} constitution shows a strong presence of ${primary}, which brings unique gifts of vitality and awareness. Guided by the grounding influence of ${secondary}, you are well-positioned for balanced wellness.`;
  }
}

module.exports = router;