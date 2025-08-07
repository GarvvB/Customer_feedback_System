import './App.css';

import React from 'react';
import FeedbackForm from './components/FeedbackForm';
import FeedbackList from './components/FeedbackList';

function App() {
  return (
    <div style={{ padding: "20px" }}>
      <FeedbackForm />
      <hr style={{ margin: "40px 0" }} />
      <FeedbackList />
    </div>
  );
}

export default App;
