import  { InputHTMLAttributes, ReactNode, forwardRef } from 'react';
import { clsx } from 'clsx';
import { AlertCircle } from 'lucide-react';

interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  required?: boolean;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({
    label,
    error,
    helperText,
    leftIcon,
    rightIcon,
    size = 'md',
    fullWidth = false,
    required = false,
    className,
    disabled,
    ...props
  }, ref) => {
    const hasError = !!error;
    
    const baseInputClasses = `
      block border rounded-lg
      transition-all duration-200
      focus:outline-none focus:ring-2 focus:ring-offset-0
      disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-secondary-50
      placeholder:text-secondary-400
    `;

    const sizeClasses = {
      sm: 'px-3 py-2 text-sm',
      md: 'px-4 py-2.5 text-sm',
      lg: 'px-4 py-3 text-base'
    };

    const inputClasses = clsx(
      baseInputClasses,
      sizeClasses[size],
      fullWidth ? 'w-full' : '',
      leftIcon ? (size === 'sm' ? 'pl-9' : size === 'lg' ? 'pl-12' : 'pl-10') : '',
      rightIcon || hasError ? (size === 'sm' ? 'pr-9' : size === 'lg' ? 'pr-12' : 'pr-10') : '',
      hasError
        ? 'border-danger-300 focus:border-danger-500 focus:ring-danger-500 text-danger-900'
        : 'border-secondary-300 focus:border-primary-500 focus:ring-primary-500 text-secondary-900',
      className
    );

    const iconSizeClasses = {
      sm: 'w-4 h-4',
      md: 'w-5 h-5',
      lg: 'w-5 h-5'
    };

    const leftIconPositionClasses = {
      sm: 'left-2.5 top-2',
      md: 'left-3 top-3',
      lg: 'left-3 top-3.5'
    };

    const rightIconPositionClasses = {
      sm: 'right-2.5 top-2',
      md: 'right-3 top-3',
      lg: 'right-3 top-3.5'
    };

    return (
      <div className={clsx('relative', fullWidth ? 'w-full' : '')}>
        {label && (
          <label className="block text-sm font-medium text-secondary-700 mb-2">
            {label}
            {required && <span className="text-danger-500 ml-1">*</span>}
          </label>
        )}
        
        <div className="relative">
          {leftIcon && (
            <div className={clsx(
              'absolute flex items-center text-secondary-400 pointer-events-none',
              iconSizeClasses[size],
              leftIconPositionClasses[size]
            )}>
              {leftIcon}
            </div>
          )}

          <input
            ref={ref}
            className={inputClasses}
            disabled={disabled}
            required={required}
            {...props}
          />

          {(rightIcon || hasError) && (
            <div className={clsx(
              'absolute flex items-center pointer-events-none',
              iconSizeClasses[size],
              rightIconPositionClasses[size],
              hasError ? 'text-danger-500' : 'text-secondary-400'
            )}>
              {hasError ? <AlertCircle /> : rightIcon}
            </div>
          )}
        </div>

        {(error || helperText) && (
          <div className="mt-2">
            {error && (
              <p className="text-sm text-danger-600 flex items-center gap-1">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {error}
              </p>
            )}
            {!error && helperText && (
              <p className="text-sm text-secondary-500">{helperText}</p>
            )}
          </div>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;