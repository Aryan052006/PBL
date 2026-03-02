const { GoogleGenerativeAI } = require("@google/generative-ai");
const dotenv = require('dotenv');

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_KEY);

const analyzeWithGemini = async (input) => {
    try {
        if (!process.env.GOOGLE_GEMINI_KEY) {
            console.error("GOOGLE_GEMINI_KEY not found in environment variables");
            return null;
        }

        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        const promptText = `
        You are an expert career advisor and technical recruiter. 
        Analyze the provided resume content (which may be text, an image, or a PDF) and provide a structured career breakdown in JSON format.
        
        The output must be a valid JSON object with the following fields:
        {
            "bestFitDomain": "The most suitable domain",
            "score": 85,
            "status": "A short status string: 'Job Ready', 'Solid Candidate', 'Needs Polishing', or 'Learning'",
            "salary": {
                "min": 800000,
                "max": 1200000,
                "currency": "INR",
                "formatted": "₹8 LPA - ₹12 LPA"
            },
            "jobTitles": ["3-4 specific job titles"],
            "gaps": ["5-8 missing technical skills"],
            "boosters": ["3-5 specific actions to improve"],
            "tips": ["3-4 personalized career tips"],
            "marketAnalysis": "A 2-3 sentence assessment of how this profile stands in the current Indian tech market.",
            "domainSuitability": [
                {"domain": "Web Development", "match": 85},
                {"domain": "Data Science", "match": 40},
                {"domain": "DevOps", "match": 60}
            ],
            "skillGap": {
                "matchingPercentage": 85,
                "gapPercentage": 15
            }
        }

        Be realistic and data-driven. Consider current market trends in India.
        Ensure response is strictly JSON data without markdown formatting.
        `;

        let parts = [{ text: promptText }];

        if (typeof input === 'string') {
            parts.push({ text: `Resume Text:\n"""\n${input}\n"""` });
        } else if (input.buffer && input.mimetype) {
            parts.push({
                inlineData: {
                    mimeType: input.mimetype,
                    data: input.buffer.toString('base64')
                }
            });
        } else {
            console.error("Invalid input provided to analyzeWithGemini");
            return null;
        }

        const result = await model.generateContent(parts);
        const response = await result.response;
        let textResult = response.text();

        // Extract JSON if AI includes markdown code blocks
        if (textResult.includes("```json")) {
            textResult = textResult.split("```json")[1].split("```")[0];
        } else if (textResult.includes("```")) {
            textResult = textResult.split("```")[1].split("```")[0];
        }

        return JSON.parse(textResult.trim());
    } catch (error) {
        console.error("Gemini Analysis Error:", error);
        return null;
    }
};

module.exports = { analyzeWithGemini };
