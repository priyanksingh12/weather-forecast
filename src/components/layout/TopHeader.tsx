'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  MapPin, 
  ChevronDown, 
  Crosshair, 
  Menu,
  Check,
  User
} from 'lucide-react';
import { ThemeToggle } from '../theme/ThemeToggle';
import { ALL_INDIA_LOCATIONS, ALL_STATES_LIST, ALL_UTS_LIST, ALL_CITIES_LIST } from '../../lib/data/regionalIntelligence';

export interface TopHeaderProps {
  selectedRegion: string;
  onSelectRegion: (slug: string) => void;
  onMobileMenuToggle: () => void;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  selectedRegion,
  onSelectRegion,
  onMobileMenuToggle,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [dropdownTab, setDropdownTab] = useState<'states' | 'uts' | 'cities' | 'all'>('states');
  const [dropdownSearch, setDropdownSearch] = useState('');
  const [currentDateTime, setCurrentDateTime] = useState('');

  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  // Live Date/Time formatter: "Sun, 28 Sep 2026 | 07:42 PM"
  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();
      const dayName = now.toLocaleDateString('en-US', { weekday: 'short' });
      const dayNum = now.getDate();
      const monthName = now.toLocaleDateString('en-US', { month: 'short' });
      const year = now.getFullYear();
      const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

      setCurrentDateTime(`${dayName}, ${dayNum} ${monthName} ${year}\n${timeStr}`);
    };

    updateDateTime();
    const interval = setInterval(updateDateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setSearchFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const activeRegionObj = ALL_INDIA_LOCATIONS.find((r) => r.slug === selectedRegion) || {
    slug: selectedRegion,
    name: selectedRegion.charAt(0).toUpperCase() + selectedRegion.slice(1).replace(/-/g, ' '),
    state: 'India',
    type: 'city',
    lat: 26.85,
    lon: 80.95
  };

  const filteredRegions = ALL_INDIA_LOCATIONS.filter((r) => 
    r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.state.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.slug.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <header className="sticky top-0 z-20 flex h-20 w-full items-center justify-between px-4 sm:px-6 lg:px-8 bg-[var(--background)]/90 backdrop-blur-xl border-b border-[var(--border)] transition-colors">
      {/* Left: Mobile hamburger + Search Input */}
      <div className="flex items-center gap-3 flex-1 max-w-xl">
        <button
          onClick={onMobileMenuToggle}
          className="lg:hidden p-2 rounded-2xl border border-[var(--border)] bg-[var(--surface)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
          aria-label="Open sidebar"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Search Bar - Supports ALL States & Cities in India */}
        <div ref={searchRef} className="relative w-full">
          <div className="relative flex items-center">
            <Search className="absolute left-3.5 h-4.5 w-4.5 text-[var(--text-secondary)] pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              placeholder="Search all 36 Indian states, UTs or cities (e.g. Jaipur, Kerala, Assam, Goa)..."
              className="w-full pl-10 pr-10 py-2.5 rounded-2xl border border-[var(--border)] bg-[var(--surface)] text-sm font-medium text-[var(--text-primary)] placeholder-[var(--text-secondary)]/70 focus:outline-none focus:border-[var(--weather-blue)] focus:ring-2 focus:ring-[var(--weather-blue)]/20 transition-all shadow-xs"
            />
            <button
              onClick={() => {
                onSelectRegion('lucknow');
                setSearchQuery('');
              }}
              className="absolute right-3 p-1 rounded-lg text-[var(--text-secondary)] hover:text-[var(--weather-blue)] transition-colors cursor-pointer"
              title="Locate via GPS"
              aria-label="Current location"
            >
              <Crosshair className="h-4 w-4" />
            </button>
          </div>

          {/* Autocomplete Dropdown with ALL locations */}
          {searchFocused && (
            <div className="absolute top-full left-0 right-0 mt-2 z-50 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-2 shadow-2xl backdrop-blur-2xl animate-in fade-in duration-150 max-h-80 overflow-y-auto">
              <div className="flex items-center justify-between px-3 py-1.5 border-b border-[var(--border)] mb-1">
                <span className="text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-wider block">
                  {searchQuery ? `Matching Locations (${filteredRegions.length})` : 'All States & Cities across India'}
                </span>
                <span className="text-[10px] text-[var(--weather-blue)] font-semibold font-mono">
                  All 36 States & Metros
                </span>
              </div>

              <div className="space-y-0.5">
                {filteredRegions.length > 0 ? (
                  filteredRegions.map((region) => (
                    <button
                      key={region.slug}
                      onClick={() => {
                        onSelectRegion(region.slug);
                        setSearchQuery('');
                        setSearchFocused(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left text-xs font-semibold transition-colors cursor-pointer ${
                        region.slug === selectedRegion
                          ? 'bg-[var(--weather-blue)]/15 text-[var(--weather-blue)] font-bold'
                          : 'text-[var(--text-primary)] hover:bg-[var(--muted-surface)]'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <MapPin className="h-3.5 w-3.5 text-[var(--weather-blue)] shrink-0" />
                        <span>{region.name}</span>
                        <span className="text-[11px] text-[var(--text-secondary)] font-normal">
                          ({region.state})
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-[var(--muted-surface)] text-[var(--text-secondary)]">
                          {region.type}
                        </span>
                        {region.slug === selectedRegion && (
                          <Check className="h-3.5 w-3.5 text-[var(--weather-blue)]" />
                        )}
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="p-4 text-center text-xs text-[var(--text-secondary)]">
                    No location found for "{searchQuery}". Try another Indian city or state.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right Controls: Location Dropdown + Date & Time + Theme Toggle + User Avatar */}
      <div className="flex items-center gap-3 sm:gap-4 ml-4">
        {/* Location Dropdown */}
        <div ref={dropdownRef} className="relative hidden md:block">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-2xl border border-[var(--border)] bg-[var(--surface)] text-sm font-bold text-[var(--text-primary)] hover:border-[var(--weather-blue)]/50 transition-all shadow-xs cursor-pointer"
          >
            <MapPin className="h-4 w-4 text-[var(--weather-blue)]" />
            <span>{activeRegionObj.name}</span>
            <ChevronDown className={`h-4 w-4 text-[var(--text-secondary)] transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 top-full mt-2 w-80 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-3 shadow-2xl backdrop-blur-2xl z-50 animate-in fade-in duration-150">
              {/* Category Filter Tabs */}
              <div className="flex items-center gap-1 p-1 bg-[var(--muted-surface)] rounded-xl border border-[var(--border)] mb-2.5 text-[11px] font-bold">
                <button
                  onClick={() => setDropdownTab('states')}
                  className={`flex-1 py-1 rounded-lg transition-all cursor-pointer ${
                    dropdownTab === 'states'
                      ? 'bg-[var(--weather-blue)] text-white shadow-xs'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  28 States
                </button>
                <button
                  onClick={() => setDropdownTab('uts')}
                  className={`flex-1 py-1 rounded-lg transition-all cursor-pointer ${
                    dropdownTab === 'uts'
                      ? 'bg-[var(--weather-blue)] text-white shadow-xs'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  8 UTs
                </button>
                <button
                  onClick={() => setDropdownTab('cities')}
                  className={`flex-1 py-1 rounded-lg transition-all cursor-pointer ${
                    dropdownTab === 'cities'
                      ? 'bg-[var(--weather-blue)] text-white shadow-xs'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  Cities
                </button>
                <button
                  onClick={() => setDropdownTab('all')}
                  className={`flex-1 py-1 rounded-lg transition-all cursor-pointer ${
                    dropdownTab === 'all'
                      ? 'bg-[var(--weather-blue)] text-white shadow-xs'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  All (70+)
                </button>
              </div>

              {/* Quick Search inside dropdown */}
              <div className="relative mb-2">
                <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-[var(--text-secondary)]" />
                <input
                  type="text"
                  value={dropdownSearch}
                  onChange={(e) => setDropdownSearch(e.target.value)}
                  placeholder="Filter states or territories..."
                  className="w-full pl-8 pr-2.5 py-1.5 rounded-xl border border-[var(--border)] bg-[var(--muted-surface)] text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--weather-blue)]"
                />
              </div>

              {/* Scrollable list */}
              <div className="max-h-64 overflow-y-auto space-y-0.5 pr-1">
                {(() => {
                  const baseList = 
                    dropdownTab === 'states' ? ALL_STATES_LIST :
                    dropdownTab === 'uts' ? ALL_UTS_LIST :
                    dropdownTab === 'cities' ? ALL_CITIES_LIST :
                    ALL_INDIA_LOCATIONS;

                  const filtered = baseList.filter(r => 
                    r.name.toLowerCase().includes(dropdownSearch.toLowerCase()) ||
                    r.state.toLowerCase().includes(dropdownSearch.toLowerCase())
                  );

                  if (filtered.length === 0) {
                    return (
                      <div className="p-3 text-center text-xs text-[var(--text-secondary)]">
                        No matches found.
                      </div>
                    );
                  }

                  return filtered.map((region) => (
                    <button
                      key={region.slug}
                      onClick={() => {
                        onSelectRegion(region.slug);
                        setDropdownOpen(false);
                        setDropdownSearch('');
                      }}
                      className={`w-full flex items-center justify-between px-3 py-1.5 rounded-xl text-left text-xs font-semibold transition-colors cursor-pointer ${
                        region.slug === selectedRegion
                          ? 'bg-[var(--weather-blue)]/15 text-[var(--weather-blue)] font-bold'
                          : 'text-[var(--text-primary)] hover:bg-[var(--muted-surface)]'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <MapPin className="h-3.5 w-3.5 text-[var(--weather-blue)] shrink-0" />
                        <span className="truncate">{region.name}</span>
                        <span className="text-[10px] text-[var(--text-secondary)] font-normal truncate">
                          ({region.state})
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className="text-[9px] uppercase font-mono px-1 py-0.2 rounded bg-[var(--muted-surface)] text-[var(--text-secondary)]">
                          {region.type}
                        </span>
                        {region.slug === selectedRegion && (
                          <Check className="h-3.5 w-3.5 text-[var(--weather-blue)]" />
                        )}
                      </div>
                    </button>
                  ));
                })()}
              </div>
            </div>
          )}
        </div>

        {/* Date & Time Widget */}
        <div className="hidden sm:flex flex-col text-right font-medium leading-tight">
          <span className="text-xs font-semibold text-[var(--text-primary)] whitespace-nowrap">
            {currentDateTime.split('\n')[0] || 'Sun, 28 Sep 2026'}
          </span>
          <span className="text-[11px] text-[var(--text-secondary)] font-mono">
            {currentDateTime.split('\n')[1] || '07:42 PM'}
          </span>
        </div>

        {/* Light & Dark Mode Toggle Button */}
        <div className="flex items-center">
          <ThemeToggle />
        </div>

        {/* User Avatar */}
        <div className="relative">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-tr from-[var(--weather-blue)] to-[var(--atmospheric-teal)] text-white font-bold text-sm shadow-sm ring-2 ring-[var(--surface)] cursor-pointer hover:scale-105 transition-transform">
            <User className="h-5 w-5" />
          </div>
          <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-[var(--safe-green)] ring-2 ring-[var(--surface)]" />
        </div>
      </div>
    </header>
  );
};
