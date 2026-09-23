import api from './client';
import { User } from '../types';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  department?: string;
  phone?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export const authApi = {
  login: (credentials: LoginCredentials) =>
    api.post<AuthResponse>('/auth/login', credentials),

  register: (data: RegisterData) =>
    api.post<AuthResponse>('/auth/register', data),

  getMe: () =>
    api.get<User>('/auth/me'),
};
