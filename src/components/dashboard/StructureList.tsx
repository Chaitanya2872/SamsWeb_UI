import React, { useState } from 'react';
import { 
  MagnifyingGlassIcon,
  BuildingOfficeIcon, 
  ArrowsUpDownIcon,
  Squares2X2Icon,
  ListBulletIcon
} from '@heroicons/react/24/outline';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { StructureCard } from './StructureCard';
import { useStructures } from '../../hooks/useStructures';
import { useDebounce } from '../../hooks/useLocalStorage';
import type { Structure } from '../../types/structure';

interface StructureListProps {
  onStructureClick: (structure: Structure) => void;
}

export const StructureList: React.FC<StructureListProps> = ({ onStructureClick }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortBy, setSortBy] = useState('creation_date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const debouncedSearch = useDebounce(searchQuery, 300);
  
  const {
    structures,
    pagination,
    summary,
    isLoading,
    error,
    setPage,
    refreshStructures,
  } = useStructures({
    search: debouncedSearch,
    status: statusFilter,
    sortBy,
    sortOrder,
    autoFetch: true,
  });

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleStatusFilter = (status: string) => {
    setStatusFilter(status === statusFilter ? '' : status);
  };

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const handlePageChange = (page: number) => {
    setPage(page);
  };

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 mb-4">
          <p className="text-lg font-medium">Error loading structures</p>
          <p className="text-sm">{error}</p>
        </div>
        <Button onClick={refreshStructures} variant="primary">
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search */}
        <div className="flex-1">
          <Input
            placeholder="Search structures..."
            value={searchQuery}
            onChange={handleSearchChange}
            leftIcon={<MagnifyingGlassIcon className="h-4 w-4" />}
          />
        </div>

        {/* View Toggle */}
        <div className="flex gap-2">
          <Button
            variant={viewMode === 'grid' ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setViewMode('grid')}
          >
            <Squares2X2Icon className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setViewMode('list')}
          >
            <ListBulletIcon className="h-4 w-4" />
          </Button>
        </div>

        {/* Sort */}
        <div className="flex gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => handleSort('creation_date')}
            leftIcon={<ArrowsUpDownIcon className="h-4 w-4" />}
          >
            Date {sortBy === 'creation_date' && (sortOrder === 'desc' ? '↓' : '↑')}
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => handleSort('structure_number')}
          >
            Name {sortBy === 'structure_number' && (sortOrder === 'desc' ? '↓' : '↑')}
          </Button>
        </div>
      </div>

      {/* Status Filters */}
      {summary && summary.by_status && (
        <div className="flex flex-wrap gap-2">
          <span className="text-sm text-gray-500 mr-2">Filter by status:</span>
          {Object.entries(summary.by_status || {}).map(([status, count]) => (
            <Button
              key={status}
              variant={statusFilter === status ? 'primary' : 'outline'}
              size="sm"
              onClick={() => handleStatusFilter(status)}
            >
              {status.replace('_', ' ')} ({count})
            </Button>
          ))}
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      )}

      {/* Results Summary */}
      {!isLoading && pagination && (
        <div className="flex items-center justify-between text-sm text-gray-600">
          <p>
            Showing {((pagination?.current_page || 1) - 1) * (pagination?.per_page || 0) + 1} to{' '}
            {Math.min((pagination?.current_page || 1) * (pagination?.per_page || 0), pagination?.total_items || 0)} of{' '}
            {pagination?.total_items || 0} structures
          </p>
          {searchQuery && (
            <p>
              Search results for "<span className="font-medium">{searchQuery}</span>"
            </p>
          )}
        </div>
      )}

      {/* Structure Grid/List */}
      {!isLoading && structures && structures.length > 0 && (
        <div className={
          viewMode === 'grid' 
            ? 'grid grid-cols-4 md:grid-cols-2 lg:grid-cols-3 gap-4'
            : 'space-y-4'
        }>
          {(structures || []).map((structure) => (
            <StructureCard
              key={structure._id}
              structure={structure}
              onClick={() => onStructureClick(structure)}
            />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && (!structures || structures.length === 0) && (
        <div className="text-center py-12">
          <BuildingOfficeIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchQuery ? 'No structures found' : 'No structures yet'}
          </h3>
          <p className="text-gray-600 mb-4">
            {searchQuery 
              ? 'Try adjusting your search terms or filters'
              : 'Get started by creating your first structure'
            }
          </p>
          {!searchQuery && (
            <Button variant="primary">
              Create Structure
            </Button>
          )}
        </div>
      )}

      {/* Pagination */}
      {!isLoading && pagination && pagination.total_pages > 1 && (
        <div className="flex items-center justify-between border-t border-gray-200 pt-4">
          <Button
            variant="secondary"
            disabled={!pagination?.has_prev_page}
            onClick={() => handlePageChange((pagination?.current_page || 1) - 1)}
          >
            Previous
          </Button>
          
          <div className="flex items-center gap-2">
            {Array.from({ length: Math.min(pagination?.total_pages || 0, 5) }, (_, i) => {
              const page = i + 1;
              return (
                <Button
                  key={page}
                  variant={page === pagination?.current_page ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => handlePageChange(page)}
                >
                  {page}
                </Button>
              );
            })}
            {(pagination?.total_pages || 0) > 5 && (
              <span className="text-sm text-gray-500">
                ... {pagination?.total_pages}
              </span>
            )}
          </div>

          <Button
            variant="secondary"
            disabled={!pagination?.has_next_page}
            onClick={() => handlePageChange((pagination?.current_page || 1) + 1)}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
};