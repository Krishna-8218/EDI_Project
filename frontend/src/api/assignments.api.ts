import api from './client';
import { AssetAssignment, AssignmentStatus } from '../types';

export interface AssignAssetInput {
  assetId: string;
  userId: string;
  notes?: string;
  assignedAt?: string;
}

export interface ReturnAssetInput {
  notes?: string;
  returnedAt?: string;
}

export const assignmentsApi = {
  getAll: (params?: { page?: number; limit?: number; status?: AssignmentStatus; assetId?: string; userId?: string }) =>
    api.get<AssetAssignment[]>('/assignments', params),

  getById: (id: string) =>
    api.get<AssetAssignment>(`/assignments/${id}`),

  assign: (data: AssignAssetInput) =>
    api.post<AssetAssignment>('/assignments', data),

  returnAsset: (id: string, data?: ReturnAssetInput) =>
    api.put<AssetAssignment>(`/assignments/${id}/return`, data),
};
