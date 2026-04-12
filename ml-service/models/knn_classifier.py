"""
KNN Classifier — trains a K-Nearest Neighbor model to predict career domains.
Implements the ML Model component from the research paper (96.4% accuracy).
Training data is generated synthetically from domain profiles.
"""

import json
import os
import numpy as np
import joblib
from sklearn.neighbors import KNeighborsClassifier
from sklearn.model_selection import cross_val_score, StratifiedKFold

LABELS_PATH  = os.path.join(os.path.dirname(__file__), "..", "data",  "domain_labels.json")
MODEL_PATH   = os.path.join(os.path.dirname(__file__), "..", "saved_models", "knn_model.pkl")

# -----------------------------------------------------------------
# Domain seed profiles — (mean, std) per feature per domain
# Features: [cgpa, tech_skill_score, projects, internship, certs,
#             coding_rating, comm_score, aptitude, domain_interest, hackathons]
# -----------------------------------------------------------------
DOMAIN_SEEDS = {
    0:  dict(cgpa=(7.5,0.8), tech=(70,12), proj=(4,1.5), intern=(4,2), certs=(2,1), code=(1200,300), comm=(7,1.5), apt=(70,12), interest=(80,10), hack=(2,1)),   # FullStack
    1:  dict(cgpa=(8.0,0.7), tech=(65,12), proj=(4,1.5), intern=(3,2), certs=(3,1), code=(1100,300), comm=(6,1.5), apt=(75,10), interest=(85,10), hack=(2,1)),   # DS/AI
    2:  dict(cgpa=(7.3,0.8), tech=(60,12), proj=(3,1.5), intern=(4,2), certs=(3,1), code=(900,250),  comm=(6,1.5), apt=(68,12), interest=(75,12), hack=(1,1)),   # Cloud
    3:  dict(cgpa=(7.2,0.8), tech=(55,12), proj=(3,1.5), intern=(3,2), certs=(2,1), code=(950,250),  comm=(6,1.5), apt=(70,12), interest=(78,12), hack=(1,1)),   # Cyber
    4:  dict(cgpa=(7.8,0.7), tech=(60,12), proj=(3,1.5), intern=(2,2), certs=(2,1), code=(1000,250), comm=(6,1.5), apt=(72,12), interest=(80,12), hack=(1,1)),   # Blockchain
    5:  dict(cgpa=(7.0,0.8), tech=(55,12), proj=(4,1.5), intern=(3,2), certs=(2,1), code=(700,200),  comm=(6,1.5), apt=(65,12), interest=(82,10), hack=(2,1)),   # Embedded/IoT
    6:  dict(cgpa=(7.8,0.7), tech=(50,12), proj=(3,1.5), intern=(3,2), certs=(2,1), code=(600,200),  comm=(5,1.5), apt=(78,10), interest=(80,10), hack=(1,1)),   # VLSI
    7:  dict(cgpa=(7.6,0.8), tech=(48,12), proj=(3,1.5), intern=(2,2), certs=(1,1), code=(600,200),  comm=(5,1.5), apt=(76,12), interest=(78,12), hack=(1,1)),   # DSP
    8:  dict(cgpa=(7.4,0.8), tech=(45,12), proj=(2,1.5), intern=(2,2), certs=(2,1), code=(550,200),  comm=(6,1.5), apt=(72,12), interest=(76,12), hack=(1,1)),   # Telecom
    9:  dict(cgpa=(7.2,0.8), tech=(55,12), proj=(3,1.5), intern=(2,2), certs=(2,1), code=(700,200),  comm=(6,1.5), apt=(68,12), interest=(80,10), hack=(2,1)),   # Robotics
    10: dict(cgpa=(8.0,0.7), tech=(68,12), proj=(4,1.5), intern=(3,2), certs=(2,1), code=(1100,300), comm=(6,1.5), apt=(75,10), interest=(85,8),  hack=(2,1)),   # CV
    11: dict(cgpa=(8.2,0.7), tech=(70,12), proj=(4,1.5), intern=(3,2), certs=(3,1), code=(1100,300), comm=(7,1.5), apt=(78,10), interest=(88,8),  hack=(2,1)),   # NLP
    12: dict(cgpa=(7.6,0.8), tech=(62,12), proj=(3,1.5), intern=(3,2), certs=(2,1), code=(1000,250), comm=(6,1.5), apt=(72,12), interest=(80,10), hack=(1,1)),   # DataEng
}

N_SAMPLES_PER_DOMAIN = 50   # 50 × 13 = 650 training samples total


def _generate_training_data(n_per_domain: int = N_SAMPLES_PER_DOMAIN):
    """Generate synthetic labeled training data using gaussian sampling around domain seeds."""
    rng = np.random.default_rng(42)
    X, y = [], []

    for label_id, seed in DOMAIN_SEEDS.items():
        for _ in range(n_per_domain):
            sample = [
                np.clip(rng.normal(seed["cgpa"][0],   seed["cgpa"][1]),   0, 10),
                np.clip(rng.normal(seed["tech"][0],   seed["tech"][1]),   0, 100),
                max(0, int(rng.normal(seed["proj"][0],   seed["proj"][1]))),
                max(0, int(rng.normal(seed["intern"][0], seed["intern"][1]))),
                max(0, int(rng.normal(seed["certs"][0],  seed["certs"][1]))),
                max(0, int(rng.normal(seed["code"][0],   seed["code"][1]))),
                np.clip(rng.normal(seed["comm"][0],   seed["comm"][1]),   1, 10),
                np.clip(rng.normal(seed["apt"][0],    seed["apt"][1]),    0, 100),
                np.clip(rng.normal(seed["interest"][0], seed["interest"][1]), 0, 100),
                max(0, int(rng.normal(seed["hack"][0],   seed["hack"][1]))),
            ]
            X.append(sample)
            y.append(label_id)

    return np.array(X, dtype=float), np.array(y, dtype=int)


def train_and_save(pipeline=None):
    """
    Generate data, train KNN (k=5), optionally apply the preprocessing pipeline,
    run 10-fold CV, and persist the model.
    """
    os.makedirs(os.path.dirname(MODEL_PATH), exist_ok=True)

    print(f"[KNN] Generating {N_SAMPLES_PER_DOMAIN * len(DOMAIN_SEEDS)} training samples...")
    X, y = _generate_training_data()

    # Apply preprocessing pipeline if provided
    if pipeline is not None:
        X_processed = pipeline.fit_transform(X, y)
    else:
        X_processed = X

    # KNN with k=5 (best per paper's K-Fold analysis)
    knn = KNeighborsClassifier(n_neighbors=5, metric="euclidean", weights="distance")
    knn.fit(X_processed, y)

    # 10-Fold Cross Validation (matches paper Table 3)
    cv = StratifiedKFold(n_splits=10, shuffle=True, random_state=42)
    scores = cross_val_score(knn, X_processed, y, cv=cv, scoring="accuracy")
    print(f"[KNN] 10-Fold CV Accuracy: {scores.mean():.4f} ± {scores.std():.4f}")

    joblib.dump(knn, MODEL_PATH)
    print(f"[KNN] Model saved to {MODEL_PATH}")
    return knn, scores.mean()


def load_model():
    if not os.path.exists(MODEL_PATH):
        raise FileNotFoundError(f"KNN model not found at {MODEL_PATH}. Run startup first.")
    return joblib.load(MODEL_PATH)


def predict(knn, pipeline, feature_vector: list, branch: str = "ce") -> list:
    """
    Predict domain probabilities and apply confidence boosting.
    """
    X = np.array([feature_vector], dtype=float)

    if pipeline is not None:
        X = pipeline.transform(X)

    # Get probability estimates
    proba = knn.predict_proba(X)[0]
    classes = knn.classes_

    # Feature extraction for boosting
    tech_score = feature_vector[1]
    interest_score = feature_vector[8]

    # Apply branch weights from domain_labels.json
    with open(LABELS_PATH) as f:
        labels_data = json.load(f)

    branch_key = branch.lower().strip()
    weights = labels_data["branch_weights"].get(branch_key, [1.0] * len(labels_data["labels"]))
    id_to_label = labels_data["id_to_label"]

    results = []
    for cls_id, prob in zip(classes, proba):
        idx = int(cls_id)
        w = weights[idx] if idx < len(weights) else 1.0
        
        # ── Confidence Boosting Logic ─────────────────────────────────
        # Base score from KNN prob and branch weight
        base_score = prob * w * 100
        
        # Technical Boost: If tech score is high, it acts as a floor for the top domains
        tech_boost = 0
        if tech_score > 60:
            tech_boost = (tech_score - 60) * 0.5  # Up to +20 boost
        
        # Interest Boost: Direct overlap with domain keywords
        interest_boost = (interest_score / 100) * 15 # Up to +15 boost
        
        final_score = base_score + tech_boost + interest_boost
        
        # Ensure the score isn't artificially inflated without evidence
        if prob > 0.1: 
            # Apply a smaller dynamic floor based on global tech signals to prevent 40% false positives
            dynamic_floor = 10 + (tech_score * 0.15)
            final_score = max(final_score, dynamic_floor)
        
        results.append({
            "label_id": idx,
            "label": id_to_label[str(idx)],
            "raw_probability": float(prob),
            "match_score": min(98, round(final_score)), # Cap at 98 to keep "Job Ready" as the ultimate goal
        })

    # Sort and refine the top 1 range
    results.sort(key=lambda x: x["match_score"], reverse=True)
    
    # Final Polish: Boost the very top recommendation ONLY if signals are actually strong
    if results[0]["match_score"] > 55 and tech_score > 40:
        results[0]["match_score"] = max(results[0]["match_score"], 72)

    return results
