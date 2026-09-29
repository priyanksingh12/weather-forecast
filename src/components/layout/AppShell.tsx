'use client';

import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { TopHeader } from './TopHeader';
import { ReportModal } from '../reports/ReportModal';

interface AppShellProps {
  children: (props: {
    selectedRegion: string;
    setSelectedRegion: (slug: string) => void;
    activeTab: string;
    setActiveTab: (tab: string) => void;
    openReportModal: () => void;
  }) => React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({ children }) => {
  const [selectedRegion, setSelectedRegion] = useState('lucknow');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);

  return (
    <div className="min-h-screen flex bg-[var(--background)] text-[var(--text-primary)] transition-colors duration-200">
      {/* 1. Sleek Left Sidebar (Un-congested navigation) */}
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
      />

      {/* 2. Main Content Canvas (offset by sidebar width on lg+ screens) */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64 transition-all">
        {/* Top Header Bar matching reference image */}
        <TopHeader
          selectedRegion={selectedRegion}
          onSelectRegion={setSelectedRegion}
          onMobileMenuToggle={() => setMobileMenuOpen(true)}
        />

        {/* Dynamic Page Content */}
        <main className="flex-1 w-full pb-16">
          {children({
            selectedRegion,
            setSelectedRegion,
            activeTab,
            setActiveTab,
            openReportModal: () => setReportModalOpen(true),
          })}
        </main>
      </div>

      {/* PDF Report Generation Modal */}
      <ReportModal
        isOpen={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
        defaultRegion={selectedRegion}
        defaultDay={1}
        defaultVariable="rainfall"
      />
    </div>
  );
};
