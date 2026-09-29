'use client';

import React from 'react';
import { 
  Lightbulb, 
  ChevronRight, 
  Home, 
  Activity, 
  Wind, 
  CheckCircle2,
  AlertTriangle,
  ArrowRight
} from 'lucide-react';

export interface InsightItem {
  id: string;
  type: 'danger' | 'info' | 'warning' | 'success';
  title: string;
  timestamp?: string;
}

interface KeyInsightsCardProps {
  insights?: InsightItem[];
  cityName?: string;
  onViewAll?: () => void;
}

export const KeyInsightsCard: React.FC<KeyInsightsCardProps> = ({
  cityName = 'Lucknow',
  insights,
  onViewAll
}) => {
  const DEFAULT_INSIGHTS: InsightItem[] = [
    {
      id: '1',
      type: 'danger',
      title: `High chance of heavy rainfall from 2 PM to 8 PM in ${cityName} and nearby areas.`,
    },
    {
      id: '2',
      type: 'info',
      title: 'Rapid increase in rainfall intensity detected by AI model.',
    },
    {
      id: '3',
      type: 'warning',
      title: 'Wind conditions are favourable for convective activity.',
    },
    {
      id: '4',
      type: 'success',
      title: 'Low risk after 10 PM.',
    },
  ];

  const items = insights && insights.length > 0 ? insights : DEFAULT_INSIGHTS;

  const getIcon = (type: InsightItem['type']) => {
    switch (type) {
      case 'danger':
        return <Home className="h-4 w-4 text-[var(--risk-extreme)]" />;
      case 'info':
        return <Activity className="h-4 w-4 text-[var(--weather-blue)]" />;
      case 'warning':
        return <Wind className="h-4 w-4 text-[var(--safe-green)]" />;
      case 'success':
        return <CheckCircle2 className="h-4 w-4 text-[var(--safe-green)]" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-[var(--risk-watch)]" />;
    }
  };

  const getBadgeBg = (type: InsightItem['type']) => {
    switch (type) {
      case 'danger':
        return 'bg-[var(--risk-extreme)]/15 border-[var(--risk-extreme)]/30';
      case 'info':
        return 'bg-[var(--weather-blue)]/15 border-[var(--weather-blue)]/30';
      case 'warning':
        return 'bg-[var(--safe-green)]/15 border-[var(--safe-green)]/30';
      case 'success':
        return 'bg-[var(--safe-green)]/15 border-[var(--safe-green)]/30';
      default:
        return 'bg-[var(--risk-watch)]/15 border-[var(--risk-watch)]/30';
    }
  };

  return (
    <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-5 flex flex-col justify-between shadow-xs transition-all h-full">
      {/* Header matching screenshot */}
      <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--weather-blue)]/15 text-[var(--weather-blue)]">
            <Lightbulb className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-black tracking-tight text-[var(--text-primary)]">
              Key Insights
            </h3>
            <span className="text-[11px] font-medium text-[var(--text-secondary)]">
              Real-time AI Guidance
            </span>
          </div>
        </div>

        {onViewAll && (
          <button
            onClick={onViewAll}
            className="flex items-center gap-1 text-xs font-bold text-[var(--weather-blue)] hover:underline cursor-pointer"
          >
            <span>View All</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* 4 Interactive Alert Rows matching screenshot */}
      <div className="space-y-2.5 my-3">
        {items.map((item) => (
          <div
            key={item.id}
            className="group flex items-center justify-between gap-3 p-3 rounded-2xl bg-[var(--muted-surface)] hover:bg-[var(--weather-blue)]/10 border border-[var(--border)]/60 hover:border-[var(--weather-blue)]/30 transition-all cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border ${getBadgeBg(item.type)}`}>
                {getIcon(item.type)}
              </div>
              <p className={`text-xs font-semibold leading-snug ${
                item.type === 'danger' ? 'text-[var(--risk-extreme)]' : 'text-[var(--text-primary)]'
              }`}>
                {item.title}
              </p>
            </div>

            <ChevronRight className="h-4 w-4 text-[var(--text-secondary)] group-hover:text-[var(--weather-blue)] group-hover:translate-x-0.5 transition-all shrink-0" />
          </div>
        ))}
      </div>

      {/* Footer provenance label */}
      <div className="flex items-center justify-between pt-2 border-t border-[var(--border)] text-[11px] font-mono text-[var(--text-secondary)]">
        <span>Evaluated by LightGBM model v1.4</span>
        <span className="text-[var(--safe-green)] font-semibold">91% Confidence</span>
      </div>
    </div>
  );
};
