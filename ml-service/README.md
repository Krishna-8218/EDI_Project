# AssetFlow AI Asset Health & Risk Prediction Microservice

This microservice provides machine-learning-driven health evaluation and risk forecasting for physical enterprise assets.

## Architecture

```
Asset Data (Telemetry, Age, Usage, Repairs, Incidents, Warranty)
                     ↓
         Pydantic Feature Pipeline
                     ↓
  RandomForestClassifier (Scikit-Learn)
                     ↓
 Probabilities: [HEALTHY, MAINTENANCE_REQUIRED, REPLACE_SOON]
                     ↓
  Health Score = P(H)*100 + P(M)*60 + P(R)*20
                     ↓
 Deterministic Factors & Actionable Recommendations
```

## Features Used
- `asset_age_days`: Asset age in days from procurement date
- `assignment_count`: Lifetime user custody loans
- `repair_count`: Corrective service repairs
- `maintenance_count`: Total maintenance events
- `damage_report_count`: Employee incident/damage reports
- `days_since_maintenance`: Recency of servicing
- `warranty_active`: Manufacturer warranty status (0 or 1)
- `condition_score`: Rated physical condition (1-4)
- `status_score`: Operational availability status (0-3)

## Running the Microservice Locally

### 1. Install Dependencies
```bash
pip install -r requirements.txt
```

### 2. Retrain / Generate Model (Optional)
```bash
python training/generate_demo_data.py
python training/train.py
python training/evaluate.py
```

### 3. Launch FastAPI Server
```bash
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

## Endpoints
- `GET /health` - Service health status
- `POST /predict` - Run ML health inference on an asset feature payload
