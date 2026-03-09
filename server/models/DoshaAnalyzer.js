const ayurvedicKnowledge = require('../data/ayurvedic-knowledge');

class DoshaAnalyzer {
  constructor() {
    // Use the comprehensive knowledge base
    this.doshaDescriptions = ayurvedicKnowledge.doshaProfiles;
  }

  analyzeResponses(responses) {
    const scores = { vata: 0, pitta: 0, kapha: 0 };
    const totalWeight = responses.reduce((sum, response) => sum + response.weight, 0);

    // Calculate weighted scores
    responses.forEach(response => {
      scores[response.dosha] += response.weight;
    });

    // Convert to percentages
    const percentages = {
      vata: Math.round((scores.vata / totalWeight) * 100),
      pitta: Math.round((scores.pitta / totalWeight) * 100),
      kapha: Math.round((scores.kapha / totalWeight) * 100)
    };

    // Determine primary and secondary doshas
    const sortedDoshas = Object.entries(percentages)
      .sort(([,a], [,b]) => b - a)
      .map(([dosha, percentage]) => ({ dosha, percentage }));

    const primary = sortedDoshas[0];
    const secondary = sortedDoshas[1];

    // Determine constitution type
    let constitutionType;
    if (primary.percentage >= 60) {
      constitutionType = `Single Dosha (${primary.dosha.charAt(0).toUpperCase() + primary.dosha.slice(1)})`;
    } else if (primary.percentage >= 40 && secondary.percentage >= 30) {
      constitutionType = `Dual Dosha (${primary.dosha.charAt(0).toUpperCase() + primary.dosha.slice(1)}-${secondary.dosha.charAt(0).toUpperCase() + secondary.dosha.slice(1)})`;
    } else {
      constitutionType = "Tri-Dosha (Balanced)";
    }

    return {
      scores: percentages,
      primary: primary.dosha,
      secondary: secondary.dosha,
      constitutionType,
      profile: this.generateProfile(percentages, primary.dosha, secondary.dosha),
      recommendations: this.generateRecommendations(percentages, primary.dosha)
    };
  }

  generateProfile(percentages, primary, secondary) {
    const primaryDesc = this.doshaDescriptions[primary];
    const secondaryDesc = this.doshaDescriptions[secondary];

    return {
      constitution: {
        primary: {
          dosha: primary,
          percentage: percentages[primary],
          description: primaryDesc
        },
        secondary: {
          dosha: secondary,
          percentage: percentages[secondary],
          description: secondaryDesc
        }
      },
      strengths: primaryDesc.balancedState.concat(secondaryDesc.balancedState.slice(0, 2)),
      vulnerabilities: primaryDesc.imbalancedState.concat(secondaryDesc.imbalancedState.slice(0, 2))
    };
  }

  generateRecommendations(percentages, primary) {
    const primaryDesc = this.doshaDescriptions[primary];
    
    return {
      lifestyle: Object.values(primaryDesc.lifestyle),
      dietary: primaryDesc.balancingFoods,
      exercise: ayurvedicKnowledge.yogaPractices[primary],
      mentalWellness: ayurvedicKnowledge.mentalHealth[primary].practices
    };
  }

  getDietaryRecommendations(primary) {
    const recommendations = {
      vata: {
        favor: ["Warm, cooked foods", "Sweet, sour, salty tastes", "Healthy fats and oils", "Regular meal times"],
        avoid: ["Cold, raw foods", "Excessive bitter, pungent, astringent", "Irregular eating", "Too much caffeine"]
      },
      pitta: {
        favor: ["Cool, fresh foods", "Sweet, bitter, astringent tastes", "Plenty of water", "Moderate portions"],
        avoid: ["Spicy, hot foods", "Excessive sour, salty, pungent", "Alcohol", "Eating when angry"]
      },
      kapha: {
        favor: ["Light, warm foods", "Pungent, bitter, astringent tastes", "Spices and herbs", "Smaller portions"],
        avoid: ["Heavy, oily foods", "Excessive sweet, sour, salty", "Cold drinks", "Overeating"]
      }
    };
    return recommendations[primary];
  }

  getExerciseRecommendations(primary) {
    const recommendations = {
      vata: ["Gentle yoga", "Walking", "Swimming", "Tai chi", "Avoid overexertion"],
      pitta: ["Moderate intensity", "Swimming", "Cycling", "Team sports", "Avoid competitive stress"],
      kapha: ["Vigorous exercise", "Running", "Weight training", "High-intensity workouts", "Daily movement essential"]
    };
    return recommendations[primary];
  }

  getMentalWellnessRecommendations(primary) {
    const recommendations = {
      vata: ["Regular meditation", "Grounding practices", "Consistent routine", "Calming music", "Avoid overstimulation"],
      pitta: ["Cooling practices", "Stress management", "Avoid perfectionism", "Nature walks", "Moderate goals"],
      kapha: ["Stimulating activities", "New experiences", "Social engagement", "Energizing practices", "Avoid isolation"]
    };
    return recommendations[primary];
  }
}

module.exports = DoshaAnalyzer;