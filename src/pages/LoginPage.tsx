import React, { useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { BuildingOfficeIcon } from '@heroicons/react/24/outline';
import { LoginForm } from '../components/auth/LoginForm';
import { useAuth } from '../hooks/useAuth';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAuth();

  const from = (location.state as any)?.from?.pathname || '/dashboard';



  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);

  const handleLoginSuccess = () => {
    navigate(from, { replace: true });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-600 rounded-xl">
              <BuildingOfficeIcon className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">SAMS</h1>
              <p className="text-sm text-gray-600">iddc</p>
            </div>
          </div>
        </div>
      </div>

      {/* Login Form */}
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <LoginForm onSuccess={handleLoginSuccess} />
      </div>

      {/* Footer */}
      <div className="mt-8 text-center">
        <div className="text-xs text-gray-500 space-y-2">
          <p>
            For support, contact{' '}
            <a href="mailto:support@structureiq.com" className="text-blue-600 hover:text-blue-700">
              support@structureiq.com
            </a>
          </p>
          <div className="flex justify-center space-x-4">
            <Link to="/privacy" className="hover:text-gray-700">
              Privacy Policy
            </Link>
            <Link to="/terms" className="hover:text-gray-700">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};