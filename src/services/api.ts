/**
 * SIH-2.0 Weather Forecast Confidence & Reliability Platform
 * Fully-typed TypeScript API client with OpenWeather & NWP multi-model support.
 */

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://sih-2-o.onrender.com/api/v1";
const ML_API_URL = process.env.NEXT_PUBLIC_ML_API_URL || "https://ai-forecast-bust-detection-ml.onrender.com";

async function fetchJson<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = endpoint.startsWith("http") ? endpoint : `${BASE_URL}${endpoint}`;
  try {
    const res = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'X-Client-Version': '2.0.0-web',
        ...(options?.headers || {})
      }
    });

    if (!res.ok) {
      let errMsg = `API Error [${res.status}]: ${res.statusText}`;
      try {
        const errJson = await res.json();
        if (errJson?.error?.message) errMsg = errJson.error.message;
      } catch {
        // ignore parse error
      }
      throw new Error(errMsg);
    }

    const envelope = await res.json();
    return (envelope.data !== undefined ? envelope.data : envelope) as T;
  } catch (err: any) {
    console.warn(`[weatherApi] Request failed for ${endpoint}:`, err.message);
    throw err;
  }
}

export interface RegionItem {
  id: number;
  slug: string;
  name: string;
  type: string;
  centroid: { lat: number; lon: number };
}

export interface ConsensusModel {
  model_name: string;
  value: number;
  unit: string;
  historical_mae: number;
}

export interface ConsensusData {
  region: { id: number; slug: string; name: string; type: string };
  variable: string;
  lead_day: number;
  models: ConsensusModel[];
  spread: number;
  consensus_score: number;
  bust_risk_score: number;
  bust_risk_level: 'LOW' | 'MODERATE' | 'HIGH';
  recommended_model: string;
  summary_en: string;
  summary_hi: string;
}

export interface HorizonDay {
  lead_day: number;
  lead_hours: number;
  confidence_score: number;
  bust_probability: number;
  expected_mae: number;
  ecmwf_confidence?: number;
  gfs_confidence?: number;
  model_spread?: number;
  confidence_band: 'HIGH' | 'MODERATE' | 'LOW';
  primary_uncertainty_driver: string;
  is_bust_wall: boolean;
}

export interface HorizonData {
  region_slug: string;
  region_name: string;
  variable: string;
  bust_horizon_day: number;
  operational_cutoff_day: number;
  mean_10day_confidence: number;
  decay_rate_pct_per_day: number;
  synoptic_amplifier_active: boolean;
  horizon_days: HorizonDay[];
  operational_guidance_en: string;
  operational_guidance_hi: string;
}

export interface CycloneData {
  active_cyclones: Array<{
    id: number;
    name: string;
    basin: string;
    classification: string;
    current_wind_kt: number;
    current_wind_kmh: number;
    central_pressure_hpa: number;
    ri_risk: {
      risk_score: number;
      risk_level: 'LOW' | 'MODERATE' | 'HIGH';
      sst_celsius: number;
      vertical_wind_shear_kt: number;
      ocean_heat_content_kj: number;
      trigger_reason: string;
    };
    landfall: {
      target_coastline: string;
      estimated_landfall_utc: string;
      timing_uncertainty_hours: number;
      coordinate_spread_km: number;
      confidence_level: string;
    };
    track: Array<{
      lead_day: number;
      intensity_stage: string;
      track_spread_km: number;
      bust_probability: number;
      confidence_band: string;
    }>;
    coastal_impacts: Array<{
      state_name: string;
      lead_day: number;
      max_wind_kmh: number;
      peak_rainfall_mm: number;
      bust_risk_score: number;
      imd_alert_level: 'RED' | 'ORANGE' | 'YELLOW';
    }>;
    operational_guidance_en: string;
    operational_guidance_hi: string;
  }>;
  historical_failure_catalog: Array<{
    name: string;
    year: number;
    bust_type: string;
    nwp_intensity_error_kt?: number;
    nwp_track_error_km?: number;
    operational_lesson: string;
  }>;
}

export interface SynopticData {
  synoptic_summary: {
    macro_pattern: string;
    himalayan_snowline_vulnerability: string;
    monsoon_trough_deluge_vulnerability: string;
  };
  active_western_disturbances: Array<{
    name: string;
    orographic_amplification_factor: number;
    cloudburst_vulnerability: string;
    narrative_en?: string;
    narrative_hi?: string;
    operational_guidance_en?: string;
    operational_guidance_hi?: string;
    affected_states: Array<{
      state_name: string;
      elevation_zone?: string;
      freezing_level_m: number;
      snow_rain_boundary_uncertainty_m: number;
      bust_risk_score: number;
      alert_level: 'RED' | 'ORANGE' | 'YELLOW';
      primary_failure_mode: string;
    }>;
  }>;
  active_monsoon_depressions: Array<{
    name: string;
    heavy_rain_radius_km: number;
    affected_states: Array<{
      state_name: string;
      lead_day: number;
      deluge_multiplier: number;
      trough_axis_divergence_km: number;
      bust_risk_score: number;
      alert_level: 'RED' | 'ORANGE' | 'YELLOW';
    }>;
  }>;
  historical_failure_analogs: Array<{
    event_name: string;
    year: number;
    system_type?: string;
    similarity?: number;
    nwp_forecast_error?: string;
    failure_analysis?: string;
    primary_failure_mode: string;
    operational_lesson: string;
  }>;
}

// -------------------------------------------------------------
// OpenWeather Real-Time Ground Truth & Telemetry Interfaces
// -------------------------------------------------------------
export interface WeatherCondition {
  id: number;
  main: string;
  description: string;
  icon: string;
  icon_url: string;
}

export interface LiveWeatherOut {
  coord: { lat: number; lon: number };
  region_id?: number | null;
  region_name: string;
  country: string;
  weather: WeatherCondition[];
  temp: number;
  feels_like: number;
  temp_min: number;
  temp_max: number;
  pressure_hpa: number;
  humidity_pct: number;
  wind_speed_mps: number;
  wind_deg?: number | null;
  wind_gust_mps?: number | null;
  clouds_pct: number;
  visibility_m?: number | null;
  rain_1h_mm?: number | null;
  snow_1h_mm?: number | null;
  observed_at_utc: string;
  sunrise_utc?: string | null;
  sunset_utc?: string | null;
  source: string;
}

export interface AirPollutantLevels {
  co: number;
  no: number;
  no2: number;
  o3: number;
  so2: number;
  pm2_5: number;
  pm10: number;
  nh3: number;
}

export type AqiCategory = "Good" | "Fair" | "Moderate" | "Poor" | "Very Poor";

export interface AirQualityOut {
  coord: { lat: number; lon: number };
  region_name?: string | null;
  aqi: number; // 1: Good, 2: Fair, 3: Moderate, 4: Poor, 5: Very Poor
  aqi_category: AqiCategory;
  pollutants: AirPollutantLevels;
  timestamp_utc: string;
}

export interface Forecast3HourPoint {
  dt_utc: string;
  temp: number;
  feels_like: number;
  temp_min: number;
  temp_max: number;
  pressure_hpa: number;
  humidity_pct: number;
  weather: WeatherCondition[];
  clouds_pct: number;
  wind_speed_mps: number;
  pop: number; // Probability of precipitation (0.0 - 1.0)
  rain_3h_mm?: number | null;
}

export interface WeatherForecast5DayOut {
  coord: { lat: number; lon: number };
  region_name: string;
  country: string;
  count: number;
  list: Forecast3HourPoint[];
}

export interface WeatherTileLayer {
  layer_id: string;
  name: string;
  url_template: string;
  description: string;
}

export interface WeatherTilesOut {
  layers: WeatherTileLayer[];
}

export const weatherApi = {
  // System Health
  getHealth: () => fetchJson<{ status: string; checks: { db: boolean; redis: boolean } }>("/health"),

  // Regions
  getRegions: (limit: number = 100, type?: string) => 
    fetchJson<RegionItem[]>(`/regions?limit=${limit}${type ? `&type=${encodeURIComponent(type)}` : ''}`),
  searchRegions: (query: string) => fetchJson<RegionItem[]>(`/regions/search?q=${encodeURIComponent(query)}`),

  // Forecast Series (Day 1-10)
  getForecast: (region: string, variable: string = "rainfall") =>
    fetchJson<any>(`/forecast?region=${encodeURIComponent(region)}&variable=${encodeURIComponent(variable)}`),

  // Historical Verification (FVA)
  getHistoryFva: (region: string, variable: string = "rainfall", lead: number = 1, window: number = 30) =>
    fetchJson<any>(`/history/fva?region=${encodeURIComponent(region)}&variable=${encodeURIComponent(variable)}&lead=${lead}&window=${window}`),

  // Multi-Model Consensus (ECMWF vs GFS)
  getConsensus: (region: string, variable: string = "rainfall", lead: number = 1) =>
    fetchJson<ConsensusData>(`/consensus?region=${encodeURIComponent(region)}&variable=${encodeURIComponent(variable)}&lead=${lead}`),

  // 10-Day Forecast Horizon Decay & Predictability Wall
  getHorizon: (region: string = "delhi", variable: string = "temperature") =>
    fetchJson<HorizonData>(`/horizon?region=${encodeURIComponent(region)}&variable=${encodeURIComponent(variable)}`),

  getBustWall: (region: string = "delhi", variable: string = "temperature") =>
    fetchJson<any>(`/horizon/bust-wall?region=${encodeURIComponent(region)}&variable=${encodeURIComponent(variable)}`),

  // Cyclone Track & RI Risk
  getCyclone: () => fetchJson<CycloneData>("/cyclone"),
  getCycloneAnalogs: () => fetchJson<any>("/cyclone/analogs"),

  // Synoptic (Western Disturbances & Monsoon Depressions)
  getSynoptic: () => fetchJson<SynopticData>("/synoptic"),
  getWesternDisturbances: () => fetchJson<any>("/synoptic/western-disturbances"),
  getMonsoonDepressions: () => fetchJson<any>("/synoptic/monsoon-depressions"),

  // Pipeline Status & Freshness
  getStatus: () => fetchJson<any>("/status"),

  // Reliability Strip (Day 1-10)
  getReliability: (region: string, variable: string = "rainfall") =>
    fetchJson<Array<any>>(`/reliability?region=${encodeURIComponent(region)}&variable=${encodeURIComponent(variable)}`),

  // Spatial GeoJSON Bust Map
  getMapBust: (lead: number = 1, variable: string = "rainfall") =>
    fetchJson<any>(`/map/bust?lead=${lead}&variable=${encodeURIComponent(variable)}`),
  getHotspots: (lead: number = 1, variable: string = "rainfall") =>
    fetchJson<Array<any>>(`/map/hotspots?lead=${lead}&variable=${encodeURIComponent(variable)}`),

  // AI Forecast Bust Detection (LightGBM)
  getMlInfo: () => fetchJson<any>("/ml/info"),
  predictRegionBust: (region: string, variable: string = "temperature", leadDay: number = 1) =>
    fetchJson<any>(`/ml/predict-region?region=${encodeURIComponent(region)}&variable=${variable}&lead_day=${leadDay}`),

  // Automated PDF Reports
  createReport: (payload: { region_id: number; lead_day: number; variable: string; language?: string }) =>
    fetchJson<any>("/reports", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  getReportStatus: (reportId: string) => fetchJson<any>(`/reports/${reportId}`),

  // WhatsApp Alert Subscriptions
  createSubscription: (payload: { region_id: number; variable: string; lead_days: number[] }) =>
    fetchJson<any>("/subscriptions", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  // Extreme Events & Time Machine Replay
  getEvents: (limit: number = 20) => fetchJson<Array<any>>(`/events?limit=${limit}`),
  getReplay: (eventId: number, region?: string, variable: string = "rainfall") => {
    const q = region ? `?region=${encodeURIComponent(region)}&variable=${variable}` : `?variable=${variable}`;
    return fetchJson<any>(`/replay/${eventId}${q}`);
  },

  // Similar Historical Analogs
  getSimilar: (region: string, variable: string = "rainfall", lead: number = 1, k: number = 5) =>
    fetchJson<any>(`/similar?region=${encodeURIComponent(region)}&variable=${variable}&lead=${lead}&k=${k}`),

  // ML Metrics & Calibration
  getModelMetrics: () => fetchJson<any>("/model/metrics"),
  getModelCalibration: (variable: string = "rainfall", lead: number = 1) =>
    fetchJson<any>(`/model/calibration?variable=${variable}&lead=${lead}`),
  getScorecard: (window: number = 30) => fetchJson<any>(`/scorecard?window=${window}`),

  // OpenWeather Live Observations, AQI, 5-Day Forecast & Tiles
  getLiveWeather: (params?: { region?: string; lat?: number; lon?: number; units?: "metric" | "imperial" }) => {
    const q = new URLSearchParams();
    if (params?.region) q.set("region", params.region);
    if (params?.lat !== undefined) q.set("lat", params.lat.toString());
    if (params?.lon !== undefined) q.set("lon", params.lon.toString());
    if (params?.units) q.set("units", params.units);
    return fetchJson<LiveWeatherOut>(`/weather/live?${q.toString()}`);
  },

  getAirQuality: (params?: { region?: string; lat?: number; lon?: number }) => {
    const q = new URLSearchParams();
    if (params?.region) q.set("region", params.region);
    if (params?.lat !== undefined) q.set("lat", params.lat.toString());
    if (params?.lon !== undefined) q.set("lon", params.lon.toString());
    return fetchJson<AirQualityOut>(`/weather/air-quality?${q.toString()}`);
  },

  get5DayForecast: (params?: { region?: string; lat?: number; lon?: number; units?: "metric" | "imperial" }) => {
    const q = new URLSearchParams();
    if (params?.region) q.set("region", params.region);
    if (params?.lat !== undefined) q.set("lat", params.lat.toString());
    if (params?.lon !== undefined) q.set("lon", params.lon.toString());
    if (params?.units) q.set("units", params.units);
    return fetchJson<WeatherForecast5DayOut>(`/weather/forecast-5day?${q.toString()}`);
  },

  getWeatherTiles: () => fetchJson<WeatherTilesOut>("/weather/tiles"),
};
