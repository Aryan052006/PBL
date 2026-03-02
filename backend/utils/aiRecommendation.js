const { GoogleGenerativeAI } = require("@google/generative-ai");
const dotenv = require('dotenv');

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_KEY);

const getGeminiRecommendation = async (userProfile) => {
    const { branch, skills, interests, year } = userProfile;

    try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        const prompt = `
            Act as a high-level career strategist for engineering students.
            
            User Profile:
            - Branch: ${branch}
            - Year: ${year}
            - Skills: ${skills.join(', ')}

            Task:
            Provide a comprehensive career strategy in JSON format.
            You MUST evaluate the user against exactly these 10 domains and provide a matchScore (0-100) for EACH one:
            1. Full Stack Web Development
            2. AI & Data Science
            3. DevOps & Cloud Engineering
            4. Cybersecurity
            5. Mobile App Development
            6. Blockchain Technology
            7. Embedded Systems & IoT
            8. Game Development
            9. UI/UX Design
            10. Product Management

            The response must be a single JSON object with the following fields:
            {
                "globalAssessment": "A 2-sentence summary of the user's current academic/skill standing in the Indian market.",
                "topInsight": "A single, powerful piece of advice for their career growth.",
                "recommendations": [
                    {
                        "title": "Domain Name",
                        "matchScore": number (0-100. If skills don't match, give 0 or very low),
                        "marketDemand": "High/Critical/Moderate",
                        "reasoning": "Specific reason why this fits (or doesn't) given their current skills and branch.",
                        "tags": ["Tech1", "Tech2"],
                        "description": "Short role summary.",
                        "recommended": boolean (true only for the #1 match),
                        "effortToMaster": "Low/Medium/High"
                    }
                ],
                "skillsOverlap": {
                    "matched": ["Current skilled technologies"],
                    "missing": ["Top 3 critical technologies to learn next"]
                }
            }

            Output Format:
            Include all 10 domains in the "recommendations" array. Start raw JSON. No markdown.
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
        const data = JSON.parse(jsonStr);

        // Ensure robust structure with defaults
        return {
            globalAssessment: data.globalAssessment || "Analysis complete.",
            topInsight: data.topInsight || "Keep building your skills.",
            recommendations: (data.recommendations || []).map((rec, index) => ({
                ...rec,
                id: index + 1,
                title: rec.title || "Career Path",
                matchScore: rec.matchScore || 50,
                marketDemand: rec.marketDemand || "Stable",
                effortToMaster: rec.effortToMaster || "Medium",
                tags: rec.tags || [],
                description: rec.description || "Detailed analysis available on explore.",
                reasoning: rec.reasoning || "Based on your current profile strengths."
            })),
            skillsOverlap: {
                matched: data.skillsOverlap?.matched || [],
                missing: data.skillsOverlap?.missing || []
            }
        };

    } catch (error) {
        console.error("Gemini AI Error (Recommendations):", error);
        return [];
    }
};

const getDomainDetails = async (domainTitle, userProfile) => {
    const { branch, year, skills } = userProfile;

    try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        const prompt = `
            Create a detailed career guide for the domain: "${domainTitle}".
            Target Audience: ${year} year ${branch} student who knows [${skills.join(', ')}].

            Provide the following details in JSON format:
            1. overview: A motivating overview of the field (2-3 sentences).
            2. whyGoodFit: Why this is a good choice for them specifically.
            3. currentStatus: A string indicating their current proficiency for THIS domain specifically (e.g., "Novice", "Early Beginner", "Ready to Build", "Job Ready") based on their skills (${skills.join(', ')}).
            4. matchReasoning: A detailed 2-3 sentence analysis of their current skills relative to industry standards for this domain.
            5. salaryRange: Estimated entry-level salary range in India (LPA).
            6. roadmap: An array of 5 granular, technical steps (strings) to go from their current level to professional.
            7. learningResources: An array of 3 recommended free learning resources or platforms.
            8. projectIdeas: An array of 3 specific project ideas that would boost their profile for this domain.
            9. skillGap: An object with:
                - matchingPercentage: (number 0-100)
                - gapPercentage: (number 0-100)
                - matchedSkills: Array of their current skills that apply to this domain.
                - missingSkills: Array of 5-7 technical skills they MUST learn next for this domain.
            10. alternativeDomains: An array of 2-3 OTHER domains they should explore based on their profile.
            11. nextLearningPriority: The single most important technology to learn RIGHT NOW.

            Output Format:
            Raw JSON object. No markdown.
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
