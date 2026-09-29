export type DataQuality = 'ok' | 'stale' | 'degraded' | 'unavailable';
export type ConfidenceBand = 'High' | 'Moderate' | 'Low';
export type WeatherVariable = 'rainfall' | 'tmax' | 'tmin' | 'wind' | 'mslp' | 'humidity';
export type NWPModel = 'ecmwf-ifs' | 'ecmwf-aifs' | 'noaa-gfs';

export interface CycleMeta {
  model: NWPModel;
  init_time_utc: string; // ISO 8601
  label?: string;
}

export interface ApiMeta {
  cycle: CycleMeta;
  data_timestamp_utc: string;
  generated_at_utc: string;
  model_version: string;
  bust_definition_version: string;
  units: Record<string, string>;
  data_quality: DataQuality;
  request_id: string;
  mock?: boolean;
}

export interface ApiResponse<T> {
  meta: ApiMeta;
  data: T;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

export interface ApiErrorResponse {
  meta: Pick<ApiMeta, 'generated_at_utc' | 'request_id'>;
  error: ApiError;
}

// Region types
export interface RegionSummary {
  id: string; // e.g. "uttar-pradesh", "delhi-nct"
  name_en: string;
  name_hi: string;
  type: 'state' | 'city' | 'district' | 'country';
  parent_id: string | null;
  centroid: [number, number]; // [lng, lat]
  bbox: [number, number, number, number]; // [minLng, minLat, maxLng, maxLat]
}

// Bust Map Types
export interface BustFeatureProperties {
  region_id: string;
  region_name: string;
  lead_day: number;
  variable: WeatherVariable;
  p_bust_cal: number; // 0.00 to 1.00
  p_bust_raw: number;
  confidence_band: ConfidenceBand;
  confidence_score: number; // 100 * (1 - p_bust_cal)
  forecast_value_mean: number;
  forecast_value_max: number;
  unit: string;
  err_q50: number;
  err_q90: number;
  primary_driver: string;
}

export interface BustMapGeoJSON {
  type: 'FeatureCollection';
  features: {
    type: 'Feature';
    id?: string | number;
    geometry: {
      type: 'Polygon' | 'MultiPolygon';
      coordinates: number[][][] | number[][][][];
    };
    properties: BustFeatureProperties;
  }[];
}

// Reliability Types
export interface DayReliabilityPoint {
  lead_day: number; // 1 to 10
  valid_time_start_utc: string;
  valid_time_end_utc: string;
  p_bust_cal: number;
  p_bust_raw: number;
  confidence_band: ConfidenceBand;
  confidence_score: number;
  forecast_value: number;
  err_expected_range: [number, number]; // [q10, q90]
  primary_risk_driver: string;
}

export interface RegionReliabilityData {
  region_id: string;
  region_name: string;
  variable: WeatherVariable;
  unit: string;
  thresholds: {
    low_band_max: number; // e.g. 0.25
    high_band_min: number; // e.g. 0.55
  };
  horizon: DayReliabilityPoint[];
}

// Forecast Types
export interface MultiModelForecastPoint {
  lead_day: number;
  ecmwf_ifs: number;
  noaa_gfs: number;
  ensemble_mean: number | null;
  ensemble_std: number | null;
  climatology_mean: number;
}

export interface RegionForecastData {
  region_id: string;
  variable: WeatherVariable;
  unit: string;
  forecasts: MultiModelForecastPoint[];
}

// Explainability Types
export interface TopFactor {
  factor_key: 'model_disagreement' | 'run_instability' | 'synoptic_gradient' | 'regime_persistence' | 'extreme_anomaly' | 'ensemble_spread' | 'historical_similarity';
  title: string;
  description: string;
  metric_label: string;
  metric_value: string;
  importance_score: number; // 0.00 to 1.00
  evidence_data?: {
    model_a: { name: string; val: number };
    model_b: { name: string; val: number };
  };
}

export interface ExplainData {
  region_id: string;
  region_name: string;
  lead_day: number;
  variable: WeatherVariable;
  text_en: string;
  text_hi: string;
  factors: TopFactor[];
  trust_guidance: string;
}

export interface ChangeExplanationData {
  region_id: string;
  region_name: string;
  lead_day: number;
  variable: WeatherVariable;
  from_cycle: string;
  to_cycle: string;
  prev_p_bust: number;
  curr_p_bust: number;
  prev_band: ConfidenceBand;
  curr_band: ConfidenceBand;
  summary_en: string;
  delta_factors: {
    factor_name: string;
    delta_contribution: number;
    explanation: string;
  }[];
}

// History & Error Types
export interface ForecastVsActualPoint {
  valid_date: string;
  forecast_value: number;
  observed_value: number;
  error: number;
  abs_error: number;
  is_bust: boolean;
  truth_source: 'NASA_IMERG_LATE' | 'METAR' | 'ERA5T' | 'IMD_GRIDDED';
}

export interface ForecastVsActualData {
  region_id: string;
  region_name: string;
  variable: WeatherVariable;
  lead_day: number;
  unit: string;
  points: ForecastVsActualPoint[];
}

export interface ErrorTrendPoint {
  date: string;
  mae: number;
  rmse: number;
  bust_rate: number;
  sample_count: number;
}

export interface ErrorTrendsData {
  region_id: string;
  region_name: string;
  variable: WeatherVariable;
  lead_day: number;
  unit: string;
  trends: ErrorTrendPoint[];
}

export interface WeatherEvent {
  event_id: string;
  name: string;
  type: 'cyclone' | 'heatwave' | 'heavy_rain' | 'western_disturbance';
  start_date: string;
  end_date: string;
  severity: 'moderate' | 'severe' | 'extremely_severe';
  source: string;
}

// Similar Events (Analogs) Types
export interface HistoricalAnalog {
  analog_event_id: string;
  event_name: string;
  historical_date: string;
  similarity_score: number;
  forecast_issued: number;
  observed_actual: number;
  actual_error: number;
  did_bust: boolean;
  synoptic_summary: string;
}

export interface SimilarEventsData {
  region_id: string;
  region_name: string;
  lead_day: number;
  variable: WeatherVariable;
  analogs: HistoricalAnalog[];
  analog_bust_frequency: number; // e.g. 0.80
}

// Time Machine Replay Types
export interface ReplayLeadStep {
  lead_day: number;
  cycle_init_time_utc: string;
  forecast_value: number;
  observed_truth: number;
  error_at_lead: number;
  p_bust_cal: number;
  band: ConfidenceBand;
  top_risk_reason: string;
}

export interface TimeMachineReplayData {
  event_id: string;
  event_name: string;
  valid_date: string;
  region_id: string;
  region_name: string;
  variable: WeatherVariable;
  unit: string;
  final_observation: number;
  steps: ReplayLeadStep[];
}

// Pipeline & Data Freshness Types
export interface SourceIngestHealth {
  name: string;
  label: string;
  source_key: 'ecmwf_opendata' | 'noaa_gfs' | 'nasa_imerg' | 'metar_airports' | 'era5t' | 'imd_api';
  last_successful_ingest_utc: string;
  latency_seconds: number;
  health: 'online' | 'lagging' | 'offline';
  last_cycle_ingested?: string;
  description: string;
}

export interface SystemStatusData {
  status: 'healthy' | 'degraded' | 'unhealthy';
  overall_quality: DataQuality;
  latest_forecast_cycle: CycleMeta;
  sources: SourceIngestHealth[];
  active_warnings: string[];
}

// Model Scientific Validation Types
export interface CalibrationBin {
  predicted_prob_center: number;
  observed_frequency: number;
  sample_count: number;
}

export interface ModelCalibrationData {
  variable: WeatherVariable;
  lead_day: number;
  model_version: string;
  bust_definition_version: string;
  training_period: string;
  evaluation_samples: number;
  brier_score: number;
  brier_skill_score_vs_climatology: number;
  roc_auc: number;
  pr_auc: number;
  bins: CalibrationBin[];
  performance_by_lead: { lead_day: number; brier_score: number; pr_auc: number }[];
  performance_by_variable: { variable: WeatherVariable; brier_score: number; pr_auc: number }[];
}

// Report Types
export interface CreateReportRequest {
  region_id: string;
  cycle_id?: string;
  lead_day: number;
  variables: WeatherVariable[];
  include_similar_events: boolean;
  language: 'en' | 'hi';
}

export interface ReportStatusData {
  report_id: string;
  region_id: string;
  status: 'queued' | 'processing' | 'ready' | 'failed';
  download_url?: string;
  expires_at_utc?: string;
  file_size_bytes?: number;
  error_message?: string;
}
