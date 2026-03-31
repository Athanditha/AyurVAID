// Complete ML-based Assessment Questions derived from the 25 features in Prakriti Dataset
const doshaQuestions = [
  {
    id: 1, category: "Physical Constitution", csvColumn: "Body Frame",
    question: "How would you describe your body frame?",
    options: [
      { text: "Well Built", value: "Well Built" },
      { text: "Thin and Lean", value: "Thin and Lean" },
      { text: "Medium", value: "Medium" }
    ]
  },
  {
    id: 2, category: "Physical Constitution", csvColumn: "Type of Hair",
    question: "How is the typical texture of your hair?",
    options: [
      { text: "Dry", value: "Dry" },
      { text: "Normal", value: "Normal" },
      { text: "Greasy", value: "Greasy" }
    ]
  },
  {
    id: 3, category: "Physical Constitution", csvColumn: "Color of Hair",
    question: "What is your natural hair color?",
    options: [
      { text: "Black", value: "Black" },
      { text: "Brown", value: "Brown" },
      { text: "Grey/Early Greying", value: "Grey" }
    ]
  },
  {
    id: 4, category: "Physical Constitution", csvColumn: "Skin",
    question: "How would you describe your skin type?",
    options: [
      { text: "Soft, prone to sweating", value: "Soft,Sweating" },
      { text: "Moist, greasy", value: "Moist,Greasy" },
      { text: "Dry, rough", value: "Dry,Rough" }
    ]
  },
  {
    id: 5, category: "Physical Constitution", csvColumn: "Complexion",
    question: "What is your natural complexion/tone?",
    options: [
      { text: "Pinkish", value: "Pinkish" },
      { text: "Dark", value: "Dark" },
      { text: "Glowing", value: "Glowing" }
    ]
  },
  {
    id: 6, category: "Physical Constitution", csvColumn: "Body Weight",
    question: "How would you categorize your current body weight?",
    options: [
      { text: "Underweight / Hard to gain", value: "Underweight" },
      { text: "Normal / Maintains easily", value: "Normal" },
      { text: "Overweight / Easy to gain", value: "Overweight" }
    ]
  },
  {
    id: 7, category: "Physical Constitution", csvColumn: "Nails",
    question: "What is the general appearance of your nails?",
    options: [
      { text: "Pinkish", value: "Pinkish" },
      { text: "Reddish", value: "Redish" },
      { text: "Blackish / Brittle", value: "Blackish" }
    ]
  },
  {
    id: 8, category: "Physical Constitution", csvColumn: "Size and Color of the Teeth",
    question: "How are your teeth?",
    options: [
      { text: "Large, White", value: "Large,White" },
      { text: "Medium, Yellowish", value: "Medium,Yellowish" },
      { text: "Irregular, Blackish", value: "Irregular,Blackish" }
    ]
  },
  {
    id: 9, category: "Behavior & Activity", csvColumn: "Pace of Performing Work",
    question: "What is your typical pace when performing tasks?",
    options: [
      { text: "Fast and quick", value: "Fast" },
      { text: "Medium and steady", value: "Medium" },
      { text: "Slow and methodical", value: "Slow" }
    ]
  },
  {
    id: 10, category: "Mental Nature", csvColumn: "Mental Activity",
    question: "How is your mental activity on average?",
    options: [
      { text: "Aggressive / Highly active", value: "Aggressive" },
      { text: "Restless / Overthinking", value: "Restless" },
      { text: "Stable / Calm", value: "Stable" }
    ]
  },
  {
    id: 11, category: "Mental Nature", csvColumn: "Memory",
    question: "What type of memory describes you best?",
    options: [
      { text: "Good Memory (overall)", value: "Good Memory" },
      { text: "Long Term (slow to learn, retains forever)", value: "Long Term" },
      { text: "Short Term (quick to learn, quick to forget)", value: "Short term" }
    ]
  },
  {
    id: 12, category: "Sleep & Energy", csvColumn: "Sleep Pattern",
    question: "How is your typical sleep pattern?",
    options: [
      { text: "Sleepy (Heavy sleeper)", value: "Sleepy" },
      { text: "Moderate (Sound sleeper)", value: "Moderate" },
      { text: "Less (Light/interrupted sleep)", value: "Less" }
    ]
  },
  {
    id: 13, category: "Environment", csvColumn: "Weather Conditions",
    question: "Which weather condition do you dislike the most?",
    options: [
      { text: "Dislike Heat", value: "Dislike Heat" },
      { text: "Dislike Moist/Humid", value: "Dislike Moist" },
      { text: "Dislike Cold", value: "Dislike Cold" }
    ]
  },
  {
    id: 14, category: "Mental & Emotional", csvColumn: "Reaction under Adverse Situations",
    question: "How do you typically react to stress or adverse situations?",
    options: [
      { text: "Anger / Irritability", value: "Anger" },
      { text: "Calm / Withdrawn", value: "Calm" },
      { text: "Anxiety / Worry", value: "Anxiety" }
    ]
  },
  {
    id: 15, category: "Mental & Emotional", csvColumn: "Mood",
    question: "How would you describe your general mood changes?",
    options: [
      { text: "Changes Quickly", value: "Changes Quickly" },
      { text: "Constant / Stable", value: "Constant" },
      { text: "Changes Slowly", value: "Changes Slowly" }
    ]
  },
  {
    id: 16, category: "Digestion & Diet", csvColumn: "Eating Habit",
    question: "How is your typical eating habit or chewing pattern?",
    options: [
      { text: "Irregular Chewing", value: "Irregular Chewing" },
      { text: "Improper/Fast Chewing", value: "Improper Chewing" },
      { text: "Proper/Slow Chewing", value: "Proper Chewing" }
    ]
  },
  {
    id: 17, category: "Digestion & Diet", csvColumn: "Hunger",
    question: "How do you experience hunger?",
    options: [
      { text: "Often skip meals without issue", value: "Skips Meal" },
      { text: "Sudden and sharp hunger", value: "Sudden and Sharp" },
      { text: "Irregular hunger cues", value: "Irregular" }
    ]
  },
  {
    id: 18, category: "Physical Constitution", csvColumn: "Body Temperature",
    question: "How does your body temperature generally feel?",
    options: [
      { text: "Less than Normal (Usually feel cold)", value: "Less than Normal" },
      { text: "Normal", value: "Normal" },
      { text: "More than Normal (Usually feel hot)", value: "More than Normal" }
    ]
  },
  {
    id: 19, category: "Physical Constitution", csvColumn: "Joints",
    question: "How would you describe your joints?",
    options: [
      { text: "Weak / Cracking", value: "Weak" },
      { text: "Heavy / Large", value: "Heavy" },
      { text: "Healthy / Moderate", value: "Healthy" }
    ]
  },
  {
    id: 20, category: "Mental & Emotional", csvColumn: "Nature",
    question: "Which traits best describe your underlying nature?",
    options: [
      { text: "Forgiving, Grateful", value: "Forgiving,Grateful" },
      { text: "Jealous, Fearful", value: "Jealous,Fearful" },
      { text: "Egoistic, Fearless", value: "Egoistic,Fearless" }
    ]
  },
  {
    id: 21, category: "Sleep & Energy", csvColumn: "Body Energy",
    question: "What is your typical energy level throughout the day?",
    options: [
      { text: "High energy / Bursts of energy", value: "High" },
      { text: "Medium / Steady energy", value: "Medium" },
      { text: "Low / Slow to get going", value: "Low" }
    ]
  },
  {
    id: 22, category: "Physical Constitution", csvColumn: "Quality of Voice",
    question: "How would you describe the quality of your voice?",
    options: [
      { text: "Deep", value: "Deep" },
      { text: "Fast / High-pitched", value: "Fast" },
      { text: "Rough / Hoarse", value: "Rough" }
    ]
  },
  {
    id: 23, category: "Mental & Emotional", csvColumn: "Dreams",
    question: "What themes appear most often in your dreams?",
    options: [
      { text: "Sky, flying, wind", value: "Sky" },
      { text: "Fire, light, action", value: "Fire" },
      { text: "Water, romance, emotion", value: "Water" }
    ]
  },
  {
    id: 24, category: "Behavior & Activity", csvColumn: "Social Relations",
    question: "How are your social relations?",
    options: [
      { text: "Ambivert (Balanced)", value: "Ambivert" },
      { text: "Introvert (Reserved)", value: "Introvert" },
      { text: "Extrovert (Outgoing)", value: "Extrovert" }
    ]
  },
  {
    id: 25, category: "Physical Constitution", csvColumn: "Body Odor",
    question: "How would you describe your natural body odor on average?",
    options: [
      { text: "Strong", value: "Strong" },
      { text: "Negligible", value: "Negligible" },
      { text: "Mild", value: "Mild" }
    ]
  }
];

module.exports = doshaQuestions;