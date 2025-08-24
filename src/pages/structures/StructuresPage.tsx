import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Building2,
  Plus,
  Search,
  Filter,
  Eye,
  Download,
  MapPin,
  Calendar
} from 'lucide-react';

import { useAuth } from '@/contexts/AuthContext';
import { apiClient } from '@/services/api';
import { Structure, StructureFilters, StructureStatus, StructureType } from '@/types';
import {
  Button,
  Card,
  Input,
  Select,
  Table,
  StatusBadge,
  LoadingSpinner
} from '@/components/ui';
import { formatDate, formatPercentage } from '@/utils/formatters';

const StructuresPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [structures, setStructures] = useState<Structure[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  
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

  const loadStructures = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiClient.getStructures(filters);
      
      if (response.success && response.data) {
        setStructures(response.data.structures || []);
        setPagination(response.data.pagination);
      }
    } catch (error: unknown) {
      console.error('Failed to load structures:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to load structures';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadStructures();
  }, [loadStructures]);

  const handleSearch = (searchTerm: string) => {
    setFilters(prev => ({
      ...prev,
      search: searchTerm,
      page: 1
    }));
  };

  const handleFilterChange = <K extends keyof StructureFilters>(
    key: K, 
    value: StructureFilters[K]
  ) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1
    }));
  };

  const handleViewStructure = (structure: Structure) => {
    navigate(`/structures/${structure.structure_id}`);
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
    } catch (error: unknown) {
      console.error('Export failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Export failed';
      setError(errorMessage);
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
            <span className="text-xs text-secondary-600">Completion</span>
            <span className="text-xs font-medium text-secondary-900">
              {formatPercentage(structure.progress?.overall_percentage || 0, 0)}
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

  if (error) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-secondary-900 mb-2">
          Failed to load structures
        </h2>
        <p className="text-secondary-600 mb-4">{error}</p>
        <Button onClick={loadStructures} variant="primary">
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900">Structures</h1>
          <p className="text-secondary-600">
            Manage and review structure assessments{user ? ` - ${user.username}` : ''}
          </p>
        </div>
        
        <div className="flex gap-3">
          <Button
            variant="primary"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={() => navigate('/structures/create')}
          >
            New Structure
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

      {/* Search and Filters */}
      <Card padding="md">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <Input
              type="text"
              placeholder="Search structures by ID, client name, or location..."
              leftIcon={<Search className="w-4 h-4" />}
              value={filters.search || ''}
              onChange={(e) => handleSearch(e.target.value)}
            />
          </div>
          
          <div className="flex gap-3">
            <Select
              value={filters.status || ''}
              onChange={(e) => handleFilterChange('status', e.target.value ? e.target.value as StructureStatus : undefined)}
              options={statusOptions}
              placeholder="Filter by status"
            />
            
            <Select
              value={filters.type || ''}
              onChange={(e) => handleFilterChange('type', e.target.value ? e.target.value as StructureType : undefined)}
              options={typeOptions}
              placeholder="Filter by type"
            />
            
            <Button
              variant="outline"
              leftIcon={<Filter className="w-4 h-4" />}
              onClick={() => setShowFilters(!showFilters)}
            >
              More Filters
            </Button>
          </div>
        </div>

        {/* Extended Filters */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-secondary-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Select
                label="Sort By"
                value={filters.sortBy || 'last_updated_date'}
                onChange={(e) => handleFilterChange('sortBy', e.target.value as 'last_updated_date' | 'created_date' | 'client_name' | 'structural_identity_number')}
                options={[
                  { value: 'last_updated_date', label: 'Last Updated' },
                  { value: 'created_date', label: 'Created Date' },
                  { value: 'client_name', label: 'Client Name' },
                  { value: 'structural_identity_number', label: 'Structure ID' }
                ]}
              />
              
              <Select
                label="Sort Order"
                value={filters.sortOrder || 'desc'}
                onChange={(e) => handleFilterChange('sortOrder', e.target.value as 'asc' | 'desc')}
                options={[
                  { value: 'desc', label: 'Newest First' },
                  { value: 'asc', label: 'Oldest First' }
                ]}
              />
            </div>
          </div>
        )}
      </Card>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card padding="md" className="text-center">
          <Building2 className="w-8 h-8 text-primary-600 mx-auto mb-2" />
          <p className="text-2xl font-bold text-secondary-900">
            {pagination.total_items}
          </p>
          <p className="text-xs text-secondary-500">Total Structures</p>
        </Card>

        <Card padding="md" className="text-center">
          <div className="w-8 h-8 bg-success-100 rounded-full flex items-center justify-center mx-auto mb-2">
            <div className="w-4 h-4 bg-success-500 rounded-full"></div>
          </div>
          <p className="text-2xl font-bold text-success-600">
            {structures.filter(s => s.status === 'approved').length}
          </p>
          <p className="text-xs text-secondary-500">Approved</p>
        </Card>

        <Card padding="md" className="text-center">
          <div className="w-8 h-8 bg-warning-100 rounded-full flex items-center justify-center mx-auto mb-2">
            <div className="w-4 h-4 bg-warning-500 rounded-full"></div>
          </div>
          <p className="text-2xl font-bold text-warning-600">
            {structures.filter(s => s.status === 'requires_inspection').length}
          </p>
          <p className="text-xs text-secondary-500">Need Inspection</p>
        </Card>

        <Card padding="md" className="text-center">
          <div className="w-8 h-8 bg-danger-100 rounded-full flex items-center justify-center mx-auto mb-2">
            <div className="w-4 h-4 bg-danger-500 rounded-full"></div>
          </div>
          <p className="text-2xl font-bold text-danger-600">
            {structures.filter(s => s.health_metrics?.priority_issues && s.health_metrics.priority_issues > 0).length}
          </p>
          <p className="text-xs text-secondary-500">With Issues</p>
        </Card>
      </div>

      {/* Structures Table */}
      <Card padding="none">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : structures.length === 0 ? (
          <div className="text-center py-12">
            <Building2 className="w-16 h-16 text-secondary-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-secondary-900 mb-2">
              No structures found
            </h3>
            <p className="text-secondary-600 mb-6">
              Try adjusting your search terms or filters, or create your first structure.
            </p>
            <Button
              variant="primary"
              leftIcon={<Plus className="w-4 h-4" />}
              onClick={() => navigate('/structures/create')}
            >
              Create Structure
            </Button>
          </div>
        ) : (
          <Table
            data={structures}
            columns={columns}
            loading={loading}
            emptyMessage="No structures found"
            emptyDescription="Try adjusting your search terms or filters"
            onRowClick={handleViewStructure}
            actions={(structure) => (
              <Button
                variant="ghost"
                size="sm"
                leftIcon={<Eye className="w-4 h-4" />}
                onClick={(e) => {
                  e.stopPropagation();
                  handleViewStructure(structure);
                }}
              >
                View
              </Button>
            )}
          />
        )}
      </Card>

      {/* Pagination */}
      {pagination.total_pages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-secondary-600">
            Showing {((pagination.current_page - 1) * (filters.limit || 20)) + 1} to{' '}
            {Math.min(pagination.current_page * (filters.limit || 20), pagination.total_items)} of{' '}
            {pagination.total_items} results
          </p>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={!pagination.has_prev_page || loading}
              onClick={() => handleFilterChange('page', pagination.current_page - 1)}
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
                    disabled={loading}
                    onClick={() => handleFilterChange('page', page)}
                  >
                    {page}
                  </Button>
                );
              })}
            </div>
            
            <Button
              variant="outline"
              size="sm"
              disabled={!pagination.has_next_page || loading}
              onClick={() => handleFilterChange('page', pagination.current_page + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default StructuresPage;