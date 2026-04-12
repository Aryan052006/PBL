"""
Resume Analyzer — uses sentence-transformers + cosine similarity to map
resume text to career domains. Replaces analyzeWithGemini() as primary engine.
"""

import json
import os
import re
import numpy as np
from typing import Optional

KNOWLEDGE_PATH  = os.path.join(os.path.dirname(__file__), "..", "data", "domain_knowledge.json")
LABELS_PATH     = os.path.join(os.path.dirname(__file__), "..", "data", "domain_labels.json")

_knowledge = None
_labels    = None


def _load_data():
    global _knowledge, _labels
    if _knowledge is None:
        with open(KNOWLEDGE_PATH, encoding="utf-8") as f:
            _knowledge = json.load(f)
        with open(LABELS_PATH, encoding="utf-8") as f:
            _labels = json.load(f)
    return _knowledge, _labels


# ── Keyword-based scoring (fast, always available) ─────────────────────────

def _keyword_score(text: str, domain: dict) -> float:
    """Score a resume text against a domain using keyword overlap."""
    text_lower = text.lower()
    keywords = [k.lower() for k in domain.get("keySkills", [])]
    must_have = [k.lower() for k in domain.get("mustHaveSkills", [])]

    kw_hits = sum(1 for k in keywords if k in text_lower)
    kw_score = min(100, (kw_hits / max(len(keywords), 1)) * 100)

    must_hits = sum(1 for k in must_have if k in text_lower)
    must_score = (must_hits / max(len(must_have), 1)) * 100

    # Weighted: 60% keyword coverage + 40% must-have coverage
    return round(kw_score * 0.6 + must_score * 0.4)


def _extract_skills_from_text(text: str, knowledge: list) -> list:
    """Extract recognizable skills from resume text."""
    text_lower = text.lower()
    found = set()
    for domain in knowledge:
        for skill in domain["keySkills"]:
            if skill.lower() in text_lower:
                found.add(skill)
    return list(found)


def _estimate_salary(domain: dict, score: int) -> dict:
    """Static fallback: Interpolate salary estimate within domain's entry-level range."""
    try:
        entry = domain["salaryRange"]["entry"]  # e.g. "4-8 LPA"
        parts = re.findall(r"\d+", entry)
        if len(parts) >= 2:
            lo, hi = int(parts[0]) * 100000, int(parts[1]) * 100000
            factor = max(0, (score - 30) / 70)
            est = int(lo + (hi - lo) * factor)
            return {"min": lo, "max": hi, "currency": "INR", "formatted": f"₹{lo//100000}L - ₹{hi//100000}L"}
    except Exception:
        pass
    return {"min": 500000, "max": 1200000, "currency": "INR", "formatted": "₹5L - ₹12L"}


def _generate_dynamic_insights(raw_text: str, domain: dict, best_score: int, static_fallbacks: dict) -> dict:
    """Use Gemini to predict dynamic salary and generate specific AI insights."""
    import os
    gemini_key = os.getenv("GOOGLE_GEMINI_KEY")
    
    if not gemini_key:
        return static_fallbacks
        
    try:
        import google.generativeai as genai
        import json
        import re
        genai.configure(api_key=gemini_key)
        model = genai.GenerativeModel("gemini-2.0-flash")
        
        prompt = f"""
Act as an elite technical recruiter and career coach for the Indian tech market in 2024-2026.
Analyze this resume text and the predicted domain to generate personalized, dynamic career insights.

Domain: {domain['domain']}
Base Competency Score: {best_score}/100

Resume Text Snippet (first 1500 chars):
{raw_text[:1500]}

Provide the output strictly as a JSON object containing the exact following keys:
{{
    "salary": {{
        "min": (integer, e.g. 500000),
        "max": (integer, e.g. 800000),
        "currency": "INR",
        "formatted": "₹5L - ₹8L"
    }},
    "executiveSummary": "A descriptive 2-3 sentence summary of the profile strengths and weaknesses...",
    "jobTitles": ["3 specific job titles they should apply for"],
    "gaps": ["3-4 specific skills missing from their resume based on the market"],
    "boosters": ["2-3 high-impact actions or certs that would boost their salary"],
    "tips": ["2-3 actionable tips to improve their portfolio or resume format"],
    "marketAnalysis": "A 2-3 sentence analysis of current hiring trends in India for this specific niche."
}}
No markdown formatting. Do not include any other text.
        """
        result = model.generate_content(prompt)
        text = result.text.strip()
        
        json_match = re.search(r'\{.*\}', text, re.DOTALL)
        if json_match:
            text = json_match.group(0)
        else:
            text = text.replace("```json", "").replace("```", "").strip()
            
        data = json.loads(text)
        return {
            "salary": {
                "min": int(data.get("salary", {}).get("min", static_fallbacks["salary"]["min"])),
                "max": int(data.get("salary", {}).get("max", static_fallbacks["salary"]["max"])),
                "currency": "INR",
                "formatted": data.get("salary", {}).get("formatted", static_fallbacks["salary"]["formatted"])
            },
            "executiveSummary": data.get("executiveSummary", ""),
            "jobTitles": data.get("jobTitles", static_fallbacks["jobTitles"]),
            "gaps": data.get("gaps", static_fallbacks["gaps"]),
            "boosters": data.get("boosters", static_fallbacks["boosters"]),
            "tips": data.get("tips", static_fallbacks["tips"]),
            "marketAnalysis": data.get("marketAnalysis", static_fallbacks["marketAnalysis"])
        }
    except Exception as e:
        print(f"[Dynamic Insights] Gemini failed: {e}")
        return static_fallbacks


def _compute_status(score: int) -> str:
    if score > 80:   return "Job Ready"
    elif score > 60: return "Solid Candidate"
    elif score > 40: return "Needs Polishing"
    else:            return "Getting There"


def _calculate_ats_score(raw_text: str, text: str, best_score: int) -> dict:
    """Calculate an estimated ATS compatibility score."""
    import re
    
    # 1. Parsing Quality & Sections (30%)
    sections = {
        "experience": bool(re.search(r'\b(experience|work history|employment)\b', text)),
        "education": bool(re.search(r'\b(education|academic|degree)\b', text)),
        "skills": bool(re.search(r'\b(skills|technical|technologies)\b', text)),
        "projects": bool(re.search(r'\b(projects|portfolio)\b', text))
    }
    section_score = (sum(sections.values()) / 4) * 30
    
    # 2. Keyword Match / Market Relevance (30%)
    keyword_score = (min(best_score, 100) / 100) * 30
    
    # 3. Action Impact (20%)
    action_verbs = [
        "developed", "managed", "implemented", "achieved", "orchestrated", 
        "optimized", "spearheaded", "designed", "created", "led", "resolved",
        "engineered", "architected", "delivered"
    ]
    verb_count = sum(1 for v in action_verbs if v in text)
    impact_score = min((verb_count / 5) * 20, 20)
    
    # 4. Formatting & Contact (20%)
    has_email = bool(re.search(r'[\w\.-]+@[\w\.-]+\.\w+', raw_text))
    has_phone = bool(re.search(r'(\+\d{1,3}[- ]?)?\d{10}', raw_text))
    word_count = len(text.split())
    
    format_score = 0
    if has_email: format_score += 10
    if has_phone: format_score += 5
    if 200 <= word_count <= 1200: format_score += 5  # Good length
    elif word_count > 1200: format_score += 2 # Too long
    
    total_ats = round(section_score + keyword_score + impact_score + format_score)
    
    return {
        "score": total_ats,
        "breakdown": {
            "Structure": round(section_score / 30 * 100) if section_score else 0,
            "KeywordOptimization": round(keyword_score / 30 * 100) if keyword_score else 0,
            "Impact": round(impact_score / 20 * 100) if impact_score else 0,
            "Formatting": round(format_score / 20 * 100) if format_score else 0
        }
    }



# ── Semantic scoring (sentence-transformers, optional) ────────────────────

def _semantic_scores(resume_text: str, knowledge: list):
    """
    Compute cosine similarity between resume text and domain descriptions.
    Returns array of scores or None if sentence-transformers unavailable.
    """
    try:
        from sentence_transformers import SentenceTransformer
        model = SentenceTransformer("all-MiniLM-L6-v2")

        domain_texts = [
            f"{d['domain']}. {d['overview']} Key skills: {', '.join(d['keySkills'][:8])}"
            for d in knowledge
        ]

        all_texts = [resume_text[:1000]] + domain_texts   # cap resume at 1000 chars for speed
        embeddings = model.encode(all_texts, normalize_embeddings=True)

        resume_emb = embeddings[0]
        domain_embs = embeddings[1:]
        scores = np.dot(domain_embs, resume_emb) * 100   # cosine similarity → 0-100
        return scores
    except Exception as e:
        print(f"[ResumeAnalyzer] Semantic scoring unavailable: {e}")
        return None


# ── Main entrypoint ───────────────────────────────────────────────────────

def analyze_resume(file_bytes: bytes, mimetype: str) -> Optional[dict]:
    """
    Full resume analysis pipeline:
      1. Extract text
      2. Score against all 13 domains (keyword + optional semantic)
      3. Return structured JSON matching analyzeWithGemini() contract
    """
    from utils.text_processor import extract_text, clean_text

    knowledge, labels = _load_data()

    # Step 1: Extract text
    raw_text = extract_text(file_bytes, mimetype)
    if not raw_text or len(raw_text.strip()) < 50:
        return None   # Signal caller to use Gemini fallback

    text = clean_text(raw_text)

    # Step 2: Try semantic scoring, fallback to keyword
    semantic = _semantic_scores(text, knowledge)
    keyword_scores = [_keyword_score(text, d) for d in knowledge]

    if semantic is not None:
        # Blend: 60% semantic + 40% keyword
        combined = [round(s * 0.6 + k * 0.4) for s, k in zip(semantic, keyword_scores)]
    else:
        combined = keyword_scores

    # Step 3: Find best domain
    best_idx = int(np.argmax(combined))
    best_score = int(combined[best_idx])
    best_domain = knowledge[best_idx]

    # Step 4: Compute supporting data
    found_skills = _extract_skills_from_text(raw_text, knowledge)
    gaps = [k for k in best_domain["keySkills"] if k.lower() not in text][:8]
    missing_must = [k for k in best_domain["mustHaveSkills"] if k.lower() not in text]
    boosters = best_domain.get("hotSkills", [])[:4]
    tips = []
    if missing_must:
        tips.append(f"Critical gap: Learn {', '.join(missing_must[:2])} — these are must-have skills for {best_domain['domain']}.")
    if boosters:
        tips.append(f"Salary booster: Adding {boosters[0]} can significantly increase your market value.")
    tips.append(best_domain.get("indianMarketContext", ""))

    # Domain suitability for all 13 domains
    domain_suitability = [
        {"domain": knowledge[i]["domain"], "match": int(combined[i])}
        for i in range(len(knowledge))
    ]
    domain_suitability.sort(key=lambda x: x["match"], reverse=True)

    match_pct = min(100, round((len(found_skills) / max(len(best_domain["keySkills"]), 1)) * 100))

    # Calculate ATS Score
    ats = _calculate_ats_score(raw_text, text, best_score)
    
    # Compute static fallbacks in case API fails
    static_fallbacks = {
        "salary": _estimate_salary(best_domain, best_score),
        "jobTitles": best_domain["careerPaths"][:4],
        "gaps": gaps[:8],
        "boosters": boosters,
        "tips": [t for t in tips if t],
        "marketAnalysis": best_domain.get("indianMarketContext", "")
    }

    # Predict dynamic insights (salary, tips, gaps, etc.)
    insights = _generate_dynamic_insights(raw_text, best_domain, best_score, static_fallbacks)

    return {
        "bestFitDomain": best_domain["domain"],
        "score": best_score,
        "atsScore": ats,
        "status": _compute_status(best_score),
        "salary": insights["salary"],
        "jobTitles": insights["jobTitles"],
        "gaps": insights["gaps"],
        "boosters": insights["boosters"],
        "tips": insights["tips"],
        "marketAnalysis": insights["marketAnalysis"],
        "executiveSummary": insights.get("executiveSummary", ""),
        "domainSuitability": domain_suitability[:6],
        "skillGap": {
            "matchingPercentage": match_pct,
            "gapPercentage": 100 - match_pct,
        },
    }
