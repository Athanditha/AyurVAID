# AyurVAID Data Acquisition & Preprocessing Report

> **Official Citations & Sources**
> - **Herbs & Principles (`herbs.json`, `principles.json`)**: Sourced from *Amidha Ayurveda* (https://www.amidhaayurveda.com/) via Open-Source artifacts curated by GitHub user `sciencewithsaucee-sudo`.
> - **Traditional Medicinal Catalog (`medicines.json`)**: Exported from a Tamil Siddha Medicine database hosted by GitHub user `kuralamuthan300`.
> - **Dosha Classification Dataset (`ayurvedic_dosha_dataset (1).csv`)**: Patient characteristics and dosha matrices obtained from Kaggle's open healthcare datasets.
> - **Rule-based & Hardcoded Frameworks**: Rooted in translations of classical Sanskrit texts (*Ashtanga Hridaya*, *Charaka Samhita*, *Sushruta Samhita*) and classical dietary texts (*Ahara Vijnana*).

## Table of Contents
- [1. Overview of Data Origins](#1-overview-of-data-origins)
- [2. Step-by-Step Acquisition Pipeline](#2-step-by-step-acquisition-pipeline)
- [3. Preprocessing RAG Datasets (JSON)](#3-preprocessing-rag-datasets-json)
- [4. Preprocessing the Machine Learning Matrices (CSV)](#4-preprocessing-the-machine-learning-matrices-csv)

---

## 1. Overview of Data Origins

The AyurVAID ecosystem relies on a multidimensional data architecture encompassing classical Ayurvedic philosophy, structured botanical monographs, and patient constitution (Prakriti) matrices. This document outlines exactly how these datasets were sourced, aggregated, and meticulously preprocessed.

Instead of deploying a headless browser to actively scrape external endpoints in real time, the application architecture opts for a **centralized artifact aggregation strategy**. Open-source contributors had previously scraped data from portals arrayed across traditional medicinal databases (such as *Amidha Ayurveda* and *Siddha lineage repositories*). AyurVAID downloads these sanitized JSON artifacts during its build process.

---

## 2. Step-by-Step Acquisition Pipeline

The core acquisition logic is governed by `build_knowledge_base.js`. This script acts as an HTTP pipeline that extracts the datasets from specific raw GitHub user content domains into the local `server/data/` environment.

### Source Code: The Download Mechanism
```javascript
const DATASETS = [
  {
    name: 'herbs.json',
    url: 'https://raw.githubusercontent.com/sciencewithsaucee-sudo/herb-database/main/herb.json'
  },
  {
    name: 'principles.json',
    url: 'https://raw.githubusercontent.com/sciencewithsaucee-sudo/Siddhanta-Kosha/main/Siddhanta-Kosha.json'
  },
  {
    name: 'medicines.json',
    url: 'https://raw.githubusercontent.com/kuralamuthan300/ayurvedic-medicine-catalogue/master/Database.json'
  }
];

async function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      const file = fs.createWriteStream(dest);
      res.pipe(file); // Actively piping the open-source scraped DBs
      file.on('finish', () => {
        file.close();
        resolve();
      });
    }).on('error', reject);
  });
}
```

---

## 3. Preprocessing RAG Datasets (JSON)

Once the JSON structures (`herbs.json`, `medicines.json`, `principles.json`) hit the local system, the `server/services/KnowledgeBase.js` orchestrator processes the data into memory. 

### Resolving Architectural Inconsistencies
Not all scraped datasets follow identical formats. For example, `medicines.json` originally derives from a NoSQL array mapping (likely Firebase) meaning it downloads as an isolated object matrix. The system flattens and normalizes this using `Object.entries`.

### Source Code: Normalization & Memory Ingestion
```javascript
const medicinesRaw = JSON.parse(fs.readFileSync(path.join(dataDir, 'medicines.json'), 'utf8'));

// Normalizing NoSQL nested objects to standard Arrays
if (medicinesRaw.Medicine) {
  this.medicines = Object.entries(medicinesRaw.Medicine).map(([key, val]) => ({
    name: val.plantname || key,
    preview: `Botanical: ${val.botanicalname}. Uses: ${val.therapeuticuses}. Dosage: ${val.dosage}. Part: ${val.parts}.`,
    ...val
  }));
}
```

### Search Preprocessing and Keyword Disambiguation
Once normalized, the internal Retrieval-Augmented Generation (RAG) system doesn't just string-match—it actively scores targets using a custom NLP keyword weighting algorithm that respects Dosha pacification.

The exact keywords applied to explicitly identify context are lowercased sequences longer than 2 characters (`filter(k => k.length > 2)`). If a user specifically mentions `vata`, `pitta`, or `kapha`, the array is re-sorted to aggressively penalize herbs that don't historically pacify that Dosha.

### Source Code: The Keyword NLP Weighting Engine
```javascript
// --- DOSHA DISAMBIGUATION ---
const queryLower = query.toLowerCase();
const doshas = ['vata', 'pitta', 'kapha'];
const mentionedDoshas = doshas.filter(d => queryLower.includes(d));

if (mentionedDoshas.length > 0) {
  const itemPacifies = (item.data.pacify || "").toString().toLowerCase();
  const pacifiesTarget = mentionedDoshas.some(d => itemPacifies.includes(d));
  
  if (pacifiesTarget) {
    score += 10; // Massive boost for herbs that balance the user's mentioned Dosha
  } else if (mentionedDoshas.some(d => itemText.includes(d))) {
    score += 3; // Minor boost if the text mentions the Dosha
  } else {
    score -= 5; // Penalty for herbs that don't match the specific Dosha query
  }
}
```

---

## 4. Preprocessing the Machine Learning Matrices (CSV)

Beyond the literature database, the application trains a CatBoost Predictive model on `datasets/ayurvedic_dosha_dataset (1).csv` tracking physical characteristics. This data was initially scraped and hosted via Kaggle before being committed to the repo. 

### Data Scrubbing & Encoding (`server/python/catboost_model.py`)

1. **Whitespace Normalization**: The Kaggle dataset contains irregular spaces around column headers and nested string features. A lambda sequence strips these.
2. **Label Encoding**: Since CatBoost expects vectorized numeric representations or explicitly typed categories, all 25 features are swept via `sklearn.preprocessing.LabelEncoder`.

### Source Code: Lexical Normalization & Label Encoding
```python
# Clean the dataset: remove leading and trailing white spaces
df.columns = df.columns.str.strip()
df = df.apply(lambda x: x.str.strip() if x.dtype == "object" else x)

# Initialize a dictionary to keep track of encoders mapping text -> numbers
feature_encoders = {}
X_encoded = pd.DataFrame()

# Apply numerical mappings to the 25 input keywords (Size of teeth, Complexion, etc)
for col in feature_cols:
    le = LabelEncoder()
    X_encoded[col] = le.fit_transform(X[col].astype(str))
    feature_encoders[col] = le
```

### Exact Features Evaluated (The 25 Keywords)
The dataset isolates exactly 25 physiological keywords evaluated down to the minute detail:
- Body Frame
- Type of Hair
- Color of Hair
- Skin
- Complexion
- Body Weight
- Nails
- Size and Color of the Teeth
- Pace of Performing Work
- Mental Activity
- Memory
- Sleep Pattern
- Weather Conditions
- Reaction under Adverse Situations
- Mood
- Eating Habit
- Hunger
- Body Temperature
- Joints
- Nature
- Body Energy
- Quality of Voice
- Dreams
- Social Relations
- Body Odor

Each of these attributes maps symmetrically across the trained algorithm to dictate the overriding Prakriti (Vata, Pitta, Kapha) constitution mapping logic.
