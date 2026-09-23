"""
=============================================================================
AssetFlow AI Asset Health & Risk Prediction - Synthetic Training Data Generator
=============================================================================
NOTE: This script generates domain-grounded synthetic/demo dataset for
training the Asset Health & Risk Prediction model when insufficient empirical
failure records exist in the production database.

Generated dataset is saved to: ml-service/data/training_data.csv
=============================================================================
"""

import os
import random
import numpy as np
import pandas as pd

def generate_synthetic_data(num_samples: int = 3500, random_seed: int = 42) -> pd.DataFrame:
    np.random.seed(random_seed)
    random.seed(random_seed)

    records = []

    for _ in range(num_samples):
        # Base Asset Age (15 days to 6 years)
        age_days = int(np.random.exponential(scale=500) + 15)
        age_days = min(max(age_days, 15), 2500)

        # Warranty status (typically valid up to 1-3 years / ~365-1095 days)
        warranty_cutoff = np.random.choice([365, 730, 1095], p=[0.4, 0.4, 0.2])
        warranty_active = 1 if age_days < warranty_cutoff and random.random() > 0.1 else 0

        # Assignments (correlated with age)
        expected_assignments = max(1, int(age_days / 60))
        assignment_count = max(0, int(np.random.poisson(lam=expected_assignments)))

        # Maintenances & Repairs
        expected_maint = max(0, int(age_days / 150))
        maintenance_count = max(0, int(np.random.poisson(lam=expected_maint)))

        # Proportion of maintenances that were corrective repairs
        repair_rate = 0.2 + (0.5 if age_days > 800 else 0.1)
        repair_count = int(np.random.binomial(n=max(maintenance_count, 1), p=min(repair_rate, 0.9)))
        repair_count = min(repair_count, maintenance_count + 3)

        # Damage Reports (incidents)
        damage_prob = 0.05 + (0.02 * (repair_count + 1))
        damage_report_count = int(np.random.poisson(lam=min(damage_prob * (age_days / 300), 4)))

        # Days since last maintenance
        if maintenance_count > 0:
            days_since_maint = int(np.random.exponential(scale=100))
            days_since_maint = min(days_since_maint, age_days)
        else:
            days_since_maint = age_days

        # Condition: Excellent (4), Good (3), Fair (2), Damaged (1)
        # Determine initial condition probabilistically based on wear
        wear_index = (
            (age_days / 1500) * 2.5 +
            (repair_count * 0.8) +
            (damage_report_count * 1.2) +
            (1 if not warranty_active else -0.5) +
            (days_since_maint / 200)
        )

        if wear_index < 1.8:
            condition = "EXCELLENT"
            condition_score = 4
        elif wear_index < 3.8:
            condition = "GOOD"
            condition_score = 3
        elif wear_index < 6.5:
            condition = "FAIR"
            condition_score = 2
        else:
            condition = "DAMAGED"
            condition_score = 1

        # Current Status
        if condition == "DAMAGED" and random.random() > 0.4:
            status = "DAMAGED"
            status_score = 1
        elif days_since_maint > 250 and random.random() > 0.5:
            status = "UNDER_MAINTENANCE"
            status_score = 2
        elif assignment_count > 0 and random.random() > 0.35:
            status = "ASSIGNED"
            status_score = 3
        else:
            status = "AVAILABLE"
            status_score = 3

        # Ground Truth Health Status Determination
        # Scoring risk from 0 (pristine) to 100 (critical degradation)
        degradation_score = (
            (age_days / 2000) * 30 +
            (min(repair_count, 8) / 8) * 25 +
            (min(damage_report_count, 5) / 5) * 20 +
            (min(days_since_maint, 365) / 365) * 15 +
            ((4 - condition_score) / 3) * 20 +
            (10 if not warranty_active else 0) +
            np.random.normal(0, 4) # slight noise
        )

        if degradation_score < 36:
            label = "HEALTHY"
        elif degradation_score < 68:
            label = "MAINTENANCE_REQUIRED"
        else:
            label = "REPLACE_SOON"

        records.append({
            "asset_age_days": age_days,
            "assignment_count": assignment_count,
            "repair_count": repair_count,
            "maintenance_count": maintenance_count,
            "damage_report_count": damage_report_count,
            "days_since_maintenance": days_since_maint,
            "warranty_active": warranty_active,
            "condition_score": condition_score,
            "status_score": status_score,
            "health_status": label
        })

    df = pd.DataFrame(records)
    return df

if __name__ == "__main__":
    output_dir = os.path.join(os.path.dirname(__file__), "..", "data")
    os.makedirs(output_dir, exist_ok=True)
    csv_path = os.path.join(output_dir, "training_data.csv")

    df = generate_synthetic_data(num_samples=3500)
    df.to_csv(csv_path, index=False)
    print(f"Generated {len(df)} synthetic records successfully -> {csv_path}")
    print("Class distribution:")
    print(df["health_status"].value_counts(normalize=True))
