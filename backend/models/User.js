const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    name:     { type: String, required: true },
    email:    { type: String, required: true, unique: true },
    password: { type: String, required: true },
    birthdate: { type: Date },
    branch:   { type: String, default: 'Pending' },
    year:     { type: String, default: 'Pending' },
    isVerified: { type: Boolean, default: false },
    verificationOtp: { type: String },
    otpExpires:      { type: Date },

    // ── Tech skills & interests ───────────────────────────────────────────
    skills:    { type: [String], default: [] },
    interests: { type: [String], default: [] },

    // ── KNN Feature Set (Research Paper — Feature Set 1) ──────────────────
    cgpa:                  { type: Number, default: 0, min: 0, max: 10 },
    projects_count:        { type: Number, default: 0, min: 0 },
    internship_experience: { type: Number, default: 0, min: 0 },  // months
    certifications:        { type: Number, default: 0, min: 0 },
    coding_platform_rating:{ type: Number, default: 0, min: 0, max: 2500 },
    communication_score:   { type: Number, default: 5, min: 1, max: 10 },
    aptitude_score:        { type: Number, default: 50, min: 0, max: 100 },
    hackathon_count:       { type: Number, default: 0, min: 0 },

    // ── AI-generated profile insights ─────────────────────────────────────
    roadmap: [{
        domainTitle:   String,
        skillsToLearn: [String],
        skillsHave:    [String],
        recommended:   Boolean,
    }],
    skillAnalysis:     { type: String, default: '' },
    futureDevelopment: { type: [String], default: [] },

    createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('User', UserSchema);
