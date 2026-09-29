import { SystemStatusData } from '../../lib/api/types';

export function getMockSystemStatus(): SystemStatusData {
  return {
    status: 'healthy',
    overall_quality: 'ok',
    latest_forecast_cycle: {
      model: 'ecmwf-ifs',
      init_time_utc: '2026-09-23T00:00:00Z',
      label: 'ECMWF IFS 00Z'
    },
    sources: [
      {
        name: 'ECMWF Open Data',
        label: 'IFS & AIFS Deterministic / Ensemble',
        source_key: 'ecmwf_opendata',
        last_successful_ingest_utc: '2026-09-23T06:12:00Z',
        latency_seconds: 22320, // ~6.2 hours (standard NWP broadcast cycle)
        health: 'online',
        last_cycle_ingested: '2026-09-23T00:00:00Z',
        description: '0.25° GRIB2 surface & pressure-level ensemble parameters'
      },
      {
        name: 'NOAA NOMADS / AWS',
        label: 'GFS / GEFS 0.25° Global System',
        source_key: 'noaa_gfs',
        last_successful_ingest_utc: '2026-09-23T04:45:00Z',
        latency_seconds: 17100,
        health: 'online',
        last_cycle_ingested: '2026-09-23T00:00:00Z',
        description: 'Multi-model disagreement comparison and run-to-run delta'
      },
      {
        name: 'NASA Earthdata',
        label: 'GPM IMERG Early & Late Precipitation',
        source_key: 'nasa_imerg',
        last_successful_ingest_utc: '2026-09-23T05:30:00Z',
        latency_seconds: 14400,
        health: 'online',
        description: 'Near real-time 0.1° gridded satellite rainfall observation'
      },
      {
        name: 'NOAA Aviation Weather',
        label: 'Airport METAR Stations (Indian Domain)',
        source_key: 'metar_airports',
        last_successful_ingest_utc: '2026-09-23T06:05:00Z',
        latency_seconds: 900, // 15 mins
        health: 'online',
        description: 'Surface Tmax, Tmin, 10m wind speed and MSLP truth observations'
      },
      {
        name: 'ECMWF Copernicus CDS',
        label: 'ERA5T Reanalysis Verification',
        source_key: 'era5t',
        last_successful_ingest_utc: '2026-09-22T18:00:00Z',
        latency_seconds: 432000, // ~5 days (expected for ERA5T)
        health: 'online',
        description: 'Closed-loop verification of mature historical forecast runs'
      },
      {
        name: 'IMD API Gateway',
        label: 'api.imd.gov.in (Authenticated)',
        source_key: 'imd_api',
        last_successful_ingest_utc: '2026-09-23T05:50:00Z',
        latency_seconds: 1800,
        health: 'online',
        description: 'Official cyclone warnings, heavy rain alerts and AWS station feeds'
      }
    ],
    active_warnings: []
  };
}
