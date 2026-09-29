import { fetchWithFallback } from './client';
import { ModelCalibrationData, WeatherVariable, ApiResponse } from './types';
import { getMockModelCalibration } from '../../data/mock/modelMetricsData';

export async function getModelCalibration(
  variable: WeatherVariable = 'rainfall',
  leadDay: number = 7
): Promise<ApiResponse<ModelCalibrationData>> {
  return fetchWithFallback<ModelCalibrationData>(
    `/model/calibration?variable=${variable}&lead=${leadDay}`,
    () => getMockModelCalibration(variable, leadDay)
  );
}
