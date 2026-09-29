import { RegionSummary, BustMapGeoJSON, WeatherVariable, ConfidenceBand } from '../api/types';

export const INDIA_REGIONS: RegionSummary[] = [
  { id: 'uttar-pradesh', name_en: 'Uttar Pradesh', name_hi: 'उत्तर प्रदेश', type: 'state', parent_id: 'india', centroid: [80.9462, 26.8467], bbox: [77.08, 23.87, 84.63, 30.41] },
  { id: 'maharashtra', name_en: 'Maharashtra', name_hi: 'महाराष्ट्र', type: 'state', parent_id: 'india', centroid: [75.7139, 19.7515], bbox: [72.6, 15.6, 80.9, 22.0] },
  { id: 'bihar', name_en: 'Bihar', name_hi: 'बिहार', type: 'state', parent_id: 'india', centroid: [85.3131, 25.0961], bbox: [83.3, 24.2, 88.3, 27.5] },
  { id: 'west-bengal', name_en: 'West Bengal', name_hi: 'पश्चिम बंगाल', type: 'state', parent_id: 'india', centroid: [87.8550, 22.9868], bbox: [85.8, 21.5, 89.9, 27.2] },
  { id: 'madhya-pradesh', name_en: 'Madhya Pradesh', name_hi: 'मध्य प्रदेश', type: 'state', parent_id: 'india', centroid: [77.4126, 23.2599], bbox: [74.0, 21.0, 82.8, 26.9] },
  { id: 'tamil-nadu', name_en: 'Tamil Nadu', name_hi: 'तमिलनाडु', type: 'state', parent_id: 'india', centroid: [78.6569, 11.1271], bbox: [76.2, 8.0, 80.3, 13.5] },
  { id: 'rajasthan', name_en: 'Rajasthan', name_hi: 'राजस्थान', type: 'state', parent_id: 'india', centroid: [74.2179, 27.0238], bbox: [69.5, 23.0, 78.3, 30.2] },
  { id: 'karnataka', name_en: 'Karnataka', name_hi: 'कर्नाटक', type: 'state', parent_id: 'india', centroid: [75.7139, 15.3173], bbox: [74.0, 11.5, 78.6, 18.5] },
  { id: 'gujarat', name_en: 'Gujarat', name_hi: 'गुजरात', type: 'state', parent_id: 'india', centroid: [71.1924, 22.2587], bbox: [68.1, 20.1, 74.5, 24.7] },
  { id: 'andhra-pradesh', name_en: 'Andhra Pradesh', name_hi: 'आंध्र प्रदेश', type: 'state', parent_id: 'india', centroid: [79.7400, 15.9129], bbox: [76.7, 12.6, 84.8, 19.1] },
  { id: 'odisha', name_en: 'Odisha', name_hi: 'ओडिशा', type: 'state', parent_id: 'india', centroid: [85.0985, 20.9517], bbox: [81.4, 17.8, 87.5, 22.6] },
  { id: 'telangana', name_en: 'Telangana', name_hi: 'तेलंगाना', type: 'state', parent_id: 'india', centroid: [79.0193, 18.1124], bbox: [77.2, 15.8, 81.3, 19.9] },
  { id: 'kerala', name_en: 'Kerala', name_hi: 'केरल', type: 'state', parent_id: 'india', centroid: [76.2711, 10.8505], bbox: [74.8, 8.2, 77.4, 12.8] },
  { id: 'jharkhand', name_en: 'Jharkhand', name_hi: 'झारखंड', type: 'state', parent_id: 'india', centroid: [85.2799, 23.6102], bbox: [83.3, 21.9, 87.9, 25.3] },
  { id: 'assam', name_en: 'Assam', name_hi: 'असम', type: 'state', parent_id: 'india', centroid: [92.9376, 26.2006], bbox: [89.7, 24.1, 96.0, 28.0] },
  { id: 'punjab', name_en: 'Punjab', name_hi: 'पंजाब', type: 'state', parent_id: 'india', centroid: [75.3412, 31.1471], bbox: [73.8, 29.5, 76.9, 32.5] },
  { id: 'chhattisgarh', name_en: 'Chhattisgarh', name_hi: 'छत्तीसगढ़', type: 'state', parent_id: 'india', centroid: [81.8661, 21.2787], bbox: [80.2, 17.8, 84.4, 24.1] },
  { id: 'haryana', name_en: 'Haryana', name_hi: 'हरियाणा', type: 'state', parent_id: 'india', centroid: [76.0856, 29.0588], bbox: [74.5, 27.6, 77.6, 30.9] },
  { id: 'delhi', name_en: 'Delhi (NCT)', name_hi: 'दिल्ली (एनसीटी)', type: 'city', parent_id: 'india', centroid: [77.1025, 28.7041], bbox: [76.8, 28.4, 77.4, 28.9] },
  { id: 'jammu-kashmir', name_en: 'Jammu & Kashmir', name_hi: 'जम्मू और कश्मीर', type: 'state', parent_id: 'india', centroid: [74.7973, 33.7782], bbox: [73.5, 32.2, 76.8, 35.2] },
  { id: 'ladakh', name_en: 'Ladakh', name_hi: 'लद्दाख', type: 'state', parent_id: 'india', centroid: [77.5771, 34.1526], bbox: [75.5, 32.5, 80.3, 36.0] },
  { id: 'uttarakhand', name_en: 'Uttarakhand', name_hi: 'उत्तराखंड', type: 'state', parent_id: 'india', centroid: [79.0193, 30.0668], bbox: [77.6, 28.7, 81.0, 31.5] },
  { id: 'himachal-pradesh', name_en: 'Himachal Pradesh', name_hi: 'हिमाचल प्रदेश', type: 'state', parent_id: 'india', centroid: [77.1734, 31.1048], bbox: [75.6, 30.4, 79.0, 33.2] },
  { id: 'tripura', name_en: 'Tripura', name_hi: 'त्रिपुरा', type: 'state', parent_id: 'india', centroid: [91.9882, 23.9408], bbox: [91.1, 22.9, 92.4, 24.5] },
  { id: 'meghalaya', name_en: 'Meghalaya', name_hi: 'मेघालय', type: 'state', parent_id: 'india', centroid: [91.3662, 25.4670], bbox: [89.8, 25.0, 92.8, 26.1] },
  { id: 'manipur', name_en: 'Manipur', name_hi: 'मणिपुर', type: 'state', parent_id: 'india', centroid: [93.9063, 24.6637], bbox: [93.0, 23.8, 94.7, 25.7] },
  { id: 'nagaland', name_en: 'Nagaland', name_hi: 'नागालैंड', type: 'state', parent_id: 'india', centroid: [94.5624, 26.1584], bbox: [93.3, 25.1, 95.3, 27.0] },
  { id: 'goa', name_en: 'Goa', name_hi: 'गोवा', type: 'state', parent_id: 'india', centroid: [74.1240, 15.2993], bbox: [73.6, 14.8, 74.4, 15.8] },
  { id: 'arunachal-pradesh', name_en: 'Arunachal Pradesh', name_hi: 'अरुणाचल प्रदेश', type: 'state', parent_id: 'india', centroid: [94.7278, 28.2180], bbox: [91.5, 26.6, 97.4, 29.5] },
  { id: 'mizoram', name_en: 'Mizoram', name_hi: 'मिजोरम', type: 'state', parent_id: 'india', centroid: [92.9376, 23.1645], bbox: [92.2, 21.9, 93.4, 24.5] },
  { id: 'sikkim', name_en: 'Sikkim', name_hi: 'सिक्किम', type: 'state', parent_id: 'india', centroid: [88.5122, 27.5330], bbox: [88.0, 27.1, 88.9, 28.1] }
];

// Helper to create a stylized GeoJSON polygon for a bounding box with organic smoothing
function createRegionPolygon(bbox: [number, number, number, number]): number[][][] {
  const [minX, minY, maxX, maxY] = bbox;
  const midX = (minX + maxX) / 2;
  const midY = (minY + maxY) / 2;
  const qx1 = minX + (maxX - minX) * 0.25;
  const qx3 = minX + (maxX - minX) * 0.75;
  const qy1 = minY + (maxY - minY) * 0.25;
  const qy3 = minY + (maxY - minY) * 0.75;

  return [[
    [minX, midY],
    [qx1, maxY * 0.98],
    [midX, maxY],
    [qx3, maxY * 0.99],
    [maxX, midY + (maxY - midY) * 0.6],
    [maxX * 0.99, midY],
    [maxX, qy1],
    [qx3, minY],
    [midX, minY * 1.01],
    [qx1, minY],
    [minX * 1.01, qy1],
    [minX, midY]
  ]];
}

// Compute deterministic bust probabilities based on region, variable, and lead day
export function getBustMetricsForRegion(regionId: string, variable: WeatherVariable, leadDay: number) {
  // Hash function for repeatable deterministic pseudo-ML predictions
  let hash = 0;
  const seed = `${regionId}:${variable}:${leadDay}`;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }
  const normalized = Math.abs(hash % 1000) / 1000;

  // Base bust probability scales with lead day (uncertainty increases with lead)
  // Day 1: 0.05 - 0.20, Day 7: 0.25 - 0.65, Day 10: 0.40 - 0.85
  const leadFactor = 0.08 + (leadDay / 10) * 0.58;
  const regionalVariance = (normalized - 0.5) * 0.35;
  const p_bust_cal = Math.min(0.92, Math.max(0.04, Number((leadFactor + regionalVariance).toFixed(2))));
  const p_bust_raw = Math.min(0.95, Math.max(0.03, Number((p_bust_cal + (normalized - 0.5) * 0.08).toFixed(2))));

  let confidence_band: ConfidenceBand = 'High';
  if (p_bust_cal >= 0.52) {
    confidence_band = 'Low';
  } else if (p_bust_cal >= 0.25) {
    confidence_band = 'Moderate';
  }

  const confidence_score = Math.round(100 * (1 - p_bust_cal));

  // Variable specific forecast values & units
  let unit = 'mm';
  let forecast_value_mean = 12.4;
  let forecast_value_max = 34.0;
  let err_q50 = 4.2;
  let err_q90 = 14.8;
  let primary_driver = 'Ensemble spread across NWP members';

  if (variable === 'rainfall') {
    unit = 'mm/24h';
    forecast_value_mean = Math.round(5 + normalized * 75);
    forecast_value_max = Math.round(forecast_value_mean * 1.8);
    err_q50 = Math.round(forecast_value_mean * 0.3);
    err_q90 = Math.round(forecast_value_mean * 0.85);
    const drivers = [
      'GFS vs IFS divergence in monsoon trough axis position',
      'Run-to-run instability over 12Z vs 00Z runs (+38 mm jump)',
      'High convective available potential energy (CAPE > 2400 J/kg)',
      'Sub-grid orographic enhancement over coastal/ghat terrain'
    ];
    primary_driver = drivers[Math.abs(hash) % drivers.length];
  } else if (variable === 'tmax') {
    unit = '°C';
    forecast_value_mean = Number((28 + normalized * 16).toFixed(1));
    forecast_value_max = Number((forecast_value_mean + 2.5).toFixed(1));
    err_q50 = Number((1.2 + leadDay * 0.25).toFixed(1));
    err_q90 = Number((2.8 + leadDay * 0.45).toFixed(1));
    primary_driver = 'Boundary layer moisture advection uncertainty';
  } else if (variable === 'tmin') {
    unit = '°C';
    forecast_value_mean = Number((16 + normalized * 12).toFixed(1));
    forecast_value_max = Number((forecast_value_mean + 2.0).toFixed(1));
    err_q50 = Number((1.0 + leadDay * 0.2).toFixed(1));
    err_q90 = Number((2.2 + leadDay * 0.35).toFixed(1));
    primary_driver = 'Radiational cooling and nocturnal cloud cover divergence';
  } else if (variable === 'wind') {
    unit = 'm/s';
    forecast_value_mean = Number((4 + normalized * 12).toFixed(1));
    forecast_value_max = Number((forecast_value_mean * 1.6).toFixed(1));
    err_q50 = 2.1;
    err_q90 = 4.8;
    primary_driver = 'Low-level jet core position discrepancy (850 hPa)';
  } else if (variable === 'mslp') {
    unit = 'hPa';
    forecast_value_mean = Number((1004 + normalized * 12).toFixed(1));
    forecast_value_max = Number((forecast_value_mean + 2).toFixed(1));
    err_q50 = 1.8;
    err_q90 = 4.1;
    primary_driver = 'Synoptic low-pressure system deepening rate';
  } else if (variable === 'humidity') {
    unit = '%';
    forecast_value_mean = Math.round(45 + normalized * 45);
    forecast_value_max = Math.min(100, Math.round(forecast_value_mean * 1.2));
    err_q50 = 8.0;
    err_q90 = 19.5;
    primary_driver = 'Precipitable water anomaly gradient';
  }

  return {
    p_bust_cal,
    p_bust_raw,
    confidence_band,
    confidence_score,
    forecast_value_mean,
    forecast_value_max,
    unit,
    err_q50,
    err_q90,
    primary_driver
  };
}

export function getIndiaBustMapGeoJSON(variable: WeatherVariable = 'rainfall', leadDay: number = 7): BustMapGeoJSON {
  return {
    type: 'FeatureCollection',
    features: INDIA_REGIONS.map((region, idx) => {
      const metrics = getBustMetricsForRegion(region.id, variable, leadDay);
      return {
        type: 'Feature',
        id: idx + 1,
        geometry: {
          type: 'Polygon',
          coordinates: createRegionPolygon(region.bbox)
        },
        properties: {
          region_id: region.id,
          region_name: region.name_en,
          lead_day: leadDay,
          variable,
          p_bust_cal: metrics.p_bust_cal,
          p_bust_raw: metrics.p_bust_raw,
          confidence_band: metrics.confidence_band,
          confidence_score: metrics.confidence_score,
          forecast_value_mean: metrics.forecast_value_mean,
          forecast_value_max: metrics.forecast_value_max,
          unit: metrics.unit,
          err_q50: metrics.err_q50,
          err_q90: metrics.err_q90,
          primary_driver: metrics.primary_driver
        }
      };
    })
  };
}
