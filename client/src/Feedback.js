import React, { useState } from 'react';
import axios from 'axios';

const Feedback = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [summary, setSummary] = useState('');
  const [status, setStatus] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('Submitting...');
    try {
      await axios.post('http://localhost:5000/api/feedback', {
        name,
        email,
        message,
      });
      setStatus('Feedback submitted successfully!');
      setMessage('');
      setName('');
      setEmail('');
    } catch (error) {
      setStatus('Error submitting feedback.');
    }
  };

  const handleSummarize = async () => {
    setStatus('Summarizing...');
    try {
      const res = await axios.post('http://localhost:5000/api/llama/summarize', {
        message,
      });
      setSummary(res.data.summary);
      setStatus('Summary generated successfully!');
    } catch (error) {
      console.error(error);
      setStatus('Error generating summary.');
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>Customer Feedback</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={{ width: '100%', marginBottom: '10px' }}
          required
        />
        <input
          type="email"
          placeholder="Email (optional)"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ width: '100%', marginBottom: '10px' }}
        />
        <textarea
          placeholder="Enter your feedback here"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={6}
          style={{ width: '100%', marginBottom: '10px' }}
          required
        />
        <button type="submit">Submit Feedback</button>
        <button type="button" onClick={handleSummarize} style={{ marginLeft: '10px' }}>
          Summarize Feedback
        </button>
      </form>
      {status && <p><strong>{status}</strong></p>}
      {summary && (
        <div>
          <h3>Summary:</h3>
          <p>{summary}</p>
        </div>
      )}
    </div>
  );
};

export default Feedback;
