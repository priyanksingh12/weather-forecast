'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  ShieldAlert, 
  Map, 
  Globe2, 
  History, 
  Clock, 
  Cpu, 
  FileText, 
  Menu, 
  X, 
  Activity,
  Layers
} from 'lucide-react';
import { ReportModal } from '../reports/ReportModal';
import { DataFreshnessModal } from '../status/DataFreshnessModal';

import { ThemeToggle } from '../theme/ThemeToggle';

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [statusModalOpen, setStatusModalOpen] = useState(false);

  const navItems = [
    { label: 'National View', href: '/', icon: Map },
    { label: '3D Globe', href: '/globe', icon: Globe2 },
    { label: 'History', href: '/history', icon: History },
    { label: 'Similar Events', href: '/similar-events', icon: Layers },
    { label: 'Time Machine', href: '/time-machine', icon: Clock },
    { label: 'Model Validation', href: '/model', icon: Cpu },
    { label: 'Data Status', href: '/status', icon: Activity },
  ];

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-[var(--border)] bg-[var(--background)]/90 backdrop-blur-2xl transition-all">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Logo & Brand + Top-Left Light/Dark Toggle */}
          <div className="flex items-center gap-3 sm:gap-4">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[var(--weather-blue)]/25 to-[var(--ai-indigo)]/35 border border-[var(--weather-blue)]/50 shadow-sm transition-transform group-hover:scale-105">
                <ShieldAlert className="h-6 w-6 text-[var(--weather-blue)]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold tracking-tight text-xl sm:text-2xl text-[var(--text-primary)]">
                    ForecastIQ
                  </span>
                  <span className="rounded-full bg-[var(--weather-blue)]/15 px-2 py-0.5 text-xs font-bold text-[var(--weather-blue)] border border-[var(--weather-blue)]/30">
                    SIH 2026
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-[var(--text-secondary)] font-semibold tracking-wide hidden xs:block">
                  Forecast Reliability Intelligence
                </p>
              </div>
            </Link>

            {/* Top-Left Light & Dark Toggle */}
            <ThemeToggle className="ml-1 sm:ml-2" />
          </div>

          {/* Desktop Navigation Links (Increased font size: text-sm font-semibold) */}
          <nav className="hidden lg:flex items-center gap-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all ${
                    isActive
                      ? 'bg-[var(--weather-blue)]/15 text-[var(--weather-blue)] border border-[var(--weather-blue)]/30 font-bold'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--muted-surface)]'
                  }`}
                >
                  <Icon className="h-4 w-4 text-[var(--weather-blue)]" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Right Controls: Freshness, Cycle, Report Button */}
          <div className="hidden sm:flex items-center gap-4">
            {/* Live Indicator */}
            <button
              onClick={() => setStatusModalOpen(true)}
              className="flex items-center gap-2 rounded-xl border border-[var(--safe-green)]/30 bg-[var(--safe-green)]/15 px-3 py-1.5 text-xs sm:text-sm font-bold text-[var(--safe-green)] hover:bg-[var(--safe-green)]/25 transition-all cursor-pointer shadow-sm"
              title="Click to check data source ingestion health"
            >
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--safe-green)] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[var(--safe-green)]"></span>
              </span>
              <span>Data Live</span>
            </button>

            {/* Cycle Badge */}
            <div className="hidden md:flex flex-col text-right">
              <span className="text-[11px] text-[var(--text-secondary)] uppercase tracking-wider font-bold">Active Run</span>
              <span className="text-xs sm:text-sm font-mono text-[var(--weather-blue)] font-bold">ECMWF 00Z</span>
            </div>

            {/* Generate Report Button */}
            <button
              onClick={() => setReportModalOpen(true)}
              className="flex items-center gap-2 rounded-xl bg-[var(--weather-blue)] px-4 py-2.5 text-xs sm:text-sm font-bold text-white shadow-md hover:brightness-110 active:scale-95 transition-all cursor-pointer"
            >
              <FileText className="h-4 w-4" />
              <span>Generate Report</span>
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex lg:hidden items-center gap-2.5">
            <button
              onClick={() => setReportModalOpen(true)}
              className="p-2 rounded-xl bg-[var(--weather-blue)]/15 text-[var(--weather-blue)] border border-[var(--weather-blue)]/30 sm:hidden"
              title="Generate Report"
            >
              <FileText className="h-5 w-5" />
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2.5 rounded-xl text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--muted-surface)] border border-[var(--border)] transition-colors"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-b border-[var(--border)] bg-[var(--surface)]/98 px-5 pt-3 pb-8 space-y-3 backdrop-blur-2xl animate-in slide-in-from-top duration-200">
            <div className="flex items-center justify-between pb-3.5 border-b border-[var(--border)] pt-1">
              <button
                onClick={() => {
                  setStatusModalOpen(true);
                  setMobileMenuOpen(false);
                }}
                className="flex items-center gap-2 text-sm text-[var(--safe-green)] font-bold"
              >
                <span className="h-2.5 w-2.5 rounded-full bg-[var(--safe-green)]"></span>
                <span>Data Live (ECMWF 00Z)</span>
              </button>
              <button
                onClick={() => {
                  setReportModalOpen(true);
                  setMobileMenuOpen(false);
                }}
                className="text-sm text-[var(--weather-blue)] font-bold"
              >
                Generate Report →
              </button>
            </div>
            <div className="grid grid-cols-1 gap-1.5">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3.5 px-4 py-3 rounded-xl text-base font-semibold transition-all ${
                      isActive
                        ? 'bg-[var(--weather-blue)]/15 text-[var(--weather-blue)] border border-[var(--weather-blue)]/30 font-bold'
                        : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--muted-surface)]'
                    }`}
                  >
                    <Icon className="h-5 w-5 text-[var(--weather-blue)]" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </header>

      {/* Modals */}
      <ReportModal isOpen={reportModalOpen} onClose={() => setReportModalOpen(false)} />
      <DataFreshnessModal isOpen={statusModalOpen} onClose={() => setStatusModalOpen(false)} />
    </>
  );
};
