import prisma from '../lib/prisma';
import { AssetStatus, AssignmentStatus, MaintenanceStatus, ReportStatus } from '@prisma/client';

export class DashboardService {
  static async getStats() {
    const totalAssets = await prisma.asset.count();
    const totalUsers = await prisma.user.count();
    const activeAssignments = await prisma.assetAssignment.count({ where: { status: AssignmentStatus.ACTIVE } });
    const pendingReports = await prisma.assetReport.count({ where: { status: ReportStatus.PENDING } });
    const totalMaintenances = await prisma.maintenance.count();
    const activeMaintenances = await prisma.maintenance.count({
      where: {
        status: { in: [MaintenanceStatus.SCHEDULED, MaintenanceStatus.IN_PROGRESS] },
      },
    });
    const categoryGroups = await prisma.asset.groupBy({
      by: ['category'],
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
    });
    const statusGroups = await prisma.asset.groupBy({
      by: ['status'],
      _count: { id: true },
    });
    const locationGroups = await prisma.asset.groupBy({
      by: ['location'],
      _count: { id: true },
      where: { location: { not: null } },
      take: 10,
      orderBy: { _count: { id: 'desc' } },
    });
    const maintenanceCosts = await prisma.maintenance.aggregate({
      _sum: { cost: true },
      _avg: { cost: true },
      where: { cost: { not: null } },
    });
    const recentAuditLogs = await prisma.auditLog.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
    });

    const statusCountMap: Record<string, number> = {};
    for (const sg of statusGroups) {
      statusCountMap[sg.status] = sg._count.id;
    }

    const availableAssets = statusCountMap[AssetStatus.AVAILABLE] || 0;
    const assignedAssets = statusCountMap[AssetStatus.ASSIGNED] || 0;
    const maintenanceAssets = statusCountMap[AssetStatus.UNDER_MAINTENANCE] || 0;
    const damagedAssets = statusCountMap[AssetStatus.DAMAGED] || 0;
    const lostAssets = statusCountMap[AssetStatus.LOST] || 0;
    const retiredAssets = statusCountMap[AssetStatus.RETIRED] || 0;

    return {
      summary: {
        totalAssets,
        availableAssets,
        assignedAssets,
        maintenanceAssets,
        damagedAssets,
        lostAssets,
        retiredAssets,
        totalUsers,
        activeAssignments,
        pendingReports,
        totalMaintenances,
        activeMaintenances,
        totalMaintenanceCost: maintenanceCosts._sum.cost || 0,
        avgMaintenanceCost: maintenanceCosts._avg.cost || 0,
      },
      charts: {
        assetsByCategory: categoryGroups.map((g) => ({
          category: g.category,
          count: g._count.id,
        })),
        assetsByStatus: statusGroups.map((g) => ({
          status: g.status,
          count: g._count.id,
        })),
        assetsByLocation: locationGroups.map((g) => ({
          location: g.location || 'Unassigned',
          count: g._count.id,
        })),
      },
      recentActivities: recentAuditLogs,
    };
  }
}
