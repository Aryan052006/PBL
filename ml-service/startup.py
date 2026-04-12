"""
Startup script — trains models and builds indexes on service start.
Run once; persists models to saved_models/ for subsequent fast loading.
"""

import os
import sys

# Add ml-service root to path
sys.path.insert(0, os.path.dirname(__file__))

SAVED_DIR = os.path.join(os.path.dirname(__file__), "saved_models")


def run():
    os.makedirs(SAVED_DIR, exist_ok=True)

    # ── Step 1: Build KNN preprocessing pipeline + train KNN ──────────────
    print("\n══════════════════════════════════════════")
    print("   ML-Service Startup — Model Training")
    print("══════════════════════════════════════════")

    from preprocessing.pipeline import fit_and_save as fit_pipeline, load_pipeline, build_pipeline
    from preprocessing.feature_builder import FEATURE_NAMES
    from models.knn_classifier import train_and_save as train_knn, _generate_training_data

    pipeline_path = os.path.join(SAVED_DIR, "preprocessor.pkl")

    print(f"\n[1/3] Training preprocessing pipeline + KNN classifier...")
    X, y = _generate_training_data()

    # Fit pipeline
    pipeline = build_pipeline(n_pca_components=8, n_top_features=7)
    from sklearn.preprocessing import StandardScaler
    from sklearn.decomposition import PCA
    from sklearn.feature_selection import SelectKBest, f_classif
    pipeline.fit(X, y)

    import joblib
    joblib.dump(pipeline, pipeline_path)
    print(f"    ✓ Preprocessing pipeline saved.")

    # Train KNN using already-fitted pipeline
    _, cv_score = train_knn(pipeline=pipeline)
    print(f"    ✓ KNN trained. 10-Fold CV Accuracy: {cv_score:.2%}")

    # ── Step 2: Pre-warm sentence-transformers (downloads model if needed) ──
    print(f"\n[2/3] Warming up sentence-transformers encoder...")
    try:
        from models.rag_engine import _get_encoder, _get_domain_embeddings
        encoder = _get_encoder()
        if encoder:
            embs = _get_domain_embeddings()
            print(f"    ✓ Encoder ready. Domain embeddings: {embs.shape if embs is not None else 'N/A'}")
        else:
            print("    ⚠ sentence-transformers not available — will use keyword fallback.")
    except Exception as e:
        print(f"    ⚠ Encoder warmup failed: {e} — keyword fallback will be used.")

    # ── Step 3: Verify data files ──────────────────────────────────────────
    print(f"\n[3/3] Verifying data files...")
    data_dir = os.path.join(os.path.dirname(__file__), "data")
    for fname in ["domain_labels.json", "domain_knowledge.json"]:
        path = os.path.join(data_dir, fname)
        status = "✓" if os.path.exists(path) else "✗ MISSING"
        print(f"    {status} {fname}")

    print("\n══════════════════════════════════════════")
    print("   Startup Complete — Service Ready")
    print("══════════════════════════════════════════\n")


if __name__ == "__main__":
    run()
