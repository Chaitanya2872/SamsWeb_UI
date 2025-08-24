import React from 'react';
import { clsx } from 'clsx';

interface AvatarProps {
  name?: string;
  src?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  alt?: string;
}

const Avatar: React.FC<AvatarProps> = ({
  name = '',
  src,
  size = 'md',
  className,
  alt
}) => {
  const sizeClasses = {
    xs: 'w-6 h-6 text-xs',
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-12 h-12 text-lg',
    xl: 'w-16 h-16 text-xl'
  };

  const getInitials = (name: string): string => {
    if (!name.trim()) return '?';
    
    const words = name.trim().split(/\s+/);
    if (words.length === 1) {
      return words[0].charAt(0).toUpperCase();
    }
    
    return (words[0].charAt(0) + words[words.length - 1].charAt(0)).toUpperCase();
  };

  const getBackgroundColor = (name: string): string => {
    const colors = [
      'bg-red-500',
      'bg-orange-500', 
      'bg-amber-500',
      'bg-yellow-500',
      'bg-lime-500',
      'bg-green-500',
      'bg-emerald-500',
      'bg-teal-500',
      'bg-cyan-500',
      'bg-sky-500',
      'bg-blue-500',
      'bg-indigo-500',
      'bg-violet-500',
      'bg-purple-500',
      'bg-fuchsia-500',
      'bg-pink-500',
      'bg-rose-500'
    ];
    
    if (!name.trim()) return 'bg-secondary-500';
    
    const charSum = name.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
    return colors[charSum % colors.length];
  };

  const classes = clsx(
    'inline-flex items-center justify-center rounded-full flex-shrink-0 font-medium text-white',
    sizeClasses[size],
    !src && getBackgroundColor(name),
    className
  );

  if (src) {
    return (
      <img
        src={src}
        alt={alt || name}
        className={clsx(classes, 'object-cover')}
        onError={(e) => {
          // Fallback to initials if image fails to load
          const target = e.target as HTMLImageElement;
          target.style.display = 'none';
          
          const fallback = document.createElement('div');
          fallback.className = classes;
          fallback.textContent = getInitials(name);
          target.parentNode?.replaceChild(fallback, target);
        }}
      />
    );
  }

  return (
    <div className={classes}>
      {getInitials(name)}
    </div>
  );
};

export default Avatar;