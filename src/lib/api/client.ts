import { ApiResponse, ApiMeta } from './types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://sih-2-o.onrender.com/api/v1';
const USE_MOCK_API = process.env.NEXT_PUBLIC_USE_MOCK === 'true'; // Defaults to false, connecting to live Render backend

export function createApiMeta(overrides?: Partial<ApiMeta>): ApiMeta {
  return {
    cycle: {
      model: 'ecmwf-ifs',
      init_time_utc: '2026-09-23T00:00:00Z',
      label: 'ECMWF IFS 00Z'
    },
    data_timestamp_utc: '2026-09-23T06:12:00Z',
    generated_at_utc: new Date().toISOString(),
    model_version: 'bust-rain-v1.3',
    bust_definition_version: 'bd-1',
    units: {
      rainfall: 'mm/24h',
      temperature: 'degC',
      wind: 'm/s',
      pressure: 'hPa',
      humidity: '%'
    },
    data_quality: 'ok',
    request_id: `req_${Math.random().toString(36).substring(2, 10)}`,
    mock: USE_MOCK_API,
    ...overrides
  };
}

export async function fetchWithFallback<T>(
  endpoint: string,
  mockFallback: () => T | Promise<T>,
  init?: RequestInit
): Promise<ApiResponse<T>> {
  if (!USE_MOCK_API) {
    try {
      const res = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...init,
        headers: {
          'Content-Type': 'application/json',
          'X-Client-Version': '1.0.0-web',
          ...init?.headers
        }
      });
      if (res.ok) {
        return await res.json();
      }
      console.warn(`API returned ${res.status} for ${endpoint}. Falling back to client-side data engine.`);
    } catch (err) {
      console.warn(`Network fetch failed for ${endpoint}. Falling back to client-side data engine.`, err);
    }
  }

  // Use calibrated deterministic mock data engine
  const data = await mockFallback();
  return {
    meta: createApiMeta(),
    data
  };
}
