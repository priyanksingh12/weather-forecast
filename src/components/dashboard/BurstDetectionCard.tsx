'use client';

import React from 'react';
import { 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';
import { motion } from 'framer-motion';
import { 
  Activity, 
  Heart, 
  TrendingUp, 
  ArrowRight,
  ShieldAlert,
  Clock,
  MapPin
} from 'lucide-react';

interface BurstDetectionCardProps {
  burstProbability?: number;
  riskLevel?: string;
  modelConfidence?: number;
  expectedIntensity?: string;
  timeWindow?: string;
  affectedAreas?: string;
  onViewDetailedAnalysis?: () => void;
}

export const BurstDetectionCard: React.FC<BurstDetectionCardProps> = ({
  burstProbability = 76,
  riskLevel = 'High Risk',
  modelConfidence = 91,
  expectedIntensity = 'Very High',
  timeWindow = '2 PM – 8 PM',
  affectedAreas = 'Lucknow, Barabanki, Unnao',
  onViewDetailedAnalysis
}) => {
  // Recharts donut data
  const data = [
    { name: 'Bust Risk', value: burstProbability },
    { name: 'Confidence Margin', value: Math.max(0, 100 - burstProbability) }
  ];

  const getBustColor = (prob: number) => {
    if (prob >= 70) return '#BA6A6A'; // Red/Extreme
    if (prob >= 40) return '#F2994A'; // Amber/Watch
    return '#6ABA96'; // Safe green
  };

  const activeColor = getBustColor(burstProbability);
  const trackColor = 'var(--muted-surface)';

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -3 }}
      transition={{ duration: 0.3 }}
      className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-5 flex flex-col justify-between shadow-xs transition-all h-full"
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--ai-indigo)]/15 text-[var(--ai-indigo)]">
            <Activity className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-black tracking-tight text-[var(--text-primary)]">
              Burst Detection
            </h2>
            <div className="flex items-center gap-1 text-[11px] text-[var(--text-secondary)]">
              <Heart className="h-3 w-3 text-rose-500 fill-rose-500/20" />
              <span>Forecast Vitality Monitor</span>
            </div>
          </div>
        </div>

        {/* AI Model Active Badge */}
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--safe-green)]/15 text-[var(--safe-green)] border border-[var(--safe-green)]/30 text-xs font-bold">
          <span className="h-2 w-2 rounded-full bg-[var(--safe-green)] animate-pulse" />
          <span>AI Active</span>
        </div>
      </div>

      {/* Main Center Recharts Donut Chart */}
      <div className="flex flex-col items-center justify-center my-3 relative">
        <div className="relative w-44 h-44 flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={54}
                outerRadius={68}
                startAngle={90}
                endAngle={-270}
                paddingAngle={2}
                dataKey="value"
                stroke="none"
              >
                <Cell key="cell-0" fill={activeColor} />
                <Cell key="cell-1" fill={trackColor} />
              </Pie>
            </PieChart>
          </ResponsiveContainer>

          {/* Donut Center Display */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
            <span className="text-3xl sm:text-4xl font-black tracking-tight text-[var(--text-primary)] font-mono">
              {burstProbability}%
            </span>
            <span 
              className="text-[11px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full mt-0.5"
              style={{ 
                color: activeColor,
                backgroundColor: `${activeColor}20`
              }}
            >
              {riskLevel}
            </span>
          </div>
        </div>

        {/* Sub-headline description */}
        <p className="text-xs sm:text-sm font-semibold text-[var(--text-primary)] text-center mt-2 max-w-xs leading-relaxed flex items-center justify-center gap-1.5">
          <TrendingUp className="h-4 w-4 text-[var(--risk-watch)] shrink-0" />
          <span>High probability of extreme rainfall within window.</span>
        </p>
      </div>

      {/* Detail Metrics Key-Value List */}
      <div className="space-y-2 py-2.5 border-t border-[var(--border)] text-xs sm:text-sm">
        <div className="flex items-center justify-between">
          <span className="text-[var(--text-secondary)] font-medium flex items-center gap-1.5">
            <Activity className="h-3.5 w-3.5 text-[var(--weather-blue)]" />
            <span>Model Confidence</span>
          </span>
          <span className="font-bold text-[var(--text-primary)] font-mono">{modelConfidence}%</span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-[var(--text-secondary)] font-medium flex items-center gap-1.5">
            <ShieldAlert className="h-3.5 w-3.5 text-[var(--risk-high)]" />
            <span>Expected Intensity</span>
          </span>
          <span className="font-bold text-[var(--risk-high)]">{expectedIntensity}</span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-[var(--text-secondary)] font-medium flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5 text-[var(--text-secondary)]" />
            <span>Time Window</span>
          </span>
          <span className="font-mono font-bold text-[var(--text-primary)]">{timeWindow}</span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-[var(--text-secondary)] font-medium flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5 text-[var(--text-secondary)]" />
            <span>Affected Areas</span>
          </span>
          <span className="font-bold text-[var(--text-primary)] truncate max-w-[180px] text-right font-mono text-xs">
            {affectedAreas}
          </span>
        </div>
      </div>

      {/* Action Button: "View Detailed Analysis →" */}
      <div className="pt-2">
        <button
          onClick={onViewDetailedAnalysis}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-2xl bg-gradient-to-r from-[var(--ai-indigo)] to-[var(--forecast-blue)] hover:brightness-110 active:scale-98 text-white font-extrabold text-sm shadow-md transition-all cursor-pointer"
        >
          <span>View Detailed Analysis</span>
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </motion.div>
  );
};
