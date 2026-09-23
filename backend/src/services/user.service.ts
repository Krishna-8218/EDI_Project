import bcrypt from 'bcryptjs';
import prisma from '../lib/prisma';
import { AppError } from '../middleware/error.middleware';
import { AuditService } from './audit.service';
import { Prisma, Role, UserStatus } from '@prisma/client';

export class UserService {
  static async createUser(
    data: {
      name: string;
      email: string;
      password: string;
      role?: Role;
      department?: string;
      phone?: string;
      status?: UserStatus;
      rfidCardId?: string;
    },
    performedByUserId?: string
  ) {
    const existing = await prisma.user.findUnique({
      where: { email: data.email.toLowerCase() },
    });

    if (existing) {
      throw new AppError('User with this email already exists', 409);
    }

    if (data.rfidCardId) {
      const existingRfid = await prisma.user.findUnique({
        where: { rfidCardId: data.rfidCardId },
      });
      if (existingRfid) {
        throw new AppError(`RFID card '${data.rfidCardId}' is already assigned to another user`, 409);
      }
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(data.password, salt);

    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email.toLowerCase(),
        password: hashedPassword,
        role: data.role || Role.EMPLOYEE,
        department: data.department || null,
        phone: data.phone || null,
        status: data.status || UserStatus.ACTIVE,
        rfidCardId: data.rfidCardId || null,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        department: true,
        phone: true,
        status: true,
        rfidCardId: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    await AuditService.log({
      userId: performedByUserId,
      action: 'USER_CREATED',
      entity: 'User',
      entityId: user.id,
      description: `Created user ${user.name} (${user.email}) with role ${user.role}`,
    });

    return user;
  }

  static async getUsers(query: {
    page?: number;
    limit?: number;
    search?: string;
    role?: Role;
    department?: string;
    status?: UserStatus;
  }) {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;

    const where: Prisma.UserWhereInput = {};

    if (query.role) where.role = query.role;
    if (query.department) where.department = { equals: query.department, mode: 'insensitive' };
    if (query.status) where.status = query.status;

    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { email: { contains: query.search, mode: 'insensitive' } },
        { department: { contains: query.search, mode: 'insensitive' } },
        { phone: { contains: query.search, mode: 'insensitive' } },
        { rfidCardId: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          department: true,
          phone: true,
          status: true,
          rfidCardId: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: {
              assignments: true,
              reports: true,
            },
          },
        },
      }),
      prisma.user.count({ where }),
    ]);

    return {
      users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  static async getUserById(id: string) {
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        department: true,
        phone: true,
        status: true,
        rfidCardId: true,
        createdAt: true,
        updatedAt: true,
        assignments: {
          orderBy: { assignedAt: 'desc' },
          include: {
            asset: true,
          },
        },
        reports: {
          orderBy: { createdAt: 'desc' },
          include: {
            asset: true,
          },
        },
      },
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    return user;
  }

  static async updateUser(
    id: string,
    data: {
      name?: string;
      email?: string;
      password?: string;
      role?: Role;
      department?: string | null;
      phone?: string | null;
      status?: UserStatus;
      rfidCardId?: string | null;
    },
    performedByUserId?: string
  ) {
    const existing = await prisma.user.findUnique({ where: { id } });
    if (!existing) {
      throw new AppError('User not found', 404);
    }

    if (data.email && data.email.toLowerCase() !== existing.email) {
      const duplicateEmail = await prisma.user.findUnique({
        where: { email: data.email.toLowerCase() },
      });
      if (duplicateEmail) {
        throw new AppError('Email address is already in use', 409);
      }
    }

    if (data.rfidCardId && data.rfidCardId !== existing.rfidCardId) {
      const duplicateRfid = await prisma.user.findUnique({
        where: { rfidCardId: data.rfidCardId },
      });
      if (duplicateRfid) {
        throw new AppError('RFID card ID is already assigned to another user', 409);
      }
    }

    let hashedPassword = undefined;
    if (data.password) {
      const salt = await bcrypt.genSalt(10);
      hashedPassword = await bcrypt.hash(data.password, salt);
    }

    const updated = await prisma.user.update({
      where: { id },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.email && { email: data.email.toLowerCase() }),
        ...(hashedPassword && { password: hashedPassword }),
        ...(data.role && { role: data.role }),
        ...(data.department !== undefined && { department: data.department }),
        ...(data.phone !== undefined && { phone: data.phone }),
        ...(data.status && { status: data.status }),
        ...(data.rfidCardId !== undefined && { rfidCardId: data.rfidCardId }),
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        department: true,
        phone: true,
        status: true,
        rfidCardId: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    await AuditService.log({
      userId: performedByUserId,
      action: 'USER_UPDATED',
      entity: 'User',
      entityId: updated.id,
      description: `Updated user profile for ${updated.name} (${updated.email})`,
    });

    return updated;
  }

  static async deleteUser(id: string, performedByUserId?: string) {
    const existing = await prisma.user.findUnique({
      where: { id },
      include: {
        assignments: { where: { status: 'ACTIVE' } },
      },
    });

    if (!existing) {
      throw new AppError('User not found', 404);
    }

    if (existing.assignments.length > 0) {
      throw new AppError(
        'Cannot delete user who currently has active asset assignments. Please return all assets first.',
        400
      );
    }

    await prisma.user.delete({ where: { id } });

    await AuditService.log({
      userId: performedByUserId,
      action: 'USER_DELETED',
      entity: 'User',
      entityId: id,
      description: `Deleted user ${existing.name} (${existing.email})`,
    });

    return { id, message: 'User deleted successfully' };
  }
}
