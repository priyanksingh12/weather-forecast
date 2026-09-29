'use client';

import React, { useState, useRef, useEffect } from 'react';
import { INDIA_REGIONS } from '../../lib/geo/indiaGeoJson';
import { Search, MapPin, X, ArrowRight } from 'lucide-react';

interface Props {
  onSelectLocation: (regionId: string) => void;
  className?: string;
}

export const LocationSearchBar: React.FC<Props> = ({ onSelectLocation, className = '' }) => {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filtered = query.trim()
    ? INDIA_REGIONS.filter(
        (r) =>
          r.name_en.toLowerCase().includes(query.toLowerCase()) ||
          r.name_hi.includes(query) ||
          r.id.toLowerCase().includes(query.toLowerCase())
      )
    : [];

  const handleSelect = (regionId: string) => {
    onSelectLocation(regionId);
    setQuery('');
    setIsOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && filtered.length > 0) {
      handleSelect(filtered[0].id);
    }
  };

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      {/* Prominent Search Input with Larger Font */}
      <div className="relative flex items-center">
        <div className="absolute left-4.5 pointer-events-none text-[var(--weather-blue)]">
          <Search className="h-5 w-5" />
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder="Search any Indian state or city (e.g. Uttar Pradesh, Delhi, Maharashtra, Gujarat, लखनऊ)..."
          className="w-full rounded-2xl border-2 border-[var(--border)] bg-[var(--surface)]/95 py-3.5 pl-12 pr-10 text-base sm:text-lg text-[var(--text-primary)] font-medium placeholder-[var(--text-secondary)] backdrop-blur-xl shadow-xl focus:border-[var(--weather-blue)] focus:outline-none focus:ring-2 focus:ring-[var(--weather-blue)]/40 transition-all"
        />
        {query && (
          <button
            onClick={() => setQuery('')}
            className="absolute right-4 p-1 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Auto-suggestion Dropdown */}
      {isOpen && query.trim() && (
        <div className="absolute top-full mt-2 w-full z-40 rounded-2xl border border-[var(--border)] bg-[var(--surface)]/98 shadow-2xl overflow-hidden max-h-72 overflow-y-auto backdrop-blur-2xl">
          {filtered.length > 0 ? (
            filtered.map((region) => (
              <button
                key={region.id}
                onClick={() => handleSelect(region.id)}
                className="w-full text-left px-5 py-3.5 hover:bg-[var(--weather-blue)]/15 flex items-center justify-between border-b border-[var(--border)] last:border-none transition-colors group cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <MapPin className="h-4 w-4 text-[var(--weather-blue)] group-hover:scale-110 transition-transform" />
                  <div>
                    <span className="text-base font-bold text-[var(--text-primary)] group-hover:text-[var(--weather-blue)] transition-colors">
                      {region.name_en}
                    </span>
                    {region.name_hi && (
                      <span className="text-xs font-semibold text-[var(--text-secondary)] ml-2">
                        ({region.name_hi})
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs font-mono text-[var(--text-secondary)] group-hover:text-[var(--weather-blue)]">
                  <span>View Reliability & 3D Info</span>
                  <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </button>
            ))
          ) : (
            <div className="px-5 py-4 text-sm text-[var(--text-secondary)] text-center font-medium">
              No Indian region found matching &ldquo;{query}&rdquo;. Try typing &ldquo;Delhi&rdquo;, &ldquo;Gujarat&rdquo;, or &ldquo;Assam&rdquo;.
            </div>
          )}
        </div>
      )}
    </div>
  );
};
