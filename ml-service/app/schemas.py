from typing import Dict, List, Optional
from pydantic import BaseModel, Field

class PredictRequest(BaseModel):
    asset_age_days: int = Field(default=0, ge=0, description="Age of the asset in days")
    assignment_count: int = Field(default=0, ge=0, description="Total assignments count")
    repair_count: int = Field(default=0, ge=0, description="Corrective repairs count")
    maintenance_count: int = Field(default=0, ge=0, description="Total maintenance records count")
    damage_report_count: int = Field(default=0, ge=0, description="Damage/incident reports count")
    days_since_maintenance: int = Field(default=0, ge=0, description="Days elapsed since last servicing")
    warranty_active: bool = Field(default=False, description="Whether manufacturer warranty is active")
    condition: Optional[str] = Field(default="Good", description="Asset condition: Excellent, Good, Fair, Damaged")
    status: Optional[str] = Field(default="AVAILABLE", description="Asset current status")
    purchase_price: Optional[float] = Field(default=None, description="Initial purchase valuation")
    total_maintenance_cost: Optional[float] = Field(default=None, description="Sum of maintenance costs")

class FactorItem(BaseModel):
    key: str
    label: str
    impact: str  # "POSITIVE", "NEUTRAL", "NEGATIVE", "CRITICAL"
    icon: str    # Lucide icon name hint

class RecommendationItem(BaseModel):
    id: str
    title: str
    description: str
    priority: str  # "LOW", "MEDIUM", "HIGH", "URGENT"
    category: str  # "MAINTENANCE", "INSPECTION", "REPLACEMENT", "OPERATIONAL"

class PredictResponse(BaseModel):
    status: str  # "HEALTHY" | "MAINTENANCE_REQUIRED" | "REPLACE_SOON"
    riskLevel: str  # "LOW" | "MEDIUM" | "HIGH" | "CRITICAL"
    probabilities: Dict[str, float]
    healthScore: int
    factors: List[FactorItem]
    recommendations: List[RecommendationItem]
    modelVersion: str = "1.0.0"
    predictedAt: str

class HealthCheckResponse(BaseModel):
    status: str = "ok"
    service: str = "AssetFlow AI Prediction Engine"
    version: str = "1.0.0"
