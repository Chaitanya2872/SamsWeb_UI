import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Mail, Lock, Eye, EyeOff, User, Building2 } from 'lucide-react';

import { useAuth } from '@/contexts/AuthContext';
import { RegisterData } from '@/types';
import { Button, Input, Card } from '@/components/ui';

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { register: registerUser, isLoading, error, clearError, requiresVerification } = useAuth();
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
    setError
  } = useForm<RegisterData>();

  const password = watch('password');

  // Clear errors on component mount
  useEffect(() => {
    clearError();
  }, [clearError]);

  // Redirect to OTP verification if registration requires verification
  useEffect(() => {
    if (requiresVerification) {
      navigate('/auth/verify-email');
    }
  }, [requiresVerification, navigate]);

  const onSubmit = async (data: RegisterData) => {
    try {
      clearError();

      // Client-side password confirmation validation
      if (data.password !== data.confirmPassword) {
        setError('confirmPassword', {
          type: 'manual',
          message: 'Passwords do not match'
        });
        return;
      }

      await registerUser(data);
    } catch (error: unknown) {
      console.error('Registration error:', error);
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
            Create your account
          </h2>
          <p className="mt-2 text-sm text-secondary-600">
            Join the Structure Assessment Management System
          </p>
        </div>

        {/* Registration Form */}
        <Card padding="lg">
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            {/* Error Display */}
            {error && (
              <div className="bg-danger-50 border border-danger-200 rounded-lg p-4">
                <p className="text-sm text-danger-700">{error}</p>
              </div>
            )}

            {/* Username Field */}
            <Input
              label="Username"
              type="text"
              placeholder="Choose a username"
              leftIcon={<User className="w-5 h-5" />}
              error={errors.username?.message}
              {...register('username', {
                required: 'Username is required',
                minLength: {
                  value: 3,
                  message: 'Username must be at least 3 characters long'
                },
                maxLength: {
                  value: 50,
                  message: 'Username cannot exceed 50 characters'
                },
                pattern: {
                  value: /^[a-zA-Z0-9_]+$/,
                  message: 'Username can only contain letters, numbers, and underscores'
                }
              })}
              fullWidth
            />

            {/* Email Field */}
            <Input
              label="Email Address"
              type="email"
              placeholder="Enter your email address"
              leftIcon={<Mail className="w-5 h-5" />}
              error={errors.email?.message}
              {...register('email', {
                required: 'Email address is required',
                pattern: {
                  value: /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
                  message: 'Please enter a valid email address'
                }
              })}
              fullWidth
            />

            {/* Password Field */}
            <Input
              label="Password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Create a strong password"
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
                  value: 8,
                  message: 'Password must be at least 8 characters long'
                },
                pattern: {
                  value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                  message: 'Password must contain at least one uppercase letter, one lowercase letter, and one number'
                }
              })}
              fullWidth
            />

            {/* Confirm Password Field */}
            <Input
              label="Confirm Password"
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="Confirm your password"
              leftIcon={<Lock className="w-5 h-5" />}
              rightIcon={
                <button
                  type="button"
                  className="text-secondary-400 hover:text-secondary-600 transition-colors"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  tabIndex={-1}
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              }
              error={errors.confirmPassword?.message}
              {...register('confirmPassword', {
                required: 'Please confirm your password',
                validate: (value) => value === password || 'Passwords do not match'
              })}
              fullWidth
            />

            {/* Password Strength Indicator */}
            {password && (
              <div className="space-y-2">
                <div className="text-xs text-secondary-600">Password strength:</div>
                <div className="flex space-x-1">
                  {[1, 2, 3, 4].map((level) => {
                    const strength = getPasswordStrength(password);
                    return (
                      <div
                        key={level}
                        className={`h-1 flex-1 rounded ${
                          strength >= level
                            ? strength >= 4
                              ? 'bg-success-500'
                              : strength >= 3
                              ? 'bg-warning-500'
                              : 'bg-danger-500'
                            : 'bg-secondary-200'
                        }`}
                      />
                    );
                  })}
                </div>
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              loading={isSubmitting || isLoading}
              disabled={isSubmitting || isLoading}
            >
              {isSubmitting || isLoading ? 'Creating account...' : 'Create account'}
            </Button>
          </form>

          {/* Login Link */}
          <div className="mt-6 pt-6 border-t border-secondary-200 text-center">
            <p className="text-sm text-secondary-600">
              Already have an account?{' '}
              <Link
                to="/auth/login"
                className="font-medium text-primary-600 hover:text-primary-500 transition-colors"
              >
                Sign in here
              </Link>
            </p>
          </div>
        </Card>

        {/* Footer */}
        <div className="text-center text-xs text-secondary-500">
          <p>
            By creating an account, you agree to our{' '}
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

// Helper function to calculate password strength
const getPasswordStrength = (password: string): number => {
  let strength = 0;
  
  // Length check
  if (password.length >= 8) strength += 1;
  
  // Lowercase check
  if (/[a-z]/.test(password)) strength += 1;
  
  // Uppercase check
  if (/[A-Z]/.test(password)) strength += 1;
  
  // Number check
  if (/\d/.test(password)) strength += 1;
  
  return strength;
};

export default RegisterPage;