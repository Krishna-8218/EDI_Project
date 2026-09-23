import { z } from 'zod';
import { MaintenanceStatus, MaintenanceType } from '@prisma/client';

const optionalString = z
  .string()
  .optional()
  .nullable()
  .transform((val) => (val && val.trim() !== '' ? val.trim() : undefined));

const optionalDateString = z
  .string()
  .optional()
  .nullable()
  .transform((val) => (val && val.trim() !== '' ? val.trim() : undefined))
  .refine(
    (val) => {
      if (!val) return true;
      return !isNaN(Date.parse(val));
    },
    { message: 'Must be a valid date string' }
  );

const optionalNumber = z
  .union([z.number(), z.string()])
  .optional()
  .nullable()
  .transform((val) => {
    if (val === undefined || val === null || val === '') return undefined;
    const num = Number(val);
    return isNaN(num) ? undefined : num;
  });

export const createMaintenanceSchema = z.object({
  body: z.object({
    assetId: z.string().uuid('Valid asset ID required'),
    title: z.string().min(2, 'Maintenance title required'),
    description: optionalString,
    maintenanceType: z.nativeEnum(MaintenanceType).optional().default(MaintenanceType.ROUTINE),
    scheduledDate: optionalDateString,
    cost: optionalNumber,
    performedBy: optionalString,
  }),
});

export const updateMaintenanceSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid maintenance ID format'),
  }),
  body: z.object({
    title: z.string().min(2).optional(),
    description: optionalString,
    maintenanceType: z.nativeEnum(MaintenanceType).optional(),
    scheduledDate: optionalDateString,
    completedDate: optionalDateString,
    cost: optionalNumber,
    status: z.nativeEnum(MaintenanceStatus).optional(),
    performedBy: optionalString,
  }),
});

export const getMaintenanceQuerySchema = z.object({
  query: z.object({
    page: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 1)),
    limit: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 10)),
    status: z.nativeEnum(MaintenanceStatus).optional(),
    maintenanceType: z.nativeEnum(MaintenanceType).optional(),
    assetId: z.string().uuid().optional(),
  }),
});
