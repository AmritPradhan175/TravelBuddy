/**
 * TravelBuddy API Client with automatic Bearer token injection and error handling.
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000/api/v1';

export class APIClient {
  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    const token = localStorage.getItem('tb_token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  }

  async get<T>(endpoint: string, params?: Record<string, string | number>): Promise<T> {
    let url = `${API_BASE_URL}${endpoint}`;
    if (params) {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== null && v !== '') {
          searchParams.append(k, String(v));
        }
      });
      const queryString = searchParams.toString();
      if (queryString) url += `?${queryString}`;
    }

    const response = await fetch(url, {
      method: 'GET',
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error?.message || errorData.message || `Request failed with status ${response.status}`);
    }

    const data = await response.json();
    return data.data;
  }

  async post<T>(endpoint: string, body?: any): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error?.message || errorData.message || `Request failed with status ${response.status}`);
    }

    const data = await response.json();
    return data.data;
  }

  async patch<T>(endpoint: string, body?: any): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'PATCH',
      headers: this.getHeaders(),
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error?.message || errorData.message || `Request failed with status ${response.status}`);
    }

    const data = await response.json();
    return data.data;
  }

  async delete<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error?.message || errorData.message || `Request failed with status ${response.status}`);
    }

    const data = await response.json().catch(() => ({}));
    return (data.data !== undefined ? data.data : data) as T;
  }
}

export const apiClient = new APIClient();
