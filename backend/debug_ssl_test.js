const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const uri = process.env.MONGO_URI;

console.log("Testing MongoDB Connection...");
console.log("URI:", uri ? uri.replace(/:([^:@]+)@/, ':****@') : "Undefined"); // Mask password

async function testConnection() {
    try {
        // Attempt 1: Standard Connection
        console.log("\nAttempt 1: Standard Connection");
        await mongoose.connect(uri, {
            serverSelectionTimeoutMS: 5000,
        });
        console.log("✅ Success! Connected with standard settings.");
        await mongoose.disconnect();
    } catch (err) {
        console.error("❌ Attempt 1 Failed:", err.message);

        try {
            // Attempt 2: No SSL/TLS validation (Unsafe, debug only)
            console.log("\nAttempt 2: Disabling SSL Validation (Debug Only)");
            await mongoose.connect(uri, {
                serverSelectionTimeoutMS: 5000,
                tls: true,
                tlsInsecure: true // Bypass certificate validation
            });
            console.log("⚠️ Success! Connected with 'tlsInsecure: true'.");
            console.log("   -> This implies a certificate issue or strict firewall/proxy.");
            await mongoose.disconnect();
        } catch (err2) {
            console.error("❌ Attempt 2 Failed:", err2.message);
            console.log("\nDiagnosis:");
            console.log("1. IP Whitelist: Ensure your current IP is allowed in MongoDB Atlas.");
            console.log("2. Firewall: Check if a firewall or VPN is blocking port 27017.");
        }
    }
}

testConnection();
