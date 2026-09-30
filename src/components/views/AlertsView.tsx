'use client';

import React from 'react';
import { 
  Bell, 
  ShieldAlert, 
  AlertTriangle, 
  Radio, 
  Waves, 
  CloudLightning,
  Compass,
  Mountain,
  Flame,
  Wind,
  CloudRain,
  MapPin,
  Clock,
  Send,
  CheckCircle2,
  Info
} from 'lucide-react';
import { CycloneIntelligence } from '../dashboard/CycloneIntelligence';
import { SynopticIntelligence } from '../dashboard/SynopticIntelligence';
import { TelemetryStream } from '../dashboard/TelemetryStream';
import { WhatsAppIntegrationSection } from '../whatsapp/WhatsAppIntegrationSection';
import { LocationQuickPicker } from '../common/LocationQuickPicker';
import { RegionalData } from '../../lib/data/regionalIntelligence';
import { getRegionalAlerts, TacticalAlert, AlertSeverity } from '../../lib/data/alertIntelligence';

interface AlertsViewProps {
  currentRegion: RegionalData;
  onSelectRegion: (slug: string) => void;
}

export const AlertsView: React.FC<AlertsViewProps> = ({
  currentRegion,
  onSelectRegion
}) => {
  const alerts = getRegionalAlerts(currentRegion);
  const highestSeverity: AlertSeverity = alerts.some((a) => a.severity === 'extreme')
    ? 'extreme'
    : alerts.some((a) => a.severity === 'high')
    ? 'high'
    : alerts.some((a) => a.severity === 'moderate')
    ? 'moderate'
    : 'advisory';

  const severityBadgeClass = {
    extreme: 'bg-[var(--risk-extreme)] text-white shadow-lg shadow-rose-500/20',
    high: 'bg-[var(--risk-high)] text-white shadow-lg shadow-amber-500/20',
    moderate: 'bg-amber-500 text-slate-900 shadow-md',
    advisory: 'bg-[var(--weather-blue)] text-white shadow-sm'
  }[highestSeverity];

  const getCategoryIcon = (category: TacticalAlert['category']) => {
    switch (category) {
      case 'Cyclone': return <Compass className="h-5 w-5 animate-spin" style={{ animationDuration: '10s' }} />;
      case 'Western Disturbance': return <Mountain className="h-5 w-5" />;
      case 'Cloudburst': return <CloudRain className="h-5 w-5" />;
      case 'Marine': return <Waves className="h-5 w-5" />;
      case 'Heatwave': return <Flame className="h-5 w-5" />;
      case 'Squall': return <Wind className="h-5 w-5" />;
      case 'Flash Flood': return <CloudLightning className="h-5 w-5" />;
      default: return <ShieldAlert className="h-5 w-5" />;
    }
  };

  const getSeverityBorder = (sev: AlertSeverity) => {
    switch (sev) {
      case 'extreme': return 'border-rose-500/40 bg-rose-500/5 hover:border-rose-500/70';
      case 'high': return 'border-orange-500/40 bg-orange-500/5 hover:border-orange-500/70';
      case 'moderate': return 'border-amber-500/40 bg-amber-500/5 hover:border-amber-500/70';
      case 'advisory': return 'border-sky-500/30 bg-sky-500/5 hover:border-sky-500/60';
    }
  };

  const getSeverityBadge = (sev: AlertSeverity) => {
    switch (sev) {
      case 'extreme': return 'bg-rose-500/15 text-rose-500 border border-rose-500/30';
      case 'high': return 'bg-orange-500/15 text-orange-500 border border-orange-500/30';
      case 'moderate': return 'bg-amber-500/15 text-amber-500 border border-amber-500/30';
      case 'advisory': return 'bg-sky-500/15 text-sky-500 border border-sky-500/30';
    }
  };

  const isCoastal = ['Maharashtra', 'Gujarat', 'Goa', 'Karnataka', 'Kerala', 'Tamil Nadu', 'Andhra Pradesh', 'Odisha', 'West Bengal']
    .some((k) => currentRegion.state.toLowerCase().includes(k.toLowerCase()) || currentRegion.name.toLowerCase().includes(k.toLowerCase()));

  return (
    <div className="w-full max-w-[1600px] mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
      {/* 1. View Header - Dynamic Threat Count */}
      <div className="flex flex-col gap-5 p-6 sm:p-8 rounded-3xl bg-[var(--surface)] border border-[var(--border)] shadow-xs">
        <div className="flex items-start gap-4">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-[var(--weather-blue)]/15 text-[var(--weather-blue)] shadow-xs mt-0.5">
            <Bell className="h-8 w-8" />
          </div>
          <div className="space-y-2 flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-black tracking-tight text-[var(--text-primary)]">
                Emergency Tactical Alerts & Severe Weather
              </h1>
              <span className={`px-4 py-1.5 rounded-full text-xs sm:text-sm font-extrabold uppercase tracking-wider animate-pulse flex items-center gap-1.5 ${severityBadgeClass}`}>
                <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                <span>{alerts.length} Active Threat{alerts.length === 1 ? '' : 's'}</span>
              </span>
            </div>
            <p className="text-base sm:text-lg text-[var(--text-secondary)] leading-relaxed">
              Real-time IMD advisories, cloudburst radar telemetry, and tactical response matrix tailored specifically for{' '}
              <strong className="text-[var(--text-primary)] font-bold">{currentRegion.name} ({currentRegion.state})</strong>
            </p>
          </div>
        </div>

        {/* Filter Section Underneath: Location Switcher */}
        <div className="pt-4 border-t border-[var(--border)]/70 w-full">
          <LocationQuickPicker
            currentRegion={currentRegion}
            onSelectRegion={onSelectRegion}
            label="Regions:"
          />
        </div>
      </div>

      {/* 2. WhatsApp 1-Click Alert & Tactical Intelligence Integration (Top Priority) */}
      <WhatsAppIntegrationSection />

      {/* 3. State Tactical Threat Board (Dynamic Per State) */}
      <div className="flex flex-col gap-5 p-6 sm:p-8 rounded-3xl bg-[var(--surface)] border border-[var(--border)] shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--border)] pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <ShieldAlert className="h-5 w-5 text-[var(--weather-blue)]" />
              <h2 className="text-xl sm:text-2xl font-black text-[var(--text-primary)] tracking-tight">
                Active Tactical Threat Matrix · {currentRegion.name}
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)]">
              Dynamic multi-hazard meteorological alerts evaluated against local topography, moisture convergence, and NWP spread
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto text-xs font-mono text-[var(--text-secondary)] bg-[var(--muted-surface)] px-3 py-1.5 rounded-xl border border-[var(--border)]">
            <Clock className="h-3.5 w-3.5 text-[var(--weather-blue)]" />
            <span>Updated live for {currentRegion.name}</span>
          </div>
        </div>

        {/* Grid of State-Specific Alert Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className={`rounded-2xl border p-5 transition-all flex flex-col justify-between space-y-4 shadow-xs ${getSeverityBorder(alert.severity)}`}
            >
              <div className="space-y-3">
                {/* Top Badge Row */}
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-2">
                    <span className="p-2 rounded-xl bg-[var(--surface)] border border-[var(--border)] text-[var(--text-primary)]">
                      {getCategoryIcon(alert.category)}
                    </span>
                    <span className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--text-secondary)]">
                      {alert.category}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-black uppercase tracking-wider ${getSeverityBadge(alert.severity)}`}>
                      {alert.severity} Risk
                    </span>
                    <span className="text-[11px] font-mono text-[var(--text-secondary)] bg-[var(--surface)] px-2 py-0.5 rounded border border-[var(--border)]">
                      {alert.source}
                    </span>
                  </div>
                </div>

                {/* Title & Description */}
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-[var(--text-primary)] tracking-tight leading-snug">
                    {alert.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-1.5 leading-relaxed">
                    {alert.description}
                  </p>
                </div>

                {/* Trigger Condition Pill */}
                <div className="rounded-xl bg-[var(--surface)] border border-[var(--border)] p-2.5 text-xs font-mono space-y-1">
                  <div className="text-[11px] text-[var(--text-secondary)] font-semibold uppercase tracking-wider">
                    Diagnostic Telemetry Trigger:
                  </div>
                  <div className="text-[var(--text-primary)] font-bold">
                    {alert.triggerCondition}
                  </div>
                </div>

                {/* Affected Zones */}
                <div className="flex items-center gap-1.5 flex-wrap text-xs text-[var(--text-secondary)]">
                  <MapPin className="h-3.5 w-3.5 text-[var(--weather-blue)] shrink-0" />
                  <span className="font-semibold text-[var(--text-primary)]">Zones:</span>
                  {alert.affectedDistricts.map((d, idx) => (
                    <span key={idx} className="bg-[var(--surface)] px-2 py-0.5 rounded-md border border-[var(--border)] font-mono text-[11px]">
                      {d}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action Protocol Footer */}
              <div className="pt-3 border-t border-[var(--border)]/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="space-y-0.5 flex-1">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--text-secondary)] font-bold block">
                    Tactical Protocol:
                  </span>
                  <span className="text-[var(--text-primary)] font-medium leading-snug">
                    {alert.recommendedAction}
                  </span>
                </div>

                <a
                  href={`https://wa.me/?text=${encodeURIComponent(`[CloudSense Alert: ${alert.title}] Location: ${currentRegion.name}, ${currentRegion.state}. Status: ${alert.severity.toUpperCase()} RISK. Trigger: ${alert.triggerCondition}. Action: ${alert.recommendedAction}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="shrink-0 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600/15 hover:bg-emerald-600 text-emerald-400 hover:text-white border border-emerald-500/30 text-xs font-bold transition-all cursor-pointer"
                  title="Forward this specific alert to WhatsApp"
                >
                  <Send className="h-3 w-3" />
                  <span>Dispatch</span>
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Meteorological Intelligence Deep Dives (Ranked by Regional Relevance) */}
      {isCoastal ? (
        <>
          <CycloneIntelligence />
          <SynopticIntelligence />
        </>
      ) : (
        <>
          <SynopticIntelligence />
          <CycloneIntelligence />
        </>
      )}

      {/* 5. In-Situ Oceanic Marine Buoys & Mountain Radiosondes */}
      <TelemetryStream />
    </div>
  );
};
