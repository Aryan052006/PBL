const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/analyze', require('./routes/analyze'));

// Basic Route
app.get('/', (req, res) => {
  res.json({ message: 'Smart Career Domain Selection API is running', timestamp: new Date() });
});

// Domain Recommendation Endpoint (Stub)
app.post('/api/recommend', (req, res) => {
  const { branch, skills, interests } = req.body;
  // TODO: Implement actual rule-based logic here
  console.log('Recommendation Request:', { branch, skills, interests });

  const mockRecommendations = [
    {
      id: 1,
      title: "Full Stack Development",
      matchScore: 92,
      description: "Based on your interest in Web Dev and Javascript skills.",
      tags: ["React", "Node.js"],
      recommended: true,
    },
    {
      id: 2,
      title: "Cloud Engineering",
      matchScore: 75,
      description: "Good fit for CS students, but requires more infrastructure knowledge.",
      tags: ["AWS", "Docker"],
      recommended: false,
    }
  ];

  // Simulate delay
  setTimeout(() => res.json({ success: true, daa: mockRecommendations }), 1000);
});

// Portfolio Analysis Endpoint (Stub)
app.post('/api/analyze', (req, res) => {
  // In a real app, this would handle file upload (multer) and parsing
  console.log('Analysis Request Received');

  const mockAnalysis = {
    score: 72,
    feedback: [
      { type: "success", message: "Strong project section" },
      { type: "error", message: "Missing GitHub link" }
    ]
  };

  setTimeout(() => res.json({ success: true, data: mockAnalysis }), 1500);
});

// Database Connection
const connectDB = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error('MONGO_URI is undefined. Check your .env file.');
    }
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected');
  } catch (err) {
    console.error('MongoDB connection error:', err);
  }
};
connectDB();

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
