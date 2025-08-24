import React, { ButtonHTMLAttributes, ReactNode } from 'react';
import { clsx } from 'clsx';
import LoadingSpinner from './LoadingSpinner';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success' | 'warning';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  loading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  fullWidth?: boolean;
  children: ReactNode;
}

const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  disabled,
  className,
  children,
  ...props
}) => {
  const baseClasses = `
    inline-flex items-center justify-center
    font-medium rounded-lg
    transition-all duration-200
    focus:outline-none focus:ring-2 focus:ring-offset-2
    disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none
  `;

  const variantClasses = {
    primary: `
      bg-primary-600 text-white border border-transparent
      hover:bg-primary-700 focus:ring-primary-500
      shadow-sm hover:shadow-md
    `,
    secondary: `
      bg-secondary-100 text-secondary-900 border border-secondary-200
      hover:bg-secondary-200 hover:border-secondary-300 focus:ring-secondary-500
      shadow-sm
    `,
    outline: `
      bg-white text-secondary-700 border border-secondary-300
      hover:bg-secondary-50 hover:border-secondary-400 focus:ring-secondary-500
      shadow-sm
    `,
    ghost: `
      bg-transparent text-secondary-700 border border-transparent
      hover:bg-secondary-100 focus:ring-secondary-500
    `,
    danger: `
      bg-danger-600 text-white border border-transparent
      hover:bg-danger-700 focus:ring-danger-500
      shadow-sm hover:shadow-md
    `,
    success: `
      bg-success-600 text-white border border-transparent
      hover:bg-success-700 focus:ring-success-500
      shadow-sm hover:shadow-md
    `,
    warning: `
      bg-warning-600 text-white border border-transparent
      hover:bg-warning-700 focus:ring-warning-500
      shadow-sm hover:shadow-md
    `
  };

  const sizeClasses = {
    xs: 'px-2.5 py-1.5 text-xs gap-1',
    sm: 'px-3 py-2 text-sm gap-1.5',
    md: 'px-4 py-2.5 text-sm gap-2',
    lg: 'px-5 py-3 text-base gap-2',
    xl: 'px-6 py-3.5 text-base gap-2.5'
  };

  const widthClass = fullWidth ? 'w-full' : '';

  const classes = clsx(
    baseClasses,
    variantClasses[variant],
    sizeClasses[size],
    widthClass,
    className
  );

  return (
    <button
      className={classes}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <LoadingSpinner 
          size={size === 'xs' || size === 'sm' ? 'sm' : 'md'} 
          className="text-current"
        />
      )}
      {!loading && leftIcon && (
        <span className="flex-shrink-0">
          {leftIcon}
        </span>
      )}
      <span className={loading ? 'opacity-0' : ''}>
        {children}
      </span>
      {!loading && rightIcon && (
        <span className="flex-shrink-0">
          {rightIcon}
        </span>
      )}
    </button>
  );
};

export default Button;