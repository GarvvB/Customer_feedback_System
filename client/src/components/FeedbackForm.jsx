import React, { useState } from "react";
import axios from "axios";

const FeedbackForm = () => {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        message: "",
    });
    const [status, setStatus] = useState(""); // Success or error message

    const handleChange = (e) => {
        setFormData((prev) => ({
            ...prev,
            [e.target.name]: e.target.value,
        }));
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus(""); // Reset status

        try {
            const response = await axios.post("http://localhost:5000/api/feedback", formData);
            setStatus("Feedback submitted successfully!");
            setFormData({ name: "", email: "", message: "" }); // Reset, Clear form
        } catch (err) {
            console.error("Error submitting feedback:", err);
            setStatus("Failed to submit feedback.");
        }
    };
    
    return (
        <div style={{ maxWidth: "500px", margin: "auto", padding: "20px" }}>
            <h2>Customer Feedback</h2>
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    name="name"
                    placeholder="Your Name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    style={{ width: "100%", marginBottom: "10px", padding: "10px" }}
                />
                <input
                    type="email"
                    name="email"
                    placeholder="Your Email (optional)"
                    value={formData.email}
                    onChange={handleChange}
                    style={{ width: "100%", marginBottom: "10px", padding: "10px" }}
                />
                <textarea
                    name="message"
                    placeholder="Your Feedback"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    style={{ width: "100%", marginBottom: "10px", padding: "10px" }}
                />
                <button type="submit" style={{ padding: "10px 20px" }}>
                    Submit
                </button>
            </form>
            {status && <p style={{ marginTop: "15px" }}>{status}</p>}
        </div>
    );
};

export default FeedbackForm;