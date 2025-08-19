// src/components/modals/StructureDetailModal.tsx
import React, { useState } from 'react';
import { format } from 'date-fns';
import {
  BuildingOfficeIcon,
  MapPinIcon,
  UserIcon,
  PhoneIcon,
  EnvelopeIcon,
  CalendarIcon,
  ChatBubbleLeftRightIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
} from '@heroicons/react/24/outline';
import { Modal } from '../common/Modal';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { RemarksModal } from './RemarksModal';
import { useStructure } from '../../hooks/useStructures';
import { useCanManageRemarks } from '../../hooks/useAuth';
import type { Structure } from '../../types/structure';
import structuresService from '../../services/structures';

interface StructureDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  structureId: string | null;
}

export const StructureDetailModal: React.FC<StructureDetailModalProps> = ({
  isOpen,
  onClose,
  structureId,
}) => {
  const { structure, isLoading, error } = useStructure(structureId);
  const canManageRemarks = useCanManageRemarks();
  const [remarksModalOpen, setRemarksModalOpen] = useState(false);

  if (!isOpen || !structureId) return null;

  const handleRemarksClick = () => {
    setRemarksModalOpen(true);
  };

  const getHealthStatusColor = (score?: number) => {
    if (!score) return 'gray';
    if (score >= 4) return 'green';
    if (score >= 3) return 'amber';
    return 'red';
  };

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'Low': return 'green';
      case 'Medium': return 'amber';
      case 'High': return 'red';
      case 'Critical': return 'red';
      default: return 'gray';
    }
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="Structure Details"
        size="xl"
      >
        {isLoading && (
          <div className="flex justify-center py-8">
            <LoadingSpinner size="lg" />
          </div>
        )}

        {error && (
          <div className="text-center py-8">
            <ExclamationTriangleIcon className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={onClose} variant="secondary">
              Close
            </Button>
          </div>
        )}

        {structure && (
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  {structure.structural_identity?.structural_identity_number || 
                   structure.structural_identity?.uid}
                </h2>
                <div className="flex items-center gap-4">
                  <Badge
                    variant={
                      structure.status === 'approved' ? 'green' :
                      structure.status === 'submitted' ? 'blue' :
                      structure.status === 'draft' ? 'gray' : 'amber'
                    }
                  >
                    {structuresService.formatStatusText(structure.status)}
                  </Badge>
                  
                  {structure.health_summary?.overall_health_score && (
                    <Badge variant={getHealthStatusColor(structure.health_summary.overall_health_score)}>
                      Health: {structure.health_summary.overall_health_score.toFixed(1)}/5.0
                    </Badge>
                  )}
                </div>
              </div>

              {canManageRemarks && (
                <Button
                  onClick={handleRemarksClick}
                  variant="outline"
                  size="sm"
                  leftIcon={<ChatBubbleLeftRightIcon className="h-4 w-4" />}
                >
                  Remarks ({
                    (structure.remarks?.fe_remarks?.length || 0) + 
                    (structure.remarks?.ve_remarks?.length || 0)
                  })
                </Button>
              )}
            </div>

            {/* Quick Stats */}
            {structure.statistics && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="text-center">
                  <div className="text-2xl font-semibold text-gray-900">
                    {structure.statistics.total_floors}
                  </div>
                  <div className="text-sm text-gray-600">Floors</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-semibold text-gray-900">
                    {structure.statistics.total_flats}
                  </div>
                  <div className="text-sm text-gray-600">Flats</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-semibold text-gray-900">
                    {structure.statistics.rated_flats}
                  </div>
                  <div className="text-sm text-gray-600">Rated</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-semibold text-gray-900">
                    {structure.statistics.critical_issues}
                  </div>
                  <div className="text-sm text-gray-600">Issues</div>
                </div>
              </div>
            )}

            {/* Alerts */}
            {structure.statistics && structure.statistics.critical_issues > 0 && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <ExclamationTriangleIcon className="h-5 w-5 text-red-600" />
                  <span className="font-medium text-red-900">
                    {structure.statistics.critical_issues} Critical Issues Found
                  </span>
                </div>
                <p className="mt-1 text-sm text-red-700">
                  This structure requires immediate attention and maintenance.
                </p>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Structural Identity */}
              <div className="card p-4">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <BuildingOfficeIcon className="h-5 w-5" />
                  Structural Identity
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">UID:</span>
                    <span className="font-medium">{structure.structural_identity?.uid}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Type:</span>
                    <span className="font-medium capitalize">
                      {structure.structural_identity?.type_of_structure}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Zip Code:</span>
                    <span className="font-medium">{structure.structural_identity?.zip_code || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">State:</span>
                    <span className="font-medium">{structure.structural_identity?.state_code || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">District:</span>
                    <span className="font-medium">{structure.structural_identity?.district_code || 'N/A'}</span>
                  </div>
                </div>
              </div>

              {/* Location */}
              <div className="card p-4">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <MapPinIcon className="h-5 w-5" />
                  Location
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">City:</span>
                    <span className="font-medium">{structure.structural_identity?.city_name || 'N/A'}</span>
                  </div>
                  {structure.location?.coordinates?.latitude && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Coordinates:</span>
                      <span className="font-medium">
                        {structure.location.coordinates.latitude.toFixed(6)}, {structure.location.coordinates.longitude?.toFixed(6)}
                      </span>
                    </div>
                  )}
                  {structure.location?.address && (
                    <div>
                      <span className="text-gray-600">Address:</span>
                      <div className="font-medium mt-1">{structure.location.address}</div>
                    </div>
                  )}
                </div>
              </div>

              {/* Administration */}
              <div className="card p-4">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <UserIcon className="h-5 w-5" />
                  Administration
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Client:</span>
                    <span className="font-medium">{structure.administration?.client_name || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Custodian:</span>
                    <span className="font-medium">{structure.administration?.custodian || 'N/A'}</span>
                  </div>
                  {structure.administration?.contact_details && (
                    <div className="flex items-center gap-2">
                      <PhoneIcon className="h-4 w-4 text-gray-400" />
                      <span className="font-medium">{structure.administration.contact_details}</span>
                    </div>
                  )}
                  {structure.administration?.email_id && (
                    <div className="flex items-center gap-2">
                      <EnvelopeIcon className="h-4 w-4 text-gray-400" />
                      <span className="font-medium">{structure.administration.email_id}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Geometric Details */}
              <div className="card p-4">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <InformationCircleIcon className="h-5 w-5" />
                  Geometric Details
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Floors:</span>
                    <span className="font-medium">{structure.geometric_details?.number_of_floors || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Height:</span>
                    <span className="font-medium">
                      {structure.geometric_details?.structure_height ? 
                        `${structure.geometric_details.structure_height}m` : 'N/A'
                      }
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Width:</span>
                    <span className="font-medium">
                      {structure.geometric_details?.structure_width ? 
                        `${structure.geometric_details.structure_width}m` : 'N/A'
                      }
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Length:</span>
                    <span className="font-medium">
                      {structure.geometric_details?.structure_length ? 
                        `${structure.geometric_details.structure_length}m` : 'N/A'
                      }
                    </span>
                  </div>
                  {structure.geometric_details?.structure_width && structure.geometric_details?.structure_length && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Area:</span>
                      <span className="font-medium">
                        {(structure.geometric_details.structure_width * structure.geometric_details.structure_length).toFixed(2)}m²
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Health Summary */}
            {structure.health_summary && (
              <div className="card p-4">
                <h3 className="font-semibold text-gray-900 mb-3">Health Summary</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {structure.health_summary.structural_health && (
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <div className="text-lg font-semibold text-gray-900">
                        {structure.health_summary.structural_health.toFixed(1)}/5.0
                      </div>
                      <div className="text-sm text-gray-600">Structural Health</div>
                    </div>
                  )}
                  {structure.health_summary.non_structural_health && (
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <div className="text-lg font-semibold text-gray-900">
                        {structure.health_summary.non_structural_health.toFixed(1)}/5.0
                      </div>
                      <div className="text-sm text-gray-600">Non-Structural Health</div>
                    </div>
                  )}
                  {structure.health_summary.priority_level && (
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <div>
                        <Badge variant={getPriorityColor(structure.health_summary.priority_level)}>
                          {structure.health_summary.priority_level}
                        </Badge>
                      </div>
                      <div className="text-sm text-gray-600 mt-1">Priority Level</div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Timestamps */}
            <div className="card p-4">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <CalendarIcon className="h-5 w-5" />
                Timeline
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Created:</span>
                  <span className="font-medium">
                    {format(new Date(structure.creation_info.created_date), 'MMM dd, yyyy HH:mm')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Last Updated:</span>
                  <span className="font-medium">
                    {format(new Date(structure.creation_info.last_updated_date), 'MMM dd, yyyy HH:mm')}
                  </span>
                </div>
                {structure.health_summary?.last_assessment_date && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Last Assessment:</span>
                    <span className="font-medium">
                      {format(new Date(structure.health_summary.last_assessment_date), 'MMM dd, yyyy')}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* General Notes */}
            {structure.general_notes && (
              <div className="card p-4">
                <h3 className="font-semibold text-gray-900 mb-3">General Notes</h3>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">
                  {structure.general_notes}
                </p>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Remarks Modal */}
      <RemarksModal
        isOpen={remarksModalOpen}
        onClose={() => setRemarksModalOpen(false)}
        structureId={structureId}
      />
    </>
  );
};