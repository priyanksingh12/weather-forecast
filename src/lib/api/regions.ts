import { fetchWithFallback } from './client';
import { RegionSummary, ApiResponse } from './types';
import { INDIA_REGIONS } from '../geo/indiaGeoJson';

export async function getRegions(): Promise<ApiResponse<RegionSummary[]>> {
  return fetchWithFallback<RegionSummary[]>('/regions', () => INDIA_REGIONS);
}

export async function searchRegions(query: string): Promise<ApiResponse<RegionSummary[]>> {
  return fetchWithFallback<RegionSummary[]>(`/regions/search?q=${encodeURIComponent(query)}`, () => {
    const q = query.trim().toLowerCase();
    if (!q) return INDIA_REGIONS;
    return INDIA_REGIONS.filter(
      (r) =>
        r.name_en.toLowerCase().includes(q) ||
        r.name_hi.includes(q) ||
        r.id.toLowerCase().includes(q)
    );
  });
}
