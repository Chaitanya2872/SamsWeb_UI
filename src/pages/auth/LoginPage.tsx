import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Mail, Lock, Eye, EyeOff, Building2 } from 'lucide-react';
import toast from 'react-hot-toast';

import { useAuth } from '@/contexts/AuthContext';
import { LoginCredentials } from '@/types';
import { Button, Input, Card } from '@/components/ui';

// Type for location state
interface LocationState {
  from?: {
    pathname: string;
  };
}

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isLoading, error, clearError, isAuthenticated } = useAuth();
  
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<LoginCredentials>();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      const state = location.state as LocationState;
      const from = state?.from?.pathname || '/dashboard';
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, location]);

  // Clear errors on component mount
  useEffect(() => {
    clearError();
  }, [clearError]);

  // Show success message if redirected from registration
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    if (urlParams.get('registered') === 'true') {
      toast.success('Registration successful! Please log in with your credentials.');
    }
  }, [location]);

  const onSubmit = async (data: LoginCredentials) => {
    try {
      clearError();
      await login(data);
    } catch (error: unknown) {
      // Error handling is done in the auth context and API client
      console.error('Login error:', error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center w-16 h-16 bg-primary-100 rounded-full mb-4">
            <Building2 className="w-8 h-8 text-primary-600" />
          </div>
          <h2 className="text-3xl font-bold text-secondary-900">
            Sign in to SAMS
          </h2>
          <p className="mt-2 text-sm text-secondary-600">
            Structure Assessment Management System
          </p>
        </div>

        {/* Login Form */}
        <Card padding="lg">
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            {/* Error Display */}
            {error && (
              <div className="bg-danger-50 border border-danger-200 rounded-lg p-4">
                <p className="text-sm text-danger-700">{error}</p>
              </div>
            )}

            {/* Email/Username Field */}
            <Input
              label="Email or Username"
              type="text"
              placeholder="Enter your email or username"
              leftIcon={<Mail className="w-5 h-5" />}
              error={errors.identifier?.message}
              {...register('identifier', {
                required: 'Email or username is required',
                minLength: {
                  value: 3,
                  message: 'Must be at least 3 characters long'
                }
              })}
              fullWidth
            />

            {/* Password Field */}
            <Input
              label="Password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter your password"
              leftIcon={<Lock className="w-5 h-5" />}
              rightIcon={
                <button
                  type="button"
                  className="text-secondary-400 hover:text-secondary-600 transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              }
              error={errors.password?.message}
              {...register('password', {
                required: 'Password is required',
                minLength: {
                  value: 6,
                  message: 'Password must be at least 6 characters long'
                }
              })}
              fullWidth
            />

            {/* Forgot Password Link */}
            <div className="text-right">
              <Link
                to="/auth/forgot-password"
                className="text-sm text-primary-600 hover:text-primary-500 transition-colors"
              >
                Forgot your password?
              </Link>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              loading={isSubmitting || isLoading}
              disabled={isSubmitting || isLoading}
            >
              {isSubmitting || isLoading ? 'Signing in...' : 'Sign in'}
            </Button>
          </form>

          {/* Register Link */}
          <div className="mt-6 pt-6 border-t border-secondary-200 text-center">
            <p className="text-sm text-secondary-600">
              Don't have an account?{' '}
              <Link
                to="/auth/register"
                className="font-medium text-primary-600 hover:text-primary-500 transition-colors"
              >
                Sign up here
              </Link>
            </p>
          </div>
        </Card>

        {/* Footer */}
        <div className="text-center text-xs text-secondary-500">
          <p>
            By signing in, you agree to our{' '}
            <a href="#" className="text-primary-600 hover:text-primary-500">
              Terms of Service
            </a>{' '}
            and{' '}
            <a href="#" className="text-primary-600 hover:text-primary-500">
              Privacy Policy
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;