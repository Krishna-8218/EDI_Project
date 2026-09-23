import { z } from 'zod';
import { AssignmentStatus } from '@prisma/client';

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

export const createAssignmentSchema = z.object({
  body: z.object({
    assetId: z.string().uuid('Valid asset ID required'),
    userId: z.string().uuid('Valid user ID required'),
    notes: optionalString,
    assignedAt: optionalDateString,
  }),
});

export const returnAssignmentSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid assignment ID format'),
  }),
  body: z.object({
    notes: optionalString,
    returnedAt: optionalDateString,
  }).optional(),
});

export const getAssignmentsQuerySchema = z.object({
  query: z.object({
    page: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 1)),
    limit: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 10)),
    status: z.nativeEnum(AssignmentStatus).optional(),
    assetId: z.string().uuid().optional(),
    userId: z.string().uuid().optional(),
  }),
});
