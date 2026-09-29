import { ExplainData, ChangeExplanationData, WeatherVariable, ConfidenceBand } from '../../lib/api/types';
import { INDIA_REGIONS, getBustMetricsForRegion } from '../../lib/geo/indiaGeoJson';

export function getMockExplain(regionId: string = 'uttar-pradesh', leadDay: number = 7, variable: WeatherVariable = 'rainfall'): ExplainData {
  const region = INDIA_REGIONS.find((r) => r.id === regionId) || INDIA_REGIONS[0];
  const metrics = getBustMetricsForRegion(region.id, variable, leadDay);

  let factors = [];
  let text_en = '';
  let text_hi = '';
  let trust_guidance = '';

  if (metrics.confidence_band === 'High') {
    trust_guidance = 'This forecast is usually dependable in similar meteorological setups. Low spread across ensemble members and high run-to-run stability.';
    text_en = `High reliability for Day ${leadDay} ${variable}. ECMWF and GFS show strong synoptic agreement with tight ensemble clustering and minimal variance across consecutive runs.`;
    text_hi = `दिन ${leadDay} ${variable} के लिए उच्च विश्वसनीयता। प्रमुख मौसम मॉडल एकरूप हैं और पूर्वानुमान स्थिर है।`;
    factors = [
      {
        factor_key: 'model_disagreement' as const,
        title: 'Tight Model Consensus',
        description: 'ECMWF and GFS models are within 8% of each other across the entire state domain.',
        metric_label: 'Model Disagreement',
        metric_value: '3.4 mm divergence',
        importance_score: 0.88,
        evidence_data: {
          model_a: { name: 'ECMWF IFS', val: metrics.forecast_value_mean },
          model_b: { name: 'NOAA GFS', val: Number((metrics.forecast_value_mean * 1.05).toFixed(1)) }
        }
      },
      {
        factor_key: 'run_instability' as const,
        title: 'Run-to-Run Consistency',
        description: 'Little variation over the last 3 forecast initialization cycles (00Z, 12Z, 00Z).',
        metric_label: 'Run-to-Run Delta',
        metric_value: '±1.8 mm over 24h',
        importance_score: 0.76
      },
      {
        factor_key: 'historical_similarity' as const,
        title: 'Historical High-Skill Regime',
        description: 'Past analogs in this synoptic regime had an 88% verification hit rate at Day 7.',
        metric_label: 'Past Regime Skill',
        metric_value: '88% Verified Accurate',
        importance_score: 0.65
      }
    ];
  } else if (metrics.confidence_band === 'Moderate') {
    trust_guidance = 'Use as guidance; re-check with the next forecast cycle. Avoid making irrevocable scheduling decisions based on this lead alone.';
    text_en = `Moderate reliability for Day ${leadDay} ${variable}. Notable ensemble spread and moderate spatial divergence between GFS and IFS on the exact timing of moisture convergence.`;
    text_hi = `दिन ${leadDay} ${variable} के लिए मध्यम विश्वसनीयता। मॉडल के बीच वर्षा के समय और स्थान को लेकर मध्यम अंतर है।`;
    factors = [
      {
        factor_key: 'model_disagreement' as const,
        title: 'Inter-Model Disagreement',
        description: 'GFS and ECMWF differ on the offshore trough axis position and intensity.',
        metric_label: 'Model Spread',
        metric_value: `${Math.round(metrics.forecast_value_mean * 0.35)} mm spread`,
        importance_score: 0.82,
        evidence_data: {
          model_a: { name: 'ECMWF IFS', val: metrics.forecast_value_mean },
          model_b: { name: 'NOAA GFS', val: Number((metrics.forecast_value_mean * 1.35).toFixed(1)) }
        }
      },
      {
        factor_key: 'run_instability' as const,
        title: 'Run-to-Run Instability',
        description: 'The forecast shifted between the 12Z and 00Z cycles as convective parameterization adjusted.',
        metric_label: 'Cycle Change',
        metric_value: `${metrics.err_q50} mm shift`,
        importance_score: 0.71
      },
      {
        factor_key: 'synoptic_gradient' as const,
        title: 'Synoptic Pressure Gradient',
        description: 'A sharp low-level jet boundary creates localized sensitivity to minor wind shifts.',
        metric_label: 'Jet Shear',
        metric_value: '18 kts shear gradient',
        importance_score: 0.64
      }
    ];
  } else {
    trust_guidance = 'Treat as an early heads-up only. Avoid irreversible decisions on this forecast alone; monitor incoming cycles as lead time decreases.';
    text_en = `Low reliability for Day ${leadDay} ${variable} (Bust Probability: ${Math.round(metrics.p_bust_cal * 100)}%). Large ensemble bifurcation and heavy run-to-run volatility.`;
    text_hi = `दिन ${leadDay} ${variable} के लिए कम विश्वसनीयता। पूर्वानुमान में विफलता की संभावना अधिक है।`;
    factors = [
      {
        factor_key: 'model_disagreement' as const,
        title: 'Extreme Model Disagreement',
        description: 'GFS and ECMWF depict contrasting synoptic regimes: GFS predicts heavy localized cloudburst while ECMWF predicts scattered light precipitation.',
        metric_label: 'Spread Magnitude',
        metric_value: `${Math.round(metrics.forecast_value_mean * 0.75)} mm divergence`,
        importance_score: 0.94,
        evidence_data: {
          model_a: { name: 'ECMWF IFS', val: metrics.forecast_value_mean },
          model_b: { name: 'NOAA GFS', val: Number((metrics.forecast_value_mean * 1.75).toFixed(1)) }
        }
      },
      {
        factor_key: 'run_instability' as const,
        title: 'High Run-to-Run Volatility ("Jumpiness")',
        description: 'Consecutive model runs have jumped by more than 40 mm, indicating numerical instability at this lead.',
        metric_label: 'Run Jump',
        metric_value: `+${Math.round(metrics.forecast_value_mean * 0.48)} mm vs previous run`,
        importance_score: 0.89
      },
      {
        factor_key: 'historical_similarity' as const,
        title: 'Similar Historical Situations Busted',
        description: '4 out of 5 closest past meteorological analogs produced forecast bust errors exceeding 50 mm.',
        metric_label: 'Historical Bust Rate',
        metric_value: '80% Analog Bust Rate',
        importance_score: 0.81
      }
    ];
  }

  return {
    region_id: region.id,
    region_name: region.name_en,
    lead_day: leadDay,
    variable,
    text_en,
    text_hi,
    factors,
    trust_guidance
  };
}

export function getMockChangeExplanation(regionId: string = 'uttar-pradesh', leadDay: number = 7, variable: WeatherVariable = 'rainfall'): ChangeExplanationData {
  const region = INDIA_REGIONS.find((r) => r.id === regionId) || INDIA_REGIONS[0];
  const metrics = getBustMetricsForRegion(region.id, variable, leadDay);

  const curr_p_bust = metrics.p_bust_cal;
  const prev_p_bust = Math.min(0.85, Math.max(0.12, Number((curr_p_bust - 0.10).toFixed(2))));

  let prev_band: ConfidenceBand = 'High';
  if (prev_p_bust >= 0.52) prev_band = 'Low';
  else if (prev_p_bust >= 0.25) prev_band = 'Moderate';

  const diffPoints = Math.round((curr_p_bust - prev_p_bust) * 100);

  return {
    region_id: region.id,
    region_name: region.name_en,
    lead_day: leadDay,
    variable,
    from_cycle: 'ECMWF IFS 2026-09-22T12:00:00Z',
    to_cycle: 'ECMWF IFS 2026-09-23T00:00:00Z',
    prev_p_bust,
    curr_p_bust,
    prev_band,
    curr_band: metrics.confidence_band,
    summary_en: `Reliability decreased by ${Math.abs(diffPoints)} percentage points because model disagreement widened between GFS and IFS, and the latest forecast changed by ${metrics.err_q50} mm from the previous cycle.`,
    delta_factors: [
      {
        factor_name: 'Inter-Model Disagreement Widened',
        delta_contribution: +0.07,
        explanation: 'GFS shifted monsoon low track 140 km eastwards while ECMWF held position.'
      },
      {
        factor_name: 'Run-to-Run Precipitation Surge',
        delta_contribution: +0.04,
        explanation: 'Area-mean forecast increased from 48 mm to 72 mm in a single cycle.'
      },
      {
        factor_name: 'Ensemble Member Divergence',
        delta_contribution: +0.03,
        explanation: 'Standard deviation across 50 GEFS/ECMWF ensemble members expanded by 22%.'
      }
    ]
  };
}
