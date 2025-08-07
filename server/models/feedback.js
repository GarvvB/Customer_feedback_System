const mongoose = require("mongoose");

const feedbackSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
    },
    message: {
        type: String,
        required: true,
    },
    sentiment: {
        type: String,
        default: "pending",
    },
},
{ timestamps: true }
);

module.exports = mongoose.model("Feedback", feedbackSchema);