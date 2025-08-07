import React, { useEffect, useState } from "react";
import axios from "axios";

const FeedbackList = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [summary, setSummary] = useState("");
  const [loadingSummary, setLoadingSummary] = useState(false);

  useEffect(() => {
    const fetchFeedbacks = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/feedbacks");
        setFeedbacks(response.data);
      } catch (error) {
        console.error("Error fetching feedbacks:", error);
      }
    };

    fetchFeedbacks();
  }, []);

const handleSummarize = async () => {
  setLoadingSummary(true);
  try {
    // Combine all feedback messages into one string
    const combinedMessages = feedbacks.map(fb => fb.message).join("\n");

  const response = await axios.post("http://localhost:5000/api/summarize", {
    message: combinedMessages, // ✅ send message in request body
  });

    setSummary(response.data.summary);
  } catch (error) {
    console.error("Error summarizing feedback:", error);
    setSummary("Failed to generate summary.");
  } finally {
    setLoadingSummary(false);
  }
};


  return (
    <div style={{ maxWidth: "700px", margin: "auto", padding: "20px" }}>
      <h2>📋 All Feedback</h2>
      {feedbacks.length === 0 ? (
        <p>No feedback submitted yet.</p>
      ) : (
        feedbacks.map((fb) => (
          <div
            key={fb._id}
            style={{
              border: "1px solid #ccc",
              borderRadius: "8px",
              padding: "15px",
              marginBottom: "10px",
              backgroundColor: "#f9f9f9",
            }}
          >
            <h4>{fb.name || "Anonymous"}</h4>
            <p><strong>Email:</strong> {fb.email || "N/A"}</p>
            <p><strong>Message:</strong> {fb.message}</p>
            <p style={{ fontSize: "12px", color: "#888" }}>
              Submitted on {new Date(fb.createdAt).toLocaleString()}
            </p>
          </div>
        ))
      )}

      <button
        onClick={handleSummarize}
        style={{
          marginTop: "20px",
          padding: "10px 20px",
          backgroundColor: "#4CAF50",
          color: "white",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
        }}
      >
        {loadingSummary ? "Summarizing..." : "Summarize Feedback"}
      </button>

      {summary && (
        <div
          style={{
            marginTop: "20px",
            backgroundColor: "#e8f5e9",
            padding: "15px",
            borderRadius: "8px",
            border: "1px solid #a5d6a7",
          }}
        >
          <h3>🧠 Summary</h3>
          <p>{summary}</p>
        </div>
      )}
    </div>
  );
};

export default FeedbackList;