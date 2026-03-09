// Comprehensive Dosha Assessment Questions
const doshaQuestions = [
  {
    id: 1,
    category: "Physical Constitution",
    question: "How would you describe your body frame?",
    options: [
      { text: "Thin, light, small-boned", dosha: "vata", weight: 3 },
      { text: "Medium build, moderate weight", dosha: "pitta", weight: 3 },
      { text: "Large frame, heavy, well-built", dosha: "kapha", weight: 3 }
    ]
  },
  {
    id: 2,
    category: "Physical Constitution",
    question: "How is your skin typically?",
    options: [
      { text: "Dry, rough, cool, thin", dosha: "vata", weight: 2 },
      { text: "Warm, oily, soft, medium thickness", dosha: "pitta", weight: 2 },
      { text: "Thick, oily, cool, smooth", dosha: "kapha", weight: 2 }
    ]
  },
  {
    id: 3,
    category: "Physical Constitution",
    question: "How is your hair?",
    options: [
      { text: "Dry, brittle, thin", dosha: "vata", weight: 2 },
      { text: "Fine, soft, early graying/balding", dosha: "pitta", weight: 2 },
      { text: "Thick, oily, wavy, lustrous", dosha: "kapha", weight: 2 }
    ]
  },
  {
    id: 4,
    category: "Digestion & Appetite",
    question: "How is your appetite?",
    options: [
      { text: "Variable, sometimes forget to eat", dosha: "vata", weight: 3 },
      { text: "Strong, get irritable when hungry", dosha: "pitta", weight: 3 },
      { text: "Steady, can skip meals easily", dosha: "kapha", weight: 3 }
    ]
  },
  {
    id: 5,
    category: "Digestion & Appetite",
    question: "How is your digestion?",
    options: [
      { text: "Irregular, gas, bloating", dosha: "vata", weight: 3 },
      { text: "Strong, quick, sometimes loose stools", dosha: "pitta", weight: 3 },
      { text: "Slow, heavy feeling after meals", dosha: "kapha", weight: 3 }
    ]
  },
  {
    id: 6,
    category: "Mental & Emotional",
    question: "How do you handle stress?",
    options: [
      { text: "Worry, anxiety, restlessness", dosha: "vata", weight: 3 },
      { text: "Anger, irritability, impatience", dosha: "pitta", weight: 3 },
      { text: "Calm, withdrawn, depression", dosha: "kapha", weight: 3 }
    ]
  },
  {
    id: 7,
    category: "Mental & Emotional",
    question: "How is your memory?",
    options: [
      { text: "Quick to learn, quick to forget", dosha: "vata", weight: 2 },
      { text: "Sharp, clear, focused", dosha: "pitta", weight: 2 },
      { text: "Slow to learn, good retention", dosha: "kapha", weight: 2 }
    ]
  },
  {
    id: 8,
    category: "Sleep & Energy",
    question: "How is your sleep?",
    options: [
      { text: "Light, interrupted, 5-7 hours", dosha: "vata", weight: 3 },
      { text: "Sound, moderate, 6-8 hours", dosha: "pitta", weight: 3 },
      { text: "Deep, long, 8+ hours", dosha: "kapha", weight: 3 }
    ]
  },
  {
    id: 9,
    category: "Sleep & Energy",
    question: "When is your energy highest?",
    options: [
      { text: "Comes in bursts, then crashes", dosha: "vata", weight: 2 },
      { text: "Steady throughout the day", dosha: "pitta", weight: 2 },
      { text: "Slow to start, steady once going", dosha: "kapha", weight: 2 }
    ]
  },
  {
    id: 10,
    category: "Weather & Environment",
    question: "What weather do you prefer?",
    options: [
      { text: "Warm, humid, calm", dosha: "vata", weight: 2 },
      { text: "Cool, well-ventilated", dosha: "pitta", weight: 2 },
      { text: "Warm, dry, breezy", dosha: "kapha", weight: 2 }
    ]
  },
  {
    id: 11,
    category: "Physical Activity",
    question: "How do you approach exercise?",
    options: [
      { text: "Enjoy variety, get bored easily", dosha: "vata", weight: 2 },
      { text: "Competitive, intense workouts", dosha: "pitta", weight: 2 },
      { text: "Prefer steady, consistent routine", dosha: "kapha", weight: 2 }
    ]
  },
  {
    id: 12,
    category: "Communication",
    question: "How do you communicate?",
    options: [
      { text: "Talk fast, jump topics", dosha: "vata", weight: 2 },
      { text: "Precise, direct, convincing", dosha: "pitta", weight: 2 },
      { text: "Slow, thoughtful, gentle", dosha: "kapha", weight: 2 }
    ]
  }
];

module.exports = doshaQuestions;