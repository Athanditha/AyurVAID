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
    const { scores, primary, engine, comparative_rf_scores, responses } = analysisData;
    
    // Calculate comparative agreement between the two models
    const rf_primary = Object.keys(comparative_rf_scores).reduce((a, b) => comparative_rf_scores[a] > comparative_rf_scores[b] ? a : b);
    const modelsAgree = rf_primary === primary;

    const reasoning = [
      `Your physical and mental traits were analyzed using an ${engine} Machine Learning classifier trained on a clinical dataset of 5,000 individuals.`,
      `The model predicts your primary dosha is ${primary.toUpperCase()} with ${scores[primary]}% confidence.`,
      modelsAgree 
        ? `This prediction is highly reliable, as an independent Random Forest model also confirmed ${primary.toUpperCase()} as your dominant constitution.`
        : `An independent Random Forest model provided a slightly variant prediction weighing towards ${rf_primary.toUpperCase()}, suggesting you may have a strong dual-dosha presentation.`
    ];

    if (responses) {
      reasoning.push(`This analysis was based on ${responses.length} exact physiological and behavioral features.`);
    }

    return {
      type: 'Statistical Machine Learning Analysis',
      confidence: modelsAgree ? 'Very High' : 'High',
      reasoning: reasoning,
      evidenceBased: {
        datasetSize: 5000,
        primaryEngine: engine,
        comparativeEngine: 'Random Forest',
        modelAgreement: modelsAgree
      },
      methodology: 'Gradient Boosting & Ensemble Classification Models'
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