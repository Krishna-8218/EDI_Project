import bcrypt from 'bcryptjs';
import prisma from '../lib/prisma';
import { signToken } from '../utils/jwt';
import { AppError } from '../middleware/error.middleware';
import { AuditService } from './audit.service';
import { Role } from '@prisma/client';

export class AuthService {
  static async register(data: {
    name: string;
    email: string;
    password: string;
    role?: Role;
    department?: string;
    phone?: string;
    rfidCardId?: string;
  }) {
    const existing = await prisma.user.findUnique({
      where: { email: data.email.toLowerCase() },
    });

    if (existing) {
      throw new AppError('User with this email already exists', 409);
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
      },
    });

    const token = signToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    await AuditService.log({
      userId: user.id,
      action: 'USER_REGISTERED',
      entity: 'User',
      entityId: user.id,
      description: `New user account registered: ${user.name} (${user.email}) as ${user.role}`,
    });

    return { user, token };
  }

  static async login(data: { email: string; password: string }) {
    const user = await prisma.user.findUnique({
      where: { email: data.email.toLowerCase() },
    });

    if (!user) {
      throw new AppError('Invalid email or password credentials', 401);
    }

    if (user.status === 'INACTIVE') {
      throw new AppError('This user account has been deactivated', 403);
    }

    const isMatch = await bcrypt.compare(data.password, user.password);
    if (!isMatch) {
      throw new AppError('Invalid email or password credentials', 401);
    }

    const token = signToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    const sanitizedUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department,
      phone: user.phone,
      status: user.status,
      rfidCardId: user.rfidCardId,
      createdAt: user.createdAt,
    };

    await AuditService.log({
      userId: user.id,
      action: 'USER_LOGIN',
      entity: 'User',
      entityId: user.id,
      description: `User ${user.email} logged in successfully`,
    });

    return { user: sanitizedUser, token };
  }

  static async getMe(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
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
        assignments: {
          where: { status: 'ACTIVE' },
          include: {
            asset: true,
          },
        },
      },
    });

    if (!user) {
      throw new AppError('User profile not found', 404);
    }

    return user;
  }
}
