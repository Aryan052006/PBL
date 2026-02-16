const https = require('https');

const API_KEY = "AIzaSyBKLvsamCYUrUItWm3GQ9_zRFwMu4qGVo4";

const options = {
    hostname: 'generativelanguage.googleapis.com',
    path: `/v1beta/models?key=${API_KEY}`,
    method: 'GET',
    headers: {
        'Content-Type': 'application/json'
    }
};

console.log("Listing available Gemini models...");

const req = https.request(options, (res) => {
    console.log(`Status Code: ${res.statusCode}`);

    let responseBody = '';
    res.on('data', (chunk) => {
        responseBody += chunk;
    });

    res.on('end', () => {
        try {
            const parsed = JSON.parse(responseBody);
            if (res.statusCode === 200 && parsed.models) {
                console.log("✅ Success! Available Models:");
                parsed.models.forEach(m => console.log(`- ${m.name} (${m.displayName})`));
            } else {
                console.log("❌ Failed. Response:", responseBody);
            }
        } catch (e) {
            console.error("Error parsing response:", e);
            console.log("Raw Response:", responseBody);
        }
    });
});

req.on('error', (error) => {
    console.error("Request Error:", error);
});

req.end();
