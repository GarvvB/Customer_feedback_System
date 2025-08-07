const express = require('express');
const axios = require('axios');
const router = express.Router();

router.post("/summarize", async (req, res) => {
    const { message } = req.body;
    if (!message) return res.status(400).json({ error: "Message is required" });

    try {
        const response = await axios.post(
            "https://api.together.xyz/v1/chat/completions", // Correct endpoint
            {
                model: "meta-llama/Llama-3-8b-chat-hf",
                messages: [
                    { role: "system", content: "You are an AI summarizer." },
                    { role: "user", content: `Summarize this customer feedback: "${message}"` },
                ],
                temperature: 0.5,
                max_tokens: 100,
            },
            {
                headers: {
                    Authorization: `Bearer ${process.env.TOGETHER_API_KEY}`, // ✅ Correct interpolation
                    "Content-Type": "application/json",
                },
            }
        );

        const aiResponse = response.data.choices?.[0]?.message?.content;
        res.json({ summary: aiResponse });

    } catch (err) {
        console.error("AI summarization error:", err.response?.data || err.message);
        res.status(500).json({ error: "Failed to summarize feedback." });
    }
});

module.exports = router;