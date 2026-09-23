import prisma from '../lib/prisma';
import { PageContext } from '../types/ai.types';

export interface CalculatedAssetHealth {
  assetId: string;
  assetTag: string;
  name: string;
  category: string;
  condition: string;
  healthScore: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  factors: string[];
  recommendations: string[];
  daysSinceLastMaintenance: number | null;
  openReportsCount: number;
  status: string;
}

export class AIContextService {
  /**
   * Calculates health metrics and risk factors for an asset
   */
  public calculateHealth(asset: any): CalculatedAssetHealth {
    let score = 100;
    const factors: string[] = [];
    const recommendations: string[] = [];

    // 1. Condition factor
    const condition = (asset.condition || 'Good').toLowerCase();
    if (condition.includes('excellent')) {
      score += 0;
    } else if (condition.includes('good')) {
      score -= 5;
    } else if (condition.includes('fair')) {
      score -= 25;
      factors.push('Sub-optimal physical condition (Fair condition recorded)');
      recommendations.push('Schedule preventive hardware checkup');
    } else if (condition.includes('damaged') || condition.includes('poor')) {
      score -= 45;
      factors.push('Physical or operational damage logged');
      recommendations.push('Immediate corrective repair or diagnostics required');
    }

    // 2. Status factor
    if (asset.status === 'UNDER_MAINTENANCE') {
      score -= 20;
      factors.push('Asset is currently under active maintenance');
    } else if (asset.status === 'DAMAGED') {
      score -= 40;
      factors.push('Asset status marked as DAMAGED');
      recommendations.push('Inspect and initiate repair workflow or assess retirement');
    } else if (asset.status === 'LOST') {
      score -= 80;
      factors.push('Asset reported as LOST/Missing');
      recommendations.push('Conduct security audit and file loss report');
    } else if (asset.status === 'RETIRED') {
      score = 0;
      factors.push('Asset is retired from operational service');
    }

    // 3. Open damage reports factor
    const openReports = (asset.reports || []).filter(
      (r: any) => r.status === 'PENDING' || r.status === 'UNDER_REVIEW'
    );
    if (openReports.length > 0) {
      score -= openReports.length * 15;
      factors.push(`${openReports.length} unresolved incident/damage report(s)`);
      recommendations.push('Resolve pending incident tickets filed by employees');
    }

    // 4. Maintenance history factor
    const completedMaintenances = (asset.maintenances || [])
      .filter((m: any) => m.status === 'COMPLETED' && m.completedDate)
      .sort(
        (a: any, b: any) =>
          new Date(b.completedDate).getTime() - new Date(a.completedDate).getTime()
      );

    let daysSinceLastService: number | null = null;
    const now = new Date().getTime();

    if (completedMaintenances.length > 0) {
      const lastDate = new Date(completedMaintenances[0].completedDate).getTime();
      daysSinceLastService = Math.floor((now - lastDate) / (1000 * 60 * 60 * 24));

      if (daysSinceLastService > 365) {
        score -= 15;
        factors.push(`Over 1 year since last maintenance check (${daysSinceLastService} days ago)`);
        recommendations.push('Schedule routine annual servicing');
      } else if (daysSinceLastService > 180) {
        score -= 5;
        factors.push(`Over 6 months since last check (${daysSinceLastService} days ago)`);
      }
    } else if (asset.purchaseDate) {
      const ageDays = Math.floor((now - new Date(asset.purchaseDate).getTime()) / (1000 * 60 * 60 * 24));
      if (ageDays > 365) {
        score -= 10;
        factors.push(`No maintenance record found for asset in service for ${Math.floor(ageDays / 30)} months`);
        recommendations.push('Perform initial preventive baseline inspection');
      }
    }

    // 5. Warranty factor
    if (asset.warrantyExpiry) {
      const warrantyExp = new Date(asset.warrantyExpiry).getTime();
      if (warrantyExp < now) {
        factors.push('Manufacturer warranty expired');
      }
    }

    // Normalize score to 0..100
    score = Math.max(0, Math.min(100, score));

    // Determine risk level
    let riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' = 'LOW';
    if (score < 35) {
      riskLevel = 'CRITICAL';
    } else if (score < 60) {
      riskLevel = 'HIGH';
    } else if (score < 80) {
      riskLevel = 'MEDIUM';
    } else {
      riskLevel = 'LOW';
    }

    if (factors.length === 0) {
      factors.push('All telemetry and maintenance records are in optimal condition');
    }
    if (recommendations.length === 0) {
      recommendations.push('Maintain regular scheduled preventive care');
    }

    return {
      assetId: asset.id,
      assetTag: asset.assetTag,
      name: asset.name,
      category: asset.category,
      condition: asset.condition || 'Good',
      healthScore: score,
      riskLevel,
      factors,
      recommendations,
      daysSinceLastMaintenance: daysSinceLastService,
      openReportsCount: openReports.length,
      status: asset.status,
    };
  }

  /**
   * Retrieves specific asset details with full history
   */
  public async getSpecificAssetContext(assetIdOrTag: string): Promise<string | null> {
    try {
      const asset = await prisma.asset.findFirst({
        where: {
          OR: [
            { id: assetIdOrTag.length === 36 ? assetIdOrTag : undefined },
            { assetTag: { equals: assetIdOrTag, mode: 'insensitive' } },
            { name: { contains: assetIdOrTag, mode: 'insensitive' } },
          ].filter(Boolean) as any,
        },
        include: {
          assignments: {
            include: {
              user: {
                select: { id: true, name: true, email: true, department: true },
              },
            },
            orderBy: { assignedAt: 'desc' },
            take: 5,
          },
          maintenances: {
            orderBy: { createdAt: 'desc' },
            take: 5,
          },
          reports: {
            include: {
              reporter: {
                select: { id: true, name: true, email: true },
              },
            },
            orderBy: { createdAt: 'desc' },
            take: 5,
          },
        },
      });

      if (!asset) return null;

      const health = this.calculateHealth(asset);
      const activeAssignment = asset.assignments.find((a) => a.status === 'ACTIVE');

      let contextStr = `=== TARGET ASSET DETAILS ===\n`;
      contextStr += `Name: ${asset.name}\n`;
      contextStr += `Tag Code: ${asset.assetTag}\n`;
      contextStr += `Category: ${asset.category}\n`;
      contextStr += `Current Status: ${asset.status}\n`;
      contextStr += `Location: ${asset.location || 'Central Depot'}\n`;
      contextStr += `Condition: ${asset.condition || 'Good'}\n`;
      contextStr += `Manufacturer: ${asset.manufacturer || 'N/A'}, Model: ${asset.model || 'N/A'}\n`;
      contextStr += `Serial Number: ${asset.serialNumber || 'N/A'}\n`;
      contextStr += `Purchase Price: $${Number(asset.purchasePrice || 0).toLocaleString()}\n`;
      contextStr += `Purchase Date: ${asset.purchaseDate ? asset.purchaseDate.toISOString().split('T')[0] : 'N/A'}\n`;
      contextStr += `Warranty Expiry: ${asset.warrantyExpiry ? asset.warrantyExpiry.toISOString().split('T')[0] : 'N/A'}\n`;
      contextStr += `\n=== ASSET HEALTH & PREDICTIVE METRICS ===\n`;
      contextStr += `Health Score: ${health.healthScore}/100\n`;
      contextStr += `Risk Level: ${health.riskLevel}\n`;
      contextStr += `Contributing Factors:\n${health.factors.map((f) => ` - ${f}`).join('\n')}\n`;
      contextStr += `Recommended Actions:\n${health.recommendations.map((r) => ` - ${r}`).join('\n')}\n`;

      if (activeAssignment && activeAssignment.user) {
        contextStr += `\n=== CURRENT CUSTODY / LOAN ===\n`;
        contextStr += `Assigned To: ${activeAssignment.user.name} (${activeAssignment.user.email})\n`;
        contextStr += `Department: ${activeAssignment.user.department || 'General'}\n`;
        contextStr += `Assigned Date: ${activeAssignment.assignedAt.toISOString().split('T')[0]}\n`;
        contextStr += `Notes: ${activeAssignment.notes || 'None'}\n`;
      } else {
        contextStr += `\n=== CURRENT CUSTODY ===\nCurrently in stock / not assigned to any user.\n`;
      }

      if (asset.maintenances.length > 0) {
        contextStr += `\n=== RECENT MAINTENANCE HISTORY (${asset.maintenances.length} records) ===\n`;
        asset.maintenances.forEach((m) => {
          contextStr += `• [${m.status}] ${m.title} (${m.maintenanceType}) - Cost: $${Number(m.cost || 0)} - Tech: ${m.performedBy || 'Pending'}\n`;
        });
      }

      if (asset.reports.length > 0) {
        contextStr += `\n=== INCIDENT & DAMAGE REPORTS (${asset.reports.length} records) ===\n`;
        asset.reports.forEach((r) => {
          contextStr += `• [${r.status}] ${r.type}: ${r.description} (Reported by: ${r.reporter?.name || 'User'})\n`;
        });
      }

      return contextStr;
    } catch (err) {
      console.error('Error fetching specific asset context:', err);
      return null;
    }
  }

  /**
   * Assembles relevant contextual database records based on user prompt and page context
   */
  public async buildContext(
    userMessage: string,
    pageContext?: PageContext
  ): Promise<{ contextText: string; sources: string[] }> {
    const sources: string[] = [];
    let contextParts: string[] = [];
    const lower = userMessage.toLowerCase();

    // 1. Check if the user is currently on an Asset Details page or asking about a specific asset
    let specificAssetHandled = false;
    if (pageContext?.assetId) {
      const assetCtx = await this.getSpecificAssetContext(pageContext.assetId);
      if (assetCtx) {
        contextParts.push(assetCtx);
        sources.push(`Asset Record: ${pageContext.assetId}`);
        specificAssetHandled = true;
      }
    }

    // Check if user mentions an asset tag code like AST-1001 or AST-...
    const tagMatch = userMessage.match(/\b(AST-[A-Za-z0-9_-]+)\b/i);
    if (tagMatch && !specificAssetHandled) {
      const assetCtx = await this.getSpecificAssetContext(tagMatch[1]);
      if (assetCtx) {
        contextParts.push(assetCtx);
        sources.push(`Asset Tag: ${tagMatch[1]}`);
        specificAssetHandled = true;
      }
    }

    // 2. Overview / Inventory statistics
    const [
      totalAssetsCount,
      availableCount,
      assignedCount,
      maintenanceCount,
      damagedCount,
      lostCount,
      usersCount,
    ] = await Promise.all([
      prisma.asset.count(),
      prisma.asset.count({ where: { status: 'AVAILABLE' } }),
      prisma.asset.count({ where: { status: 'ASSIGNED' } }),
      prisma.asset.count({ where: { status: 'UNDER_MAINTENANCE' } }),
      prisma.asset.count({ where: { status: 'DAMAGED' } }),
      prisma.asset.count({ where: { status: 'LOST' } }),
      prisma.user.count(),
    ]);

    const categoriesRaw = await prisma.asset.groupBy({
      by: ['category'],
      _count: { id: true },
    });

    let overviewStr = `=== ORGANIZATIONAL ASSETFLOW OVERVIEW ===\n`;
    overviewStr += `Total Inventory: ${totalAssetsCount} assets\n`;
    overviewStr += `Status Breakdown: Available=${availableCount}, Assigned=${assignedCount}, Under Maintenance=${maintenanceCount}, Damaged=${damagedCount}, Lost=${lostCount}\n`;
    overviewStr += `Categories Breakdown: ${categoriesRaw.map((c) => `${c.category}: ${c._count.id}`).join(', ')}\n`;
    overviewStr += `Registered Users in Directory: ${usersCount} users\n`;
    contextParts.push(overviewStr);
    sources.push('Database: Portfolio Summary Aggregates');

    // 3. Health & High-Risk Assets query
    if (
      lower.includes('risk') ||
      lower.includes('health') ||
      lower.includes('condition') ||
      lower.includes('failing') ||
      lower.includes('score') ||
      lower.includes('predict') ||
      lower.includes('broken')
    ) {
      const sampleAssets = await prisma.asset.findMany({
        include: {
          maintenances: true,
          reports: true,
        },
        take: 50,
      });

      const calculated = sampleAssets.map((a) => this.calculateHealth(a));
      const highRisk = calculated.filter(
        (c) => c.riskLevel === 'HIGH' || c.riskLevel === 'CRITICAL' || c.healthScore < 60
      );

      let healthStr = `=== ASSET HEALTH & RISK TELEMETRY ===\n`;
      healthStr += `High-Risk Assets Count: ${highRisk.length} asset(s)\n`;
      if (highRisk.length > 0) {
        healthStr += `High-Risk Assets Details:\n`;
        highRisk.forEach((hr) => {
          healthStr += `• [${hr.assetTag}] ${hr.name} (${hr.category}) - Score: ${hr.healthScore}/100 [Risk: ${hr.riskLevel}] - Status: ${hr.status}\n`;
          healthStr += `   Primary Factors: ${hr.factors.join('; ')}\n`;
          healthStr += `   Recommended: ${hr.recommendations.join('; ')}\n`;
        });
      } else {
        healthStr += `No critical or high-risk assets currently detected in sample inventory.\n`;
      }
      contextParts.push(healthStr);
      sources.push('Analytics Engine: Asset Health Calculation');
    }

    // 4. Maintenance / Repairs query
    if (
      lower.includes('maintenance') ||
      lower.includes('repair') ||
      lower.includes('service') ||
      lower.includes('scheduled') ||
      lower.includes('technician') ||
      lower.includes('cost') ||
      pageContext?.page === 'maintenance'
    ) {
      const [activeMaintenances, underMaintAssets] = await Promise.all([
        prisma.maintenance.findMany({
          where: {
            status: { in: ['SCHEDULED', 'IN_PROGRESS'] },
          },
          include: {
            asset: { select: { assetTag: true, name: true, category: true } },
          },
          take: 15,
          orderBy: { scheduledDate: 'asc' },
        }),
        prisma.asset.findMany({
          where: { status: 'UNDER_MAINTENANCE' },
          select: { assetTag: true, name: true, category: true, location: true },
          take: 10,
        }),
      ]);

      let maintStr = `=== ACTIVE MAINTENANCE & SERVICING ===\n`;
      maintStr += `Assets Currently in Servicing: ${underMaintAssets.length}\n`;
      if (underMaintAssets.length > 0) {
        maintStr += underMaintAssets
          .map((a) => `• [${a.assetTag}] ${a.name} (${a.category}) at ${a.location || 'Depot'}`)
          .join('\n') + '\n';
      }

      maintStr += `Scheduled & In-Progress Work Orders (${activeMaintenances.length}):\n`;
      if (activeMaintenances.length > 0) {
        maintStr += activeMaintenances
          .map(
            (m) =>
              `• [${m.status}] ${m.title} for ${m.asset?.name} (${m.asset?.assetTag}) - Date: ${
                m.scheduledDate ? m.scheduledDate.toISOString().split('T')[0] : 'Unscheduled'
              } - Cost: $${Number(m.cost || 0)} - Tech: ${m.performedBy || 'Unassigned'}`
          )
          .join('\n') + '\n';
      } else {
        maintStr += `No active or scheduled work orders currently pending.\n`;
      }
      contextParts.push(maintStr);
      sources.push('Database: Maintenance Work Orders');
    }

    // 5. Assignments / Custody / User Loans query
    if (
      lower.includes('assign') ||
      lower.includes('who has') ||
      lower.includes('custody') ||
      lower.includes('borrow') ||
      lower.includes('loan') ||
      lower.includes('available') ||
      pageContext?.page === 'assignments'
    ) {
      const [activeLoans, availableSample] = await Promise.all([
        prisma.assetAssignment.findMany({
          where: { status: 'ACTIVE' },
          include: {
            asset: { select: { assetTag: true, name: true, category: true } },
            user: { select: { name: true, email: true, department: true } },
          },
          take: 15,
          orderBy: { assignedAt: 'desc' },
        }),
        prisma.asset.findMany({
          where: { status: 'AVAILABLE' },
          select: { assetTag: true, name: true, category: true, location: true },
          take: 10,
        }),
      ]);

      let loanStr = `=== ACTIVE CUSTODY & AVAILABLE INVENTORY ===\n`;
      loanStr += `Sample Active Assignments (${activeLoans.length}):\n`;
      if (activeLoans.length > 0) {
        loanStr += activeLoans
          .map(
            (l) =>
              `• ${l.asset?.name} (${l.asset?.assetTag}) -> Assigned to ${l.user?.name} (${l.user?.department || 'General'}) since ${l.assignedAt.toISOString().split('T')[0]}`
          )
          .join('\n') + '\n';
      }

      loanStr += `Available Units Ready for Checkout (${availableSample.length} shown):\n`;
      if (availableSample.length > 0) {
        loanStr += availableSample
          .map((a) => `• [${a.assetTag}] ${a.name} (${a.category}) - Loc: ${a.location || 'Central Depot'}`)
          .join('\n') + '\n';
      }
      contextParts.push(loanStr);
      sources.push('Database: Active Assignments & Custody');
    }

    // 6. Incident / Damage Reports query
    if (
      lower.includes('report') ||
      lower.includes('damage') ||
      lower.includes('lost') ||
      lower.includes('incident') ||
      lower.includes('issue') ||
      pageContext?.page === 'reports'
    ) {
      const openReports = await prisma.assetReport.findMany({
        where: {
          status: { in: ['PENDING', 'UNDER_REVIEW'] },
        },
        include: {
          asset: { select: { assetTag: true, name: true, category: true } },
          reporter: { select: { name: true, email: true } },
        },
        take: 10,
        orderBy: { createdAt: 'desc' },
      });

      let reportStr = `=== OPEN INCIDENT & DAMAGE REPORTS ===\n`;
      reportStr += `Unresolved Tickets Count: ${openReports.length}\n`;
      if (openReports.length > 0) {
        reportStr += openReports
          .map(
            (r) =>
              `• [${r.status} - ${r.type}] ${r.asset?.name} (${r.asset?.assetTag}): "${r.description}" (Filed by: ${r.reporter?.name || 'User'})`
          )
          .join('\n') + '\n';
      }
      contextParts.push(reportStr);
      sources.push('Database: Incident Reports');
    }

    // Combine context
    return {
      contextText: contextParts.join('\n\n'),
      sources: Array.from(new Set(sources)),
    };
  }
}

export const aiContextService = new AIContextService();
