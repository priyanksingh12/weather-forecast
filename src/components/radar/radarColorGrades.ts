import { OwmLayerId } from './radarTypes';

export interface ColorGradeStop {
  value: number;
  label: string;
  color: string;
  description: string;
}

export interface LayerColorGrade {
  layerId: OwmLayerId;
  title: string;
  variableName: string;
  unit: string;
  lowLabel: string;
  highLabel: string;
  gradientCss: string;
  stops: ColorGradeStop[];
  explanation: {
    low: string;
    high: string;
    summary: string;
  };
  getCurrentValue: (region: {
    temperature: number;
    rainfall24h: number;
    windSpeedKmH: number;
    pressureHpa: number;
    humidity: number;
  }) => {
    value: number;
    formatted: string;
    statusLabel: string;
    percentage: number; // 0 to 100 for marker placement
    badgeColor: string;
  };
}

export const RADAR_COLOR_GRADES: Record<OwmLayerId, LayerColorGrade> = {
  precipitation_new: {
    layerId: 'precipitation_new',
    title: 'Precipitation & Rain Radar',
    variableName: 'Rainfall',
    unit: 'mm/h',
    lowLabel: 'Lower (0 mm / Trace)',
    highLabel: 'Higher (>40 mm / Downpour)',
    gradientCss: 'linear-gradient(to right, #00e5ff, #0077ff, #00ea11, #ffff00, #ff7f00, #ff0000, #9600ff)',
    stops: [
      { value: 0, label: '0 mm', color: '#00e5ff', description: 'Trace / Dry' },
      { value: 2, label: '2 mm', color: '#0077ff', description: 'Light Rain' },
      { value: 8, label: '8 mm', color: '#00ea11', description: 'Moderate' },
      { value: 16, label: '16 mm', color: '#ffff00', description: 'Heavy Rain' },
      { value: 30, label: '30 mm', color: '#ff7f00', description: 'Downpour' },
      { value: 50, label: '50+ mm', color: '#ff0000', description: 'Cloudburst' },
      { value: 75, label: '>75 mm', color: '#9600ff', description: 'Severe Flash Risk' },
    ],
    explanation: {
      low: 'Cyan and Blue zones represent dry conditions, mist, or light scattered drizzle (<2 mm/h).',
      high: 'Orange, Red, and Purple zones indicate heavy monsoon showers (>15 mm/h) and severe cloudburst cells (>30 mm/h).',
      summary: 'Scan for red and purple cores to pinpoint intense localized rainfall pockets and convective flash-flood zones.',
    },
    getCurrentValue: (reg) => {
      // Approximate hourly rate from 24h rainfall
      const hourlyApprox = +(reg.rainfall24h / 8).toFixed(1);
      const pct = Math.min(100, Math.max(3, (hourlyApprox / 50) * 100));
      let statusLabel = 'Dry / Trace';
      let badgeColor = '#00e5ff';

      if (hourlyApprox >= 30 || reg.rainfall24h > 100) {
        statusLabel = 'Cloudburst / Extreme';
        badgeColor = '#9600ff';
      } else if (hourlyApprox >= 15 || reg.rainfall24h > 50) {
        statusLabel = 'Heavy Downpour';
        badgeColor = '#ff0000';
      } else if (hourlyApprox >= 5 || reg.rainfall24h > 15) {
        statusLabel = 'Moderate Rain';
        badgeColor = '#ffff00';
      } else if (reg.rainfall24h > 1) {
        statusLabel = 'Light Rain';
        badgeColor = '#00ea11';
      }

      return {
        value: hourlyApprox,
        formatted: `${reg.rainfall24h} mm (24h)`,
        statusLabel,
        percentage: pct,
        badgeColor,
      };
    },
  },

  temp_new: {
    layerId: 'temp_new',
    title: 'Surface Temperature Heatmap',
    variableName: 'Temperature',
    unit: '°C',
    lowLabel: 'Lower (-10°C / Cold)',
    highLabel: 'Higher (+45°C / Heatwave)',
    gradientCss: 'linear-gradient(to right, #8200dc, #1e3cff, #00c8ff, #32ff64, #ffff00, #ff8c00, #ff1e00, #7d0000)',
    stops: [
      { value: -5, label: '< 0°C', color: '#8200dc', description: 'Sub-Zero' },
      { value: 10, label: '10°C', color: '#00c8ff', description: 'Cool' },
      { value: 20, label: '20°C', color: '#32ff64', description: 'Pleasant' },
      { value: 28, label: '28°C', color: '#ffff00', description: 'Warm' },
      { value: 36, label: '36°C', color: '#ff8c00', description: 'Hot' },
      { value: 42, label: '42°C+', color: '#ff1e00', description: 'Heatwave Alert' },
    ],
    explanation: {
      low: 'Violet and Blue zones mark colder high-altitude regions (Himalayan belt, Ladakh, Kashmir).',
      high: 'Deep Orange, Red, and Maroon zones identify intense surface heat and heatwave pockets (>38°C in Central & Western India).',
      summary: 'Identify cool mountain valleys in blue/cyan and thermal heat domes in crimson/maroon.',
    },
    getCurrentValue: (reg) => {
      const t = reg.temperature;
      // Map -10°C -> 0%, 45°C -> 100%
      const pct = Math.min(100, Math.max(3, ((t + 10) / 55) * 100));
      let statusLabel = 'Warm';
      let badgeColor = '#ffff00';

      if (t >= 40) {
        statusLabel = 'Extreme Heatwave';
        badgeColor = '#ff1e00';
      } else if (t >= 34) {
        statusLabel = 'Hot';
        badgeColor = '#ff8c00';
      } else if (t >= 24) {
        statusLabel = 'Pleasant / Warm';
        badgeColor = '#ffff00';
      } else if (t >= 15) {
        statusLabel = 'Mild / Moderate';
        badgeColor = '#32ff64';
      } else if (t >= 5) {
        statusLabel = 'Cool';
        badgeColor = '#00c8ff';
      } else {
        statusLabel = 'Cold / Sub-Zero';
        badgeColor = '#8200dc';
      }

      return {
        value: t,
        formatted: `${t}°C`,
        statusLabel,
        percentage: pct,
        badgeColor,
      };
    },
  },

  wind_new: {
    layerId: 'wind_new',
    title: 'Surface Wind Speed & Squall Lines',
    variableName: 'Wind Speed',
    unit: 'm/s (km/h)',
    lowLabel: 'Lower (0 m/s / Calm)',
    highLabel: 'Higher (>30 m/s / Storm)',
    gradientCss: 'linear-gradient(to right, rgba(56,189,248,0.3), #00e5ff, #00e676, #ffd600, #ff9100, #ff1744, #d500f9)',
    stops: [
      { value: 0, label: '0 m/s', color: '#38bdf8', description: 'Calm (< 5 km/h)' },
      { value: 5, label: '5 m/s', color: '#00e676', description: 'Gentle (18 km/h)' },
      { value: 10, label: '10 m/s', color: '#ffd600', description: 'Moderate (36 km/h)' },
      { value: 16, label: '16 m/s', color: '#ff9100', description: 'Strong (58 km/h)' },
      { value: 24, label: '24 m/s', color: '#ff1744', description: 'Gale (86 km/h)' },
      { value: 32, label: '32+ m/s', color: '#d500f9', description: 'Storm (>115 km/h)' },
    ],
    explanation: {
      low: 'Cyan and Green zones indicate calm air or light to gentle breezes (<20 km/h) safe for civil operations.',
      high: 'Orange, Red, and Magenta zones highlight gale-force squalls (>60 km/h) and cyclonic wind shear (>85 km/h).',
      summary: 'Follow streamline wind shifts from light green areas toward converging red/magenta squall lines.',
    },
    getCurrentValue: (reg) => {
      const ms = +(reg.windSpeedKmH / 3.6).toFixed(1);
      // Map 0 -> 0%, 35 m/s -> 100%
      const pct = Math.min(100, Math.max(3, (ms / 35) * 100));
      let statusLabel = 'Gentle Breeze';
      let badgeColor = '#00e676';

      if (ms >= 24 || reg.windSpeedKmH >= 85) {
        statusLabel = 'Gale / Storm Hazard';
        badgeColor = '#ff1744';
      } else if (ms >= 14 || reg.windSpeedKmH >= 50) {
        statusLabel = 'Strong Breeze';
        badgeColor = '#ff9100';
      } else if (ms >= 8 || reg.windSpeedKmH >= 28) {
        statusLabel = 'Moderate Wind';
        badgeColor = '#ffd600';
      } else if (ms >= 3 || reg.windSpeedKmH >= 10) {
        statusLabel = 'Light Breeze';
        badgeColor = '#00e676';
      } else {
        statusLabel = 'Calm';
        badgeColor = '#38bdf8';
      }

      return {
        value: ms,
        formatted: `${ms} m/s (${reg.windSpeedKmH} km/h)`,
        statusLabel,
        percentage: pct,
        badgeColor,
      };
    },
  },

  pressure_new: {
    layerId: 'pressure_new',
    title: 'Mean Sea Level Pressure (MSLP)',
    variableName: 'Pressure',
    unit: 'hPa',
    lowLabel: 'Lower (<990 hPa / Cyclone)',
    highLabel: 'Higher (>1025 hPa / Anticyclone)',
    gradientCss: 'linear-gradient(to right, #880e4f, #ff6f00, #cddc39, #00e676, #00bcd4, #1565c0)',
    stops: [
      { value: 980, label: '< 985 hPa', color: '#880e4f', description: 'Deep Cyclone Eye' },
      { value: 995, label: '995 hPa', color: '#ff6f00', description: 'Depression / Trough' },
      { value: 1006, label: '1006 hPa', color: '#cddc39', description: 'Monsoon Low' },
      { value: 1013, label: '1013 hPa', color: '#00e676', description: 'Standard MSLP' },
      { value: 1020, label: '1020 hPa', color: '#00bcd4', description: 'Moderate High' },
      { value: 1028, label: '1028+ hPa', color: '#1565c0', description: 'Strong Anticyclone' },
    ],
    explanation: {
      low: 'Crimson and Amber zones indicate Low Pressure Depressions (<1000 hPa) that pull in moisture and drive cyclones.',
      high: 'Cyan and Blue zones mark High Pressure ridges (>1016 hPa) characterized by subsiding air and calm, dry weather.',
      summary: 'Storm systems develop where pressure plunges into orange/crimson; blue zones indicate atmospheric stability.',
    },
    getCurrentValue: (reg) => {
      const p = reg.pressureHpa;
      // Map 975 -> 0%, 1030 -> 100%
      const pct = Math.min(100, Math.max(3, ((p - 975) / 55) * 100));
      let statusLabel = 'Standard Atmospheric';
      let badgeColor = '#00e676';

      if (p < 990) {
        statusLabel = 'Deep Depression / Cyclone';
        badgeColor = '#880e4f';
      } else if (p < 1004) {
        statusLabel = 'Low Pressure Trough';
        badgeColor = '#ff6f00';
      } else if (p <= 1016) {
        statusLabel = 'Standard MSLP';
        badgeColor = '#00e676';
      } else {
        statusLabel = 'High Pressure Ridge';
        badgeColor = '#00bcd4';
      }

      return {
        value: p,
        formatted: `${p} hPa`,
        statusLabel,
        percentage: pct,
        badgeColor,
      };
    },
  },

  clouds_new: {
    layerId: 'clouds_new',
    title: 'Satellite Cloud Cover Density',
    variableName: 'Cloud Cover',
    unit: '%',
    lowLabel: 'Lower (0% / Clear)',
    highLabel: 'Higher (100% / Overcast)',
    gradientCss: 'linear-gradient(to right, #0f172a, #334155, #64748b, #94a3b8, #cbd5e1, #ffffff)',
    stops: [
      { value: 0, label: '0%', color: '#0f172a', description: 'Clear Sky' },
      { value: 20, label: '20%', color: '#334155', description: 'Few Clouds' },
      { value: 45, label: '45%', color: '#64748b', description: 'Scattered' },
      { value: 70, label: '70%', color: '#94a3b8', description: 'Broken' },
      { value: 90, label: '90%', color: '#cbd5e1', description: 'Dense Cloud' },
      { value: 100, label: '100%', color: '#ffffff', description: 'Heavy Overcast' },
    ],
    explanation: {
      low: 'Dark and deep slate zones represent clear or partly sunny skies with minimal obstruction to solar radiation.',
      high: 'Bright White formations indicate thick, multi-layered cloud decks and towering cumulonimbus convective heads.',
      summary: 'Cross-reference dense white cloud clusters with the Rain Radar layer to verify active precipitation.',
    },
    getCurrentValue: (reg) => {
      // Estimate cloud cover percentage from humidity and rainfall
      const cloudPct = Math.min(100, Math.max(10, Math.round(reg.humidity * 0.95)));
      let statusLabel = 'Partly Cloudy';
      let badgeColor = '#94a3b8';

      if (cloudPct >= 80 || reg.rainfall24h > 5) {
        statusLabel = 'Overcast / Heavy Clouds';
        badgeColor = '#ffffff';
      } else if (cloudPct >= 50) {
        statusLabel = 'Broken Clouds';
        badgeColor = '#cbd5e1';
      } else if (cloudPct >= 25) {
        statusLabel = 'Scattered Clouds';
        badgeColor = '#64748b';
      } else {
        statusLabel = 'Clear Sky';
        badgeColor = '#38bdf8';
      }

      return {
        value: cloudPct,
        formatted: `~${cloudPct}% Cover`,
        statusLabel,
        percentage: cloudPct,
        badgeColor,
      };
    },
  },
};
