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

      // Pass through known params
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, value.toString());
        }
      });

      const queryString = queryParams.toString();
      const url = `${STRUCTURE_ENDPOINTS.LIST}${queryString ? `?${queryString}` : ''}`;

      const raw = await apiService.get<any>(url);

      // Normalize different possible backend shapes to StructuresResponse
      const normalize = (resp: any): StructuresResponse => {
        // Transform backend list item into our Structure type expected by UI
        const transformItem = (item: any): Structure => {
          const id = item?._id || item?.structure_id || item?.uid || '';
          return {
            _id: id,
            structural_identity: {
              uid: item?.uid || id,
              structural_identity_number: item?.structural_identity_number,
              state_code: item?.location?.state_code,
              city_name: item?.location?.city_name,
              type_of_structure: item?.type_of_structure,
            },
            location: {
              coordinates: {
                latitude: item?.location?.coordinates?.latitude,
                longitude: item?.location?.coordinates?.longitude,
              },
              address: item?.location?.address,
            },
            administration: {
              client_name: item?.client_name,
            },
            geometric_details: {
              number_of_floors: item?.dimensions?.floors,
              structure_width: item?.dimensions?.width,
              structure_length: item?.dimensions?.length,
              structure_height: item?.dimensions?.height,
              floors: [],
            },
            status: item?.status || 'draft',
            progress: item?.progress,
            statistics: item?.ratings_summary
              ? {
                  total_floors: item?.dimensions?.floors ?? 0,
                  total_flats: item?.ratings_summary?.total_flats ?? 0,
                  rated_flats: item?.ratings_summary?.rated_flats ?? 0,
                  pending_ratings: Math.max(
                    0,
                    (item?.ratings_summary?.total_flats ?? 0) - (item?.ratings_summary?.rated_flats ?? 0)
                  ),
                  critical_issues: 0,
                  high_priority_issues: 0,
                }
              : undefined,
            health_summary: item?.ratings_summary
              ? {
                  structural_health: item?.ratings_summary?.avg_structural_rating ?? undefined,
                  non_structural_health: item?.ratings_summary?.avg_non_structural_rating ?? undefined,
                  priority_level: item?.ratings_summary?.overall_health ?? undefined,
                }
              : undefined,
            creation_info: {
              created_date: item?.timestamps?.created_date || new Date().toISOString(),
              last_updated_date:
                item?.timestamps?.last_updated_date || item?.creation_info?.last_updated_date || new Date().toISOString(),
              version: item?.creation_info?.version ?? 1,
            },
          } as Structure;
        };

        const dataNode = resp?.data ?? resp;
        const currentPageNode = resp?.pagination?.currentPage;

        let items: any[] = [];
        let p: any = {};
        let filters: any = undefined;
        let summaryNode: any = undefined;

        if (Array.isArray((dataNode as any)?.structures) || Array.isArray((dataNode as any)?.items) || Array.isArray((dataNode as any)?.results)) {
          items = (dataNode as any)?.structures || (dataNode as any)?.items || (dataNode as any)?.results || [];
          p = (dataNode as any)?.pagination || (dataNode as any)?.meta || {};
          summaryNode = (dataNode as any)?.summary;
        } else if (currentPageNode && Array.isArray(currentPageNode?.structures)) {
          items = currentPageNode.structures;
          p = currentPageNode.pagination || {};
          filters = currentPageNode.filters || undefined;
          summaryNode = currentPageNode.summary || undefined;
        }

        const structures: Structure[] = (items || []).map(transformItem);

        // Extract pagination or build a minimal one
        const current_page = Number(p.current_page ?? p.page ?? params.page ?? 1);
        const per_page = Number(p.per_page ?? p.limit ?? params.limit ?? 12);
        const total_items = Number(p.total_items ?? p.total ?? structures.length);
        const total_pages = Number(p.total_pages ?? Math.max(1, Math.ceil(total_items / (per_page || 1))));
        const has_next_page = (p.has_next_page ?? p.hasNextPage) ?? current_page < total_pages;
        const has_prev_page = (p.has_prev_page ?? p.hasPrevPage) ?? current_page > 1;

        // Extract summary or compute a simple one
        const by_status: Record<string, number> =
          (summaryNode?.by_status as Record<string, number>) ||
          structures.reduce((acc: Record<string, number>, s: Structure) => {
            const st = (s.status || 'unknown').toString();
            acc[st] = (acc[st] || 0) + 1;
            return acc;
          }, {});

        const summary = {
          total_structures: summaryNode?.total_structures ?? structures.length,
          by_status,
        };

        return {
          success: resp?.success ?? true,
          message: resp?.message ?? 'OK',
          data: {
            structures,
            pagination: {
              current_page,
              per_page,
              total_items,
              total_pages,
              has_next_page,
              has_prev_page,
            },
            filters: {
              status: (filters?.status ?? params.status ?? '').toString(),
              search: (filters?.search ?? params.search ?? '').toString(),
              sort_by: (filters?.sort_by ?? params.sortBy ?? '').toString(),
              sort_order: (filters?.sort_order ?? params.sortOrder ?? '').toString(),
            },
            summary,
          },
        } as StructuresResponse;
      };

      return normalize(raw);
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
      
      // Accept flexible response shapes from backend
      const response = await apiService.get<any>(fullUrl);

      const mapToStructure = (obj: any): Structure => {
        const idVal = obj?._id || obj?.structure_id || obj?.uid || id;
        return {
          _id: idVal,
          structural_identity: obj.structural_identity || {
            uid: obj?.uid || idVal,
            structural_identity_number: obj?.structural_identity_number,
            zip_code: obj?.structural_identity?.zip_code,
            state_code: obj?.structural_identity?.state_code || obj?.location?.state_code,
            district_code: obj?.structural_identity?.district_code,
            city_name: obj?.structural_identity?.city_name || obj?.location?.city_name,
            location_code: obj?.structural_identity?.location_code,
            structure_number: obj?.structural_identity?.structure_number,
            type_of_structure: obj?.structural_identity?.type_of_structure || obj?.type_of_structure,
            type_code: obj?.structural_identity?.type_code,
          },
          location: obj.location || { coordinates: {} },
          administration: obj.administration || { client_name: obj?.client_name },
          geometric_details: obj.geometric_details || {
            number_of_floors: obj?.dimensions?.floors,
            structure_width: obj?.dimensions?.width,
            structure_length: obj?.dimensions?.length,
            structure_height: obj?.dimensions?.height,
            floors: [],
          },
          status: obj.status || 'draft',
          progress: obj.progress,
          statistics: obj.statistics || (obj.ratings_summary ? {
            total_floors: obj?.dimensions?.floors ?? 0,
            total_flats: obj?.ratings_summary?.total_flats ?? 0,
            rated_flats: obj?.ratings_summary?.rated_flats ?? 0,
            pending_ratings: Math.max(0, (obj?.ratings_summary?.total_flats ?? 0) - (obj?.ratings_summary?.rated_flats ?? 0)),
            critical_issues: 0,
            high_priority_issues: 0,
          } : undefined),
          health_summary: obj.health_summary || (obj.ratings_summary ? {
            structural_health: obj?.ratings_summary?.avg_structural_rating ?? undefined,
            non_structural_health: obj?.ratings_summary?.avg_non_structural_rating ?? undefined,
            priority_level: obj?.ratings_summary?.overall_health ?? undefined,
          } : undefined),
          remarks: obj.remarks,
          creation_info: obj.creation_info || {
            created_date: obj?.timestamps?.created_date || new Date().toISOString(),
            last_updated_date: obj?.timestamps?.last_updated_date || new Date().toISOString(),
            version: obj?.creation_info?.version ?? 1,
          },
        } as Structure;
      };
      
      if (response?.success && response?.data) {
        return mapToStructure(response.data);
      }
      // Some backends return the structure object directly
      if (response && (response._id || response.structural_identity || response.structure_id || response.uid)) {
        return mapToStructure(response);
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