const mongoose = require('mongoose');
const User = require('./models/User'); // Adjust path as this script will be in backend/
const dotenv = require('dotenv');

dotenv.config();

const connectDB = async () => {
    try {
        console.log("Connecting to MongoDB...");
        console.log("URI:", process.env.MONGO_URI ? "Found" : "Missing");
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected');
    } catch (err) {
        console.error('MongoDB connection error:', err);
        process.exit(1);
    }
};

const testSignup = async () => {
    await connectDB();

    const testUser = {
        name: "Test User",
        email: "testuser_" + Date.now() + "@example.com",
        password: "password123",
        branch: "Computer Science",
        year: "1st Year"
    };

    try {
        console.log("Attempting to save user:", testUser);
        const user = new User(testUser);
        await user.save();
        console.log("User saved successfully!");
        
        // Cleanup
        await User.deleteOne({ _id: user._id });
        console.log("Test user deleted.");
    } catch (err) {
        console.error("Error saving user:", err);
    } finally {
        await mongoose.disconnect();
    }
};

testSignup();
