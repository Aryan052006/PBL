require('dotenv').config();
const mongoose = require('mongoose');
// axios removed

console.log("--- Debugging Environment ---");
console.log("MONGO_URI:", process.env.MONGO_URI ? "Defined (Hidden)" : "UNDEFINED");
console.log("JWT_SECRET:", process.env.JWT_SECRET ? "Defined (Hidden)" : "UNDEFINED");
console.log("PORT:", process.env.PORT);

const connectDB = async () => {
    try {
        console.log("\n--- Testing MongoDB Connection ---");
        console.log("Attempting to connect to:", process.env.MONGO_URI);
        await mongoose.connect(process.env.MONGO_URI);
        console.log("MongoDB Connected Successfully!");

        // If connected, let's try to find a user to see if read works
        const User = require('./models/User'); // Adjust path if needed
        const count = await User.countDocuments();
        console.log(`User Count: ${count}`);

        mongoose.connection.close();
    } catch (err) {
        console.error("MongoDB Connection Failed:", err.message);
        // It's likely an IP whitelist issue if it fails here
    }
};

connectDB();
