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
    branch: {
        type: String,
        required: true, // e.g., 'Computer Science'
    },
    year: {
        type: String,
        required: true, // e.g., '3rd Year'
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
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model('User', UserSchema);
