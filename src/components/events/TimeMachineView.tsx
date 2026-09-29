'use client';

import React, { useState, useEffect } from 'react';
import { TimeMachineReplayData, ReplayLeadStep } from '../../lib/api/types';
import { getTimeMachineReplay } from '../../lib/api/events';
import { NOTABLE_WEATHER_EVENTS } from '../../data/mock/historyData';
import { Clock, Play, Pause, RotateCcw, AlertTriangle, ShieldCheck, ChevronRight, Activity } from 'lucide-react';
import { ReliabilityBandBadge } from '../reliability/ReliabilityBandBadge';
import { getBustColor } from '../../lib/utils/colors';

export const TimeMachineView: React.FC = () => {
  const [selectedEventId, setSelectedEventId] = useState('cyclone-biparjoy-2023');
  const [replayData, setReplayData] = useState<TimeMachineReplayData | null>(null);
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    getTimeMachineReplay(selectedEventId).then((res) => {
      setReplayData(res.data);
      setActiveStepIndex(0); // Start at Day 10
      setIsPlaying(false);
    });
  }, [selectedEventId]);

  // Autoplay stepping timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying && replayData) {
      interval = setInterval(() => {
        setActiveStepIndex((prev) => {
          if (prev >= replayData.steps.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, 1600);
    }
    return () => clearInterval(interval);
  }, [isPlaying, replayData]);

  if (!replayData || !replayData.steps.length) return null;

  const currentStep: ReplayLeadStep = replayData.steps[activeStepIndex];
  const bustColor = getBustColor(currentStep.p_bust_cal);

  return (
    <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface)]/95 backdrop-blur-2xl p-6 sm:p-8 space-y-6 shadow-xl">
      {/* Header & Event Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--border)] pb-5">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-[var(--weather-blue)]/15 text-[var(--weather-blue)] border border-[var(--weather-blue)]/30 shadow-sm">
            <Clock className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-[var(--text-primary)] tracking-tight">Forecast Time Machine</h3>
            <p className="text-xs text-[var(--text-secondary)]">
              Auditing how NWP predictability and bust risk evolved from Day 10 to Day 1
            </p>
          </div>
        </div>

        {/* Event Dropdown */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider shrink-0">
            Historical Event:
          </label>
          <select
            value={selectedEventId}
            onChange={(e) => setSelectedEventId(e.target.value)}
            className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-xs text-[var(--text-primary)] focus:border-[var(--weather-blue)] focus:outline-none"
          >
            <option value="cyclone-biparjoy-2023" className="bg-[var(--surface)] text-[var(--text-primary)]">
              Cyclone Biparjoy Landfall (Gujarat 2023)
            </option>
            <option value="north-india-floods-july-2023" className="bg-[var(--surface)] text-[var(--text-primary)]">
              North India Cloudburst & Extreme Rain (Delhi 2023)
            </option>
          </select>
        </div>
      </div>

      {/* Timeline Stepper Controls */}
      <div className="p-4 rounded-2xl bg-[var(--muted-surface)] border border-[var(--border)] space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--weather-blue)] text-white font-bold text-xs hover:brightness-110 transition-all cursor-pointer shadow-sm"
            >
              {isPlaying ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
              <span>{isPlaying ? 'Pause' : 'Play Timeline'}</span>
            </button>
            <button
              onClick={() => {
                setIsPlaying(false);
                setActiveStepIndex(0);
              }}
              className="p-1.5 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
              title="Reset to Day 10"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-[var(--text-secondary)]">Current Lead Step:</span>
            <span className="font-mono text-[var(--weather-blue)] font-bold bg-[var(--weather-blue)]/15 px-2.5 py-0.5 rounded-md border border-[var(--weather-blue)]/30 text-xs">
              Day {currentStep.lead_day} ({currentStep.lead_day * 24}h prior)
            </span>
          </div>
        </div>

        {/* Stepper Buttons for all available steps */}
        <div className="grid grid-cols-5 sm:grid-cols-10 gap-1.5 pt-1">
          {replayData.steps.map((step, idx) => {
            const isActive = idx === activeStepIndex;
            return (
              <button
                key={step.lead_day}
                onClick={() => {
                  setIsPlaying(false);
                  setActiveStepIndex(idx);
                }}
                className={`py-2 px-1 rounded-xl text-center font-mono text-xs transition-all cursor-pointer border ${
                  isActive
                    ? 'border-[var(--weather-blue)] bg-[var(--weather-blue)]/20 text-[var(--weather-blue)] font-bold shadow-sm'
                    : 'border-[var(--border)] bg-[var(--surface)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--weather-blue)]/40'
                }`}
              >
                <div>D{step.lead_day}</div>
                <div className="text-[9px] text-[var(--text-secondary)] mt-0.5">
                  {Math.round(step.p_bust_cal * 100)}%
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Dynamic Replay Stage */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Dynamic Metric 1: Forecast Issued */}
        <div className="p-5 rounded-2xl border border-[var(--border)] bg-[var(--muted-surface)] space-y-1">
          <span className="text-[10px] text-[var(--text-secondary)] uppercase tracking-wider font-semibold">
            Forecast Issued at Day {currentStep.lead_day}
          </span>
          <div className="text-3xl font-mono font-bold text-[var(--weather-blue)]">
            {currentStep.forecast_value} <span className="text-sm font-normal text-[var(--text-secondary)]">{replayData.unit}</span>
          </div>
          <p className="text-[11px] text-[var(--text-secondary)]">Cycle: {currentStep.cycle_init_time_utc.split('T')[0]}</p>
        </div>

        {/* Metric 2: Fixed Ground Truth (Actual Observation) */}
        <div className="p-5 rounded-2xl border border-[var(--safe-green)]/30 bg-[var(--safe-green)]/10 space-y-1">
          <span className="text-[10px] text-[var(--safe-green)] uppercase tracking-wider font-semibold">
            Observed Ground Truth (Fixed)
          </span>
          <div className="text-3xl font-mono font-bold text-[var(--safe-green)]">
            {replayData.final_observation} <span className="text-sm font-normal text-[var(--text-secondary)]">{replayData.unit}</span>
          </div>
          <p className="text-[11px] text-[var(--text-secondary)]">Verified at valid event date</p>
        </div>

        {/* Metric 3: Error at this Lead */}
        <div className="p-5 rounded-2xl border border-[var(--border)] bg-[var(--muted-surface)] space-y-1">
          <span className="text-[10px] text-[var(--text-secondary)] uppercase tracking-wider font-semibold">
            Forecast Error at Day {currentStep.lead_day}
          </span>
          <div className={`text-3xl font-mono font-bold ${Math.abs(currentStep.error_at_lead) > 10 ? 'text-[var(--risk-extreme)]' : 'text-[var(--text-primary)]'}`}>
            {currentStep.error_at_lead > 0 ? `+${currentStep.error_at_lead}` : currentStep.error_at_lead}{' '}
            <span className="text-sm font-normal text-[var(--text-secondary)]">{replayData.unit}</span>
          </div>
          <p className="text-[11px] text-[var(--text-secondary)]">Forecast − Truth</p>
        </div>

        {/* Metric 4: Platform Bust Probability */}
        <div className="p-5 rounded-2xl border border-[var(--border)] bg-[var(--muted-surface)] space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-[var(--text-secondary)] uppercase tracking-wider font-semibold">
              Bust Probability
            </span>
            <ReliabilityBandBadge band={currentStep.band} size="sm" />
          </div>
          <div className="text-3xl font-mono font-bold" style={{ color: bustColor }}>
            {Math.round(currentStep.p_bust_cal * 100)}%
          </div>
          <p className="text-[11px] text-[var(--text-secondary)]">AI Trust Assessment</p>
        </div>
      </div>

      {/* Synoptic Explanation at this Lead */}
      <div className="p-4 rounded-2xl border border-[var(--weather-blue)]/30 bg-[var(--weather-blue)]/10 space-y-1.5">
        <div className="flex items-center gap-2 text-xs font-semibold text-[var(--weather-blue)]">
          <Activity className="h-4 w-4" />
          <span>Platform Meteorological Assessment at Day {currentStep.lead_day}:</span>
        </div>
        <p className="text-xs text-[var(--text-secondary)] leading-relaxed font-sans">
          {currentStep.top_risk_reason}
        </p>
      </div>
    </div>
  );
};
