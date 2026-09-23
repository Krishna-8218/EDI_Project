import api from './client';
import { Maintenance, MaintenanceStatus, MaintenanceType } from '../types';

export interface CreateMaintenanceInput {
  assetId: string;
  title: string;
  description?: string;
  maintenanceType?: MaintenanceType;
  scheduledDate?: string;
  cost?: number;
  performedBy?: string;
}

export interface UpdateMaintenanceInput {
  title?: string;
  description?: string | null;
  maintenanceType?: MaintenanceType;
  scheduledDate?: string | null;
  completedDate?: string | null;
  cost?: number | null;
  status?: MaintenanceStatus;
  performedBy?: string | null;
}

export const maintenanceApi = {
  getAll: (params?: { page?: number; limit?: number; status?: MaintenanceStatus; maintenanceType?: MaintenanceType; assetId?: string }) =>
    api.get<Maintenance[]>('/maintenance', params),

  getById: (id: string) =>
    api.get<Maintenance>(`/maintenance/${id}`),

  create: (data: CreateMaintenanceInput) =>
    api.post<Maintenance>('/maintenance', data),

  update: (id: string, data: UpdateMaintenanceInput) =>
    api.put<Maintenance>(`/maintenance/${id}`, data),

  delete: (id: string) =>
    api.delete<{ id: string; message: string }>(`/maintenance/${id}`),
};
