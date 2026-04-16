const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Database Connection Middleware
app.use((req, res, next) => {
  if (req.path.startsWith('/api') && !req.path.startsWith('/api/analyze')) {
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        msg: 'Database is still connecting. Please try again in a few seconds.',
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

// ── Domain Recommendation Endpoint ────────────────────────────────────────
// Priority: ML Service (KNN+RAG) → Rule-based fallback (no Gemini)
app.post('/api/recommend', async (req, res) => {
  const { branch, skills, interests, year, cgpa, projects_count,
          internship_experience, certifications, coding_platform_rating,
          communication_score, aptitude_score, hackathon_count } = req.body;

  const profile = {
    branch, year, skills, interests, cgpa, projects_count,
    internship_experience, certifications, coding_platform_rating,
    communication_score, aptitude_score, hackathon_count
  };

  console.log('[Recommend] Request:', { branch, year, skills: skills?.length });

  try {
    // Step 1: ML Service (Primary)
    const { getRecommendationsML } = require('./utils/mlService');
    const mlResult = await getRecommendationsML(profile);

    if (mlResult) {
      console.log('[Recommend] ML service success.');
      return res.json({ success: true, data: mlResult });
    }

    // Step 2: Rule-based fallback (always succeeds, no API keys needed)
    console.log('[Recommend] ML failed — using rule-based fallback...');
    const { getRuleBasedRecommendation } = require('./utils/aiRecommendation');
    const fallbackResult = getRuleBasedRecommendation(branch, year, skills, interests);
    return res.json({ success: true, data: fallbackResult });

  } catch (error) {
    console.error('[Recommend] Error:', error.message);
    // Ultimate safety net — still return 200 with rule-based data
    try {
      const { getRuleBasedRecommendation } = require('./utils/aiRecommendation');
      const safeResult = getRuleBasedRecommendation(branch, year, skills, interests);
      return res.json({ success: true, data: safeResult });
    } catch (e) {
      res.status(500).json({ success: false, msg: "Recommendation failed" });
    }
  }
});

// ── Domain Exploration Endpoint ───────────────────────────────────────────
// Priority: ML Service (RAG) → Rule-based fallback (no Gemini)
app.post('/api/explore', async (req, res) => {
  const { domain, branch, year, skills } = req.body;

  console.log('[Explore] Request:', { domain, branch, year });

  try {
    // Step 1: ML Service RAG (Primary)
    const { getDomainDetailsML } = require('./utils/mlService');
    const mlResult = await getDomainDetailsML(domain, { branch, year, skills });

    if (mlResult) {
      console.log('[Explore] ML service success.');
      return res.json({ success: true, data: mlResult });
    }

    // Step 2: Rule-based fallback (always succeeds)
    console.log('[Explore] ML failed — using rule-based fallback...');
    const { getRuleBasedDomainDetails } = require('./utils/aiRecommendation');
    const fallbackResult = getRuleBasedDomainDetails(domain, branch, year, skills);
    return res.json({ success: true, data: fallbackResult });

  } catch (error) {
    console.error('[Explore] Error:', error.message);
    try {
      const { getRuleBasedDomainDetails } = require('./utils/aiRecommendation');
      const safeResult = getRuleBasedDomainDetails(domain, branch, year, skills);
      return res.json({ success: true, data: safeResult });
    } catch (e) {
      res.status(500).json({ success: false, msg: "Exploration failed" });
    }
  }
});

// Start server immediately
app.listen(PORT, () => {
  console.log(`\n🚀 Server running on port ${PORT}`);
  console.log('   ML Service → Rule-based fallback chain active (no Gemini)');
});

// Database Connection
const connectDB = async () => {
  try {
    if (!process.env.MONGO_URI) {
      console.error('WARNING: MONGO_URI is undefined.');
      return;
    }
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB Connected Successfully');
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
  }
};

connectDB();
