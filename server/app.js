const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json()); // to parse JSON

// ✅ Add this line to test route hit
app.get("/api/test", (req, res) => {
  res.json({ message: "API is working!" });
});

// ✅ Connect the feedback routes
const feedbackRoutes = require("./routes/feedbackRoutes");
app.use("/api", feedbackRoutes);

const llamaRoutes = require('./routes/llamaRoutes');
app.use('/api', llamaRoutes);

// DB + Server Start
mongoose.connect(process.env.MONGO_URI).then(() => {
  console.log("✅ Connected to MongoDB");
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
}).catch((err) => {
  console.error("❌ MongoDB connection error:", err);
});
