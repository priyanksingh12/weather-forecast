import { fetchWithFallback } from './client';
import { RegionReliabilityData, BustMapGeoJSON, WeatherVariable, ApiResponse } from './types';
import { getIndiaBustMapGeoJSON } from '../geo/indiaGeoJson';
import { getMockReliability } from '../../data/mock/reliabilityData';

export async function getBustMap(
  cycle: string = 'latest',
  day: number = 7,
  variable: WeatherVariable = 'rainfall'
): Promise<ApiResponse<BustMapGeoJSON>> {
  return fetchWithFallback<BustMapGeoJSON>(
    `/map/bust?cycle=${cycle}&day=${day}&variable=${variable}`,
    () => getIndiaBustMapGeoJSON(variable, day)
  );
}

export async function getReliability(
  regionId: string = 'uttar-pradesh',
  cycle: string = 'latest',
  variable: WeatherVariable = 'rainfall'
): Promise<ApiResponse<RegionReliabilityData>> {
  return fetchWithFallback<RegionReliabilityData>(
    `/reliability?region=${regionId}&cycle=${cycle}&variable=${variable}`,
    () => getMockReliability(regionId, variable)
  );
}
