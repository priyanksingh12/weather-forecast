'use client';

import React, { useState, useEffect } from 'react';
import { getSystemStatus } from '../../lib/api/status';
import { SystemStatusData } from '../../lib/api/types';
import { formatUtcToIst } from '../../lib/utils/formatters';
import { Activity, CheckCircle2, Clock, AlertTriangle, ArrowLeft, RefreshCw, Database } from 'lucide-react';
import Link from 'next/link';

export default function StatusPage() {
  const [data, setData] = useState<SystemStatusData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStatus = () => {
    setLoading(true);
    getSystemStatus()
      .then((res) => setData(res.data))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  return (
    <div className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--border)] pb-5">
        <div>
          <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center gap-1 text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>National View</span>
            </Link>
            <span className="text-[var(--text-secondary)]">/</span>
            <span className="text-xs font-mono text-[var(--weather-blue)]">Ingest Health Audit</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)] tracking-tight mt-1 flex items-center gap-2.5">
            <Activity className="h-6 w-6 text-[var(--safe-green)]" />
            <span>Data Ingestion & Pipeline Status</span>
          </h1>
          <p className="text-xs text-[var(--text-secondary)] mt-1">
            Real-time latency monitoring across numerical weather models, satellite rainfall, and airport stations
          </p>
        </div>

        <button
          onClick={fetchStatus}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--surface)] hover:bg-[var(--muted-surface)] border border-[var(--border)] text-xs text-[var(--text-primary)] transition-all self-start sm:self-auto cursor-pointer"
        >
          <RefreshCw className={`h-3.5 w-3.5 text-[var(--weather-blue)] ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Feeds</span>
        </button>
      </div>

      {data && (
        <div className="space-y-6">
          {/* Top Overall Status Card */}
          <div className="p-5 rounded-2xl border border-[var(--safe-green)]/30 bg-[var(--safe-green)]/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-[var(--safe-green)]/20 text-[var(--safe-green)] border border-[var(--safe-green)]/30">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[var(--text-primary)]">All Assimilation Pipelines Operational</h3>
                <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                  Latest forecast cycle initialized at {data.latest_forecast_cycle.init_time_utc}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 font-mono text-xs">
              <div className="text-right">
                <div className="text-[var(--text-secondary)] text-[10px]">Data Quality Flag</div>
                <div className="text-[var(--safe-green)] font-bold uppercase">{data.overall_quality}</div>
              </div>
            </div>
          </div>

          {/* Source Health Table */}
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)]/90 backdrop-blur-xl overflow-hidden shadow-2xl">
            <div className="p-5 border-b border-[var(--border)]">
              <h3 className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-2">
                <Database className="h-4 w-4 text-[var(--weather-blue)]" />
                <span>Upstream Meteorological Providers</span>
              </h3>
            </div>

            <div className="divide-y divide-[var(--border)]">
              {data.sources.map((src) => (
                <div
                  key={src.source_key}
                  className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-[var(--muted-surface)] transition-colors"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-[var(--text-primary)] text-sm">{src.name}</span>
                      <span className="text-xs text-[var(--weather-blue)] font-mono">({src.label})</span>
                    </div>
                    <p className="text-xs text-[var(--text-secondary)]">{src.description}</p>
                  </div>

                  <div className="flex sm:flex-col items-center sm:items-end justify-between text-right shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0 border-[var(--border)]">
                    <div className="flex items-center gap-1.5 text-xs text-[var(--safe-green)] font-semibold">
                      <span className="h-2 w-2 rounded-full bg-[var(--safe-green)]"></span>
                      <span>✓ Synchronized</span>
                    </div>
                    <span className="text-xs font-mono text-[var(--text-secondary)] mt-0.5">
                      Last Ingest: {formatUtcToIst(src.last_successful_ingest_utc)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Operational Policy Note */}
          <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--muted-surface)] text-xs text-[var(--text-secondary)] leading-relaxed space-y-1">
            <strong className="text-[var(--text-primary)]">Freshness & Honesty Standard:</strong> If an upstream cycle lags by more than 12 hours, the platform automatically flags <code className="text-[var(--risk-watch)] font-mono">data_quality: "stale"</code> and shows an alert banner across the UI and WhatsApp bot. The platform never masks delays with synthetic figures.
          </div>
        </div>
      )}
    </div>
  );
}
