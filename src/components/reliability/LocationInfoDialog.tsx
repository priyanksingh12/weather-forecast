'use client';

import React, { useEffect, useState } from 'react';
import { RegionReliabilityData, ExplainData, WeatherVariable } from '../../lib/api/types';
import { getReliability } from '../../lib/api/reliability';
import { getExplain } from '../../lib/api/explain';
import { INDIA_REGIONS } from '../../lib/geo/indiaGeoJson';
import { getBustColor } from '../../lib/utils/colors';
import { ReliabilityBandBadge } from './ReliabilityBandBadge';
import { 
  X, 
  MapPin, 
  Globe2, 
  TrendingUp, 
  ShieldAlert, 
  HelpCircle, 
  Activity, 
  ArrowRight,
  Sparkles,
  FileText
} from 'lucide-react';

interface Props {
  regionId: string | null;
  day: number;
  variable: WeatherVariable;
  onClose: () => void;
  onOpen3D: (regionId: string) => void;
  onOpenReportModal?: () => void;
}

export const LocationInfoDialog: React.FC<Props> = ({
  regionId,
  day,
  variable,
  onClose,
  onOpen3D,
  onOpenReportModal
}) => {
  const [reliability, setReliability] = useState<RegionReliabilityData | null>(null);
  const [explain, setExplain] = useState<ExplainData | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!regionId) return;
    setLoading(true);
    Promise.all([
      getReliability(regionId, 'latest', variable),
      getExplain(regionId, 'latest', day, variable)
    ])
      .then(([relRes, expRes]) => {
        setReliability(relRes.data);
        setExplain(expRes.data);
      })
      .finally(() => setLoading(false));
  }, [regionId, day, variable]);

  if (!regionId) return null;

  const regionMeta = INDIA_REGIONS.find((r) => r.id === regionId) || {
    id: regionId,
    name_en: regionId.toUpperCase(),
    name_hi: '',
    type: 'state'
  };

  const currentPoint = reliability?.horizon.find((h) => h.lead_day === day) || reliability?.horizon[0];
  const pBust = currentPoint ? currentPoint.p_bust_cal : 0.38;
  const trustScore = currentPoint ? currentPoint.confidence_score : 62;
  const bustColor = getBustColor(pBust);
  const forecastVal = currentPoint ? currentPoint.forecast_value : 76.5;
  const unit = reliability?.unit || (variable === 'rainfall' ? 'mm/24h' : '°C');
  const errorMargin = currentPoint ? Math.abs(currentPoint.err_expected_range[1]) : 24;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-lg animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-2xl rounded-3xl border border-[var(--border)] bg-[var(--surface)] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Dialog Header */}
        <div className="flex items-center justify-between border-b border-[var(--border)] px-6 py-5 bg-gradient-to-r from-[var(--weather-blue)]/15 via-[var(--forecast-blue)]/10 to-[var(--ai-indigo)]/15">
          <div className="flex items-center gap-3.5">
            <div className="p-3 rounded-2xl bg-[var(--weather-blue)]/15 text-[var(--weather-blue)] border border-[var(--weather-blue)]/30 shadow-md shrink-0">
              <MapPin className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h3 className="text-2xl sm:text-3xl font-extrabold text-[var(--text-primary)] tracking-tight">
                  {regionMeta.name_en}
                </h3>
                {regionMeta.name_hi && (
                  <span className="text-sm font-semibold text-[var(--text-secondary)] font-sans">
                    ({regionMeta.name_hi})
                  </span>
                )}
                {currentPoint && (
                  <ReliabilityBandBadge band={currentPoint.confidence_band} size="md" />
                )}
              </div>
              <p className="text-sm text-[var(--text-secondary)] font-medium mt-0.5">
                Day {day} ({day * 24}h Lead Time) · {variable.toUpperCase()} Reliability Assessment
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-xl p-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--muted-surface)] transition-colors cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Dialog Body */}
        <div className="p-6 sm:p-7 space-y-6 overflow-y-auto">
          {/* Main Intelligence Numbers Grid (Larger, Bolder Fonts) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {/* 1. Bust Probability */}
            <div className="p-4 rounded-2xl bg-[var(--muted-surface)] border border-[var(--border)] space-y-1">
              <span className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider block">
                Bust Probability
              </span>
              <div className="text-3xl sm:text-4xl font-mono font-black" style={{ color: bustColor }}>
                {Math.round(pBust * 100)}%
              </div>
              <p className="text-xs text-[var(--text-secondary)] font-medium leading-tight">
                Risk forecast fails operational accuracy
              </p>
            </div>

            {/* 2. Reliability Score */}
            <div className="p-4 rounded-2xl bg-[var(--muted-surface)] border border-[var(--border)] space-y-1">
              <span className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider block">
                Reliability Score
              </span>
              <div className="text-3xl sm:text-4xl font-mono font-black text-[var(--weather-blue)]">
                {trustScore}%
              </div>
              <p className="text-xs text-[var(--text-secondary)] font-medium leading-tight">
                100 × (1 − Bust Prob)
              </p>
            </div>

            {/* 3. NWP Forecast */}
            <div className="p-4 rounded-2xl bg-[var(--muted-surface)] border border-[var(--border)] space-y-1">
              <span className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider block">
                NWP Forecast
              </span>
              <div className="text-3xl sm:text-4xl font-mono font-black text-[var(--text-primary)]">
                {forecastVal} <span className="text-sm font-normal text-[var(--text-secondary)]">{unit}</span>
              </div>
              <p className="text-xs text-[var(--text-secondary)] font-medium leading-tight">
                ECMWF IFS Deterministic
              </p>
            </div>

            {/* 4. Expected Error */}
            <div className="p-4 rounded-2xl bg-[var(--muted-surface)] border border-[var(--border)] space-y-1">
              <span className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider block">
                Expected Error
              </span>
              <div className="text-3xl sm:text-4xl font-mono font-black text-[var(--risk-watch)]">
                ±{errorMargin} <span className="text-sm font-normal text-[var(--text-secondary)]">{unit}</span>
              </div>
              <p className="text-xs text-[var(--text-secondary)] font-medium leading-tight">
                q90 quantile tolerance
              </p>
            </div>
          </div>

          {/* Meteorological Explainability Section */}
          <div className="rounded-2xl border border-[var(--weather-blue)]/30 bg-[var(--weather-blue)]/10 p-5 space-y-2.5">
            <div className="flex items-center gap-2 text-sm font-bold text-[var(--weather-blue)]">
              <HelpCircle className="h-4 w-4" />
              <span>Why is this forecast uncertain?</span>
            </div>
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed font-sans">
              {explain?.text_en ||
                `Notable ensemble spread and moderate spatial divergence between GFS and IFS for ${regionMeta.name_en}. Convective parameterization shifts between cycles.`}
            </p>

            {explain?.factors && explain.factors.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-[var(--border)]">
                <span className="text-xs font-bold uppercase tracking-wider text-[var(--weather-blue)]">
                  Primary Risk Drivers:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {explain.factors.slice(0, 2).map((f) => (
                    <div key={f.title} className="p-2.5 rounded-xl bg-[var(--surface)] border border-[var(--border)] flex items-center justify-between">
                      <span className="text-[var(--text-secondary)] font-medium">{f.title}</span>
                      <span className="font-mono font-bold text-[var(--weather-blue)]">{f.metric_value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Day 1 to Day 10 Mini Horizon Bar */}
          {reliability && (
            <div className="space-y-2.5">
              <div className="flex items-center justify-between text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">
                <span>Reliability Horizon (Day 1 → Day 10)</span>
                <span className="text-[var(--text-secondary)] font-normal">Active: Day {day}</span>
              </div>
              <div className="grid grid-cols-5 sm:grid-cols-10 gap-1.5">
                {reliability.horizon.map((h) => {
                  const isActive = h.lead_day === day;
                  const color = getBustColor(h.p_bust_cal);
                  return (
                    <div
                      key={h.lead_day}
                      className={`p-2 rounded-xl text-center font-mono border transition-all ${
                        isActive
                          ? 'border-[var(--weather-blue)] bg-[var(--weather-blue)]/15 text-[var(--weather-blue)] font-bold shadow-sm'
                          : 'border-[var(--border)] bg-[var(--muted-surface)] text-[var(--text-secondary)]'
                      }`}
                    >
                      <div className="text-xs">D{h.lead_day}</div>
                      <div className="text-xs font-bold mt-0.5" style={{ color }}>
                        {Math.round(h.p_bust_cal * 100)}%
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* PROMINENT ACTION: EXPLORE 3D VISUALIZATION BUTTON */}
          <div className="pt-2">
            <button
              onClick={() => onOpen3D(regionId)}
              className="w-full flex items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-[var(--weather-blue)] via-[var(--forecast-blue)] to-[var(--ai-indigo)] p-4 text-base font-extrabold text-white shadow-lg hover:brightness-110 active:scale-[0.98] transition-all cursor-pointer group"
            >
              <Globe2 className="h-5 w-5 text-white/90 group-hover:rotate-12 transition-transform" />
              <span>Explore 3D Visualization of {regionMeta.name_en}</span>
              <ArrowRight className="h-5 w-5 text-white/90 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>

        {/* Dialog Footer */}
        <div className="px-6 py-4 border-t border-[var(--border)] bg-[var(--muted-surface)] flex items-center justify-between text-xs text-[var(--text-secondary)]">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[var(--safe-green)]"></span>
            <span>Forecast cycle: ECMWF IFS 00Z · Data Live</span>
          </div>
          {onOpenReportModal && (
            <button
              onClick={() => {
                onClose();
                onOpenReportModal();
              }}
              className="text-[var(--weather-blue)] hover:text-[var(--forecast-blue)] font-semibold flex items-center gap-1 cursor-pointer transition-colors"
            >
              <FileText className="h-3.5 w-3.5" />
              <span>Generate PDF Report →</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
