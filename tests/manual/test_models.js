require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function listModels() {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  // The SDK doesn't have a direct listModels, but we can try to use one and see
  console.log("Checking model availability...");
  try {
    const model = genAI.getGenerativeModel({ model: "text-embedding-004" });
    await model.embedContent("test");
    console.log("text-embedding-004 is available");
  } catch (e) {
    console.log("text-embedding-004 failed:", e.message);
    try {
      const model = genAI.getGenerativeModel({ model: "embedding-001" });
      await model.embedContent("test");
      console.log("embedding-001 is available");
    } catch (e2) {
      console.log("embedding-001 failed:", e2.message);
    }
  }
}

listModels();
