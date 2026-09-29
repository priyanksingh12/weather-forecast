import { StateWeather } from './types';

export const TOP = 3;
export const RAIN_MIN = 0.8; // Real NWP threshold for detectable precipitation (mm/24h)
export const WIND_MIN = 1.8; // Real NWP threshold for active surface breeze (m/s)

export const MAP_COLORS = {
  calm: 0xDCE8EB,
  rain: 0x6AA8B9,     // Blue for rainfall states
  wind: 0x94A3B8,     // Grey for wind states
  both: 0x7A9DAA,     // Harmonious blue-grey blend
  line: 0xFFFFFF,
  ground: 0xEEF4F5,
  drop: 0x3B82F6,     // Vibrant blue for rain teardrops & ripples
  windHead: 0x607D85, // Grey for wind streamline glowing heads
  cloud: 0xB8D5E5,
  bg: 0xF5F8FA
};

export const MAP_COLORS_DARK = {
  calm: 0x1D3036,
  rain: 0x5294A6,     // Rich blue for rainfall states
  wind: 0x64748B,     // Grey for wind states
  both: 0x557B88,     // Blue-grey blend
  line: 0x3A5560,
  ground: 0x16252B,
  drop: 0x60A5FA,     // Bright blue for rain teardrops in dark mode
  windHead: 0x94A3B8, // Bright grey for wind streamline heads
  cloud: 0x385566,
  bg: 0x101B20
};

export function getMapColors(isDark: boolean) {
  return isDark ? MAP_COLORS_DARK : MAP_COLORS;
}

// Reference sample data and default wind directions (in radians)
export const SAMPLE_WX: Record<string, StateWeather> = {
  "Andaman and Nicobar Islands": { rain: 27, wind: 3.3, pressure: 1008.3, temp: 28.5, rh: 85, conf: 73, dir: 0.34, status: 'loaded' },
  "Andhra Pradesh": { rain: 21, wind: 9.6, pressure: 1008.4, temp: 27.2, rh: 84, conf: 75, dir: 0.07, status: 'loaded' },
  "Arunachal Pradesh": { rain: 33, wind: 4.0, pressure: 1005.1, temp: 26.4, rh: 86, conf: 72, dir: 0.17, status: 'loaded' },
  "Assam": { rain: 41, wind: 4.8, pressure: 1003.3, temp: 24.6, rh: 88, conf: 65, dir: 1.09, status: 'loaded' },
  "Bihar": { rain: 0.9, wind: 3.1, pressure: 1010.6, temp: 29.9, rh: 55, conf: 91, dir: 0.19, status: 'loaded' },
  "Chandigarh": { rain: 0.9, wind: 3.6, pressure: 1008.1, temp: 32.2, rh: 42, conf: 91, dir: 0.15, status: 'loaded' },
  "Chhattisgarh": { rain: 12, wind: 2.2, pressure: 1010.4, temp: 32.4, rh: 82, conf: 83, dir: 1.1, status: 'loaded' },
  "Dadra and Nagar Haveli and Daman and Diu": { rain: 0.6, wind: 2.7, pressure: 1011.0, temp: 27.8, rh: 50, conf: 89, dir: 0.76, status: 'loaded' },
  "Delhi": { rain: 1.8, wind: 6.2, pressure: 1008.3, temp: 33, rh: 52, conf: 86, dir: 0.27, status: 'loaded' },
  "Goa": { rain: 35, wind: 4.0, pressure: 1005.6, temp: 30.0, rh: 87, conf: 70, dir: 0.54, status: 'loaded' },
  "Gujarat": { rain: 1.4, wind: 8.8, pressure: 1008.1, temp: 34, rh: 38, conf: 86, dir: 0.99, status: 'loaded' },
  "Haryana": { rain: 1.3, wind: 7.2, pressure: 1009.6, temp: 33, rh: 40, conf: 85, dir: 0.82, status: 'loaded' },
  "Himachal Pradesh": { rain: 38, wind: 6.8, pressure: 1007.3, temp: 11, rh: 87, conf: 69, dir: 1.16, status: 'loaded' },
  "Jammu and Kashmir": { rain: 1.7, wind: 7.0, pressure: 1009.8, temp: 12, rh: 43, conf: 88, dir: 0.8, status: 'loaded' },
  "Jharkhand": { rain: 14, wind: 2.1, pressure: 1008.7, temp: 28.4, rh: 82, conf: 85, dir: 0.66, status: 'loaded' },
  "Karnataka": { rain: 22, wind: 4.2, pressure: 1008.9, temp: 30.9, rh: 84, conf: 76, dir: 0.61, status: 'loaded' },
  "Kerala": { rain: 48, wind: 4.9, pressure: 1004.9, temp: 25.0, rh: 89, conf: 59, dir: 0.79, status: 'loaded' },
  "Ladakh": { rain: 1.8, wind: 10.5, pressure: 1010.0, temp: 9, rh: 42, conf: 84, dir: 0.84, status: 'loaded' },
  "Lakshadweep": { rain: 15, wind: 8.5, pressure: 1007.9, temp: 30.1, rh: 83, conf: 79, dir: 0.05, status: 'loaded' },
  "Madhya Pradesh": { rain: 16, wind: 3.1, pressure: 1008.6, temp: 28.0, rh: 83, conf: 82, dir: 0.72, status: 'loaded' },
  "Maharashtra": { rain: 18, wind: 6.4, pressure: 1005.8, temp: 28.2, rh: 83, conf: 79, dir: 0.54, status: 'loaded' },
  "Manipur": { rain: 20, wind: 4.7, pressure: 1007.6, temp: 25.7, rh: 84, conf: 79, dir: 0.72, status: 'loaded' },
  "Meghalaya": { rain: 55, wind: 2.8, pressure: 1005.3, temp: 28.3, rh: 91, conf: 59, dir: 0.56, status: 'loaded' },
  "Mizoram": { rain: 28, wind: 3.8, pressure: 1008.0, temp: 25.0, rh: 85, conf: 74, dir: 0.24, status: 'loaded' },
  "Nagaland": { rain: 19, wind: 2.5, pressure: 1007.7, temp: 28.9, rh: 83, conf: 77, dir: 0.59, status: 'loaded' },
  "Odisha": { rain: 62, wind: 12.4, pressure: 1004.3, temp: 28.7, rh: 92, conf: 51, dir: 0.11, status: 'loaded' },
  "Puducherry": { rain: 1.2, wind: 7.4, pressure: 1009.3, temp: 27.1, rh: 49, conf: 87, dir: 0.55, status: 'loaded' },
  "Punjab": { rain: 1.1, wind: 6.5, pressure: 1008.3, temp: 31, rh: 58, conf: 86, dir: 0.03, status: 'loaded' },
  "Rajasthan": { rain: 0.1, wind: 9.5, pressure: 1011.5, temp: 37, rh: 36, conf: 85, dir: 1.12, status: 'loaded' },
  "Sikkim": { rain: 24, wind: 4.6, pressure: 1007.7, temp: 14, rh: 84, conf: 75, dir: 1.1, status: 'loaded' },
  "Tamil Nadu": { rain: 1.1, wind: 7.8, pressure: 1010.5, temp: 30.4, rh: 53, conf: 83, dir: 1.18, status: 'loaded' },
  "Telangana": { rain: 0.8, wind: 2.3, pressure: 1009.3, temp: 31.3, rh: 41, conf: 88, dir: 0.76, status: 'loaded' },
  "Tripura": { rain: 26, wind: 2.4, pressure: 1007.5, temp: 29.8, rh: 85, conf: 78, dir: 0.52, status: 'loaded' },
  "Uttar Pradesh": { rain: 2.9, wind: 2.6, pressure: 1009.1, temp: 26.0, rh: 41, conf: 88, dir: 0.05, status: 'loaded' },
  "Uttarakhand": { rain: 30, wind: 3.5, pressure: 1005.7, temp: 15, rh: 86, conf: 72, dir: 0.53, status: 'loaded' },
  "West Bengal": { rain: 30, wind: 4.4, pressure: 1006.7, temp: 25.1, rh: 86, conf: 74, dir: 0.75, status: 'loaded' }
};

export const DEFAULT_WIND_DIRS: Record<string, number> = Object.fromEntries(
  Object.entries(SAMPLE_WX).map(([name, data]) => [name, data.dir])
);
