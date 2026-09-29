'use client';

import React, { useState } from 'react';
import { HeroBanner } from './HeroBanner';
import { LiveWeatherCard } from './LiveWeatherCard';
import { AirQualityWidget } from './AirQualityWidget';
import { KpiCardsRow } from './KpiCardsRow';
import { LiveRadarCard } from './LiveRadarCard';
import { BurstDetectionCard } from './BurstDetectionCard';
import { HourlyForecastCard } from './HourlyForecastCard';
import { RainfallPredictionCard } from './RainfallPredictionCard';
import { KeyInsightsCard } from './KeyInsightsCard';
import { MultiModelConsensus } from './MultiModelConsensus';
import { EverydayDifferenceChart } from './EverydayDifferenceChart';
import { HorizonPredictabilityWall } from './HorizonPredictabilityWall';
import { GroundTruthVerification } from './GroundTruthVerification';
import { CycloneIntelligence } from './CycloneIntelligence';
import { SynopticIntelligence } from './SynopticIntelligence';
import { TelemetryStream } from './TelemetryStream';
import { WhatsAppIntegrationSection } from '../whatsapp/WhatsAppIntegrationSection';
import { Location3DModal } from '../map/Location3DModal';
import { ReportModal } from '../reports/ReportModal';
import { LiveRadarView } from '../views/LiveRadarView';
import { ForecastView } from '../views/ForecastView';
import { BurstDetectionView } from '../views/BurstDetectionView';
import { AnalyticsView } from '../views/AnalyticsView';
import { LocationsView } from '../views/LocationsView';
import { AlertsView } from '../views/AlertsView';
import { SettingsView } from '../views/SettingsView';
import { HelpView } from '../views/HelpView';
import { getRegionalData } from '../../lib/data/regionalIntelligence';
import { useLiveWeather } from '../../hooks/useLiveWeather';
import { WeatherVariable } from '../../lib/api/types';
import { 
  Cpu, 
  ChevronDown, 
  ChevronUp, 
  Layers, 
  Radio, 
  Sparkles,
  ArrowRight
} from 'lucide-react';

interface CloudSenseDashboardProps {
  selectedRegionSlug: string;
  onSelectRegion: (slug: string) => void;
  activeViewTab?: string;
  onOpenReportModal?: () => void;
}

export const CloudSenseDashboard: React.FC<CloudSenseDashboardProps> = ({
  selectedRegionSlug,
  onSelectRegion,
  activeViewTab = 'dashboard',
  onOpenReportModal,
}) => {
  const [variable, setVariable] = useState<WeatherVariable>('rainfall');
  const [day, setDay] = useState(1);
  const [showDeepIntelligence, setShowDeepIntelligence] = useState(false);
  const [modal3dOpen, setModal3dOpen] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);

  // Region static-calibrated data fallback + live data sync
  const regionData = getRegionalData(selectedRegionSlug);

  // Live OpenWeather telemetry via custom hook (Section 7.4 & 10)
  const { weather: liveWeather, airQuality: liveAirQuality, loading: liveLoading } = useLiveWeather(selectedRegionSlug);

  // Route to dedicated sidebar views if selected
  if (activeViewTab === 'radar' || activeViewTab === '3d-visualization') {
    return <LiveRadarView currentRegion={regionData} onSelectRegion={onSelectRegion} />;
  }

  if (activeViewTab === 'forecast') {
    return <ForecastView currentRegion={regionData} onSelectRegion={onSelectRegion} />;
  }

  if (activeViewTab === 'burst') {
    return <BurstDetectionView currentRegion={regionData} onSelectRegion={onSelectRegion} />;
  }

  if (activeViewTab === 'analytics') {
    return <AnalyticsView currentRegion={regionData} onSelectRegion={onSelectRegion} />;
  }

  if (activeViewTab === 'locations') {
    return <LocationsView currentRegion={regionData} onSelectRegion={onSelectRegion} />;
  }

  if (activeViewTab === 'alerts') {
    return <AlertsView currentRegion={regionData} onSelectRegion={onSelectRegion} />;
  }

  if (activeViewTab === 'settings') {
    return <SettingsView currentRegion={regionData} onSelectRegion={onSelectRegion} />;
  }

  if (activeViewTab === 'help') {
    return <HelpView />;
  }

  // DEFAULT: Dashboard Overview
  return (
    <div className="w-full space-y-6 sm:space-y-8 p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto">
      {/* 1. PANORAMIC HERO BANNER */}
      <section aria-label="Current Weather Banner">
        <HeroBanner
          cityName={regionData.name}
          stateName={regionData.state}
          coordinates={regionData.coordinates}
          temperature={liveWeather ? Math.round(liveWeather.temp) : regionData.temperature}
          conditionText={liveWeather?.weather?.[0]?.description ? liveWeather.weather[0].description : regionData.conditionText}
          feelsLike={liveWeather ? Math.round(liveWeather.feels_like) : regionData.feelsLike}
          humidity={liveWeather ? liveWeather.humidity_pct : regionData.humidity}
          windSpeedKmH={liveWeather ? Math.round(liveWeather.wind_speed_mps * 3.6) : regionData.windSpeedKmH}
          pressureHpa={liveWeather ? Math.round(liveWeather.pressure_hpa) : regionData.pressureHpa}
          visibilityKm={liveWeather?.visibility_m ? Math.round(liveWeather.visibility_m / 1000) : regionData.visibilityKm}
        />
      </section>

      {/* 2. REAL-TIME GROUND TRUTH & AIR QUALITY (HANDBOOK SECTION 10 TASKS 2 & 3) */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6" aria-label="Real-Time OpenWeather Ground Truth & AQI">
        <LiveWeatherCard weather={liveWeather} loading={liveLoading} />
        <AirQualityWidget airQuality={liveAirQuality} loading={liveLoading} />
      </section>

      {/* 3. 4 QUICK STAT KPI CARDS */}
      <section aria-label="Key Weather Metrics">
        <KpiCardsRow
          rainfall24h={regionData.rainfall24h}
          rainfallTrend={regionData.rainfallTrend}
          burstProbability={regionData.burstProbability}
          burstRiskLabel={regionData.burstRiskLabel}
          windSpeedKmH={regionData.windSpeedKmH}
          windDirection={regionData.windDirection}
          temperature={liveWeather ? Math.round(liveWeather.temp) : regionData.temperature}
          tempTrend={regionData.tempTrend}
        />
      </section>

      {/* 4. MIDDLE SECTION: LIVE RADAR (LEFT ~62%) & BURST DETECTION (RIGHT ~38%) */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6" aria-label="Live Radar and AI Bust Detection">
        <div className="lg:col-span-8 flex flex-col">
          <LiveRadarCard
            currentRegion={regionData}
            onSelectRegion={onSelectRegion}
            onOpen3DFullscreen={() => setModal3dOpen(true)}
          />
        </div>

        <div className="lg:col-span-4 flex flex-col">
          <BurstDetectionCard
            burstProbability={regionData.burstProbability}
            riskLevel={regionData.burstRiskLabel}
            modelConfidence={regionData.modelConfidence}
            expectedIntensity={regionData.expectedIntensity}
            timeWindow={regionData.timeWindow}
            affectedAreas={regionData.affectedAreas}
            onViewDetailedAnalysis={() => setShowDeepIntelligence(true)}
          />
        </div>
      </section>

      {/* 5. BOTTOM SECTION: 3 CARDS IN A GRID */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6" aria-label="Forecasts and Key Insights">
        <div className="flex flex-col">
          <HourlyForecastCard
            hourlyData={regionData.hourlyForecast}
            onViewMore={() => setShowDeepIntelligence(true)}
          />
        </div>

        <div className="flex flex-col">
          <RainfallPredictionCard
            predictionData={regionData.rainfallPrediction}
          />
        </div>

        <div className="flex flex-col md:col-span-2 lg:col-span-1">
          <KeyInsightsCard
            cityName={regionData.name}
            insights={regionData.keyInsights}
            onViewAll={() => setShowDeepIntelligence(true)}
          />
        </div>
      </section>

      {/* 6. DEEP SIH INTELLIGENCE SECTION */}
      <section className="pt-4 border-t border-[var(--border)] space-y-6">
        <div className="flex flex-col gap-4 p-5 sm:p-6 rounded-3xl bg-[var(--surface)] border border-[var(--border)] shadow-xs">
          <div className="flex items-start gap-3.5">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[var(--weather-blue)]/15 text-[var(--weather-blue)] shadow-xs mt-0.5">
              <Cpu className="h-6 w-6" />
            </div>
            <div className="space-y-1 flex-1 min-w-0">
              <h2 className="text-lg sm:text-xl font-black tracking-tight text-[var(--text-primary)]">
                AI / NWP Multi-Model Deep Intelligence · {regionData.name}
              </h2>
              <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
                ECMWF IFS vs NOAA GFS spread, 10-day predictability decay, and synoptic threat verification
              </p>
            </div>
          </div>

          <div className="pt-3 border-t border-[var(--border)]/70 flex flex-wrap items-center justify-between gap-3 w-full">
            <span className="text-xs font-mono text-[var(--text-secondary)]">
              Subsystems: Multi-Model Consensus · Predictability Wall · FVA Truth Audits · Buoy Telemetry
            </span>

            <button
              onClick={() => setShowDeepIntelligence(!showDeepIntelligence)}
              className="flex items-center justify-center gap-2 px-4 py-2 rounded-2xl border border-[var(--border)] bg-[var(--muted-surface)] hover:bg-[var(--weather-blue)]/15 text-xs sm:text-sm font-bold text-[var(--text-primary)] transition-all cursor-pointer"
            >
              <span>{showDeepIntelligence ? 'Collapse Detailed Analysis' : 'Expand Detailed Analysis'}</span>
              {showDeepIntelligence ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {showDeepIntelligence && (
          <div className="space-y-8 animate-in fade-in slide-in-from-top-4 duration-300">
            <MultiModelConsensus
              regionSlug={regionData.slug}
              variable={variable}
              leadDay={day}
            />

            <EverydayDifferenceChart
              regionSlug={regionData.slug}
              variable={variable}
              selectedLeadDay={day}
              onSelectLeadDay={setDay}
            />

            <HorizonPredictabilityWall
              regionSlug={regionData.slug}
              variable={variable}
              selectedDay={day}
              onSelectDay={setDay}
            />

            <GroundTruthVerification
              regionSlug={regionData.slug}
              variable={variable}
            />

            <div className="grid grid-cols-1 gap-8">
              <SynopticIntelligence />
              <CycloneIntelligence />
            </div>

            <TelemetryStream />

            <WhatsAppIntegrationSection />
          </div>
        )}
      </section>

      {/* 3D Visualization Modal */}
      <Location3DModal
        isOpen={modal3dOpen}
        regionId={regionData.slug}
        day={day}
        variable={variable}
        onClose={() => setModal3dOpen(false)}
        onDayChange={setDay}
        onVariableChange={setVariable}
      />

      {/* PDF Report Generation Modal */}
      <ReportModal
        isOpen={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
        defaultRegion={regionData.slug}
        defaultDay={day}
        defaultVariable={variable}
      />
    </div>
  );
};
