# 🌟 Customer Feedback System with AI Summarization

![Made With](https://img.shields.io/badge/MERN-Stack-blue)
![AI Powered](https://img.shields.io/badge/AI-LLaMA3-yellow)
![Status](https://img.shields.io/badge/status-Active-brightgreen)

A full-stack Customer Feedback System built with the MERN stack and integrated with **Meta LLaMA 3 AI model** via [Together.ai](https://www.together.ai) API to automatically **summarize user feedback** and provide insights. 🎯

---

## 📸 Demo

![Untitledvideo-MadewithClipchamp1-ezgif com-video-to-gif-converter](https://github.com/user-attachments/assets/a91f7830-e9cb-4220-aaef-5684ae683f81)

---

## 🚀 Features

✅ Submit customer feedback via form  
✅ Store feedbacks in MongoDB  
✅ Visualize feedbacks beautifully on UI  
✅ AI-powered summarization using LLaMA 3  
✅ Real-time UI updates with beautiful animations  
✅ Sentiment analysis-ready structure  
✅ Clean and modern frontend  
✅ Fully customizable and open source

---

## 🛠 Tech Stack

| Technology      | Usage                          |
|----------------|---------------------------------|
| **MongoDB**     | Database                        |
| **Express.js**  | Backend API                     |
| **React.js**    | Frontend UI                     |
| **Node.js**     | Server-side runtime             |
| **Axios**       | HTTP requests                   |
| **Together.ai** | AI summarization using LLaMA 3  |
| **Mongoose**    | MongoDB ODM                     |
| **Dotenv**      | Secure environment variables    |

---

## 🧠 AI Summarization (LLaMA 3)

Integrated with the `meta-llama/Llama-3-8b-chat-hf` model via Together.ai API for generating concise summaries of all submitted feedback.

> Example Prompt:
> ```text
> Summarize this customer feedback: "I love the product but shipping was delayed..."
> ```

---

## 📁 Project Structure


📦 Customer Feedback System
├── client/              # React frontend
│   └── components/
│       └── FeedbackForm.jsx
│       └── FeedbackList.jsx
├── server/              # Express backend
│   ├── models/
│   │   └── Feedback.js
│   ├── routes/
│   │   └── feedbackRoutes.js
│   │   └── llamaRoutes.js
│   ├── app.js
│   └── .env             # API keys, Mongo URI
└── README.md


---

## 📬 API Endpoints

| Route            | Method | Description              |
| ---------------- | ------ | ------------------------ |
| `/api/feedbacks` | GET    | Get all feedbacks        |
| `/api/feedback`  | POST   | Submit new feedback      |
| `/api/summarize` | POST   | Get AI-generated summary |

---

## 💡 Future Enhancements

* 📊 Sentiment chart & analytics
* 📥 Export summary as PDF
* 📬 Email response to users
* 🔐 Role-based admin dashboard
* 🌐 Deploy to Vercel / Render / Netlify

---

## 🧑‍💻 Author

**Garv Bhardwaj**
📧 [garvb1404@gmail.com](mailto:garvb1404@gmail.com)

---


## 🙌 Support

If you liked this project, don’t forget to ⭐ star the repo :)
