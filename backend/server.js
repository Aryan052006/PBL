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

// Domain Recommendation Endpoint
app.post('/api/recommend', async (req, res) => {
  const { branch, skills, interests, year } = req.body;

  const { getGeminiRecommendation } = require('./utils/aiRecommendation');

  console.log('AI Recommendation Request:', { branch, year, skills: skills?.length, interests });

  try {
    // Parse skills string to array if needed
    const skillsArray = Array.isArray(skills) ? skills : (skills || "").split(",").map(s => s.trim());

    const recommendations = await getGeminiRecommendation({
      branch,
      year,
      skills: skillsArray,
      interests
    });

    res.json({ success: true, data: recommendations });

  } catch (error) {
    console.error("Recommendation Error:", error);
    res.status(500).json({ success: false, msg: "Analysis failed" });
  }
});

// Domain Exploration Endpoint
app.post('/api/explore', async (req, res) => {
  const { domain, branch, year, skills } = req.body;
  const { getDomainDetails } = require('./utils/aiRecommendation');

  console.log('AI Explore Request:', { domain, branch, year });

  try {
    const details = await getDomainDetails(domain, { branch, year, skills });
    res.json({ success: true, data: details });
  } catch (error) {
    console.error("Explore Error:", error);
    res.status(500).json({ success: false, msg: "Exploration failed" });
  }
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

    // Only start server if DB connects
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });

  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    // Exit process with failure
    process.exit(1);
  }
};

connectDB();
