const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

async function test() {
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    // Since ListModels is not easily exposed in the standard simple SDK without specific calls,
    // let's try gemini-pro which is the legacy name, or just do a standard fetch manually
    
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`);
    const data = await response.json();
    console.log(data.models.map(m => m.name));
  } catch (error) {
    console.error('Error:', error.message);
  }
}

test();
