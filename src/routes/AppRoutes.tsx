import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { LoadingSpinner } from '../components/common/LoadingSpinner';

// Layouts
import { AuthLayout } from '../layouts/AuthLayout';
import { DashboardLayout } from '../layouts/DashboardLayout';

// Auth Pages
import { LoginPage } from '../pages/LoginPage';
import { RegisterPage } from '../pages/RegisterPage';
import VerifyEmailPage from '../pages/VerifyEmailPage';

// Dashboard Pages  
import { DashboardPage } from '../pages/DashboardPage';
import StructuresPage from '../pages/StructuresPage';
import { CreateStructurePage } from '../pages/CreateStructurePage';
import { StructureDetailsPage } from '../pages/StructureDetailsPage';
import ProfilePage from '../pages/ProfilePage';
import { NotFoundPage } from '../pages/NotFoundPage';

// Admin Pages
// import { AdminPage } from '../pages/AdminPage'; // Uncomment when AdminPage is created

// Other Pages


export const AppRoutes: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={
        isAuthenticated ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />
      } />
      
      {/* Auth Routes */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={
          isAuthenticated ? <Navigate to="/dashboard" replace /> : <LoginPage />
        } />
        <Route path="/register" element={
          isAuthenticated ? <Navigate to="/dashboard" replace /> : <RegisterPage />
        } />
        <Route path="/forgot-password" element={<LoginPage />} /> //temporary - rename to res page
        <Route path="/verify-email" element={<VerifyEmailPage />} />
      </Route>

      {/* Protected Dashboard Routes */}
      <Route element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/structures" element={<StructuresPage />} />
        <Route path="/structures/create" element={<CreateStructurePage />} />
        <Route path="/structures/:id" element={<StructureDetailsPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        
        {/* Admin Routes */}
        {/* <Route path="/admin" element={
          <ProtectedRoute roles={['AD']}>
            <AdminPage />
          </ProtectedRoute>
        } /> */}
      </Route>

      {/* 404 Route */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

// Enhanced ProtectedRoute Component
interface ProtectedRouteProps {
  children: React.ReactNode;
  roles?: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, roles = [] }) => {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Check role permissions
  if (roles.length > 0 && user) {
    const hasRequiredRole = roles.some(role => 
      user.roles?.includes(role as any) || user.role === role
    );

    if (!hasRequiredRole) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
            <p className="text-gray-600">You don't have permission to access this page.</p>
          </div>
        </div>
      );
    }
  }

  return <>{children}</>;
};