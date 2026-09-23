import prisma from '../lib/prisma';
import { AppError } from '../middleware/error.middleware';
import { AuditService } from './audit.service';
import { AssetStatus, Prisma } from '@prisma/client';

export class AssetService {
  static async createAsset(
    data: {
      assetTag: string;
      name: string;
      category: string;
      description?: string;
      serialNumber?: string;
      manufacturer?: string;
      model?: string;
      purchaseDate?: string;
      purchasePrice?: number;
      warrantyExpiry?: string;
      status?: AssetStatus;
      location?: string;
      condition?: string;
    },
    performedByUserId?: string
  ) {
    const existing = await prisma.asset.findUnique({
      where: { assetTag: data.assetTag },
    });

    if (existing) {
      throw new AppError(`Asset with tag '${data.assetTag}' already exists`, 409);
    }

    if (data.serialNumber) {
      const existingSerial = await prisma.asset.findUnique({
        where: { serialNumber: data.serialNumber },
      });
      if (existingSerial) {
        throw new AppError(`Asset with serial number '${data.serialNumber}' already exists`, 409);
      }
    }

    const asset = await prisma.asset.create({
      data: {
        assetTag: data.assetTag,
        name: data.name,
        category: data.category,
        description: data.description || null,
        serialNumber: data.serialNumber || null,
        manufacturer: data.manufacturer || null,
        model: data.model || null,
        purchaseDate: data.purchaseDate ? new Date(data.purchaseDate) : null,
        purchasePrice: data.purchasePrice !== undefined ? new Prisma.Decimal(data.purchasePrice) : null,
        warrantyExpiry: data.warrantyExpiry ? new Date(data.warrantyExpiry) : null,
        status: data.status || AssetStatus.AVAILABLE,
        location: data.location || null,
        condition: data.condition || 'Good',
      },
    });

    await AuditService.log({
      userId: performedByUserId,
      action: 'ASSET_CREATED',
      entity: 'Asset',
      entityId: asset.id,
      description: `Created asset ${asset.name} (${asset.assetTag}) in category ${asset.category}`,
    });

    return asset;
  }

  static async getAssets(query: {
    page?: number;
    limit?: number;
    search?: string;
    status?: AssetStatus;
    category?: string;
    location?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }) {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;

    const where: Prisma.AssetWhereInput = {};

    if (query.status) {
      where.status = query.status;
    }

    if (query.category) {
      where.category = { equals: query.category, mode: 'insensitive' };
    }

    if (query.location) {
      where.location = { contains: query.location, mode: 'insensitive' };
    }

    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { assetTag: { contains: query.search, mode: 'insensitive' } },
        { serialNumber: { contains: query.search, mode: 'insensitive' } },
        { manufacturer: { contains: query.search, mode: 'insensitive' } },
        { model: { contains: query.search, mode: 'insensitive' } },
        { category: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const orderBy: Prisma.AssetOrderByWithRelationInput = {};
    const validSortFields = ['createdAt', 'name', 'assetTag', 'purchaseDate', 'purchasePrice', 'status'];
    const sortField = validSortFields.includes(query.sortBy || '') ? (query.sortBy as string) : 'createdAt';
    (orderBy as any)[sortField] = query.sortOrder || 'desc';

    const [assets, total] = await Promise.all([
      prisma.asset.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          assignments: {
            where: { status: 'ACTIVE' },
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  department: true,
                },
              },
            },
          },
          _count: {
            select: {
              assignments: true,
              maintenances: true,
              reports: true,
            },
          },
        },
      }),
      prisma.asset.count({ where }),
    ]);

    return {
      assets,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  static async getAssetById(id: string) {
    const asset = await prisma.asset.findUnique({
      where: { id },
      include: {
        assignments: {
          orderBy: { assignedAt: 'desc' },
          include: {
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
        },
        maintenances: {
          orderBy: { createdAt: 'desc' },
        },
        reports: {
          orderBy: { createdAt: 'desc' },
          include: {
            reporter: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    if (!asset) {
      throw new AppError('Asset not found', 404);
    }

    return asset;
  }

  static async updateAsset(
    id: string,
    data: {
      assetTag?: string;
      name?: string;
      category?: string;
      description?: string | null;
      serialNumber?: string | null;
      manufacturer?: string | null;
      model?: string | null;
      purchaseDate?: string | null;
      purchasePrice?: number | null;
      warrantyExpiry?: string | null;
      status?: AssetStatus;
      location?: string | null;
      condition?: string | null;
    },
    performedByUserId?: string
  ) {
    const existing = await prisma.asset.findUnique({ where: { id } });
    if (!existing) {
      throw new AppError('Asset not found', 404);
    }

    if (data.assetTag && data.assetTag !== existing.assetTag) {
      const duplicateTag = await prisma.asset.findUnique({ where: { assetTag: data.assetTag } });
      if (duplicateTag) {
        throw new AppError(`Asset tag '${data.assetTag}' is already taken`, 409);
      }
    }

    if (data.serialNumber && data.serialNumber !== existing.serialNumber) {
      const duplicateSerial = await prisma.asset.findUnique({ where: { serialNumber: data.serialNumber } });
      if (duplicateSerial) {
        throw new AppError(`Serial number '${data.serialNumber}' is already in use`, 409);
      }
    }

    const updatePayload: Prisma.AssetUpdateInput = {
      ...(data.assetTag && { assetTag: data.assetTag }),
      ...(data.name && { name: data.name }),
      ...(data.category && { category: data.category }),
      ...(data.description !== undefined && { description: data.description }),
      ...(data.serialNumber !== undefined && { serialNumber: data.serialNumber }),
      ...(data.manufacturer !== undefined && { manufacturer: data.manufacturer }),
      ...(data.model !== undefined && { model: data.model }),
      ...(data.purchaseDate !== undefined && {
        purchaseDate: data.purchaseDate ? new Date(data.purchaseDate) : null,
      }),
      ...(data.purchasePrice !== undefined && {
        purchasePrice: data.purchasePrice !== null ? new Prisma.Decimal(data.purchasePrice) : null,
      }),
      ...(data.warrantyExpiry !== undefined && {
        warrantyExpiry: data.warrantyExpiry ? new Date(data.warrantyExpiry) : null,
      }),
      ...(data.status && { status: data.status }),
      ...(data.location !== undefined && { location: data.location }),
      ...(data.condition !== undefined && { condition: data.condition }),
    };

    const updated = await prisma.asset.update({
      where: { id },
      data: updatePayload,
    });

    await AuditService.log({
      userId: performedByUserId,
      action: 'ASSET_UPDATED',
      entity: 'Asset',
      entityId: updated.id,
      description: `Updated asset ${updated.name} (${updated.assetTag})`,
    });

    return updated;
  }

  static async deleteAsset(id: string, performedByUserId?: string) {
    const existing = await prisma.asset.findUnique({
      where: { id },
      include: {
        assignments: { where: { status: 'ACTIVE' } },
      },
    });

    if (!existing) {
      throw new AppError('Asset not found', 404);
    }

    if (existing.assignments.length > 0) {
      throw new AppError(
        'Cannot delete an asset that is currently assigned. Please return the asset first.',
        400
      );
    }

    await prisma.asset.delete({ where: { id } });

    await AuditService.log({
      userId: performedByUserId,
      action: 'ASSET_DELETED',
      entity: 'Asset',
      entityId: id,
      description: `Deleted asset ${existing.name} (${existing.assetTag})`,
    });

    return { id, message: 'Asset deleted successfully' };
  }
}
