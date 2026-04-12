"""
RAG Engine — Multi-Agent RAG-LLM pipeline.
Implements 3-agent architecture from the research paper:
  Agent 1: Profile Encoder (sentence-transformers)
  Agent 2: Knowledge Retriever (cosine similarity over domain knowledge base)
  Agent 3: Response Generator (Gemini API for narrative generation)
"""

import json
import os
import numpy as np
from typing import Optional

KNOWLEDGE_PATH = os.path.join(os.path.dirname(__file__), "..", "data", "domain_knowledge.json")

# Lazy import sentinel
_encoder_model = None
_domain_embeddings = None
_domain_knowledge = None


def _load_knowledge():
    global _domain_knowledge
    if _domain_knowledge is None:
        with open(KNOWLEDGE_PATH, encoding="utf-8") as f:
            _domain_knowledge = json.load(f)
    return _domain_knowledge


def _get_encoder():
    """Lazily load sentence-transformers model (downloads on first use, ~80MB)."""
    global _encoder_model
    if _encoder_model is None:
        try:
            from sentence_transformers import SentenceTransformer
            print("[RAG] Loading sentence-transformers model (all-MiniLM-L6-v2)...")
            _encoder_model = SentenceTransformer("all-MiniLM-L6-v2")
            print("[RAG] Model loaded.")
        except Exception as e:
            print(f"[RAG] sentence-transformers unavailable: {e}")
            _encoder_model = None
    return _encoder_model


def _build_domain_text(domain: dict) -> str:
    """Convert a domain knowledge entry into a single text chunk for embedding."""
    return (
        f"{domain['domain']}: {domain['overview']} "
        f"Key skills: {', '.join(domain['keySkills'][:8])}. "
        f"Career paths: {', '.join(domain['careerPaths'][:3])}. "
        f"Market: {domain['marketDemand']}. "
        f"Indian context: {domain['indianMarketContext']}"
    )


def _get_domain_embeddings():
    """Compute and cache embeddings for all domains."""
    global _domain_embeddings
    if _domain_embeddings is not None:
        return _domain_embeddings

    encoder = _get_encoder()
    knowledge = _load_knowledge()

    if encoder is None:
        # Fallback: use keyword-based scoring if transformers unavailable
        _domain_embeddings = None
        return None

    texts = [_build_domain_text(d) for d in knowledge]
    _domain_embeddings = encoder.encode(texts, normalize_embeddings=True)
    print(f"[RAG] Built embeddings for {len(texts)} domains.")
    return _domain_embeddings


def _build_profile_text(profile: dict) -> str:
    """Convert student profile to text for encoding."""
    branch = profile.get("branch", "Computer Engineering")
    year = profile.get("year", "3rd Year")
    skills = profile.get("skills") or []
    interests = profile.get("interests") or []
    cgpa = profile.get("cgpa", "N/A")
    projects = profile.get("projects_count", 0)
    internship = profile.get("internship_experience", 0)
    certs = profile.get("certifications", 0)

    return (
        f"{year} {branch} student. "
        f"CGPA: {cgpa}. "
        f"Skills: {', '.join(skills[:10]) if skills else 'None specified'}. "
        f"Interests: {', '.join(interests[:5]) if interests else 'None specified'}. "
        f"Projects: {projects}. Internships: {internship} months. Certifications: {certs}."
    )


def retrieve_top_domains(profile: dict, top_k: int = 3) -> list:
    """
    Agent 2: Retrieve top-k most relevant domains using cosine similarity.
    Falls back to keyword matching if sentence-transformers is unavailable.
    """
    knowledge = _load_knowledge()
    domain_embeddings = _get_domain_embeddings()
    encoder = _get_encoder()

    if encoder is not None and domain_embeddings is not None:
        profile_text = _build_profile_text(profile)
        profile_embedding = encoder.encode([profile_text], normalize_embeddings=True)[0]
        scores = np.dot(domain_embeddings, profile_embedding)
        top_indices = np.argsort(scores)[::-1][:top_k]
        return [knowledge[i] for i in top_indices]
    else:
        # Keyword-based fallback
        skills_lower = [s.lower() for s in (profile.get("skills") or [])]
        scored = []
        for d in knowledge:
            score = sum(1 for k in d["keySkills"] if k.lower() in skills_lower)
            scored.append((score, d))
        scored.sort(key=lambda x: x[0], reverse=True)
        return [d for _, d in scored[:top_k]]


def generate_assessment(profile: dict, top_domains: list, gemini_api_key: str) -> dict:
    """
    Agent 3: Use Gemini to generate global assessment & top insight
    conditioned on retrieved domain knowledge.
    """
    branch_ctx = profile.get("branch", "CE")
    year = profile.get("year", "3rd Year")
    skills = profile.get("skills", [])
    domain_names = [d["domain"] for d in top_domains]

    retrieval_context = "\n".join([
        f"- {d['domain']}: {d['overview'][:120]}... Key skills: {', '.join(d['keySkills'][:5])}"
        for d in top_domains
    ])

    prompt = f"""
Act as an elite career strategist and technical consultant for high-potential Indian engineering students. Your tone is bold, visionary, and highly assertive.

Student Profile:
- Identity: {year} {branch_ctx} Candidate
- Technical Arsenal: {', '.join(skills[:12]) if skills else 'Strategic foundation in progress'}
- Primary Targets: {', '.join(domain_names)}

Industry Intelligence Layer:
{retrieval_context}

Provide a high-impact strategic evaluation:
1. "globalAssessment": A powerful, 3-4 sentence audit of their competitive positioning within the global and Indian tech hierarchy. Be direct and authoritative.
2. "topInsight": One "High-Leverage" move they must execute to break into the top 1% of candidates in their field.
3. "skillsOverlap": {{
    "matched": [their current core competencies],
    "missing": [the 3 most critical missing pieces to achieve market dominance]
}}

Respond ONLY with a valid JSON object. No markdown. Use decisive, expert language.
"""
    try:
        import google.generativeai as genai
        import re
        genai.configure(api_key=gemini_api_key)
        model = genai.GenerativeModel("gemini-2.0-flash")
        result = model.generate_content(prompt)
        text = result.text

        # Robust JSON extraction
        json_match = re.search(r'\{.*\}', text, re.DOTALL)
        if json_match:
            text = json_match.group(0)
        else:
            text = text.replace("```json", "").replace("```", "").strip()

        return json.loads(text)
    except Exception as e:
        print(f"[RAG] Gemini generation failed: {e}")
        return {
            "globalAssessment": f"As a {year} {branch_ctx} student, you have a solid foundation. Focus on building domain-specific projects to stand out.",
            "topInsight": f"Work on the top domain recommended by the ML model and build 2-3 strong portfolio projects this semester.",
            "skillsOverlap": {
                "matched": skills[:3],
                "missing": top_domains[0]["mustHaveSkills"][:3] if top_domains else [],
            }
        }


def generate_domain_detail(domain_title: str, profile: dict, gemini_api_key: str) -> dict:
    """
    Generate a deep domain guide using RAG.
    Retrieves domain-specific knowledge and uses Gemini to generate structured output.
    """
    knowledge = _load_knowledge()
    domain_data = next((d for d in knowledge if d["domain"].lower() == domain_title.lower()), None)

    if domain_data is None:
        # Try partial match
        domain_data = next(
            (d for d in knowledge if any(word in d["domain"].lower() for word in domain_title.lower().split())),
            knowledge[0]
        )

    branch = profile.get("branch", "CE")
    year = profile.get("year", "3rd Year")
    skills = profile.get("skills", [])

    # Calculate skill gap locally
    matched_skills = [s for s in skills if any(s.lower() in k.lower() or k.lower() in s.lower() for k in domain_data["keySkills"])]
    missing_skills = [k for k in domain_data["mustHaveSkills"] if not any(k.lower() in s.lower() for s in skills)]
    match_pct = min(100, round((len(matched_skills) / max(len(domain_data["keySkills"]), 1)) * 100))

    prompt = f"""
Act as a Domain Authority and Strategic Mentor. Your objective is to provide a high-gravity, authoritative deep-dive into the {domain_data['domain']} sector for an ambitious {branch} student.

Contextual Intelligence:
- Current Target: {year} {branch} student
- Known Competencies: {', '.join(skills[:10]) if skills else 'Foundational/Pre-terminal stage'}
- Sector Baseline: {domain_data['overview']}
- Indian Market Context: {domain_data['indianMarketContext']}

Output a strategic blueprint as raw JSON with these EXACT fields:
{{
  "overview": "A bold, data-backed 3-sentence vision of why this domain is a high-growth pivot.",
  "whyGoodFit": "A confident technical evaluation of why a {branch} background provides a competitive edge.",
  "currentStatus": "One of: Novice | Early Beginner | Building | Solid Candidate | Job Ready",
  "matchReasoning": "A sharp, decisive 3-sentence audit of their profile against global industry standards.",
  "salaryRange": "{domain_data['salaryRange']['entry']} (Fresher Entry, High Trajectory)",
  "roadmap": {json.dumps(domain_data['roadmap'])},
  "learningResources": {json.dumps(domain_data['learningResources'])},
  "projectIdeas": {json.dumps(domain_data['projectIdeas'])},
  "skillGap": {{
    "matchingPercentage": {match_pct},
    "gapPercentage": {100 - match_pct},
    "matchedSkills": {json.dumps(matched_skills)},
    "missingSkills": {json.dumps((missing_skills + domain_data.get('hotSkills', []))[:6])}
  }},
  "alternativeDomains": ["2-3 adjacent high-value tech verticals"],
  "nextLearningPriority": "The single most mission-critical technology they must master today."
}}

Tone: Authoritative, visionary, and decisive. No markdown formatting.
"""
    try:
        import google.generativeai as genai
        genai.configure(api_key=gemini_api_key)
        model = genai.GenerativeModel("gemini-2.0-flash")
        result = model.generate_content(prompt)
        text = result.text.replace("```json", "").replace("```", "").strip()
        return json.loads(text)
    except Exception as e:
        print(f"[RAG] Domain detail generation failed: {e}")
        # Return structured fallback from knowledge base
        return {
            "overview": domain_data["overview"],
            "whyGoodFit": domain_data["branchFit"].get(branch.lower().split()[0][:4], "Moderate fit for your branch."),
            "currentStatus": "Early Beginner" if not matched_skills else "Building",
            "matchReasoning": f"You have {len(matched_skills)} matching skills out of {len(domain_data['keySkills'])} required. Focus on learning {', '.join(missing_skills[:2])} next.",
            "salaryRange": domain_data["salaryRange"]["entry"],
            "roadmap": domain_data["roadmap"],
            "learningResources": domain_data["learningResources"],
            "projectIdeas": domain_data["projectIdeas"],
            "skillGap": {
                "matchingPercentage": match_pct,
                "gapPercentage": 100 - match_pct,
                "matchedSkills": matched_skills,
                "missingSkills": (missing_skills + domain_data.get("hotSkills", []))[:6],
            },
            "alternativeDomains": domain_data.get("alternativeDomains", []),
            "nextLearningPriority": domain_data["mustHaveSkills"][0] if domain_data["mustHaveSkills"] else "Python",
        }
