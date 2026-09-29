export const OWM_PRIMARY_KEY = '1611217cb1ad790aed1fd26ada33e24c';
export const OWM_BACKUP_KEY = 'bdac24201035acf6530f7727ccc3cf5f';
export const OWM_KEY = OWM_BACKUP_KEY; // Pre-verified working key

export const OWM_LAYERS = [
  {
    id: 'precipitation_new',
    label: '🌧️ Rain Radar',
    description: 'Live Precipitation & Rain Radar',
  },
  {
    id: 'temp_new',
    label: '🌡️ Temperature',
    description: 'Global Surface Temperature Heatmap',
  },
  {
    id: 'clouds_new',
    label: '☁️ Clouds',
    description: 'Satellite Cloud Cover Density',
  },
  {
    id: 'wind_new',
    label: '💨 Wind',
    description: 'Surface Wind Speed Vectors',
  },
  {
    id: 'pressure_new',
    label: '🔵 Pressure',
    description: 'Mean Sea Level Atmospheric Pressure',
  },
] as const;

export type OwmLayerId = (typeof OWM_LAYERS)[number]['id'];
