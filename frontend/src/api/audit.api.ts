import api from './client';
import { AuditLog } from '../types';

export const auditApi = {
  getAll: (params?: { page?: number; limit?: number; entity?: string; action?: string }) =>
    api.get<AuditLog[]>('/audit-logs', params),
};
