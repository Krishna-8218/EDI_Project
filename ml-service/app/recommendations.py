from typing import List
from app.schemas import PredictRequest, FactorItem, RecommendationItem

def extract_contributing_factors(req: PredictRequest, status: str, health_score: int) -> List[FactorItem]:
    factors: List[FactorItem] = []

    # 1. Repairs & Maintenance History
    if req.repair_count >= 4:
        factors.append(FactorItem(
            key="frequent_repairs",
            label=f"{req.repair_count} historical corrective repairs recorded",
            impact="CRITICAL",
            icon="Wrench"
        ))
    elif req.repair_count > 0:
        factors.append(FactorItem(
            key="moderate_repairs",
            label=f"{req.repair_count} previous repair ticket(s)",
            impact="NEGATIVE",
            icon="Wrench"
        ))
    elif req.maintenance_count > 0:
        factors.append(FactorItem(
            key="good_maintenance",
            label="Good maintenance record with zero corrective failures",
            impact="POSITIVE",
            icon="CheckCircle2"
        ))
    else:
        factors.append(FactorItem(
            key="no_repairs",
            label="No historical repair records",
            impact="NEUTRAL",
            icon="ShieldCheck"
        ))

    # 2. Maintenance Overdue / Recency
    if req.days_since_maintenance > 180:
        factors.append(FactorItem(
            key="maintenance_overdue",
            label=f"Maintenance overdue ({req.days_since_maintenance} days since last service)",
            impact="NEGATIVE" if req.days_since_maintenance < 365 else "CRITICAL",
            icon="Clock"
        ))
    elif req.days_since_maintenance <= 60 and req.maintenance_count > 0:
        factors.append(FactorItem(
            key="recently_serviced",
            label=f"Recently serviced ({req.days_since_maintenance} days ago)",
            impact="POSITIVE",
            icon="CalendarCheck"
        ))

    # 3. Damage Reports
    if req.damage_report_count >= 2:
        factors.append(FactorItem(
            key="multiple_damages",
            label=f"{req.damage_report_count} filed incident/damage reports",
            impact="CRITICAL",
            icon="AlertTriangle"
        ))
    elif req.damage_report_count == 1:
        factors.append(FactorItem(
            key="damage_report",
            label="1 active/resolved damage report on record",
            impact="NEGATIVE",
            icon="AlertTriangle"
        ))
    else:
        factors.append(FactorItem(
            key="no_damage",
            label="Zero damage reports filed",
            impact="POSITIVE",
            icon="Shield"
        ))

    # 4. Asset Age
    years = round(req.asset_age_days / 365.25, 1)
    if req.asset_age_days > 1460: # > 4 years
        factors.append(FactorItem(
            key="aging_asset",
            label=f"Aging asset ({years} years in operation / {req.asset_age_days} days)",
            impact="NEGATIVE",
            icon="History"
        ))
    elif req.asset_age_days < 180:
        factors.append(FactorItem(
            key="new_asset",
            label=f"Recently deployed asset ({req.asset_age_days} days old)",
            impact="POSITIVE",
            icon="Sparkles"
        ))
    else:
        factors.append(FactorItem(
            key="standard_age",
            label=f"Asset age: {years} years ({req.asset_age_days} days)",
            impact="NEUTRAL",
            icon="Calendar"
        ))

    # 5. Warranty Status
    if req.warranty_active:
        factors.append(FactorItem(
            key="warranty_active",
            label="Manufacturer warranty is currently active",
            impact="POSITIVE",
            icon="ShieldCheck"
        ))
    else:
        factors.append(FactorItem(
            key="warranty_expired",
            label="Manufacturer warranty expired or unlisted",
            impact="NEGATIVE" if req.asset_age_days > 365 else "NEUTRAL",
            icon="ShieldAlert"
        ))

    # 6. Usage / Assignment Frequency
    if req.assignment_count >= 15:
        factors.append(FactorItem(
            key="high_utilization",
            label=f"High custody turnover ({req.assignment_count} assignments)",
            impact="NEGATIVE",
            icon="ArrowRightLeft"
        ))
    elif req.assignment_count > 0:
        factors.append(FactorItem(
            key="normal_utilization",
            label=f"Utilized across {req.assignment_count} custody loans",
            impact="NEUTRAL",
            icon="ArrowRightLeft"
        ))

    # 7. Hardware Condition
    condition_str = (req.condition or "Good").capitalize()
    if condition_str in ["Damaged", "Poor"]:
        factors.append(FactorItem(
            key="condition_degraded",
            label=f"Physical condition is logged as '{condition_str}'",
            impact="CRITICAL",
            icon="AlertOctagon"
        ))
    elif condition_str == "Excellent":
        factors.append(FactorItem(
            key="condition_excellent",
            label="Physical condition rated 'Excellent'",
            impact="POSITIVE",
            icon="CheckCircle"
        ))

    return factors

def generate_recommendations(req: PredictRequest, status: str, risk_level: str, health_score: int) -> List[RecommendationItem]:
    recommendations: List[RecommendationItem] = []

    if status == "REPLACE_SOON" or risk_level == "CRITICAL" or health_score < 40:
        recommendations.append(RecommendationItem(
            id="rec_replace_eval",
            title="Evaluate asset decommission & replacement",
            description="High risk and cumulative degradation indicate cost-effective lifecycle expiration. Prepare replacement procurement.",
            priority="URGENT",
            category="REPLACEMENT"
        ))
        recommendations.append(RecommendationItem(
            id="rec_safety_audit",
            title="Perform critical hardware safety audit",
            description="Verify physical integrity and backup data before severe equipment failure disrupts operations.",
            priority="HIGH",
            category="INSPECTION"
        ))
        recommendations.append(RecommendationItem(
            id="rec_limit_deployment",
            title="Restrict reassignment to mission-critical roles",
            description="Avoid assigning this asset to high-demand workflows until remediation or replacement occurs.",
            priority="MEDIUM",
            category="OPERATIONAL"
        ))

    elif status == "MAINTENANCE_REQUIRED" or risk_level == "HIGH" or health_score < 65:
        recommendations.append(RecommendationItem(
            id="rec_schedule_preventive",
            title="Schedule comprehensive maintenance servicing",
            description="Service ticket required to inspect key components, apply firmware/cleaning, and reset wear parameters.",
            priority="HIGH",
            category="MAINTENANCE"
        ))
        if req.repair_count >= 2:
            recommendations.append(RecommendationItem(
                id="rec_monitor_repairs",
                title="Monitor repair frequency and component failure log",
                description="Repetitive corrective servicing detected. Check if a specific subsystem requires manufacturer overhaul.",
                priority="MEDIUM",
                category="INSPECTION"
            ))
        if not req.warranty_active and req.asset_age_days > 730:
            recommendations.append(RecommendationItem(
                id="rec_review_cost_benefit",
                title="Review ongoing maintenance costs vs valuation",
                description="Calculate cumulative repair expenses against current residual book value to optimize budget.",
                priority="MEDIUM",
                category="OPERATIONAL"
            ))

    else: # HEALTHY / LOW RISK
        recommendations.append(RecommendationItem(
            id="rec_continue_cadence",
            title="Continue routine preventive maintenance cadence",
            description="Asset health telemetry is optimal. Maintain standard scheduled servicing intervals.",
            priority="LOW",
            category="MAINTENANCE"
        ))
        recommendations.append(RecommendationItem(
            id="rec_regular_audit",
            title="Perform scheduled visual inspection during custody returns",
            description="Ensure physical condition ratings and location tags remain accurately recorded in the inventory.",
            priority="LOW",
            category="OPERATIONAL"
        ))

    return recommendations
