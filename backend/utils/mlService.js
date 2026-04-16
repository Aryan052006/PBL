/**
 * ML Service HTTP client — connects Node.js backend to the Python FastAPI microservice.
 * Priority chain: ML Service → Rule-based fallback
 */

const http = require('http');

const ML_SERVICE_BASE = process.env.ML_SERVICE_URL || 'http://127.0.0.1:8000';
const TIMEOUT_MS = 90000;

/** Check if the ML service is alive */
async function checkMLServiceHealth() {
    return new Promise((resolve) => {
        const req = http.get(`${ML_SERVICE_BASE}/health`, { timeout: 2000 }, (res) => {
            resolve(res.statusCode === 200);
        });
        req.on('error', () => resolve(false));
        req.on('timeout', () => { req.destroy(); resolve(false); });
    });
}

/** Generic POST to the ML service */
function postToML(path, body) {
    return new Promise((resolve, reject) => {
        const payload = JSON.stringify(body);
        const url = new URL(ML_SERVICE_BASE);

        const options = {
            hostname: url.hostname,
            port: url.port || (url.protocol === 'https:' ? 443 : 80),
            path,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(payload),
            },
            timeout: TIMEOUT_MS,
        };

        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                try {
                    const parsed = JSON.parse(data);
                    if (res.statusCode >= 200 && res.statusCode < 300) {
                        resolve(parsed);
                    } else {
                        reject(new Error(parsed.detail || `ML service returned ${res.statusCode}`));
                    }
                } catch (e) {
                    reject(new Error('Invalid JSON from ML service'));
                }
            });
        });

        req.on('error', (e) => reject(e));
        req.on('timeout', () => { req.destroy(); reject(new Error('ML service timeout')); });
        req.write(payload);
        req.end();
    });
}

/** POST multipart form data (for file uploads) to ML service */
function postFileToML(path, fileBuffer, mimetype, filename) {
    return new Promise((resolve, reject) => {
        const boundary = `----FormBoundary${Date.now()}`;
        const header = Buffer.from(
            `--${boundary}\r\nContent-Disposition: form-data; name="file"; filename="${filename}"\r\nContent-Type: ${mimetype}\r\n\r\n`
        );
        const footer = Buffer.from(`\r\n--${boundary}--\r\n`);
        const body = Buffer.concat([header, fileBuffer, footer]);

        const url = new URL(ML_SERVICE_BASE);
        const options = {
            hostname: url.hostname,
            port: url.port || (url.protocol === 'https:' ? 443 : 80),
            path,
            method: 'POST',
            headers: {
                'Content-Type': `multipart/form-data; boundary=${boundary}`,
                'Content-Length': body.length,
            },
            timeout: TIMEOUT_MS,
        };

        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                try {
                    const parsed = JSON.parse(data);
                    if (res.statusCode >= 200 && res.statusCode < 300) {
                        resolve(parsed);
                    } else {
                        reject(new Error(parsed.detail || `ML service ${res.statusCode}`));
                    }
                } catch (e) {
                    reject(new Error('Invalid JSON from ML service'));
                }
            });
        });

        req.on('error', (e) => reject(e));
        req.on('timeout', () => { req.destroy(); reject(new Error('ML service timeout')); });
        req.write(body);
        req.end();
    });
}

/**
 * Get career domain recommendations via KNN + RAG pipeline.
 * @param {object} profile - { branch, year, skills, interests, cgpa, projects_count, ... }
 */
async function getRecommendationsML(profile) {
    try {
        const result = await postToML('/recommend', {
            branch: profile.branch || 'ce',
            year: profile.year || '3rd Year',
            skills: profile.skills || [],
            interests: profile.interests || [],
            cgpa: parseFloat(profile.cgpa) || 0,
            projects_count: parseInt(profile.projects_count) || 0,
            internship_experience: parseInt(profile.internship_experience) || 0,
            certifications: parseInt(profile.certifications) || 0,
            coding_platform_rating: parseInt(profile.coding_platform_rating) || 0,
            communication_score: parseInt(profile.communication_score) || 5,
            aptitude_score: parseFloat(profile.aptitude_score) || 50,
            hackathon_count: parseInt(profile.hackathon_count) || 0,
            domain_interest: profile.interests || [],
        });
        console.log('[MLService] Recommendation success — source:', result.source);
        return result;
    } catch (err) {
        console.error('[MLService] getRecommendationsML failed. Details:', {
            message: err.message,
            stack: err.stack
        });
        return null;
    }
}

/**
 * Get deep domain detail guide via RAG pipeline.
 * @param {string} domain - Domain title
 * @param {object} profile - { branch, year, skills }
 */
async function getDomainDetailsML(domain, profile) {
    try {
        const result = await postToML('/explore', {
            domain,
            branch: profile.branch || 'ce',
            year: profile.year || '3rd Year',
            skills: profile.skills || [],
        });
        console.log('[MLService] Domain explore success — source:', result.source);
        return result;
    } catch (err) {
        console.warn('[MLService] getDomainDetailsML failed:', err.message);
        return null;
    }
}

/**
 * Analyze a resume file via the ML service.
 * @param {Buffer} buffer - File buffer
 * @param {string} mimetype - File MIME type
 * @param {string} filename - Original filename
 */
async function analyzeResumeML(buffer, mimetype, filename = 'resume.pdf') {
    try {
        const result = await postFileToML('/analyze-resume', buffer, mimetype, filename);
        console.log('[MLService] Resume analysis success — source:', result.source);
        return result;
    } catch (err) {
        console.warn('[MLService] analyzeResumeML failed:', err.message);
        return null;
    }
}

/**
 * Predict matching job titles from a resume via the ML service.
 * Uses semantic similarity against 500+ job descriptions.
 * @param {Buffer} buffer - File buffer
 * @param {string} mimetype - File MIME type
 * @param {string} filename - Original filename
 */
async function predictJobML(buffer, mimetype, filename = 'resume.pdf') {
    try {
        const result = await postFileToML('/predict-job', buffer, mimetype, filename);
        console.log('[MLService] Job prediction success — source:', result.source);
        return result;
    } catch (err) {
        console.warn('[MLService] predictJobML failed:', err.message);
        return null;
    }
}

module.exports = {
    checkMLServiceHealth,
    getRecommendationsML,
    getDomainDetailsML,
    analyzeResumeML,
    predictJobML,
};
