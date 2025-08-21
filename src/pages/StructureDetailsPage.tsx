import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { 
  BuildingOfficeIcon, 
  MapPinIcon, 
  CalendarIcon,
  PencilIcon
} from '@heroicons/react/24/outline';
import { useStructure } from '../hooks/useStructures';
import { useNavigation } from '../hooks/useNavigation';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { Button } from '../components/common/Button';
import { BackButton } from '../components/common/BackButton';
import { NavigationBreadcrumbs } from '../components/common/NavigationBreadcrumbs';
import { Badge } from '../components/common/Badge';

export const StructureDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { setError } = useNavigation();
  
  const {
    structure,
    isLoading,
    error,
    fetchStructure,
  } = useStructure(id || null);

  useEffect(() => {
    if (error) {
      setError(error);
    }
  }, [error, setError]);

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !structure) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 mb-4">
          <p className="text-lg font-medium">Error loading structure</p>
          <p className="text-sm">{error || 'Structure not found'}</p>
        </div>
        <div className="space-x-4">
          <BackButton />
          <Button onClick={() => fetchStructure()} variant="primary">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  const breadcrumbs = [
    { label: 'Structures', href: '/structures' },
    { 
      label: structure.structural_identity?.structural_identity_number || 'Structure Details', 
      current: true 
    }
  ];

  return (
    <div className="space-y-6">
      {/* Breadcrumbs */}
      <NavigationBreadcrumbs items={breadcrumbs} />

      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <BackButton />
            <BuildingOfficeIcon className="h-6 w-6 text-gray-400" />
            <h1 className="text-2xl font-bold text-gray-900">
              {structure.structural_identity?.structural_identity_number || 
               structure.structural_identity?.uid}
            </h1>
          </div>
          {structure.administration?.client_name && (
            <p className="text-gray-600">{structure.administration.client_name}</p>
          )}
        </div>
        <div className="flex items-center gap-3">
          <Badge variant={structure.status === 'approved' ? 'green' : 'blue'}>
            {structure.status?.replace('_', ' ')}
          </Badge>
          <Button
            variant="primary"
            leftIcon={<PencilIcon className="h-4 w-4" />}
          >
            Edit Structure
          </Button>
        </div>
      </div>

      {/* Structure Info Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Basic Information */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h2>
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-gray-500">Structure Type</label>
              <p className="text-gray-900 capitalize">
                {structure.structural_identity?.type_of_structure}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Status</label>
              <p className="text-gray-900 capitalize">
                {structure.status?.replace('_', ' ')}
              </p>
            </div>
            {structure.geometric_details && (
              <>
                <div>
                  <label className="text-sm font-medium text-gray-500">Floors</label>
                  <p className="text-gray-900">
                    {structure.geometric_details.number_of_floors}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Dimensions</label>
                  <p className="text-gray-900">
                    {structure.geometric_details.structure_width}m × {' '}
                    {structure.geometric_details.structure_length}m × {' '}
                    {structure.geometric_details.structure_height}m
                  </p>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Location Information */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
            <MapPinIcon className="h-5 w-5 text-gray-400" />
            Location
          </h2>
          <div className="space-y-3">
            {structure.structural_identity?.city_name && (
              <div>
                <label className="text-sm font-medium text-gray-500">City</label>
                <p className="text-gray-900">{structure.structural_identity.city_name}</p>
              </div>
            )}
            {structure.structural_identity?.state_code && (
              <div>
                <label className="text-sm font-medium text-gray-500">State</label>
                <p className="text-gray-900">{structure.structural_identity.state_code}</p>
              </div>
            )}
            {structure.location?.address && (
              <div>
                <label className="text-sm font-medium text-gray-500">Address</label>
                <p className="text-gray-900">{structure.location.address}</p>
              </div>
            )}
            {structure.location?.coordinates?.latitude && (
              <div>
                <label className="text-sm font-medium text-gray-500">Coordinates</label>
                {structure.location.coordinates.latitude && structure.location.coordinates.longitude && (
                  <p className="text-gray-900">
                    {structure.location.coordinates.latitude.toFixed(6)}, {' '}
                    {structure.location.coordinates.longitude.toFixed(6)}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Administration Information */}
      {structure.administration && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Administration</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {structure.administration.client_name && (
              <div>
                <label className="text-sm font-medium text-gray-500">Client Name</label>
                <p className="text-gray-900">{structure.administration.client_name}</p>
              </div>
            )}
            {structure.administration.custodian && (
              <div>
                <label className="text-sm font-medium text-gray-500">Custodian</label>
                <p className="text-gray-900">{structure.administration.custodian}</p>
              </div>
            )}
            {structure.administration.engineer_designation && (
              <div>
                <label className="text-sm font-medium text-gray-500">Engineer</label>
                <p className="text-gray-900">{structure.administration.engineer_designation}</p>
              </div>
            )}
            {structure.administration.contact_details && (
              <div>
                <label className="text-sm font-medium text-gray-500">Contact</label>
                <p className="text-gray-900">{structure.administration.contact_details}</p>
              </div>
            )}
            {structure.administration.email_id && (
              <div>
                <label className="text-sm font-medium text-gray-500">Email</label>
                <p className="text-gray-900">{structure.administration.email_id}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Health Summary */}
      {structure.health_summary && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Health Summary</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {structure.health_summary.overall_health_score && (
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {structure.health_summary.overall_health_score.toFixed(1)}/5.0
                </div>
                <div className="text-sm text-gray-500">Overall Score</div>
              </div>
            )}
            {structure.health_summary.structural_health && (
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {structure.health_summary.structural_health.toFixed(1)}/5.0
                </div>
                <div className="text-sm text-gray-500">Structural Health</div>
              </div>
            )}
            {structure.health_summary.non_structural_health && (
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-amber-600">
                  {structure.health_summary.non_structural_health.toFixed(1)}/5.0
                </div>
                <div className="text-sm text-gray-500">Non-Structural Health</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Statistics */}
      {structure.statistics && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Statistics</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-xl font-semibold text-gray-900">
                {structure.statistics.total_floors}
              </div>
              <div className="text-sm text-gray-500">Total Floors</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-semibold text-gray-900">
                {structure.statistics.total_flats}
              </div>
              <div className="text-sm text-gray-500">Total Flats</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-semibold text-gray-900">
                {structure.statistics.rated_flats}
              </div>
              <div className="text-sm text-gray-500">Rated Flats</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-semibold text-red-600">
                {structure.statistics.critical_issues}
              </div>
              <div className="text-sm text-gray-500">Critical Issues</div>
            </div>
          </div>
        </div>
      )}

      {/* Creation Info */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
          <CalendarIcon className="h-5 w-5 text-gray-400" />
          Timeline
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-500">Created</label>
            <p className="text-gray-900">
              {new Date(structure.creation_info.created_date).toLocaleDateString()}
            </p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Last Updated</label>
            <p className="text-gray-900">
              {new Date(structure.creation_info.last_updated_date).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};