const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

async function test() {
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash",
      systemInstruction: "You are an Ayurvedic assistant. The user wants to know what to eat. Respond normally."
    });
    
    console.log("Sending prompt to Gemini...");
    const result = await model.generateContent("what should i eat");
    const response = await result.response;
    const text = response.text();
    
    console.log("\n--- Gemini Response ---");
    console.log(text);
    console.log("-----------------------");
  } catch (error) {
    console.error('Error:', error.message);
  }
}

test();
