import React from 'react';
import Link from 'next/link';
import { ShieldCheck, Database, Award, ExternalLink } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full border-t border-[var(--border)] bg-[var(--surface)] text-[var(--text-secondary)] py-12 mt-auto">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Top Disclaimer Banner with Larger Font */}
        <div className="rounded-2xl border-2 border-[var(--risk-watch)]/30 bg-[var(--risk-watch)]/10 p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
          <div className="flex items-start gap-4">
            <ShieldCheck className="h-6 w-6 text-[var(--risk-watch)] shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="text-sm sm:text-base font-extrabold text-[var(--risk-watch)] uppercase tracking-wider">
                Operational Monitoring Aid & Decision Support
              </h4>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed font-medium">
                This platform estimates forecast trust and bust likelihood. It complements official weather alerts and never replaces IMD meteorological advisories. Avoid irreversible commitments on low-reliability leads.
              </p>
            </div>
          </div>
          <span className="shrink-0 text-xs font-mono font-bold text-[var(--text-secondary)] bg-[var(--muted-surface)] px-3 py-1.5 rounded-xl border border-[var(--border)]">
            Model: v1.3 (bd-1)
          </span>
        </div>

        {/* Data Provenance & Source Attribution */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pt-4 border-t border-[var(--border)]">
          <div className="space-y-2.5">
            <div className="flex items-center gap-2 text-[var(--text-primary)] font-bold text-base">
              <Database className="h-5 w-5 text-[var(--weather-blue)]" />
              <span>Data Ingestion Tier</span>
            </div>
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
              Real-time numerical weather prediction assimilated from ECMWF Open Data (IFS 0.25° & AIFS) and NOAA NCEP GFS/GEFS cycles.
            </p>
          </div>

          <div className="space-y-2.5">
            <div className="flex items-center gap-2 text-[var(--text-primary)] font-bold text-base">
              <Award className="h-5 w-5 text-[var(--weather-blue)]" />
              <span>Closed-Loop Verification</span>
            </div>
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
              Truth observations verified against NASA GPM IMERG Late satellite precipitation, airport METAR stations, and Copernicus ERA5T reanalysis.
            </p>
          </div>

          <div className="space-y-2.5">
            <h5 className="text-sm font-extrabold text-[var(--text-primary)] uppercase tracking-wider">Core Navigation</h5>
            <ul className="text-sm space-y-2">
              <li>
                <Link href="/" className="hover:text-[var(--weather-blue)] transition-colors font-medium">National Reliability Map</Link>
              </li>
              <li>
                <Link href="/globe" className="hover:text-[var(--weather-blue)] transition-colors font-medium">3D Interactive Globe</Link>
              </li>
              <li>
                <Link href="/history" className="hover:text-[var(--weather-blue)] transition-colors font-medium">Forecast vs Observed Truth</Link>
              </li>
              <li>
                <Link href="/time-machine" className="hover:text-[var(--weather-blue)] transition-colors font-medium">Time Machine Replay</Link>
              </li>
            </ul>
          </div>

          <div className="space-y-2.5">
            <h5 className="text-sm font-extrabold text-[var(--text-primary)] uppercase tracking-wider">Scientific Validation</h5>
            <ul className="text-sm space-y-2">
              <li>
                <Link href="/model" className="hover:text-[var(--weather-blue)] transition-colors font-medium">Calibration Curves & Reliability Diagrams</Link>
              </li>
              <li>
                <Link href="/status" className="hover:text-[var(--weather-blue)] transition-colors font-medium">Ingestion Pipeline & Latency Audit</Link>
              </li>
              <li className="pt-2 text-xs text-[var(--text-secondary)] font-semibold">
                Smart India Hackathon 2026 · AI Forecast Bust Detection
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Credits */}
        <div className="flex flex-col sm:flex-row items-center justify-between text-sm text-[var(--text-secondary)] pt-6 border-t border-[var(--border)] gap-4">
          <p>© 2026 ForecastIQ. Built for Smart India Hackathon 2026.</p>
          <div className="flex items-center gap-4 text-xs font-mono text-[var(--text-secondary)]">
            <span>ECMWF IFS CC-BY-4.0</span>
            <span>•</span>
            <span>NOAA Open Data</span>
            <span>•</span>
            <span>NASA GPM</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
