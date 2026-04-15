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
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const prompt = `
            Act as an elite career strategist and high-level technical consultant for top-tier Indian engineering talent. Your tone is bold, authoritative, and visionary.

            Student Profile:
            - Identifier: {year} {ctx.name} Candidate
            - Current Expertise: ${skills.length > 0 ? skills.join(', ') : "Strategic foundation under development"}

            Institutional Context:
            ${ctx.note}

            Sector-Specific Verticals (PRIORITY):
            ${ctx.specializedDomains.map((d, i) => `${i + 1}. ${d}`).join('\n            ')}

            Task:
            Construct a comprehensive market-positioning strategy in JSON format.
            Analyze the candidate across exactly 10 domains. Prioritize the sector-specific verticals mentioned above.

            STRATEGIC SCORING ARCHITECTURE:
            - Sector Verticals: Provide a high-confidence evaluation. Even with minimal baseline skills, award a baseline of 60-75 score for the candidate's core branch path to maintain momentum.
            - Adjacent Verticals: Award high scores ONLY if the candidate demonstrates explicit, high-value technical competencies.
            - Primary Recommendation: Set the "recommended: true" flag for the single most advantageous career pivot for this candidate.

            Response JSON format:
            {
                "globalAssessment": "A powerful 2-3 sentence strategic overview of the candidate's current market value and potential within the Indian hierarchy.",
                "topInsight": "A single, high-leverage strategic insight that will push this candidate into the top 1% of their field.",
                "recommendations": [
                    {
                        "title": "Domain Name",
                        "matchScore": number (0-100),
                        "marketDemand": "High/Critical/Moderate",
                        "reasoning": "Direct, expert analysis of why this fit is a strategic win or why it requires refinement.",
                        "tags": ["Focus Area 1", "Focus Area 2"],
                        "description": "Bold sector overview.",
                        "recommended": boolean,
                        "effortToMaster": "Low/Medium/High"
                    }
                ],
                "skillsOverlap": {
                    "matched": ["High-value competencies currently held"],
                    "missing": ["The 3 most critical missing pieces to achieve market dominance"]
                }
            }

            Tone: Assertive, authoritative, and expert. Output EXACT JSON with no markdown.
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
        console.error("Gemini AI Error (Recommendations):", error.message);
        return {
            globalAssessment: "Our elite intelligence core is currently experiencing high demand. Strategy generation is partially limited.",
            topInsight: "Focus on your core engineering fundamentals while we recalibrate your roadmap.",
            recommendations: [],
            skillsOverlap: { matched: [], missing: [] }
        };
    }
};

const getDomainDetails = async (domainTitle, userProfile) => {
    const { branch, year, skills } = userProfile;

    const branchKey = (branch || "ce").toLowerCase();
    const ctx = BRANCH_CONTEXT[branchKey] || BRANCH_CONTEXT["ce"];

    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const prompt = `
            Construct an authoritative, high-gravity career guide for the domain: "${domainTitle}".
            Target Persona: Year ${year} ${ctx.name} Professional-in-training with foundational knowledge in [${skills && skills.length > 0 ? skills.join(', ') : "Strategic technologies yet to be acquired"}].

            Generate a strategic domain blueprint in JSON:
            1. overview: A bold, 3-sentence vision of why this sector is a premier career vertical.
            2. whyGoodFit: A confident technical rationale for why an student of ${ctx.name} background is uniquely positioned for dominance here.
            3. currentStatus: Authoritative status (e.g., "Novice", "Early Beginner", "Building Momentum", "Job Ready").
            4. matchReasoning: A sharp, 3-sentence technical audit of their current competencies vs. global industry standards.
            5. salaryRange: Real-world high-trajectory entry-level salary range in India (LPA).
            6. roadmap: 5 granular, high-intensity technical milestones (strings) to achieve professional mastery.
            7. learningResources: 3 curated, top-tier free resource platforms.
            8. projectIdeas: 3 high-impact project concepts that demonstrate absolute section dominance.
            9. skillGap: {
                "matchingPercentage": (number 0-100),
                "gapPercentage": (number 0-100),
                "matchedSkills": current relevant competencies,
                "missingSkills": 5-7 mission-critical technologies needed to bridge the gap.
            }
            10. alternativeDomains: 2-3 adjacent high-growth pivots.
            11. nextLearningPriority: The single most important competitive advantage they must acquire IMMEDIATELY.

            Tone: Assertive, বিশেষজ্ঞ (expert), and visionary. Raw JSON only.
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
