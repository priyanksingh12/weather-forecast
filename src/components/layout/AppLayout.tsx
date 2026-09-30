'use client';

import React, { useState, createContext, useContext } from 'react';
import { Sidebar } from './Sidebar';
import { TopHeader } from './TopHeader';
import { ReportModal } from '../reports/ReportModal';
import { DataFreshnessModal } from '../status/DataFreshnessModal';
import { getRegionalData } from '../../lib/data/regionalIntelligence';
import { getRegionalAlerts } from '../../lib/data/alertIntelligence';

interface AppLayoutContextType {
  selectedRegion: string;
  setSelectedRegion: (slug: string) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  openReportModal: () => void;
  openStatusModal: () => void;
}

const AppLayoutContext = createContext<AppLayoutContextType>({
  selectedRegion: 'lucknow',
  setSelectedRegion: () => {},
  activeTab: 'dashboard',
  setActiveTab: () => {},
  openReportModal: () => {},
  openStatusModal: () => {},
});

export const useAppLayout = () => useContext(AppLayoutContext);

export const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedRegion, setSelectedRegion] = useState('lucknow');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [statusModalOpen, setStatusModalOpen] = useState(false);

  // Compute dynamic state-specific alert count
  const currentRegionData = getRegionalData(selectedRegion);
  const activeAlerts = getRegionalAlerts(currentRegionData);
  const alertCount = activeAlerts.length;

  return (
    <AppLayoutContext.Provider
      value={{
        selectedRegion,
        setSelectedRegion,
        activeTab,
        setActiveTab,
        openReportModal: () => setReportModalOpen(true),
        openStatusModal: () => setStatusModalOpen(true),
      }}
    >
      <div className="min-h-screen flex bg-[var(--background)] text-[var(--text-primary)] transition-colors duration-200">
        {/* 1. Sleek Left Sidebar: Pure Flex Child (NO overlapping content) */}
        <Sidebar
          activeTab={activeTab}
          onTabChange={(tab) => {
            setActiveTab(tab);
            if (tab === 'reports') {
              setReportModalOpen(true);
            }
          }}
          mobileOpen={mobileMenuOpen}
          onMobileClose={() => setMobileMenuOpen(false)}
          onOpenReportModal={() => setReportModalOpen(true)}
          alertCount={alertCount}
        />

        {/* 2. Main Content Canvas: Fills remaining width perfectly */}
        <div className="flex-1 flex flex-col min-w-0 transition-all">
          {/* Top Header matching reference images */}
          <TopHeader
            selectedRegion={selectedRegion}
            onSelectRegion={setSelectedRegion}
            onMobileMenuToggle={() => setMobileMenuOpen(true)}
          />

          {/* Dynamic Page Content */}
          <main className="flex-1 w-full pb-16">
            {children}
          </main>
        </div>

        {/* Global Modals */}
        <ReportModal
          isOpen={reportModalOpen}
          onClose={() => setReportModalOpen(false)}
          defaultRegion={selectedRegion}
          defaultDay={1}
          defaultVariable="rainfall"
        />

        <DataFreshnessModal
          isOpen={statusModalOpen}
          onClose={() => setStatusModalOpen(false)}
        />
      </div>
    </AppLayoutContext.Provider>
  );
};
