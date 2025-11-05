import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import Cookies from 'js-cookie';
import { API_URL, STORAGE_KEYS, ROUTES } from './constants';
import { ApiError } from '@/types/api.types';

class ApiClient {
  private client: AxiosInstance;
  private isRefreshing = false;
  private failedQueue: Array<{
    resolve: (value?: unknown) => void;
    reject: (reason?: unknown) => void;
  }> = [];

  constructor() {
    this.client = axios.create({
      baseURL: API_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    this.client.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        const token = Cookies.get(STORAGE_KEYS.ACCESS_TOKEN);
        
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

        if (error.response?.status === 401 && !originalRequest._retry) {
          if (this.isRefreshing) {
            return new Promise((resolve, reject) => {
              this.failedQueue.push({ resolve, reject });
            })
              .then(() => {
                return this.client(originalRequest);
              })
              .catch((err) => {
                return Promise.reject(err);
              });
          }

          originalRequest._retry = true;
          this.isRefreshing = true;

          const refreshToken = Cookies.get(STORAGE_KEYS.REFRESH_TOKEN);

          if (!refreshToken) {
            this.handleLogout();
            return Promise.reject(error);
          }

          try {
            const response = await axios.post(`${API_URL}/auth/refresh`, {
              refreshToken,
            });

            const { accessToken } = response.data.data;
            
            Cookies.set(STORAGE_KEYS.ACCESS_TOKEN, accessToken);

            this.processQueue(null);
            this.isRefreshing = false;

            return this.client(originalRequest);
          } catch (refreshError) {
            this.processQueue(refreshError);
            this.isRefreshing = false;
            this.handleLogout();
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(this.handleError(error));
      }
    );
  }

  private processQueue(error: unknown) {
    this.failedQueue.forEach((promise) => {
      if (error) {
        promise.reject(error);
      } else {
        promise.resolve();
      }
    });

    this.failedQueue = [];
  }

  private handleLogout() {
    Cookies.remove(STORAGE_KEYS.ACCESS_TOKEN);
    Cookies.remove(STORAGE_KEYS.REFRESH_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER);
    
    if (typeof window !== 'undefined') {
      window.location.href = ROUTES.LOGIN;
    }
  }

  private handleError(error: AxiosError): ApiError {
    if (error.response) {
      const data = error.response.data as Record<string, unknown>;
      return {
        message: (data.message as string) || 'Error del servidor',
        status: error.response.status,
        errors: data.errors,
      };
    } else if (error.request) {
      return {
        message: 'No se pudo conectar con el servidor',
      };
    } else {
      return {
        message: error.message || 'Error desconocido',
      };
    }
  }

  public get<T = unknown>(url: string, config?: unknown): Promise<import('axios').AxiosResponse<T>> {
    return this.client.get<T>(url, config);
  }

  public post<T = unknown>(url: string, data?: unknown, config?: unknown): Promise<import('axios').AxiosResponse<T>> {
    return this.client.post<T>(url, data, config);
  }

  public put<T = unknown>(url: string, data?: unknown, config?: unknown): Promise<import('axios').AxiosResponse<T>> {
    return this.client.put<T>(url, data, config);
  }

  public delete<T = unknown>(url: string, config?: unknown): Promise<import('axios').AxiosResponse<T>> {
    return this.client.delete<T>(url, config);
  }

  public patch<T = unknown>(url: string, data?: unknown, config?: unknown): Promise<import('axios').AxiosResponse<T>> {
    return this.client.patch<T>(url, data, config);
  }
}

const api = new ApiClient();

export default api;
