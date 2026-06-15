# AyurVAID - Premium Ayurvedic Health Intelligence 🌿✨

AyurVAID is a premium, state-of-the-art AI-powered health intelligence system. It blends ancient Ayurvedic principles with modern machine learning (CatBoost) and generative AI (Google Gemini) to deliver comprehensive dosha analysis, Explainable AI (xAI) diagnostics, and personalized wellness recommendations through a Retrieve-Augmented Generation (RAG) architecture.

---

## 🛠️ Installation & Setup

Follow these steps to configure and run the AyurVAID ecosystem locally.

### Prerequisites
- **Node.js** (v18.x or higher)
- **Python** (v3.10.x or higher)
- **Firebase Project**: A Firestore database setup with a service account JSON credential.
- **Gemini API Key**: A valid key from Google AI Studio.

---

### Step 1: Install Dependencies
From the project root, run the monorepo installer to configure Node packages for the root and the Next.js client, and install the required Python libraries.

```bash
# Install Node dependencies globally & for client
npm run install-all
```

For Python specifically, it is recommended to set up a virtual environment inside the Python directory:
```bash
cd server/python
python -m venv venv

# On Windows (PowerShell)
.\venv\Scripts\Activate.ps1
# On macOS/Linux
source venv/bin/activate

# Install ML requirements
pip install -r requirements.txt
cd ../..
```

---

### Step 2: Seed the Local Ayurvedic Knowledge Base
Seed the RAG search database by downloading the validated Ayurvedic herb, formulation, and clinical principle datasets:
```bash
node scripts/build_knowledge_base.js
```
This script pulls structural files directly from verified open-source repositories and saves them to `server/data/`.

---

### Step 3: Configure Environment Variables
Copy `.env.example` to `.env` in the project root:
```bash
cp .env.example .env
```

Edit the `.env` file to configure your active keys and variables:
```env
PORT=3001
NODE_ENV=development
JWT_SECRET=your_jwt_secret_token_here

# AI Provider Configurations
AI_PROVIDER=gemini # Option: gemini or custom
GEMINI_API_KEY=AIzaSy... # Your Google Gemini API Key

# Python FastAPI Link (defaults to port 8000)
PYTHON_API_URL=http://127.0.0.1:8000
```

---

### Step 4: Configure Firebase Database
1. Go to your **Firebase Console** > **Project Settings** > **Service Accounts**.
2. Click **Generate new private key**.
3. Save the downloaded JSON file in the `/server` directory under the name:
   `firebase-service-account.json`
*Note: This file contains secret credentials and is already added to `.gitignore` to prevent leaks.*

---

### Step 5: Train the CatBoost Classifier Model
Before predictions can be made, you must train the machine learning classifier using the dataset provided:
```bash
# Ensure your virtual environment is active
python server/python/catboost_model.py
```
This trains the model, tests its accuracy, and generates joblib serializations in `server/python/models/catboost/`.

---

## ⚙️ Running the Application

### Development Mode (Concurrent)
To boot up the Next.js frontend, Node.js server, and FastAPI Python server simultaneously:
```bash
npm run dev
```
- **Next.js Client**: `http://localhost:3000`
- **Express Backend API**: `http://localhost:3001`
- **FastAPI ML API**: `http://localhost:8000`

---

### Production Mode
To compile the client bundle and serve it efficiently via Node:
```bash
# Build Next.js Static Files
npm run build

# Start production server
npm start
```