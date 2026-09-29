import { fetchWithFallback } from './client';
import { SimilarEventsData, TimeMachineReplayData, WeatherVariable, ApiResponse } from './types';
import { getMockSimilarEvents } from '../../data/mock/similarEventsData';
import { getMockReplayEvent } from '../../data/mock/timeMachineData';

export async function getSimilarEvents(
  regionId: string = 'uttar-pradesh',
  cycle: string = 'latest',
  day: number = 7,
  variable: WeatherVariable = 'rainfall',
  k: number = 5
): Promise<ApiResponse<SimilarEventsData>> {
  return fetchWithFallback<SimilarEventsData>(
    `/similar?region=${regionId}&cycle=${cycle}&day=${day}&variable=${variable}&k=${k}`,
    () => getMockSimilarEvents(regionId, day, variable)
  );
}

export async function getTimeMachineReplay(eventId: string = 'cyclone-biparjoy-2023'): Promise<ApiResponse<TimeMachineReplayData>> {
  return fetchWithFallback<TimeMachineReplayData>(
    `/replay/${eventId}`,
    () => getMockReplayEvent(eventId)
  );
}
