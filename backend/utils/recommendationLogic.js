const careerPaths = require('../data/careerPaths');

const calculateMatchScore = (userProfile) => {
    const { branch, skills, interests } = userProfile;

    // Normalize inputs
    const userSkills = (skills || []).map(s => s.toLowerCase().trim());
    const userInterests = (interests || []).map(i => i.toLowerCase().trim());
    const userBranch = (branch || "").toLowerCase();

    const recommendations = careerPaths.map(path => {
        let score = 0;
        let reasons = [];

        // 1. Skill Match (Weighted heavily: 50%)
        const matchingSkills = path.keywords.filter(keyword =>
            userSkills.some(skill => skill.includes(keyword) || keyword.includes(skill))
        );
        const skillScore = Math.min((matchingSkills.length / 3) * 50, 50); // Cap at 50%
        score += skillScore;
        if (matchingSkills.length > 0) reasons.push(`Matches your skills in ${matchingSkills.slice(0, 2).join(", ")}`);

        // 2. Branch Match (Weighted: 30%)
        if (path.preferredBranches.includes(userBranch)) {
            score += 30;
            reasons.push(`Great fit for ${userBranch.toUpperCase()} students`);
        } else if (["cs", "it"].includes(userBranch)) {
            // CS/IT are generally good for most tech roles
            score += 15;
        }

        // 3. Interest Match (Weighted heavily: +40 points)
        // We check if the user explicitly selected an interest that maps to this domain
        const normalizedPathTitle = path.title.toLowerCase();

        const matchingInterests = userInterests.filter(interest =>
            path.keywords.some(k => interest.includes(k) || k.includes(interest)) ||
            normalizedPathTitle.includes(interest) ||
            (interest === "web dev" && path.keywords.includes("web")) ||
            (interest === "app dev" && path.keywords.includes("mobile")) ||
            (interest === "ai/ml" && path.keywords.includes("machine learning")) ||
            (interest === "robotics" && path.keywords.includes("robotics"))
        );

        if (matchingInterests.length > 0) {
            score += 40; // High impact: implies "I want to do this"
            reasons.push(`Strongly aligns with your interest in ${matchingInterests[0]}`);
        } else if (matchingInterests.length === 0 && userInterests.length > 0) {
            // Optional: slight penalty or just no bonus
        }

        // Base score for everyone to avoid 0s
        score = Math.max(score, 10);

        return {
            ...path,
            matchScore: Math.round(score),
            reasoning: reasons,
            recommended: score > 60 // Threshold for "Recommended" tag
        };
    });

    // Sort by score descending
    return recommendations.sort((a, b) => b.matchScore - a.matchScore);
};

module.exports = { calculateMatchScore };
