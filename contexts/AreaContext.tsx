import React, { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { AreaDto } from '@/types/areas';
import * as areaService from '@/services/areas';
import { useAuth } from './AuthContext';

interface AreaContextValue {
  areas: AreaDto[];
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;
  fetchAreas: () => Promise<void>;
  refreshAreas: () => Promise<void>;
  createArea: (payload: areaService.CreateAreaPayload) => Promise<AreaDto>;
  updateArea: (id: string, updates: areaService.UpdateAreaPayload) => Promise<AreaDto>;
  deleteArea: (id: string) => Promise<void>;
  toggleArea: (id: string, enabled: boolean) => Promise<AreaDto>;
  clearError: () => void;
}

const AreaContext = createContext<AreaContextValue | undefined>(undefined);

interface AreaProviderProps {
  children: ReactNode;
}

export function AreaProvider({ children }: AreaProviderProps) {
  const [areas, setAreas] = useState<AreaDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const handleError = useCallback((err: unknown) => {
    const message = err instanceof Error ? err.message : 'Something went wrong';
    setError(message);
    console.error('AreaContext error:', err);
  }, []);

  const loadAreas = useCallback(async (useRefreshingState: boolean) => {
    if (useRefreshingState) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }

    setError(null);

    try {
      const result = await areaService.getUserAreas(user?.id || 'null');
      setAreas(result);
    } catch (err) {
      handleError(err);
    } finally {
      if (useRefreshingState) {
        setIsRefreshing(false);
      } else {
        setIsLoading(false);
      }
    }
  }, [handleError]);

  const fetchAreas = useCallback(async () => {
    await loadAreas(false);
  }, [loadAreas]);

  const refreshAreas = useCallback(async () => {
    await loadAreas(true);
  }, [loadAreas]);

  useEffect(() => {
    fetchAreas();
  }, [fetchAreas]);

  const createArea = useCallback(async (payload: areaService.CreateAreaPayload) => {
    setError(null);
    try {
      const created = await areaService.createArea(payload);
      setAreas(prev => [created, ...prev]);
      return created;
    } catch (err) {
      handleError(err);
      throw err;
    }
  }, [handleError]);

  const updateArea = useCallback(async (id: string, updates: areaService.UpdateAreaPayload) => {
    setError(null);
    try {
      const updated = await areaService.updateArea(id, updates);
      setAreas(prev => prev.map(area => (area.id === id ? updated : area)));
      return updated;
    } catch (err) {
      handleError(err);
      throw err;
    }
  }, [handleError]);

  const deleteArea = useCallback(async (id: string) => {
    setError(null);
    try {
      await areaService.deleteArea(id);
      setAreas(prev => prev.filter(area => area.id !== id));
    } catch (err) {
      handleError(err);
      throw err;
    }
  }, [handleError]);

  const toggleArea = useCallback(async (id: string, enabled: boolean) => {
    setError(null);
    try {
      const updated = await areaService.toggleArea(id, enabled);
      setAreas(prev => prev.map(area => (area.id === id ? updated : area)));
      return updated;
    } catch (err) {
      handleError(err);
      throw err;
    }
  }, [handleError]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const value = useMemo<AreaContextValue>(() => ({
    areas,
    isLoading,
    isRefreshing,
    error,
    fetchAreas,
    refreshAreas,
    createArea,
    updateArea,
    deleteArea,
    toggleArea,
    clearError,
  }), [areas, isLoading, isRefreshing, error, fetchAreas, refreshAreas, createArea, updateArea, deleteArea, toggleArea, clearError]);

  return (
    <AreaContext.Provider value={value}>
      {children}
    </AreaContext.Provider>
  );
}

export function useArea() {
  const context = useContext(AreaContext);
  if (!context) {
    throw new Error('useArea must be used within an AreaProvider');
  }
  return context;
}
