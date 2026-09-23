import os
from datetime import datetime, timezone
import joblib
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from app.schemas import (
    PredictRequest,
    PredictResponse,
    HealthCheckResponse
)
from app.feature_engineering import extract_features
from app.recommendations import extract_contributing_factors, generate_recommendations

app = FastAPI(
    title="AssetFlow AI Asset Health & Risk Prediction Service",
    version="1.0.0",
    description="Machine Learning inference microservice predicting organizational asset health scores, probabilities, and lifecycle risks."
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global model state
MODEL_BUNDLE = None
MODEL_PATH = os.path.join(os.path.dirname(__file__), "..", "model", "asset_health_model.joblib")

@app.on_event("startup")
def load_model():
    global MODEL_BUNDLE
    if not os.path.exists(MODEL_PATH):
        raise RuntimeError(f"Model file not found at {MODEL_PATH}. Train the model before starting the service.")
    MODEL_BUNDLE = joblib.load(MODEL_PATH)
    print(f"ML Model loaded successfully. Classes: {MODEL_BUNDLE['classes']}, Version: {MODEL_BUNDLE.get('version')}")

@app.get("/health", response_model=HealthCheckResponse)
def health_check():
    if MODEL_BUNDLE is None:
        raise HTTPException(status_code=503, detail="Model not initialized")
    return HealthCheckResponse(
        status="ok",
        service="AssetFlow AI Prediction Engine",
        version=MODEL_BUNDLE.get("version", "1.0.0")
    )

@app.post("/predict", response_model=PredictResponse)
def predict_health(req: PredictRequest):
    if MODEL_BUNDLE is None:
        raise HTTPException(status_code=503, detail="AI Prediction service is unavailable (model not loaded).")

    model = MODEL_BUNDLE["model"]
    feature_names = MODEL_BUNDLE["features"]
    classes = MODEL_BUNDLE["classes"]

    try:
        # Extract and format features
        X = extract_features(req, feature_names)

        # Get class probabilities
        probabilities_array = model.predict_proba(X)[0]
        prob_dict = {cls_name: round(float(prob), 4) for cls_name, prob in zip(classes, probabilities_array)}

        p_healthy = prob_dict.get("HEALTHY", 0.0)
        p_maint = prob_dict.get("MAINTENANCE_REQUIRED", 0.0)
        p_replace = prob_dict.get("REPLACE_SOON", 0.0)

        # Exact formula specified in requirement:
        # healthScore = P(HEALTHY)*100 + P(MAINTENANCE_REQUIRED)*60 + P(REPLACE_SOON)*20
        raw_score = (p_healthy * 100.0) + (p_maint * 60.0) + (p_replace * 20.0)
        health_score = int(np.clip(round(raw_score), 0, 100)) if 'np' in globals() else int(max(0, min(100, round(raw_score))))

        # Model predicted status class
        status = model.predict(X)[0]

        # Determine Risk Level
        if health_score >= 80 and status == "HEALTHY":
            risk_level = "LOW"
        elif health_score >= 60:
            risk_level = "MEDIUM"
        elif health_score >= 40:
            risk_level = "HIGH"
        else:
            risk_level = "CRITICAL"

        # Generate contextual factors and recommendations
        factors = extract_contributing_factors(req, status, health_score)
        recommendations = generate_recommendations(req, status, risk_level, health_score)

        return PredictResponse(
            status=status,
            riskLevel=risk_level,
            probabilities=prob_dict,
            healthScore=health_score,
            factors=factors,
            recommendations=recommendations,
            modelVersion=MODEL_BUNDLE.get("version", "1.0.0"),
            predictedAt=datetime.now(timezone.utc).isoformat()
        )

    except Exception as e:
        print(f"Error during ML prediction inference: {e}")
        raise HTTPException(status_code=500, detail=f"Inference error: {str(e)}")
