const apiKey = 'AIzaSyBKLvsamCYUrUItWm3GQ9_zRFwMu4qGVo4';
process.env.GOOGLE_GEMINI_KEY = apiKey;
console.log("Key set in process.env:", process.env.GOOGLE_GEMINI_KEY ? "Yes" : "No");
const { analyzeWithGemini } = require('../utils/gemini');

const sampleResume = `
John Doe
Full Stack Developer
Skills: React, Node.js, Express, MongoDB, TypeScript, Tailwind CSS, Docker, AWS.
Experience: 2 years at TechCorp building scalable web applications.
Projects: Personal Portfolio, E-commerce Dashboard, real-time chat app using WebSockets.
Education: B.Tech in Computer Science.
`;

async function testAnalysis() {
    console.log("Testing Gemini Analysis...");
    const result = await analyzeWithGemini(sampleResume);
    if (result) {
        console.log("Analysis Result:");
        console.log(JSON.stringify(result, null, 2));
    } else {
        console.log("Analysis failed.");
    }
}

testAnalysis();
