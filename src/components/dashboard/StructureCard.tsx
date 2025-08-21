import React from 'react';
import { format } from 'date-fns';
import { 
  BuildingOfficeIcon, 
  MapPinIcon, 
  CalendarIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { Badge } from '../common/Badge';
import type { Structure } from '../../types/structure';
import structuresService from '../../services/structures';

interface StructureCardProps {
  structure: Structure;
  onClick: () => void;
}

export const StructureCard: React.FC<StructureCardProps> = ({ structure, onClick }) => {
  const completionPercentage = structuresService.calculateCompletionPercentage(structure);

  const getStatusIcon = () => {
    switch (structure.status) {
      case 'approved':
        return <CheckCircleIcon className="h-4 w-4 text-green-600" />;
      case 'submitted':
        return <ClockIcon className="h-4 w-4 text-blue-600" />;
      case 'draft':
      case 'ratings_in_progress':
        return <ExclamationTriangleIcon className="h-4 w-4 text-amber-600" />;
      default:
        return <BuildingOfficeIcon className="h-4 w-4 text-gray-600" />;
    }
  };

  return (
    <div 
      className="card p-4 hover:shadow-md transition cursor-pointer"
      onClick={onClick}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            {getStatusIcon()}
            <h3 className="font-semibold text-gray-900 truncate">
              {structure.structural_identity?.structural_identity_number || structure.structural_identity?.uid}
            </h3>
          </div>
          {structure.administration?.client_name && (
            <p className="text-sm text-gray-600 truncate">
              {structure.administration.client_name}
            </p>
          )}
        </div>
        
        <Badge
          variant={
            structure.status === 'approved' ? 'green' :
            structure.status === 'submitted' ? 'blue' :
            structure.status === 'draft' ? 'gray' : 'amber'
          }
        >
          {structuresService.formatStatusText(structure.status)}
        </Badge>
      </div>

      {/* Location */}
      {structure.structural_identity?.city_name && (
        <div className="flex items-center gap-2 mb-2">
          <MapPinIcon className="h-4 w-4 text-gray-400" />
          <span className="text-sm text-gray-600">
            {structure.structural_identity.city_name}
            {structure.structural_identity.state_code && 
              `, ${structure.structural_identity.state_code}`
            }
          </span>
        </div>
      )}

      {/* Building Details */}
      <div className="grid grid-cols-4 gap-3 mb-3 text-sm">
        <div>
          <span className="text-gray-500">Type:</span>
          <div className="font-medium text-gray-900 capitalize">
            {structure.structural_identity?.type_of_structure || 'N/A'}
          </div>
        </div>
        
        <div>
          <span className="text-gray-500">Floors:</span>
          <div className="font-medium text-gray-900">
            {structure.geometric_details?.number_of_floors || 'N/A'}
          </div>
        </div>

        {structure.statistics && (
          <>
            <div>
              <span className="text-gray-500">Flats:</span>
              <div className="font-medium text-gray-900">
                {structure.statistics.total_flats}
              </div>
            </div>
            
            <div>
              <span className="text-gray-500">Rated:</span>
              <div className="font-medium text-gray-900">
                {structure.statistics.rated_flats}/{structure.statistics.total_flats}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Health Status */}
      {structure.health_summary?.overall_health_score && (
        <div className="mb-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm text-gray-500">Health Score:</span>
            <Badge variant={
              structure.health_summary.overall_health_score >= 4 ? 'green' :
              structure.health_summary.overall_health_score >= 3 ? 'amber' : 'red'
            }>
              {structure.health_summary.overall_health_score.toFixed(1)}/5.0
            </Badge>
          </div>
        </div>
      )}

      {/* Progress Bar */}
      <div className="mb-3">
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm text-gray-500">Completion:</span>
          <span className="text-sm font-medium text-gray-900">{completionPercentage}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className={`h-2 rounded-full transition-all duration-300 ${
              completionPercentage === 100 ? 'bg-green-500' :
              completionPercentage >= 70 ? 'bg-blue-500' :
              completionPercentage >= 40 ? 'bg-amber-500' : 'bg-gray-400'
            }`}
            style={{ width: `${completionPercentage}%` }}
          />
        </div>
      </div>

      {/* Issues Alert */}
      {structure.statistics && structure.statistics.critical_issues > 0 && (
        <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded-md">
          <div className="flex items-center gap-2">
            <ExclamationTriangleIcon className="h-4 w-4 text-red-600" />
            <span className="text-sm text-red-700">
              {structure.statistics.critical_issues} critical issue(s)
            </span>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t border-gray-100">
        <div className="flex items-center gap-1">
          <CalendarIcon className="h-3 w-3" />
          <span>
            Updated {format(new Date(structure.creation_info.last_updated_date), 'MMM dd')}
          </span>
        </div>
        
        {structure.remarks && (
          <div className="flex items-center gap-1">
            <span>
              {(structure.remarks.fe_remarks?.length || 0) + (structure.remarks.ve_remarks?.length || 0)} remarks
            </span>
          </div>
        )}
      </div>
    </div>
  );
};