import React, { useState, useEffect, useCallback } from 'react';
import { 
  Building2, 
  Users, 
  FileText, 
  AlertTriangle, 
  TrendingUp,
  Eye,
  CheckCircle,
  Clock,
  ArrowUpRight
} from 'lucide-react';

import { useAuth } from '@/contexts/AuthContext';
import { apiClient } from '@/services/api';
import { DashboardData, SystemStats } from '@/types';
import { 
  Card, 
  LoadingSpinner, 
  StatusBadge,
  Button
} from '@/components/ui';
import { formatDate } from '@/utils/formatters';
import StructureListModal from '@/components/modals/StructureListModal';

// Define structure status type for proper typing
type StructureStatus = 'draft' | 'location_completed' | 'admin_completed' | 'geometric_completed' | 
                      'ratings_in_progress' | 'flat_ratings_completed' | 'submitted' | 'approved' |
                      'Good' | 'Fair' | 'Poor' | 'Critical';

const DashboardPage: React.FC = () => {
  const { user, isAdmin, isVerificationEngineer } = useAuth();
  
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [systemStats, setSystemStats] = useState<SystemStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showStructuresModal, setShowStructuresModal] = useState(false);

  const loadDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Load dashboard data
      const dashboardResponse = await apiClient.getDashboardData();
      if (dashboardResponse?.success) {
        setDashboardData(dashboardResponse.data || null);
      }

      // Load system stats for admins
      if (isAdmin()) {
        const systemStatsResponse = await apiClient.getSystemStats();
        if (systemStatsResponse?.success) {
          setSystemStats(systemStatsResponse.data || null);
        }
      }
    } catch (error: unknown) {
      console.error('Dashboard data loading error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to load dashboard data';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [isAdmin]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !dashboardData) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="w-16 h-16 text-danger-500 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-secondary-900 mb-2">
          Failed to load dashboard
        </h2>
        <p className="text-secondary-600 mb-4">{error}</p>
        <Button onClick={loadDashboardData} variant="primary">
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-secondary-900">
            Welcome back, {user?.username}!
          </h1>
          <p className="text-secondary-600 mt-1">
            {isAdmin() ? 'System Administrator' : 
             isVerificationEngineer() ? 'Verification Engineer' : 'Dashboard'}
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm text-secondary-500">
            Last updated: {formatDate(new Date(), 'PPp')}
          </p>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Structures */}
        <Card padding="md" hover>
          <div className="flex items-center">
            <div className="p-2 bg-primary-100 rounded-lg">
              <Building2 className="w-6 h-6 text-primary-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-secondary-600">
                Total Structures
              </p>
              <p className="text-2xl font-bold text-secondary-900">
                {dashboardData.structure_overview.total_structures}
              </p>
            </div>
          </div>
        </Card>

        {/* Rated Flats */}
        <Card padding="md" hover>
          <div className="flex items-center">
            <div className="p-2 bg-success-100 rounded-lg">
              <CheckCircle className="w-6 h-6 text-success-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-secondary-600">
                Rated Flats
              </p>
              <p className="text-2xl font-bold text-secondary-900">
                {dashboardData.ratings_overview.rated_flats}
                <span className="text-sm font-normal text-secondary-500">
                  /{dashboardData.ratings_overview.total_flats}
                </span>
              </p>
            </div>
          </div>
        </Card>

        {/* Pending Ratings */}
        <Card padding="md" hover>
          <div className="flex items-center">
            <div className="p-2 bg-warning-100 rounded-lg">
              <Clock className="w-6 h-6 text-warning-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-secondary-600">
                Pending Ratings
              </p>
              <p className="text-2xl font-bold text-secondary-900">
                {dashboardData.ratings_overview.pending_ratings}
              </p>
            </div>
          </div>
        </Card>

        {/* Critical Issues */}
        <Card padding="md" hover>
          <div className="flex items-center">
            <div className="p-2 bg-danger-100 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-danger-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-secondary-600">
                Critical Issues
              </p>
              <p className="text-2xl font-bold text-secondary-900">
                {dashboardData.ratings_overview.critical_issues}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Admin System Stats */}
      {isAdmin() && systemStats && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Users Stats */}
          <Card padding="md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-secondary-900">
                Users Overview
              </h3>
              <Users className="w-5 h-5 text-secondary-400" />
            </div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-secondary-600">Total Users</span>
                <span className="font-semibold">{systemStats.users.totalUsers}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-secondary-600">Active Users</span>
                <span className="font-semibold text-success-600">{systemStats.users.activeUsers}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-secondary-600">Admins</span>
                <span className="font-semibold">{systemStats.users.adminUsers}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-secondary-600">Engineers</span>
                <span className="font-semibold">{systemStats.users.engineerUsers}</span>
              </div>
            </div>
          </Card>

          {/* Structures Stats */}
          <Card padding="md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-secondary-900">
                Structures Overview
              </h3>
              <Building2 className="w-5 h-5 text-secondary-400" />
            </div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-secondary-600">Total</span>
                <span className="font-semibold">{systemStats.structures.totalStructures}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-secondary-600">Submitted</span>
                <span className="font-semibold text-primary-600">{systemStats.structures.submittedStructures}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-secondary-600">Approved</span>
                <span className="font-semibold text-success-600">{systemStats.structures.approvedStructures}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-secondary-600">Need Inspection</span>
                <span className="font-semibold text-warning-600">{systemStats.structures.requiresInspection}</span>
              </div>
            </div>
          </Card>

          {/* Inspections Stats */}
          <Card padding="md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-secondary-900">
                Inspections Overview
              </h3>
              <FileText className="w-5 h-5 text-secondary-400" />
            </div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-secondary-600">Total</span>
                <span className="font-semibold">{systemStats.inspections.totalInspections}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-secondary-600">Pending</span>
                <span className="font-semibold text-warning-600">{systemStats.inspections.pendingInspections}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-secondary-600">Completed</span>
                <span className="font-semibold text-success-600">{systemStats.inspections.completedInspections}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-secondary-600">Follow-up Required</span>
                <span className="font-semibold text-danger-600">{systemStats.inspections.followupRequired}</span>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Structures */}
        <Card padding="md">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-secondary-900">
              Recent Structures
            </h3>
            <Button
              variant="ghost"
              size="sm"
              rightIcon={<Eye className="w-4 h-4" />}
              onClick={() => setShowStructuresModal(true)}
            >
              View All
            </Button>
          </div>
          
          {dashboardData.recent_activity.recent_structures.length === 0 ? (
            <p className="text-secondary-500 text-center py-8">
              No recent structures found
            </p>
          ) : (
            <div className="space-y-4">
              {dashboardData.recent_activity.recent_structures.slice(0, 5).map((structure) => (
                <div
                  key={structure.structure_id}
                  className="flex items-center justify-between p-3 bg-secondary-50 rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-secondary-900">
                        {structure.structure_number || structure.uid}
                      </p>
                      <StatusBadge status={structure.status} size="sm" />
                    </div>
                    <p className="text-sm text-secondary-600">
                      {structure.client_name || 'No client name'}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex-1 bg-secondary-200 rounded-full h-2">
                        <div
                          className="h-2 bg-primary-500 rounded-full transition-all"
                          style={{ width: `${structure.progress}%` }}
                        />
                      </div>
                      <span className="text-xs text-secondary-500">
                        {structure.progress}%
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Recent Ratings */}
        <Card padding="md">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-secondary-900">
              Recent Assessments
            </h3>
            <TrendingUp className="w-5 h-5 text-secondary-400" />
          </div>
          
          {dashboardData.recent_activity.recent_ratings.length === 0 ? (
            <p className="text-secondary-500 text-center py-8">
              No recent assessments found
            </p>
          ) : (
            <div className="space-y-4">
              {dashboardData.recent_activity.recent_ratings.slice(0, 5).map((rating, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-secondary-50 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-secondary-900">
                      {rating.structure_number || 'Unknown Structure'}
                    </p>
                    <p className="text-sm text-secondary-600">
                      {rating.location}
                    </p>
                    <p className="text-xs text-secondary-500">
                      {formatDate(rating.assessment_date, 'PPp')}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold text-secondary-900">
                        {rating.combined_score.toFixed(1)}
                      </span>
                      <StatusBadge status={rating.health_status} size="sm" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Structure Status Distribution */}
      <Card padding="md">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-secondary-900">
            Structure Status Distribution
          </h3>
          <ArrowUpRight className="w-5 h-5 text-secondary-400" />
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {Object.entries(dashboardData.structure_overview.by_status).map(([status, count]) => (
            <div key={status} className="text-center">
              <div className="bg-secondary-100 rounded-lg p-4 mb-2">
                <p className="text-2xl font-bold text-secondary-900">{count}</p>
              </div>
              <StatusBadge status={status as StructureStatus} size="sm" />
            </div>
          ))}
        </div>
      </Card>

      {/* Modals */}
      <StructureListModal
        isOpen={showStructuresModal}
        onClose={() => setShowStructuresModal(false)}
      />
    </div>
  );
};

export default DashboardPage;