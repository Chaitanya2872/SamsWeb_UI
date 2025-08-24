import React, { ReactNode } from 'react';
import { clsx } from 'clsx';

interface CardProps {
  children: ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  shadow?: 'none' | 'sm' | 'md' | 'lg';
  hover?: boolean;
  clickable?: boolean;
  onClick?: () => void;
}

const Card: React.FC<CardProps> = ({
  children,
  className,
  padding = 'md',
  shadow = 'sm',
  hover = false,
  clickable = false,
  onClick
}) => {
  const paddingClasses = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8'
  };

  const shadowClasses = {
    none: '',
    sm: 'shadow-soft',
    md: 'shadow-medium',
    lg: 'shadow-large'
  };

  const classes = clsx(
    'bg-white rounded-xl border border-secondary-200',
    paddingClasses[padding],
    shadowClasses[shadow],
    hover && 'transition-all duration-200 hover:shadow-medium hover:-translate-y-0.5',
    clickable && 'cursor-pointer select-none',
    className
  );

  const Component = clickable || onClick ? 'button' : 'div';

  return (
    <Component
      className={classes}
      onClick={onClick}
      type={Component === 'button' ? 'button' : undefined}
    >
      {children}
    </Component>
  );
};

export default Card;