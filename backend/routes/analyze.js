const express = require('express');
const router = express.Router();
const multer = require('multer');
const pdf = require('pdf-parse');
const benchmarks = require('../data/benchmarks.json');

// Configure Multer
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Helper: Calculate Score for a specific domain
const calculateDomainScore = (text, domainKey) => {
    const lowerText = text.toLowerCase();
    const rules = benchmarks[domainKey];

    if (!rules) return { score: 0 };

    let keywordMatches = 0;
    const foundKeywords = [];
    const missingKeywords = [];

    rules.keywords.forEach(word => {
        if (lowerText.includes(word.toLowerCase())) {
            keywordMatches++;
            foundKeywords.push(word);
        } else {
            missingKeywords.push(word);
        }
    });

    const keywordScore = Math.min(100, (keywordMatches / rules.keywords.length) * 100);

    let sectionMatches = 0;
    rules.sections.forEach(sec => {
        if (new RegExp(sec, 'i').test(lowerText)) sectionMatches++;
    });
    const sectionScore = (sectionMatches / rules.sections.length) * 100;

    const totalScore = Math.round((keywordScore * 0.6) + (sectionScore * 0.4));

    // Identify Critical Gaps (Must Haves)
    const criticalGaps = rules.mustHave.filter(skill => !lowerText.includes(skill.toLowerCase()));

    // Identify Boosters (Hot Skills missing)
    const boosters = rules.hotSkills ? rules.hotSkills.filter(skill => !lowerText.includes(skill.toLowerCase())) : [];

    return {
        score: totalScore,
        details: {
            keywordScore,
            sectionScore,
            foundKeywords,
            missingKeywords,
            criticalGaps,
            boosters
        }
    };
};

const estimateSalary = (score, salaryRange) => {
    const { min, max, currency } = salaryRange;
    // Simple linear interpolation based on score (baseline 50%)
    // Score < 40 -> Min Salary
    // Score 100 -> Max Salary
    const factor = Math.max(0, (score - 40) / 60);
    const estimated = Math.round(min + (max - min) * factor);
    return {
        value: estimated,
        currency,
        min,
        max,
        formatted: `${currency === 'USD' ? '$' : '₹'}${estimated.toLocaleString()}`
    };
};

router.post('/upload', upload.single('resume'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ msg: "No file uploaded" });

        // PDF Parsing Logic (Robust import handling)
        let parseFunc = pdf;
        if (typeof pdf !== 'function') {
            if (typeof pdf.default === 'function') parseFunc = pdf.default;
            else if (typeof pdf.pdf === 'function') parseFunc = pdf.pdf;
        }

        let textForAnalysis = "";
        if (req.file.mimetype.includes('pdf') || req.file.originalname.endsWith('.pdf')) {
            const data = await parseFunc(req.file.buffer);
            textForAnalysis = data.text;
        } else {
            textForAnalysis = req.file.buffer.toString('utf8');
        }

        if (!textForAnalysis || textForAnalysis.trim().length === 0) {
            return res.status(400).json({ msg: "Could not extract text." });
        }

        // --- Multi-Domain Analysis ---
        const allDomains = Object.keys(benchmarks);
        let bestDomain = "";
        let highestScore = -1;
        let bestResult = null;

        // 1. Score against all domains
        const scores = {};
        allDomains.forEach(domain => {
            const result = calculateDomainScore(textForAnalysis, domain);
            scores[domain] = result.score;
            if (result.score > highestScore) {
                highestScore = result.score;
                bestDomain = domain;
                bestResult = result;
            }
        });

        // 2. Fallback if score is too low
        if (highestScore < 20) {
            bestDomain = "computer science"; // Default base
            bestResult = calculateDomainScore(textForAnalysis, bestDomain);
        }

        // 3. Generate Insights for the Best Fit Domain
        const domainRules = benchmarks[bestDomain];
        const salary = estimateSalary(bestResult.score, domainRules.salary);

        // Status
        let status = "Getting There";
        if (highestScore > 80) status = "Job Ready";
        else if (highestScore > 60) status = "Solid Candidate";
        else if (highestScore > 40) status = "Needs Polishing";

        // Tips Generation
        const tips = [];
        if (bestResult.details.criticalGaps.length > 0) {
            tips.push(`Critical: You are missing core skills: ${bestResult.details.criticalGaps.join(', ')}.`);
        }
        if (bestResult.details.boosters.length > 0) {
            tips.push(`Salary Boost: Learn ${bestResult.details.boosters.join(', ')} to increase your market value.`);
        }
        if (bestResult.details.sectionScore < 50) {
            tips.push("Structure: Ensure you have clear 'Projects', 'Experience', and 'Education' sections.");
        }

        res.json({
            success: true,
            data: {
                bestFitDomain: bestDomain,
                score: highestScore,
                status,
                salary,
                jobTitles: domainRules.roles,
                scores: scores, // Return all scores for comparison chart
                gaps: bestResult.details.missingKeywords.slice(0, 8),
                boosters: bestResult.details.boosters,
                tips: tips
            }
        });

    } catch (err) {
        console.error("Analysis Error:", err);
        res.status(500).json({ msg: `Analysis Failed: ${err.message}` });
    }
});

module.exports = router;
