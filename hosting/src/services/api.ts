import axios, { AxiosError } from 'axios';
import { toast } from 'sonner';

const API_URL = import.meta.env.VITE_API_URL || '';

export const api = axios.create({
  baseURL: `${API_URL}/api/v1`,
  withCredentials: true, // sends httpOnly cookies
  headers: { 'Content-Type': 'application/json' },
});

// Response interceptor — auto-refresh token on 401
let isRefreshing = false;
let queue: Array<() => void> = [];

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as any;

    if (error.response?.status === 401 && !original._retry) {
      if (isRefreshing) {
        return new Promise((resolve) => {
          queue.push(() => resolve(api(original)));
        });
      }

      original._retry = true;
      isRefreshing = true;

      try {
        await api.post('/auth/refresh');
        queue.forEach((cb) => cb());
        queue = [];
        return api(original);
      } catch {
        // Refresh failed → redirect to login
        window.location.href = '/cliente';
        return Promise.reject(error);
      } finally {
        isRefreshing = false;
      }
    }

    // Show error toast for non-auth errors
    if (error.response?.status !== 401) {
      const data = error.response?.data as any;
      toast.error(data?.message || 'Erro na requisição');
    }

    return Promise.reject(error);
  },
);

// Convenience helpers
export const apiGet = <T>(url: string) => api.get<T>(url).then((r) => r.data);
export const apiPost = <T>(url: string, data?: unknown) => api.post<T>(url, data).then((r) => r.data);
export const apiPatch = <T>(url: string, data?: unknown) => api.patch<T>(url, data).then((r) => r.data);
export const apiDelete = <T>(url: string) => api.delete<T>(url).then((r) => r.data);
export const apiPut = <T>(url: string, data?: unknown) => api.put<T>(url, data).then((r) => r.data);
