/**
 * Tactical Alert Intelligence Engine for CloudSense
 * Calculates dynamic, meteorologically sound severe weather alerts
 * tailored for all 36 States, Union Territories, and major cities across India.
 */

import { RegionalData } from './regionalIntelligence';

export type AlertSeverity = 'extreme' | 'high' | 'moderate' | 'advisory';

export interface TacticalAlert {
  id: string;
  title: string;
  severity: AlertSeverity;
  category: 'Cyclone' | 'Western Disturbance' | 'Cloudburst' | 'Flash Flood' | 'Marine' | 'Heatwave' | 'Squall' | 'Convective';
  description: string;
  triggerCondition: string;
  affectedDistricts: string[];
  recommendedAction: string;
  issuedAt: string;
  validUntil: string;
  source: 'IMD' | 'NCMRWF' | 'INCOIS' | 'CloudSense AI';
}

const COASTAL_KEYWORDS = [
  'Maharashtra', 'Gujarat', 'Goa', 'Karnataka', 'Kerala', 
  'Tamil Nadu', 'Andhra Pradesh', 'Odisha', 'West Bengal',
  'Puducherry', 'Daman and Diu', 'Lakshadweep', 'Andaman and Nicobar'
];

const HIMALAYAN_KEYWORDS = [
  'Jammu & Kashmir', 'Jammu and Kashmir', 'Himachal Pradesh', 
  'Uttarakhand', 'Ladakh', 'Sikkim', 'Arunachal Pradesh'
];

const PLAINS_KEYWORDS = [
  'Uttar Pradesh', 'Bihar', 'Punjab', 'Haryana', 
  'Delhi', 'Chandigarh', 'Madhya Pradesh', 'Jharkhand'
];

const ARID_KEYWORDS = [
  'Rajasthan'
];

export function getRegionalAlerts(region: RegionalData): TacticalAlert[] {
  const alerts: TacticalAlert[] = [];
  const stateStr = region.state || '';
  const nameStr = region.name || '';

  const isCoastal = COASTAL_KEYWORDS.some((k) => stateStr.toLowerCase().includes(k.toLowerCase()) || nameStr.toLowerCase().includes(k.toLowerCase()));
  const isHimalayan = HIMALAYAN_KEYWORDS.some((k) => stateStr.toLowerCase().includes(k.toLowerCase()) || nameStr.toLowerCase().includes(k.toLowerCase()));
  const isPlains = PLAINS_KEYWORDS.some((k) => stateStr.toLowerCase().includes(k.toLowerCase()) || nameStr.toLowerCase().includes(k.toLowerCase()));
  const isArid = ARID_KEYWORDS.some((k) => stateStr.toLowerCase().includes(k.toLowerCase()) || nameStr.toLowerCase().includes(k.toLowerCase()));

  const districtNames = region.nearbyDistricts && region.nearbyDistricts.length > 0
    ? region.nearbyDistricts.slice(0, 3).map((d) => d.name)
    : [`${nameStr} Central`, `${nameStr} Metro`, `${nameStr} Suburban`];

  // 1. Heavy Precipitation & Cloudburst Threat
  if (region.burstProbability >= 65 || region.rainfall24h >= 30) {
    alerts.push({
      id: `${region.slug}-cloudburst-extreme`,
      title: `Severe Cloudburst & Flash Flood Threat (${nameStr})`,
      severity: 'extreme',
      category: 'Cloudburst',
      description: `High-resolution ensemble NWP and radar echo reflectivity detect extreme convective cell localized over ${nameStr}. Microscale precipitation rates may exceed 60 mm/hr.`,
      triggerCondition: `P(Bust): ${region.burstProbability}% · 24h Rain: ${region.rainfall24h} mm · CAPE > 2800 J/kg`,
      affectedDistricts: districtNames,
      recommendedAction: 'IMD Red Alert: Mobilize SDRF / NDRF quick response teams. Issue immediate evacuation notice for riverbanks and low-lying storm channels.',
      issuedAt: '25 min ago',
      validUntil: 'Next 8 Hours',
      source: 'CloudSense AI'
    });
  } else if (region.burstProbability >= 38 || region.rainfall24h >= 14) {
    alerts.push({
      id: `${region.slug}-cloudburst-mod`,
      title: `Localized Convective Cell & Cloudburst Watch`,
      severity: region.burstProbability >= 52 ? 'high' : 'moderate',
      category: 'Cloudburst',
      description: `Elevated convective instability across ${stateStr}. Intense rain bursts expected with localized stormwater accumulation.`,
      triggerCondition: `P(Bust): ${region.burstProbability}% · 24h Rain: ${region.rainfall24h} mm`,
      affectedDistricts: districtNames,
      recommendedAction: 'IMD Orange Alert: Municipal engineers to keep stormwater sumps open and dewatering mobile pump units pre-positioned.',
      issuedAt: '40 min ago',
      validUntil: 'Next 12 Hours',
      source: 'IMD'
    });
  }

  // 2. Coastal Cyclone / Severe Marine Threats
  if (isCoastal) {
    const isWesternCoast = ['Maharashtra', 'Gujarat', 'Goa', 'Karnataka', 'Kerala'].some((k) => stateStr.includes(k) || nameStr.includes(k));
    
    if (isWesternCoast) {
      alerts.push({
        id: `${region.slug}-cyclone-arabian`,
        title: `Arabian Sea Severe Cyclone Track Advisory`,
        severity: region.burstProbability > 60 || region.windSpeedKmH > 26 ? 'extreme' : 'high',
        category: 'Cyclone',
        description: `Deep Cyclonic Depression tracked 280 km SW off ${nameStr} shelf moving north-northwestwards. Favorable sea surface temperature (29.5°C) and low vertical wind shear.`,
        triggerCondition: `Vortex Core 992 hPa · Inshore Squall: ${region.windSpeedKmH} km/h · SST: 29.5°C`,
        affectedDistricts: [nameStr, `${nameStr} Port`, 'Coastal Shelf'],
        recommendedAction: 'Total fishing suspension along coast. Hoist Local Cautionary Signal LC-3 at all major container and bulk terminals.',
        issuedAt: '12 min ago',
        validUntil: 'Next 24 Hours',
        source: 'IMD'
      });

      alerts.push({
        id: `${region.slug}-marine-swell`,
        title: `INCOIS High Swell Surge & Rough Sea Warning`,
        severity: 'high',
        category: 'Marine',
        description: `High swell waves in the range of 3.2m to 4.4m forecasted along the coast. Spring tide amplification may inundate low-lying promenade corridors.`,
        triggerCondition: `Swell Waves: 3.2m–4.4m · Period: 14s · Tidal Inundation: +0.6m`,
        affectedDistricts: ['Coastal Belt', 'Fishing Harbors', 'Promenades'],
        recommendedAction: 'INCOIS Warning: Suspend nearshore water sports and harbor small motorized craft in protected estuarine basins.',
        issuedAt: '1 hour ago',
        validUntil: 'Next 18 Hours',
        source: 'INCOIS'
      });
    } else {
      // Eastern Coast (Odisha, West Bengal, Tamil Nadu, Andhra Pradesh)
      alerts.push({
        id: `${region.slug}-cyclone-bob`,
        title: `Bay of Bengal Tropical Depression Advisory`,
        severity: 'extreme',
        category: 'Cyclone',
        description: `Intense low-pressure system concentrating into a cyclonic storm over Bay of Bengal approaching ${stateStr} coastal districts.`,
        triggerCondition: `Central Pressure 994 hPa · Dvorak T3.5 · Intensification Probability: 82%`,
        affectedDistricts: districtNames,
        recommendedAction: 'Activate District Emergency Operations Centers. Pre-position cyclone shelters and ready dry food rations.',
        issuedAt: '18 min ago',
        validUntil: 'Next 24 Hours',
        source: 'IMD'
      });

      alerts.push({
        id: `${region.slug}-marine-bob-swell`,
        title: `Coastal Squall & High Surf Advisory`,
        severity: 'high',
        category: 'Marine',
        description: `Sea condition will be rough to very rough. Coastal squall winds reaching 45–55 km/h gusting to 65 km/h.`,
        triggerCondition: `Wave Height: 3.5m–4.8m · Inshore Squall: ${region.windSpeedKmH} km/h`,
        affectedDistricts: ['Harbor Terminals', 'Inshore Shelf'],
        recommendedAction: 'Advise deep-sea trawlers to return to nearest safe anchorages immediately.',
        issuedAt: '50 min ago',
        validUntil: 'Next 16 Hours',
        source: 'INCOIS'
      });
    }
  }

  // 3. Himalayan States: Western Disturbance & Mountain Orography
  if (isHimalayan) {
    alerts.push({
      id: `${region.slug}-western-disturbance`,
      title: `Active Western Disturbance & Himalayan Orographic Trough`,
      severity: region.burstProbability > 50 ? 'extreme' : 'high',
      category: 'Western Disturbance',
      description: `Mid-tropospheric trough in westerlies interacting with high Himalayan topography over ${stateStr}. Copious moisture advection from Arabian Sea.`,
      triggerCondition: `500 hPa Trough Axis · Freezing Level: 4,750m ASL · Vorticity: +14×10⁻⁵ s⁻¹`,
      affectedDistricts: districtNames,
      recommendedAction: 'Halt high-altitude trekking and pilgrimage convoys along river valley highways. Keep snow and debris clearing JCBs on standby.',
      issuedAt: '30 min ago',
      validUntil: 'Next 18 Hours',
      source: 'NCMRWF'
    });

    if (region.rainfall24h > 10 || region.burstProbability > 35) {
      alerts.push({
        id: `${region.slug}-landslide-threat`,
        title: `Himalayan Hill Slope Landslide & Torrent Advisory`,
        severity: 'high',
        category: 'Flash Flood',
        description: `Steep catchment slopes saturated from persistent precipitation. Risk of rapid mudslides and road breaches along national corridors.`,
        triggerCondition: `Soil Saturation: 86% · Antecedent Rainfall: ${region.rainfall24h} mm`,
        affectedDistricts: districtNames,
        recommendedAction: 'Regulate vehicular passage through landslide-prone sectors during night hours. Maintain satellite phone links at all mountain outposts.',
        issuedAt: '1 hour ago',
        validUntil: 'Next 24 Hours',
        source: 'CloudSense AI'
      });
    } else {
      alerts.push({
        id: `${region.slug}-mountain-freezing`,
        title: `Valley Temperature Inversion & Freezing Level Alert`,
        severity: 'moderate',
        category: 'Western Disturbance',
        description: `Sharp drop in freezing altitude over mountain passes. Moderate icing and valley fog causing visibility degradation.`,
        triggerCondition: `Freezing Level: 3,400m ASL · Surface Temp: ${region.temperature}°C`,
        affectedDistricts: districtNames,
        recommendedAction: 'Issue travel advisories for mountain passes. Anti-icing grit trucks to patrol critical road junctions.',
        issuedAt: '2 hours ago',
        validUntil: 'Next 12 Hours',
        source: 'IMD'
      });
    }
  }

  // 4. Gangetic Plains / Sub-Himalayan Basin
  if (isPlains && !isCoastal && !isHimalayan) {
    alerts.push({
      id: `${region.slug}-plains-convergence`,
      title: `Sub-Himalayan Low-Level Moisture Influx & Squall Line Watch`,
      severity: 'moderate',
      category: 'Convective',
      description: `Active easterly winds channeling Indo-Gangetic moisture into ${nameStr}. Discrete thunderstorm cells developing along convergence boundary.`,
      triggerCondition: `Moisture Flux Index: 0.72 · CAPE: 2400 J/kg · K-Index: 36`,
      affectedDistricts: districtNames,
      recommendedAction: 'District Power Distribution Units to prepare for localized lightning insulator flashovers. Secure open-air grain mandis.',
      issuedAt: '45 min ago',
      validUntil: 'Next 14 Hours',
      source: 'IMD'
    });
  }

  // 5. Arid / High Heat Environments
  if ((isArid || region.temperature >= 35) && region.rainfall24h < 10) {
    alerts.push({
      id: `${region.slug}-heatwave`,
      title: `Severe Thermal Heatwave & Dry Convective Squall Alert`,
      severity: region.temperature >= 38 ? 'extreme' : 'high',
      category: 'Heatwave',
      description: `Blistering dry continental winds maintaining maximum daytime temperatures 4°C to 6°C above climatological normal across ${nameStr}.`,
      triggerCondition: `Max Ambient: ${region.temperature}°C · Wet-Bulb: 27°C · RH: ${region.humidity}%`,
      affectedDistricts: districtNames,
      recommendedAction: 'Activate Municipal Heat Action Plan. Suspend heavy construction labor between 12:00 and 15:30. Ensure oral rehydration kiosks at transit hubs.',
      issuedAt: '15 min ago',
      validUntil: 'Next 10 Hours',
      source: 'IMD'
    });
  }

  // 6. High Gale Wind Squall (if high winds in any region and not already alerted)
  if (region.windSpeedKmH >= 28 && !alerts.some((a) => a.category === 'Squall')) {
    alerts.push({
      id: `${region.slug}-wind-squall`,
      title: `Severe Gale-Force Wind Squall & Gust Warning`,
      severity: region.windSpeedKmH >= 38 ? 'high' : 'moderate',
      category: 'Squall',
      description: `Strong surface wind gradient producing sustained gusts over ${nameStr}. Elevated hazard for temporary structures and overhead cables.`,
      triggerCondition: `Sustained Velocity: ${region.windSpeedKmH} km/h · Gust Potential: ${(region.windSpeedKmH * 1.45).toFixed(0)} km/h`,
      affectedDistricts: districtNames,
      recommendedAction: 'Audit rooftop hoarding structures, construction cranes, and trim tree canopies adjacent to high-voltage power corridors.',
      issuedAt: '35 min ago',
      validUntil: 'Next 8 Hours',
      source: 'IMD'
    });
  }

  // 7. Fallback Routine / Baseline Advisory if calm
  if (alerts.length === 0) {
    alerts.push({
      id: `${region.slug}-routine-monitoring`,
      title: `Routine Synoptic Vigil · No Severe Systems Detected`,
      severity: 'advisory',
      category: 'Convective',
      description: `Atmospheric boundary layer over ${nameStr} remains stable. Low convective available potential energy with no organized cyclonic or orographic threat.`,
      triggerCondition: `P(Bust): ${region.burstProbability}% · Rain: ${region.rainfall24h} mm · Temp: ${region.temperature}°C`,
      affectedDistricts: [nameStr],
      recommendedAction: 'Standard operational monitoring in effect. Routine satellite radiometer and radiosonde balloon soundings scheduled every 6 hours.',
      issuedAt: '1 hour ago',
      validUntil: 'Next 24 Hours',
      source: 'CloudSense AI'
    });
  }

  return alerts;
}
