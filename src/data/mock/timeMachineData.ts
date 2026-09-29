import { TimeMachineReplayData, ReplayLeadStep } from '../../lib/api/types';

export const HISTORICAL_REPLAY_EVENTS: Record<string, TimeMachineReplayData> = {
  'cyclone-biparjoy-2023': {
    event_id: 'cyclone-biparjoy-2023',
    event_name: 'Very Severe Cyclonic Storm Biparjoy Landfall (Gujarat)',
    valid_date: '2023-06-15',
    region_id: 'gujarat',
    region_name: 'Gujarat',
    variable: 'wind',
    unit: 'm/s',
    final_observation: 38.5, // ~138 km/h wind
    steps: [
      {
        lead_day: 10,
        cycle_init_time_utc: '2023-06-05T00:00:00Z',
        forecast_value: 12.0,
        observed_truth: 38.5,
        error_at_lead: -26.5,
        p_bust_cal: 0.84,
        band: 'Low',
        top_risk_reason: 'Track bifurcation in Arabian Sea; ECMWF ensemble cone spanned Oman to Pakistan.'
      },
      {
        lead_day: 9,
        cycle_init_time_utc: '2023-06-06T00:00:00Z',
        forecast_value: 14.5,
        observed_truth: 38.5,
        error_at_lead: -24.0,
        p_bust_cal: 0.81,
        band: 'Low',
        top_risk_reason: 'Slow movement speed over warm sea surface temperatures; intensity models lagging.'
      },
      {
        lead_day: 8,
        cycle_init_time_utc: '2023-06-07T00:00:00Z',
        forecast_value: 17.0,
        observed_truth: 38.5,
        error_at_lead: -21.5,
        p_bust_cal: 0.77,
        band: 'Low',
        top_risk_reason: 'Subtropical ridge steering pattern remained uncertain in GFS vs IFS runs.'
      },
      {
        lead_day: 7,
        cycle_init_time_utc: '2023-06-08T00:00:00Z',
        forecast_value: 19.5,
        observed_truth: 38.5,
        error_at_lead: -19.0,
        p_bust_cal: 0.71,
        band: 'Low',
        top_risk_reason: 'Ensemble spread began collapsing eastward toward Saurashtra & Kutch coast.'
      },
      {
        lead_day: 6,
        cycle_init_time_utc: '2023-06-09T00:00:00Z',
        forecast_value: 23.0,
        observed_truth: 38.5,
        error_at_lead: -15.5,
        p_bust_cal: 0.62,
        band: 'Low',
        top_risk_reason: 'Recurvature timing shifted forecast landfall point by 200 km.'
      },
      {
        lead_day: 5,
        cycle_init_time_utc: '2023-06-10T00:00:00Z',
        forecast_value: 28.0,
        observed_truth: 38.5,
        error_at_lead: -10.5,
        p_bust_cal: 0.49,
        band: 'Moderate',
        top_risk_reason: 'Deterministic GFS and ECMWF converged on Kutch coast landfall trajectory.'
      },
      {
        lead_day: 4,
        cycle_init_time_utc: '2023-06-11T00:00:00Z',
        forecast_value: 31.5,
        observed_truth: 38.5,
        error_at_lead: -7.0,
        p_bust_cal: 0.38,
        band: 'Moderate',
        top_risk_reason: 'Moderate intensity underestimation due to eyewall replacement cycle.'
      },
      {
        lead_day: 3,
        cycle_init_time_utc: '2023-06-12T00:00:00Z',
        forecast_value: 34.0,
        observed_truth: 38.5,
        error_at_lead: -4.5,
        p_bust_cal: 0.28,
        band: 'Moderate',
        top_risk_reason: 'Tight ensemble clustering on Jakhau Port landfall sector.'
      },
      {
        lead_day: 2,
        cycle_init_time_utc: '2023-06-13T00:00:00Z',
        forecast_value: 36.2,
        observed_truth: 38.5,
        error_at_lead: -2.3,
        p_bust_cal: 0.16,
        band: 'High',
        top_risk_reason: 'High synoptic consensus; Doppler weather radar assimilation active.'
      },
      {
        lead_day: 1,
        cycle_init_time_utc: '2023-06-14T00:00:00Z',
        forecast_value: 37.8,
        observed_truth: 38.5,
        error_at_lead: -0.7,
        p_bust_cal: 0.08,
        band: 'High',
        top_risk_reason: 'Deterministic forecast within 2% of actual observed landfall peak gusts.'
      }
    ]
  },
  'north-india-floods-july-2023': {
    event_id: 'north-india-floods-july-2023',
    event_name: 'North India Monsoon & Western Disturbance Cloudburst (Delhi & HP)',
    valid_date: '2023-07-09',
    region_id: 'delhi',
    region_name: 'Delhi (NCT)',
    variable: 'rainfall',
    unit: 'mm/24h',
    final_observation: 153.0,
    steps: [
      {
        lead_day: 10,
        cycle_init_time_utc: '2023-06-29T00:00:00Z',
        forecast_value: 18.0,
        observed_truth: 153.0,
        error_at_lead: -135.0,
        p_bust_cal: 0.89,
        band: 'Low',
        top_risk_reason: 'Western Disturbance interaction with monsoon surge was absent in Day 10 runs.'
      },
      {
        lead_day: 7,
        cycle_init_time_utc: '2023-07-02T00:00:00Z',
        forecast_value: 26.0,
        observed_truth: 153.0,
        error_at_lead: -127.0,
        p_bust_cal: 0.82,
        band: 'Low',
        top_risk_reason: 'Climatological bias damped extreme precipitation tail in NWP parameterization.'
      },
      {
        lead_day: 5,
        cycle_init_time_utc: '2023-07-04T00:00:00Z',
        forecast_value: 42.0,
        observed_truth: 153.0,
        error_at_lead: -111.0,
        p_bust_cal: 0.74,
        band: 'Low',
        top_risk_reason: 'Significant inter-model spread; GFS triggered localized heavy rain, IFS remained moderate.'
      },
      {
        lead_day: 3,
        cycle_init_time_utc: '2023-07-06T00:00:00Z',
        forecast_value: 78.0,
        observed_truth: 153.0,
        error_at_lead: -75.0,
        p_bust_cal: 0.61,
        band: 'Low',
        top_risk_reason: 'Run-to-run surge (+36 mm); platform flagged high bust probability despite rising values.'
      },
      {
        lead_day: 2,
        cycle_init_time_utc: '2023-07-07T00:00:00Z',
        forecast_value: 112.0,
        observed_truth: 153.0,
        error_at_lead: -41.0,
        p_bust_cal: 0.44,
        band: 'Moderate',
        top_risk_reason: 'Monsoon trough locked over NCR; precipitable water exceeded 72 mm.'
      },
      {
        lead_day: 1,
        cycle_init_time_utc: '2023-07-08T00:00:00Z',
        forecast_value: 142.0,
        observed_truth: 153.0,
        error_at_lead: -11.0,
        p_bust_cal: 0.19,
        band: 'High',
        top_risk_reason: 'Mesoscale convective complex captured across all radar and satellite assimilations.'
      }
    ]
  }
};

export function getMockReplayEvent(eventId: string = 'cyclone-biparjoy-2023'): TimeMachineReplayData {
  return HISTORICAL_REPLAY_EVENTS[eventId] || HISTORICAL_REPLAY_EVENTS['cyclone-biparjoy-2023'];
}
