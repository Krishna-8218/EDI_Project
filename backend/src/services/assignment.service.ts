import prisma from '../lib/prisma';
import { AppError } from '../middleware/error.middleware';
import { AuditService } from './audit.service';
import { AssetStatus, AssignmentStatus, Prisma } from '@prisma/client';

export class AssignmentService {
  static async assignAsset(
    data: {
      assetId: string;
      userId: string;
      notes?: string;
      assignedAt?: string;
    },
    performedByUserId?: string
  ) {
    const [asset, user] = await Promise.all([
      prisma.asset.findUnique({ where: { id: data.assetId } }),
      prisma.user.findUnique({ where: { id: data.userId } }),
    ]);

    if (!asset) {
      throw new AppError('Asset not found', 404);
    }

    if (!user) {
      throw new AppError('User not found', 404);
    }

    if (user.status === 'INACTIVE') {
      throw new AppError('Cannot assign asset to an inactive user account', 400);
    }

    // Check availability
    if (asset.status === AssetStatus.ASSIGNED) {
      throw new AppError('Asset is already assigned to another user', 400);
    }

    if (asset.status === AssetStatus.UNDER_MAINTENANCE) {
      throw new AppError('Asset is currently under maintenance and cannot be assigned', 400);
    }

    if (
      asset.status === AssetStatus.DAMAGED ||
      asset.status === AssetStatus.LOST ||
      asset.status === AssetStatus.RETIRED
    ) {
      throw new AppError(`Asset status is ${asset.status}. It cannot be assigned.`, 400);
    }

    // Execute atomic transaction: update asset status first, then create assignment
    const [, assignment] = await prisma.$transaction([
      prisma.asset.update({
        where: { id: data.assetId },
        data: { status: AssetStatus.ASSIGNED },
      }),
      prisma.assetAssignment.create({
        data: {
          assetId: data.assetId,
          userId: data.userId,
          notes: data.notes || null,
          assignedAt: data.assignedAt ? new Date(data.assignedAt) : new Date(),
          status: AssignmentStatus.ACTIVE,
        },
        include: {
          asset: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              department: true,
            },
          },
        },
      }),
    ]);

    await AuditService.log({
      userId: performedByUserId,
      action: 'ASSET_ASSIGNED',
      entity: 'AssetAssignment',
      entityId: assignment.id,
      description: `Asset ${asset.name} (${asset.assetTag}) assigned to ${user.name} (${user.email})`,
    });

    return assignment;
  }

  static async returnAsset(
    id: string,
    data?: {
      notes?: string;
      returnedAt?: string;
    },
    performedByUserId?: string
  ) {
    const assignment = await prisma.assetAssignment.findUnique({
      where: { id },
      include: {
        asset: true,
        user: true,
      },
    });

    if (!assignment) {
      throw new AppError('Assignment record not found', 404);
    }

    if (assignment.status === AssignmentStatus.RETURNED) {
      throw new AppError('This asset has already been returned', 400);
    }

    const returnTimestamp = data?.returnedAt ? new Date(data.returnedAt) : new Date();

    const [, updatedAssignment] = await prisma.$transaction([
      prisma.asset.update({
        where: { id: assignment.assetId },
        data: { status: AssetStatus.AVAILABLE },
      }),
      prisma.assetAssignment.update({
        where: { id },
        data: {
          status: AssignmentStatus.RETURNED,
          returnedAt: returnTimestamp,
          notes: data?.notes
            ? `${assignment.notes || ''} [Return Note: ${data.notes}]`.trim()
            : assignment.notes,
        },
        include: {
          asset: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              department: true,
            },
          },
        },
      }),
    ]);

    await AuditService.log({
      userId: performedByUserId,
      action: 'ASSET_RETURNED',
      entity: 'AssetAssignment',
      entityId: assignment.id,
      description: `Asset ${assignment.asset.name} returned by ${assignment.user.name}`,
    });

    return updatedAssignment;
  }

  static async getAssignments(query: {
    page?: number;
    limit?: number;
    status?: AssignmentStatus;
    assetId?: string;
    userId?: string;
  }) {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;

    const where: Prisma.AssetAssignmentWhereInput = {};
    if (query.status) where.status = query.status;
    if (query.assetId) where.assetId = query.assetId;
    if (query.userId) where.userId = query.userId;

    const [assignments, total] = await Promise.all([
      prisma.assetAssignment.findMany({
        where,
        skip,
        take: limit,
        orderBy: { assignedAt: 'desc' },
        include: {
          asset: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              department: true,
            },
          },
        },
      }),
      prisma.assetAssignment.count({ where }),
    ]);

    return {
      assignments,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  static async getAssignmentById(id: string) {
    const assignment = await prisma.assetAssignment.findUnique({
      where: { id },
      include: {
        asset: true,
        user: {
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

    if (!assignment) {
      throw new AppError('Assignment record not found', 404);
    }

    return assignment;
  }
}
