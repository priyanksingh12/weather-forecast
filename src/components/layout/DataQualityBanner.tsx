import React from 'react';
import { DataQuality } from '../../lib/api/types';
import { AlertTriangle, Clock, RefreshCw } from 'lucide-react';
import { formatUtcToIst } from '../../lib/utils/formatters';

interface Props {
  quality: DataQuality;
  timestampUtc: string;
}

export const DataQualityBanner: React.FC<Props> = ({ quality, timestampUtc }) => {
  if (quality === 'ok') return null;

  return (
    <div className="w-full bg-[var(--risk-watch)]/10 border-b border-[var(--risk-watch)]/30 px-4 py-2.5 text-xs text-[var(--risk-watch)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 shadow-sm">
      <div className="flex items-center gap-2 font-medium">
        {quality === 'stale' ? (
          <Clock className="w-4 h-4 text-[var(--risk-watch)] shrink-0" />
        ) : (
          <AlertTriangle className="w-4 h-4 text-[var(--risk-extreme)] shrink-0" />
        )}
        <span>
          <strong>Data Notice:</strong>{' '}
          {quality === 'stale'
            ? 'Incoming NWP forecast cycle is older than 12 hours. Showing the previous cycle.'
            : quality === 'degraded'
            ? 'Operating in degraded mode: NOAA GFS mirror offline; reliability computed using ECMWF IFS ensemble alone.'
            : 'Forecast reliability service is currently updating assimilations.'}
        </span>
      </div>
      <div className="flex items-center gap-3 text-[var(--text-secondary)] text-[11px] self-end sm:self-center">
        <span>Verified Truth: {formatUtcToIst(timestampUtc)}</span>
      </div>
    </div>
  );
};
