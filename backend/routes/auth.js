const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();
const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_KEY);

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', async (req, res) => {
    const { name, email, password, branch, year } = req.body;

    try {
        let user = await User.findOne({ email });

        if (user) {
            return res.status(400).json({ msg: 'User already exists' });
        }

        user = new User({
            name,
            email,
            password,
            branch,
            year,
        });

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);

        await user.save();

        const payload = {
            user: {
                id: user.id,
            },
        };

        jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: 360000 },
            (err, token) => {
                if (err) throw err;
                res.json({ token, user: { id: user.id, name: user.name, email: user.email, branch: user.branch, year: user.year, skills: user.skills, roadmap: user.roadmap } });
            }
        );
    } catch (err) {
        console.error("Register Error:", err.message);
        res.status(500).json({ msg: 'Server error', error: err.message });
    }
});

// @route   POST /api/auth/login
// @desc    Auth user & get token
// @access  Public
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        let user = await User.findOne({ email });

        if (!user) {
            return res.status(400).json({ msg: 'Invalid Credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(400).json({ msg: 'Invalid Credentials' });
        }

        const payload = {
            user: {
                id: user.id,
            },
        };

        jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: 360000 },
            (err, token) => {
                if (err) throw err;
                res.json({ token, user: { id: user.id, name: user.name, email: user.email, branch: user.branch, year: user.year, skills: user.skills, roadmap: user.roadmap } });
            }
        );
    } catch (err) {
        console.error("Login Error:", err);
        res.status(500).json({ msg: 'Server error', error: err.message });
    }
});

// @route   GET /api/auth/user
// @desc    Get logged in user
// @access  Private (Needs middleware)
// @route   PUT /api/auth/onboarding
// @desc    Update user with onboarding data (DOB, Skills) & Generate Roadmap
// @access  Public (Should be Private in real app, but using ID from body for now or simple update)
router.put('/onboarding', async (req, res) => {
    const { userId, dob, skills } = req.body;

    try {
        let user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }

        user.dob = dob;
        user.skills = skills;

        // Intelligent Roadmap Generation via OpenAI
        try {
            const prompt = `
                User has the following skills: ${skills.join(', ')}.
                Branch: ${user.branch}, Year: ${user.year}.
                
                Generate a recommended learning roadmap for this user.
                Provide 1 to 2 distinct paths/domains (e.g., "Fullstack Development", "Data Science", "Cloud Engineering") that logically follow their current skills.
                For each path, list "skillsToLearn" (next logical steps) and "skillsHave" (from their current list).
                
                Respond ONLY with a valid JSON array of objects with this structure:
                [
                    {
                        "domainTitle": "String",
                        "skillsToLearn": ["String"],
                        "skillsHave": ["String"],
                        "recommended": true
                    }
                ]
                Do not include markdown formatting (like \`\`\`json). Just the raw JSON string.
            `;

            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
            const result = await model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();

            // Clean markdown if present
            const cleanContent = text.replace(/```json/g, '').replace(/```/g, '').trim();

            let roadmap = [];
            try {
                roadmap = JSON.parse(cleanContent);
            } catch (e) {
                console.error("JSON Parse Error:", e);
                // Fallback valid JSON if parse fails
                roadmap = [{
                    domainTitle: "Web Development (Fallback)",
                    skillsToLearn: ["React", "Node.js"],
                    skillsHave: skills,
                    recommended: true
                }];
            }

            user.roadmap = roadmap;
        } catch (aiError) {
            console.error("OpenAI Error:", aiError);
            // Fallback if AI fails completely
            user.roadmap = [{
                domainTitle: "Web Development Fundamentals",
                skillsToLearn: ["React", "Node.js"],
                skillsHave: skills,
                recommended: true
            }];
        }

        await user.save();

        res.json({ user });

    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: 'Server error' });
    }
});

module.exports = router;
