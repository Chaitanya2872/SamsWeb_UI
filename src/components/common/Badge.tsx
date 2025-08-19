import React from 'react';
import clsx from 'clsx';

interface BadgeProps {
  variant?: 'default' | 'green' | 'red' | 'amber' | 'blue' | 'gray';
  size?: 'sm' | 'md';
  children: React.ReactNode;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  variant = 'default',
  size = 'sm',
  children,
  className,
}) => {
  const baseClasses = 'badge inline-flex items-center font-medium rounded';
  
  const variantClasses = {
    default: 'bg-gray-100 text-gray-800',
    green: 'badge-green',
    red: 'badge-red',
    amber: 'badge-amber',
    blue: 'badge-blue',
    gray: 'bg-gray-100 text-gray-600',
  };

  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1 text-sm',
  };

  return (
    <span
      className={clsx(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
    >
      {children}
    </span>
  );
};

// src/components/common/Textarea.tsx
