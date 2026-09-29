'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';
import { 
  MapPin, 
  Search, 
  Check, 
  ArrowRight, 
  Droplets, 
  Thermometer, 
  Wind,
  Activity,
  Heart,
  TrendingUp,
  X,
  Sparkles,
  ShieldAlert
} from 'lucide-react';
import { 
  RegionalData, 
  ALL_INDIA_LOCATIONS, 
  getRegionalData 
} from '../../lib/data/regionalIntelligence';

interface LocationsViewProps {
  currentRegion: RegionalData;
  onSelectRegion: (slug: string) => void;
}

export const LocationsView: React.FC<LocationsViewProps> = ({
  currentRegion,
  onSelectRegion
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'states' | 'uts' | 'cities' | 'high-risk' | 'coastal' | 'himalayan'>('all');

  // Master catalog of all unique locations across India (memoized to prevent re-creation)
  const allRegions = useMemo(() => {
    // Unique slugs only
    const seen = new Set<string>();
    const uniqueLocs = ALL_INDIA_LOCATIONS.filter((l) => {
      if (seen.has(l.slug)) return false;
      seen.add(l.slug);
      return true;
    });
    return uniqueLocs.map((loc) => getRegionalData(loc.slug));
  }, []);

  // Filtered dataset based on search query and active tab
  const filtered = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();

    return allRegions.filter((r) => {
      const locMeta = ALL_INDIA_LOCATIONS.find((l) => l.slug === r.slug);
      const matchesSearch = 
        !q ||
        r.name.toLowerCase().includes(q) ||
        r.state.toLowerCase().includes(q) ||
        r.slug.toLowerCase().includes(q);

      if (!matchesSearch) return false;

      if (selectedFilter === 'states') return locMeta?.type === 'state';
      if (selectedFilter === 'uts') return locMeta?.type === 'ut';
      if (selectedFilter === 'cities') return locMeta?.type === 'city' || ['delhi', 'chandigarh'].includes(r.slug);
      if (selectedFilter === 'high-risk') return r.burstProbability >= 70;
      if (selectedFilter === 'coastal') {
        return (
          ['mumbai', 'kolkata', 'odisha', 'chennai', 'kochi', 'visakhapatnam', 'panaji', 'goa', 'kerala', 'tamil-nadu', 'andhra-pradesh', 'gujarat', 'west-bengal', 'puducherry', 'andaman-nicobar', 'daman-diu', 'lakshadweep', 'surat'].includes(r.slug) ||
          r.state.toLowerCase().includes('coastal')
        );
      }
      if (selectedFilter === 'himalayan') {
        return ['shimla', 'dehradun', 'srinagar', 'himachal-pradesh', 'uttarakhand', 'jammu-kashmir', 'ladakh', 'sikkim', 'arunachal-pradesh'].includes(r.slug);
      }
      return true;
    });
  }, [allRegions, searchQuery, selectedFilter]);

  // Tab counts
  const counts = useMemo(() => {
    return {
      all: allRegions.length,
      states: allRegions.filter(r => ALL_INDIA_LOCATIONS.find(l => l.slug === r.slug)?.type === 'state').length,
      uts: allRegions.filter(r => ALL_INDIA_LOCATIONS.find(l => l.slug === r.slug)?.type === 'ut').length,
      cities: allRegions.filter(r => {
        const meta = ALL_INDIA_LOCATIONS.find(l => l.slug === r.slug);
        return meta?.type === 'city' || ['delhi', 'chandigarh'].includes(r.slug);
      }).length,
      highRisk: allRegions.filter(r => r.burstProbability >= 70).length,
      coastal: allRegions.filter(r => ['mumbai', 'kolkata', 'odisha', 'chennai', 'kochi', 'visakhapatnam', 'panaji', 'goa', 'kerala', 'tamil-nadu', 'andhra-pradesh', 'gujarat', 'west-bengal', 'puducherry', 'andaman-nicobar', 'daman-diu', 'lakshadweep', 'surat'].includes(r.slug)).length,
      himalayan: allRegions.filter(r => ['shimla', 'dehradun', 'srinagar', 'himachal-pradesh', 'uttarakhand', 'jammu-kashmir', 'ladakh', 'sikkim', 'arunachal-pradesh'].includes(r.slug)).length,
    };
  }, [allRegions]);

  return (
    <div className="w-full max-w-[1600px] mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
      {/* View Header - Stacked Pattern */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-5 p-6 sm:p-8 rounded-3xl bg-[var(--surface)] border border-[var(--border)] shadow-xs"
      >
        {/* Top Section: Title, Badges, and Description */}
        <div className="flex items-start gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[var(--weather-blue)]/15 text-[var(--weather-blue)] shadow-xs mt-0.5">
            <MapPin className="h-7 w-7" />
          </div>
          <div className="space-y-1.5 flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-[var(--text-primary)]">
                National Geographic Regional Directory & Centroid Explorer
              </h1>
              <span className="px-3 py-1 rounded-full text-xs sm:text-sm font-bold bg-[var(--weather-blue)]/15 text-[var(--weather-blue)] border border-[var(--weather-blue)]/30 font-mono">
                {allRegions.length} All-India Centroids
              </span>
            </div>
            <p className="text-sm sm:text-base text-[var(--text-secondary)] leading-relaxed">
              Explore and select any of the 28 States, 8 Union Territories, or major cities across India to synchronize telemetry
            </p>
          </div>
        </div>

        {/* Filter Section Underneath: Active Centroid Info */}
        <div className="pt-4 border-t border-[var(--border)]/70 flex flex-wrap items-center justify-between gap-3 w-full">
          <div className="flex items-center gap-2">
            <span className="text-xs sm:text-sm font-mono text-[var(--text-secondary)]">Currently Active Centroid:</span>
            <span className="px-3.5 py-1.5 rounded-xl bg-[var(--weather-blue)] text-white text-xs sm:text-sm font-bold shadow-xs">
              {currentRegion.name} ({currentRegion.state})
            </span>
          </div>

          <span className="text-xs font-mono text-[var(--text-secondary)] bg-[var(--muted-surface)] px-3 py-1.5 rounded-xl border border-[var(--border)]">
            Total Telemetry Nodes: <strong className="text-[var(--text-primary)]">{allRegions.length}</strong>
          </span>
        </div>
      </motion.div>

      {/* Search and Filters Bar - Stacked Pattern */}
      <div className="flex flex-col gap-4 p-5 sm:p-6 rounded-3xl bg-[var(--surface)] border border-[var(--border)] shadow-xs">
        {/* Top: Full-Width Search Input */}
        <div className="relative w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-secondary)]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search all 36 States, UTs, or cities (e.g. Kerala, Assam, Goa, Jaipur, Mumbai)..."
            className="w-full pl-11 pr-11 py-3 rounded-2xl border border-[var(--border)] bg-[var(--muted-surface)] text-sm font-medium text-[var(--text-primary)] focus:outline-none focus:border-[var(--weather-blue)] shadow-inner"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer"
              title="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Bottom: Responsive Horizontal Category Filters Row */}
        <div className="pt-3 border-t border-[var(--border)]/70 flex items-center gap-2.5 w-full overflow-x-auto no-scrollbar py-1">
          <span className="text-xs sm:text-sm font-bold text-[var(--text-secondary)] uppercase tracking-wider mr-1 shrink-0">
            Filter:
          </span>
          {[
            { id: 'all', label: 'All', count: counts.all },
            { id: 'states', label: '28 States', count: counts.states },
            { id: 'uts', label: '8 UTs', count: counts.uts },
            { id: 'cities', label: 'Major Cities', count: counts.cities },
            { id: 'high-risk', label: 'High Bust Risk', count: counts.highRisk },
            { id: 'coastal', label: 'Coastal Marine', count: counts.coastal },
            { id: 'himalayan', label: 'Himalayan Ridge', count: counts.himalayan },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setSelectedFilter(f.id as any)}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
                selectedFilter === f.id
                  ? 'bg-[var(--weather-blue)] text-white shadow-xs'
                  : 'bg-[var(--muted-surface)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--border)]'
              }`}
            >
              <span>{f.label}</span>
              <span className={`text-[11px] px-2 py-0.5 rounded-full font-mono font-bold ${
                selectedFilter === f.id ? 'bg-white/20 text-white' : 'bg-[var(--border)] text-[var(--text-secondary)]'
              }`}>
                {f.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Showing count indicator */}
      <div className="flex items-center justify-between px-2 text-xs font-mono text-[var(--text-secondary)]">
        <span>Showing {filtered.length} locations across India</span>
        <span>Click any card to activate across dashboard</span>
      </div>

      {/* Regional Cards Grid with Recharts Pie Gauges & Area Sparklines */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((region, idx) => {
          const isSelected = region.slug === currentRegion.slug;
          const locMeta = ALL_INDIA_LOCATIONS.find((l) => l.slug === region.slug);
          const gaugeColor = region.burstProbability >= 70 ? '#BA6A6A' : region.burstProbability >= 40 ? '#F2994A' : '#6ABA96';

          return (
            <motion.div
              key={`${region.slug}-${idx}`}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: Math.min(idx * 0.015, 0.3) }}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onSelectRegion(region.slug)}
              className={`rounded-3xl border p-6 flex flex-col justify-between transition-all cursor-pointer group select-none ${
                isSelected
                  ? 'border-[var(--weather-blue)] bg-[var(--weather-blue)]/10 shadow-md ring-2 ring-[var(--weather-blue)]/30'
                  : 'border-[var(--border)] bg-[var(--surface)] hover:border-[var(--weather-blue)]/40 hover:shadow-md'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className={`flex h-12 w-12 items-center justify-center rounded-2xl transition-colors shrink-0 ${
                      isSelected ? 'bg-[var(--weather-blue)] text-white shadow-xs' : 'bg-[var(--muted-surface)] text-[var(--text-secondary)]'
                    }`}>
                      <MapPin className="h-6 w-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg sm:text-xl font-black text-[var(--text-primary)] group-hover:text-[var(--weather-blue)] transition-colors tracking-tight">
                          {region.name}
                        </h3>
                        {locMeta?.type && (
                          <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-md bg-[var(--muted-surface)] text-[var(--text-secondary)] border border-[var(--border)] font-bold">
                            {locMeta.type}
                          </span>
                        )}
                      </div>
                      <p className="text-sm sm:text-base font-semibold text-[var(--text-secondary)] mt-0.5">
                        {region.state}
                      </p>
                    </div>
                  </div>

                  {/* Recharts PieChart Donut Mini-Gauge */}
                  <div className="w-14 h-14 relative flex items-center justify-center shrink-0">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={[
                            { value: region.burstProbability },
                            { value: Math.max(0, 100 - region.burstProbability) }
                          ]}
                          cx="50%"
                          cy="50%"
                          innerRadius={17}
                          outerRadius={25}
                          startAngle={90}
                          endAngle={-270}
                          dataKey="value"
                          stroke="none"
                          isAnimationActive={false}
                        >
                          <Cell fill={gaugeColor} />
                          <Cell fill="var(--muted-surface)" />
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                    <span 
                      className="absolute text-xs font-mono font-black"
                      style={{ color: gaugeColor }}
                    >
                      {region.burstProbability}%
                    </span>
                  </div>
                </div>

                {/* 3 Metric Pills with Lucide Icons */}
                <div className="grid grid-cols-3 gap-2.5 my-4 pt-4 border-t border-[var(--border)]/70">
                  <div className="p-2.5 rounded-xl bg-[var(--muted-surface)] text-center flex flex-col items-center">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-[var(--text-secondary)] mb-1">
                      <Thermometer className="h-3.5 w-3.5 text-amber-500" />
                      <span>Temp</span>
                    </div>
                    <span className="text-base sm:text-lg font-mono font-black text-[var(--text-primary)]">{region.temperature}°C</span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-[var(--muted-surface)] text-center flex flex-col items-center">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-[var(--text-secondary)] mb-1">
                      <Droplets className="h-3.5 w-3.5 text-[var(--weather-blue)]" />
                      <span>Rain 24h</span>
                    </div>
                    <span className="text-base sm:text-lg font-mono font-black text-[var(--weather-blue)]">{region.rainfall24h} mm</span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-[var(--muted-surface)] text-center flex flex-col items-center">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-[var(--text-secondary)] mb-1">
                      <Wind className="h-3.5 w-3.5 text-[var(--text-secondary)]" />
                      <span>Wind</span>
                    </div>
                    <span className="text-base sm:text-lg font-mono font-black text-[var(--text-primary)]">{region.windSpeedKmH} km/h</span>
                  </div>
                </div>

                {/* Recharts Area Sparkline */}
                <div className="h-11 w-full pt-1">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={region.rainfallPrediction.slice(0, 8)} margin={{ top: 2, right: 2, left: 2, bottom: 2 }}>
                      <defs>
                        <linearGradient id={`area-${region.slug}`} x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="var(--weather-blue)" stopOpacity={0.4} />
                          <stop offset="95%" stopColor="var(--weather-blue)" stopOpacity={0.0} />
                        </linearGradient>
                      </defs>
                      <Area
                        type="monotone"
                        dataKey="val"
                        stroke="var(--weather-blue)"
                        strokeWidth={2}
                        fill={`url(#area-${region.slug})`}
                        isAnimationActive={false}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                {/* Condition and Atmospheric Health */}
                <div className="flex items-center justify-between text-sm py-2 border-t border-[var(--border)]/70 text-[var(--text-secondary)] mt-2">
                  <span className="font-bold text-[var(--text-primary)] text-sm sm:text-base truncate max-w-[160px]">{region.conditionText}</span>
                  <div className="flex items-center gap-1.5 font-mono text-xs sm:text-sm font-bold shrink-0">
                    <Heart className="h-4 w-4 text-rose-500" />
                    <span>Conf: {region.modelConfidence}%</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 mt-2 border-t border-[var(--border)]/70">
                <span className="text-xs sm:text-sm font-mono font-semibold text-[var(--text-secondary)]">
                  {region.coordinates}
                </span>

                <span className={`flex items-center gap-1.5 text-sm font-bold ${
                  isSelected ? 'text-[var(--weather-blue)]' : 'text-[var(--text-secondary)] group-hover:text-[var(--weather-blue)]'
                }`}>
                  <span>{isSelected ? 'Active Selection' : 'Inspect Region'}</span>
                  {isSelected ? <Check className="h-4 w-4" /> : <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />}
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="p-12 text-center rounded-3xl border border-[var(--border)] bg-[var(--surface)] space-y-3">
          <p className="text-base font-bold text-[var(--text-primary)]">
            No locations matched "{searchQuery}"
          </p>
          <p className="text-xs text-[var(--text-secondary)]">
            Try searching by state name (e.g., "Bihar", "Kerala", "Assam"), city name, or switch category tabs.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedFilter('all');
            }}
            className="px-4 py-2 rounded-xl bg-[var(--weather-blue)] text-white text-xs font-bold shadow-xs hover:brightness-110 cursor-pointer"
          >
            Reset Filters
          </button>
        </div>
      )}
    </div>
  );
};
