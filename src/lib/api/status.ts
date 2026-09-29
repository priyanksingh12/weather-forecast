import { fetchWithFallback } from './client';
import { SystemStatusData, ApiResponse } from './types';
import { getMockSystemStatus } from '../../data/mock/pipelineStatusData';

export async function getSystemStatus(): Promise<ApiResponse<SystemStatusData>> {
  return fetchWithFallback<SystemStatusData>('/status', () => getMockSystemStatus());
}
