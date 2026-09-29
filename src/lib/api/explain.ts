import { fetchWithFallback } from './client';
import { ExplainData, ChangeExplanationData, WeatherVariable, ApiResponse } from './types';
import { getMockExplain, getMockChangeExplanation } from '../../data/mock/explainData';

export async function getExplain(
  regionId: string = 'uttar-pradesh',
  cycle: string = 'latest',
  day: number = 7,
  variable: WeatherVariable = 'rainfall'
): Promise<ApiResponse<ExplainData>> {
  return fetchWithFallback<ExplainData>(
    `/explain?region=${regionId}&cycle=${cycle}&day=${day}&variable=${variable}`,
    () => getMockExplain(regionId, day, variable)
  );
}

export async function getChangeExplanation(
  regionId: string = 'uttar-pradesh',
  day: number = 7,
  variable: WeatherVariable = 'rainfall',
  fromCycle?: string,
  toCycle?: string
): Promise<ApiResponse<ChangeExplanationData>> {
  return fetchWithFallback<ChangeExplanationData>(
    `/explain/change?region=${regionId}&day=${day}&variable=${variable}&from=${fromCycle || 'prev'}&to=${toCycle || 'latest'}`,
    () => getMockChangeExplanation(regionId, day, variable)
  );
}
