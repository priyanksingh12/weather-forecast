'use client';

import React from 'react';
import { useTheme } from './ThemeProvider';
import { Sun, Moon } from 'lucide-react';

interface Props {
  className?: string;
}

export const ThemeToggle: React.FC<Props> = ({ className = '' }) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
      className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border border-[var(--border)] bg-[var(--surface)] text-[var(--text-primary)] hover:border-[var(--weather-blue)] transition-all cursor-pointer shadow-sm text-xs font-semibold ${className}`}
      title={`Current: ${theme === 'dark' ? 'Dark' : 'Light'} Mode. Click to toggle.`}
    >
      {theme === 'dark' ? (
        <>
          <Sun className="h-4 w-4 text-[#F2C94C] transition-transform rotate-0 scale-100" />
          <span className="hidden sm:inline font-mono">Light</span>
        </>
      ) : (
        <>
          <Moon className="h-4 w-4 text-[var(--weather-blue)] transition-transform rotate-0 scale-100" />
          <span className="hidden sm:inline font-mono">Dark</span>
        </>
      )}
    </button>
  );
};
