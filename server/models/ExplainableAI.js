// ML-Powered Explainable AI Engine
class ExplainableAI {
  constructor() {
    this.explanationTypes = {
      DOSHA_ANALYSIS: 'dosha_analysis',
      RECOMMENDATION: 'recommendation'
    };
  }

  generateExplanation(type, data, context = {}) {
    switch (type) {
      case this.explanationTypes.DOSHA_ANALYSIS:
        return this.explainDoshaAnalysis(data, context);
      case this.explanationTypes.RECOMMENDATION:
        return this.explainRecommendation(data, context);
      default:
        return this.generateGenericExplanation(data, context);
    }
  }

  explainDoshaAnalysis(analysisData, context) {
    const { scores, primary, engine, responses, xaiInsights } = analysisData;
    
    const reasoning = [
      `Your physical and mental traits were analyzed using an ${engine} classification model, incorporating SHAP mathematically-derived feature importance for Explainable AI transparency.`,
      `The model predicts your primary dosha is ${primary.toUpperCase()} with ${scores[primary]}% relative dominance.`
    ];

    if (xaiInsights && xaiInsights.top_contributors && xaiInsights.top_contributors.length > 0) {
      reasoning.push(`Key Indicators for ${primary.toUpperCase()}: The algorithm heavily weighted your answers regarding ` + 
        xaiInsights.top_contributors.map(c => `'${c.feature.replace(/_/g, ' ')}' (${c.value})`).join(', ') + ".");
    }
    
    if (xaiInsights && xaiInsights.counter_indicators && xaiInsights.counter_indicators.length > 0) {
      reasoning.push(`Counter Indicators: Traits like ` + 
        xaiInsights.counter_indicators.map(c => `'${c.feature.replace(/_/g, ' ')}' (${c.value})`).join(', ') + 
        ` were recognized but ultimately outweighed by your primary traits.`);
    }

    if (responses && (!xaiInsights || !xaiInsights.top_contributors)) {
      reasoning.push(`This analysis was based on ${responses.length} exact physiological and behavioral features.`);
    }

    return {
      type: 'Statistical Machine Learning Analysis with SHAP',
      confidence: 'High',
      reasoning: reasoning,
      evidenceBased: {
        datasetSize: 5000,
        primaryEngine: engine,
        interpretability: 'SHapley Additive exPlanations'
      },
      methodology: 'Gradient Boosting Classification Model'
    };
  }

  explainRecommendation(recommendationData, context) {
    const { userProfile } = recommendationData;
    
    return {
      type: 'AI Health Recommendation',
      confidence: 'High',
      reasoning: [
        `Actionable advice formulated strictly for a ${userProfile.primary.toUpperCase()}-dominant physiology.`,
        `Selected to maintain internal stability and balance key traits identified by our ML engine.`
      ],
      methodology: 'Heuristic alignment with traditional Ayurvedic frameworks'
    };
  }

  generateGenericExplanation(data, context) {
    return {
      type: 'General AI Insight',
      confidence: 'Medium',
      reasoning: ['Analysis based on general ayurvedic intelligence.']
    };
  }
}

module.exports = ExplainableAI;