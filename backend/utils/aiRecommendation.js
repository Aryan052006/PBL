const { GoogleGenerativeAI } = require("@google/generative-ai");
const dotenv = require('dotenv');

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_KEY);

// Branch display names and their specialized domain lists
const BRANCH_CONTEXT = {
    ce: {
        name: "Computer Engineering (CE)",
        specializedDomains: [
            "Full Stack Web Development",
            "AI & Data Science",
            "DevOps & Cloud Engineering",
            "Cybersecurity",
            "Blockchain Technology"
        ],
        note: "CE students have a strong CS foundation. Prioritize software-heavy domains."
    },
    it: {
        name: "Information Technology (IT)",
        specializedDomains: [
            "Full Stack Web Development",
            "AI & Data Science",
            "Cloud & DevOps",
            "Cybersecurity",
            "Data Engineering & Analytics"
        ],
        note: "IT students excel in networks, databases, and application development."
    },
    entc: {
        name: "Electronics & Telecommunication (ENTC)",
        specializedDomains: [
            "Embedded Systems & IoT",
            "VLSI & Chip Design",
            "Signal Processing & DSP",
            "Telecommunications & 5G",
            "Robotics & Automation"
        ],
        note: "ENTC students have a hardware & electronics foundation. Domain recommendations should strongly favour embedded, VLSI, signal processing, telecom, and IoT. Only recommend pure software domains if the student explicitly has those skills."
    },
    ece: {
        name: "Electronics & Computer Engineering (E & CE)",
        specializedDomains: [
            "Embedded Systems & IoT",
            "VLSI & Chip Design",
            "Signal Processing & DSP",
            "Telecommunications & 5G",
            "Robotics & Automation"
        ],
        note: "E & CE students bridge hardware and software. Strongly prefer electronics-centric domains and embedded/IoT paths. Full Stack or AI is secondary unless skills support it."
    },
    aids: {
        name: "Artificial Intelligence & Data Science (AIDS)",
        specializedDomains: [
            "AI & Data Science",
            "Computer Vision & Image Processing",
            "Natural Language Processing",
            "Data Engineering & Analytics",
            "Full Stack Web Development (AI-focused)"
        ],
        note: "AIDS students are purpose-built for AI/ML. Prioritize AI, ML, Computer Vision, NLP, and Data Engineering. Other domains are low priority unless skills suggest otherwise."
    }
};

const getGeminiRecommendation = async (userProfile) => {
    const { branch, skills, interests, year } = userProfile;

    // Get branch context (fallback to CE if unknown)
    const branchKey = (branch || "ce").toLowerCase();
    const ctx = BRANCH_CONTEXT[branchKey] || BRANCH_CONTEXT["ce"];

    try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        const prompt = `
            Act as a high-level career strategist for Indian engineering students.

            Student Profile:
            - Branch: ${ctx.name}
            - Year: ${year}
            - Known Skills: ${skills.length > 0 ? skills.join(', ') : "None specified yet"}

            Branch Context:
            ${ctx.note}

            Branch-Specialized Domains (MUST be prioritized and scored first for this branch):
            ${ctx.specializedDomains.map((d, i) => `${i + 1}. ${d}`).join('\n            ')}

            Task:
            Provide a comprehensive career strategy in JSON format.
            Evaluate the student across exactly 10 domains. The 10 domains MUST include ALL of the branch-specialized domains listed above. Fill the remaining slots with the most relevant general tech domains.

            IMPORTANT SCORING RULES:
            - For branch-specialized domains: Score based purely on skill match potential for someone in this branch. If skills are empty, still give a moderate-high score (50-75) for the most branch-relevant domains as a baseline.
            - For non-specialized domains: Only give high scores if the student has explicit matching skills.
            - The "recommended: true" flag must go to the single best domain for this student's branch + skills combination.

            The response must be a single JSON object:
            {
                "globalAssessment": "A 2-sentence summary of the student's current academic/skill standing in the Indian market considering their branch.",
                "topInsight": "A single, powerful piece of advice for career growth tailored to their branch.",
                "recommendations": [
                    {
                        "title": "Domain Name",
                        "matchScore": number (0-100),
                        "marketDemand": "High/Critical/Moderate",
                        "reasoning": "Specific reason why this fits (or doesn't) given their branch, year, and current skills.",
                        "tags": ["Tech1", "Tech2"],
                        "description": "Short role summary.",
                        "recommended": boolean (true only for the single #1 match),
                        "effortToMaster": "Low/Medium/High"
                    }
                ],
                "skillsOverlap": {
                    "matched": ["Current skilled technologies relevant to their field"],
                    "missing": ["Top 3 critical technologies to learn next for their branch"]
                }
            }

            Output Format:
            Include exactly 10 domains in the "recommendations" array, sorted by matchScore descending. Raw JSON only. No markdown.
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

    const branchKey = (branch || "ce").toLowerCase();
    const ctx = BRANCH_CONTEXT[branchKey] || BRANCH_CONTEXT["ce"];

    try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        const prompt = `
            Create a detailed career guide for the domain: "${domainTitle}".
            Target Audience: Year ${year} ${ctx.name} student who knows [${skills && skills.length > 0 ? skills.join(', ') : "no specific skills yet"}].

            Provide the following details in JSON format:
            1. overview: A motivating overview of the field (2-3 sentences).
            2. whyGoodFit: Why this is a good choice for a ${ctx.name} student specifically.
            3. currentStatus: A string indicating their current proficiency for THIS domain specifically (e.g., "Novice", "Early Beginner", "Ready to Build", "Job Ready") based on their skills.
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
            10. alternativeDomains: An array of 2-3 OTHER domains they should explore based on their branch and profile.
            11. nextLearningPriority: The single most important technology to learn RIGHT NOW for their branch.

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
