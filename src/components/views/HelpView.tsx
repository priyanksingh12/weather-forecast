'use client';

import React from 'react';
import { 
  HelpCircle, 
  ExternalLink, 
  FileCode, 
  BookOpen, 
  ShieldCheck, 
  Terminal, 
  CheckCircle2 
} from 'lucide-react';

export const HelpView: React.FC = () => {
  const ENDPOINTS = [
    { method: 'GET', path: '/health', desc: 'System health, DB & Redis diagnostics' },
    { method: 'GET', path: '/status', desc: 'ECMWF & GFS ingestion latency and active cycle' },
    { method: 'GET', path: '/regions', desc: '56 Indian regions and geographic centroids' },
    { method: 'GET', path: '/forecast', desc: 'Day 1–10 numerical weather prediction series' },
    { method: 'GET', path: '/reliability', desc: 'Calibrated bust probabilities & confidence bands' },
    { method: 'GET', path: '/consensus', desc: 'ECMWF IFS 0.25° vs NOAA GFS 0.25° divergence' },
    { method: 'GET', path: '/horizon', desc: '10-day predictability decay & bust wall' },
    { method: 'GET', path: '/cyclone', desc: 'Tropical cyclone track & rapid intensification risk' },
    { method: 'GET', path: '/synoptic', desc: 'Himalayan freezing level & monsoon deluge multipliers' },
    { method: 'GET', path: '/weather/live', desc: 'OpenWeather real-time ground truth observation' },
    { method: 'GET', path: '/weather/air-quality', desc: 'Real-time European standard AQI & 6 pollutants' },
    { method: 'GET', path: '/weather/tiles', desc: 'Signed OpenWeather radar and heatmap tiles' },
    { method: 'POST', path: '/reports', desc: 'Enqueue asynchronous PDF briefing generation' },
    { method: 'POST', path: '/subscriptions', desc: '1-click WhatsApp opt-in URL generator' },
  ];

  return (
    <div className="w-full max-w-[1400px] mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
      {/* View Header - Stacked Pattern */}
      <div className="flex flex-col gap-5 p-6 sm:p-8 rounded-3xl bg-[var(--surface)] border border-[var(--border)] shadow-xs">
        {/* Top Section: Title & Subtitle */}
        <div className="flex items-start gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[var(--weather-blue)]/15 text-[var(--weather-blue)] shadow-xs mt-0.5">
            <HelpCircle className="h-7 w-7" />
          </div>
          <div className="space-y-1.5 flex-1 min-w-0">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-[var(--text-primary)]">
              Developer Handbook & API Documentation
            </h1>
            <p className="text-sm sm:text-base text-[var(--text-secondary)] leading-relaxed">
              SIH 2026 Forecast Reliability Intelligence Platform integration manual, live backend schemas, and OpenAPI specs
            </p>
          </div>
        </div>

        {/* Action Row Underneath */}
        <div className="pt-4 border-t border-[var(--border)]/70 flex flex-wrap items-center justify-between gap-3 w-full">
          <a
            href="https://sih-2-o.onrender.com/api/v1/docs"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[var(--weather-blue)] text-white text-xs sm:text-sm font-bold shadow-md hover:brightness-110 active:scale-98 transition-all cursor-pointer"
          >
            <span>Open Interactive Swagger Docs</span>
            <ExternalLink className="h-4 w-4" />
          </a>

          <span className="text-xs font-mono text-[var(--text-secondary)]">
            Production Endpoint: <strong className="text-[var(--weather-blue)]">https://sih-2-o.onrender.com/api/v1</strong>
          </span>
        </div>
      </div>

      {/* Grid: Data Envelope Standard & Security */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6 space-y-3">
          <div className="flex items-center gap-2 pb-3 border-b border-[var(--border)]">
            <FileCode className="h-5 w-5 text-[var(--weather-blue)]" />
            <h2 className="text-base font-bold text-[var(--text-primary)]">Unified JSON Envelope Standard</h2>
          </div>
          <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
            All endpoints encapsulate responses inside a structured metadata envelope:
          </p>
          <pre className="p-4 rounded-2xl bg-[var(--muted-surface)] text-[11px] font-mono text-[var(--text-primary)] overflow-x-auto border border-[var(--border)]">
{`{
  "meta": {
    "generated_at_utc": "2026-09-28T12:00:00Z",
    "data_quality": "ok",
    "units": { "rainfall": "mm/24h", "temperature": "degC" }
  },
  "data": { ... }
}`}
          </pre>
          <p className="text-xs text-[var(--safe-green)] font-semibold flex items-center gap-1.5">
            <CheckCircle2 className="h-4 w-4" /> Always extract response.data or json.data!
          </p>
        </div>

        <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6 space-y-3">
          <div className="flex items-center gap-2 pb-3 border-b border-[var(--border)]">
            <ShieldCheck className="h-5 w-5 text-[var(--safe-green)]" />
            <h2 className="text-base font-bold text-[var(--text-primary)]">CORS & Zero-Auth Key Architecture</h2>
          </div>
          <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
            All endpoints are configured with CORS <code className="text-[var(--weather-blue)] font-mono font-bold">allow_origins=["*"]</code>.
          </p>
          <ul className="text-xs text-[var(--text-secondary)] space-y-2 leading-relaxed pt-1">
            <li className="flex items-start gap-2">
              <span className="text-[var(--safe-green)] font-bold">✓</span>
              <span><strong>Zero client keys:</strong> OpenWeather keys are orchestrated server-side with automated dual-key failover.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[var(--safe-green)] font-bold">✓</span>
              <span><strong>Sub-2ms Redis cache:</strong> 10-minute TTL prevents quota limits on rapid regional switching.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[var(--safe-green)] font-bold">✓</span>
              <span><strong>Distributed Tracing:</strong> Every response returns an <code className="font-mono text-[11px]">x-request-id</code> header.</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Complete Endpoint Catalog Table */}
      <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6 space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-[var(--border)]">
          <BookOpen className="h-5 w-5 text-[var(--weather-blue)]" />
          <h2 className="text-base font-bold text-[var(--text-primary)]">Verified Production Endpoints Catalog</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[var(--border)] text-[var(--text-secondary)] uppercase tracking-wider font-semibold">
                <th className="py-2.5 px-3">Method</th>
                <th className="py-2.5 px-3">Endpoint</th>
                <th className="py-2.5 px-3">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {ENDPOINTS.map((ep, idx) => (
                <tr key={idx} className="hover:bg-[var(--muted-surface)]/60 transition-colors">
                  <td className="py-2.5 px-3 font-mono font-bold">
                    <span className={`px-2 py-0.5 rounded-md ${
                      ep.method === 'GET' ? 'bg-[var(--weather-blue)]/15 text-[var(--weather-blue)]' : 'bg-amber-500/15 text-amber-500'
                    }`}>
                      {ep.method}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 font-mono font-bold text-[var(--text-primary)]">
                    {ep.path}
                  </td>
                  <td className="py-2.5 px-3 text-[var(--text-secondary)]">
                    {ep.desc}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
