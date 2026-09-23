import api from './client';
import { AssetReport, ReportStatus, ReportType } from '../types';

export interface CreateReportInput {
  assetId: string;
  type: ReportType;
  description: string;
}

export interface UpdateReportInput {
  status?: ReportStatus;
  description?: string;
}

export const reportsApi = {
  getAll: (params?: { page?: number; limit?: number; status?: ReportStatus; type?: ReportType; assetId?: string; reportedBy?: string }) =>
    api.get<AssetReport[]>('/reports', params),

  getById: (id: string) =>
    api.get<AssetReport>(`/reports/${id}`),

  create: (data: CreateReportInput) =>
    api.post<AssetReport>('/reports', data),

  update: (id: string, data: UpdateReportInput) =>
    api.put<AssetReport>(`/reports/${id}`, data),
};
