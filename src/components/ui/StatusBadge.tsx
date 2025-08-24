import React from 'react';
import { clsx } from 'clsx';
import { StatusBadgeProps, StructureStatus, HealthStatus, Priority, UserRole } from '@/types';

const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  size = 'md'
}) => {
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-xs',
    lg: 'px-3 py-1.5 text-sm'
  };

  const getStatusConfig = (status: string) => {
    // Structure Status Colors
    const structureStatusMap: Record<StructureStatus, { bg: string; text: string; label: string }> = {
      'draft': { bg: 'bg-secondary-100', text: 'text-secondary-800', label: 'Draft' },
      'location_completed': { bg: 'bg-primary-100', text: 'text-primary-800', label: 'Location Set' },
      'admin_completed': { bg: 'bg-primary-100', text: 'text-primary-800', label: 'Admin Complete' },
      'geometric_completed': { bg: 'bg-primary-100', text: 'text-primary-800', label: 'Geometric Set' },
      'ratings_in_progress': { bg: 'bg-warning-100', text: 'text-warning-800', label: 'In Progress' },
      'flat_ratings_completed': { bg: 'bg-success-100', text: 'text-success-800', label: 'Ratings Complete' },
      'submitted': { bg: 'bg-primary-100', text: 'text-primary-800', label: 'Submitted' },
      'approved': { bg: 'bg-success-100', text: 'text-success-800', label: 'Approved' },
      'requires_inspection': { bg: 'bg-warning-100', text: 'text-warning-800', label: 'Requires Inspection' },
      'maintenance_needed': { bg: 'bg-danger-100', text: 'text-danger-800', label: 'Maintenance Needed' }
    };

    // Health Status Colors
    const healthStatusMap: Record<HealthStatus, { bg: string; text: string; label: string }> = {
      'Good': { bg: 'bg-success-100', text: 'text-success-800', label: 'Good' },
      'Fair': { bg: 'bg-warning-100', text: 'text-warning-800', label: 'Fair' },
      'Poor': { bg: 'bg-warning-100', text: 'text-warning-800', label: 'Poor' },
      'Critical': { bg: 'bg-danger-100', text: 'text-danger-800', label: 'Critical' }
    };

    // Priority Colors
    const priorityMap: Record<Priority, { bg: string; text: string; label: string }> = {
      'Low': { bg: 'bg-success-100', text: 'text-success-800', label: 'Low Priority' },
      'Medium': { bg: 'bg-warning-100', text: 'text-warning-800', label: 'Medium Priority' },
      'High': { bg: 'bg-warning-100', text: 'text-warning-800', label: 'High Priority' },
      'Critical': { bg: 'bg-danger-100', text: 'text-danger-800', label: 'Critical Priority' }
    };

    // User Role Colors
    const userRoleMap: Record<UserRole, { bg: string; text: string; label: string }> = {
      'AD': { bg: 'bg-primary-100', text: 'text-primary-800', label: 'Admin' },
      'TE': { bg: 'bg-secondary-100', text: 'text-secondary-800', label: 'Technical Engineer' },
      'VE': { bg: 'bg-success-100', text: 'text-success-800', label: 'Verification Engineer' },
      'FE': { bg: 'bg-warning-100', text: 'text-warning-800', label: 'Field Engineer' }
    };

    // Try to find in each map
    if (status in structureStatusMap) {
      return structureStatusMap[status as StructureStatus];
    }
    if (status in healthStatusMap) {
      return healthStatusMap[status as HealthStatus];
    }
    if (status in priorityMap) {
      return priorityMap[status as Priority];
    }
    if (status in userRoleMap) {
      return userRoleMap[status as UserRole];
    }

    // Default fallback
    return {
      bg: 'bg-secondary-100',
      text: 'text-secondary-800',
      label: status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
    };
  };

  const config = getStatusConfig(status);

  return (
    <span
      className={clsx(
        'inline-flex items-center font-medium rounded-full',
        sizeClasses[size],
        config.bg,
        config.text
      )}
    >
      {config.label}
    </span>
  );
};

export default StatusBadge;