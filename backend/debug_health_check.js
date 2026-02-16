const http = require('http');

console.log("Checking Backend Health at http://localhost:5000/ ...");

const req = http.get('http://localhost:5000/', (res) => {
    console.log(`Status Code: ${res.statusCode}`);
    let data = '';

    res.on('data', (chunk) => {
        data += chunk;
    });

    res.on('end', () => {
        console.log('Response:', data);
        if (res.statusCode === 200) {
            console.log("✅ Backend is UP and reachable.");
        } else {
            console.log("⚠️ Backend responded with error.");
        }
    });
});

req.on('error', (err) => {
    console.error("❌ Failed to connect to backend:", err.message);
    console.log("\nDiagnosis:");
    console.log("1. The server is not running or crashed.");
    console.log("2. The database connection might have failed (causing the server to exit).");
    console.log("3. Check the 'nodemon server.js' terminal for crash logs.");
});

req.end();
