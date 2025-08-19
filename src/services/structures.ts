import apiService from './api';
import { STRUCTURE_ENDPOINTS } from '../utils/constants';
import type { 
  StructuresResponse, 
  Structure, 
  RemarksResponse,
  AddRemarkRequest,
  UpdateRemarkRequest
} from '../types/structure';
import type { ApiResponse } from '../types/api';

interface GetStructuresParams {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

class StructuresService {
  async getStructures(params: GetStructuresParams = {}): Promise<StructuresResponse> {
    try {
      const queryParams = new URLSearchParams();
      
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });

      const queryString = queryParams.toString();
      const url = `${STRUCTURE_ENDPOINTS.LIST}${queryString ? `?${queryString}` : ''}`;
      
      const response = await apiService.get<StructuresResponse>(url);
      return response;
    } catch (error) {
      throw apiService.handleError(error);
    }
  }

  async getStructureById(id: string, includeImages = false, includeRatings = true): Promise<Structure> {
    try {
      const queryParams = new URLSearchParams();
      if (includeImages) queryParams.append('include_images', 'true');
      if (!includeRatings) queryParams.append('include_ratings', 'false');
      
      const queryString = queryParams.toString();
      const url = STRUCTURE_ENDPOINTS.DETAILS.replace(':id', id);
      const fullUrl = `${url}${queryString ? `?${queryString}` : ''}`;
      
      const response = await apiService.get<{ success: boolean; data: Structure }>(fullUrl);
      
      if (response.success) {
        return response.data;
      }
      
      throw new Error('Failed to fetch structure details');
    } catch (error) {
      throw apiService.handleError(error);
    }
  }

  async getStructureRemarks(structureId: string): Promise<RemarksResponse['data']> {
    try {
      const url = STRUCTURE_ENDPOINTS.REMARKS.replace(':id', structureId);
      const response = await apiService.get<RemarksResponse>(url);
      
      if (response.success) {
        return response.data;
      }
      
      throw new Error('Failed to fetch structure remarks');
    } catch (error) {
      throw apiService.handleError(error);
    }
  }

  async addRemark(structureId: string, remark: AddRemarkRequest): Promise<void> {
    try {
      const url = STRUCTURE_ENDPOINTS.REMARKS.replace(':id', structureId);
      const response = await apiService.post<ApiResponse>(url, remark);
      
      if (!response.success) {
        throw new Error(response.error || 'Failed to add remark');
      }
    } catch (error) {
      throw apiService.handleError(error);
    }
  }

  async updateRemark(
    structureId: string, 
    remarkId: string, 
    remark: UpdateRemarkRequest
  ): Promise<void> {
    try {
      const url = STRUCTURE_ENDPOINTS.UPDATE_REMARK
        .replace(':id', structureId)
        .replace(':remarkId', remarkId);
      
      const response = await apiService.put<ApiResponse>(url, remark);
      
      if (!response.success) {
        throw new Error(response.error || 'Failed to update remark');
      }
    } catch (error) {
      throw apiService.handleError(error);
    }
  }

  async deleteRemark(structureId: string, remarkId: string): Promise<void> {
    try {
      const url = STRUCTURE_ENDPOINTS.DELETE_REMARK
        .replace(':id', structureId)
        .replace(':remarkId', remarkId);
      
      const response = await apiService.delete<ApiResponse>(url);
      
      if (!response.success) {
        throw new Error(response.error || 'Failed to delete remark');
      }
    } catch (error) {
      throw apiService.handleError(error);
    }
  }

  async searchStructures(query: string, filters: Record<string, any> = {}): Promise<Structure[]> {
    try {
      const params = new URLSearchParams({ q: query });
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString());
        }
      });

      const response = await apiService.get<{
        success: boolean;
        data: { results: Structure[] };
      }>(`/structures/search?${params.toString()}`);
      
      if (response.success) {
        return response.data.results;
      }
      
      return [];
    } catch (error) {
      console.error('Search error:', error);
      return [];
    }
  }

  async exportStructures(format: 'csv' | 'json' = 'csv'): Promise<Blob> {
    try {
      const response = await apiService.get<Blob>(`/structures/export/${format}`, {
        responseType: 'blob',
      });
      
      return response;
    } catch (error) {
      throw apiService.handleError(error);
    }
  }

  // Utility methods for structure data
  getStatusBadgeClass(status: string): string {
    const statusClasses: Record<string, string> = {
      draft: 'status-draft',
      location_completed: 'badge-blue',
      admin_completed: 'badge-blue',
      geometric_completed: 'badge-blue',
      ratings_in_progress: 'badge-amber',
      flat_ratings_completed: 'badge-green',
      submitted: 'badge-blue',
      approved: 'status-approved',
    };
    
    return statusClasses[status] || 'badge bg-gray-100 text-gray-600';
  }

  getHealthBadgeClass(health: string): string {
    const healthClasses: Record<string, string> = {
      Good: 'status-good',
      Fair: 'badge-amber',
      Poor: 'status-poor',
      Critical: 'status-critical',
    };
    
    return healthClasses[health] || 'badge bg-gray-100 text-gray-600';
  }

  getPriorityBadgeClass(priority: string): string {
    const priorityClasses: Record<string, string> = {
      Low: 'status-good',
      Medium: 'badge-amber',
      High: 'badge-red',
      Critical: 'status-critical',
    };
    
    return priorityClasses[priority] || 'badge bg-gray-100 text-gray-600';
  }

  formatStatusText(status: string): string {
    return status
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  calculateCompletionPercentage(structure: Structure): number {
    if (structure.progress) {
      return structure.progress.overall_percentage;
    }
    
    // Fallback calculation
    let completed = 0;
    const totalSteps = 6;
    
    if (structure.structural_identity?.structural_identity_number && 
        structure.location?.coordinates?.latitude) completed++;
    if (structure.administration?.client_name && structure.administration?.email_id) completed++;
    if (structure.geometric_details?.structure_width && structure.geometric_details?.structure_height) completed++;
    if (structure.geometric_details?.floors?.length > 0) completed++;
    
    const hasFlats = structure.geometric_details?.floors?.some(floor => floor.flats?.length > 0);
    if (hasFlats) completed++;
    
    const allFlatsRated = structure.geometric_details?.floors?.every(floor =>
      floor.flats?.every(flat => flat.flat_overall_rating?.combined_score)
    );
    if (allFlatsRated) completed++;
    
    return Math.round((completed / totalSteps) * 100);
  }
}

export const structuresService = new StructuresService();
export default structuresService;