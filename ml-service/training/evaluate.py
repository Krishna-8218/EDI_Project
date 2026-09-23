"""
=============================================================================
AssetFlow AI Asset Health & Risk Prediction - Model Evaluation Script
=============================================================================
Evaluates the serialized joblib model against held-out or new test data.
=============================================================================
"""

import os
import joblib
import pandas as pd
from sklearn.metrics import classification_report, confusion_matrix, accuracy_score, precision_recall_fscore_support

def evaluate_saved_model():
    base_dir = os.path.dirname(__file__)
    model_path = os.path.join(base_dir, "..", "model", "asset_health_model.joblib")
    data_path = os.path.join(base_dir, "..", "data", "training_data.csv")

    if not os.path.exists(model_path):
        raise FileNotFoundError(f"Model file not found at {model_path}. Please train the model first.")

    bundle = joblib.load(model_path)
    model = bundle["model"]
    features = bundle["features"]
    classes = bundle["classes"]

    print(f"Loaded model version {bundle.get('version')} trained at {bundle.get('trained_at')}")

    df = pd.read_csv(data_path)
    X = df[features]
    y = df["health_status"]

    y_pred = model.predict(X)
    accuracy = accuracy_score(y, y_pred)
    precision, recall, f1, _ = precision_recall_fscore_support(y, y_pred, average="weighted")

    print("\n--- Model Evaluation Summary ---")
    print(f"Accuracy:  {accuracy:.4f}")
    print(f"Precision: {precision:.4f}")
    print(f"Recall:    {recall:.4f}")
    print(f"F1 Score:  {f1:.4f}")
    print("\nClassification Report:")
    print(classification_report(y, y_pred, digits=4))
    print("Confusion Matrix:")
    print(confusion_matrix(y, y_pred, labels=classes))

if __name__ == "__main__":
    evaluate_saved_model()
