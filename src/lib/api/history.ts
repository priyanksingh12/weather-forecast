import { fetchWithFallback } from './client';
import { ForecastVsActualData, ErrorTrendsData, WeatherEvent, WeatherVariable, ApiResponse } from './types';
import { getMockForecastVsActual, getMockErrorTrends, NOTABLE_WEATHER_EVENTS } from '../../data/mock/historyData';

export async function getForecastVsActual(
  regionId: string = 'uttar-pradesh',
  variable: WeatherVariable = 'rainfall',
  leadDay: number = 7,
  fromDate?: string,
  toDate?: string
): Promise<ApiResponse<ForecastVsActualData>> {
  return fetchWithFallback<ForecastVsActualData>(
    `/history/forecast-vs-actual?region=${regionId}&variable=${variable}&lead=${leadDay}&from=${fromDate || ''}&to=${toDate || ''}`,
    () => getMockForecastVsActual(regionId, variable, leadDay)
  );
}

export async function getErrorTrends(
  regionId: string = 'uttar-pradesh',
  variable: WeatherVariable = 'rainfall',
  leadDay: number = 7,
  window: number = 30
): Promise<ApiResponse<ErrorTrendsData>> {
  return fetchWithFallback<ErrorTrendsData>(
    `/history/errors?region=${regionId}&variable=${variable}&lead=${leadDay}&window=${window}`,
    () => getMockErrorTrends(regionId, variable, leadDay, window)
  );
}

export async function getEvents(): Promise<ApiResponse<WeatherEvent[]>> {
  return fetchWithFallback<WeatherEvent[]>('/events', () => NOTABLE_WEATHER_EVENTS);
}
