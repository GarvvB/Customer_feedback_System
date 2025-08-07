const express = require('express');
const router = express.Router();
const {
    submitFeedback,
    getAllFeedbacks,
} = require("../controllers/feedbackController");

router.post("/feedback", submitFeedback);
router.get("/feedbacks", getAllFeedbacks);

module.exports = router;