"""
Sklearn preprocessing pipeline: StandardScaler → PCA → RFE
Matches the Data Preprocessing stage from the research paper architecture.
"""

import numpy as np
import joblib
import os
from sklearn.preprocessing import StandardScaler
from sklearn.decomposition import PCA
from sklearn.feature_selection import SelectKBest, f_classif
from sklearn.pipeline import Pipeline

PIPELINE_PATH = os.path.join(os.path.dirname(__file__), "..", "saved_models", "preprocessor.pkl")


def build_pipeline(n_pca_components: int = 8, n_top_features: int = 7):
    """
    Build the 3-stage preprocessing pipeline:
      1. StandardScaler  — normalize all features to zero mean / unit variance
      2. PCA             — reduce dimensionality while retaining 95% variance
      3. SelectKBest     — RFE-equivalent: select top-k most informative features
    """
    pipeline = Pipeline([
        ("scaler", StandardScaler()),
        ("pca", PCA(n_components=n_pca_components, random_state=42)),
        ("selector", SelectKBest(f_classif, k=min(n_top_features, n_pca_components))),
    ])
    return pipeline


def fit_and_save(X: np.ndarray, y: np.ndarray):
    """Train the preprocessing pipeline and persist it."""
    os.makedirs(os.path.dirname(PIPELINE_PATH), exist_ok=True)
    pipeline = build_pipeline()
    pipeline.fit(X, y)
    joblib.dump(pipeline, PIPELINE_PATH)
    print(f"[Pipeline] Saved to {PIPELINE_PATH}")
    return pipeline


def load_pipeline():
    """Load a previously saved preprocessing pipeline."""
    if not os.path.exists(PIPELINE_PATH):
        raise FileNotFoundError(f"Pipeline not found at {PIPELINE_PATH}. Run startup first.")
    return joblib.load(PIPELINE_PATH)


def transform(pipeline, X: np.ndarray) -> np.ndarray:
    return pipeline.transform(X)


def fit_transform(pipeline, X: np.ndarray, y: np.ndarray) -> np.ndarray:
    return pipeline.fit_transform(X, y)
