import { ForecastVsActualData, ErrorTrendsData, WeatherVariable, WeatherEvent } from '../../lib/api/types';
import { INDIA_REGIONS } from '../../lib/geo/indiaGeoJson';

export const NOTABLE_WEATHER_EVENTS: WeatherEvent[] = [
  {
    event_id: 'cyclone-biparjoy-2023',
    name: 'Very Severe Cyclonic Storm Biparjoy',
    type: 'cyclone',
    start_date: '2023-06-06',
    end_date: '2023-06-19',
    severity: 'extremely_severe',
    source: 'IMD_RSMC_BULLETIN'
  },
  {
    event_id: 'north-india-floods-july-2023',
    name: 'North India Extreme Monsoon Episode',
    type: 'heavy_rain',
    start_date: '2023-07-08',
    end_date: '2023-07-15',
    severity: 'extremely_severe',
    source: 'NASA_IMERG_FINAL'
  },
  {
    event_id: 'delhi-heatwave-may-2024',
    name: 'North-West India Severe Heatwave',
    type: 'heatwave',
    start_date: '2024-05-18',
    end_date: '2024-06-02',
    severity: 'severe',
    source: 'IMD_METAR_STATIONS'
  },
  {
    event_id: 'cyclone-remal-may-2024',
    name: 'Severe Cyclonic Storm Remal',
    type: 'cyclone',
    start_date: '2024-05-24',
    end_date: '2024-05-28',
    severity: 'severe',
    source: 'IMD_RSMC_BULLETIN'
  }
];

export function getMockForecastVsActual(
  regionId: string = 'uttar-pradesh',
  variable: WeatherVariable = 'rainfall',
  leadDay: number = 7
): ForecastVsActualData {
  const region = INDIA_REGIONS.find((r) => r.id === regionId) || INDIA_REGIONS[0];

  // Specific simulation where verified truth exists
  const points = [];
  const baseDate = new Date('2026-07-01');

  let unit = 'mm/24h';
  if (variable === 'tmax' || variable === 'tmin') unit = '°C';
  if (variable === 'wind') unit = 'm/s';
  if (variable === 'mslp') unit = 'hPa';
  if (variable === 'humidity') unit = '%';

  for (let i = 0; i < 30; i++) {
    const curDate = new Date(baseDate);
    curDate.setDate(baseDate.getDate() + i);

    const dateStr = curDate.toISOString().split('T')[0];

    // Seeded random variation
    const daySeed = (i * 37 + leadDay * 19 + regionId.length * 13) % 100;
    const baseVal = variable === 'rainfall' ? 20 + (daySeed % 60) : 32 + (daySeed % 12);

    // Some days bust
    const isBustDay = i === 7 || i === 14 || i === 22;
    const errorMag = isBustDay ? (leadDay >= 5 ? 45 : 28) : (daySeed % 12) - 6;

    const forecast = Math.max(0, baseVal);
    const observed = Math.max(0, forecast + errorMag);
    const err = forecast - observed;
    const absErr = Math.abs(err);

    // Bust condition
    const isBust = absErr > (variable === 'rainfall' ? Math.max(10, observed * 0.4) : 3.0);

    let truthSource: 'NASA_IMERG_LATE' | 'METAR' | 'ERA5T' | 'IMD_GRIDDED' = 'NASA_IMERG_LATE';
    if (variable === 'tmax' || variable === 'tmin') truthSource = 'METAR';
    if (variable === 'wind' || variable === 'mslp') truthSource = 'ERA5T';

    points.push({
      valid_date: dateStr,
      forecast_value: Number(forecast.toFixed(1)),
      observed_value: Number(observed.toFixed(1)),
      error: Number(err.toFixed(1)),
      abs_error: Number(absErr.toFixed(1)),
      is_bust: isBust,
      truth_source: truthSource
    });
  }

  return {
    region_id: region.id,
    region_name: region.name_en,
    variable,
    lead_day: leadDay,
    unit,
    points
  };
}

export function getMockErrorTrends(
  regionId: string = 'uttar-pradesh',
  variable: WeatherVariable = 'rainfall',
  leadDay: number = 7,
  window: number = 30
): ErrorTrendsData {
  const region = INDIA_REGIONS.find((r) => r.id === regionId) || INDIA_REGIONS[0];
  const trends = [];
  const baseDate = new Date('2026-06-01');

  let unit = 'mm';
  if (variable === 'tmax' || variable === 'tmin') unit = '°C';
  if (variable === 'wind') unit = 'm/s';
  if (variable === 'mslp') unit = 'hPa';
  if (variable === 'humidity') unit = '%';

  const baseMae = variable === 'rainfall' ? 6.2 + leadDay * 1.4 : 1.4 + leadDay * 0.3;
  const baseRmse = baseMae * 1.55;
  const baseBustRate = Math.min(0.45, 0.04 + (leadDay / 10) * 0.28);

  for (let i = 0; i < 20; i++) {
    const curDate = new Date(baseDate);
    curDate.setDate(baseDate.getDate() + i * 4);

    const variance = Math.sin(i * 0.6) * (baseMae * 0.25);

    trends.push({
      date: curDate.toISOString().split('T')[0],
      mae: Number((baseMae + variance).toFixed(1)),
      rmse: Number((baseRmse + variance * 1.2).toFixed(1)),
      bust_rate: Number((baseBustRate + (variance / baseMae) * 0.05).toFixed(3)),
      sample_count: 45 + (i % 10)
    });
  }

  return {
    region_id: region.id,
    region_name: region.name_en,
    variable,
    lead_day: leadDay,
    unit,
    trends
  };
}
