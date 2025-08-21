import React, { useState } from 'react';
import { 
  PlusIcon, 
  FunnelIcon, 
  ArrowDownTrayIcon,
  MagnifyingGlassIcon,
  ChartBarIcon 
} from '@heroicons/react/24/outline';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { DashboardStats } from '../components/dashboard/DashboardStats';
import { StructureList } from '../components/dashboard/StructureList';
import { StructureDetailModal } from '../components/modals/StructureDetailModal';
import { useAuth } from '../hooks/useAuth';
import { useStructures } from '../hooks/useStructures';
import { useDisclosure } from '../hooks/useLocalStorage';
import type { Structure } from '../types/structure';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const { summary } = useStructures({ autoFetch: true });
  
  const [selectedStructure, setSelectedStructure] = useState<Structure | null>(null);
  const [quickSearch, setQuickSearch] = useState('');
  
  const detailModal = useDisclosure();

  const handleStructureClick = (structure: Structure) => {
    setSelectedStructure(structure);
    detailModal.open();
  };

  const handleCreateStructure = () => {
    // Navigate to create structure flow
    console.log('Create new structure');
  };

  const handleExportData = () => {
    // Export functionality
    console.log('Export data');
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const getUserDisplayName = () => {
    if (user?.profile?.first_name) {
      return user.profile.first_name;
    }
    return user?.username || 'User';
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {getGreeting()}, {getUserDisplayName()}! 👋
          </h1>
          <p className="text-gray-600 mt-1">
            Here's what's happening with your structures today.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Quick Search */}
          <div className="hidden sm:block">
            <Input
              placeholder="Quick search..."
              value={quickSearch}
              onChange={(e) => setQuickSearch(e.target.value)}
              leftIcon={<MagnifyingGlassIcon className="h-4 w-4" />}
              className="w-64"
            />
          </div>

          {/* Action Buttons */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportData}
            leftIcon={<ArrowDownTrayIcon className="h-4 w-4" />}
          >
            Export
          </Button>

          <Button
            variant="outline"
            size="sm"
            leftIcon={<ChartBarIcon className="h-4 w-4" />}
          >
            Analytics
          </Button>

          {user?.permissions?.can_create_structures && (
            <Button
              variant="primary"
              onClick={handleCreateStructure}
              leftIcon={<PlusIcon className="h-4 w-4" />}
            >
              New Structure
            </Button>
          )}
        </div>
      </div>
      {/* Dashboard Stats */}
      <DashboardStats summary={summary ?? {total_structures: 0, by_status: {}}} />

      {/* Quick Actions */}
      <div className="grid grid-cols-4 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card p-4 hover:shadow-md transition cursor-pointer">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-50 rounded-lg">
              <PlusIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h3 className="font-medium text-gray-900">Create Structure</h3>
              <p className="text-sm text-gray-600">Start a new assessment</p>
            </div>
          </div>
        </div>

        <div className="card p-4 hover:shadow-md transition cursor-pointer">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-50 rounded-lg">
              <ChartBarIcon className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h3 className="font-medium text-gray-900">View Reports</h3>
              <p className="text-sm text-gray-600">Analyze your data</p>
            </div>
          </div>
        </div>

        <div className="card p-4 hover:shadow-md transition cursor-pointer">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-amber-50 rounded-lg">
              <FunnelIcon className="h-6 w-6 text-amber-600" />
            </div>
            <div>
              <h3 className="font-medium text-gray-900">Filter Structures</h3>
              <p className="text-sm text-gray-600">Find specific items</p>
            </div>
          </div>
        </div>

        <div className="card p-4 hover:shadow-md transition cursor-pointer">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-50 rounded-lg">
              <ArrowDownTrayIcon className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <h3 className="font-medium text-gray-900">Export Data</h3>
              <p className="text-sm text-gray-600">Download reports</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Recent Structures</h2>
          <Button variant="outline" size="sm">
            View All
          </Button>
        </div>

        {/* Structures List */}
        <StructureList onStructureClick={handleStructureClick} />
      </div>

      {/* Structure Detail Modal */}
      <StructureDetailModal
        isOpen={detailModal.isOpen}
        onClose={detailModal.close}
        structureId={selectedStructure?._id || null}
      />
    </div>
  );
};