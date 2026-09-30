'use client';

import React from 'react';
import { useAppLayout } from '../components/layout/AppLayout';
import { CloudSenseDashboard } from '../components/dashboard/CloudSenseDashboard';

export default function HomePage() {
  const { selectedRegion, setSelectedRegion, activeTab, setActiveTab, openReportModal } = useAppLayout();

  return (
    <CloudSenseDashboard
      selectedRegionSlug={selectedRegion}
      onSelectRegion={setSelectedRegion}
      activeViewTab={activeTab}
      onNavigateTab={setActiveTab}
      onOpenReportModal={openReportModal}
    />
  );
}
