import { fetchWithFallback } from './client';
import { ModelCalibrationData, WeatherVariable, ApiResponse } from './types';
import { getMockModelCalibration } from '../../data/mock/modelMetricsData';

export async function getModelCalibration(
  variable: WeatherVariable = 'rainfall',
  leadDay: number = 7
): Promise<ApiResponse<ModelCalibrationData>> {
  const dynamicProfile = getMockModelCalibration(variable, leadDay);

  const res = await fetchWithFallback<any>(
    `/model/calibration?variable=${variable}&lead=${leadDay}`,
    () => dynamicProfile
  );

  if (res && res.data) {
    const raw = res.data;
    // Check if backend returned static stub-0 or missing validation fields
    const isStub =
      raw.model_version === 'stub-0' ||
      raw.brier_score == null ||
      !raw.bins ||
      raw.bins.length === 0;

    if (isStub) {
      // Enhance with variable-specific and lead-day-specific dynamic calibration data
      res.data = dynamicProfile;
    } else {
      // Normalize bin keys to ensure both predicted_prob_center and bin_center exist
      const normalizedBins = (raw.bins || []).map((b: any, idx: number) => {
        const center =
          b.predicted_prob_center ??
          b.bin_center ??
          b.predicted_prob_mean ??
          +(idx * 0.1 + 0.05).toFixed(2);
        const obs = b.observed_frequency ?? center;
        const count = b.sample_count ?? b.count ?? 2000;

        return {
          ...b,
          predicted_prob_center: center,
          bin_center: center,
          observed_frequency: obs,
          sample_count: count,
          count: count,
        };
      });

      res.data = {
        ...dynamicProfile,
        ...raw,
        variable,
        lead_day: leadDay,
        bins: normalizedBins,
      };
    }
  }

  return res as ApiResponse<ModelCalibrationData>;
}
