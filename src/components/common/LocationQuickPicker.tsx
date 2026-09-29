'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, ChevronDown, Check, Search, Globe2 } from 'lucide-react';
import { 
  RegionalData, 
  ALL_INDIA_LOCATIONS 
} from '../../lib/data/regionalIntelligence';

interface LocationQuickPickerProps {
  currentRegion: RegionalData;
  onSelectRegion: (slug: string) => void;
  className?: string;
  label?: string;
}

export const LocationQuickPicker: React.FC<LocationQuickPickerProps> = ({
  currentRegion,
  onSelectRegion,
  className = '',
  label = 'Locations:'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'states' | 'uts' | 'cities'>('states');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Popular quick chips
  const POPULAR_SLUGS = [
    'lucknow', 'delhi', 'mumbai', 'bengaluru', 'kolkata', 
    'chennai', 'hyderabad', 'jaipur', 'shimla', 'odisha',
    'kerala', 'assam', 'punjab', 'gujarat', 'goa'
  ];

  // Quick chips: include currentRegion if not already present
  const quickList = React.useMemo(() => {
    const list = ALL_INDIA_LOCATIONS.filter((l) => POPULAR_SLUGS.includes(l.slug));
    const currentFound = list.find((l) => l.slug === currentRegion.slug);
    if (!currentFound) {
      const activeObj = ALL_INDIA_LOCATIONS.find((l) => l.slug === currentRegion.slug);
      if (activeObj) {
        return [activeObj, ...list];
      }
    }
    return list;
  }, [currentRegion.slug]);

  // Filtered dropdown list
  const filteredOptions = ALL_INDIA_LOCATIONS.filter((loc) => {
    const matchesSearch = 
      loc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      loc.state.toLowerCase().includes(searchQuery.toLowerCase()) ||
      loc.slug.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;
    if (activeTab === 'states') return loc.type === 'state';
    if (activeTab === 'uts') return loc.type === 'ut';
    if (activeTab === 'cities') return loc.type === 'city';
    return true;
  });

  return (
    <div className={`w-full flex flex-wrap items-center gap-2.5 ${className}`}>
      {label && (
        <span className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mr-1 shrink-0">
          {label}
        </span>
      )}

      {/* Quick Location Chips */}
      <div className="flex-1 min-w-0 max-w-full flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
        {quickList.slice(0, 10).map((loc) => {
          const isSelected = loc.slug === currentRegion.slug;
          return (
            <motion.button
              key={loc.slug}
              whileTap={{ scale: 0.95 }}
              onClick={() => onSelectRegion(loc.slug)}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                isSelected
                  ? 'bg-[var(--weather-blue)] text-white font-bold shadow-xs'
                  : 'bg-[var(--muted-surface)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--border)]'
              }`}
            >
              <MapPin className="h-3 w-3 shrink-0" />
              <span>{loc.name}</span>
              {isSelected && <Check className="h-3 w-3 ml-0.5" />}
            </motion.button>
          );
        })}
      </div>

      {/* "All 36 States..." Dropdown Trigger */}
      <div ref={dropdownRef} className="relative shrink-0">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
            isOpen
              ? 'border-[var(--weather-blue)] bg-[var(--weather-blue)]/15 text-[var(--weather-blue)]'
              : 'border-[var(--border)] bg-[var(--surface)] text-[var(--text-primary)] hover:border-[var(--weather-blue)]/50'
          }`}
          title="Browse all 36 States, Union Territories and major cities"
        >
          <Globe2 className="h-3.5 w-3.5 text-[var(--weather-blue)]" />
          <span>All 36 States & UTs...</span>
          <ChevronDown className={`h-3 w-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {/* Searchable Modal / Dropdown */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 6, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 6, scale: 0.98 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 top-full mt-2 w-80 sm:w-96 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-3 shadow-2xl backdrop-blur-xl z-50 max-h-96 flex flex-col"
            >
              {/* Header and Search */}
              <div className="space-y-2 pb-2 border-b border-[var(--border)]">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">
                    Select Any Indian Location
                  </span>
                  <span className="text-[10px] font-mono text-[var(--weather-blue)] font-bold">
                    {ALL_INDIA_LOCATIONS.length} Available
                  </span>
                </div>

                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[var(--text-secondary)]" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search any state (e.g. Kerala, Assam, Goa)..."
                    className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-[var(--border)] bg-[var(--muted-surface)] text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--weather-blue)]"
                    autoFocus
                  />
                </div>

                {/* Tabs */}
                <div className="flex items-center gap-1 text-[11px] font-semibold pt-1">
                  {[
                    { id: 'states', label: '28 States' },
                    { id: 'uts', label: '8 UTs' },
                    { id: 'cities', label: 'Cities' },
                    { id: 'all', label: 'All' },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`flex-1 py-1 rounded-lg text-center transition-colors cursor-pointer ${
                        activeTab === tab.id
                          ? 'bg-[var(--weather-blue)] text-white font-bold'
                          : 'bg-[var(--muted-surface)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Scrollable list */}
              <div className="overflow-y-auto max-h-56 divide-y divide-[var(--border)]/40 py-1">
                {filteredOptions.length > 0 ? (
                  filteredOptions.map((loc) => {
                    const isSelected = loc.slug === currentRegion.slug;
                    return (
                      <button
                        key={loc.slug}
                        onClick={() => {
                          onSelectRegion(loc.slug);
                          setIsOpen(false);
                          setSearchQuery('');
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2 text-left text-xs transition-colors cursor-pointer ${
                          isSelected
                            ? 'bg-[var(--weather-blue)]/15 text-[var(--weather-blue)] font-bold'
                            : 'hover:bg-[var(--muted-surface)] text-[var(--text-primary)]'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <MapPin className="h-3.5 w-3.5 text-[var(--weather-blue)] shrink-0" />
                          <div>
                            <span className="font-semibold block">{loc.name}</span>
                            <span className="text-[10px] text-[var(--text-secondary)]">{loc.state}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <span className="text-[9px] uppercase font-mono px-1.5 py-0.5 rounded bg-[var(--muted-surface)] text-[var(--text-secondary)] border border-[var(--border)] font-bold">
                            {loc.type}
                          </span>
                          {isSelected && <Check className="h-3.5 w-3.5 text-[var(--weather-blue)]" />}
                        </div>
                      </button>
                    );
                  })
                ) : (
                  <div className="p-4 text-center text-xs text-[var(--text-secondary)]">
                    No location found for "{searchQuery}".
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
