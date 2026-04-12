"""
Response Formatter — converts internal ML model outputs to the exact
JSON contract that the Node.js backend and frontend expect.
Matches the response structure of the existing Gemini-based functions.
"""


def format_recommend_response(knn_domains: list, rag_assessment: dict, source: str = "CareerForge-Prediction-Core") -> dict:
    """
    Format the /recommend response to match getGeminiRecommendation() output.
    
    knn_domains: list of {title, matchScore, reasoning, tags, description, marketDemand, effortToMaster, recommended}
    rag_assessment: dict with globalAssessment, topInsight, skillsOverlap
    """
    return {
        "globalAssessment": rag_assessment.get("globalAssessment", "Profile analyzed by local ML model."),
        "topInsight": rag_assessment.get("topInsight", "Focus on your highest-scoring domain to maximize career readiness."),
        "recommendations": knn_domains,
        "skillsOverlap": rag_assessment.get("skillsOverlap", {"matched": [], "missing": []}),
        "source": source,
    }


def format_explore_response(domain_detail: dict, source: str = "CareerForge-Intelligence-Link") -> dict:
    """Format the /explore response to match getDomainDetails() output."""
    return {**domain_detail, "source": source}


def format_resume_response(analysis: dict, source: str = "CareerForge-Prediction-Core") -> dict:
    """
    Format the /analyze-resume response to match analyzeWithGemini() output.
    """
    return {
        "bestFitDomain": analysis.get("bestFitDomain", "General Engineering"),
        "score": analysis.get("score", 50),
        "status": analysis.get("status", "Getting There"),
        "salary": analysis.get("salary", {"min": 500000, "max": 1200000, "currency": "INR", "formatted": "₹5L - ₹12L"}),
        "jobTitles": analysis.get("jobTitles", []),
        "gaps": analysis.get("gaps", []),
        "boosters": analysis.get("boosters", []),
        "tips": analysis.get("tips", []),
        "marketAnalysis": analysis.get("marketAnalysis", ""),
        "executiveSummary": analysis.get("executiveSummary", ""),
        "domainSuitability": analysis.get("domainSuitability", []),
        "skillGap": analysis.get("skillGap", {"matchingPercentage": 50, "gapPercentage": 50}),
        "atsScore": analysis.get("atsScore", None),
        "source": source,
    }


def compute_status(score: int) -> str:
    if score > 80:
        return "Job Ready"
    elif score > 60:
        return "Solid Candidate"
    elif score > 40:
        return "Needs Polishing"
    else:
        return "Getting There"


def compute_effort(score: float) -> str:
    if score >= 75:
        return "Low"
    elif score >= 45:
        return "Medium"
    else:
        return "High"


def compute_market_demand(domain_title: str) -> str:
    high_demand = ["data science", "ai", "cloud", "devops", "full stack", "cyber", "nlp", "computer vision"]
    critical_demand = ["machine learning", "generative", "kubernetes", "react"]
    title_lower = domain_title.lower()
    if any(k in title_lower for k in critical_demand):
        return "Critical"
    elif any(k in title_lower for k in high_demand):
        return "High"
    else:
        return "Moderate"
