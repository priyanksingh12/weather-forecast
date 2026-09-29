import { fetchWithFallback } from './client';
import { RegionForecastData, WeatherVariable, ApiResponse } from './types';
import { getMockMultiModelForecast } from '../../data/mock/reliabilityData';

export async function getForecast(
  regionId: string = 'uttar-pradesh',
  cycle: string = 'latest',
  variable: WeatherVariable = 'rainfall'
): Promise<ApiResponse<RegionForecastData>> {
  return fetchWithFallback<RegionForecastData>(
    `/forecast?region=${regionId}&cycle=${cycle}&variable=${variable}`,
    () => getMockMultiModelForecast(regionId, variable)
  );
}
