import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  Filter, 
  Eye,
  MapPin,
  Calendar,
  Download,
  AlertCircle
} from 'lucide-react';

import { apiClient } from '@/services/api';
import { Structure, StructureFilters } from '@/types';
import { 
  Modal, 
  Button, 
  Input, 
  Select, 
  Table, 
  StatusBadge,
  Card
} from '@/components/ui';
import { formatDate, formatNumber } from '@/utils/formatters';

interface StructureListModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const StructureListModal: React.FC<StructureListModalProps> = ({
  isOpen,
  onClose
}) => {
  const navigate = useNavigate();
  
  const [structures, setStructures] = useState<Structure[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<StructureFilters>({
    page: 1,
    limit: 20,
    search: '',
    status: undefined,
    type: undefined,
    sortBy: 'last_updated_date',
    sortOrder: 'desc'
  });
  
  const [pagination, setPagination] = useState({
    current_page: 1,
    total_pages: 1,
    total_items: 0,
    has_next_page: false,
    has_prev_page: false
  });

  const [showFilters, setShowFilters] = useState(false);

  const loadStructures = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiClient.getStructures(filters);
      
      if (response.success && response.data) {
        setStructures(response.data.structures || []);
        setPagination(response.data.pagination);
      }
    } catch (err: unknown) {
      console.error('Failed to load structures:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to load structures';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    if (isOpen) {
      loadStructures();
    }
  }, [isOpen, loadStructures]);

  const handleSearch = (searchTerm: string) => {
    setFilters(prev => ({
      ...prev,
      search: searchTerm,
      page: 1
    }));
  };

  const handleFilterChange = (key: keyof StructureFilters, value: string | number | undefined) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1
    }));
  };

  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }));
  };

  const handleViewStructure = (structure: Structure) => {
    navigate(`/structures/${structure.structure_id}`);
    onClose();
  };

  const handleExportCSV = async () => {
    try {
      const blob = await apiClient.exportStructuresCSV(filters);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `structures_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Export failed:', err);
      setError('Failed to export data');
    }
  };

  const columns = [
    {
      key: 'structural_identity_number',
      label: 'Structure ID',
      sortable: true,
      render: (structure: Structure) => (
        <div>
          <p className="font-medium text-secondary-900">
            {structure.structural_identity_number || structure.uid}
          </p>
          <p className="text-xs text-secondary-500">
            {structure.type_of_structure}
          </p>
        </div>
      )
    },
    {
      key: 'client_name',
      label: 'Client',
      sortable: true,
      render: (structure: Structure) => (
        <div>
          <p className="font-medium text-secondary-900">
            {structure.client_name || '—'}
          </p>
          {structure.custodian && (
            <p className="text-xs text-secondary-500">
              Custodian: {structure.custodian}
            </p>
          )}
        </div>
      )
    },
    {
      key: 'location',
      label: 'Location',
      render: (structure: Structure) => (
        <div className="flex items-center">
          <MapPin className="w-4 h-4 text-secondary-400 mr-1" />
          <div>
            <p className="text-sm text-secondary-900">
              {structure.location.city_name || '—'}
            </p>
            <p className="text-xs text-secondary-500">
              {structure.location.state_code || '—'}
            </p>
          </div>
        </div>
      )
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (structure: Structure) => (
        <StatusBadge status={structure.status} />
      )
    },
    {
      key: 'health_status',
      label: 'Health',
      render: (structure: Structure) => (
        <div>
          {structure.health_metrics?.health_status ? (
            <>
              <StatusBadge status={structure.health_metrics.health_status} size="sm" />
              <p className="text-xs text-secondary-500 mt-1">
                Score: {structure.health_metrics.average_rating?.toFixed(1) || '—'}
              </p>
            </>
          ) : (
            <span className="text-secondary-500">—</span>
          )}
        </div>
      )
    },
    {
      key: 'progress',
      label: 'Progress',
      render: (structure: Structure) => (
        <div className="w-full">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-secondary-600">Progress</span>
            <span className="text-xs font-medium text-secondary-900">
              {structure.progress?.overall_percentage || 0}%
            </span>
          </div>
          <div className="w-full bg-secondary-200 rounded-full h-2">
            <div
              className="h-2 bg-primary-500 rounded-full transition-all"
              style={{ width: `${structure.progress?.overall_percentage || 0}%` }}
            />
          </div>
        </div>
      )
    },
    {
      key: 'last_updated',
      label: 'Last Updated',
      sortable: true,
      render: (structure: Structure) => (
        <div className="flex items-center text-xs text-secondary-500">
          <Calendar className="w-3 h-3 mr-1" />
          {formatDate(structure.timestamps.last_updated_date, 'PP')}
        </div>
      )
    }
  ];

  const statusOptions = [
    { value: '', label: 'All Status' },
    { value: 'draft', label: 'Draft' },
    { value: 'submitted', label: 'Submitted' },
    { value: 'approved', label: 'Approved' },
    { value: 'requires_inspection', label: 'Requires Inspection' },
    { value: 'maintenance_needed', label: 'Maintenance Needed' }
  ];

  const typeOptions = [
    { value: '', label: 'All Types' },
    { value: 'residential', label: 'Residential' },
    { value: 'commercial', label: 'Commercial' },
    { value: 'educational', label: 'Educational' },
    { value: 'hospital', label: 'Hospital' },
    { value: 'industrial', label: 'Industrial' }
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="All Structures"
      size="2xl"
    >
      <div className="space-y-6">
        {/* Error Display */}
        {error && (
          <div className="bg-danger-50 border border-danger-200 text-danger-700 px-4 py-3 rounded-md flex items-center">
            <AlertCircle className="w-4 h-4 mr-2" />
            <span>{error}</span>
          </div>
        )}

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <Input
              type="text"
              placeholder="Search structures..."
              leftIcon={<Search className="w-4 h-4" />}
              value={filters.search}
              onChange={(e) => handleSearch(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              leftIcon={<Filter className="w-4 h-4" />}
              onClick={() => setShowFilters(!showFilters)}
            >
              Filters
            </Button>
            <Button
              variant="outline"
              leftIcon={<Download className="w-4 h-4" />}
              onClick={handleExportCSV}
            >
              Export
            </Button>
          </div>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <Card padding="md">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Select
                label="Status"
                value={filters.status || ''}
                onChange={(e) => handleFilterChange('status', e.target.value || undefined)}
                options={statusOptions}
              />
              <Select
                label="Type"
                value={filters.type || ''}
                onChange={(e) => handleFilterChange('type', e.target.value || undefined)}
                options={typeOptions}
              />
              <Select
                label="Sort By"
                value={filters.sortBy || 'last_updated_date'}
                onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                options={[
                  { value: 'last_updated_date', label: 'Last Updated' },
                  { value: 'created_date', label: 'Created Date' },
                  { value: 'client_name', label: 'Client Name' },
                  { value: 'structural_identity_number', label: 'Structure ID' }
                ]}
              />
            </div>
          </Card>
        )}

        {/* Summary Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-secondary-900">
              {formatNumber(pagination.total_items)}
            </p>
            <p className="text-xs text-secondary-500">Total Structures</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-success-600">
              {structures.filter(s => s.status === 'approved').length}
            </p>
            <p className="text-xs text-secondary-500">Approved</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-warning-600">
              {structures.filter(s => s.status === 'requires_inspection').length}
            </p>
            <p className="text-xs text-secondary-500">Need Inspection</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-danger-600">
              {structures.filter(s => s.health_metrics?.priority_issues && s.health_metrics.priority_issues > 0).length}
            </p>
            <p className="text-xs text-secondary-500">With Issues</p>
          </div>
        </div>

        {/* Table */}
        <div className="border border-secondary-200 rounded-lg overflow-hidden">
          <Table
            data={structures}
            columns={columns}
            loading={loading}
            emptyMessage="No structures found"
            emptyDescription="Try adjusting your search terms or filters"
            actions={(structure) => (
              <Button
                variant="ghost"
                size="sm"
                leftIcon={<Eye className="w-4 h-4" />}
                onClick={() => handleViewStructure(structure)}
              >
                View
              </Button>
            )}
          />
        </div>

        {/* Pagination */}
        {pagination.total_pages > 1 && (
          <div className="flex items-center justify-between">
            <p className="text-sm text-secondary-600">
              Showing {((pagination.current_page - 1) * filters.limit!) + 1} to {' '}
              {Math.min(pagination.current_page * filters.limit!, pagination.total_items)} of {' '}
              {pagination.total_items} results
            </p>
            
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={!pagination.has_prev_page}
                onClick={() => handlePageChange(pagination.current_page - 1)}
              >
                Previous
              </Button>
              
              <div className="flex gap-1">
                {Array.from({ length: Math.min(5, pagination.total_pages) }, (_, i) => {
                  const page = i + 1;
                  return (
                    <Button
                      key={page}
                      variant={page === pagination.current_page ? 'primary' : 'outline'}
                      size="sm"
                      onClick={() => handlePageChange(page)}
                    >
                      {page}
                    </Button>
                  );
                })}
              </div>
              
              <Button
                variant="outline"
                size="sm"
                disabled={!pagination.has_next_page}
                onClick={() => handlePageChange(pagination.current_page + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default StructureListModal;