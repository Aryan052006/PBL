"""
FastAPI entry point for the ML microservice.
"""

import os
import sys
import json
import joblib
from contextlib import asynccontextmanager

from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

# Add ml-service root to Python path
sys.path.insert(0, os.path.dirname(__file__))

from dotenv import load_dotenv
load_dotenv(os.path.join(os.path.dirname(__file__), ".env"))

GEMINI_KEY = os.getenv("GOOGLE_GEMINI_KEY", "")
SAVED_DIR = os.path.join(os.path.dirname(__file__), "saved_models")
KNN_PATH = os.path.join(SAVED_DIR, "knn_model.pkl")
PIPE_PATH = os.path.join(SAVED_DIR, "preprocessor.pkl")

# Global model state
knn_model = None
pipeline = None


def load_models():
    global knn_model, pipeline

    if knn_model is None or pipeline is None:
        print("[App] Lazy loading models...")
        knn_model = joblib.load(KNN_PATH)
        pipeline = joblib.load(PIPE_PATH)
        print("[App] Models loaded successfully.")


@asynccontextmanager
async def lifespan(app: FastAPI):
    print("[App] Fast startup mode enabled for Render.")
    yield
    print("[App] Shutting down ML service.")


app = FastAPI(
    title="Smart Career Domain ML Service",
    description="KNN + RAG-LLM pipeline for domain recommendation and resume analysis.",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


class ProfileRequest(BaseModel):
    branch: str = "ce"
    year: str = "3rd Year"
    skills: list = []
    interests: list = []
    cgpa: float = 0.0
    projects_count: int = 0
    internship_experience: int = 0
    certifications: int = 0
    coding_platform_rating: int = 0
    communication_score: int = 5
    aptitude_score: float = 50.0
    hackathon_count: int = 0
    domain_interest: list = []


class ExploreRequest(BaseModel):
    domain: str
    branch: str = "ce"
    year: str = "3rd Year"
    skills: list = []


@app.get("/health")
def health():
    return {
        "status": "ok",
        "knn_loaded": knn_model is not None,
        "pipeline_loaded": pipeline is not None,
        "gemini_key_set": bool(GEMINI_KEY),
    }


@app.post("/recommend")
def recommend(req: ProfileRequest):
    from preprocessing.feature_builder import build_feature_vector
    from models.knn_classifier import predict
    from models.rag_engine import generate_assessment
    from utils.response_formatter import (
        format_recommend_response,
        compute_effort,
        compute_market_demand,
    )

    profile = req.dict()
    print(f"[Recommend] Processing profile for branch: {req.branch}")

    try:
        load_models()

        feature_vector = build_feature_vector(profile)
        ranked = predict(knn_model, pipeline, feature_vector, branch=req.branch)

        knowledge_path = os.path.join(
            os.path.dirname(__file__),
            "data",
            "domain_knowledge.json",
        )

        with open(knowledge_path, encoding="utf-8") as f:
            all_knowledge = json.load(f)

        knowledge_map = {d["domain"]: d for d in all_knowledge}

        recommendations = []

        for i, item in enumerate(ranked[:10]):
            domain_name = item["label"]
            domain_data = knowledge_map.get(domain_name, {})
            score = max(10, item["match_score"])

            recommendations.append({
                "id": i + 1,
                "title": domain_name,
                "matchScore": score,
                "marketDemand": compute_market_demand(domain_name),
                "reasoning": f"Based on your {req.branch.upper()} branch profile and skills, this domain has a {score}% match score.",
                "tags": domain_data.get("keySkills", [])[:4],
                "description": domain_data.get("overview", "")[:120] + "...",
                "recommended": i == 0,
                "effortToMaster": compute_effort(score),
            })

        top_3_knowledge = [
            knowledge_map[r["title"]]
            for r in recommendations[:3]
            if r["title"] in knowledge_map
        ]

        rag_result = generate_assessment(
            profile,
            top_3_knowledge,
            GEMINI_KEY,
        )

        return format_recommend_response(
            recommendations,
            rag_result,
            source="ml-model",
        )

    except Exception as e:
        raise HTTPException(500, f"Recommendation failed: {str(e)}")


@app.post("/explore")
def explore(req: ExploreRequest):
    from models.rag_engine import generate_domain_detail
    from utils.response_formatter import format_explore_response

    profile = {
        "branch": req.branch,
        "year": req.year,
        "skills": req.skills,
    }

    detail = generate_domain_detail(req.domain, profile, GEMINI_KEY)

    return format_explore_response(detail, source="ml-rag")


@app.post("/analyze-resume")
async def analyze_resume(file: UploadFile = File(...)):
    from models.resume_analyzer import analyze_resume as run_analysis
    from utils.response_formatter import format_resume_response

    file_bytes = await file.read()
    mimetype = file.content_type or "application/pdf"

    result = run_analysis(file_bytes, mimetype)

    if result is None:
        raise HTTPException(422, "Could not extract readable text.")

    return format_resume_response(result, source="ml-model")


@app.post("/predict-job")
async def predict_job(file: UploadFile = File(...)):
    from preprocessing.job_data_pipeline import predict_jobs
    from utils.text_processor import extract_text, clean_text

    file_bytes = await file.read()
    mimetype = file.content_type or "application/pdf"

    raw_text = extract_text(file_bytes, mimetype)

    if not raw_text or len(raw_text.strip()) < 50:
        raise HTTPException(422, "Could not extract readable text.")

    text = clean_text(raw_text)
    predictions = predict_jobs(text, top_k=5)

    if predictions is None:
        raise HTTPException(503, "Job prediction model not ready.")

    return {
        "success": True,
        "source": "ml-job-predictor",
        "predictions": predictions,
    }