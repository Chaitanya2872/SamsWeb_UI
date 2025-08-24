import React, { ReactNode } from 'react';
import { FileX, Search, Users, Building2 } from 'lucide-react';
import Button from './Button';

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  type?: 'default' | 'search' | 'users' | 'structures';
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  icon,
  type = 'default',
  action,
  className = ''
}) => {
  const getDefaultIcon = () => {
    switch (type) {
      case 'search':
        return <Search className="w-12 h-12 text-secondary-400" />;
      case 'users':
        return <Users className="w-12 h-12 text-secondary-400" />;
      case 'structures':
        return <Building2 className="w-12 h-12 text-secondary-400" />;
      default:
        return <FileX className="w-12 h-12 text-secondary-400" />;
    }
  };

  return (
    <div className={`flex flex-col items-center justify-center py-12 px-4 text-center ${className}`}>
      <div className="mb-4">
        {icon || getDefaultIcon()}
      </div>
      
      <h3 className="text-lg font-medium text-secondary-900 mb-2">
        {title}
      </h3>
      
      {description && (
        <p className="text-secondary-500 max-w-md mb-6">
          {description}
        </p>
      )}
      
      {action && (
        <Button
          variant="primary"
          onClick={action.onClick}
        >
          {action.label}
        </Button>
      )}
    </div>
  );
};

export default EmptyState;