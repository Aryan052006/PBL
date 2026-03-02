const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { sendOtpEmail } = require('../utils/email');

const router = express.Router();
const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_KEY);

// @route   POST /api/auth/signup-init
// @desc    Initialize signup, send OTP
// @access  Public
router.post('/signup-init', async (req, res) => {
    const { name, email, password } = req.body;
    console.log(`Signup Init Request received for: ${email}`);

    try {
        console.log("Searching for existing user...");
        let user = await User.findOne({ email });

        if (user && user.isVerified) {
            return res.status(400).json({ msg: 'User already exists and is verified' });
        }

        // Generate 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        if (!user) {
            user = new User({
                name,
                email,
                password: hashedPassword,
                verificationOtp: otp,
                otpExpires,
                isVerified: false,
                // Placeholders for required fields if any (though we made them optional)
                branch: 'Pending',
                year: 'Pending'
            });
        } else {
            // Update existing unverified user
            user.name = name;
            user.password = hashedPassword;
            user.verificationOtp = otp;
            user.otpExpires = otpExpires;
        }

        console.log("User record updated/created, saving to DB...");
        await user.save();
        console.log("User saved, attempting to send OTP...");
        await sendOtpEmail(email, otp);

        console.log("OTP process complete, sending response.");
        res.json({ msg: 'OTP sent to email', email });
    } catch (err) {
        console.error("Signup Init Error:", err.message);
        res.status(500).json({ msg: 'Server error', error: err.message });
    }
});

// @route   POST /api/auth/verify-otp
// @desc    Verify OTP
// @access  Public
router.post('/verify-otp', async (req, res) => {
    const { email, otp } = req.body;

    try {
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }

        if (user.verificationOtp !== otp) {
            return res.status(400).json({ msg: 'Invalid OTP' });
        }

        if (user.otpExpires < Date.now()) {
            return res.status(400).json({ msg: 'OTP expired' });
        }

        user.isVerified = true;
        user.verificationOtp = undefined;
        user.otpExpires = undefined;

        await user.save();

        res.json({ msg: 'Email verified successfully', success: true });
    } catch (err) {
        console.error("Verify OTP Error:", err.message);
        res.status(500).json({ msg: 'Server error' });
    }
});

// @route   POST /api/auth/complete-signup
// @desc    Complete signup (Birthdate + Domain Info)
// @access  Public (or Private with token)
router.post('/complete-signup', async (req, res) => {
    const { email, birthdate, branch, year, skills, interests } = req.body;

    try {
        let user = await User.findOne({ email });

        if (!user || !user.isVerified) {
            return res.status(401).json({ msg: 'User not found or not verified' });
        }

        user.birthdate = birthdate;
        user.branch = branch;
        user.year = year;
        user.skills = skills || [];
        user.interests = interests || [];

        // Generate initial roadmap and analysis if skills are provided
        if (user.skills.length > 0) {
            try {
                const prompt = `
                    Analyze the profile of a ${user.branch} student in ${user.year}.
                    Current Skills: ${user.skills.join(', ')}. 
                    Interests: ${user.interests.join(', ')}.
                    
                    Provide a career analysis in JSON format with exactly these keys:
                    1. "roadmap": An array of objects: [{"domainTitle": "String", "skillsToLearn": ["String"], "skillsHave": ["String"], "recommended": true}]
                    2. "skillAnalysis": A short 2-3 sentence paragraph assessing their current skill set relative to their branch and interests. Mention their strengths and one specific area for improvement.
                    3. "futureDevelopment": An array of 3-5 specific technical topics, soft skills, or certifications they should focus on over the next 6-12 months.
                    
                    Respond ONLY with the raw JSON object.
                `;
                const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
                const result = await model.generateContent(prompt);
                const text = result.response.text().replace(/```json/g, '').replace(/```/g, '').trim();

                const analysis = JSON.parse(text);
                user.roadmap = analysis.roadmap || [];
                user.skillAnalysis = analysis.skillAnalysis || "Analysis pending...";
                user.futureDevelopment = analysis.futureDevelopment || ["More data required for suggestions"];

            } catch (aiErr) {
                console.error("Analysis Init Error:", aiErr);
                user.roadmap = [{ domainTitle: "General Path", skillsToLearn: ["TBA"], skillsHave: user.skills, recommended: true }];
                user.skillAnalysis = "We're having trouble analyzing your skills right now. Check back later in your profile!";
                user.futureDevelopment = ["Explore new technologies", "Build projects", "Network with professionals"];
            }
        }

        await user.save();

        const payload = { user: { id: user.id } };
        jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: 360000 }, (err, token) => {
            if (err) throw err;
            res.json({ token, user });
        });

    } catch (err) {
        console.error("Complete Signup Error:", err.message);
        res.status(500).json({ msg: 'Server error' });
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

        if (!user.isVerified) {
            return res.status(400).json({ msg: 'Please verify your email first' });
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
                res.json({ token, user: { id: user.id, name: user.name, email: user.email, branch: user.branch, year: user.year, birthdate: user.birthdate, skills: user.skills, roadmap: user.roadmap } });
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
