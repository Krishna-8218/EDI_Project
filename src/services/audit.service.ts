import prisma from '../lib/prisma';

export interface CreateAuditLogParams {
  userId?: string | null;
  action: string;
  entity: string;
  entityId?: string | null;
  description: string;
}

export class AuditService {
  static async log(params: CreateAuditLogParams) {
    try {
      return await prisma.auditLog.create({
        data: {
          userId: params.userId || null,
          action: params.action,
          entity: params.entity,
          entityId: params.entityId || null,
          description: params.description,
        },
      });
    } catch (error) {
      console.error('⚠️ Failed to write audit log:', error);
      // Audit log failures should not block critical operations
      return null;
    }
  }

  static async getLogs(query: { page?: number; limit?: number; entity?: string; action?: string }) {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (query.entity) where.entity = query.entity;
    if (query.action) where.action = { contains: query.action, mode: 'insensitive' };

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        skip,
        take: limit,
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
      }),
      prisma.auditLog.count({ where }),
    ]);

    return {
      logs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
