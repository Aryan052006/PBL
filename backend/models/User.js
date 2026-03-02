const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    birthdate: {
        type: Date,
    },
    branch: {
        type: String,
        // Optional during initial signup steps
    },
    year: {
        type: String,
        // Optional during initial signup steps
    },
    isVerified: {
        type: Boolean,
        default: false,
    },
    verificationOtp: {
        type: String,
    },
    otpExpires: {
        type: Date,
    },
    skills: {
        type: [String], // Array of skills user manually entered or selected
        default: [],
    },
    interests: {
        type: [String],
        default: [],
    },
    // Recommended learning path based on domains analysis
    roadmap: [{
        domainTitle: String,
        skillsToLearn: [String], // Skills they DON'T have yet
        skillsHave: [String], // Skills they ALREADY have
        recommended: Boolean,
    }],
    skillAnalysis: {
        type: String,
        default: "",
    },
    futureDevelopment: {
        type: [String],
        default: [],
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model('User', UserSchema);
