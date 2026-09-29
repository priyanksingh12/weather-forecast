'use client';

import dynamic from 'next/dynamic';
import React, { useState, useEffect } from 'react';

const GlobeView = dynamic(() => import('../../components/map/GlobeView').then((m) => m.GlobeView), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[680px] rounded-3xl border border-[var(--border)] bg-[var(--surface)] flex flex-col items-center justify-center p-6 space-y-3 animate-pulse">
      <div className="h-8 w-8 rounded-full border-2 border-[var(--weather-blue)] border-t-transparent animate-spin"></div>
      <span className="text-xs text-[var(--text-secondary)] font-mono">Initializing MapLibre GL 3D Earth Globe...</span>
    </div>
  )
});
import { RegionDetailPanel } from '../../components/reliability/RegionDetailPanel';
import { ReportModal } from '../../components/reports/ReportModal';
import { getBustMap } from '../../lib/api/reliability';
import { BustMapGeoJSON, WeatherVariable } from '../../lib/api/types';
import { Globe2, ArrowLeft, Sliders, ShieldAlert } from 'lucide-react';
import Link from 'next/link';

export default function GlobePage() {
  const [variable, setVariable] = useState<WeatherVariable>('rainfall');
  const [day, setDay] = useState(7);
  const [mapData, setMapData] = useState<BustMapGeoJSON | null>(null);
  const [selectedRegionId, setSelectedRegionId] = useState<string | null>(null);
  const [reportModalOpen, setReportModalOpen] = useState(false);

  useEffect(() => {
    getBustMap('latest', day, variable).then((res) => {
      setMapData(res.data);
    });
  }, [variable, day]);

  return (
    <div className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Header & Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--border)] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Link
              href="/"
              className="flex items-center gap-1 text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>National View</span>
            </Link>
            <span className="text-[var(--text-secondary)]">/</span>
            <span className="text-xs font-mono text-[var(--weather-blue)]">3D Interactive Projection</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)] tracking-tight mt-1 flex items-center gap-2.5">
            <Globe2 className="h-6 w-6 text-[var(--weather-blue)]" />
            <span>3D Earth Atmosphere Globe</span>
          </h1>
        </div>

        {/* Lead Selector Pill */}
        <div className="flex items-center gap-2 bg-[var(--surface)] p-1.5 rounded-2xl border border-[var(--border)] self-start sm:self-auto text-xs">
          <span className="text-[var(--text-secondary)] pl-2">Lead Day:</span>
          {[1, 3, 5, 7, 10].map((d) => (
            <button
              key={d}
              onClick={() => setDay(d)}
              className={`px-2.5 py-1 rounded-lg font-mono font-medium transition-all ${
                day === d
                  ? 'bg-[var(--weather-blue)] text-white font-bold shadow-md'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              Day {d}
            </button>
          ))}
        </div>
      </div>

      {/* 3D Globe Visualizer */}
      <section>
        <GlobeView
          mapData={mapData}
          selectedRegionId={selectedRegionId}
          onSelectRegion={(regId) => setSelectedRegionId(regId)}
          variable={variable}
          onVariableChange={setVariable}
          day={day}
        />
      </section>

      {/* Region Panel on state selection */}
      {selectedRegionId && (
        <section className="animate-in fade-in slide-in-from-bottom-4 duration-300">
          <RegionDetailPanel
            regionId={selectedRegionId}
            day={day}
            variable={variable}
            onClose={() => setSelectedRegionId(null)}
            onDayChange={setDay}
            onOpenReportModal={() => setReportModalOpen(true)}
          />
        </section>
      )}

      {/* Report Modal */}
      <ReportModal
        isOpen={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
        defaultRegion={selectedRegionId || 'uttar-pradesh'}
        defaultDay={day}
        defaultVariable={variable}
      />
    </div>
  );
}
