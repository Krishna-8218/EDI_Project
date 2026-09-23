import api from './client';
import { Role, User, UserStatus } from '../types';

export interface CreateUserInput {
  name: string;
  email: string;
  password: string;
  role?: Role;
  department?: string;
  phone?: string;
  status?: UserStatus;
  rfidCardId?: string;
}

export interface UpdateUserInput extends Partial<CreateUserInput> {}

export const usersApi = {
  getAll: (params?: { page?: number; limit?: number; search?: string; role?: Role; department?: string; status?: UserStatus }) =>
    api.get<User[]>('/users', params),

  getById: (id: string) =>
    api.get<User>(`/users/${id}`),

  create: (data: CreateUserInput) =>
    api.post<User>('/users', data),

  update: (id: string, data: UpdateUserInput) =>
    api.put<User>(`/users/${id}`, data),

  delete: (id: string) =>
    api.delete<{ id: string; message: string }>(`/users/${id}`),
};
