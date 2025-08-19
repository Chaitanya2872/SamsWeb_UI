import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { BuildingOfficeIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { RegisterForm } from '../components/auth/RegisterForm';
import { useAuth } from '../hooks/useAuth';

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [registrationComplete, setRegistrationComplete] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleRegistrationSuccess = () => {
    setRegistrationComplete(true);
  };

  if (registrationComplete) {
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
                <h1 className="text-2xl font-bold text-gray-900">StructureIQ</h1>
                <p className="text-sm text-gray-600">Management System</p>
              </div>
            </div>
          </div>
        </div>

        {/* Success Message */}
        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="card p-6 text-center">
            <div className="flex justify-center mb-4">
              <CheckCircleIcon className="h-12 w-12 text-green-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Registration Successful!
            </h2>
            <p className="text-gray-600 mb-4">
              We've sent a verification email to your email address. Please check your inbox and follow the instructions to verify your account.
            </p>
            <div className="space-y-3">
              <p className="text-sm text-gray-500">
                Didn't receive the email? Check your spam folder or{' '}
                <button className="text-blue-600 hover:text-blue-700 font-medium">
                  resend verification email
                </button>
              </p>
              <Link
                to="/login"
                className="btn btn-primary w-full inline-flex items-center justify-center"
              >
                Go to Login
              </Link>
            </div>
          </div>
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
          </div>
        </div>
      </div>
    );
  }

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
              <h1 className="text-2xl font-bold text-gray-900">StructureIQ</h1>
              <p className="text-sm text-gray-600">Management System</p>
            </div>
          </div>
        </div>
      </div>

      {/* Registration Form */}
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <RegisterForm onSuccess={handleRegistrationSuccess} />
      </div>

      {/* Footer */}
      <div className="mt-8 text-center">
        <div className="text-xs text-gray-500 space-y-2">
          <p>
            By creating an account, you agree to our{' '}
            <Link to="/terms" className="text-blue-600 hover:text-blue-700">
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link to="/privacy" className="text-blue-600 hover:text-blue-700">
              Privacy Policy
            </Link>
          </p>
          <p>
            For support, contact{' '}
            <a href="mailto:support@structureiq.com" className="text-blue-600 hover:text-blue-700">
              support@structureiq.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};