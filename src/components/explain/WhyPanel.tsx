'use client';

import React, { useState } from 'react';
import { ExplainData } from '../../lib/api/types';
import { HelpCircle, AlertCircle, ArrowUpRight, CheckCircle2, ShieldAlert } from 'lucide-react';

interface Props {
  explainData: ExplainData | null;
  loading?: boolean;
}

export const WhyPanel: React.FC<Props> = ({ explainData, loading = false }) => {
  if (loading) {
    return (
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)]/90 backdrop-blur-xl p-6 animate-pulse space-y-4">
        <div className="h-5 w-48 bg-[var(--muted-surface)] rounded"></div>
        <div className="h-16 w-full bg-[var(--muted-surface)] rounded-xl"></div>
        <div className="space-y-2">
          <div className="h-12 w-full bg-[var(--muted-surface)] rounded-lg"></div>
          <div className="h-12 w-full bg-[var(--muted-surface)] rounded-lg"></div>
          <div className="h-12 w-full bg-[var(--muted-surface)] rounded-lg"></div>
        </div>
      </div>
    );
  }

  if (!explainData) return null;

  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)]/90 backdrop-blur-xl p-5 sm:p-6 space-y-5 shadow-2xl">
      {/* Title */}
      <div className="flex items-center gap-2.5 border-b border-[var(--border)] pb-3">
        <div className="p-2 rounded-xl bg-[var(--weather-blue)]/15 text-[var(--weather-blue)] border border-[var(--weather-blue)]/30">
          <HelpCircle className="h-5 w-5" />
        </div>
        <div>
          <h3 className="text-base font-bold text-[var(--text-primary)]">Why is this forecast uncertain?</h3>
          <p className="text-xs text-[var(--text-secondary)]">
            SHAP feature attribution & multi-model atmospheric spread
          </p>
        </div>
      </div>

      {/* Verified AI Summary Text */}
      <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--weather-blue)]/10 text-xs text-[var(--text-primary)] leading-relaxed font-sans">
        <p className="font-medium">
          {explainData.text_en}
        </p>
      </div>

      {/* Top 3 Factors with Concrete Numbers */}
      <div className="space-y-3">
        <h4 className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
          Top Uncertainty Drivers (Feature Attribution)
        </h4>

        <div className="grid grid-cols-1 gap-3">
          {explainData.factors.map((factor, index) => (
            <div
              key={factor.title}
              className="p-4 rounded-xl border border-[var(--border)] bg-[var(--muted-surface)] hover:border-[var(--weather-blue)]/50 transition-all space-y-2 group"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-[var(--weather-blue)]/15 border border-[var(--weather-blue)]/30 text-[var(--weather-blue)] text-xs font-mono font-bold">
                    0{index + 1}
                  </span>
                  <span className="font-semibold text-sm text-[var(--text-primary)] group-hover:text-[var(--weather-blue)] transition-colors">
                    {factor.title}
                  </span>
                </div>

                <div className="text-right shrink-0">
                  <span className="font-mono text-xs font-bold text-[var(--weather-blue)] bg-[var(--weather-blue)]/10 px-2 py-0.5 rounded border border-[var(--weather-blue)]/30">
                    {factor.metric_value}
                  </span>
                </div>
              </div>

              <p className="text-xs text-[var(--text-secondary)] leading-relaxed pl-8">
                {factor.description}
              </p>

              {/* Multi-model evidence snapshot if present */}
              {factor.evidence_data && (
                <div className="ml-8 mt-2 p-2 rounded-lg bg-[var(--surface)] border border-[var(--border)] flex items-center justify-between text-[11px] font-mono">
                  <div className="text-[var(--text-secondary)]">
                    {factor.evidence_data.model_a.name}:{' '}
                    <span className="text-[var(--text-primary)] font-semibold">{factor.evidence_data.model_a.val} mm</span>
                  </div>
                  <div className="text-[var(--text-secondary)]">vs</div>
                  <div className="text-[var(--text-secondary)]">
                    {factor.evidence_data.model_b.name}:{' '}
                    <span className="text-[var(--risk-extreme)] font-semibold">{factor.evidence_data.model_b.val} mm</span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Trust Guidance Footer */}
      <div className="rounded-xl border border-[var(--risk-watch)]/30 bg-[var(--risk-watch)]/10 p-3.5 flex items-start gap-3">
        <ShieldAlert className="h-4 w-4 text-[var(--risk-watch)] shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <span className="text-xs font-semibold text-[var(--risk-watch)]">Operational Guidance:</span>
          <p className="text-xs text-[var(--text-secondary)]">{explainData.trust_guidance}</p>
        </div>
      </div>
    </div>
  );
};
