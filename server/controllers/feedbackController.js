const Feedback = require('../models/feedback');

// @desc POST /api/feedback
const submitFeedback = async (req, res) => {
    try{
        const { name, email, message } = req.body;
        if (!name || ! message){
            return res.status(400).json({ error: "Name and message are required."});
        }
        const newFeedback = new Feedback({ name, email, message });
        await newFeedback.save();
        res.status(201).json({ message: "Feedback submitted successfully." });
    } catch (err) {
        console.error("Error saving feedback:", err);
        res.status(500).json({ error: "Server error" });
    }
};

// @desc GET /api/feedback
const getAllFeedbacks = async (req, res) => {
    try {
        const feedbacks = await Feedback.find().sort({ createdAt: -1 });
        res.json(feedbacks);
    } catch (err) {
        console.error("Error fetching feedbacks:", err);
        res.status(500).json({ error: "Server error" });
    }
};

module.exports = { submitFeedback, getAllFeedbacks };