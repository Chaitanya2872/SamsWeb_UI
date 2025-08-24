import { useState, useEffect, useCallback } from 'react';
import structuresService from '../services/structures';
import type { Structure, StructuresResponse } from '../types/structure';
import { PAGINATION_DEFAULTS } from '../utils/constants';

interface UseStructuresParams {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  autoFetch?: boolean;
}

interface UseStructuresReturn {
  structures: Structure[];
  pagination: StructuresResponse['data']['pagination'] | null;
  summary: StructuresResponse['data']['summary'] | null;
  isLoading: boolean;
  error: string | null;
  fetchStructures: () => Promise<void>;
  refreshStructures: () => Promise<void>;
  searchStructures: (query: string) => Promise<void>;
  setPage: (page: number) => void;
  setStatus: (status: string) => void;
  setSearch: (search: string) => void;
  setSortBy: (sortBy: string) => void;
  setSortOrder: (sortOrder: 'asc' | 'desc') => void;
}

export const useStructures = (params: UseStructuresParams = {}): UseStructuresReturn => {
  const [structures, setStructures] = useState<Structure[]>([]);
  const [pagination, setPagination] = useState<StructuresResponse['data']['pagination'] | null>(null);
  const [summary, setSummary] = useState<StructuresResponse['data']['summary'] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [page, setPage] = useState(params.page || PAGINATION_DEFAULTS.PAGE);
  const [limit] = useState(params.limit || PAGINATION_DEFAULTS.LIMIT);
  const [status, setStatus] = useState(params.status || '');
  const [search, setSearch] = useState(params.search || '');
  const [sortBy, setSortBy] = useState(params.sortBy || 'creation_date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>(params.sortOrder || 'desc');

  const fetchStructures = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await structuresService.getStructures({
        page,
        limit,
        status: status || undefined,
        search: search || undefined,
        sortBy,
        sortOrder,
      });

      console.log('Structures API response:', response);

      if (response.success) {
        console.log('Structures data:', response.data);
        setStructures(response.data.structures || []);
        setPagination(response.data.pagination);
        setSummary(response.data.summary);
      } else {
        throw new Error('Failed to fetch structures');
      }
    } catch (err: any) {
      console.error('Error fetching structures:', err);
      setError(err.error || err.message || 'Failed to fetch structures');
      setStructures([]);
      setPagination(null);
      setSummary(null);
    } finally {
      setIsLoading(false);
    }
  }, [page, limit, status, search, sortBy, sortOrder]);

  const refreshStructures = useCallback(async () => {
    await fetchStructures();
  }, [fetchStructures]);

  const searchStructures = useCallback(async (query: string) => {
    setSearch(query);
    setPage(1); // Reset to first page when searching
  }, []);

  // Auto-fetch on mount and when params change
  useEffect(() => {
    if (params.autoFetch !== false) {
      fetchStructures();
    }
  }, [fetchStructures, params.autoFetch]);

  // Sync with external params when they change
  useEffect(() => {
    if (params.page !== undefined && params.page !== page) setPage(params.page);
    if (params.search !== undefined && params.search !== search) setSearch(params.search);
    if (params.status !== undefined && params.status !== status) setStatus(params.status);
    if (params.sortBy !== undefined && params.sortBy !== sortBy) setSortBy(params.sortBy);
    if (params.sortOrder !== undefined && params.sortOrder !== sortOrder) setSortOrder(params.sortOrder as 'asc' | 'desc');
  }, [params.page, params.search, params.status, params.sortBy, params.sortOrder, page, search, status, sortBy, sortOrder]);

  return {
    structures,
    pagination,
    summary,
    isLoading,
    error,
    fetchStructures,
    refreshStructures,
    searchStructures,
    setPage,
    setStatus,
    setSearch,
    setSortBy,
    setSortOrder,
  };
};

// Hook for managing a single structure
interface UseStructureReturn {
  structure: Structure | null;
  isLoading: boolean;
  error: string | null;
  fetchStructure: () => Promise<void>;
  refreshStructure: () => Promise<void>;
}

export const useStructure = (structureId: string | null): UseStructureReturn => {
  const [structure, setStructure] = useState<Structure | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStructure = useCallback(async () => {
    if (!structureId) return;

    setIsLoading(true);
    setError(null);

    try {
      const structureData = await structuresService.getStructureById(structureId);
      setStructure(structureData);
    } catch (err: any) {
      setError(err.error || err.message || 'Failed to fetch structure');
      setStructure(null);
    } finally {
      setIsLoading(false);
    }
  }, [structureId]);

  const refreshStructure = useCallback(async () => {
    await fetchStructure();
  }, [fetchStructure]);

  useEffect(() => {
    if (structureId) {
      fetchStructure();
    } else {
      setStructure(null);
      setError(null);
    }
  }, [structureId, fetchStructure]);

  return {
    structure,
    isLoading,
    error,
    fetchStructure,
    refreshStructure,
  };
};

// Hook for managing structure remarks
interface UseStructureRemarksReturn {
  remarks: any | null;
  isLoading: boolean;
  error: string | null;
  fetchRemarks: () => Promise<void>;
  addRemark: (text: string) => Promise<void>;
  updateRemark: (remarkId: string, text: string) => Promise<void>;
  deleteRemark: (remarkId: string) => Promise<void>;
  refreshRemarks: () => Promise<void>;
}

export const useStructureRemarks = (structureId: string | null): UseStructureRemarksReturn => {
  const [remarks, setRemarks] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRemarks = useCallback(async () => {
    if (!structureId) return;

    setIsLoading(true);
    setError(null);

    try {
      const remarksData = await structuresService.getStructureRemarks(structureId);
      setRemarks(remarksData);
    } catch (err: any) {
      setError(err.error || err.message || 'Failed to fetch remarks');
      setRemarks(null);
    } finally {
      setIsLoading(false);
    }
  }, [structureId]);

  const addRemark = useCallback(async (text: string) => {
    if (!structureId) return;

    setIsLoading(true);
    try {
      await structuresService.addRemark(structureId, { text });
      await fetchRemarks(); // Refresh remarks after adding
    } catch (err: any) {
      setError(err.error || err.message || 'Failed to add remark');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [structureId, fetchRemarks]);

  const updateRemark = useCallback(async (remarkId: string, text: string) => {
    if (!structureId) return;

    setIsLoading(true);
    try {
      await structuresService.updateRemark(structureId, remarkId, { text });
      await fetchRemarks(); // Refresh remarks after updating
    } catch (err: any) {
      setError(err.error || err.message || 'Failed to update remark');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [structureId, fetchRemarks]);

  const deleteRemark = useCallback(async (remarkId: string) => {
    if (!structureId) return;

    setIsLoading(true);
    try {
      await structuresService.deleteRemark(structureId, remarkId);
      await fetchRemarks(); // Refresh remarks after deleting
    } catch (err: any) {
      setError(err.error || err.message || 'Failed to delete remark');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [structureId, fetchRemarks]);

  const refreshRemarks = useCallback(async () => {
    await fetchRemarks();
  }, [fetchRemarks]);

  useEffect(() => {
    if (structureId) {
      fetchRemarks();
    } else {
      setRemarks(null);
      setError(null);
    }
  }, [structureId, fetchRemarks]);

  return {
    remarks,
    isLoading,
    error,
    fetchRemarks,
    addRemark,
    updateRemark,
    deleteRemark,
    refreshRemarks,
  };
};

export default useStructures;