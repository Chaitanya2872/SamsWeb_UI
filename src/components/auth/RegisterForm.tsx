import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  EyeIcon, 
  EyeSlashIcon, 
  EnvelopeIcon, 
  LockClosedIcon, 
  UserIcon 
} from '@heroicons/react/24/outline';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { useAuth } from '../../hooks/useAuth';
import type { RegisterRequest } from '../../types/auth';

interface RegisterFormProps {
  onSuccess?: () => void;
}

export const RegisterForm: React.FC<RegisterFormProps> = ({ onSuccess }) => {
  const { register, isLoading } = useAuth();
  const [formData, setFormData] = useState<RegisterRequest>({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Username validation
    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters long';
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      newErrors.username = 'Username can only contain letters, numbers, and underscores';
    }

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters long';
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) return;

    try {
      const response = await register(formData);
      
      if (response.success) {
        onSuccess?.();
      }
    } catch (error: any) {
      if (error.details && Array.isArray(error.details)) {
        // Handle validation errors from backend
        const fieldErrors: Record<string, string> = {};
        error.details.forEach((detail: string) => {
          if (detail.includes('username')) fieldErrors.username = detail;
          else if (detail.includes('email')) fieldErrors.email = detail;
          else if (detail.includes('password')) fieldErrors.password = detail;
          else fieldErrors.submit = detail;
        });
        setErrors(fieldErrors);
      } else {
        setErrors({
          submit: error.error || 'Registration failed. Please try again.',
        });
      }
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="card p-6">
        <div className="text-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Create Account</h2>
          <p className="text-sm text-gray-600">Join us to start managing structures</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            name="username"
            label="Username"
            type="text"
            value={formData.username}
            onChange={handleChange}
            error={errors.username}
            leftIcon={<UserIcon className="h-4 w-4" />}
            placeholder="Choose a username"
            autoComplete="username"
          />

          <Input
            name="email"
            label="Email Address"
            type="email"
            value={formData.email}
            onChange={handleChange}
            error={errors.email}
            leftIcon={<EnvelopeIcon className="h-4 w-4" />}
            placeholder="Enter your email address"
            autoComplete="email"
          />

          <Input
            name="password"
            label="Password"
            type={showPassword ? 'text' : 'password'}
            value={formData.password}
            onChange={handleChange}
            error={errors.password}
            leftIcon={<LockClosedIcon className="h-4 w-4" />}
            rightIcon={
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="hover:text-gray-600"
              >
                {showPassword ? (
                  <EyeSlashIcon className="h-4 w-4" />
                ) : (
                  <EyeIcon className="h-4 w-4" />
                )}
              </button>
            }
            placeholder="Create a password"
            autoComplete="new-password"
            helpText="Password must be at least 6 characters long"
          />

          <Input
            name="confirmPassword"
            label="Confirm Password"
            type={showConfirmPassword ? 'text' : 'password'}
            value={formData.confirmPassword}
            onChange={handleChange}
            error={errors.confirmPassword}
            leftIcon={<LockClosedIcon className="h-4 w-4" />}
            rightIcon={
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="hover:text-gray-600"
              >
                {showConfirmPassword ? (
                  <EyeSlashIcon className="h-4 w-4" />
                ) : (
                  <EyeIcon className="h-4 w-4" />
                )}
              </button>
            }
            placeholder="Confirm your password"
            autoComplete="new-password"
          />

          {errors.submit && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{errors.submit}</p>
            </div>
          )}

          <Button
            type="submit"
            variant="primary"
            className="w-full"
            isLoading={isLoading}
            disabled={isLoading}
          >
            {isLoading ? 'Creating account...' : 'Create Account'}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="text-blue-600 hover:text-blue-700 font-medium">
              Sign in
            </Link>
          </p>
        </div>

        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
          <p className="text-xs text-blue-600">
            After registration, you'll need to verify your email address before you can sign in.
          </p>
        </div>
      </div>
    </div>
  );
};
