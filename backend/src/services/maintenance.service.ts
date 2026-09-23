import prisma from '../lib/prisma';
import { AppError } from '../middleware/error.middleware';
import { AuditService } from './audit.service';
import { AssetStatus, MaintenanceStatus, MaintenanceType, Prisma } from '@prisma/client';

export class MaintenanceService {
  static async createMaintenance(
    data: {
      assetId: string;
      title: string;
      description?: string;
      maintenanceType?: MaintenanceType;
      scheduledDate?: string;
      cost?: number;
      performedBy?: string;
    },
    performedByUserId?: string
  ) {
    const asset = await prisma.asset.findUnique({ where: { id: data.assetId } });
    if (!asset) {
      throw new AppError('Asset not found', 404);
    }

    const [maintenance] = await prisma.$transaction([
      prisma.maintenance.create({
        data: {
          assetId: data.assetId,
          title: data.title,
          description: data.description || null,
          maintenanceType: data.maintenanceType || MaintenanceType.ROUTINE,
          scheduledDate: data.scheduledDate ? new Date(data.scheduledDate) : new Date(),
          cost: data.cost !== undefined ? new Prisma.Decimal(data.cost) : null,
          status: MaintenanceStatus.SCHEDULED,
          performedBy: data.performedBy || null,
        },
        include: {
          asset: true,
        },
      }),
      prisma.asset.update({
        where: { id: data.assetId },
        data: { status: AssetStatus.UNDER_MAINTENANCE },
      }),
    ]);

    await AuditService.log({
      userId: performedByUserId,
      action: 'MAINTENANCE_CREATED',
      entity: 'Maintenance',
      entityId: maintenance.id,
      description: `Scheduled maintenance '${maintenance.title}' for asset ${asset.name} (${asset.assetTag})`,
    });

    return maintenance;
  }

  static async updateMaintenance(
    id: string,
    data: {
      title?: string;
      description?: string | null;
      maintenanceType?: MaintenanceType;
      scheduledDate?: string | null;
      completedDate?: string | null;
      cost?: number | null;
      status?: MaintenanceStatus;
      performedBy?: string | null;
    },
    performedByUserId?: string
  ) {
    const existing = await prisma.maintenance.findUnique({
      where: { id },
      include: { asset: true },
    });

    if (!existing) {
      throw new AppError('Maintenance record not found', 404);
    }

    const updatePayload: Prisma.MaintenanceUpdateInput = {
      ...(data.title && { title: data.title }),
      ...(data.description !== undefined && { description: data.description }),
      ...(data.maintenanceType && { maintenanceType: data.maintenanceType }),
      ...(data.scheduledDate !== undefined && {
        scheduledDate: data.scheduledDate ? new Date(data.scheduledDate) : null,
      }),
      ...(data.completedDate !== undefined && {
        completedDate: data.completedDate ? new Date(data.completedDate) : null,
      }),
      ...(data.cost !== undefined && {
        cost: data.cost !== null ? new Prisma.Decimal(data.cost) : null,
      }),
      ...(data.status && { status: data.status }),
      ...(data.performedBy !== undefined && { performedBy: data.performedBy }),
    };

    // If status changes to COMPLETED, auto set completedDate and restore asset to AVAILABLE
    if (data.status === MaintenanceStatus.COMPLETED && !data.completedDate) {
      updatePayload.completedDate = new Date();
    }

    const operations: Prisma.PrismaPromise<any>[] = [
      prisma.maintenance.update({
        where: { id },
        data: updatePayload,
        include: { asset: true },
      }),
    ];

    if (data.status === MaintenanceStatus.COMPLETED) {
      operations.push(
        prisma.asset.update({
          where: { id: existing.assetId },
          data: { status: AssetStatus.AVAILABLE },
        })
      );
    }

    const [updated] = await prisma.$transaction(operations);

    await AuditService.log({
      userId: performedByUserId,
      action: 'MAINTENANCE_UPDATED',
      entity: 'Maintenance',
      entityId: updated.id,
      description: `Updated maintenance '${updated.title}' to status ${updated.status}`,
    });

    return updated;
  }

  static async getMaintenanceList(query: {
    page?: number;
    limit?: number;
    status?: MaintenanceStatus;
    maintenanceType?: MaintenanceType;
    assetId?: string;
  }) {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;

    const where: Prisma.MaintenanceWhereInput = {};
    if (query.status) where.status = query.status;
    if (query.maintenanceType) where.maintenanceType = query.maintenanceType;
    if (query.assetId) where.assetId = query.assetId;

    const [records, total] = await Promise.all([
      prisma.maintenance.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { asset: true },
      }),
      prisma.maintenance.count({ where }),
    ]);

    return {
      records,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  static async getMaintenanceById(id: string) {
    const record = await prisma.maintenance.findUnique({
      where: { id },
      include: { asset: true },
    });

    if (!record) {
      throw new AppError('Maintenance record not found', 404);
    }

    return record;
  }

  static async deleteMaintenance(id: string, performedByUserId?: string) {
    const existing = await prisma.maintenance.findUnique({ where: { id } });
    if (!existing) {
      throw new AppError('Maintenance record not found', 404);
    }

    await prisma.maintenance.delete({ where: { id } });

    await AuditService.log({
      userId: performedByUserId,
      action: 'MAINTENANCE_DELETED',
      entity: 'Maintenance',
      entityId: id,
      description: `Deleted maintenance record ${existing.title}`,
    });

    return { id, message: 'Maintenance record deleted successfully' };
  }
}
