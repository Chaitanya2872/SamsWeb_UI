import React, { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/types';
import { LoadingSpinner } from '@/components/ui';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRoles?: UserRole[];
  adminOnly?: boolean;
  requireEmailVerification?: boolean;
  fallbackPath?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRoles = [],
  adminOnly = false,
  requireEmailVerification = true,
  fallbackPath = '/auth/login'
}) => {
  const { 
    isAuthenticated, 
    user, 
    isLoading, 
    isInitialized,
    hasAnyRole,
    isAdmin 
  } = useAuth();
  const location = useLocation();

  // Show loading while initializing auth
  if (!isInitialized || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-secondary-50">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-secondary-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated || !user) {
    return (
      <Navigate
        to={fallbackPath}
        state={{ from: location }}
        replace
      />
    );
  }

  // Check email verification requirement
  if (requireEmailVerification && !user.isEmailVerified) {
    return (
      <Navigate
        to="/auth/verify-email"
        state={{ from: location }}
        replace
      />
    );
  }

  // Check admin-only access
  if (adminOnly && !isAdmin()) {
    return (
      <Navigate
        to="/dashboard"
        replace
      />
    );
  }

  // Check specific role requirements
  if (requiredRoles.length > 0 && !hasAnyRole(requiredRoles)) {
    return (
      <Navigate
        to="/dashboard"
        replace
      />
    );
  }

  // Check if user is active
  if (!user.is_active) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-secondary-50">
        <div className="max-w-md w-full text-center">
          <div className="bg-white rounded-lg shadow-soft p-8">
            <div className="w-16 h-16 bg-warning-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-warning-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-secondary-900 mb-2">
              Account Inactive
            </h2>
            <p className="text-secondary-600 mb-6">
              Your account has been deactivated. Please contact your administrator for assistance.
            </p>
            <button
              onClick={() => window.location.href = '/auth/login'}
              className="text-primary-600 hover:text-primary-500 font-medium"
            >
              Return to login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;