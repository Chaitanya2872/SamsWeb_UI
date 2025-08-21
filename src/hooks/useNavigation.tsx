// src/hooks/useNavigation.tsx
import React, { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from './useAuth';

interface NavigationState {
  isLoading: boolean;
  error: string | null;
  previousPath: string | null;
}

interface NavigationContextType extends NavigationState {
  // Navigation methods
  navigateTo: (path: string, options?: { replace?: boolean; state?: any }) => void;
  navigateBack: () => void;
  navigateToStructure: (structureId: string) => void;
  navigateToCreateStructure: () => void;
  navigateToDashboard: () => void;
  navigateToLogin: () => void;
  navigateToProfile: () => void;
  
  // State methods
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  
  // Utility methods
  isCurrentPath: (path: string) => boolean;
  isChildPath: (parentPath: string) => boolean;
  getPathSegments: () => string[];
}

const NavigationContext = createContext<NavigationContextType | null>(null);

interface NavigationProviderProps {
  children: ReactNode;
}

export const NavigationProvider: React.FC<NavigationProviderProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  
  const [state, setState] = useState<NavigationState>({
    isLoading: false,
    error: null,
    previousPath: null,
  });

  const setLoading = useCallback((loading: boolean) => {
    setState(prev => ({ ...prev, isLoading: loading }));
  }, []);

  const setError = useCallback((error: string | null) => {
    setState(prev => ({ ...prev, error }));
  }, []);

  const navigateTo = useCallback((path: string, options?: { replace?: boolean; state?: any }) => {
    try {
      setError(null);
      setState(prev => ({ ...prev, previousPath: location.pathname }));
      
      if (options?.replace) {
        navigate(path, { replace: true, state: options.state });
      } else {
        navigate(path, { state: options?.state });
      }
    } catch (error) {
      console.error('Navigation error:', error);
      setError('Navigation failed. Please try again.');
    }
  }, [navigate, location.pathname]);

  const navigateBack = useCallback(() => {
    try {
      if (state.previousPath) {
        navigate(state.previousPath);
      } else {
        navigate(-1);
      }
    } catch (error) {
      console.error('Navigate back error:', error);
      navigateTo('/dashboard');
    }
  }, [navigate, state.previousPath, navigateTo]);

  const navigateToStructure = useCallback((structureId: string) => {
    navigateTo(`/structures/${structureId}`);
  }, [navigateTo]);

  const navigateToCreateStructure = useCallback(() => {
    navigateTo('/structures/create');
  }, [navigateTo]);

  const navigateToDashboard = useCallback(() => {
    navigateTo('/dashboard');
  }, [navigateTo]);

  const navigateToLogin = useCallback(() => {
    navigateTo('/login', { replace: true });
  }, [navigateTo]);

  const navigateToProfile = useCallback(() => {
    navigateTo('/profile');
  }, [navigateTo]);

  const isCurrentPath = useCallback((path: string) => {
    return location.pathname === path;
  }, [location.pathname]);

  const isChildPath = useCallback((parentPath: string) => {
    return location.pathname.startsWith(parentPath);
  }, [location.pathname]);

  const getPathSegments = useCallback(() => {
    return location.pathname.split('/').filter(segment => segment !== '');
  }, [location.pathname]);

  const value: NavigationContextType = {
    ...state,
    navigateTo,
    navigateBack,
    navigateToStructure,
    navigateToCreateStructure,
    navigateToDashboard,
    navigateToLogin,
    navigateToProfile,
    setLoading,
    setError,
    isCurrentPath,
    isChildPath,
    getPathSegments,
  };

  return (
    <NavigationContext.Provider value={value}>
      {children}
    </NavigationContext.Provider>
  );
};

export const useNavigation = (): NavigationContextType => {
  const context = useContext(NavigationContext);
  
  if (!context) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  
  return context;
};

// Utility hooks for common navigation patterns
export const useBackNavigation = () => {
  const { navigateBack, navigateToDashboard } = useNavigation();
  
  return useCallback((fallbackToDashboard = true) => {
    try {
      navigateBack();
    } catch (error) {
      if (fallbackToDashboard) {
        navigateToDashboard();
      }
    }
  }, [navigateBack, navigateToDashboard]);
};

export const useStructureNavigation = () => {
  const { navigateToStructure, navigateToCreateStructure } = useNavigation();
  
  return {
    goToStructure: navigateToStructure,
    createNewStructure: navigateToCreateStructure,
  };
};