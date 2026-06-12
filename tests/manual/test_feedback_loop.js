const axios = require('axios');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function testFeedbackLoop() {
  const baseURL = 'http://localhost:3001';
  try {
    console.log("1. Registering test user...");
    const email = `testuser@test.com`;
    const regRes = await axios.post(`${baseURL}/api/auth/register`, {
      firstName: 'Test',
      lastName: 'User',
      email: email,
      password: 'password123'
    });
    const token = regRes.data.token;
    console.log("✅ User registered and token received.");

    console.log("\n2. Saving mock dosha assessment...");
    await axios.post(`${baseURL}/api/profile/store`, {
      analysis: {
        primary: 'vata',
        secondary: 'pitta',
        scores: { vata: 50, pitta: 30, kapha: 20 },
        constitutionType: 'Vata-Pitta'
      }
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log("✅ Dosha assessment saved.");
    
    console.log("\n3. Switching AI provider to 'custom' (rule-based engine)...");
    await axios.post(`${baseURL}/api/chat/switch-provider`, {
      provider: 'custom'
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log("✅ Switched to custom provider.");

    console.log("\n4. Sending a chat message...");
    const chatRes = await axios.post(`${baseURL}/api/chat/message`, {
      message: 'What should I eat?'
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    const conversationId = chatRes.data.conversationId;
    // Note: API might not return messageId directly, we use a mock one for testing
    const messageId = Date.now().toString() + '_mock_msg'; 
    console.log(`✅ Message sent. Received conversationId: ${conversationId}`);

    console.log("\n5. Sending positive feedback...");
    const feedbackRes = await axios.post(`${baseURL}/api/chat/feedback`, {
      conversationId: conversationId,
      messageId: messageId,
      feedback: 'positive',
      rating: 5,
      comment: 'Very helpful rule-based advice.'
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log("✅ Feedback Response:", feedbackRes.data);

    // Let's read the file to confirm
    const feedbackPath = path.join(__dirname, 'server', 'data', 'rule_based_feedback.json');
    if (fs.existsSync(feedbackPath)) {
      const data = JSON.parse(fs.readFileSync(feedbackPath, 'utf8'));
      console.log("\n--- Content of rule_based_feedback.json ---");
      console.log(JSON.stringify(data[data.length - 1], null, 2));
      console.log("-------------------------------------------");
    }

    console.log("\n🎉 Testing completed successfully!");
  } catch (error) {
    console.error("❌ Test failed:", error.response ? error.response.data : error.message);
  }
}

testFeedbackLoop();
