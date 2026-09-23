import { z } from 'zod';
import { ReportStatus, ReportType } from '@prisma/client';

export const createReportSchema = z.object({
  body: z.object({
    assetId: z.string().uuid('Valid asset ID required'),
    type: z.nativeEnum(ReportType),
    description: z.string().min(5, 'Description must be at least 5 characters'),
  }),
});

export const updateReportSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid report ID format'),
  }),
  body: z.object({
    status: z.nativeEnum(ReportStatus).optional(),
    description: z.string().min(5).optional(),
  }),
});

export const getReportsQuerySchema = z.object({
  query: z.object({
    page: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 1)),
    limit: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 10)),
    status: z.nativeEnum(ReportStatus).optional(),
    type: z.nativeEnum(ReportType).optional(),
    assetId: z.string().uuid().optional(),
    reportedBy: z.string().uuid().optional(),
  }),
});
