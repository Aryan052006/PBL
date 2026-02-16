const { GoogleGenerativeAI } = require("@google/generative-ai");
const dotenv = require('dotenv');

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_KEY);

const getGeminiRecommendation = async (userProfile) => {
    const { branch, skills, interests, year } = userProfile;

    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const prompt = `
            Act as a strict career counselor for engineering students.
            
            User Profile:
            - Branch: ${branch}
            - Year: ${year}
            - Skills: ${skills.join(', ')}
            - Interests: ${interests.join(', ')}

            Task:
            Recommend the top 3-4 specific career domains for this user based strictly on their profile.
            Do NOT include generic advice. Be specific to their current year and skill level.
            
            For each domain, provide:
            1. title: The Domain Name
            2. matchScore: A number between 0-99 indicating fit. (Be realistic. If they have no skills, score lower).
            3. reasoning: A short, persuasive sentence explaining WHY this fits them given their year/branch/interests.
            4. tags: 2-3 key technologies relevant to this domain.
            5. description: A brief description of the role.
            6. recommended: true for the top match, false otherwise.

            Output Format:
            Start the response with a valid JSON array of objects. Do NOT use markdown code blocks. Just raw JSON.
            Example:
            [
                { "title": "Web Dev", "matchScore": 85, "reasoning": "...", "tags": ["React"], "description": "...", "recommended": true }
            ]
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
        const recommendations = JSON.parse(jsonStr);

        return recommendations.map((rec, index) => ({
            ...rec,
            id: index + 1
        }));

    } catch (error) {
        console.error("Gemini AI Error (Recommendations):", error);
        return [];
    }
};

const getDomainDetails = async (domainTitle, userProfile) => {
    const { branch, year, skills } = userProfile;

    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const prompt = `
            Create a detailed career guide for the domain: "${domainTitle}".
            Target Audience: ${year} year ${branch} student who knows [${skills.join(', ')}].

            Provide the following details in JSON format:
            1. overview: A motivating overview of the field (2-3 sentences).
            2. whyGoodFit: Why this is a good choice for them specifically.
            3. salaryRange: Estimated entry-level salary range in India (LPA).
            4. roadmap: An array of 5 steps (strings), ordered from beginner to job-ready.
            5. resources: An array of 3 recommended free learning resources (names/types, e.g., "Documentation", "YouTube Channel").
            6. projectIdeas: An array of 2-3 project ideas to build.

            Output Format:
            Raw JSON object. No markdown.
            Example:
            {
                "overview": "...",
                "whyGoodFit": "...",
                "salaryRange": "4-8 LPA",
                "roadmap": ["Step 1", "Step 2", "..."],
                "resources": ["..."],
                "projectIdeas": ["..."]
            }
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(jsonStr);

    } catch (error) {
        console.error("Gemini AI Error (Details):", error);
        return null;
    }
};

module.exports = { getGeminiRecommendation, getDomainDetails };
