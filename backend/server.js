const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Database Connection Middleware (Resilience Helper)
app.use((req, res, next) => {
  // Only check DB for /api routes, and skip /api/analyze if it doesn't need DB
  if (req.path.startsWith('/api') && !req.path.startsWith('/api/analyze')) {
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        msg: 'Database is still connecting in the background. Please try again in 5-10 seconds.',
        status: 'DB_CONNECTING'
      });
    }
  }
  next();
});

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

// Start server immediately for resilience
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log('--- Resilient Mode: Server started while DB connects in background ---');
});

// Database Connection
const connectDB = async () => {
  try {
    if (!process.env.MONGO_URI) {
      console.error('WARNING: MONGO_URI is undefined. Database features will fail.');
      return;
    }

    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected Successfully');

  } catch (err) {
    console.error('CRITICAL: MongoDB connection error:', err.message);
    console.log('NOTICE: Server is still running, but DB functions are disabled.');
    // Do not exit process, stay alive for other services (AI, etc.)
  }
};

connectDB();
