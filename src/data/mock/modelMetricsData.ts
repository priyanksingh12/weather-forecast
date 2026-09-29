import { ModelCalibrationData, WeatherVariable } from '../../lib/api/types';

export function getMockModelCalibration(variable: WeatherVariable = 'rainfall', leadDay: number = 7): ModelCalibrationData {
  return {
    variable,
    lead_day: leadDay,
    model_version: 'bust-rain-v1.3',
    bust_definition_version: 'bd-1',
    training_period: 'Jan 2022 – Jun 2025 (Held-out validation: Monsoon 2025 – 2026)',
    evaluation_samples: 14280,
    brier_score: 0.118,
    brier_skill_score_vs_climatology: 0.284, // +28.4% improvement over climatological baseline
    roc_auc: 0.836,
    pr_auc: 0.692, // High precision-recall skill on 10% rare bust events
    bins: [
      { predicted_prob_center: 0.05, observed_frequency: 0.052, sample_count: 3120 },
      { predicted_prob_center: 0.15, observed_frequency: 0.148, sample_count: 2840 },
      { predicted_prob_center: 0.25, observed_frequency: 0.241, sample_count: 2210 },
      { predicted_prob_center: 0.35, observed_frequency: 0.362, sample_count: 1750 },
      { predicted_prob_center: 0.45, observed_frequency: 0.449, sample_count: 1410 },
      { predicted_prob_center: 0.55, observed_frequency: 0.563, sample_count: 1100 },
      { predicted_prob_center: 0.65, observed_frequency: 0.648, sample_count: 820 },
      { predicted_prob_center: 0.75, observed_frequency: 0.761, sample_count: 590 },
      { predicted_prob_center: 0.85, observed_frequency: 0.838, sample_count: 310 },
      { predicted_prob_center: 0.95, observed_frequency: 0.924, sample_count: 130 }
    ],
    performance_by_lead: [
      { lead_day: 1, brier_score: 0.038, pr_auc: 0.884 },
      { lead_day: 2, brier_score: 0.051, pr_auc: 0.841 },
      { lead_day: 3, brier_score: 0.068, pr_auc: 0.798 },
      { lead_day: 4, brier_score: 0.084, pr_auc: 0.754 },
      { lead_day: 5, brier_score: 0.099, pr_auc: 0.722 },
      { lead_day: 6, brier_score: 0.111, pr_auc: 0.704 },
      { lead_day: 7, brier_score: 0.118, pr_auc: 0.692 },
      { lead_day: 8, brier_score: 0.134, pr_auc: 0.661 },
      { lead_day: 9, brier_score: 0.149, pr_auc: 0.638 },
      { lead_day: 10, brier_score: 0.165, pr_auc: 0.612 }
    ],
    performance_by_variable: [
      { variable: 'rainfall', brier_score: 0.118, pr_auc: 0.692 },
      { variable: 'tmax', brier_score: 0.084, pr_auc: 0.782 },
      { variable: 'tmin', brier_score: 0.076, pr_auc: 0.804 },
      { variable: 'wind', brier_score: 0.129, pr_auc: 0.648 },
      { variable: 'mslp', brier_score: 0.052, pr_auc: 0.865 },
      { variable: 'humidity', brier_score: 0.141, pr_auc: 0.621 }
    ]
  };
}
