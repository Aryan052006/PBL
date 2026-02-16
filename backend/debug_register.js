const http = require('http');

const data = JSON.stringify({
    name: "Test Fetch User",
    email: "test_fetch@example.com",
    password: "password123",
    branch: "Computer Science",
    year: "1st Year"
});

const options = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/auth/register',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
    }
};

console.log("Testing Registration Endpoint at http://localhost:5000/api/auth/register ...");

const req = http.request(options, (res) => {
    console.log(`Status Code: ${res.statusCode}`);

    let responseData = '';
    res.on('data', (chunk) => {
        responseData += chunk;
    });

    res.on('end', () => {
        console.log('Response Body:', responseData);
        if (res.statusCode === 200) {
            console.log("✅ Registration Endpoint is working.");
        } else {
            console.log("⚠️ Endpoint returned error status.");
        }
    });
});

req.on('error', (error) => {
    console.error("❌ Failed to connect:", error.message);
    if (error.code === 'ECONNREFUSED') {
        console.log("Check if backend is running on port 5000.");
    }
});

req.write(data);
req.end();
