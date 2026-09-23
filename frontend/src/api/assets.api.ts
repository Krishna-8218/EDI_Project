import api from './client';
import { Asset, AssetStatus } from '../types';

export interface GetAssetsParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: AssetStatus;
  category?: string;
  location?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface CreateAssetInput {
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
}

export interface UpdateAssetInput extends Partial<CreateAssetInput> {}

export const assetsApi = {
  getAll: (params?: GetAssetsParams) =>
    api.get<Asset[]>('/assets', params),

  getById: (id: string) =>
    api.get<Asset>(`/assets/${id}`),

  create: (data: CreateAssetInput) =>
    api.post<Asset>('/assets', data),

  update: (id: string, data: UpdateAssetInput) =>
    api.put<Asset>(`/assets/${id}`, data),

  delete: (id: string) =>
    api.delete<{ id: string; message: string }>(`/assets/${id}`),
};
