import axios, { type AxiosInstance, type AxiosRequestConfig, type AxiosResponse } from 'axios';
import { API_BASE_URL, STORAGE_KEYS, AUTH_ENDPOINTS } from '../utils/constants';
import type { RefreshTokenResponse } from '../types/auth';
import type { ApiError } from '../types/api';

class ApiService {
  private api: AxiosInstance;
  private isRefreshing = false;
  private failedQueue: Array<{
    resolve: (value: string) => void;
    reject: (reason: any) => void;
  }> = [];

  constructor() {
    console.log('🔧 API Service initializing...');
    console.log('📍 API Base URL:', API_BASE_URL);
    
    this.api = axios.create({
      baseURL: API_BASE_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
    console.log('✅ API Service initialized');
  }

  private setupInterceptors() {
    // Request interceptor to add auth token
    this.api.interceptors.request.use(
      (config) => {
        console.log(`📤 ${config.method?.toUpperCase()} ${config.url}`);
        console.log('📍 Full URL:', `${config.baseURL}${config.url}`);
        
        const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
        if (token) {
          console.log('🔑 Adding auth token to request');
          config.headers.Authorization = `Bearer ${token}`;
        } else {
          console.log('⚠️ No auth token found');
        }
        return config;
      },
      (error) => {
        console.error('❌ Request interceptor error:', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor to handle token refresh
    this.api.interceptors.response.use(
      (response) => {
        console.log(`📥 ${response.config.method?.toUpperCase()} ${response.config.url} - Status: ${response.status}`);
        return response;
      },
      async (error) => {
        console.error('❌ Response interceptor error:', error);
        
        if (error.response) {
          console.error('📊 Error status:', error.response.status);
          console.error('📄 Error response:', error.response.data);
          console.error('🔗 Error URL:', error.response.config?.url);
        } else if (error.request) {
          console.error('🌐 Network error - no response received:', error.message);
          console.error('📍 Request URL:', error.config?.url);
        } else {
          console.error('❗ Request setup error:', error.message);
        }

        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
          console.log('🔐 Token expired, attempting refresh...');
          
          if (this.isRefreshing) {
            console.log('⏳ Token refresh already in progress, queuing request...');
            return new Promise((resolve, reject) => {
              this.failedQueue.push({ resolve, reject });
            }).then((token) => {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              return this.api(originalRequest);
            }).catch((err) => {
              return Promise.reject(err);
            });
          }

          originalRequest._retry = true;
          this.isRefreshing = true;

          try {
            const refreshToken = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
            if (!refreshToken) {
              console.error('❌ No refresh token available');
              throw new Error('No refresh token available');
            }

            console.log('🔄 Attempting token refresh...');
            const response = await axios.post<RefreshTokenResponse>(
              `${API_BASE_URL}${AUTH_ENDPOINTS.REFRESH}`,
              { refreshToken }
            );

            const { accessToken, refreshToken: newRefreshToken } = response.data;
            
            localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
            localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, newRefreshToken);

            console.log('✅ Token refresh successful');
            
            // Process failed queue
            this.failedQueue.forEach(({ resolve }) => resolve(accessToken));
            this.failedQueue = [];

            originalRequest.headers.Authorization = `Bearer ${accessToken}`;
            return this.api(originalRequest);
          } catch (refreshError) {
            console.error('❌ Token refresh failed:', refreshError);
            // Refresh failed, logout user
            this.failedQueue.forEach(({ reject }) => reject(refreshError));
            this.failedQueue = [];
            
            localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
            localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
            localStorage.removeItem(STORAGE_KEYS.USER_DATA);
            
            window.location.href = '/login';
            return Promise.reject(refreshError);
          } finally {
            this.isRefreshing = false;
          }
        }

        return Promise.reject(error);
      }
    );
  }

  async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    console.log(`🚀 GET request: ${url}`);
    try {
      const response: AxiosResponse<T> = await this.api.get(url, config);
      console.log(`✅ GET ${url} successful`);
      return response.data;
    } catch (error) {
      console.error(`❌ GET ${url} failed:`, error);
      throw error;
    }
  }

  async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    console.log(`🚀 POST request: ${url}`, { data });
    console.log('📍 Full request URL:', `${this.api.defaults.baseURL}${url}`);
    try {
      const response: AxiosResponse<T> = await this.api.post(url, data, config);
      console.log(`✅ POST ${url} successful:`, response.data);
      return response.data;
    } catch (error) {
      console.error(`❌ POST ${url} failed:`, error);
      throw error;
    }
  }

  async put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    console.log(`🚀 PUT request: ${url}`, { data });
    try {
      const response: AxiosResponse<T> = await this.api.put(url, data, config);
      console.log(`✅ PUT ${url} successful`);
      return response.data;
    } catch (error) {
      console.error(`❌ PUT ${url} failed:`, error);
      throw error;
    }
  }

  async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    console.log(`🚀 DELETE request: ${url}`);
    try {
      const response: AxiosResponse<T> = await this.api.delete(url, config);
      console.log(`✅ DELETE ${url} successful`);
      return response.data;
    } catch (error) {
      console.error(`❌ DELETE ${url} failed:`, error);
      throw error;
    }
  }

  // Utility method to handle API errors
  handleError(error: any): ApiError {
    console.error('🔍 Handling API error:', error);
    
    if (axios.isAxiosError(error)) {
      const apiError = {
        success: false,
        error: error.response?.data?.error || error.message,
        details: error.response?.data?.details,
        statusCode: error.response?.status,
      };
      console.error('🚨 Processed API error:', apiError);
      return apiError as ApiError;
    }

    const genericError: ApiError = {
      success: false,
      error: error.message || 'An unexpected error occurred',
    };
    console.error('🚨 Processed generic error:', genericError);
    return genericError as ApiError;
  }
}

export const apiService = new ApiService();
export default apiService;
