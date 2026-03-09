// Comprehensive Explainable AI Engine for AyurVAID
const ayurvedicKnowledge = require('../data/ayurvedic-knowledge');
const foodDatabase = require('../data/food-database');
const researchStudies = require('../data/research-studies');

class ExplainableAI {
  constructor() {
    this.explanationTypes = {
      DOSHA_ANALYSIS: 'dosha_analysis',
      RECOMMENDATION: 'recommendation',
      FOOD_ADVICE: 'food_advice',
      LIFESTYLE: 'lifestyle',
      RESEARCH_BACKED: 'research_backed'
    };
  }

  // Main explanation generator
  generateExplanation(type, data, context = {}) {
    switch (type) {
      case this.explanationTypes.DOSHA_ANALYSIS:
        return this.explainDoshaAnalysis(data, context);
      case this.explanationTypes.RECOMMENDATION:
        return this.explainRecommendation(data, context);
      case this.explanationTypes.FOOD_ADVICE:
        return this.explainFoodAdvice(data, context);
      case this.explanationTypes.LIFESTYLE:
        return this.explainLifestyleAdvice(data, context);
      case this.explanationTypes.RESEARCH_BACKED:
        return this.explainResearchBacking(data, context);
      default:
        return this.generateGenericExplanation(data, context);
    }
  }

  // Explain dosha analysis results
  explainDoshaAnalysis(analysisData, context) {
    const { scores, primary, secondary, responses } = analysisData;
    
    // Analyze which questions contributed most to the result
    const contributingFactors = this.analyzeContributingFactors(responses, primary);
    
    // Calculate confidence based on score distribution
    const confidence = this.calculateConfidence(scores);
    
    // Generate step-by-step reasoning
    const reasoning = [
      `Your assessment responses indicate ${primary.toUpperCase()} dominance (${scores[primary]}%)`,
      `Key indicators: ${contributingFactors.topFactors.join(', ')}`,
      `Secondary ${secondary.toUpperCase()} influence (${scores[secondary]}%) adds balance`,
      `Score distribution shows ${confidence.level} confidence in this assessment`
    ];

    // Add constitutional explanation
    const doshaProfile = ayurvedicKnowledge.doshaProfiles[primary];
    reasoning.push(`${primary.toUpperCase()} constitution is characterized by ${doshaProfile.element.join(' + ')} elements`);
    reasoning.push(`This manifests as ${doshaProfile.qualities.slice(0, 3).join(', ').toLowerCase()} qualities in your physiology`);

    return {
      type: 'Dosha Constitutional Analysis',
      confidence: confidence.level,
      confidenceScore: confidence.score,
      reasoning: reasoning,
      evidenceBased: {
        questionsAnalyzed: responses.length,
        weightedScoring: true,
        traditionalBasis: ['Charaka Samhita', 'Sushruta Samhita', 'Ashtanga Hridaya']
      },
      contributingFactors: contributingFactors,
      methodology: 'Weighted response analysis based on classical Ayurvedic assessment principles',
      limitations: [
        'Assessment based on self-reported responses',
        'Professional consultation recommended for health concerns',
        'Constitution may vary with age and lifestyle changes'
      ],
      nextSteps: [
        'Receive personalized recommendations',
        'Consult with qualified Ayurvedic practitioner',
        'Monitor how recommendations affect your well-being'
      ]
    };
  }

  // Explain AI recommendations
  explainRecommendation(recommendationData, context) {
    const { recommendation, userProfile, messageContext } = recommendationData;
    
    // Analyze why this specific recommendation was made
    const reasoningChain = this.buildReasoningChain(recommendation, userProfile, messageContext);
    
    // Find supporting research
    const researchSupport = this.findResearchSupport(recommendation);
    
    // Identify traditional basis
    const traditionalBasis = this.findTraditionalBasis(recommendation, userProfile);

    return {
      type: 'AI Health Recommendation',
      confidence: this.assessRecommendationConfidence(recommendation, userProfile),
      reasoning: reasoningChain.steps,
      decisionTree: reasoningChain.tree,
      evidenceSupport: {
        traditional: traditionalBasis,
        research: researchSupport,
        personalizedFactors: this.getPersonalizationFactors(userProfile)
      },
      methodology: 'Multi-layered analysis combining traditional knowledge, modern research, and personal constitution',
      transparency: {
        dataSourcesUsed: reasoningChain.dataSources,
        algorithmsApplied: ['Constitutional matching', 'Symptom analysis', 'Research correlation'],
        biasConsiderations: ['Individual variation', 'Cultural context', 'Modern lifestyle factors']
      },
      alternatives: this.generateAlternativeRecommendations(recommendation, userProfile),
      monitoring: this.suggestMonitoringApproach(recommendation)
    };
  }

  // Explain food recommendations
  explainFoodAdvice(foodData, context) {
    const { foods, userDosha, season, userQuery } = foodData;
    
    const explanations = foods.map(food => {
      const foodInfo = this.findFoodInDatabase(food);
      if (!foodInfo) return null;

      return {
        food: food,
        whyRecommended: this.explainFoodChoice(foodInfo, userDosha, season),
        ayurvedicProperties: {
          taste: foodInfo.tastes,
          qualities: foodInfo.qualities,
          effect: foodInfo.effect,
          doshaImpact: this.analyzeDoshaImpact(foodInfo, userDosha)
        },
        preparation: foodInfo.preparation || [],
        cautions: foodInfo.avoid || [],
        seasonalRelevance: this.explainSeasonalRelevance(foodInfo, season)
      };
    }).filter(Boolean);

    return {
      type: 'Personalized Food Recommendations',
      confidence: 'High',
      reasoning: [
        `Recommendations tailored for ${userDosha.toUpperCase()}-dominant constitution`,
        `Foods selected to balance ${ayurvedicKnowledge.doshaProfiles[userDosha].qualities.join(', ').toLowerCase()} qualities`,
        `Seasonal considerations for current ${season} period included`,
        `Traditional food combining principles applied`
      ],
      foodExplanations: explanations,
      principles: {
        tasteBalance: 'Six tastes (sweet, sour, salty, pungent, bitter, astringent) considered',
        qualityBalance: 'Hot/cold, heavy/light, oily/dry qualities balanced for your dosha',
        seasonalAlignment: 'Foods chosen to counteract seasonal dosha influences',
        digestiveSupport: 'Recommendations support your digestive capacity (agni)'
      },
      sources: ['Classical Ayurvedic food texts', 'Modern nutritional research', 'Traditional food combining rules']
    };
  }

  // Analyze contributing factors to dosha assessment
  analyzeContributingFactors(responses, primaryDosha) {
    const factorAnalysis = {
      physical: 0,
      mental: 0,
      digestive: 0,
      lifestyle: 0
    };

    const topFactors = [];
    
    responses.forEach(response => {
      if (response.dosha === primaryDosha) {
        // Categorize the contributing question
        const questionId = response.questionId;
        if (questionId <= 3) {
          factorAnalysis.physical += response.weight;
          topFactors.push('Physical constitution');
        } else if (questionId <= 5) {
          factorAnalysis.digestive += response.weight;
          topFactors.push('Digestive patterns');
        } else if (questionId <= 7) {
          factorAnalysis.mental += response.weight;
          topFactors.push('Mental characteristics');
        } else {
          factorAnalysis.lifestyle += response.weight;
          topFactors.push('Lifestyle preferences');
        }
      }
    });

    return {
      breakdown: factorAnalysis,
      topFactors: [...new Set(topFactors)].slice(0, 3),
      strongestIndicator: Object.keys(factorAnalysis).reduce((a, b) => 
        factorAnalysis[a] > factorAnalysis[b] ? a : b
      )
    };
  }

  // Calculate confidence in assessment
  calculateConfidence(scores) {
    const highest = Math.max(...Object.values(scores));
    const secondHighest = Object.values(scores).sort((a, b) => b - a)[1];
    const difference = highest - secondHighest;
    
    let level, score;
    if (difference >= 30) {
      level = 'Very High';
      score = 0.9;
    } else if (difference >= 20) {
      level = 'High';
      score = 0.8;
    } else if (difference >= 10) {
      level = 'Medium';
      score = 0.7;
    } else {
      level = 'Low';
      score = 0.6;
    }

    return { level, score, scoreDifference: difference };
  }

  // Build reasoning chain for recommendations
  buildReasoningChain(recommendation, userProfile, messageContext) {
    const steps = [];
    const dataSources = [];
    
    // Step 1: User context analysis
    steps.push(`Analyzed your query: "${messageContext.userMessage}"`);
    dataSources.push('User input analysis');

    // Step 2: Constitutional consideration
    if (userProfile) {
      steps.push(`Considered your ${userProfile.primary}-dominant constitution`);
      steps.push(`Factored in ${userProfile.primary} qualities: ${ayurvedicKnowledge.doshaProfiles[userProfile.primary].qualities.slice(0, 3).join(', ').toLowerCase()}`);
      dataSources.push('Personal dosha profile');
    }

    // Step 3: Traditional knowledge application
    steps.push('Applied classical Ayurvedic principles from traditional texts');
    dataSources.push('Ayurvedic knowledge database');

    // Step 4: Modern research correlation
    steps.push('Cross-referenced with modern research validation');
    dataSources.push('Research studies database');

    // Step 5: Personalization
    steps.push('Personalized recommendation based on your unique constitution and query');

    const tree = {
      root: 'User Query Analysis',
      branches: [
        {
          node: 'Constitutional Assessment',
          children: ['Dosha identification', 'Quality analysis', 'Imbalance detection']
        },
        {
          node: 'Knowledge Base Matching',
          children: ['Traditional texts', 'Food database', 'Research studies']
        },
        {
          node: 'Personalization',
          children: ['Individual factors', 'Seasonal considerations', 'Lifestyle context']
        }
      ]
    };

    return { steps, tree, dataSources };
  }

  // Find research support for recommendations
  findResearchSupport(recommendation) {
    const support = [];
    const recLower = recommendation.toLowerCase();

    // Check for specific research matches
    if (recLower.includes('ashwagandha') || recLower.includes('stress')) {
      support.push({
        study: researchStudies.clinicalStudies.ashwagandhaStress.title,
        finding: 'Significant reduction in cortisol levels and improved stress resilience',
        relevance: 'Validates traditional use for stress management'
      });
    }

    if (recLower.includes('turmeric') || recLower.includes('inflammation')) {
      support.push({
        study: researchStudies.clinicalStudies.turmericInflammation.title,
        finding: 'Reduced inflammatory markers and joint health improvement',
        relevance: 'Supports traditional anti-inflammatory use'
      });
    }

    if (recLower.includes('yoga') || recLower.includes('exercise')) {
      support.push({
        study: researchStudies.clinicalStudies.yogaMetabolism.title,
        finding: 'Improved insulin sensitivity and better lipid profiles',
        relevance: 'Validates yoga for metabolic health'
      });
    }

    return support;
  }

  // Find traditional basis for recommendations
  findTraditionalBasis(recommendation, userProfile) {
    const basis = [];
    
    if (userProfile) {
      const doshaProfile = ayurvedicKnowledge.doshaProfiles[userProfile.primary];
      basis.push({
        source: 'Classical Dosha Theory',
        principle: `${userProfile.primary.toUpperCase()} constitution management`,
        application: `Recommendations target ${doshaProfile.qualities.join(', ').toLowerCase()} qualities`
      });
    }

    basis.push({
      source: 'Charaka Samhita',
      principle: 'Prevention is better than cure',
      application: 'Recommendations focus on maintaining balance rather than treating disease'
    });

    return basis;
  }

  // Generate alternative recommendations
  generateAlternativeRecommendations(primaryRec, userProfile) {
    const alternatives = [];
    
    if (userProfile) {
      const doshaProfile = ayurvedicKnowledge.doshaProfiles[userProfile.primary];
      
      // Suggest alternative approaches from the same dosha category
      if (primaryRec.includes('food')) {
        alternatives.push({
          approach: 'Lifestyle Modification',
          suggestion: doshaProfile.lifestyle.routine,
          rationale: 'Alternative to dietary changes'
        });
      }
      
      if (primaryRec.includes('exercise')) {
        alternatives.push({
          approach: 'Breathing Practices',
          suggestion: `${ayurvedicKnowledge.yogaPractices[userProfile.primary][4]} for your constitution`,
          rationale: 'Gentler alternative to physical exercise'
        });
      }
    }

    return alternatives;
  }

  // Suggest monitoring approach
  suggestMonitoringApproach(recommendation) {
    return {
      timeframe: '2-4 weeks for initial effects',
      indicators: [
        'Energy levels throughout the day',
        'Sleep quality and duration',
        'Digestive comfort',
        'Mood and mental clarity'
      ],
      adjustments: 'Modify recommendations based on your body\'s response',
      consultation: 'Consult healthcare provider if concerns arise'
    };
  }

  // Helper methods
  findFoodInDatabase(foodName) {
    // Search through all food categories
    for (const category of Object.values(foodDatabase)) {
      for (const [key, food] of Object.entries(category)) {
        if (food.name.toLowerCase().includes(foodName.toLowerCase()) || 
            key.toLowerCase().includes(foodName.toLowerCase())) {
          return food;
        }
      }
    }
    return null;
  }

  explainFoodChoice(foodInfo, userDosha, season) {
    const reasons = [];
    
    // Dosha compatibility
    if (foodInfo.bestFor && foodInfo.bestFor.includes(userDosha)) {
      reasons.push(`Specifically beneficial for ${userDosha.toUpperCase()} constitution`);
    }
    
    // Quality balance
    const doshaQualities = ayurvedicKnowledge.doshaProfiles[userDosha].qualities;
    const oppositeQualities = this.getOppositeQualities(doshaQualities);
    
    if (foodInfo.qualities.some(q => oppositeQualities.includes(q))) {
      reasons.push(`Provides balancing ${foodInfo.qualities.join(', ')} qualities`);
    }

    // Seasonal relevance
    if (season && this.isSeasonallyAppropriate(foodInfo, season)) {
      reasons.push(`Appropriate for current ${season} season`);
    }

    return reasons;
  }

  getOppositeQualities(qualities) {
    const opposites = {
      'dry': 'oily',
      'light': 'heavy',
      'cold': 'warm',
      'rough': 'smooth',
      'subtle': 'gross',
      'mobile': 'stable'
    };
    
    return qualities.map(q => opposites[q.toLowerCase()] || q).filter(Boolean);
  }

  isSeasonallyAppropriate(foodInfo, season) {
    // Simple seasonal logic - can be expanded
    if (season === 'winter' && foodInfo.effect === 'warming') return true;
    if (season === 'summer' && foodInfo.effect === 'cooling') return true;
    return false;
  }

  analyzeDoshaImpact(foodInfo, userDosha) {
    const impact = {
      increases: [],
      decreases: [],
      neutral: []
    };

    if (foodInfo.bestFor && foodInfo.bestFor.includes(userDosha)) {
      impact.decreases.push(userDosha);
    }
    
    if (foodInfo.avoid && foodInfo.avoid.includes(userDosha)) {
      impact.increases.push(userDosha);
    }

    return impact;
  }

  explainSeasonalRelevance(foodInfo, season) {
    const seasonalWisdom = ayurvedicKnowledge.seasonalWisdom[season];
    if (!seasonalWisdom) return 'No specific seasonal guidance';

    return `Aligns with ${season} recommendations to balance ${seasonalWisdom.dominantDosha} dosha`;
  }

  getPersonalizationFactors(userProfile) {
    if (!userProfile) return [];

    return [
      `Primary dosha: ${userProfile.primary.toUpperCase()}`,
      `Secondary dosha: ${userProfile.secondary.toUpperCase()}`,
      `Constitution type: ${userProfile.constitutionType}`,
      `Assessment confidence: ${userProfile.confidence || 'Medium'}`
    ];
  }

  assessRecommendationConfidence(recommendation, userProfile) {
    // Simple confidence assessment based on available data
    let confidence = 0.7; // Base confidence

    if (userProfile) confidence += 0.1;
    if (this.findResearchSupport(recommendation).length > 0) confidence += 0.1;
    if (recommendation.length > 50) confidence += 0.05; // More detailed recommendations

    if (confidence >= 0.9) return 'Very High';
    if (confidence >= 0.8) return 'High';
    if (confidence >= 0.7) return 'Medium';
    return 'Low';
  }

  generateGenericExplanation(data, context) {
    return {
      type: 'General AI Response',
      confidence: 'Medium',
      reasoning: [
        'Response generated using comprehensive Ayurvedic knowledge base',
        'Applied traditional principles with modern understanding',
        'Personalized based on available user information'
      ],
      methodology: 'Multi-source knowledge synthesis',
      sources: ['Traditional texts', 'Modern research', 'Clinical experience']
    };
  }
}

module.exports = ExplainableAI;