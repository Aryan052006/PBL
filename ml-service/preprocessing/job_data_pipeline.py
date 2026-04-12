"""
Job Prediction Pipeline — Semantic Search engine for resume → job title matching.

Architecture:
  1. Load and clean job descriptions from D:/pbl_paper/data.csv
  2. Load skill group mappings from D:/pbl_paper/skillGroups_en.ods
  3. Generate embeddings using sentence-transformers (all-MiniLM-L6-v2)
  4. Build a vector index using sklearn NearestNeighbors (cosine similarity)
  5. At query time: encode resume text → find top-K nearest job descriptions

Usage:
  Called by the /predict-job endpoint in app.py.
  On first call, the pipeline builds and caches the index automatically.
"""

import os
import re
import json
import numpy as np
import pandas as pd
from typing import Optional

# ── Paths ──────────────────────────────────────────────────────────────────
CSV_PATH = r"D:\pbl_paper\data.csv"
ODS_PATH = r"D:\pbl_paper\skillGroups_en.ods"
CACHE_DIR = os.path.join(os.path.dirname(__file__), "..", "saved_models")
EMBEDDINGS_CACHE = os.path.join(CACHE_DIR, "job_embeddings.npy")
METADATA_CACHE = os.path.join(CACHE_DIR, "job_metadata.json")

# ── Lazy globals ───────────────────────────────────────────────────────────
_job_index = None          # sklearn NearestNeighbors instance
_job_metadata = None       # list of {"title": ..., "clean_desc": ...}
_job_embeddings = None     # numpy array (N, 384)
_skill_groups = None       # dict mapping skill -> group
_encoder = None


# ═══════════════════════════════════════════════════════════════════════════
# Data Cleaning
# ═══════════════════════════════════════════════════════════════════════════

# Regex patterns mapping to boilerplate content to remove from job descriptions
_NOISE_PATTERNS = [
    # Benefits / compensation / legal
    r"(?i)\b(equal\s+opportunity|affirmative\s+action|eeo|e-verify)\b.*?(?:\.|$)",
    r"(?i)\bbenefits?\b.*?(?:insurance|401k|pto|paid\s+time|dental|vision).*?(?:\.|$)",
    r"(?i)\b(salary|pay|compensation)\s*(range)?[\s:]*[\$₹€]?\s*\d[\d,\.]*.*?(?:\.|$)",
    r"(?i)\bjob\s+type[\s:]+.*?(?:\.|$)",
    r"(?i)\bschedule[\s:]+.*?(?:\.|$)",
    r"(?i)\bwork\s+location[\s:]+.*?(?:\.|$)",
    r"(?i)\bability\s+to\s+(commute|relocate).*?(?:\.|$)",
    r"(?i)\bphysical\s+(demands?|requirements?).*?(?:\.|$)",
    r"(?i)\breasonable\s+accommodations?.*?(?:\.|$)",
    r"(?i)\b(about\s+us|who\s+we\s+are|our\s+company|company\s+overview)\b.*?(?:\.\s)",
    # URLs and emails
    r"https?://\S+",
    r"\S+@\S+\.\S+",
]

_compiled_noise = [re.compile(p, re.DOTALL) for p in _NOISE_PATTERNS]


def _clean_description(raw: str) -> str:
    """Remove noise / boilerplate from a job description, keeping core requirements."""
    if not raw or not isinstance(raw, str):
        return ""

    text = raw

    # Apply noise removal patterns
    for pattern in _compiled_noise:
        text = pattern.sub(" ", text)

    # Collapse whitespace
    text = re.sub(r"\s+", " ", text).strip()

    # Trim excessively long descriptions to 1500 chars (keeps core content)
    if len(text) > 1500:
        text = text[:1500]

    return text


# ═══════════════════════════════════════════════════════════════════════════
# Skill Group Mapping
# ═══════════════════════════════════════════════════════════════════════════

def _load_skill_groups() -> dict:
    """Load and parse the skillGroups_en.ods file into a flat mapping."""
    global _skill_groups
    if _skill_groups is not None:
        return _skill_groups

    _skill_groups = {}

    if not os.path.exists(ODS_PATH):
        print(f"[JobPipeline] Skill groups file not found: {ODS_PATH}")
        return _skill_groups

    try:
        df = pd.read_excel(ODS_PATH, engine="odf")

        # Attempt to identify group-to-skill structure
        # Common formats: Group column + Skill column, or header-per-group
        cols = list(df.columns)

        if len(cols) >= 2:
            # Assume first col = group/category, second col = skill name
            group_col = cols[0]
            skill_col = cols[1]
            for _, row in df.iterrows():
                group = str(row[group_col]).strip()
                skill = str(row[skill_col]).strip()
                if group and skill and group != "nan" and skill != "nan":
                    _skill_groups[skill.lower()] = group
        else:
            # Single column — each unique value is its own group
            for _, row in df.iterrows():
                val = str(row[cols[0]]).strip()
                if val and val != "nan":
                    _skill_groups[val.lower()] = val

        print(f"[JobPipeline] Loaded {len(_skill_groups)} skill → group mappings.")
    except Exception as e:
        print(f"[JobPipeline] Could not parse skill groups: {e}")
        _skill_groups = {}

    return _skill_groups


def map_skills_to_groups(skills: list[str]) -> list[str]:
    """Map raw skill names to their canonical group names."""
    groups = _load_skill_groups()
    if not groups:
        return skills  # Return as-is if no grouping available

    mapped: list[str] = []
    seen: set[str] = set()

    for skill in skills:
        group = groups.get(skill.lower(), skill)
        if group.lower() not in seen:
            seen.add(group.lower())
            mapped.append(group)

    return mapped


# ═══════════════════════════════════════════════════════════════════════════
# Embedding & Index Building
# ═══════════════════════════════════════════════════════════════════════════

def _get_encoder():
    """Lazily load the sentence-transformers encoder (shared with rag_engine)."""
    global _encoder
    if _encoder is None:
        try:
            from sentence_transformers import SentenceTransformer
            print("[JobPipeline] Loading sentence-transformers model...")
            _encoder = SentenceTransformer("all-MiniLM-L6-v2")
            print("[JobPipeline] Model loaded.")
        except Exception as e:
            print(f"[JobPipeline] sentence-transformers unavailable: {e}")
    return _encoder


def _load_or_build_index():
    """
    Load cached index, or build it fresh from data.csv.
    Uses sklearn NearestNeighbors with cosine metric (FAISS-compatible speed
    for <1000 job descriptions, no native-library issues on Python 3.15).
    """
    global _job_index, _job_metadata, _job_embeddings

    if _job_index is not None:
        return _job_index, _job_metadata, _job_embeddings

    os.makedirs(CACHE_DIR, exist_ok=True)

    # ── Try loading from cache ─────────────────────────────────────────
    if os.path.exists(EMBEDDINGS_CACHE) and os.path.exists(METADATA_CACHE):
        print("[JobPipeline] Loading cached job embeddings...")
        _job_embeddings = np.load(EMBEDDINGS_CACHE)
        with open(METADATA_CACHE, encoding="utf-8") as f:
            _job_metadata = json.load(f)

        from sklearn.neighbors import NearestNeighbors
        _job_index = NearestNeighbors(n_neighbors=5, metric="cosine", algorithm="brute")
        _job_index.fit(_job_embeddings)

        print(f"[JobPipeline] Loaded index with {len(_job_metadata)} jobs from cache.")
        return _job_index, _job_metadata, _job_embeddings

    # ── Build fresh from CSV ───────────────────────────────────────────
    print("[JobPipeline] Building job embeddings from CSV...")

    if not os.path.exists(CSV_PATH):
        print(f"[JobPipeline] CSV not found at: {CSV_PATH}")
        return None, None, None

    df = pd.read_csv(CSV_PATH)
    df = df.dropna(subset=["Job Title", "Description"])
    df = df.drop_duplicates(subset=["Job Title"])

    # Clean descriptions (noise reduction)
    metadata = []
    clean_texts = []

    for _, row in df.iterrows():
        title = str(row["Job Title"]).strip()
        raw_desc = str(row["Description"]).strip()
        clean_desc = _clean_description(raw_desc)

        if len(clean_desc) < 30:
            continue

        metadata.append({"title": title, "clean_desc": clean_desc[:500]})
        # For embedding: combine title + cleaned description
        clean_texts.append(f"{title}. {clean_desc}")

    print(f"[JobPipeline] Cleaned {len(clean_texts)} job descriptions.")

    # Generate embeddings
    encoder = _get_encoder()
    if encoder is None:
        print("[JobPipeline] Cannot build index without sentence-transformers.")
        return None, None, None

    embeddings = encoder.encode(clean_texts, normalize_embeddings=True, show_progress_bar=True)
    embeddings = np.array(embeddings, dtype=np.float32)

    # Build index
    from sklearn.neighbors import NearestNeighbors
    index = NearestNeighbors(n_neighbors=min(5, len(clean_texts)), metric="cosine", algorithm="brute")
    index.fit(embeddings)

    # Cache to disk
    np.save(EMBEDDINGS_CACHE, embeddings)
    with open(METADATA_CACHE, "w", encoding="utf-8") as f:
        json.dump(metadata, f, ensure_ascii=False, indent=2)

    _job_index = index
    _job_metadata = metadata
    _job_embeddings = embeddings

    print(f"[JobPipeline] Index built and cached ({len(metadata)} jobs).")
    return _job_index, _job_metadata, _job_embeddings


# ═══════════════════════════════════════════════════════════════════════════
# Query / Prediction
# ═══════════════════════════════════════════════════════════════════════════

def predict_jobs(resume_text: str, top_k: int = 5) -> Optional[list[dict]]:
    """
    Given raw resume text, return the top-K matching job titles with scores.

    Returns a list of dicts:
      [
        {"rank": 1, "title": "Data Analyst", "score": 87.2, "description": "..."},
        ...
      ]
    """
    index, metadata, embeddings = _load_or_build_index()

    if index is None or metadata is None:
        return None

    encoder = _get_encoder()
    if encoder is None:
        return None

    # Encode the resume
    resume_embedding = encoder.encode([resume_text[:2000]], normalize_embeddings=True)

    # Query
    k = min(top_k, len(metadata))
    distances, indices = index.kneighbors(resume_embedding, n_neighbors=k)

    results = []
    for rank, (dist, idx) in enumerate(zip(distances[0], indices[0])):
        similarity = round((1 - dist) * 100, 1)  # cosine distance → similarity %
        job = metadata[idx]
        results.append({
            "rank": rank + 1,
            "title": job["title"],
            "score": max(0, similarity),
            "description": job["clean_desc"][:300],
        })

    return results
