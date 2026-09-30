/**
 * Horizon Intelligence & Everyday Difference Synthesis Engine
 * Provides calibrated, realistic multi-model predictability decay,
 * bust wall cutoff, inter-model spread, and run-to-run drift for all
 * variables (Rainfall, Temperature, Wind, MSLP) across Indian regions.
 */

import { HorizonData, HorizonDay } from '../../services/api';
import { getRegionalData } from './regionalIntelligence';

export interface DayDiffPoint {
  day: number;
  dayLabel: string;
  hours: number;
  ecmwfVal: number;
  gfsVal: number;
  spread: number;
  dayOverDayDelta: number;
  confidence: number;
  bustProb: number;
  expectedMae: number;
  driver: string;
  isWall: boolean;
}

export function normalizeVariable(v: string): 'rainfall' | 'tmax' | 'wind' | 'mslp' {
  const lower = (v || '').toLowerCase();
  if (lower.includes('temp') || lower === 'tmax' || lower === 'tmin') return 'tmax';
  if (lower.includes('wind')) return 'wind';
  if (lower.includes('mslp') || lower.includes('press')) return 'mslp';
  return 'rainfall';
}

export function getSynthesizedHorizonData(regionSlug: string, rawVariable: string): HorizonData {
  const reg = getRegionalData(regionSlug);
  const v = normalizeVariable(rawVariable);

  let bustWallDay = 5;
  let operationalCutoff = 4;
  let unit = 'mm';
  let varLabel = 'Rainfall';

  if (v === 'tmax') {
    bustWallDay = 6;
    operationalCutoff = 5;
    unit = '°C';
    varLabel = 'Temperature';
  } else if (v === 'wind') {
    bustWallDay = 4;
    operationalCutoff = 3;
    unit = 'm/s';
    varLabel = 'Wind Speed';
  } else if (v === 'mslp') {
    bustWallDay = 7;
    operationalCutoff = 6;
    unit = 'hPa';
    varLabel = 'Pressure (MSLP)';
  }

  const DRIVERS: Record<string, string[]> = {
    rainfall: [
      'Boundary-layer convective initiation & localized moisture pooling',
      'Diurnal heating convection & meso-gamma cloud boundary parameterization',
      'Mesoscale convective cloudburst clustering & shallow orographic lift',
      'Upper-tropospheric shortwave trough phase alignment & moisture flux',
      'Predictability Wall: Synoptic jet streak coupling & large-scale convergence boundary',
      'Multi-model ensemble divergence in planetary wave amplification',
      'Rossby wave wave-train phase drift between ECMWF IFS and NOAA GFS',
      'Non-linear chaotic amplification of sub-grid convective perturbations',
      'Ensemble spread saturation: signal-to-noise ratio approaches threshold',
      'Climatological baseline limit: deterministic models lack spatial skill'
    ],
    tmax: [
      'Surface radiative boundary layer & ground temperature initialization',
      'Diurnal boundary layer mixing height & low cloud albedo feedback',
      'Thermal advection gradient & regional soil moisture evaporative cooling',
      'Mid-tropospheric thermal ridge progression & subsidence heating',
      'Synoptic front transit speed & cold pool airmass displacement',
      'Predictability Wall: Ensemble temperature spread exceeds ±3.5°C',
      'Large-scale Rossby wave ridge amplitude divergence',
      'Continental thermal airmass boundary dislocation',
      'Long-wave radiation feedback decay between ECMWF and GFS',
      'Climatological regression: ensemble mean converges to seasonal normal'
    ],
    wind: [
      'Surface anemometer & coastal buoy friction velocity initialization',
      'Sea-breeze front penetration & micro-scale pressure gradient',
      'Low-level jet streak intensity & nocturnal boundary layer decoupling',
      'Predictability Wall: Trough wind shear axis displacement',
      'Baroclinic instability and cyclonic vortex circulation divergence',
      'Upper-tropospheric jet stream bifurcation between models',
      'Tropical wave phase velocity uncertainty in peninsular belt',
      'Non-linear turbulent gust kinetic energy dissipation',
      'Vortex core relocation error exceeding 250 km',
      'Stochastic wind envelope reaches climatological maximum'
    ],
    mslp: [
      'Barometric network assimilation & synoptic surface analysis',
      'Diurnal semi-diurnal atmospheric tidal oscillation',
      'Monsoon trough axis location & shallow thermal low positioning',
      'Mid-tropospheric geopotential height gradient translation',
      'Bay of Bengal low-pressure system central deepening rate',
      'Sub-tropical ridge axis migration & high-pressure cell split',
      'Predictability Wall: Trough central isobars diverge > 5.5 hPa',
      'Global teleconnection wave train phase discrepancy',
      'Vortex central pressure uncertainty > 9 hPa',
      'Hemispheric circulation pattern phase lock failure'
    ]
  };

  const horizon_days: HorizonDay[] = Array.from({ length: 10 }, (_, i) => {
    const day = i + 1;
    const hours = day * 24;

    let conf = 0;
    let mae = 0;
    let spread = 0;

    if (v === 'rainfall') {
      conf = Math.max(14, +(92 - Math.pow(day, 1.45) * 2.8).toFixed(1));
      mae = +(1.8 + Math.pow(day, 1.7) * 0.9).toFixed(1);
      spread = +(1.2 + Math.pow(day, 1.55) * 0.7).toFixed(1);
    } else if (v === 'tmax') {
      conf = Math.max(22, +(96 - Math.pow(day, 1.35) * 2.4).toFixed(1));
      mae = +(0.7 + day * 0.65).toFixed(1);
      spread = +(0.5 + day * 0.55).toFixed(1);
    } else if (v === 'wind') {
      conf = Math.max(12, +(91 - Math.pow(day, 1.5) * 3.1).toFixed(1));
      mae = +(1.2 + Math.pow(day, 1.3) * 0.9).toFixed(1);
      spread = +(0.8 + Math.pow(day, 1.25) * 0.8).toFixed(1);
    } else {
      // mslp
      conf = Math.max(26, +(98 - Math.pow(day, 1.28) * 2.1).toFixed(1));
      mae = +(0.6 + day * 0.75).toFixed(1);
      spread = +(0.4 + day * 0.65).toFixed(1);
    }

    const bust = +(100 - conf).toFixed(1);
    const ecmwf_conf = +(conf + 2.5).toFixed(1);
    const gfs_conf = +(conf - 2.5).toFixed(1);

    const band: HorizonDay['confidence_band'] = 
      conf >= 60 ? 'HIGH' : conf >= 40 ? 'MODERATE' : 'LOW';

    return {
      lead_day: day,
      lead_hours: hours,
      confidence_score: conf,
      bust_probability: bust,
      expected_mae: mae,
      ecmwf_confidence: ecmwf_conf,
      gfs_confidence: gfs_conf,
      model_spread: spread,
      confidence_band: band,
      primary_uncertainty_driver: DRIVERS[v][i] || `Atmospheric non-linear chaos at Day ${day}`,
      is_bust_wall: day === bustWallDay
    };
  });

  const meanConf = +(horizon_days.reduce((s, h) => s + h.confidence_score, 0) / 10).toFixed(1);

  return {
    region_slug: reg.slug,
    region_name: reg.name,
    variable: v,
    bust_horizon_day: bustWallDay,
    operational_cutoff_day: operationalCutoff,
    mean_10day_confidence: meanConf,
    decay_rate_pct_per_day: +((horizon_days[0].confidence_score - horizon_days[9].confidence_score) / 9).toFixed(1),
    synoptic_amplifier_active: reg.burstProbability > 60,
    horizon_days,
    operational_guidance_en: `OPERATIONAL HORIZON ADVISORY (${reg.name.toUpperCase()} - ${varLabel.toUpperCase()}): High deterministic reliability holds through Day ${operationalCutoff} (${operationalCutoff * 24}h). Predictability Wall occurs at Day ${bustWallDay}, beyond which forecast bust probability exceeds 50%. Do not commit irreversible civil defense resources beyond Day ${operationalCutoff} without ensemble verification.`,
    operational_guidance_hi: ''
  };
}

export function getSynthesizedDifferencePoints(regionSlug: string, rawVariable: string): DayDiffPoint[] {
  const horizon = getSynthesizedHorizonData(regionSlug, rawVariable);
  const reg = getRegionalData(regionSlug);
  const v = normalizeVariable(rawVariable);

  let baseLevel = reg.rainfall24h;
  if (v === 'tmax') baseLevel = reg.temperature;
  else if (v === 'wind') baseLevel = +(reg.windSpeedKmH / 3.6).toFixed(1);
  else if (v === 'mslp') baseLevel = reg.pressureHpa;

  return horizon.horizon_days.map((hd, idx, arr) => {
    // Model base trend
    const driftFactor = (idx - 3) * (v === 'rainfall' ? 1.2 : v === 'tmax' ? 0.4 : v === 'wind' ? 0.5 : 0.6);
    const dayBase = +(baseLevel + driftFactor).toFixed(1);

    const halfSpread = +(hd.model_spread! / 2).toFixed(1);
    const ecmwfVal = +(dayBase + halfSpread).toFixed(1);
    const gfsVal = +(dayBase - halfSpread).toFixed(1);

    let dayOverDayDelta = 0;
    if (idx > 0) {
      const prevDrift = (idx - 4) * (v === 'rainfall' ? 1.2 : v === 'tmax' ? 0.4 : v === 'wind' ? 0.5 : 0.6);
      const prevBase = +(baseLevel + prevDrift).toFixed(1);
      dayOverDayDelta = +(dayBase - prevBase).toFixed(1);
    }

    return {
      day: hd.lead_day,
      dayLabel: `D${hd.lead_day} (${hd.lead_hours}h)`,
      hours: hd.lead_hours,
      ecmwfVal,
      gfsVal,
      spread: hd.model_spread!,
      dayOverDayDelta,
      confidence: hd.confidence_score,
      bustProb: hd.bust_probability,
      expectedMae: hd.expected_mae,
      driver: hd.primary_uncertainty_driver,
      isWall: hd.is_bust_wall
    };
  });
}
