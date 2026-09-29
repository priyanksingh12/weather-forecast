'use client';

import React from 'react';
import { TimeMachineView } from '../../components/events/TimeMachineView';
import { Clock, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function TimeMachinePage() {
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
            <span className="text-xs font-mono text-[var(--weather-blue)]">Time Travel Replay</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)] tracking-tight mt-1 flex items-center gap-2.5">
            <Clock className="h-6 w-6 text-[var(--weather-blue)]" />
            <span>Forecast Evolution Time Machine</span>
          </h1>
          <p className="text-xs text-[var(--text-secondary)] mt-1">
            Stepping backwards from Day 10 to Day 1 to inspect when numerical weather models caught extreme events
          </p>
        </div>
      </div>

      {/* Interactive Time Machine View */}
      <section>
        <TimeMachineView />
      </section>
    </div>
  );
}
