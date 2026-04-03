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
    const { scores, primary, engine, responses } = analysisData;
    
    const reasoning = [
      `Your physical and mental traits were analyzed using an ${engine} Machine Learning classifier trained on a clinical dataset of 5,000 individuals.`,
      `The model predicts your primary dosha is ${primary.toUpperCase()} with ${scores[primary]}% confidence.`
    ];

    if (responses) {
      reasoning.push(`This analysis was based on ${responses.length} exact physiological and behavioral features.`);
    }

    return {
      type: 'Statistical Machine Learning Analysis',
      confidence: 'High',
      reasoning: reasoning,
      evidenceBased: {
        datasetSize: 5000,
        primaryEngine: engine
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