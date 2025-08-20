import React from 'react';
import {
  BuildingOfficeIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';

interface DashboardStatsProps {
  summary?: {
    total_structures: number;
    by_status: Record<string, number>;
  };
}

export const DashboardStats: React.FC<DashboardStatsProps> = ({ summary }) => {
  if (!summary) return null;

  const stats = [
    {
      label: 'Total Structures',
      value: summary.total_structures,
      icon: BuildingOfficeIcon, // ✅ Now properly imported
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      label: 'Approved',
      value: summary.by_status.approved || 0,
      icon: CheckCircleIcon,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      label: 'Submitted',
      value: summary.by_status.submitted || 0,
      icon: ClockIcon,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
    },
    {
      label: 'In Progress',
      value: (summary.by_status.draft || 0) + (summary.by_status.ratings_in_progress || 0),
      icon: ExclamationTriangleIcon,
      color: 'text-gray-600',
      bgColor: 'bg-gray-50',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <div key={stat.label} className="card p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{stat.label}</p>
                <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
              </div>
              <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                <Icon className={`h-6 w-6 ${stat.color}`} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};