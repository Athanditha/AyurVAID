// Custom Rule-Based AI for Ayurvedic Recommendations
const ayurvedicKnowledge = require('../data/ayurvedic-knowledge');
const foodDatabase = require('../data/food-database');
const researchStudies = require('../data/research-studies');

class CustomAI {
  constructor() {
    this.responseTemplates = {
      food: [
        "For your {dosha} constitution, I recommend {foods}. These foods help balance your {qualities} nature.",
        "Based on your {dosha} profile, focus on {foods}. They provide {benefits} for your constitution.",
        "Your {dosha} dosha benefits from {foods}. These choices support {functions}."
      ],
      lifestyle: [
        "With your {dosha} constitution, {lifestyle} practices work best. This helps balance your {element} nature.",
        "For {dosha} types, I suggest {lifestyle}. This supports your natural {characteristics}.",
        "Your {dosha} profile thrives with {lifestyle}. This aligns with your {qualities} constitution."
      ],
      exercise: [
        "For {dosha} constitution, {exercise} is ideal. This balances your {qualities} tendencies.",
        "Your {dosha} nature benefits from {exercise}. This supports your {element} balance.",
        "{exercise} practices suit your {dosha} constitution perfectly, promoting {benefits}."
      ],
      general: [
        "Based on your {dosha} constitution, {advice}. This approach honors your {element} nature.",
        "For {dosha} types, {advice} is particularly beneficial. It supports your natural {characteristics}.",
        "Your {dosha} profile suggests {advice}. This helps maintain your constitutional balance."
      ]
    };

    this.intentClassifier = {
      food: ['food', 'diet', 'eat', 'meal', 'nutrition', 'hungry', 'recipe', 'cook'],
      lifestyle: ['lifestyle', 'routine', 'daily', 'habit', 'schedule', 'morning', 'evening'],
      exercise: ['exercise', 'yoga', 'workout', 'fitness', 'movement', 'physical', 'activity'],
      health: ['health', 'wellness', 'healing', 'medicine', 'treatment', 'cure', 'remedy'],
      mental: ['stress', 'anxiety', 'mind', 'mental', 'emotion', 'mood', 'depression', 'calm'],
      sleep: ['sleep', 'rest', 'tired', 'insomnia', 'bed', 'night', 'dream'],
      digestion: ['digestion', 'stomach', 'bloating', 'gas', 'constipation', 'diarrhea', 'appetite']
    };
  }

  async generateResponse(messages, doshaProfile = null) {
    try {
      const userMessage = messages[messages.length - 1].content.toLowerCase();
      const intent = this.classifyIntent(userMessage);
      const context = this.extractContext(userMessage);
      
      let response = '';
      let explanation = {};

      if (doshaProfile) {
        response = this.generatePersonalizedResponse(intent, context, doshaProfile, userMessage);
        explanation = this.generateExplanation(intent, doshaProfile, response);
      } else {
        response = this.generateGenericResponse(intent, context, userMessage);
        explanation = this.generateGenericExplanation(intent);
      }

      return {
        message: response,
        explanation: explanation,
        model: 'CustomAI-v1.0',
        usage: {
          prompt_tokens: userMessage.split(' ').length,
          completion_tokens: response.split(' ').length
        }
      };
    } catch (error) {
      console.error('Custom AI error:', error);
      throw new Error('Custom AI processing failed');
    }
  }

  classifyIntent(message) {
    let maxScore = 0;
    let detectedIntent = 'general';

    for (const [intent, keywords] of Object.entries(this.intentClassifier)) {
      const score = keywords.reduce((acc, keyword) => {
        return acc + (message.includes(keyword) ? 1 : 0);
      }, 0);

      if (score > maxScore) {
        maxScore = score;
        detectedIntent = intent;
      }
    }

    return detectedIntent;
  }

  extractContext(message) {
    const context = {
      urgency: message.includes('urgent') || message.includes('immediate') || message.includes('now'),
      severity: message.includes('severe') || message.includes('bad') || message.includes('terrible'),
      timeOfDay: this.extractTimeContext(message),
      season: this.getCurrentSeason(),
      symptoms: this.extractSymptoms(message)
    };

    return context;
  }

  extractTimeContext(message) {
    if (message.includes('morning')) return 'morning';
    if (message.includes('afternoon') || message.includes('lunch')) return 'afternoon';
    if (message.includes('evening') || message.includes('dinner')) return 'evening';
    if (message.includes('night') || message.includes('bedtime')) return 'night';
    return 'general';
  }

  extractSymptoms(message) {
    const symptoms = [];
    const symptomKeywords = {
      'digestive': ['bloating', 'gas', 'constipation', 'diarrhea', 'nausea', 'heartburn'],
      'mental': ['stress', 'anxiety', 'worry', 'depression', 'mood', 'irritable'],
      'physical': ['tired', 'fatigue', 'pain', 'ache', 'stiff', 'weak'],
      'sleep': ['insomnia', 'restless', 'nightmares', 'wake up', 'sleep']
    };

    for (const [category, keywords] of Object.entries(symptomKeywords)) {
      if (keywords.some(keyword => message.includes(keyword))) {
        symptoms.push(category);
      }
    }

    return symptoms;
  }

  generatePersonalizedResponse(intent, context, doshaProfile, userMessage) {
    const dosha = doshaProfile.primary;
    const doshaData = ayurvedicKnowledge.doshaProfiles[dosha];
    
    switch (intent) {
      case 'food':
        return this.generateFoodResponse(dosha, doshaData, context);
      case 'lifestyle':
        return this.generateLifestyleResponse(dosha, doshaData, context);
      case 'exercise':
        return this.generateExerciseResponse(dosha, doshaData, context);
      case 'health':
        return this.generateHealthResponse(dosha, doshaData, context);
      case 'mental':
        return this.generateMentalHealthResponse(dosha, doshaData, context);
      case 'sleep':
        return this.generateSleepResponse(dosha, doshaData, context);
      case 'digestion':
        return this.generateDigestionResponse(dosha, doshaData, context);
      default:
        return this.generateGeneralResponse(dosha, doshaData, context, userMessage);
    }
  }

  generateFoodResponse(dosha, doshaData, context) {
    const favorFoods = doshaData.balancingFoods.favor.slice(0, 4);
    const avoidFoods = doshaData.balancingFoods.avoid.slice(0, 3);
    
    let response = `For your ${dosha.toUpperCase()} constitution, I recommend focusing on ${favorFoods.join(', ')}. `;
    
    if (context.timeOfDay === 'morning') {
      response += `Start your day with warm, nourishing foods like oatmeal with ghee and dates. `;
    } else if (context.timeOfDay === 'evening') {
      response += `For dinner, choose lighter, easily digestible options. `;
    }
    
    response += `Avoid ${avoidFoods.join(', ')} as they can aggravate your ${dosha} nature. `;
    response += `These recommendations help balance your ${doshaData.qualities.join(', ').toLowerCase()} qualities.`;
    
    return response;
  }

  generateLifestyleResponse(dosha, doshaData, context) {
    const routine = doshaData.lifestyle.routine;
    const environment = doshaData.lifestyle.environment;
    
    let response = `Your ${dosha.toUpperCase()} constitution thrives with ${routine.toLowerCase()}. `;
    response += `Create an environment that is ${environment.toLowerCase()}. `;
    
    if (dosha === 'vata') {
      response += `Stick to regular meal times and sleep schedules. Oil massage before bed can be very grounding.`;
    } else if (dosha === 'pitta') {
      response += `Avoid overheating and excessive competition. Take breaks in cool, peaceful environments.`;
    } else if (dosha === 'kapha') {
      response += `Stay active and avoid excessive sleep. Stimulating activities help maintain your energy.`;
    }
    
    return response;
  }

  generateExerciseResponse(dosha, doshaData, context) {
    const exerciseType = doshaData.lifestyle.exercise;
    const yogaPractices = ayurvedicKnowledge.yogaPractices[dosha];
    
    let response = `For your ${dosha.toUpperCase()} constitution, ${exerciseType.toLowerCase()} works best. `;
    response += `Try ${yogaPractices.slice(0, 3).join(', ')} for optimal balance. `;
    
    if (context.timeOfDay === 'morning') {
      response += `Morning practice helps set a positive tone for your day. `;
    }
    
    if (dosha === 'vata') {
      response += `Focus on grounding, slow movements rather than intense cardio.`;
    } else if (dosha === 'pitta') {
      response += `Avoid exercising in hot weather or during peak sun hours.`;
    } else if (dosha === 'kapha') {
      response += `More vigorous exercise helps stimulate your naturally slower metabolism.`;
    }
    
    return response;
  }

  generateHealthResponse(dosha, doshaData, context) {
    let response = `For ${dosha.toUpperCase()} health maintenance, focus on balancing your ${doshaData.element.join(' + ')} elements. `;
    
    if (context.symptoms.length > 0) {
      response += `For your current concerns, `;
      
      if (context.symptoms.includes('digestive')) {
        response += `gentle spices like ginger and cumin can help digestion. `;
      }
      if (context.symptoms.includes('mental')) {
        response += `calming practices like meditation are beneficial. `;
      }
      if (context.symptoms.includes('physical')) {
        response += `gentle movement and adequate rest are important. `;
      }
    }
    
    response += `Remember, prevention through lifestyle alignment is key in Ayurveda.`;
    
    return response;
  }

  generateMentalHealthResponse(dosha, doshaData, context) {
    const mentalPractices = ayurvedicKnowledge.mentalHealth[dosha];
    
    let response = `For ${dosha.toUpperCase()} mental balance, ${mentalPractices.stressManagement} is particularly effective. `;
    response += `Practice ${mentalPractices.meditation} meditation regularly. `;
    
    if (context.urgency) {
      response += `For immediate relief, try deep breathing exercises. `;
    }
    
    response += `Your ${dosha} nature benefits from ${mentalPractices.lifestyle} approaches to mental wellness.`;
    
    return response;
  }

  generateSleepResponse(dosha, doshaData, context) {
    const sleepAdvice = doshaData.lifestyle.sleep;
    
    let response = `For quality sleep with your ${dosha.toUpperCase()} constitution, ${sleepAdvice.toLowerCase()}. `;
    
    if (dosha === 'vata') {
      response += `Warm oil massage before bed and consistent sleep times help calm your active mind.`;
    } else if (dosha === 'pitta') {
      response += `Keep your bedroom cool and avoid stimulating activities before bed.`;
    } else if (dosha === 'kapha') {
      response += `Avoid daytime naps and heavy evening meals to maintain healthy sleep patterns.`;
    }
    
    return response;
  }

  generateDigestionResponse(dosha, doshaData, context) {
    let response = `For ${dosha.toUpperCase()} digestive health, `;
    
    if (dosha === 'vata') {
      response += `eat warm, cooked foods at regular times. Avoid cold drinks and raw foods.`;
    } else if (dosha === 'pitta') {
      response += `avoid spicy, acidic foods. Cool, sweet foods help balance your strong digestive fire.`;
    } else if (dosha === 'kapha') {
      response += `use warming spices and avoid heavy, oily foods. Light, warm meals support your slower digestion.`;
    }
    
    response += ` Mindful eating and proper food combining are essential for all constitutions.`;
    
    return response;
  }

  generateGeneralResponse(dosha, doshaData, context, userMessage) {
    const template = this.responseTemplates.general[Math.floor(Math.random() * this.responseTemplates.general.length)];
    
    return template
      .replace('{dosha}', dosha.toUpperCase())
      .replace('{advice}', `maintaining balance through ${doshaData.lifestyle.routine.toLowerCase()}`)
      .replace('{element}', doshaData.element.join(' + '))
      .replace('{characteristics}', doshaData.qualities.slice(0, 3).join(', ').toLowerCase());
  }

  generateGenericResponse(intent, context, userMessage) {
    const genericAdvice = {
      food: "Focus on fresh, whole foods that are appropriate for your constitution. Eat mindfully and at regular times.",
      lifestyle: "Maintain regular routines, get adequate sleep, and create a peaceful environment.",
      exercise: "Choose physical activities that suit your body type and energy levels.",
      health: "Prevention through proper diet, lifestyle, and stress management is key to wellness.",
      mental: "Practice meditation, deep breathing, and maintain work-life balance for mental health.",
      sleep: "Establish consistent sleep schedules and create a calming bedtime routine.",
      digestion: "Eat warm, cooked foods and avoid overeating. Proper food combining supports digestion."
    };

    return genericAdvice[intent] || "For personalized recommendations, please complete your dosha assessment first. I'm here to help you on your wellness journey with traditional Ayurvedic wisdom.";
  }

  generateExplanation(intent, doshaProfile, response) {
    const dosha = doshaProfile.primary;
    const doshaData = ayurvedicKnowledge.doshaProfiles[dosha];
    
    return {
      reasoning: [
        `Response tailored for ${dosha.toUpperCase()}-dominant constitution`,
        `Considers your ${doshaData.element.join(' + ')} elemental nature`,
        `Addresses ${doshaData.qualities.join(', ').toLowerCase()} qualities that need balancing`,
        `Based on classical Ayurvedic principles and traditional knowledge`
      ],
      confidence: "High",
      sources: [
        "Classical Ayurvedic constitutional analysis",
        "Traditional dosha-specific guidelines",
        "Comprehensive Ayurvedic knowledge database"
      ],
      methodology: "Rule-based AI using traditional Ayurvedic principles and constitutional analysis",
      constitutionalBasis: {
        primaryDosha: dosha,
        elements: doshaData.element,
        qualities: doshaData.qualities,
        functions: doshaData.functions
      }
    };
  }

  generateGenericExplanation(intent) {
    return {
      reasoning: [
        "Response based on general Ayurvedic principles",
        "Incorporates traditional wellness guidelines",
        "Provides foundational health recommendations"
      ],
      confidence: "Medium",
      sources: [
        "Traditional Ayurvedic texts",
        "General wellness principles",
        "Classical health guidelines"
      ],
      methodology: "Rule-based system using traditional Ayurvedic knowledge"
    };
  }

  getCurrentSeason() {
    const month = new Date().getMonth();
    if (month >= 2 && month <= 4) return 'spring';
    if (month >= 5 && month <= 7) return 'summer';
    if (month >= 8 && month <= 10) return 'autumn';
    return 'winter';
  }

  async isAvailable() {
    return true; // Always available as it's rule-based
  }
}

module.exports = CustomAI;