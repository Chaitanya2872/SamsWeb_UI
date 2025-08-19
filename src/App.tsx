// src/App.tsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './hooks/useAuth';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { Layout } from './components/layout/Layout';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { DashboardPage } from './pages/DashboardPage';
import './styles/globals.css';

// Lazy load pages for better performance
const StructuresPage = React.lazy(() => import('./pages/StructuresPage'));
const AnalyticsPage = React.lazy(() => import('./pages/AnalyticsPage'));
const ReportsPage = React.lazy(() => import('./pages/ReportsPage'));
const FilesPage = React.lazy(() => import('./pages/FilesPage'));
const UsersPage = React.lazy(() => import('./pages/UsersPage'));
const SettingsPage = React.lazy(() => import('./pages/SettingsPage'));
const ProfilePage = React.lazy(() => import('./pages/ProfilePage'));

// Loading fallback component
const PageLoader: React.FC = () => (
  <div className="flex items-center justify-center min-h-[400px]">
    <div className="flex flex-col items-center gap-4">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      <p className="text-sm text-gray-600">Loading...</p>
    </div>
  </div>
);

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            
            {/* Protected Routes */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }
            >
              {/* Dashboard */}
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<DashboardPage />} />
              
              {/* Structures */}
              <Route 
                path="structures" 
                element={
                  <React.Suspense fallback={<PageLoader />}>
                    <StructuresPage />
                  </React.Suspense>
                } 
              />
              
              {/* Analytics */}
              <Route 
                path="analytics" 
                element={
                  <React.Suspense fallback={<PageLoader />}>
                    <AnalyticsPage />
                  </React.Suspense>
                } 
              />
              
              {/* Reports */}
              <Route 
                path="reports" 
                element={
                  <React.Suspense fallback={<PageLoader />}>
                    <ReportsPage />
                  </React.Suspense>
                } 
              />
              
              {/* Files */}
              <Route 
                path="files" 
                element={
                  <React.Suspense fallback={<PageLoader />}>
                    <FilesPage />
                  </React.Suspense>
                } 
              />
              
              {/* Users (Admin only) */}
              <Route 
                path="users" 
                element={
                  <ProtectedRoute roles={['AD']}>
                    <React.Suspense fallback={<PageLoader />}>
                      <UsersPage />
                    </React.Suspense>
                  </ProtectedRoute>
                } 
              />
              
              {/* Profile */}
              <Route 
                path="profile" 
                element={
                  <React.Suspense fallback={<PageLoader />}>
                    <ProfilePage />
                  </React.Suspense>
                } 
              />
              
              {/* Settings */}
              <Route 
                path="settings" 
                element={
                  <React.Suspense fallback={<PageLoader />}>
                    <SettingsPage />
                  </React.Suspense>
                } 
              />
            </Route>
            
            {/* Catch all route */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;