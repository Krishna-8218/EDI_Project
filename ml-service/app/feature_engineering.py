import numpy as np
import pandas as pd
from app.schemas import PredictRequest

CONDITION_MAP = {
    "EXCELLENT": 4,
    "GOOD": 3,
    "FAIR": 2,
    "DAMAGED": 1,
    "POOR": 1
}

STATUS_MAP = {
    "AVAILABLE": 3,
    "ASSIGNED": 3,
    "UNDER_MAINTENANCE": 2,
    "DAMAGED": 1,
    "LOST": 1,
    "RETIRED": 0
}

def map_condition_to_score(condition_str: str | None) -> int:
    if not condition_str:
        return 3
    normalized = str(condition_str).strip().upper()
    return CONDITION_MAP.get(normalized, 3)

def map_status_to_score(status_str: str | None) -> int:
    if not status_str:
        return 3
    normalized = str(status_str).strip().upper()
    return STATUS_MAP.get(normalized, 3)

def extract_features(req: PredictRequest, feature_names: list[str]) -> pd.DataFrame:
    condition_score = map_condition_to_score(req.condition)
    status_score = map_status_to_score(req.status)
    warranty_active = 1 if req.warranty_active else 0

    feature_dict = {
        "asset_age_days": req.asset_age_days,
        "assignment_count": req.assignment_count,
        "repair_count": req.repair_count,
        "maintenance_count": req.maintenance_count,
        "damage_report_count": req.damage_report_count,
        "days_since_maintenance": req.days_since_maintenance,
        "warranty_active": warranty_active,
        "condition_score": condition_score,
        "status_score": status_score,
    }

    # Format as single-row dataframe with exact model column order
    df = pd.DataFrame([feature_dict])[feature_names]
    return df
