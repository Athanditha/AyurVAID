require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function test() {
  try {
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      systemInstruction: "You are a test"
    });
    const chat = model.startChat({ history: [] });
    const result = await chat.sendMessage("hello");
    console.log("Success:", result.response.text());
  } catch(e) {
    console.error("Failure:", e);
  }
}
test();
