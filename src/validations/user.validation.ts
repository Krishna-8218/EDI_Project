import { z } from 'zod';
import { Role, UserStatus } from '@prisma/client';

const optionalString = z
  .string()
  .optional()
  .nullable()
  .transform((val) => (val && val.trim() !== '' ? val.trim() : undefined));

export const createUserSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    role: z.nativeEnum(Role).optional().default(Role.EMPLOYEE),
    department: optionalString,
    phone: optionalString,
    status: z.nativeEnum(UserStatus).optional().default(UserStatus.ACTIVE),
    rfidCardId: optionalString,
  }),
});

export const updateUserSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid user ID format'),
  }),
  body: z.object({
    name: z.string().min(2).optional(),
    email: z.string().email().optional(),
    password: z.string().min(6).optional(),
    role: z.nativeEnum(Role).optional(),
    department: optionalString,
    phone: optionalString,
    status: z.nativeEnum(UserStatus).optional(),
    rfidCardId: optionalString,
  }),
});

export const getUsersQuerySchema = z.object({
  query: z.object({
    page: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 1)),
    limit: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 10)),
    search: z.string().optional(),
    role: z.nativeEnum(Role).optional(),
    department: z.string().optional(),
    status: z.nativeEnum(UserStatus).optional(),
  }),
});
