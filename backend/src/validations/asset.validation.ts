import { z } from 'zod';
import { AssetStatus } from '@prisma/client';

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
    { message: 'Must be a valid date string (e.g. YYYY-MM-DD or ISO)' }
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

export const createAssetSchema = z.object({
  body: z.object({
    assetTag: z.string().min(2, 'Asset Tag is required'),
    name: z.string().min(2, 'Asset name is required'),
    category: z.string().min(1, 'Category is required'),
    description: optionalString,
    serialNumber: optionalString,
    manufacturer: optionalString,
    model: optionalString,
    purchaseDate: optionalDateString,
    purchasePrice: optionalNumber,
    warrantyExpiry: optionalDateString,
    status: z.nativeEnum(AssetStatus).optional().default(AssetStatus.AVAILABLE),
    location: optionalString,
    condition: optionalString,
  }),
});

export const updateAssetSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid asset ID format'),
  }),
  body: z.object({
    assetTag: z.string().min(2).optional(),
    name: z.string().min(2).optional(),
    category: z.string().optional(),
    description: optionalString,
    serialNumber: optionalString,
    manufacturer: optionalString,
    model: optionalString,
    purchaseDate: optionalDateString,
    purchasePrice: optionalNumber,
    warrantyExpiry: optionalDateString,
    status: z.nativeEnum(AssetStatus).optional(),
    location: optionalString,
    condition: optionalString,
  }),
});

export const getAssetsQuerySchema = z.object({
  query: z.object({
    page: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 1)),
    limit: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 10)),
    search: z.string().optional(),
    status: z.nativeEnum(AssetStatus).optional(),
    category: z.string().optional(),
    location: z.string().optional(),
    sortBy: z.string().optional().default('createdAt'),
    sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
  }),
});

export const assetIdParamSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid asset ID format'),
  }),
});
