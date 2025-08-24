import React, { createContext, useContext, useEffect, useReducer, type ReactNode } from 'react';
import toast from 'react-hot-toast';
import { apiClient } from '../services/api';
import {
  User,
  LoginCredentials,
  RegisterData,
  OTPVerification,
  ForgotPasswordData,
  ResetPasswordData,
  UserRole
} from '@/types';

// Define error type for better type safety
interface ApiError {
  response?: {
    data?: {
      error?: string;
    };
  };
  message?: string;
}

// Auth State Type
interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;
  requiresVerification: boolean;
  pendingVerificationEmail: string | null;
}

// Auth Action Types
type AuthAction =
  | { type: 'INITIALIZE_START' }
  | { type: 'INITIALIZE_SUCCESS'; payload: User }
  | { type: 'INITIALIZE_FAILURE' }
  | { type: 'LOGIN_START' }
  | { type: 'LOGIN_SUCCESS'; payload: { user: User; accessToken: string; refreshToken: string } }
  | { type: 'LOGIN_FAILURE'; payload: string }
  | { type: 'LOGIN_REQUIRES_VERIFICATION'; payload: string }
  | { type: 'REGISTER_START' }
  | { type: 'REGISTER_SUCCESS'; payload: string }
  | { type: 'REGISTER_FAILURE'; payload: string }
  | { type: 'VERIFY_EMAIL_START' }
  | { type: 'VERIFY_EMAIL_SUCCESS'; payload: User }
  | { type: 'VERIFY_EMAIL_FAILURE'; payload: string }
  | { type: 'LOGOUT' }
  | { type: 'CLEAR_ERROR' }
  | { type: 'UPDATE_USER'; payload: User };

// Initial State
const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  isInitialized: false,
  error: null,
  requiresVerification: false,
  pendingVerificationEmail: null
};

// Auth Reducer
function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'INITIALIZE_START':
      return {
        ...state,
        isLoading: true,
        error: null
      };

    case 'INITIALIZE_SUCCESS':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        isLoading: false,
        isInitialized: true,
        error: null,
        requiresVerification: false,
        pendingVerificationEmail: null
      };

    case 'INITIALIZE_FAILURE':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        isInitialized: true,
        error: null
      };

    case 'LOGIN_START':
      return {
        ...state,
        isLoading: true,
        error: null
      };

    case 'LOGIN_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
        requiresVerification: false,
        pendingVerificationEmail: null
      };

    case 'LOGIN_FAILURE':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload
      };

    case 'LOGIN_REQUIRES_VERIFICATION':
      return {
        ...state,
        isLoading: false,
        requiresVerification: true,
        pendingVerificationEmail: action.payload,
        error: null
      };

    case 'REGISTER_START':
      return {
        ...state,
        isLoading: true,
        error: null
      };

    case 'REGISTER_SUCCESS':
      return {
        ...state,
        isLoading: false,
        requiresVerification: true,
        pendingVerificationEmail: action.payload,
        error: null
      };

    case 'REGISTER_FAILURE':
      return {
        ...state,
        isLoading: false,
        error: action.payload
      };

    case 'VERIFY_EMAIL_START':
      return {
        ...state,
        isLoading: true,
        error: null
      };

    case 'VERIFY_EMAIL_SUCCESS':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        isLoading: false,
        requiresVerification: false,
        pendingVerificationEmail: null,
        error: null
      };

    case 'VERIFY_EMAIL_FAILURE':
      return {
        ...state,
        isLoading: false,
        error: action.payload
      };

    case 'LOGOUT':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
        requiresVerification: false,
        pendingVerificationEmail: null
      };

    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null
      };

    case 'UPDATE_USER':
      return {
        ...state,
        user: action.payload
      };

    default:
      return state;
  }
}

// Auth Context Type
interface AuthContextType {
  // State
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;
  requiresVerification: boolean;
  pendingVerificationEmail: string | null;

  // Actions
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  verifyEmail: (data: OTPVerification) => Promise<void>;
  resendOTP: (email: string, type: 'email_verification' | 'password_reset') => Promise<void>;
  forgotPassword: (data: ForgotPasswordData) => Promise<void>;
  resetPassword: (data: ResetPasswordData) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
  updateUser: (user: User) => void;

  // Utility methods
  hasRole: (role: UserRole) => boolean;
  hasAnyRole: (roles: UserRole[]) => boolean;
  isAdmin: () => boolean;
  isVerificationEngineer: () => boolean;
  isFieldEngineer: () => boolean;
  isTechnicalEngineer: () => boolean;
}

// Create Context
const AuthContext = createContext<AuthContextType | null>(null);

// Auth Provider Props
interface AuthProviderProps {
  children: ReactNode;
}

// Auth Provider Component
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Initialize authentication on app start
  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      dispatch({ type: 'INITIALIZE_START' });

      const accessToken = localStorage.getItem('accessToken');
      const refreshToken = localStorage.getItem('refreshToken');
      
      if (!accessToken || !refreshToken) {
        dispatch({ type: 'INITIALIZE_FAILURE' });
        return;
      }

      // Try to get current user
      const response = await apiClient.getCurrentUser();
      
      if (response.success && response.data) {
        dispatch({ 
          type: 'INITIALIZE_SUCCESS', 
          payload: response.data 
        });
      } else {
        dispatch({ type: 'INITIALIZE_FAILURE' });
      }
    } catch (error: unknown) {
      console.error('Auth initialization error:', error);
      dispatch({ type: 'INITIALIZE_FAILURE' });
    }
  };

  const login = async (credentials: LoginCredentials) => {
    try {
      dispatch({ type: 'LOGIN_START' });

      const response = await apiClient.login(credentials);

      if (response.success && response.user && response.accessToken && response.refreshToken) {
        // Store tokens
        localStorage.setItem('accessToken', response.accessToken);
        localStorage.setItem('refreshToken', response.refreshToken);
        localStorage.setItem('user', JSON.stringify(response.user));

        dispatch({
          type: 'LOGIN_SUCCESS',
          payload: {
            user: response.user,
            accessToken: response.accessToken,
            refreshToken: response.refreshToken
          }
        });

        toast.success(`Welcome back, ${response.user.username}!`);
      } else if (response.requiresVerification) {
        dispatch({
          type: 'LOGIN_REQUIRES_VERIFICATION',
          payload: credentials.identifier
        });
      } else {
        throw new Error(response.error || 'Login failed');
      }
    } catch (error: unknown) {
      const apiError = error as ApiError;
      const errorMessage = apiError.response?.data?.error || apiError.message || 'Login failed';
      dispatch({ type: 'LOGIN_FAILURE', payload: errorMessage });
      throw error;
    }
  };

  const register = async (data: RegisterData) => {
    try {
      dispatch({ type: 'REGISTER_START' });

      const response = await apiClient.register(data);

      if (response.success) {
        dispatch({ type: 'REGISTER_SUCCESS', payload: data.email });
        toast.success('Registration successful! Please verify your email.');
      } else {
        throw new Error(response.error || 'Registration failed');
      }
    } catch (error: unknown) {
      const apiError = error as ApiError;
      const errorMessage = apiError.response?.data?.error || apiError.message || 'Registration failed';
      dispatch({ type: 'REGISTER_FAILURE', payload: errorMessage });
      throw error;
    }
  };

  const verifyEmail = async (data: OTPVerification) => {
    try {
      dispatch({ type: 'VERIFY_EMAIL_START' });

      const response = await apiClient.verifyEmail(data);

      if (response.success && response.user && response.accessToken && response.refreshToken) {
        // Store tokens
        localStorage.setItem('accessToken', response.accessToken);
        localStorage.setItem('refreshToken', response.refreshToken);
        localStorage.setItem('user', JSON.stringify(response.user));

        dispatch({ type: 'VERIFY_EMAIL_SUCCESS', payload: response.user });
        toast.success('Email verified successfully!');
      } else {
        throw new Error(response.error || 'Email verification failed');
      }
    } catch (error: unknown) {
      const apiError = error as ApiError;
      const errorMessage = apiError.response?.data?.error || apiError.message || 'Email verification failed';
      dispatch({ type: 'VERIFY_EMAIL_FAILURE', payload: errorMessage });
      throw error;
    }
  };

  const resendOTP = async (email: string, type: 'email_verification' | 'password_reset') => {
    try {
      const response = await apiClient.resendOTP(email, type);
      
      if (response.success) {
        toast.success('OTP sent successfully!');
      } else {
        throw new Error(response.error || 'Failed to send OTP');
      }
    } catch (error: unknown) {
      const apiError = error as ApiError;
      const errorMessage = apiError.response?.data?.error || apiError.message || 'Failed to send OTP';
      toast.error(errorMessage);
      throw error;
    }
  };

  const forgotPassword = async (data: ForgotPasswordData) => {
    try {
      const response = await apiClient.forgotPassword(data);
      
      if (response.success) {
        toast.success('Password reset OTP sent to your email!');
      } else {
        throw new Error(response.error || 'Failed to send password reset OTP');
      }
    } catch (error: unknown) {
      const apiError = error as ApiError;
      const errorMessage = apiError.response?.data?.error || apiError.message || 'Failed to send password reset OTP';
      toast.error(errorMessage);
      throw error;
    }
  };

  const resetPassword = async (data: ResetPasswordData) => {
    try {
      const response = await apiClient.resetPassword(data);
      
      if (response.success) {
        toast.success('Password reset successfully!');
      } else {
        throw new Error(response.error || 'Password reset failed');
      }
    } catch (error: unknown) {
      const apiError = error as ApiError;
      const errorMessage = apiError.response?.data?.error || apiError.message || 'Password reset failed';
      toast.error(errorMessage);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await apiClient.logout();
    } catch (error) {
      // Ignore logout errors, still clear local state
      console.error('Logout error:', error);
    } finally {
      dispatch({ type: 'LOGOUT' });
      toast.success('Logged out successfully');
    }
  };

  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  const updateUser = (user: User) => {
    localStorage.setItem('user', JSON.stringify(user));
    dispatch({ type: 'UPDATE_USER', payload: user });
  };

  // Utility methods
  const hasRole = (role: UserRole): boolean => {
    if (!state.user) return false;
    return state.user.roles?.includes(role) || state.user.role === role;
  };

  const hasAnyRole = (roles: UserRole[]): boolean => {
    if (!state.user) return false;
    return roles.some(role => hasRole(role));
  };

  const isAdmin = (): boolean => hasRole('AD');
  const isVerificationEngineer = (): boolean => hasRole('VE');
  const isFieldEngineer = (): boolean => hasRole('FE');
  const isTechnicalEngineer = (): boolean => hasRole('TE');

  const contextValue: AuthContextType = {
    // State
    user: state.user,
    isAuthenticated: state.isAuthenticated,
    isLoading: state.isLoading,
    isInitialized: state.isInitialized,
    error: state.error,
    requiresVerification: state.requiresVerification,
    pendingVerificationEmail: state.pendingVerificationEmail,

    // Actions
    login,
    register,
    verifyEmail,
    resendOTP,
    forgotPassword,
    resetPassword,
    logout,
    clearError,
    updateUser,

    // Utility methods
    hasRole,
    hasAnyRole,
    isAdmin,
    isVerificationEngineer,
    isFieldEngineer,
    isTechnicalEngineer
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook to use auth context
// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Export AuthProvider as default since it's the main component
export default AuthProvider;