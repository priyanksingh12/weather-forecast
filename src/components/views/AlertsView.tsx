'use client';

import React from 'react';
import { 
  Bell, 
  ShieldAlert, 
  AlertTriangle, 
  Radio, 
  Waves, 
  CloudLightning 
} from 'lucide-react';
import { CycloneIntelligence } from '../dashboard/CycloneIntelligence';
import { SynopticIntelligence } from '../dashboard/SynopticIntelligence';
import { TelemetryStream } from '../dashboard/TelemetryStream';
import { WhatsAppIntegrationSection } from '../whatsapp/WhatsAppIntegrationSection';
import { LocationQuickPicker } from '../common/LocationQuickPicker';
import { RegionalData } from '../../lib/data/regionalIntelligence';

interface AlertsViewProps {
  currentRegion: RegionalData;
  onSelectRegion: (slug: string) => void;
}

export const AlertsView: React.FC<AlertsViewProps> = ({
  currentRegion,
  onSelectRegion
}) => {
  return (
    <div className="w-full max-w-[1600px] mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
      {/* View Header - Stacked Pattern */}
      <div className="flex flex-col gap-5 p-6 sm:p-8 rounded-3xl bg-[var(--surface)] border border-[var(--border)] shadow-xs">
        {/* Top Section: Title, Badges, and Description */}
        <div className="flex items-start gap-4">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-[var(--risk-extreme)]/15 text-[var(--risk-extreme)] shadow-xs mt-0.5">
            <Bell className="h-8 w-8" />
          </div>
          <div className="space-y-2 flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-black tracking-tight text-[var(--text-primary)]">
                Emergency Tactical Alerts & Severe Weather Systems
              </h1>
              <span className="px-4 py-1.5 rounded-full text-xs sm:text-sm font-bold bg-[var(--risk-extreme)] text-white shadow-xs animate-pulse">
                3 Active Threats
              </span>
            </div>
            <p className="text-base sm:text-lg text-[var(--text-secondary)] leading-relaxed">
              Live IMD cyclone advisories, Himalayan freezing altitude cloudburst models, and marine buoy feeds for <strong className="text-[var(--text-primary)] font-bold">{currentRegion.name}</strong>
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

      {/* WhatsApp 1-Click Alert & Tactical Intelligence Integration (First Priority) */}
      <WhatsAppIntegrationSection />

      {/* Tropical Cyclone Intelligence */}
      <CycloneIntelligence />

      {/* Western Disturbances & Monsoon Depressions Intelligence */}
      <SynopticIntelligence />

      {/* In-Situ Oceanic Marine Buoys & Mountain Radiosondes */}
      <TelemetryStream />
    </div>
  );
};
