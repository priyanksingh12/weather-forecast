import { StateWeather } from './types';
import { SAMPLE_WX, DEFAULT_WIND_DIRS } from './sampleData';
import { weatherApi, RegionItem } from '../../services/api';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://sih-2-o.onrender.com/api/v1";

// Normalization helper
export function normalizeStateName(name: string): string {
  return name
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}

// Manual override table for GeoJSON names to backend slugs
const MANUAL_OVERRIDES: Record<string, string> = {
  'andaman-and-nicobar-islands': 'andaman-nicobar',
  'dadra-and-nagar-haveli-and-daman-and-diu': 'daman-diu',
  'jammu-and-kashmir': 'jammu-kashmir',
  'delhi': 'delhi',
  'orissa': 'odisha',
  'uttaranchal': 'uttarakhand',
  'pondicherry': 'puducherry',
  'lakshadweep': 'lakshadweep',
  'ladakh': 'ladakh',
  'chandigarh': 'chandigarh',
  'goa': 'goa',
  'sikkim': 'sikkim'
};

// In-memory weather cache
const weatherCache = new Map<string, StateWeather>();
let slugMapping: Map<string, string> | null = null;

// Tiny concurrency pool without extra dependencies
export async function runWithConcurrency<T, R>(
  items: T[],
  fn: (item: T) => Promise<R>,
  limit: number = 6
): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let currentIndex = 0;

  const workers = new Array(Math.min(limit, items.length)).fill(0).map(async () => {
    while (currentIndex < items.length) {
      const i = currentIndex++;
      try {
        results[i] = await fn(items[i]);
      } catch (err) {
        console.warn(`Error in concurrency pool for item index ${i}:`, err);
      }
    }
  });

  await Promise.all(workers);
  return results;
}

// Build map of GeoJSON state name to backend slug
export async function initSlugMapping(stateNames: string[]): Promise<Map<string, string>> {
  if (slugMapping) return slugMapping;

  slugMapping = new Map<string, string>();

  try {
    const regions = await weatherApi.getRegions(100, 'state').catch(async () => {
      return await weatherApi.getRegions(100);
    });

    const backendSlugsByNorm = new Map<string, string>();
    regions.forEach((r) => {
      const normName = normalizeStateName(r.name);
      backendSlugsByNorm.set(normName, r.slug);
      backendSlugsByNorm.set(r.slug, r.slug);
    });

    stateNames.forEach((geoName) => {
      const norm = normalizeStateName(geoName);
      if (MANUAL_OVERRIDES[norm]) {
        slugMapping!.set(geoName, MANUAL_OVERRIDES[norm]);
      } else if (backendSlugsByNorm.has(norm)) {
        slugMapping!.set(geoName, backendSlugsByNorm.get(norm)!);
      } else {
        // Fallback: test if any backend slug contains or matches
        const candidate = Array.from(backendSlugsByNorm.keys()).find(k => k.includes(norm) || norm.includes(k));
        if (candidate) {
          slugMapping!.set(geoName, backendSlugsByNorm.get(candidate)!);
        } else {
          console.warn(`[IndiaWeatherMap] Unmatched state GeoJSON name: "${geoName}" (normalized: "${norm}")`);
          slugMapping!.set(geoName, norm);
        }
      }
    });
  } catch (err) {
    console.warn('[IndiaWeatherMap] Failed to query /regions from backend. Using normalized names.', err);
    stateNames.forEach((geoName) => {
      const norm = normalizeStateName(geoName);
      slugMapping!.set(geoName, MANUAL_OVERRIDES[norm] || norm);
    });
  }

  return slugMapping;
}

// Full 10-day forecast series cache
interface StateDaySeries {
  rainDays: Record<number, number>;
  windDays: Record<number, number>;
}
const seriesCache = new Map<string, StateDaySeries>();

// Fetch rainfall and wind for a single state (with 10-day series caching)
async function fetchStateMountWeather(geoName: string, slug: string, day: number = 1): Promise<StateWeather> {
  const defaultDir = DEFAULT_WIND_DIRS[geoName] ?? 0.5;

  if (process.env.NEXT_PUBLIC_USE_SAMPLE_DATA === 'true') {
    return SAMPLE_WX[geoName] || {
      rain: 0,
      wind: 2.5,
      pressure: null,
      temp: null,
      rh: null,
      conf: null,
      dir: defaultDir,
      status: 'loaded'
    };
  }

  // If 10-day series is already cached, instantly return the requested day
  if (seriesCache.has(geoName)) {
    const s = seriesCache.get(geoName)!;
    const rain = s.rainDays[day] ?? s.rainDays[1] ?? (SAMPLE_WX[geoName]?.rain ?? 0);
    const wind = s.windDays[day] ?? s.windDays[1] ?? (SAMPLE_WX[geoName]?.wind ?? 2.5);
    const cached = weatherCache.get(geoName);
    const updated: StateWeather = {
      ...(cached || {}),
      rain: +rain.toFixed(1),
      wind: +wind.toFixed(1),
      pressure: cached?.pressure ?? null,
      temp: cached?.temp ?? null,
      rh: cached?.rh ?? null,
      conf: cached?.conf ?? null,
      dir: defaultDir,
      status: 'loaded'
    };
    weatherCache.set(geoName, updated);
    return updated;
  }

  try {
    const [rainRes, windRes] = await Promise.all([
      weatherApi.getForecast(slug, 'rainfall').catch(() => null),
      weatherApi.getForecast(slug, 'wind').catch(() => null)
    ]);

    const rainDays: Record<number, number> = {};
    if (rainRes?.daily_summary && rainRes.daily_summary.length > 0) {
      rainRes.daily_summary.forEach((d: any) => {
        rainDays[d.lead_day] = +(d.total_val ?? d.mean_val ?? d.max_val ?? 0).toFixed(1);
      });
    } else if (rainRes?.values && rainRes.values.length > 0) {
      for (let d = 1; d <= 10; d++) {
        const dVals = rainRes.values.filter((v: any) => v.lead_day === d);
        if (dVals.length > 0) {
          rainDays[d] = +(dVals.reduce((s: number, v: any) => s + (v.value || 0), 0)).toFixed(1);
        }
      }
    }

    const windDays: Record<number, number> = {};
    if (windRes?.daily_summary && windRes.daily_summary.length > 0) {
      windRes.daily_summary.forEach((d: any) => {
        // Use peak wind or daily mean
        const val = d.max_val ?? d.total_val ?? d.mean_val ?? 2.8;
        windDays[d.lead_day] = +Number(val).toFixed(1);
      });
    } else if (windRes?.values && windRes.values.length > 0) {
      for (let d = 1; d <= 10; d++) {
        const dVals = windRes.values.filter((v: any) => v.lead_day === d);
        if (dVals.length > 0) {
          const maxVal = Math.max(...dVals.map((v: any) => v.value || 0));
          windDays[d] = +maxVal.toFixed(1);
        }
      }
    }

    // Save to series cache
    seriesCache.set(geoName, { rainDays, windDays });

    const rainVal = rainDays[day] ?? rainDays[1] ?? (SAMPLE_WX[geoName]?.rain ?? 0);
    const windVal = windDays[day] ?? windDays[1] ?? (SAMPLE_WX[geoName]?.wind ?? 2.5);

    const stateData: StateWeather = {
      rain: +rainVal.toFixed(1),
      wind: +windVal.toFixed(1),
      pressure: null,
      temp: null,
      rh: null,
      conf: null,
      dir: defaultDir,
      status: 'loaded'
    };

    weatherCache.set(geoName, stateData);
    return stateData;
  } catch (err: any) {
    console.warn(`[IndiaWeatherMap] Failed to load mount forecast for ${geoName} (${slug}):`, err.message);
    const fallback: StateWeather = SAMPLE_WX[geoName] ? { ...SAMPLE_WX[geoName] } : {
      rain: 0,
      wind: 2.2,
      pressure: null,
      temp: null,
      rh: null,
      conf: null,
      dir: defaultDir,
      status: 'loaded'
    };
    weatherCache.set(geoName, fallback);
    return fallback;
  }
}

// Load rainfall and wind for all states using concurrency limit 6
export async function loadAllStatesWeather(stateNames: string[], day: number = 1): Promise<Record<string, StateWeather>> {
  const mapping = await initSlugMapping(stateNames);

  const results = await runWithConcurrency(
    stateNames,
    async (geoName) => {
      const slug = mapping.get(geoName) || normalizeStateName(geoName);
      const data = await fetchStateMountWeather(geoName, slug, day);
      return { geoName, data };
    },
    6
  );

  const weatherMap: Record<string, StateWeather> = {};
  results.forEach((r) => {
    if (r) weatherMap[r.geoName] = r.data;
  });

  return weatherMap;
}

// Lazily fetch temperature, pressure, and consensus when a state is clicked
export async function loadStateDetails(geoName: string): Promise<StateWeather> {
  const current = weatherCache.get(geoName) || SAMPLE_WX[geoName] || {
    rain: 0,
    wind: 3.0,
    pressure: 1008.0,
    temp: 26.0,
    rh: null,
    conf: 80,
    dir: DEFAULT_WIND_DIRS[geoName] ?? 0.5,
    status: 'loaded'
  };

  // If already loaded full details, return cached
  if (current.temp !== null && current.pressure !== null && current.conf !== null) {
    return current;
  }

  const slug = (slugMapping && slugMapping.get(geoName)) || normalizeStateName(geoName);

  if (process.env.NEXT_PUBLIC_USE_SAMPLE_DATA === 'true') {
    const sample = SAMPLE_WX[geoName] || current;
    weatherCache.set(geoName, sample);
    return sample;
  }

  try {
    const [tempRes, pressRes, consRes] = await Promise.all([
      weatherApi.getForecast(slug, 'temperature').catch(() => null),
      weatherApi.getForecast(slug, 'pressure').catch(() => null),
      weatherApi.getConsensus(slug, 'rainfall', 1).catch(() => null)
    ]);

    let tempVal = current.temp ?? (SAMPLE_WX[geoName]?.temp ?? 27.5);
    if (tempRes?.daily_summary && tempRes.daily_summary.length > 0) {
      const d1 = tempRes.daily_summary.find((d: any) => d.lead_day === 1) || tempRes.daily_summary[0];
      tempVal = +(d1.mean_val ?? d1.total_val ?? tempVal).toFixed(1);
    } else if (tempRes?.values && tempRes.values.length > 0) {
      const d1Vals = tempRes.values.filter((v: any) => v.lead_day === 1);
      tempVal = d1Vals.length > 0 ? +(d1Vals.reduce((s: number, v: any) => s + (v.value || 0), 0) / d1Vals.length).toFixed(1) : +(tempRes.values[0]?.value || tempVal).toFixed(1);
    }

    let pressVal = current.pressure ?? (SAMPLE_WX[geoName]?.pressure ?? 1008.0);
    if (pressRes?.daily_summary && pressRes.daily_summary.length > 0) {
      const d1 = pressRes.daily_summary.find((d: any) => d.lead_day === 1) || pressRes.daily_summary[0];
      pressVal = +(d1.mean_val ?? d1.total_val ?? pressVal).toFixed(1);
    } else if (pressRes?.values && pressRes.values.length > 0) {
      const d1Vals = pressRes.values.filter((v: any) => v.lead_day === 1);
      pressVal = d1Vals.length > 0 ? +(d1Vals.reduce((s: number, v: any) => s + (v.value || 0), 0) / d1Vals.length).toFixed(1) : +(pressRes.values[0]?.value || pressVal).toFixed(1);
    }

    const confVal = consRes?.consensus_score !== undefined 
      ? Math.round(consRes.consensus_score) 
      : (SAMPLE_WX[geoName]?.conf ?? 78);

    // Build 5-day outlook from series cache
    const series = seriesCache.get(geoName);
    const forecast = [1, 2, 3, 4, 5].map((d) => {
      const r = series?.rainDays[d] ?? +(current.rain * (1 + (d - 1) * 0.05)).toFixed(1);
      const w = series?.windDays[d] ?? +(current.wind * (1 - (d - 1) * 0.03)).toFixed(1);
      const t = tempVal ? Math.round(tempVal + ((d % 2 === 0 ? 1 : -1) * (d - 1) * 0.4)) : undefined;
      return { day: d, rain: r, wind: w, temp: t };
    });

    const updated: StateWeather = {
      ...current,
      temp: tempVal,
      pressure: pressVal,
      rh: SAMPLE_WX[geoName]?.rh ?? 65,
      conf: confVal,
      status: 'loaded',
      forecast
    };

    weatherCache.set(geoName, updated);
    return updated;
  } catch (err: any) {
    console.warn(`[IndiaWeatherMap] Failed lazy load details for ${geoName}:`, err.message);
    const fallbackForecast = [1, 2, 3, 4, 5].map((d) => ({
      day: d,
      rain: +(current.rain * (1 + (d - 1) * 0.05)).toFixed(1),
      wind: +(current.wind * (1 - (d - 1) * 0.03)).toFixed(1),
      temp: current.temp ? Math.round(current.temp + ((d % 2 === 0 ? 1 : -1) * (d - 1) * 0.4)) : 27
    }));

    const fallback: StateWeather = SAMPLE_WX[geoName] || {
      ...current,
      temp: 26.0,
      pressure: 1008.0,
      rh: 65,
      conf: 75,
      status: 'error',
      errorMessage: 'Failed to fetch full forecast',
      forecast: fallbackForecast
    };
    weatherCache.set(geoName, fallback);
    return fallback;
  }
}
