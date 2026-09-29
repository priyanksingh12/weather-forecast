import React from 'react';
import { BustMapGeoJSON, WeatherVariable } from '../../lib/api/types';
import { ChevronRight, Flame } from 'lucide-react';
import { formatPercent } from '../../lib/utils/formatters';

interface Props {
  mapData: BustMapGeoJSON | null;
  onSelectRegion: (regionId: string) => void;
  variable: WeatherVariable;
  day: number;
}

export const HotspotsPanel: React.FC<Props> = ({ mapData, onSelectRegion, variable, day }) => {
  if (!mapData || !mapData.features.length) return null;

  // Sort regions by calibrated bust probability descending
  const sorted = [...mapData.features].sort(
    (a, b) => b.properties.p_bust_cal - a.properties.p_bust_cal
  );

  const topHotspots = sorted.slice(0, 4);

  return (
    <div className="rounded-3xl border border-[var(--risk-extreme)]/30 bg-[var(--surface)]/95 backdrop-blur-2xl p-5 shadow-xl space-y-3.5">
      <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
        <div className="flex items-center gap-2.5 text-sm sm:text-base font-extrabold text-[var(--risk-extreme)]">
          <Flame className="h-5 w-5 text-[var(--risk-extreme)] animate-pulse" />
          <span className="uppercase tracking-wider">Reliability Hotspots</span>
        </div>
        <span className="text-xs font-mono font-bold text-[var(--risk-extreme)] bg-[var(--risk-extreme)]/20 px-2.5 py-1 rounded-lg border border-[var(--risk-extreme)]/30">
          Highest Risk
        </span>
      </div>

      <div className="space-y-2.5">
        {topHotspots.map((feature, idx) => {
          const p = feature.properties;
          return (
            <button
              key={p.region_id}
              onClick={() => onSelectRegion(p.region_id)}
              className="w-full text-left p-3 rounded-2xl border border-[var(--border)] bg-[var(--muted-surface)] hover:border-[var(--risk-extreme)]/50 hover:bg-[var(--risk-extreme)]/10 transition-all group flex items-center justify-between cursor-pointer"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2.5">
                  <span className="text-xs font-mono font-bold text-[var(--text-secondary)]">0{idx + 1}</span>
                  <span className="text-sm sm:text-base font-bold text-[var(--text-primary)] group-hover:text-[var(--risk-extreme)] transition-colors">
                    {p.region_name}
                  </span>
                </div>
                <p className="text-xs text-[var(--text-secondary)] line-clamp-1 max-w-[210px]">
                  {p.primary_driver}
                </p>
              </div>

              <div className="text-right shrink-0 flex items-center gap-2">
                <div>
                  <div className="text-base sm:text-lg font-black font-mono text-[var(--risk-extreme)]">
                    {formatPercent(p.p_bust_cal)}
                  </div>
                  <div className="text-[10px] text-[var(--text-secondary)] font-bold uppercase tracking-wider">Bust Risk</div>
                </div>
                <ChevronRight className="h-4 w-4 text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] transition-colors" />
              </div>
            </button>
          );
        })}
      </div>

      <p className="text-xs text-[var(--text-secondary)] pt-1.5 border-t border-[var(--border)] leading-relaxed font-medium">
        Click any hotspot above or on the map to open the information dialog and explore 3D visualizations.
      </p>
    </div>
  );
};
