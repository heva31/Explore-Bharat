const express = require('express');
const router = express.Router();

const fetch = require('node-fetch');
global.fetch = fetch;
global.Headers = fetch.Headers;
global.Request = fetch.Request;
global.Response = fetch.Response;

const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

// Initialize conversation history
let conversationHistory = [];

router.route("/")
.get((req, res) => {
    res.render("pages/chatbot");
})
.post(async (req, res) => {
    const userMessage = req.body.message;

    // Append user's message to the conversation history
    conversationHistory.push({ role: 'user', content: userMessage });

    // Create a single prompt with the full conversation history
    const promptWithHistory = conversationHistory.map((msg) => {
        return `${msg.role === 'user' ? 'You' : 'AI'}: ${msg.content}`;
    }).join('\n') + '\nAI:';

    try {
        const result = await model.generateContent(promptWithHistory);
        const aiResponse = result.response.text();

        // Append AI's response to the conversation history
        conversationHistory.push({ role: 'ai', content: aiResponse });

        res.json({ response: aiResponse });
    } catch (err) {
        console.error("Error generating AI response:", err);
        const errorResponse = process.env.NODE_ENV === 'development'
        ? `Error: ${err.message}`
        : 'Sorry, something went wrong with the AI response.';

        res.status(500).json({ response: errorResponse });
    }
});

router.post("/clear", (req, res) => {
    conversationHistory = [];
    res.sendStatus(200); 
});

module.exports = router;