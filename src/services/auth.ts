import apiService from './api';
import { AUTH_ENDPOINTS, STORAGE_KEYS } from '../utils/constants';
import type { 
  LoginRequest, 
  LoginResponse, 
  RegisterRequest, 
  RegisterResponse,
  User,
  RefreshTokenResponse 
} from '../types/auth';

class AuthService {
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    try {
      console.log('AuthService login called with:', credentials);
      console.log('API_BASE_URL:', import.meta.env.VITE_API_BASE_URL);
      console.log('Full login URL:', `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}${AUTH_ENDPOINTS.LOGIN}`);
      
      const response = await apiService.post<LoginResponse>(
        AUTH_ENDPOINTS.LOGIN,
        credentials
      );

      console.log('AuthService API response:', response);

      if (response.success) {
        console.log('Login successful:', response.user.email);
        // Store tokens and user data
        localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, response.accessToken);
        localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, response.refreshToken);
        localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(response.user));
      } else {
        console.warn('Login failed:', response.message);
      }

      return response;
    } catch (error: any) {
      console.error('AuthService login error:', error);
      console.error('Error response:', error.response);
      console.error('Error message:', error.message);
      throw {
        success: false,
        message: error.response?.data?.message || 'Login failed. Please check your credentials.',
        user: null,
        accessToken: '',
        refreshToken: ''
      };
    }
  }

  async register(userData: RegisterRequest): Promise<RegisterResponse> {
    try {
      const response = await apiService.post<RegisterResponse>(
        AUTH_ENDPOINTS.REGISTER,
        userData
      );

      return response;
    } catch (error) {
      throw apiService.handleError(error);
    }
  }

  async logout(): Promise<void> {
    try {
      const refreshToken = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
      
      if (refreshToken) {
        await apiService.post(AUTH_ENDPOINTS.LOGOUT, { refreshToken });
      }
    } catch (error) {
      // Continue with logout even if API call fails
      console.error('Logout error:', error);
    } finally {
      // Clear local storage
      localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
      localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
      localStorage.removeItem(STORAGE_KEYS.USER_DATA);
    }
  }

  async refreshToken(): Promise<RefreshTokenResponse> {
    try {
      const refreshToken = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
      
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await apiService.post<RefreshTokenResponse>(
        AUTH_ENDPOINTS.REFRESH,
        { refreshToken }
      );

      if (response.success) {
        localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, response.accessToken);
        localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, response.refreshToken);
      }

      return response;
    } catch (error) {
      // Clear tokens on refresh failure
      localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
      localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
      localStorage.removeItem(STORAGE_KEYS.USER_DATA);
      throw apiService.handleError(error);
    }
  }

  async getCurrentUser(): Promise<User> {
    try {
      const response = await apiService.get<{ success: boolean; user: User }>(
        AUTH_ENDPOINTS.PROFILE
      );

      if (response.success) {
        // Update stored user data
        localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(response.user));
        return response.user;
      }

      throw new Error('Failed to fetch user profile');
    } catch (error) {
      throw apiService.handleError(error);
    }
  }

  getStoredUser(): User | null {
    try {
      const userData = localStorage.getItem(STORAGE_KEYS.USER_DATA);
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Error parsing stored user data:', error);
      localStorage.removeItem(STORAGE_KEYS.USER_DATA);
      return null;
    }
  }

  getAccessToken(): string | null {
    return localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
  }

  isAuthenticated(): boolean {
    const token = this.getAccessToken();
    const user = this.getStoredUser();
    return !!(token && user);
  }

  hasRole(requiredRole: string): boolean {
    const user = this.getStoredUser();
    if (!user) return false;
    
    return user.roles?.includes(requiredRole as any) || user.role === requiredRole;
  }

  canManageRemarks(): boolean {
    return this.hasRole('VE') || this.hasRole('AD');
  }

  async verifyEmail(email: string, otp: string) {
    try {
      const response = await apiService.post(AUTH_ENDPOINTS.VERIFY_EMAIL, {
        email,
        otp
      });
      return response;
    } catch (error) {
      throw apiService.handleError(error);
    }
  }

  async forgotPassword(email: string) {
    try {
      const response = await apiService.post(AUTH_ENDPOINTS.FORGOT_PASSWORD, {
        email
      });
      return response;
    } catch (error) {
      throw apiService.handleError(error);
    }
  }

  async resetPassword(email: string, otp: string, newPassword: string, confirmPassword: string) {
    try {
      const response = await apiService.post(AUTH_ENDPOINTS.RESET_PASSWORD, {
        email,
        otp,
        newPassword,
        confirmPassword
      });
      return response;
    } catch (error) {
      throw apiService.handleError(error);
    }
  }
}

export const authService = new AuthService();
export default authService;