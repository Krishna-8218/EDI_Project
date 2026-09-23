import { ApiResponse } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

class ApiClient {
  private getHeaders(): HeadersInit {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    const token = localStorage.getItem('assetflow_token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
  }

  private async handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
    const data: ApiResponse<T> = await response.json();

    if (!response.ok) {
      if (response.status === 401) {
        // Auto clear token and redirect on session expiry if on protected route
        localStorage.removeItem('assetflow_token');
        localStorage.removeItem('assetflow_user');
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }
      let errorMessage = data.message || 'An unexpected error occurred';
      if (data.errors && Array.isArray(data.errors) && data.errors.length > 0) {
        const details = data.errors
          .map((e: any) => (typeof e === 'string' ? e : `${e.field ? e.field + ': ' : ''}${e.message}`))
          .join('; ');
        errorMessage = `${errorMessage}: ${details}`;
      }
      throw new Error(errorMessage);
    }

    return data;
  }

  async get<T>(url: string, params?: Record<string, any>): Promise<ApiResponse<T>> {
    let finalUrl = `${API_BASE_URL}${url}`;
    if (params) {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          searchParams.append(key, String(value));
        }
      });
      const queryString = searchParams.toString();
      if (queryString) {
        finalUrl += `?${queryString}`;
      }
    }

    const response = await fetch(finalUrl, {
      method: 'GET',
      headers: this.getHeaders(),
    });

    return this.handleResponse<T>(response);
  }

  async post<T>(url: string, body?: any): Promise<ApiResponse<T>> {
    const response = await fetch(`${API_BASE_URL}${url}`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: body ? JSON.stringify(body) : undefined,
    });

    return this.handleResponse<T>(response);
  }

  async put<T>(url: string, body?: any): Promise<ApiResponse<T>> {
    const response = await fetch(`${API_BASE_URL}${url}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: body ? JSON.stringify(body) : undefined,
    });

    return this.handleResponse<T>(response);
  }

  async delete<T>(url: string): Promise<ApiResponse<T>> {
    const response = await fetch(`${API_BASE_URL}${url}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });

    return this.handleResponse<T>(response);
  }
}

export const api = new ApiClient();
export default api;
