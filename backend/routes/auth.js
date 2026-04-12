const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { sendOtpEmail } = require('../utils/email');

const router = express.Router();

// Helper: safe user object (strip password, internal fields)
const safeUser = (user) => ({
    id: user._id,
    name: user.name,
    email: user.email,
    branch: user.branch,
    year: user.year,
    birthdate: user.birthdate,
    skills: user.skills,
    interests: user.interests,
    cgpa: user.cgpa,
    projects_count: user.projects_count,
    internship_experience: user.internship_experience,
    certifications: user.certifications,
    coding_platform_rating: user.coding_platform_rating,
    communication_score: user.communication_score,
    aptitude_score: user.aptitude_score,
    hackathon_count: user.hackathon_count,
    roadmap: user.roadmap,
    skillAnalysis: user.skillAnalysis,
    futureDevelopment: user.futureDevelopment,
});

// @route POST /api/auth/signup-init
router.post('/signup-init', async (req, res) => {
    const { name, email, password } = req.body;
    try {
        let user = await User.findOne({ email });
        if (user && user.isVerified) {
            return res.status(400).json({ msg: 'User already exists and is verified' });
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpires = new Date(Date.now() + 10 * 60 * 1000);
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        if (!user) {
            user = new User({ name, email, password: hashedPassword, verificationOtp: otp, otpExpires, isVerified: false });
        } else {
            user.name = name;
            user.password = hashedPassword;
            user.verificationOtp = otp;
            user.otpExpires = otpExpires;
        }

        await user.save();
        await sendOtpEmail(email, otp);
        res.json({ msg: 'OTP sent to email', email });
    } catch (err) {
        console.error("Signup Init Error:", err.message);
        res.status(500).json({ msg: 'Server error', error: err.message });
    }
});

// @route POST /api/auth/verify-otp
router.post('/verify-otp', async (req, res) => {
    const { email, otp } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ msg: 'User not found' });
        if (user.verificationOtp !== otp) return res.status(400).json({ msg: 'Invalid OTP' });
        if (user.otpExpires < Date.now()) return res.status(400).json({ msg: 'OTP expired' });

        user.isVerified = true;
        user.verificationOtp = undefined;
        user.otpExpires = undefined;
        await user.save();
        res.json({ msg: 'Email verified successfully', success: true });
    } catch (err) {
        res.status(500).json({ msg: 'Server error' });
    }
});

// @route POST /api/auth/complete-signup
router.post('/complete-signup', async (req, res) => {
    const {
        email, birthdate, branch, year, skills, interests,
        cgpa, projects_count, internship_experience, certifications,
        coding_platform_rating, communication_score, aptitude_score, hackathon_count
    } = req.body;
    try {
        let user = await User.findOne({ email });
        if (!user || !user.isVerified) return res.status(401).json({ msg: 'User not found or not verified' });

        user.birthdate = birthdate;
        user.branch = branch;
        user.year = year;
        user.skills = skills || [];
        user.interests = interests || [];

        // KNN features
        if (cgpa !== undefined) user.cgpa = parseFloat(cgpa) || 0;
        if (projects_count !== undefined) user.projects_count = parseInt(projects_count) || 0;
        if (internship_experience !== undefined) user.internship_experience = parseInt(internship_experience) || 0;
        if (certifications !== undefined) user.certifications = parseInt(certifications) || 0;
        if (coding_platform_rating !== undefined) user.coding_platform_rating = parseInt(coding_platform_rating) || 0;
        if (communication_score !== undefined) user.communication_score = parseInt(communication_score) || 5;
        if (aptitude_score !== undefined) user.aptitude_score = parseFloat(aptitude_score) || 50;
        if (hackathon_count !== undefined) user.hackathon_count = parseInt(hackathon_count) || 0;

        await user.save();

        const payload = { user: { id: user.id } };
        jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: 360000 }, (err, token) => {
            if (err) throw err;
            res.json({ token, user: safeUser(user) });
        });
    } catch (err) {
        console.error("Complete Signup Error:", err.message);
        res.status(500).json({ msg: 'Server error' });
    }
});

// @route POST /api/auth/login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        let user = await User.findOne({ email });
        if (!user) return res.status(400).json({ msg: 'Invalid Credentials' });
        if (!user.isVerified) return res.status(400).json({ msg: 'Please verify your email first' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ msg: 'Invalid Credentials' });

        const payload = { user: { id: user.id } };
        jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: 360000 }, (err, token) => {
            if (err) throw err;
            res.json({ token, user: safeUser(user) });
        });
    } catch (err) {
        console.error("Login Error:", err);
        res.status(500).json({ msg: 'Server error', error: err.message });
    }
});

// @route PUT /api/auth/onboarding
// Full onboarding — collects all KNN features (5-step form)
router.put('/onboarding', async (req, res) => {
    const {
        userId, dob, branch, year, skills, interests,
        cgpa, projects_count, internship_experience, certifications,
        coding_platform_rating, communication_score, aptitude_score, hackathon_count
    } = req.body;

    try {
        let user = await User.findById(userId);
        if (!user) return res.status(404).json({ msg: 'User not found' });

        // Update all profile fields
        if (dob) user.birthdate = dob;
        if (branch) user.branch = branch;
        if (year) user.year = year;
        if (skills) user.skills = skills;
        if (interests) user.interests = interests;

        // KNN features
        if (cgpa !== undefined) user.cgpa = parseFloat(cgpa);
        if (projects_count !== undefined) user.projects_count = parseInt(projects_count);
        if (internship_experience !== undefined) user.internship_experience = parseInt(internship_experience);
        if (certifications !== undefined) user.certifications = parseInt(certifications);
        if (coding_platform_rating !== undefined) user.coding_platform_rating = parseInt(coding_platform_rating);
        if (communication_score !== undefined) user.communication_score = parseInt(communication_score);
        if (aptitude_score !== undefined) user.aptitude_score = parseFloat(aptitude_score);
        if (hackathon_count !== undefined) user.hackathon_count = parseInt(hackathon_count);

        // Generate roadmap via ML service, fallback to Gemini
        try {
            const { getRecommendationsML } = require('../utils/mlService');
            const profile = {
                branch: user.branch, year: user.year,
                skills: user.skills, interests: user.interests,
                cgpa: user.cgpa, projects_count: user.projects_count,
                internship_experience: user.internship_experience,
                certifications: user.certifications,
                coding_platform_rating: user.coding_platform_rating,
                communication_score: user.communication_score,
                aptitude_score: user.aptitude_score, hackathon_count: user.hackathon_count
            };

            const mlRec = await getRecommendationsML(profile);
            if (mlRec && mlRec.recommendations && mlRec.recommendations.length > 0) {
                // Convert ML recommendations → roadmap format
                user.roadmap = mlRec.recommendations.slice(0, 3).map(r => ({
                    domainTitle: r.title,
                    skillsToLearn: r.tags || [],
                    skillsHave: user.skills.slice(0, 3),
                    recommended: r.recommended || false,
                }));
                user.skillAnalysis = mlRec.globalAssessment || '';
                user.futureDevelopment = mlRec.skillsOverlap?.missing || [];
            }
        } catch (mlErr) {
            console.warn('[Onboarding] ML roadmap generation failed:', mlErr.message);
            // Gemini fallback
            try {
                const { GoogleGenerativeAI } = require('@google/generative-ai');
                const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_KEY);
                const prompt = `
                    Analyze the profile of a ${user.branch} student in ${user.year}.
                    Skills: ${user.skills.join(', ')}. Interests: ${user.interests.join(', ')}.
                    CGPA: ${user.cgpa}. Projects: ${user.projects_count}. Internships: ${user.internship_experience} months.
                    Provide JSON with: "roadmap" (array of {domainTitle,skillsToLearn,skillsHave,recommended}),
                    "skillAnalysis" (2-3 sentences), "futureDevelopment" (array of 3-5 items).
                    Raw JSON only.
                `;
                const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
                const result = await model.generateContent(prompt);
                const text = result.response.text().replace(/```json/g, '').replace(/```/g, '').trim();
                const analysis = JSON.parse(text);
                user.roadmap = analysis.roadmap || [];
                user.skillAnalysis = analysis.skillAnalysis || '';
                user.futureDevelopment = analysis.futureDevelopment || [];
            } catch (geminiErr) {
                console.warn('[Onboarding] Gemini roadmap also failed:', geminiErr.message);
                user.roadmap = [{ domainTitle: 'General Tech', skillsToLearn: ['Build projects'], skillsHave: user.skills.slice(0, 2), recommended: true }];
                user.skillAnalysis = 'Complete your profile to get personalized AI insights.';
                user.futureDevelopment = ['Build domain-specific projects', 'Earn a certification', 'Participate in hackathons'];
            }
        }

        await user.save();
        res.json({ user: safeUser(user) });

    } catch (err) {
        console.error('[Onboarding] Error:', err.message);
        res.status(500).json({ msg: 'Server error' });
    }
});

// @route PUT /api/auth/profile/update
// Allow updating profile from the Profile page
router.put('/profile/update', async (req, res) => {
    const {
        userId, skills, interests, cgpa, projects_count,
        internship_experience, certifications, coding_platform_rating,
        communication_score, aptitude_score, hackathon_count, branch, year
    } = req.body;

    try {
        let user = await User.findById(userId);
        if (!user) return res.status(404).json({ msg: 'User not found' });

        // Update only provided fields
        const updates = {
            skills, interests, branch, year,
            cgpa, projects_count, internship_experience, certifications,
            coding_platform_rating, communication_score, aptitude_score, hackathon_count
        };
        Object.entries(updates).forEach(([key, val]) => {
            if (val !== undefined && val !== null) user[key] = val;
        });

        // Regenerate roadmap after update
        try {
            const { getRecommendationsML } = require('../utils/mlService');
            const mlRec = await getRecommendationsML({
                branch: user.branch, year: user.year, skills: user.skills,
                interests: user.interests, cgpa: user.cgpa,
                projects_count: user.projects_count, internship_experience: user.internship_experience,
                certifications: user.certifications, coding_platform_rating: user.coding_platform_rating,
                communication_score: user.communication_score, aptitude_score: user.aptitude_score,
                hackathon_count: user.hackathon_count
            });
            if (mlRec?.recommendations?.length > 0) {
                user.roadmap = mlRec.recommendations.slice(0, 3).map(r => ({
                    domainTitle: r.title, skillsToLearn: r.tags || [],
                    skillsHave: user.skills.slice(0, 3), recommended: r.recommended || false,
                }));
                user.skillAnalysis = mlRec.globalAssessment || user.skillAnalysis;
                user.futureDevelopment = mlRec.skillsOverlap?.missing || user.futureDevelopment;
            }
        } catch (e) {
            console.warn('[ProfileUpdate] ML regen failed:', e.message);
        }

        await user.save();
        res.json({ user: safeUser(user) });
    } catch (err) {
        console.error('[ProfileUpdate] Error:', err.message);
        res.status(500).json({ msg: 'Server error' });
    }
});

module.exports = router;
