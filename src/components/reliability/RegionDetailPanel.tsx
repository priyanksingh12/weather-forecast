'use client';

import React, { useState, useEffect } from 'react';
import { RegionReliabilityData, ExplainData, ChangeExplanationData, WeatherVariable } from '../../lib/api/types';
import { getReliability } from '../../lib/api/reliability';
import { getExplain, getChangeExplanation } from '../../lib/api/explain';
import { ReliabilityBandBadge } from './ReliabilityBandBadge';
import { ReliabilityHorizonChart } from './ReliabilityHorizonChart';
import { WhyPanel } from '../explain/WhyPanel';
import { ChangeExplanation } from '../explain/ChangeExplanation';
import { getBustColor } from '../../lib/utils/colors';
import { formatUtcShort } from '../../lib/utils/formatters';
import { 
  X, 
  MapPin, 
  TrendingUp, 
  HelpCircle, 
  Clock, 
  Database, 
  FileText,
  AlertTriangle,
  ArrowRight
} from 'lucide-react';
import Link from 'next/link';

interface Props {
  regionId: string;
  day: number;
  variable: WeatherVariable;
  onClose: () => void;
  onDayChange: (day: number) => void;
  onOpenReportModal: () => void;
}

export const RegionDetailPanel: React.FC<Props> = ({
  regionId,
  day,
  variable,
  onClose,
  onDayChange,
  onOpenReportModal
}) => {
  const [reliability, setReliability] = useState<RegionReliabilityData | null>(null);
  const [explain, setExplain] = useState<ExplainData | null>(null);
  const [change, setChange] = useState<ChangeExplanationData | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'why' | 'change'>('overview');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      getReliability(regionId, 'latest', variable),
      getExplain(regionId, 'latest', day, variable),
      getChangeExplanation(regionId, day, variable)
    ])
      .then(([relRes, expRes, chgRes]) => {
        setReliability(relRes.data);
        setExplain(expRes.data);
        setChange(chgRes.data);
      })
      .finally(() => setLoading(false));
  }, [regionId, day, variable]);

  if (!reliability) return null;

  const currentPoint = reliability.horizon.find((h) => h.lead_day === day) || reliability.horizon[0];
  const pBust = currentPoint.p_bust_cal;
  const trustScore = currentPoint.confidence_score;
  const bustColor = getBustColor(pBust);

  return (
    <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface)]/95 backdrop-blur-2xl p-5 sm:p-7 shadow-2xl space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--border)] pb-5">
        <div className="flex items-start gap-3">
          <div className="p-3 rounded-2xl bg-[var(--weather-blue)]/20 text-[var(--weather-blue)] border border-[var(--border)] shadow-md shrink-0">
            <MapPin className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-xl sm:text-2xl font-bold text-[var(--text-primary)] tracking-tight">
                {reliability.region_name}
              </h2>
              <ReliabilityBandBadge band={currentPoint.confidence_band} size="md" />
            </div>
            <p className="text-xs text-[var(--text-secondary)] mt-0.5">
              Day {day} ({day * 24}h Lead) · {variable.toUpperCase()} Prediction Trust
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 self-end sm:self-center">
          <button
            onClick={onOpenReportModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[var(--weather-blue)]/10 hover:bg-[var(--weather-blue)]/20 text-[var(--weather-blue)] border border-[var(--border)] text-xs font-semibold transition-all cursor-pointer"
          >
            <FileText className="h-3.5 w-3.5" />
            <span>Regional PDF</span>
          </button>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl border border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--muted-surface)] transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Primary Intelligence Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        {/* Metric 1: Bust Probability */}
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--muted-surface)] p-4 space-y-1">
          <span className="text-[10px] text-[var(--text-secondary)] uppercase tracking-wider font-semibold">Bust Probability</span>
          <div className="text-2xl font-mono font-bold" style={{ color: bustColor }}>
            {Math.round(pBust * 100)}%
          </div>
          <p className="text-[10px] text-[var(--text-secondary)]">Likelihood error exceeds tolerance</p>
        </div>

        {/* Metric 2: Reliability Score */}
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--muted-surface)] p-4 space-y-1">
          <span className="text-[10px] text-[var(--text-secondary)] uppercase tracking-wider font-semibold">Reliability Score</span>
          <div className="text-2xl font-mono font-bold text-[var(--text-primary)]">
            {trustScore}%
          </div>
          <p className="text-[10px] text-[var(--text-secondary)]">100 × (1 − Calibrated P)</p>
        </div>

        {/* Metric 3: Forecast Value */}
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--muted-surface)] p-4 space-y-1">
          <span className="text-[10px] text-[var(--text-secondary)] uppercase tracking-wider font-semibold">NWP Forecast</span>
          <div className="text-2xl font-mono font-bold text-[var(--weather-blue)]">
            {currentPoint.forecast_value} <span className="text-xs font-normal text-[var(--text-secondary)]">{reliability.unit}</span>
          </div>
          <p className="text-[10px] text-[var(--text-secondary)]">ECMWF IFS Deterministic</p>
        </div>

        {/* Metric 4: Expected Error Range */}
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--muted-surface)] p-4 space-y-1">
          <span className="text-[10px] text-[var(--text-secondary)] uppercase tracking-wider font-semibold">Expected Error</span>
          <div className="text-2xl font-mono font-bold text-[var(--risk-watch)]">
            ±{Math.abs(currentPoint.err_expected_range[1])} <span className="text-xs font-normal text-[var(--text-secondary)]">{reliability.unit}</span>
          </div>
          <p className="text-[10px] text-[var(--text-secondary)]">q90 quantile uncertainty</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[var(--border)] gap-2">
        <button
          onClick={() => setActiveTab('overview')}
          className={`pb-3 px-3 text-xs font-semibold transition-all border-b-2 ${
            activeTab === 'overview'
              ? 'border-[var(--weather-blue)] text-[var(--weather-blue)]'
              : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
          }`}
        >
          Reliability Horizon (Day 1–10)
        </button>
        <button
          onClick={() => setActiveTab('why')}
          className={`pb-3 px-3 text-xs font-semibold transition-all border-b-2 ${
            activeTab === 'why'
              ? 'border-[var(--weather-blue)] text-[var(--weather-blue)]'
              : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
          }`}
        >
          Why is this uncertain? (Explainability)
        </button>
        <button
          onClick={() => setActiveTab('change')}
          className={`pb-3 px-3 text-xs font-semibold transition-all border-b-2 ${
            activeTab === 'change'
              ? 'border-[var(--weather-blue)] text-[var(--weather-blue)]'
              : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
          }`}
        >
          What changed since last cycle?
        </button>
      </div>

      {/* Tab Panels */}
      {activeTab === 'overview' && (
        <ReliabilityHorizonChart
          horizon={reliability.horizon}
          selectedDay={day}
          onSelectDay={onDayChange}
          unit={reliability.unit}
        />
      )}

      {activeTab === 'why' && (
        <WhyPanel explainData={explain} loading={loading} />
      )}

      {activeTab === 'change' && (
        <ChangeExplanation data={change} />
      )}

      {/* Provenance Metadata Bar */}
      <div className="rounded-xl border border-[var(--border)] bg-[var(--muted-surface)] p-3 flex flex-wrap items-center justify-between gap-3 text-[11px] text-[var(--text-secondary)] font-mono">
        <div className="flex items-center gap-3">
          <span>Cycle: ECMWF IFS 00Z</span>
          <span>•</span>
          <span>Model: bust-rain-v1.3</span>
          <span>•</span>
          <span>Bust Def: bd-1</span>
        </div>
        <div className="flex items-center gap-2 text-[var(--safe-green)]">
          <span className="h-1.5 w-1.5 rounded-full bg-[var(--safe-green)]"></span>
          <span>Data Quality: OK</span>
        </div>
      </div>
    </div>
  );
};
