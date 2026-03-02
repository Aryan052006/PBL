const express = require('express');
const router = express.Router();
const multer = require('multer');
const pdf = require('pdf-parse');
const benchmarks = require('../data/benchmarks.json');
const { analyzeWithGemini } = require('../utils/gemini');

// Configure Multer
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Helper: Calculate Score for a specific domain (Fallback Logic)
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

        // --- Step 1: Try AI Analysis (Gemini Multi-Modal) ---
        console.log("Attempting AI analysis with Gemini (Multi-modal)...");
        // We pass the buffer and mimetype directly to support images and PDFs
        const aiResult = await analyzeWithGemini({
            buffer: req.file.buffer,
            mimetype: req.file.mimetype
        });

        if (aiResult) {
            console.log("AI analysis successful.");
            return res.json({
                success: true,
                isAI: true,
                data: aiResult
            });
        }

        // --- Step 2: Fallback to Rule-Based Analysis (Extract text first) ---
        console.log("AI analysis failed or returned null. Falling back to rule-based analysis.");

        let textForAnalysis = "";
        if (req.file.mimetype === 'application/pdf' || req.file.originalname.endsWith('.pdf')) {
            let parseFunc = pdf;
            if (typeof pdf !== 'function') {
                if (typeof pdf.default === 'function') parseFunc = pdf.default;
                else if (typeof pdf.pdf === 'function') parseFunc = pdf.pdf;
            }
            try {
                const data = await parseFunc(req.file.buffer);
                textForAnalysis = data.text;
            } catch (err) {
                console.warn("PDF text extraction failed for fallback:", err.message);
            }
        } else if (req.file.mimetype.startsWith('text/')) {
            textForAnalysis = req.file.buffer.toString('utf8');
        }

        if (!textForAnalysis || textForAnalysis.trim().length === 0) {
            return res.status(400).json({ msg: "Analysis failed and could not extract text for fallback." });
        }

        const allDomains = Object.keys(benchmarks);
        let bestDomain = "";
        let highestScore = -1;
        let bestResult = null;

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

        if (highestScore < 20) {
            bestDomain = "computer science";
            bestResult = calculateDomainScore(textForAnalysis, bestDomain);
        }

        const domainRules = benchmarks[bestDomain];
        const salary = estimateSalary(bestResult.score, domainRules.salary);

        let status = "Getting There";
        if (highestScore > 80) status = "Job Ready";
        else if (highestScore > 60) status = "Solid Candidate";
        else if (highestScore > 40) status = "Needs Polishing";

        const tips = [];
        if (bestResult.details.criticalGaps.length > 0) {
            tips.push(`Critical: You are missing core skills: ${bestResult.details.criticalGaps.join(', ')}.`);
        }
        if (bestResult.details.boosters.length > 0) {
            tips.push(`Salary Boost: Learn ${bestResult.details.boosters.join(', ')} to increase your market value.`);
        }

        res.json({
            success: true,
            isAI: false,
            data: {
                bestFitDomain: bestDomain,
                score: highestScore,
                status,
                salary,
                jobTitles: domainRules.roles,
                scores: scores,
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

