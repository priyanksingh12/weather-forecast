import React from 'react';
import { RegionDetailPanel } from '../../../components/reliability/RegionDetailPanel';
import { INDIA_REGIONS } from '../../../lib/geo/indiaGeoJson';
import { WeatherVariable } from '../../../lib/api/types';
import Link from 'next/link';
import { ArrowLeft, MapPin } from 'lucide-react';
import { notFound } from 'next/navigation';

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{
    day?: string;
    var?: string;
    cycle?: string;
    view?: string;
  }>;
}

export default async function RegionPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const query = await searchParams;

  const region = INDIA_REGIONS.find(
    (r) => r.id.toLowerCase() === slug.toLowerCase() || r.name_en.toLowerCase().replace(/\s+/g, '-') === slug.toLowerCase()
  );

  if (!region) {
    notFound();
  }

  const day = Number(query.day) || 7;
  let variable: WeatherVariable = 'rainfall';
  if (query.var === 'tmax' || query.var === 'tmin' || query.var === 'wind' || query.var === 'mslp' || query.var === 'humidity') {
    variable = query.var;
  }

  return (
    <div className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Breadcrumb / Back button */}
      <div className="flex items-center gap-3 text-xs">
        <Link
          href="/"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[var(--border)] bg-[var(--surface)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--muted-surface)] transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>National View</span>
        </Link>
        <span className="text-[var(--text-secondary)]">/</span>
        <span className="text-[var(--text-secondary)]">Regions</span>
        <span className="text-[var(--text-secondary)]">/</span>
        <span className="text-[var(--weather-blue)] font-semibold">{region.name_en}</span>
      </div>

      {/* Region Detail Panel Component */}
      <RegionDetailPanel
        regionId={region.id}
        day={day}
        variable={variable}
        onClose={() => {}}
        onDayChange={() => {}}
        onOpenReportModal={() => {}}
      />
    </div>
  );
}
