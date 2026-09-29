import { RegionReliabilityData, RegionForecastData, WeatherVariable, ConfidenceBand, DayReliabilityPoint } from '../../lib/api/types';
import { INDIA_REGIONS, getBustMetricsForRegion } from '../../lib/geo/indiaGeoJson';

export function getMockReliability(regionId: string = 'uttar-pradesh', variable: WeatherVariable = 'rainfall'): RegionReliabilityData {
  const region = INDIA_REGIONS.find((r) => r.id === regionId) || INDIA_REGIONS[0];
  const horizon: DayReliabilityPoint[] = [];

  for (let day = 1; day <= 10; day++) {
    const metrics = getBustMetricsForRegion(region.id, variable, day);
    const validStart = new Date(Date.UTC(2026, 8, 23 + day - 1, 0, 0, 0));
    const validEnd = new Date(Date.UTC(2026, 8, 23 + day, 0, 0, 0));

    horizon.push({
      lead_day: day,
      valid_time_start_utc: validStart.toISOString(),
      valid_time_end_utc: validEnd.toISOString(),
      p_bust_cal: metrics.p_bust_cal,
      p_bust_raw: metrics.p_bust_raw,
      confidence_band: metrics.confidence_band,
      confidence_score: metrics.confidence_score,
      forecast_value: metrics.forecast_value_mean,
      err_expected_range: [-metrics.err_q50, metrics.err_q90],
      primary_risk_driver: metrics.primary_driver
    });
  }

  let unit = 'mm/24h';
  if (variable === 'tmax' || variable === 'tmin') unit = '°C';
  if (variable === 'wind') unit = 'm/s';
  if (variable === 'mslp') unit = 'hPa';
  if (variable === 'humidity') unit = '%';

  return {
    region_id: region.id,
    region_name: region.name_en,
    variable,
    unit,
    thresholds: {
      low_band_max: 0.25,
      high_band_min: 0.52
    },
    horizon
  };
}

export function getMockMultiModelForecast(regionId: string = 'uttar-pradesh', variable: WeatherVariable = 'rainfall'): RegionForecastData {
  const region = INDIA_REGIONS.find((r) => r.id === regionId) || INDIA_REGIONS[0];
  const forecasts = [];

  for (let day = 1; day <= 10; day++) {
    const metrics = getBustMetricsForRegion(region.id, variable, day);
    const base = metrics.forecast_value_mean;
    const spread = (day / 10) * base * 0.45;

    forecasts.push({
      lead_day: day,
      ecmwf_ifs: Number(base.toFixed(1)),
      noaa_gfs: Number(Math.max(0, base + (day % 2 === 0 ? spread : -spread * 0.7)).toFixed(1)),
      ensemble_mean: Number((base * 0.98).toFixed(1)),
      ensemble_std: Number((spread * 0.6).toFixed(1)),
      climatology_mean: Number((base * 0.85).toFixed(1))
    });
  }

  let unit = 'mm/24h';
  if (variable === 'tmax' || variable === 'tmin') unit = '°C';
  if (variable === 'wind') unit = 'm/s';
  if (variable === 'mslp') unit = 'hPa';
  if (variable === 'humidity') unit = '%';

  return {
    region_id: region.id,
    variable,
    unit,
    forecasts
  };
}
