"""
=============================================================================
AssetFlow AI Asset Health & Risk Prediction - Model Training
=============================================================================
Trains a balanced RandomForestClassifier on synthetic/empirical asset lifecycle
data to predict probabilities for:
  - HEALTHY
  - MAINTENANCE_REQUIRED
  - REPLACE_SOON

Saves model bundle to: ml-service/model/asset_health_model.joblib
=============================================================================
"""

import os
from datetime import datetime, timezone
import joblib
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report, confusion_matrix, accuracy_score
from sklearn.model_selection import train_test_split

FEATURE_COLUMNS = [
    "asset_age_days",
    "assignment_count",
    "repair_count",
    "maintenance_count",
    "damage_report_count",
    "days_since_maintenance",
    "warranty_active",
    "condition_score",
    "status_score"
]

TARGET_COLUMN = "health_status"
CLASSES = ["HEALTHY", "MAINTENANCE_REQUIRED", "REPLACE_SOON"]

def train_model():
    base_dir = os.path.dirname(__file__)
    data_path = os.path.join(base_dir, "..", "data", "training_data.csv")
    model_dir = os.path.join(base_dir, "..", "model")
    os.makedirs(model_dir, exist_ok=True)
    model_path = os.path.join(model_dir, "asset_health_model.joblib")

    if not os.path.exists(data_path):
        raise FileNotFoundError(f"Training dataset not found at {data_path}. Run generate_demo_data.py first.")

    print(f"Loading training data from {data_path}...")
    df = pd.read_csv(data_path)

    X = df[FEATURE_COLUMNS]
    y = df[TARGET_COLUMN]

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )

    print(f"Dataset split: {len(X_train)} training samples, {len(X_test)} testing samples")

    print("Training RandomForestClassifier...")
    clf = RandomForestClassifier(
        n_estimators=150,
        max_depth=12,
        min_samples_split=4,
        class_weight="balanced",
        random_state=42,
        n_jobs=-1
    )

    clf.fit(X_train, y_train)

    y_pred = clf.predict(X_test)
    accuracy = accuracy_score(y_test, y_pred)
    print("\n" + "="*50)
    print(f"Evaluation Results (Test Set Accuracy: {accuracy:.4f}):")
    print("="*50)
    print(classification_report(y_test, y_pred, digits=4))
    print("Confusion Matrix:")
    print(confusion_matrix(y_test, y_pred, labels=CLASSES))

    # Feature Importances
    importances = pd.Series(clf.feature_importances_, index=FEATURE_COLUMNS).sort_values(ascending=False)
    print("\nFeature Importances:")
    print(importances.to_string())

    model_bundle = {
        "model": clf,
        "features": FEATURE_COLUMNS,
        "classes": list(clf.classes_),
        "version": "1.0.0",
        "trained_at": datetime.now(timezone.utc).isoformat(),
        "accuracy": float(accuracy)
    }

    joblib.dump(model_bundle, model_path)
    print(f"\nModel artifact saved successfully to {model_path}")

if __name__ == "__main__":
    train_model()
