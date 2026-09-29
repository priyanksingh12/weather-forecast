import { ModelCalibrationData, WeatherVariable } from '../../lib/api/types';

// Variable baseline predictability parameters
const VARIABLE_PROFILES: Record<
  string,
  {
    baseBrier: number;
    brierDecay: number;
    basePrAuc: number;
    prAucDecay: number;
    baseRocAuc: number;
    skillBase: number;
    unit: string;
    label: string;
  }
> = {
  rainfall: {
    baseBrier: 0.038,
    brierDecay: 0.014,
    basePrAuc: 0.93,
    prAucDecay: 0.044,
    baseRocAuc: 0.94,
    skillBase: 0.42,
    unit: 'mm/24h',
    label: 'Rainfall',
  },
  tmax: {
    baseBrier: 0.022,
    brierDecay: 0.009,
    basePrAuc: 0.96,
    prAucDecay: 0.032,
    baseRocAuc: 0.97,
    skillBase: 0.54,
    unit: '°C',
    label: 'Maximum Temperature',
  },
  tmin: {
    baseBrier: 0.024,
    brierDecay: 0.010,
    basePrAuc: 0.95,
    prAucDecay: 0.033,
    baseRocAuc: 0.96,
    skillBase: 0.51,
    unit: '°C',
    label: 'Minimum Temperature',
  },
  wind: {
    baseBrier: 0.042,
    brierDecay: 0.013,
    basePrAuc: 0.89,
    prAucDecay: 0.041,
    baseRocAuc: 0.91,
    skillBase: 0.35,
    unit: 'm/s',
    label: 'Wind Speed',
  },
  mslp: {
    baseBrier: 0.014,
    brierDecay: 0.007,
    basePrAuc: 0.98,
    prAucDecay: 0.026,
    baseRocAuc: 0.98,
    skillBase: 0.62,
    unit: 'hPa',
    label: 'Surface Pressure',
  },
  humidity: {
    baseBrier: 0.035,
    brierDecay: 0.012,
    basePrAuc: 0.91,
    prAucDecay: 0.038,
    baseRocAuc: 0.92,
    skillBase: 0.39,
    unit: '%',
    label: 'Relative Humidity',
  },
};

/**
 * Dynamically generates mathematically consistent, variable-specific,
 * and lead-day-specific calibration data.
 */
export function getMockModelCalibration(
  variable: WeatherVariable = 'rainfall',
  leadDay: number = 7
): ModelCalibrationData {
  const safeLead = Math.min(10, Math.max(1, leadDay || 1));
  const safeVar = variable in VARIABLE_PROFILES ? variable : 'rainfall';
  const profile = VARIABLE_PROFILES[safeVar];

  // Lead day scaling formulas
  const brierScore = +(profile.baseBrier + (safeLead - 1) * profile.brierDecay).toFixed(3);
  const prAuc = +(Math.max(0.42, profile.basePrAuc - (safeLead - 1) * profile.prAucDecay)).toFixed(3);
  const rocAuc = +(Math.max(0.55, profile.baseRocAuc - (safeLead - 1) * (profile.prAucDecay * 0.7))).toFixed(3);
  const skillScore = +(Math.max(0.12, profile.skillBase - (safeLead - 1) * 0.035)).toFixed(3);

  // Calibration curve bins (10 probability deciles from 5% to 95%)
  // At lead Day 1, observed frequency closely tracks predicted probability (high calibration).
  // As lead increases, divergence/drift increases according to atmospheric non-linearity.
  const binCenters = [0.05, 0.15, 0.25, 0.35, 0.45, 0.55, 0.65, 0.75, 0.85, 0.95];
  const sampleCounts = [3200, 2900, 2400, 1950, 1600, 1300, 950, 680, 390, 180];

  const bins = binCenters.map((predCenter, idx) => {
    // Variable-specific curvature drift
    const varFactor = safeVar === 'wind' ? 1.2 : safeVar === 'rainfall' ? 1.0 : safeVar === 'mslp' ? 0.4 : 0.7;
    // S-curve bias factor (models typically over-predict high probabilities at longer lead times)
    const sCurveBias = Math.sin((predCenter - 0.5) * Math.PI) * (safeLead * 0.008 * varFactor);
    // Residual noise based on decile sample size
    const noise = ((Math.sin(idx * 2.3 + safeLead) * 0.012) * Math.sqrt(safeLead) * 0.5);

    let observed = predCenter + sCurveBias + noise;
    observed = Math.max(0.01, Math.min(0.99, +(observed.toFixed(3))));

    const sampleCount = Math.round(sampleCounts[idx] * (1 - (safeLead - 1) * 0.04));

    return {
      predicted_prob_center: predCenter,
      observed_frequency: observed,
      sample_count: sampleCount,
      // Compatibility with backend keys
      bin_center: predCenter,
      bin_lower: +(predCenter - 0.05).toFixed(2),
      bin_upper: +(predCenter + 0.05).toFixed(2),
      predicted_prob_mean: predCenter,
      count: sampleCount,
    };
  });

  // Performance by lead curve (Day 1 through Day 10)
  const performanceByLead = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((d) => ({
    lead_day: d,
    brier_score: +(profile.baseBrier + (d - 1) * profile.brierDecay).toFixed(3),
    pr_auc: +(Math.max(0.42, profile.basePrAuc - (d - 1) * profile.prAucDecay)).toFixed(3),
  }));

  // Performance across variables
  const performanceByVariable = Object.keys(VARIABLE_PROFILES).map((vKey) => {
    const prof = VARIABLE_PROFILES[vKey];
    return {
      variable: vKey as WeatherVariable,
      brier_score: +(prof.baseBrier + (safeLead - 1) * prof.brierDecay).toFixed(3),
      pr_auc: +(Math.max(0.42, prof.basePrAuc - (safeLead - 1) * prof.prAucDecay)).toFixed(3),
    };
  });

  return {
    variable: safeVar as WeatherVariable,
    lead_day: safeLead,
    model_version: `lightgbm-calib-${safeVar}-v2.1`,
    bust_definition_version: 'bd-1',
    training_period: '2018–2025 ERA5 + IMD High-Resolution Gridded Reanalysis',
    evaluation_samples: Math.round(15600 * (1 - (safeLead - 1) * 0.02)),
    brier_score: brierScore,
    brier_skill_score_vs_climatology: skillScore,
    roc_auc: rocAuc,
    pr_auc: prAuc,
    bins,
    performance_by_lead: performanceByLead,
    performance_by_variable: performanceByVariable,
  };
}
