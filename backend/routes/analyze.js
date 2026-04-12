const express = require('express');
const router = express.Router();
const multer = require('multer');
const pdf = require('pdf-parse');
const benchmarks = require('../data/benchmarks.json');
const { analyzeWithGemini } = require('../utils/gemini');
const { analyzeResumeML, predictJobML } = require('../utils/mlService');

// Configure Multer
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Helper: Calculate Score for a specific domain (Rule-based fallback)
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
    const criticalGaps = rules.mustHave.filter(skill => !lowerText.includes(skill.toLowerCase()));
    const boosters = rules.hotSkills ? rules.hotSkills.filter(skill => !lowerText.includes(skill.toLowerCase())) : [];

    // Rudimentary ATS score for rule-based fallback
    const atsScoreObj = {
        score: Math.min(100, Math.round(totalScore * 0.8 + 15)),
        breakdown: {
            Structure: Math.round(sectionScore),
            KeywordOptimization: Math.round(keywordScore),
            Impact: Math.min(100, Math.round(keywordScore * 0.7)),
            Formatting: 80
        }
    };

    return {
        score: totalScore,
        atsScore: atsScoreObj,
        details: { keywordScore, sectionScore, foundKeywords, missingKeywords, criticalGaps, boosters }
    };
};

const estimateSalary = (score, salaryRange) => {
    const { min, max, currency } = salaryRange;
    const factor = Math.max(0, (score - 40) / 60);
    const estimated = Math.round(min + (max - min) * factor);
    return {
        value: estimated, currency, min, max,
        formatted: `${currency === 'USD' ? '$' : '₹'}${estimated.toLocaleString()}`
    };
};

router.post('/upload', upload.single('resume'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ msg: "No file uploaded" });

        // ── STEP 1: ML Service (Primary) ──────────────────────────────────
        console.log("[Analyze] Step 1: Attempting ML service analysis...");
        const mlResult = await analyzeResumeML(
            req.file.buffer,
            req.file.mimetype,
            req.file.originalname || 'resume.pdf'
        );

        if (mlResult) {
            console.log("[Analyze] ML analysis successful.");
            return res.json({ success: true, isAI: true, data: mlResult });
        }

        // ── STEP 2: Gemini API (Fallback) ─────────────────────────────────
        console.log("[Analyze] Step 2: ML failed — attempting Gemini analysis...");
        const aiResult = await analyzeWithGemini({
            buffer: req.file.buffer,
            mimetype: req.file.mimetype
        });

        if (aiResult) {
            console.log("[Analyze] Advanced analysis successful.");
            return res.json({ success: true, isAI: true, data: { ...aiResult, source: 'CareerForge-Intelligence-Link' } });
        }

        // ── STEP 3: Fallback Analysis ─────────────────────────────────────
        console.log("[Analyze] Step 3: Using standard analysis fallback...");

        let textForAnalysis = "";
        if (req.file.mimetype === 'application/pdf' || req.file.originalname?.endsWith('.pdf')) {
            let parseFunc = pdf;
            if (typeof pdf !== 'function') {
                if (typeof pdf.default === 'function') parseFunc = pdf.default;
            }
            try {
                const data = await parseFunc(req.file.buffer);
                textForAnalysis = data.text;
            } catch (err) {
                console.warn("[Analyze] PDF extraction failed:", err.message);
            }
        } else if (req.file.mimetype.startsWith('text/')) {
            textForAnalysis = req.file.buffer.toString('utf8');
        }

        if (!textForAnalysis || textForAnalysis.trim().length === 0) {
            return res.status(400).json({ msg: "Analysis failed — could not extract text from the file." });
        }

        const allDomains = Object.keys(benchmarks);
        let bestDomain = "", highestScore = -1, bestResult = null;
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
                atsScore: bestResult.atsScore,
                status,
                salary,
                jobTitles: domainRules.roles,
                scores,
                gaps: bestResult.details.missingKeywords.slice(0, 8),
                boosters: bestResult.details.boosters,
                tips,
                source: 'rule-based',
            }
        });

    } catch (err) {
        console.error("[Analyze] Critical error:", err);
        res.status(500).json({ msg: `Analysis Failed: ${err.message}` });
    }
});

// @route POST /api/analyze/predict-job
// Resume → Job Title prediction via ML semantic similarity
router.post('/predict-job', upload.single('resume'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ msg: "No file uploaded" });

        console.log("[PredictJob] Forwarding resume to ML service...");
        const result = await predictJobML(
            req.file.buffer,
            req.file.mimetype,
            req.file.originalname || 'resume.pdf'
        );

        if (result && result.predictions) {
            console.log("[PredictJob] Success —", result.predictions.length, "predictions returned.");
            return res.json({ success: true, data: result });
        }

        return res.status(503).json({ msg: "Job prediction service is unavailable. Please try again later." });
    } catch (err) {
        console.error("[PredictJob] Error:", err.message);
        res.status(500).json({ msg: `Job Prediction Failed: ${err.message}` });
    }
});

module.exports = router;
