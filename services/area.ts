import { apiClient } from './api';
import type { ActionDto, AreaDto, ReactionDto } from '@/types/areas';
import * as mockService from './__mocks__/areas.mock';
import { ENV } from './api.config';

const USE_MOCK = ENV.USE_MOCK;
const MOCK_DELAY = ENV.MOCK_DELAY;

export interface CreateAreaPayload {
  name: string;
  description?: string;
  enabled?: boolean;
  actions: ActionDto[];
  reactions: ReactionDto[];
}

export type UpdateAreaPayload = Partial<CreateAreaPayload>;

export async function listAreas(): Promise<AreaDto[]> {
  if (USE_MOCK) {
    return mockService.listAreas({ delay: MOCK_DELAY });
  }

  return apiClient.get<AreaDto[]>('/api/areas');
}

export async function getArea(id: string): Promise<AreaDto | null> {
  if (USE_MOCK) {
    return mockService.getArea(id, { delay: MOCK_DELAY });
  }

  try {
    return await apiClient.get<AreaDto>(`/api/areas/${encodeURIComponent(id)}`);
  } catch (error) {
    if (error instanceof Error && error.message.includes('404')) {
      return null;
    }
    throw error;
  }
}

export async function getUserAreas(userId: string) : Promise<AreaDto[]> {
  if (USE_MOCK) {
    return mockService.listAreas({ delay: MOCK_DELAY });
  }
  return apiClient.get<AreaDto[]>(`/api/areas/user/${encodeURIComponent(userId)}`);
}

export async function createArea(payload: CreateAreaPayload): Promise<AreaDto> {
  if (USE_MOCK) {
    return mockService.createArea(payload, { delay: MOCK_DELAY });
  }

  return apiClient.post<AreaDto>('/api/areas', payload);
}

export async function updateArea(id: string, updates: UpdateAreaPayload): Promise<AreaDto> {
  if (USE_MOCK) {
    return mockService.updateArea(id, updates, { delay: MOCK_DELAY });
  }

  return apiClient.put<AreaDto>(`/api/areas/${encodeURIComponent(id)}`, updates);
}

export async function deleteArea(id: string): Promise<void> {
  if (USE_MOCK) {
    await mockService.deleteArea(id, { delay: MOCK_DELAY });
    return;
  }

  await apiClient.delete<void>(`/api/areas/${encodeURIComponent(id)}`);
}

export async function toggleArea(id: string, enabled: boolean): Promise<AreaDto> {
  return updateArea(id, { enabled });
}
