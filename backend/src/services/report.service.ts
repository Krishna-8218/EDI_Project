import prisma from '../lib/prisma';
import { AppError } from '../middleware/error.middleware';
import { AuditService } from './audit.service';
import { AssetStatus, Prisma, ReportStatus, ReportType } from '@prisma/client';

export class ReportService {
  static async createReport(
    data: {
      assetId: string;
      type: ReportType;
      description: string;
    },
    reportedByUserId: string
  ) {
    const asset = await prisma.asset.findUnique({ where: { id: data.assetId } });
    if (!asset) {
      throw new AppError('Asset not found', 404);
    }

    const operations: Prisma.PrismaPromise<any>[] = [
      prisma.assetReport.create({
        data: {
          assetId: data.assetId,
          reportedBy: reportedByUserId,
          type: data.type,
          description: data.description,
          status: ReportStatus.PENDING,
        },
        include: {
          asset: true,
          reporter: {
            select: {
              id: true,
              name: true,
              email: true,
              department: true,
            },
          },
        },
      }),
    ];

    // Automatically update asset status if severe
    if (data.type === ReportType.DAMAGE) {
      operations.push(
        prisma.asset.update({
          where: { id: data.assetId },
          data: { status: AssetStatus.DAMAGED, condition: 'Damaged' },
        })
      );
    } else if (data.type === ReportType.LOSS) {
      operations.push(
        prisma.asset.update({
          where: { id: data.assetId },
          data: { status: AssetStatus.LOST },
        })
      );
    }

    const [report] = await prisma.$transaction(operations);

    await AuditService.log({
      userId: reportedByUserId,
      action: `REPORT_${data.type}`,
      entity: 'AssetReport',
      entityId: report.id,
      description: `Report filed for asset ${asset.name} (${asset.assetTag}): ${data.type} - ${data.description.substring(0, 50)}...`,
    });

    return report;
  }

  static async updateReport(
    id: string,
    data: {
      status?: ReportStatus;
      description?: string;
    },
    performedByUserId?: string
  ) {
    const existing = await prisma.assetReport.findUnique({
      where: { id },
      include: { asset: true },
    });

    if (!existing) {
      throw new AppError('Report not found', 404);
    }

    const updateData: Prisma.AssetReportUpdateInput = {
      ...(data.status && { status: data.status }),
      ...(data.description && { description: data.description }),
      ...(data.status === ReportStatus.RESOLVED && { resolvedAt: new Date() }),
    };

    const updated = await prisma.assetReport.update({
      where: { id },
      data: updateData,
      include: {
        asset: true,
        reporter: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    await AuditService.log({
      userId: performedByUserId,
      action: 'REPORT_UPDATED',
      entity: 'AssetReport',
      entityId: updated.id,
      description: `Report for asset ${existing.asset.name} updated to status ${updated.status}`,
    });

    return updated;
  }

  static async getReports(query: {
    page?: number;
    limit?: number;
    status?: ReportStatus;
    type?: ReportType;
    assetId?: string;
    reportedBy?: string;
  }) {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;

    const where: Prisma.AssetReportWhereInput = {};
    if (query.status) where.status = query.status;
    if (query.type) where.type = query.type;
    if (query.assetId) where.assetId = query.assetId;
    if (query.reportedBy) where.reportedBy = query.reportedBy;

    const [reports, total] = await Promise.all([
      prisma.assetReport.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          asset: true,
          reporter: {
            select: {
              id: true,
              name: true,
              email: true,
              department: true,
            },
          },
        },
      }),
      prisma.assetReport.count({ where }),
    ]);

    return {
      reports,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  static async getReportById(id: string) {
    const report = await prisma.assetReport.findUnique({
      where: { id },
      include: {
        asset: true,
        reporter: {
          select: {
            id: true,
            name: true,
            email: true,
            department: true,
            phone: true,
          },
        },
      },
    });

    if (!report) {
      throw new AppError('Report not found', 404);
    }

    return report;
  }
}
