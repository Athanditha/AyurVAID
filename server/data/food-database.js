// Comprehensive Ayurvedic Food Database
const foodDatabase = {
  // Grains and Cereals
  grains: {
    rice: {
      name: "Rice (Basmati)",
      tastes: ["sweet"],
      qualities: ["heavy", "oily", "cool"],
      effect: "cooling",
      bestFor: ["pitta", "vata"],
      avoid: ["kapha (in excess)"],
      benefits: ["Easy to digest", "Calming", "Nourishing"],
      preparation: ["Cooked with spices", "Avoid cold rice"]
    },
    wheat: {
      name: "Wheat",
      tastes: ["sweet"],
      qualities: ["heavy", "oily", "cool"],
      effect: "cooling",
      bestFor: ["pitta", "vata"],
      avoid: ["kapha (in excess)"],
      benefits: ["Strengthening", "Nourishing", "Grounding"],
      preparation: ["Fresh bread", "Avoid refined flour"]
    },
    oats: {
      name: "Oats",
      tastes: ["sweet"],
      qualities: ["heavy", "oily", "warm"],
      effect: "warming",
      bestFor: ["vata", "pitta"],
      avoid: ["kapha (in excess)"],
      benefits: ["Heart healthy", "Grounding", "Satisfying"],
      preparation: ["Cooked with milk", "Add warming spices"]
    },
    quinoa: {
      name: "Quinoa",
      tastes: ["sweet", "astringent"],
      qualities: ["light", "dry", "warm"],
      effect: "warming",
      bestFor: ["kapha", "pitta"],
      avoid: ["vata (without oil)"],
      benefits: ["Complete protein", "Light", "Energizing"],
      preparation: ["Cook with ghee", "Add vegetables"]
    }
  },

  // Vegetables
  vegetables: {
    spinach: {
      name: "Spinach",
      tastes: ["sweet", "astringent"],
      qualities: ["light", "dry", "cool"],
      effect: "cooling",
      bestFor: ["pitta", "kapha"],
      avoid: ["vata (raw)"],
      benefits: ["Iron rich", "Detoxifying", "Nutritious"],
      preparation: ["Cooked with spices", "Avoid raw in excess"]
    },
    carrots: {
      name: "Carrots",
      tastes: ["sweet", "pungent"],
      qualities: ["heavy", "oily", "warm"],
      effect: "warming",
      bestFor: ["vata", "pitta"],
      avoid: ["kapha (in excess)"],
      benefits: ["Eye health", "Grounding", "Sweet"],
      preparation: ["Cooked", "Raw in moderation"]
    },
    broccoli: {
      name: "Broccoli",
      tastes: ["astringent", "sweet"],
      qualities: ["light", "dry", "cool"],
      effect: "cooling",
      bestFor: ["pitta", "kapha"],
      avoid: ["vata (raw)"],
      benefits: ["Detoxifying", "Nutritious", "Light"],
      preparation: ["Steamed", "Cooked with oil"]
    },
    sweetPotato: {
      name: "Sweet Potato",
      tastes: ["sweet"],
      qualities: ["heavy", "oily", "warm"],
      effect: "warming",
      bestFor: ["vata", "pitta"],
      avoid: ["kapha (in excess)"],
      benefits: ["Grounding", "Nourishing", "Satisfying"],
      preparation: ["Baked", "Roasted", "Mashed"]
    }
  },

  // Fruits
  fruits: {
    apple: {
      name: "Apple",
      tastes: ["sweet", "astringent"],
      qualities: ["light", "rough", "cool"],
      effect: "cooling",
      bestFor: ["pitta", "kapha"],
      avoid: ["vata (raw, cold)"],
      benefits: ["Digestive", "Cleansing", "Fiber rich"],
      preparation: ["Cooked for vata", "Raw for pitta/kapha"]
    },
    banana: {
      name: "Banana",
      tastes: ["sweet", "astringent"],
      qualities: ["heavy", "oily", "cool"],
      effect: "cooling",
      bestFor: ["pitta", "vata"],
      avoid: ["kapha", "when congested"],
      benefits: ["Energy", "Potassium", "Satisfying"],
      preparation: ["Ripe bananas", "Avoid when sick"]
    },
    mango: {
      name: "Mango",
      tastes: ["sweet", "sour"],
      qualities: ["heavy", "oily", "warm"],
      effect: "warming",
      bestFor: ["vata", "pitta (sweet varieties)"],
      avoid: ["kapha (in excess)"],
      benefits: ["Nourishing", "Vitamin rich", "Satisfying"],
      preparation: ["Ripe fruit", "Avoid unripe"]
    },
    pomegranate: {
      name: "Pomegranate",
      tastes: ["sweet", "astringent", "sour"],
      qualities: ["light", "dry", "cool"],
      effect: "cooling",
      bestFor: ["pitta", "kapha"],
      avoid: ["vata (in excess)"],
      benefits: ["Antioxidant", "Heart healthy", "Cleansing"],
      preparation: ["Fresh seeds", "Juice in moderation"]
    }
  },

  // Spices and Herbs
  spices: {
    ginger: {
      name: "Ginger",
      tastes: ["pungent", "sweet"],
      qualities: ["light", "oily", "hot"],
      effect: "heating",
      bestFor: ["vata", "kapha"],
      avoid: ["pitta (in excess)"],
      benefits: ["Digestive fire", "Anti-inflammatory", "Warming"],
      usage: ["Fresh in cooking", "Tea", "Dried powder"]
    },
    turmeric: {
      name: "Turmeric",
      tastes: ["bitter", "pungent", "astringent"],
      qualities: ["light", "dry", "hot"],
      effect: "heating",
      bestFor: ["kapha", "vata"],
      avoid: ["pitta (in excess)"],
      benefits: ["Anti-inflammatory", "Liver support", "Immune boost"],
      usage: ["Golden milk", "Cooking", "Supplements"]
    },
    cumin: {
      name: "Cumin",
      tastes: ["pungent", "bitter"],
      qualities: ["light", "dry", "warm"],
      effect: "warming",
      bestFor: ["vata", "kapha"],
      avoid: ["pitta (in excess)"],
      benefits: ["Digestive", "Detoxifying", "Cooling for pitta"],
      usage: ["Roasted seeds", "Ground spice", "Tea"]
    },
    coriander: {
      name: "Coriander",
      tastes: ["sweet", "astringent", "bitter"],
      qualities: ["light", "oily", "cool"],
      effect: "cooling",
      bestFor: ["pitta", "vata"],
      avoid: ["kapha (in excess)"],
      benefits: ["Cooling", "Digestive", "Detoxifying"],
      usage: ["Fresh leaves", "Seeds", "Ground spice"]
    }
  },

  // Proteins
  proteins: {
    mungBeans: {
      name: "Mung Beans",
      tastes: ["sweet", "astringent"],
      qualities: ["light", "dry", "cool"],
      effect: "cooling",
      bestFor: ["all doshas"],
      avoid: ["none"],
      benefits: ["Easy to digest", "Protein rich", "Detoxifying"],
      preparation: ["Soaked and cooked", "Kitchari", "Sprouted"]
    },
    chickpeas: {
      name: "Chickpeas",
      tastes: ["sweet", "astringent"],
      qualities: ["heavy", "dry", "warm"],
      effect: "warming",
      bestFor: ["vata", "pitta"],
      avoid: ["kapha (in excess)"],
      benefits: ["Protein rich", "Fiber", "Satisfying"],
      preparation: ["Well cooked", "Soaked overnight", "With spices"]
    },
    almonds: {
      name: "Almonds",
      tastes: ["sweet"],
      qualities: ["heavy", "oily", "warm"],
      effect: "warming",
      bestFor: ["vata", "pitta"],
      avoid: ["kapha (in excess)"],
      benefits: ["Brain food", "Healthy fats", "Protein"],
      preparation: ["Soaked and peeled", "Almond milk", "Ground paste"]
    }
  },

  // Dairy
  dairy: {
    milk: {
      name: "Milk (Cow)",
      tastes: ["sweet"],
      qualities: ["heavy", "oily", "cool"],
      effect: "cooling",
      bestFor: ["vata", "pitta"],
      avoid: ["kapha", "when congested"],
      benefits: ["Nourishing", "Calming", "Building"],
      preparation: ["Warm with spices", "Avoid cold", "Organic preferred"]
    },
    ghee: {
      name: "Ghee (Clarified Butter)",
      tastes: ["sweet"],
      qualities: ["oily", "warm", "light"],
      effect: "warming",
      bestFor: ["vata", "pitta"],
      avoid: ["kapha (in excess)"],
      benefits: ["Digestive fire", "Nourishing", "Lubricating"],
      usage: ["Cooking medium", "Medicine carrier", "Small amounts"]
    },
    yogurt: {
      name: "Yogurt",
      tastes: ["sweet", "sour"],
      qualities: ["heavy", "oily", "warm"],
      effect: "heating",
      bestFor: ["vata"],
      avoid: ["kapha", "pitta", "evening"],
      benefits: ["Probiotics", "Protein", "Digestive"],
      preparation: ["Fresh", "Room temperature", "With spices"]
    }
  },

  // Meal Combinations
  mealCombinations: {
    vataBalancing: {
      breakfast: ["Warm oatmeal with ghee and dates", "Herbal tea"],
      lunch: ["Kitchari with vegetables", "Warm water"],
      dinner: ["Soup with bread", "Warm milk with spices"],
      snacks: ["Soaked almonds", "Sweet fruits"]
    },
    pittaBalancing: {
      breakfast: ["Cool cereal with milk", "Coconut water"],
      lunch: ["Rice with cooling vegetables", "Buttermilk"],
      dinner: ["Light soup", "Herbal tea"],
      snacks: ["Sweet fruits", "Coconut"]
    },
    kaphaBalancing: {
      breakfast: ["Light breakfast", "Ginger tea"],
      lunch: ["Spiced vegetables with quinoa", "Warm water"],
      dinner: ["Light soup", "Herbal tea"],
      snacks: ["Fruits", "Herbal teas"]
    }
  },

  // Food Combining Rules
  foodCombining: {
    avoid: [
      "Milk with sour fruits",
      "Fish with milk",
      "Hot and cold foods together",
      "Fresh fruit with meals",
      "Honey when heated"
    ],
    good: [
      "Grains with vegetables",
      "Proteins with vegetables",
      "Similar tastes together",
      "Warm foods in cold weather",
      "Light foods in evening"
    ]
  }
};

module.exports = foodDatabase;