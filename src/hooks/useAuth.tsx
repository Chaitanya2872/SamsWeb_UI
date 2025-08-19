import React, { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import authService from '../services/auth';
import type { 
  User, 
  LoginRequest, 
  LoginResponse, 
  RegisterRequest, 
  RegisterResponse, 
  AuthContextType 
} from '../types/auth';

const AuthContext = createContext<AuthContextType | null>(null);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      const storedUser = authService.getStoredUser();
      const token = authService.getAccessToken();

      if (storedUser && token) {
        // Try to fetch fresh user data
        try {
          const freshUser = await authService.getCurrentUser();
          setUser(freshUser);
        } catch (error) {
          // If fetching fresh data fails, use stored data
          console.warn('Failed to fetch fresh user data, using stored data:', error);
          setUser(storedUser);
        }
      }
    } catch (error) {
      console.error('Auth initialization error:', error);
      // Clear potentially corrupted data
      await authService.logout();
    } finally {
      setIsLoading(false);
    }
  };

const login = async (credentials: LoginRequest): Promise<LoginResponse> => {
    console.log('Attempting to log in with credentials:', credentials);
    setIsLoading(true);
    console.log('useAuth login called with:', credentials);
    try {
      const response = await authService.login(credentials);
      console.log('useAuth login response:', response);
      
      if (response.success) {
        console.log('Setting user in useAuth:', response.user);
        setUser(response.user);
      } else {
        console.log('Login failed in useAuth:', response.message);
      }
      
      return response;
    } catch (error) {
      console.error('useAuth login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: RegisterRequest): Promise<RegisterResponse> => {
    setIsLoading(true);
    try {
      const response = await authService.register(userData);
      return response;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await authService.logout();
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
      // Force logout even if API call fails
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const value: AuthContextType = {
    user,
    login,
    register,
    logout,
    isLoading,
    isAuthenticated: !!user && authService.isAuthenticated(),
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};

// Additional utility hooks
export const useAuthUser = () => {
  const { user } = useAuth();
  return user;
};

export const useAuthRole = () => {
  const { user } = useAuth();
  return user?.role;
};

export const useAuthPermissions = () => {
  const { user } = useAuth();
  return user?.permissions;
};

export const useCanManageRemarks = () => {
  useAuth();
  return authService.canManageRemarks();
};

export const useHasRole = (requiredRole: string) => {
  useAuth();
  return authService.hasRole(requiredRole);
};

export default useAuth;