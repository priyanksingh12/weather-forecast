import { SimilarEventsData, WeatherVariable } from '../../lib/api/types';
import { INDIA_REGIONS, getBustMetricsForRegion } from '../../lib/geo/indiaGeoJson';

export function getMockSimilarEvents(
  regionId: string = 'uttar-pradesh',
  leadDay: number = 7,
  variable: WeatherVariable = 'rainfall'
): SimilarEventsData {
  const region = INDIA_REGIONS.find((r) => r.id === regionId) || INDIA_REGIONS[0];
  const metrics = getBustMetricsForRegion(region.id, variable, leadDay);

  const baseForecast = metrics.forecast_value_mean;

  const analogs = [
    {
      analog_event_id: 'analog-2024-07-18',
      event_name: 'Mid-Monsoon Low-Pressure Surge',
      historical_date: '18 July 2024',
      similarity_score: 0.94,
      forecast_issued: Math.round(baseForecast * 0.92),
      observed_actual: Math.round(baseForecast * 1.65),
      actual_error: Math.round(baseForecast * 0.73),
      did_bust: true,
      synoptic_summary: 'Offshore trough combined with depression moving west-northwest across central India.'
    },
    {
      analog_event_id: 'analog-2023-08-24',
      event_name: 'Active Monsoon Break Transition',
      historical_date: '24 August 2023',
      similarity_score: 0.89,
      forecast_issued: Math.round(baseForecast * 1.15),
      observed_actual: Math.round(baseForecast * 1.82),
      actual_error: Math.round(baseForecast * 0.67),
      did_bust: true,
      synoptic_summary: 'Rapid moisture convergence along foothills of Himalayas; unexpected cloudburst cell.'
    },
    {
      analog_event_id: 'analog-2022-09-12',
      event_name: 'Late-Season Depression Episode',
      historical_date: '12 September 2022',
      similarity_score: 0.86,
      forecast_issued: Math.round(baseForecast * 0.85),
      observed_actual: Math.round(baseForecast * 1.45),
      actual_error: Math.round(baseForecast * 0.60),
      did_bust: true,
      synoptic_summary: 'Bay of Bengal cyclonic circulation moved inland faster than GFS/IFS consensus.'
    },
    {
      analog_event_id: 'analog-2024-06-29',
      event_name: 'Monsoon Onset Surge',
      historical_date: '29 June 2024',
      similarity_score: 0.82,
      forecast_issued: Math.round(baseForecast * 1.05),
      observed_actual: Math.round(baseForecast * 1.70),
      actual_error: Math.round(baseForecast * 0.65),
      did_bust: true,
      synoptic_summary: 'Strong southwesterly low-level jet (35 kts) injected deep precipitable water.'
    },
    {
      analog_event_id: 'analog-2021-07-28',
      event_name: 'Stable Monsoon Steady Rain',
      historical_date: '28 July 2021',
      similarity_score: 0.79,
      forecast_issued: Math.round(baseForecast * 0.95),
      observed_actual: Math.round(baseForecast * 1.02),
      actual_error: Math.round(baseForecast * 0.07),
      did_bust: false,
      synoptic_summary: 'Uniform broad-scale stratiform rainfall; NWP models accurately captured accumulation.'
    }
  ];

  return {
    region_id: region.id,
    region_name: region.name_en,
    lead_day: leadDay,
    variable,
    analogs,
    analog_bust_frequency: 0.80 // 4 out of 5 busted
  };
}
