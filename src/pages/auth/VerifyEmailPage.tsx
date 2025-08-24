import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, RotateCcw } from 'lucide-react';
import toast from 'react-hot-toast';

import { useAuth } from '@/contexts/AuthContext';
import { Button, Card } from '@/components/ui';

const VerifyEmailPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    verifyEmail,
    resendOTP,
    isLoading,
    error,
    clearError,
    requiresVerification,
    pendingVerificationEmail,
    isAuthenticated
  } = useAuth();

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [isResending, setIsResending] = useState(false);
  
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Redirect if not requiring verification or if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
      return;
    }
    
    if (!requiresVerification || !pendingVerificationEmail) {
      navigate('/auth/login', { replace: true });
      return;
    }
  }, [isAuthenticated, requiresVerification, pendingVerificationEmail, navigate]);

  // Clear errors on component mount
  useEffect(() => {
    clearError();
  }, [clearError]);

  // Handle resend cooldown
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
    // Explicitly return undefined when no cleanup is needed
    return undefined;
  }, [resendCooldown]);

  const handleOtpChange = (index: number, value: string) => {
    // Allow only digits
    if (!/^\d?$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all fields are filled
    if (newOtp.every(digit => digit !== '') && newOtp.join('').length === 6) {
      handleSubmit(newOtp.join(''));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    // Handle backspace
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    
    // Handle paste
    if (e.key === 'v' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      navigator.clipboard.readText().then(text => {
        const digits = text.replace(/\D/g, '').slice(0, 6);
        const newOtp = [...otp];
        for (let i = 0; i < digits.length && i < 6; i++) {
          newOtp[i] = digits[i];
        }
        setOtp(newOtp);
        
        // Focus next empty field or last field
        const nextIndex = Math.min(digits.length, 5);
        inputRefs.current[nextIndex]?.focus();
        
        // Auto-submit if complete
        if (digits.length === 6) {
          handleSubmit(digits);
        }
      }).catch(() => {
        // Handle clipboard read error silently
        toast.error('Could not read from clipboard');
      });
    }
  };

  const handleSubmit = async (otpCode?: string) => {
    const code = otpCode || otp.join('');
    
    if (code.length !== 6) {
      toast.error('Please enter a 6-digit OTP');
      return;
    }

    if (!pendingVerificationEmail) {
      toast.error('Email address not found. Please try logging in again.');
      navigate('/auth/login');
      return;
    }

    try {
      clearError();
      await verifyEmail({
        email: pendingVerificationEmail,
        otp: code
      });
    } catch (error: unknown) {
      console.error('OTP verification error:', error);
      // Reset OTP on error
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    }
  };

  const handleResendOTP = async () => {
    if (!pendingVerificationEmail) {
      toast.error('Email address not found. Please try logging in again.');
      navigate('/auth/login');
      return;
    }

    try {
      setIsResending(true);
      await resendOTP(pendingVerificationEmail, 'email_verification');
      setResendCooldown(30); // 30 second cooldown
      
      // Reset OTP fields
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } catch (error: unknown) {
      console.error('Resend OTP error:', error);
    } finally {
      setIsResending(false);
    }
  };

  // Helper function to handle input ref assignment
  const handleInputRef = (index: number): ((el: HTMLInputElement | null) => void) => {
    return (el: HTMLInputElement | null) => {
      inputRefs.current[index] = el;
    };
  };

  if (!requiresVerification || !pendingVerificationEmail) {
    return null; // Will redirect via useEffect
  }

  const maskEmail = (email: string) => {
    const [local, domain] = email.split('@');
    const maskedLocal = local.substring(0, 2) + '*'.repeat(local.length - 2);
    return `${maskedLocal}@${domain}`;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center w-16 h-16 bg-primary-100 rounded-full mb-4">
            <Mail className="w-8 h-8 text-primary-600" />
          </div>
          <h2 className="text-3xl font-bold text-secondary-900">
            Verify your email
          </h2>
          <p className="mt-2 text-sm text-secondary-600">
            We've sent a 6-digit code to
          </p>
          <p className="text-sm font-medium text-secondary-900">
            {maskEmail(pendingVerificationEmail)}
          </p>
        </div>

        {/* OTP Form */}
        <Card padding="lg">
          <div className="space-y-6">
            {/* Error Display */}
            {error && (
              <div className="bg-danger-50 border border-danger-200 rounded-lg p-4">
                <p className="text-sm text-danger-700">{error}</p>
              </div>
            )}

            {/* OTP Input */}
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-4 text-center">
                Enter the 6-digit code
              </label>
              <div className="flex justify-center gap-3">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={handleInputRef(index)}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    className="w-12 h-12 text-center text-lg font-semibold border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                    disabled={isLoading}
                  />
                ))}
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="button"
              variant="primary"
              size="lg"
              fullWidth
              loading={isLoading}
              disabled={isLoading || otp.some(digit => digit === '')}
              onClick={() => handleSubmit()}
            >
              {isLoading ? 'Verifying...' : 'Verify Email'}
            </Button>

            {/* Resend OTP */}
            <div className="text-center">
              <p className="text-sm text-secondary-600 mb-2">
                Didn't receive the code?
              </p>
              {resendCooldown > 0 ? (
                <p className="text-sm text-secondary-500">
                  Resend available in {resendCooldown} seconds
                </p>
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  leftIcon={<RotateCcw className="w-4 h-4" />}
                  onClick={handleResendOTP}
                  loading={isResending}
                  disabled={isResending}
                >
                  {isResending ? 'Sending...' : 'Resend Code'}
                </Button>
              )}
            </div>
          </div>
        </Card>

        {/* Back to Login */}
        <div className="text-center">
          <Link
            to="/auth/login"
            className="text-sm text-primary-600 hover:text-primary-500 transition-colors"
          >
            ← Back to login
          </Link>
        </div>

        {/* Footer */}
        <div className="text-center text-xs text-secondary-500">
          <p>
            Having trouble? Contact our{' '}
            <a href="#" className="text-primary-600 hover:text-primary-500">
              support team
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmailPage;