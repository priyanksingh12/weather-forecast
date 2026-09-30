'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutGrid, 
  Disc, 
  Calendar, 
  Activity, 
  BarChart3, 
  MapPin, 
  Bell, 
  FileText, 
  Settings, 
  HelpCircle,
  ArrowRight,
  X,
  Cloud,
  Sparkles
} from 'lucide-react';

interface SidebarProps {
  activeTab?: string;
  onTabChange?: (tab: string) => void;
  mobileOpen?: boolean;
  onMobileClose?: () => void;
  onOpenReportModal?: () => void;
  alertCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab = 'dashboard',
  onTabChange,
  mobileOpen = false,
  onMobileClose,
  onOpenReportModal,
  alertCount,
}) => {
  const pathname = usePathname();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutGrid },
    { id: 'radar', label: '3D Visualization', icon: Sparkles },
    { id: 'forecast', label: 'Forecast', icon: Calendar },
    { id: 'burst', label: 'Burst Detection', icon: Activity },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'locations', label: 'Locations', icon: MapPin },
    { id: 'alerts', label: 'Alerts', icon: Bell, badge: alertCount !== undefined ? alertCount : undefined },
    { id: 'reports', label: 'Reports', icon: FileText, isAction: true },
  ];

  const handleNavClick = (item: typeof navItems[0], e: React.MouseEvent) => {
    e.preventDefault();
    if (item.isAction && onOpenReportModal) {
      onOpenReportModal();
      if (onMobileClose) onMobileClose();
      return;
    }

    if (onTabChange) {
      onTabChange(item.id);
    }
    if (onMobileClose) {
      onMobileClose();
    }
  };

  const renderNavContent = () => (
    <div className="flex flex-col justify-between h-full space-y-6">
      <div className="space-y-6">
        {/* Logo and Platform Brand */}
        <div className="flex items-center justify-between">
          <div 
            onClick={() => onTabChange && onTabChange('dashboard')}
            className="flex items-center gap-3 cursor-pointer group select-none"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-[var(--weather-blue)] to-[var(--atmospheric-teal)] text-white shadow-sm transition-transform group-hover:scale-105">
              <Cloud className="h-5 w-5 fill-white/20 stroke-[2.2]" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-black tracking-tight text-[var(--text-primary)] leading-none">
                CloudSense
              </span>
              <span className="text-[11px] font-medium text-[var(--text-secondary)] mt-0.5 tracking-wide">
                Burst Detection Platform
              </span>
            </div>
          </div>

          {/* Close button on mobile */}
          {onMobileClose && (
            <button
              onClick={onMobileClose}
              className="lg:hidden p-1.5 rounded-xl text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--muted-surface)] transition-colors"
              aria-label="Close menu"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Navigation Links */}
        <nav className="space-y-1.5 pt-1" aria-label="Main Navigation">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={(e) => handleNavClick(item, e)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-sm font-semibold transition-all cursor-pointer select-none text-left ${
                  isActive
                    ? 'bg-[var(--weather-blue)]/15 text-[var(--weather-blue)] font-bold shadow-xs'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--muted-surface)]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`h-4.5 w-4.5 shrink-0 ${isActive ? 'text-[var(--weather-blue)]' : 'text-[var(--text-secondary)]'}`} />
                  <span>{item.label}</span>
                </div>

                {item.badge && (
                  <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[var(--risk-extreme)] px-1.5 text-[11px] font-bold text-white shadow-xs">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Area: Promo Card + Settings & Help */}
      <div className="space-y-4 pt-4 border-t border-[var(--border)]">
        {/* Promo Card: "Smarter Forecasts, Safer Communities" */}
        <div className="relative overflow-hidden rounded-2xl p-4 bg-gradient-to-br from-[#1b3d48] to-[#0d2229] text-white shadow-md group">
          <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_top_right,var(--weather-blue),transparent_70%)]" />
          
          <div className="relative z-10 flex flex-col justify-between min-h-[96px]">
            <div>
              <p className="text-sm font-bold leading-snug tracking-tight text-white/95">
                Smarter Forecasts<br />Safer Communities
              </p>
              <p className="text-[11px] text-white/70 mt-1">
                AI-powered bust detection
              </p>
            </div>

            <div className="flex justify-end mt-2">
              <button
                onClick={() => onTabChange && onTabChange('burst')}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 hover:bg-white text-white hover:text-[#18343D] backdrop-blur-sm transition-all shadow-xs group-hover:scale-105 cursor-pointer"
                title="Explore AI bust detection"
                aria-label="Explore AI model"
              >
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Settings & Help */}
        <div className="space-y-1">
          <button
            onClick={() => onTabChange && onTabChange('settings')}
            className={`w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer text-left ${
              activeTab === 'settings'
                ? 'bg-[var(--weather-blue)]/15 text-[var(--weather-blue)] font-bold'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--muted-surface)]'
            }`}
          >
            <Settings className="h-4.5 w-4.5 shrink-0" />
            <span>Settings</span>
          </button>

          <button
            onClick={() => onTabChange && onTabChange('help')}
            className={`w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer text-left ${
              activeTab === 'help'
                ? 'bg-[var(--weather-blue)]/15 text-[var(--weather-blue)] font-bold'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--muted-surface)]'
            }`}
          >
            <HelpCircle className="h-4.5 w-4.5 shrink-0" />
            <span>Help & Docs</span>
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* 1. Desktop Sidebar: Natural Flex Child (Takes up exact 256px, NO OVERLAP EVER) */}
      <aside className="hidden lg:flex flex-col shrink-0 w-64 sticky top-0 h-screen p-5 border-r border-[var(--border)] bg-[var(--surface)] overflow-y-auto no-scrollbar z-30 select-none">
        {renderNavContent()}
      </aside>

      {/* 2. Mobile Drawer Overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div 
            onClick={onMobileClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
            aria-hidden="true"
          />
          <aside className="relative z-10 w-72 max-w-[85vw] h-full p-5 bg-[var(--surface)] border-r border-[var(--border)] shadow-2xl flex flex-col justify-between overflow-y-auto animate-in slide-in-from-left duration-200">
            {renderNavContent()}
          </aside>
        </div>
      )}
    </>
  );
};
