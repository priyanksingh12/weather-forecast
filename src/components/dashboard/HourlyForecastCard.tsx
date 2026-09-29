'use client';

import React from 'react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  Tooltip 
} from 'recharts';
import { motion } from 'framer-motion';
import { 
  Clock, 
  CloudRain, 
  Cloud, 
  CloudSun, 
  Sun, 
  ArrowRight,
  Droplets,
  TrendingUp,
  Activity,
  Heart
} from 'lucide-react';
import { RegionalData } from '../../lib/data/regionalIntelligence';

interface HourlyForecastCardProps {
  hourlyData?: RegionalData['hourlyForecast'];
  onViewMore?: () => void;
}

export const HourlyForecastCard: React.FC<HourlyForecastCardProps> = ({ 
  hourlyData, 
  onViewMore 
}) => {
  const getIcon = (condition: string) => {
    switch (condition) {
      case 'rain':
        return <CloudRain className="h-6 w-6 sm:h-7 sm:w-7 text-[var(--weather-blue)]" />;
      case 'cloud':
        return <Cloud className="h-6 w-6 sm:h-7 sm:w-7 text-[var(--text-secondary)]" />;
      case 'sun':
        return <Sun className="h-6 w-6 sm:h-7 sm:w-7 text-amber-400" />;
      case 'partly':
      default:
        return <CloudSun className="h-6 w-6 sm:h-7 sm:w-7 text-amber-400" />;
    }
  };

  const DEFAULT_HOURLY = [
    { time: 'Now', condition: 'rain' as const, temp: 28, pop: 40 },
    { time: '8 PM', condition: 'rain' as const, temp: 26, pop: 60 },
    { time: '11 PM', condition: 'cloud' as const, temp: 24, pop: 70 },
    { time: '2 AM', condition: 'cloud' as const, temp: 23, pop: 50 },
    { time: '5 AM', condition: 'sun' as const, temp: 25, pop: 20 },
    { time: '8 AM', condition: 'sun' as const, temp: 28, pop: 10 },
  ];

  const items = hourlyData && hourlyData.length > 0 ? hourlyData : DEFAULT_HOURLY;

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
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--weather-blue)]/15 text-[var(--weather-blue)]">
            <Clock className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-black tracking-tight text-[var(--text-primary)] flex items-center gap-2">
              <span>Hourly Forecast</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--weather-blue)]/15 text-[var(--weather-blue)] font-mono font-bold">
                24H
              </span>
            </h3>
            <span className="text-[11px] font-medium text-[var(--text-secondary)]">
              ECMWF short-range convective sequence
            </span>
          </div>
        </div>

        {onViewMore && (
          <button
            onClick={onViewMore}
            className="flex items-center gap-1 text-xs font-bold text-[var(--weather-blue)] hover:underline cursor-pointer"
          >
            <span>View More</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* 6 Column Horizontal Strip */}
      <div className="grid grid-cols-6 gap-1.5 my-3">
        {items.map((item, idx) => (
          <motion.div
            key={idx}
            whileHover={{ y: -2 }}
            className="flex flex-col items-center justify-between p-2 rounded-2xl bg-[var(--muted-surface)] hover:bg-[var(--weather-blue)]/10 transition-colors text-center"
          >
            <span className="text-[11px] font-bold text-[var(--text-secondary)]">
              {item.time}
            </span>

            <div className="my-1.5">
              {getIcon(item.condition)}
            </div>

            <span className="text-xs sm:text-sm font-black text-[var(--text-primary)]">
              {item.temp}°
            </span>

            <div className="flex items-center gap-0.5 mt-1 text-[10px] font-bold text-[var(--weather-blue)]">
              <Droplets className="h-2.5 w-2.5 shrink-0" />
              <span>{item.pop}%</span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Recharts PoP Area Trend Sparkline */}
      <div className="h-10 w-full pt-1">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={items} margin={{ top: 2, right: 4, left: 4, bottom: 2 }}>
            <defs>
              <linearGradient id="hourlyPopGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--weather-blue)" stopOpacity={0.45} />
                <stop offset="95%" stopColor="var(--weather-blue)" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload || !payload.length) return null;
                const d = payload[0].payload;
                return (
                  <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-1.5 shadow-lg text-[10px] font-mono">
                    <span className="font-bold text-[var(--text-primary)]">{d.time}: </span>
                    <span className="text-[var(--weather-blue)] font-bold">{d.pop}% PoP ({d.temp}°C)</span>
                  </div>
                );
              }}
            />
            <Area
              type="monotone"
              dataKey="pop"
              stroke="var(--weather-blue)"
              strokeWidth={1.5}
              fill="url(#hourlyPopGrad)"
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Bottom Status Indicator */}
      <div className="flex items-center justify-between pt-2 border-t border-[var(--border)] text-[11px] font-mono text-[var(--text-secondary)]">
        <div className="flex items-center gap-1.5">
          <TrendingUp className="h-3 w-3 text-[var(--weather-blue)]" />
          <span>Precipitation chance updated</span>
        </div>
        <span className="text-[var(--safe-green)] font-semibold flex items-center gap-1">
          <Activity className="h-3 w-3" />
          <span>ECMWF 00Z Live</span>
        </span>
      </div>
    </motion.div>
  );
};
