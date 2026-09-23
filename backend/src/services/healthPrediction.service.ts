import prisma from '../lib/prisma';
import { AppError } from '../middleware/error.middleware';
import { AuditService } from './audit.service';
import { config } from '../config/env';

export interface HealthProbabilities {
  HEALTHY: number;
  MAINTENANCE_REQUIRED: number;
  REPLACE_SOON: number;
}

export interface HealthFactor {
  key: string;
  label: string;
  impact: 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE' | 'CRITICAL';
  icon: string;
}

export interface HealthRecommendation {
  id: string;
  title: string;
  description: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  category: string;
}

export class HealthPredictionService {
  /**
   * Runs AI health prediction for a given asset by querying the Python ML service,
   * calculating features from actual database telemetry, and persisting the result.
   */
  static async predictAssetHealth(assetId: string, performedByUserId?: string) {
    const asset = await prisma.asset.findUnique({
      where: { id: assetId },
      include: {
        assignments: {
          orderBy: { assignedAt: 'desc' },
        },
        maintenances: {
          orderBy: { createdAt: 'desc' },
        },
        reports: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!asset) {
      throw new AppError('Asset not found', 404);
    }

    const now = new Date();

    // 1. Calculate Asset Age in days
    const baseDate = asset.purchaseDate ? new Date(asset.purchaseDate) : new Date(asset.createdAt);
    const ageDays = Math.max(1, Math.floor((now.getTime() - baseDate.getTime()) / (1000 * 60 * 60 * 24)));

    // 2. Lifetime Assignments
    const assignmentCount = asset.assignments.length;

    // 3. Maintenance Records & Repairs
    const maintenanceCount = asset.maintenances.length;
    const repairCount = asset.maintenances.filter(
      (m) =>
        m.maintenanceType === 'CORRECTIVE' ||
        m.title.toLowerCase().includes('repair') ||
        m.title.toLowerCase().includes('fix') ||
        m.title.toLowerCase().includes('broken')
    ).length;

    // 4. Incident / Damage Reports
    const damageReportCount = asset.reports.filter(
      (r) => r.type === 'DAMAGE' || r.type === 'LOSS' || r.type === 'ISSUE'
    ).length;

    // 5. Days Since Last Maintenance
    let daysSinceMaintenance = ageDays;
    if (asset.maintenances.length > 0) {
      const latestMaint = asset.maintenances[0];
      const maintDate = latestMaint.completedDate
        ? new Date(latestMaint.completedDate)
        : latestMaint.scheduledDate
        ? new Date(latestMaint.scheduledDate)
        : new Date(latestMaint.createdAt);
      daysSinceMaintenance = Math.max(0, Math.floor((now.getTime() - maintDate.getTime()) / (1000 * 60 * 60 * 24)));
    }

    // 6. Warranty Status
    const warrantyActive = asset.warrantyExpiry ? new Date(asset.warrantyExpiry) > now : false;

    // 7. Costs
    const totalMaintenanceCost = asset.maintenances.reduce(
      (sum, m) => sum + (m.cost ? Number(m.cost) : 0),
      0
    );

    const featurePayload = {
      asset_age_days: ageDays,
      assignment_count: assignmentCount,
      repair_count: repairCount,
      maintenance_count: maintenanceCount,
      damage_report_count: damageReportCount,
      days_since_maintenance: daysSinceMaintenance,
      warranty_active: warrantyActive,
      condition: asset.condition || 'Good',
      status: asset.status,
      purchase_price: asset.purchasePrice ? Number(asset.purchasePrice) : undefined,
      total_maintenance_cost: totalMaintenanceCost,
    };

    // 8. Communicate with Python ML FastAPI Service
    const mlUrl = `${config.mlServiceUrl}/predict`;
    let mlResult: {
      status: string;
      riskLevel: string;
      probabilities: HealthProbabilities;
      healthScore: number;
      factors: HealthFactor[];
      recommendations: HealthRecommendation[];
      modelVersion: string;
      predictedAt: string;
    };

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);

      const response = await fetch(mlUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(featurePayload),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`ML service responded with HTTP status ${response.status}`);
      }

      mlResult = (await response.json()) as typeof mlResult;
    } catch (err: any) {
      console.error(`[HealthPredictionService] ML Service unreachable at ${mlUrl}:`, err.message || err);
      // Fail closed with clean 503 error as per requirements - NEVER save fake prediction
      throw new AppError(
        'AI Health Prediction service is temporarily unavailable. Please try again.',
        503
      );
    }

    // 9. Persist prediction in PostgreSQL
    const prediction = await prisma.assetHealthPrediction.create({
      data: {
        assetId: asset.id,
        healthScore: mlResult.healthScore,
        status: mlResult.status,
        riskLevel: mlResult.riskLevel,
        probabilities: mlResult.probabilities as any,
        factors: mlResult.factors as any,
        recommendations: mlResult.recommendations as any,
        modelVersion: mlResult.modelVersion || '1.0.0',
        predictedAt: new Date(mlResult.predictedAt || now.toISOString()),
      },
    });

    // 10. Audit Trail
    await AuditService.log({
      userId: performedByUserId,
      action: 'ASSET_HEALTH_PREDICTED',
      entity: 'Asset',
      entityId: asset.id,
      description: `Generated AI Health & Risk prediction for ${asset.name} (${asset.assetTag}): Score ${prediction.healthScore}/100 [${prediction.status} - ${prediction.riskLevel} Risk]`,
    });

    return prediction;
  }

  /**
   * Retrieves the latest health prediction for a given asset
   */
  static async getAssetHealth(assetId: string) {
    const asset = await prisma.asset.findUnique({
      where: { id: assetId },
      select: { id: true },
    });

    if (!asset) {
      throw new AppError('Asset not found', 404);
    }

    const latestPrediction = await prisma.assetHealthPrediction.findFirst({
      where: { assetId },
      orderBy: { predictedAt: 'desc' },
    });

    return latestPrediction;
  }

  /**
   * Retrieves chronological health prediction history for trend charts
   */
  static async getAssetHealthHistory(assetId: string) {
    const asset = await prisma.asset.findUnique({
      where: { id: assetId },
      select: { id: true },
    });

    if (!asset) {
      throw new AppError('Asset not found', 404);
    }

    const history = await prisma.assetHealthPrediction.findMany({
      where: { assetId },
      orderBy: { predictedAt: 'asc' },
      take: 100,
    });

    return history;
  }

  /**
   * Aggregates organization-wide AI health predictions for Dashboard & Analytics
   */
  static async getHealthOverview() {
    const totalAssets = await prisma.asset.count();

    // Get the most recent prediction for each analyzed asset
    const allPredictions = await prisma.assetHealthPrediction.findMany({
      orderBy: { predictedAt: 'desc' },
      distinct: ['assetId'],
    });

    const analyzedCount = allPredictions.length;
    let healthyCount = 0;
    let maintenanceRequiredCount = 0;
    let replaceSoonCount = 0;
    let lowRiskCount = 0;
    let mediumRiskCount = 0;
    let highRiskCount = 0;
    let criticalRiskCount = 0;
    let totalScoreSum = 0;

    for (const p of allPredictions) {
      totalScoreSum += p.healthScore;
      if (p.status === 'HEALTHY') healthyCount++;
      else if (p.status === 'MAINTENANCE_REQUIRED') maintenanceRequiredCount++;
      else if (p.status === 'REPLACE_SOON') replaceSoonCount++;

      if (p.riskLevel === 'LOW') lowRiskCount++;
      else if (p.riskLevel === 'MEDIUM') mediumRiskCount++;
      else if (p.riskLevel === 'HIGH') highRiskCount++;
      else if (p.riskLevel === 'CRITICAL') criticalRiskCount++;
    }

    const avgScore = analyzedCount > 0 ? Math.round(totalScoreSum / analyzedCount) : 0;

    return {
      totalAssets,
      analyzedAssets: analyzedCount,
      unanalyzedAssets: Math.max(0, totalAssets - analyzedCount),
      avgHealthScore: avgScore,
      statusCounts: {
        HEALTHY: healthyCount,
        MAINTENANCE_REQUIRED: maintenanceRequiredCount,
        REPLACE_SOON: replaceSoonCount,
      },
      riskCounts: {
        LOW: lowRiskCount,
        MEDIUM: mediumRiskCount,
        HIGH: highRiskCount,
        CRITICAL: criticalRiskCount,
      },
      recentPredictions: allPredictions.slice(0, 5),
    };
  }
}
