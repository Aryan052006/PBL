const OpenAI = require('openai');
const dotenv = require('dotenv');

dotenv.config();

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

async function testOpenAI() {
    console.log("Testing OpenAI API Key...");
    try {
        const completion = await openai.chat.completions.create({
            messages: [{ role: "user", content: "Say 'Hello' if you can hear me." }],
            model: "gpt-4o-mini",
        });
        console.log("✅ Success! Response:", completion.choices[0].message.content);
        console.log("Assessment: You are ready for AI integration.");
    } catch (error) {
        console.error("❌ OpenAI/API Error:", error.message);
        if (error.code === 'insufficient_quota') {
            console.log("Assessment: Quota exceeded. Stick to Manual/Static logic.");
        } else if (error.code === 'invalid_api_key') {
            console.log("Assessment: Invalid Key. Stick to Manual/Static logic.");
        } else {
            console.log("Assessment: Unknown issue. Manual/Static might be safer.");
        }
    }
}

testOpenAI();
