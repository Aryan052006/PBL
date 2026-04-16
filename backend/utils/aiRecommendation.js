/**
 * Rule-based recommendation engine.
 * No external API keys required — uses BRANCH_CONTEXT + skill matching.
 */

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
        note: "ENTC students have a hardware & electronics foundation."
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
        note: "E & CE students bridge hardware and software."
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
        note: "AIDS students are purpose-built for AI/ML."
    }
};

// Domain knowledge for rule-based scoring
const DOMAIN_SKILLS = {
    "Full Stack Web Development": {
        keywords: ["html", "css", "javascript", "react", "node", "express", "mongodb", "next.js", "typescript", "postgresql", "api", "rest"],
        marketDemand: "Critical",
        description: "Build end-to-end web applications — from responsive UIs to scalable backend APIs and databases.",
        tags: ["React", "Node.js", "MongoDB", "REST APIs"],
        effort: "Medium"
    },
    "AI & Data Science": {
        keywords: ["python", "tensorflow", "pytorch", "machine learning", "data science", "numpy", "pandas", "scikit", "ml", "ai", "deep learning", "neural"],
        marketDemand: "Critical",
        description: "Design intelligent systems using machine learning, deep learning, and statistical analysis.",
        tags: ["Python", "TensorFlow", "ML", "Data Analysis"],
        effort: "High"
    },
    "DevOps & Cloud Engineering": {
        keywords: ["docker", "kubernetes", "aws", "azure", "ci/cd", "jenkins", "terraform", "linux", "cloud", "devops", "gcp"],
        marketDemand: "High",
        description: "Automate infrastructure, manage cloud deployments, and build reliable CI/CD pipelines.",
        tags: ["Docker", "AWS", "CI/CD", "Kubernetes"],
        effort: "Medium"
    },
    "Cloud & DevOps": {
        keywords: ["docker", "kubernetes", "aws", "azure", "ci/cd", "jenkins", "terraform", "linux", "cloud", "devops", "gcp"],
        marketDemand: "High",
        description: "Automate infrastructure, manage cloud deployments, and build reliable CI/CD pipelines.",
        tags: ["Docker", "AWS", "CI/CD", "Kubernetes"],
        effort: "Medium"
    },
    "Cybersecurity": {
        keywords: ["security", "penetration", "ethical hacking", "firewall", "encryption", "network security", "kali", "wireshark", "owasp", "soc"],
        marketDemand: "High",
        description: "Protect digital assets through vulnerability assessment, threat modeling, and security architecture.",
        tags: ["Network Security", "Ethical Hacking", "OWASP", "SOC"],
        effort: "High"
    },
    "Blockchain Technology": {
        keywords: ["solidity", "ethereum", "smart contract", "web3", "blockchain", "defi", "nft", "crypto", "dapp"],
        marketDemand: "Moderate",
        description: "Build decentralized applications and smart contracts on blockchain platforms.",
        tags: ["Solidity", "Ethereum", "Smart Contracts", "Web3"],
        effort: "High"
    },
    "Embedded Systems & IoT": {
        keywords: ["arduino", "raspberry", "embedded", "iot", "microcontroller", "rtos", "sensor", "c", "firmware", "mqtt"],
        marketDemand: "High",
        description: "Design firmware and connected hardware systems for real-world IoT applications.",
        tags: ["Arduino", "Embedded C", "IoT", "RTOS"],
        effort: "Medium"
    },
    "VLSI & Chip Design": {
        keywords: ["verilog", "vhdl", "fpga", "vlsi", "chip", "asic", "cadence", "synopsys", "rtl", "semiconductor"],
        marketDemand: "High",
        description: "Design and verify integrated circuits and semiconductor chips at the RTL level.",
        tags: ["Verilog", "FPGA", "ASIC", "RTL Design"],
        effort: "High"
    },
    "Signal Processing & DSP": {
        keywords: ["matlab", "signal processing", "dsp", "filter", "fft", "fourier", "simulink", "communication", "modulation"],
        marketDemand: "Moderate",
        description: "Analyze and transform signals for communications, audio, image, and radar systems.",
        tags: ["MATLAB", "DSP", "Filter Design", "FFT"],
        effort: "High"
    },
    "Telecommunications & 5G": {
        keywords: ["5g", "telecom", "lte", "wireless", "rf", "antenna", "communication", "networking", "protocol", "mobile"],
        marketDemand: "High",
        description: "Engineer next-generation wireless communication systems and network protocols.",
        tags: ["5G", "Wireless", "RF", "Networking"],
        effort: "High"
    },
    "Robotics & Automation": {
        keywords: ["ros", "robot", "automation", "control", "plc", "opencv", "actuator", "sensor", "kinematics", "pid"],
        marketDemand: "High",
        description: "Build autonomous robotic systems with perception, control, and planning capabilities.",
        tags: ["ROS", "OpenCV", "Control Systems", "PLC"],
        effort: "High"
    },
    "Computer Vision & Image Processing": {
        keywords: ["opencv", "computer vision", "image processing", "cnn", "yolo", "object detection", "segmentation", "deep learning"],
        marketDemand: "High",
        description: "Develop vision systems that understand images and video using deep learning and classical methods.",
        tags: ["OpenCV", "CNN", "YOLO", "Image Processing"],
        effort: "High"
    },
    "Natural Language Processing": {
        keywords: ["nlp", "transformer", "bert", "gpt", "text", "sentiment", "chatbot", "language model", "huggingface", "spacy"],
        marketDemand: "Critical",
        description: "Build systems that understand, generate, and reason over human language.",
        tags: ["Transformers", "BERT", "NLP", "LLMs"],
        effort: "High"
    },
    "Data Engineering & Analytics": {
        keywords: ["sql", "etl", "data pipeline", "spark", "hadoop", "airflow", "data warehouse", "analytics", "tableau", "power bi"],
        marketDemand: "High",
        description: "Design data pipelines and analytics infrastructure that powers business intelligence.",
        tags: ["SQL", "Spark", "ETL", "Data Pipelines"],
        effort: "Medium"
    },
    "Full Stack Web Development (AI-focused)": {
        keywords: ["react", "node", "python", "api", "ml", "tensorflow", "flask", "fastapi", "javascript", "mongodb"],
        marketDemand: "Critical",
        description: "Combine full-stack web engineering with AI/ML integration for intelligent web applications.",
        tags: ["React", "Python", "FastAPI", "ML Integration"],
        effort: "High"
    }
};

/**
 * Calculate match score between user skills and a domain's keywords.
 */
function calculateSkillMatch(userSkills, domainKeywords) {
    if (!userSkills || userSkills.length === 0) return 0;
    const lowerSkills = userSkills.map(s => s.toLowerCase());
    let matches = 0;
    domainKeywords.forEach(keyword => {
        if (lowerSkills.some(skill => skill.includes(keyword) || keyword.includes(skill))) {
            matches++;
        }
    });
    return Math.round((matches / domainKeywords.length) * 100);
}

/**
 * Rule-based recommendation engine.
 * Returns data in the EXACT same format as the ML/Gemini response.
 */
const getRuleBasedRecommendation = (branch, year, skills, interests) => {
    const branchKey = (branch || "ce").toLowerCase();
    const ctx = BRANCH_CONTEXT[branchKey] || BRANCH_CONTEXT["ce"];
    const skillsArray = Array.isArray(skills) ? skills : (skills || "").split(",").map(s => s.trim()).filter(Boolean);

    // Score all domains
    const scored = [];
    for (const [domainName, domainInfo] of Object.entries(DOMAIN_SKILLS)) {
        let matchScore = calculateSkillMatch(skillsArray, domainInfo.keywords);

        // Branch bonus: +20 for domains in the student's branch specialization
        if (ctx.specializedDomains.some(d => d.toLowerCase() === domainName.toLowerCase())) {
            matchScore = Math.min(100, matchScore + 20);
        }

        // Interest bonus: +10 if interests overlap with domain tags
        if (Array.isArray(interests) && interests.length > 0) {
            const lowerInterests = interests.map(i => i.toLowerCase());
            const hasInterest = domainInfo.tags.some(tag =>
                lowerInterests.some(interest => tag.toLowerCase().includes(interest) || interest.includes(tag.toLowerCase()))
            );
            if (hasInterest) matchScore = Math.min(100, matchScore + 10);
        }

        // Ensure a minimum baseline of 30 for branch-relevant domains
        if (ctx.specializedDomains.some(d => d.toLowerCase() === domainName.toLowerCase())) {
            matchScore = Math.max(35, matchScore);
        }

        scored.push({
            title: domainName,
            matchScore,
            marketDemand: domainInfo.marketDemand,
            description: domainInfo.description,
            tags: domainInfo.tags,
            effortToMaster: domainInfo.effort,
        });
    }

    // Sort by match score descending
    scored.sort((a, b) => b.matchScore - a.matchScore);

    // Take top 10
    const recommendations = scored.slice(0, 10).map((rec, index) => ({
        id: index + 1,
        title: rec.title,
        matchScore: rec.matchScore,
        marketDemand: rec.marketDemand,
        reasoning: `Based on your ${ctx.name} profile and skills [${skillsArray.slice(0, 5).join(', ')}], this domain has a ${rec.matchScore}% match score.`,
        tags: rec.tags,
        description: rec.description,
        recommended: index === 0,
        effortToMaster: rec.effortToMaster,
    }));

    // Build skills overlap
    const allMatchedSkills = [];
    const allMissingSkills = [];
    if (recommendations.length > 0) {
        const topDomain = DOMAIN_SKILLS[recommendations[0].title];
        if (topDomain) {
            const lowerSkills = skillsArray.map(s => s.toLowerCase());
            topDomain.keywords.forEach(kw => {
                if (lowerSkills.some(s => s.includes(kw) || kw.includes(s))) {
                    allMatchedSkills.push(kw);
                } else {
                    allMissingSkills.push(kw);
                }
            });
        }
    }

    return {
        globalAssessment: `As a ${year || '3rd Year'} ${ctx.name} student with ${skillsArray.length} known technologies, your profile shows strong alignment with ${recommendations[0]?.title || 'multiple career domains'}. Focus on deepening your expertise in high-demand areas to maximize placement outcomes.`,
        topInsight: `Prioritize mastering ${allMissingSkills.slice(0, 3).join(', ') || 'core domain skills'} to significantly boost your market competitiveness.`,
        recommendations,
        skillsOverlap: {
            matched: allMatchedSkills.slice(0, 8),
            missing: allMissingSkills.slice(0, 5),
        },
        source: 'rule-based',
    };
};

/**
 * Rule-based domain detail exploration.
 * Returns data in the EXACT same format as the ML/Gemini response.
 */
const getRuleBasedDomainDetails = (domainTitle, branch, year, skills) => {
    const branchKey = (branch || "ce").toLowerCase();
    const ctx = BRANCH_CONTEXT[branchKey] || BRANCH_CONTEXT["ce"];
    const skillsArray = Array.isArray(skills) ? skills : (skills || "").split(",").map(s => s.trim()).filter(Boolean);

    const domainInfo = DOMAIN_SKILLS[domainTitle] || DOMAIN_SKILLS["Full Stack Web Development"];
    const matchScore = calculateSkillMatch(skillsArray, domainInfo?.keywords || []);

    const lowerSkills = skillsArray.map(s => s.toLowerCase());
    const matchedSkills = [];
    const missingSkills = [];
    (domainInfo?.keywords || []).forEach(kw => {
        if (lowerSkills.some(s => s.includes(kw) || kw.includes(s))) {
            matchedSkills.push(kw);
        } else {
            missingSkills.push(kw);
        }
    });

    let currentStatus = "Novice";
    if (matchScore > 70) currentStatus = "Job Ready";
    else if (matchScore > 50) currentStatus = "Building Momentum";
    else if (matchScore > 25) currentStatus = "Early Beginner";

    return {
        overview: domainInfo?.description || `${domainTitle} is a rapidly growing career vertical with strong demand in the Indian tech market.`,
        whyGoodFit: `As a ${ctx.name} student, your academic foundation provides a natural pathway into ${domainTitle}. Your existing skills in ${matchedSkills.slice(0, 3).join(', ') || 'foundational technologies'} give you a head start.`,
        currentStatus,
        matchReasoning: `Your current skill set covers ${matchScore}% of the key competencies required for ${domainTitle}. Focus on bridging the remaining gaps to become industry-ready.`,
        salaryRange: "₹4 LPA - ₹12 LPA (entry-level, India)",
        roadmap: [
            `Master the fundamentals: ${missingSkills.slice(0, 2).join(', ') || 'core concepts'}`,
            `Build 2-3 projects demonstrating ${domainTitle} expertise`,
            `Earn relevant certifications in ${(domainInfo?.tags || []).slice(0, 2).join(', ')}`,
            `Contribute to open-source projects in this domain`,
            `Apply for internships and entry-level roles in ${domainTitle}`
        ],
        learningResources: [
            "freeCodeCamp (freecodecamp.org)",
            "Coursera — Free Audit Track",
            "YouTube — Academic channels & tutorials"
        ],
        projectIdeas: [
            `Build a ${domainTitle} portfolio project showcasing end-to-end skills`,
            `Create a tool that solves a real-world problem using ${(domainInfo?.tags || []).slice(0, 2).join(' and ')}`,
            `Contribute a feature to an open-source ${domainTitle} project`
        ],
        skillGap: {
            matchingPercentage: matchScore,
            gapPercentage: 100 - matchScore,
            matchedSkills,
            missingSkills: missingSkills.slice(0, 7),
        },
        alternativeDomains: ctx.specializedDomains.filter(d => d !== domainTitle).slice(0, 3),
        nextLearningPriority: missingSkills[0] || "Strengthen your foundational skills",
        source: 'rule-based',
    };
};

module.exports = { getRuleBasedRecommendation, getRuleBasedDomainDetails, BRANCH_CONTEXT };
