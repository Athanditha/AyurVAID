// Comprehensive Ayurvedic Knowledge Dataset
const ayurvedicKnowledge = {
  // Classical Texts and References
  classicalTexts: {
    charakaSamhita: {
      name: "Charaka Samhita",
      description: "Ancient treatise on Ayurvedic medicine",
      principles: [
        "Prevention is better than cure",
        "Individual constitution determines treatment",
        "Balance of doshas leads to health"
      ]
    },
    sushrutaSamhita: {
      name: "Sushruta Samhita",
      description: "Ancient surgical text",
      focus: ["Surgery", "Anatomy", "Medicine"]
    },
    ashtangaHridaya: {
      name: "Ashtanga Hridaya",
      description: "Comprehensive medical compendium",
      topics: ["Diagnosis", "Treatment", "Prevention"]
    }
  },

  // Detailed Dosha Information
  doshaProfiles: {
    vata: {
      element: ["Air", "Space"],
      qualities: ["Dry", "Light", "Cold", "Rough", "Subtle", "Mobile"],
      functions: [
        "Movement and circulation",
        "Nervous system activity",
        "Breathing and heart function",
        "Elimination processes"
      ],
      physicalCharacteristics: {
        bodyFrame: "Thin, light, small-boned",
        skin: "Dry, rough, cool, thin",
        hair: "Dry, brittle, thin",
        eyes: "Small, dry, active",
        appetite: "Variable, irregular",
        digestion: "Irregular, gas, bloating",
        sleep: "Light, interrupted, 5-7 hours",
        energy: "Comes in bursts, then crashes"
      },
      mentalCharacteristics: {
        personality: "Creative, enthusiastic, quick thinking",
        memory: "Quick to learn, quick to forget",
        stress: "Worry, anxiety, restlessness",
        communication: "Talk fast, jump topics"
      },
      balancedState: [
        "Creative and energetic",
        "Quick thinking and adaptable",
        "Good circulation",
        "Regular elimination"
      ],
      imbalancedState: [
        "Anxiety and restlessness",
        "Insomnia and fatigue",
        "Digestive issues",
        "Joint pain and stiffness"
      ],
      balancingFoods: {
        favor: [
          "Warm, cooked foods",
          "Sweet, sour, salty tastes",
          "Healthy fats and oils",
          "Root vegetables",
          "Warm milk and ghee",
          "Cooked grains like rice and oats"
        ],
        avoid: [
          "Cold, raw foods",
          "Excessive bitter, pungent, astringent",
          "Caffeine and stimulants",
          "Dry and light foods",
          "Irregular eating patterns"
        ]
      },
      lifestyle: {
        routine: "Regular daily schedule",
        exercise: "Gentle, grounding activities like yoga, walking",
        environment: "Warm, calm, stable",
        sleep: "Early to bed, adequate rest"
      }
    },
    pitta: {
      element: ["Fire", "Water"],
      qualities: ["Hot", "Sharp", "Light", "Oily", "Liquid", "Mobile"],
      functions: [
        "Digestion and metabolism",
        "Body temperature regulation",
        "Hormone production",
        "Cognitive function"
      ],
      physicalCharacteristics: {
        bodyFrame: "Medium build, moderate weight",
        skin: "Warm, oily, soft, medium thickness",
        hair: "Fine, soft, early graying/balding",
        eyes: "Medium, sharp, penetrating",
        appetite: "Strong, get irritable when hungry",
        digestion: "Strong, quick, sometimes loose stools",
        sleep: "Sound, moderate, 6-8 hours",
        energy: "Steady throughout the day"
      },
      mentalCharacteristics: {
        personality: "Focused, determined, competitive",
        memory: "Sharp, clear, focused",
        stress: "Anger, irritability, impatience",
        communication: "Precise, direct, convincing"
      },
      balancedState: [
        "Good digestion and metabolism",
        "Sharp intellect and focus",
        "Natural leadership qualities",
        "Healthy body temperature"
      ],
      imbalancedState: [
        "Anger and irritability",
        "Acid reflux and heartburn",
        "Skin inflammation",
        "Excessive competitiveness"
      ],
      balancingFoods: {
        favor: [
          "Cool, fresh foods",
          "Sweet, bitter, astringent tastes",
          "Fresh fruits and vegetables",
          "Coconut and cooling oils",
          "Plenty of water",
          "Moderate portions"
        ],
        avoid: [
          "Spicy, hot foods",
          "Excessive sour, salty, pungent",
          "Alcohol and caffeine",
          "Fried and oily foods",
          "Eating when angry"
        ]
      },
      lifestyle: {
        routine: "Moderate, avoid overwork",
        exercise: "Moderate intensity, swimming, cycling",
        environment: "Cool, well-ventilated",
        sleep: "Adequate rest, avoid late nights"
      }
    },
    kapha: {
      element: ["Earth", "Water"],
      qualities: ["Heavy", "Slow", "Cold", "Oily", "Smooth", "Stable"],
      functions: [
        "Structure and stability",
        "Immune system strength",
        "Lubrication of joints",
        "Emotional stability"
      ],
      physicalCharacteristics: {
        bodyFrame: "Large frame, heavy, well-built",
        skin: "Thick, oily, cool, smooth",
        hair: "Thick, oily, wavy, lustrous",
        eyes: "Large, calm, attractive",
        appetite: "Steady, can skip meals easily",
        digestion: "Slow, heavy feeling after meals",
        sleep: "Deep, long, 8+ hours",
        energy: "Slow to start, steady once going"
      },
      mentalCharacteristics: {
        personality: "Calm, stable, compassionate",
        memory: "Slow to learn, good retention",
        stress: "Calm, withdrawn, depression",
        communication: "Slow, thoughtful, gentle"
      },
      balancedState: [
        "Strong immunity",
        "Emotional stability",
        "Good endurance",
        "Healthy weight"
      ],
      imbalancedState: [
        "Weight gain and sluggishness",
        "Depression and lethargy",
        "Congestion and mucus",
        "Attachment and possessiveness"
      ],
      balancingFoods: {
        favor: [
          "Light, warm foods",
          "Pungent, bitter, astringent tastes",
          "Spices and herbs",
          "Steamed vegetables",
          "Smaller portions",
          "Warm water and herbal teas"
        ],
        avoid: [
          "Heavy, oily foods",
          "Excessive sweet, sour, salty",
          "Cold drinks and ice cream",
          "Dairy products",
          "Overeating"
        ]
      },
      lifestyle: {
        routine: "Active, varied schedule",
        exercise: "Vigorous exercise, running, weight training",
        environment: "Warm, dry, stimulating",
        sleep: "Moderate sleep, early rising"
      }
    }
  },

  // Seasonal Guidelines
  seasonalWisdom: {
    spring: {
      dominantDosha: "kapha",
      recommendations: [
        "Light, warm foods",
        "Increase physical activity",
        "Detoxification practices",
        "Reduce heavy, oily foods"
      ]
    },
    summer: {
      dominantDosha: "pitta",
      recommendations: [
        "Cool, fresh foods",
        "Avoid excessive heat",
        "Stay hydrated",
        "Moderate exercise"
      ]
    },
    autumn: {
      dominantDosha: "vata",
      recommendations: [
        "Warm, grounding foods",
        "Regular routine",
        "Oil massage",
        "Adequate rest"
      ]
    },
    winter: {
      dominantDosha: "kapha",
      recommendations: [
        "Warm, spiced foods",
        "Regular exercise",
        "Avoid heavy foods",
        "Stay active"
      ]
    }
  },

  // Herbs and Remedies
  herbs: {
    ashwagandha: {
      name: "Ashwagandha",
      benefits: ["Stress relief", "Energy boost", "Immune support"],
      bestFor: ["vata", "pitta"],
      usage: "Adaptogenic herb for stress and vitality"
    },
    turmeric: {
      name: "Turmeric",
      benefits: ["Anti-inflammatory", "Digestive support", "Immune boost"],
      bestFor: ["kapha", "pitta"],
      usage: "Golden milk, cooking spice, supplements"
    },
    triphala: {
      name: "Triphala",
      benefits: ["Digestive health", "Detoxification", "Antioxidant"],
      bestFor: ["all doshas"],
      usage: "Gentle digestive tonic and cleanser"
    },
    brahmi: {
      name: "Brahmi",
      benefits: ["Mental clarity", "Memory enhancement", "Stress relief"],
      bestFor: ["vata", "pitta"],
      usage: "Brain tonic and nervine"
    }
  },

  // Yoga and Exercise
  yogaPractices: {
    vata: [
      "Gentle, grounding poses",
      "Sun salutations (slow)",
      "Forward bends",
      "Restorative yoga",
      "Pranayama (deep breathing)"
    ],
    pitta: [
      "Cooling poses",
      "Moon salutations",
      "Twists and side bends",
      "Moderate intensity",
      "Sheetali pranayama (cooling breath)"
    ],
    kapha: [
      "Energizing poses",
      "Sun salutations (vigorous)",
      "Backbends and inversions",
      "Power yoga",
      "Kapalabhati pranayama (fire breath)"
    ]
  },

  // Daily Routines (Dinacharya)
  dailyRoutines: {
    morning: {
      universal: [
        "Wake up before sunrise",
        "Drink warm water",
        "Elimination",
        "Oral hygiene",
        "Exercise or yoga",
        "Meditation"
      ],
      vata: ["Oil massage", "Warm shower", "Grounding practices"],
      pitta: ["Cool shower", "Moderate exercise", "Avoid rushing"],
      kapha: ["Vigorous exercise", "Dry brushing", "Energizing practices"]
    },
    evening: {
      universal: [
        "Light dinner before sunset",
        "Gentle activities",
        "Relaxation",
        "Early sleep"
      ],
      vata: ["Warm oil massage", "Calming activities", "Regular sleep time"],
      pitta: ["Cool environment", "Avoid work stress", "Moderate activities"],
      kapha: ["Light activities", "Avoid heavy meals", "Stimulating practices"]
    }
  },

  // Mind-Body Connection
  mentalHealth: {
    vata: {
      practices: ["Meditation", "Grounding exercises", "Regular routine"],
      avoid: ["Overstimulation", "Irregular schedule", "Excessive worry"]
    },
    pitta: {
      practices: ["Cooling meditation", "Stress management", "Nature walks"],
      avoid: ["Perfectionism", "Competitive stress", "Anger triggers"]
    },
    kapha: {
      practices: ["Energizing activities", "New experiences", "Social engagement"],
      avoid: ["Isolation", "Excessive sleep", "Sedentary lifestyle"]
    }
  }
};

module.exports = ayurvedicKnowledge;