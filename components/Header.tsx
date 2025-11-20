
import React from 'react';
import { Activity, Play, RefreshCw, Sun, Moon, Clock } from 'lucide-react';

interface HeaderProps {
  onCheckAll: () => void;
  isChecking: boolean;
  lastChecked: number | null;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  refreshInterval: number;
  setRefreshInterval: (ms: number) => void;
}

const INTERVAL_OPTIONS = [
  { label: 'Manual', value: 0 },
  { label: '10s', value: 10000 },
  { label: '30s', value: 30000 },
  { label: '1m', value: 60000 },
  { label: '5m', value: 300000 },
];

export const Header: React.FC<HeaderProps> = ({ 
  onCheckAll, 
  isChecking, 
  lastChecked, 
  theme, 
  toggleTheme,
  refreshInterval,
  setRefreshInterval
}) => {
  return (
    <header className="w-full py-4 px-4 md:px-0 border-b border-border bg-background/80 sticky top-0 z-50 backdrop-blur-xl transition-colors duration-300">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
        
        {/* Logo Section */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/30 blur-lg rounded-full"></div>
              <div className="relative p-2 bg-surface rounded-xl border border-border shadow-sm text-primary">
                <Activity className="w-6 h-6" />
              </div>
            </div>
            <div>
              <h1 className="text-xl font-bold text-text tracking-tight flex items-center gap-2">
                TongLeMa
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
              </h1>
              <p className="text-xs text-muted font-medium">Network Connectivity Monitor</p>
            </div>
          </div>

          {/* Mobile Theme Toggle (Visible only on small screens) */}
          <button
            onClick={toggleTheme}
            className="md:hidden p-2 rounded-lg bg-surface border border-border text-text hover:bg-muted/10"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>

        {/* Controls Section */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-end">
          
          {/* Auto Refresh Dropdown */}
          <div className="relative group flex items-center">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-muted">
              <Clock className="w-3.5 h-3.5" />
            </div>
            <select
              value={refreshInterval}
              onChange={(e) => setRefreshInterval(Number(e.target.value))}
              className="appearance-none pl-9 pr-8 py-2 bg-surface border border-border text-text text-xs font-medium rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all hover:bg-muted/5 cursor-pointer min-w-[100px]"
            >
              {INTERVAL_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-muted">
              <svg className="w-2 h-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
            </div>
          </div>

          {/* Desktop Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="hidden md:flex p-2 rounded-lg bg-surface border border-border text-muted hover:text-text hover:bg-muted/10 transition-colors"
            aria-label="Toggle Theme"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
          
          {/* Check Button */}
          <button
            onClick={onCheckAll}
            disabled={isChecking}
            className={`
              flex items-center gap-2 px-5 py-2 rounded-lg font-medium text-xs transition-all shadow-sm whitespace-nowrap
              ${isChecking 
                ? 'bg-surface text-muted cursor-not-allowed border border-border' 
                : 'bg-primary hover:bg-primary/90 text-white shadow-[0_0_15px_-3px_rgba(59,130,246,0.4)]'
              }
            `}
          >
            {isChecking ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                Scanning
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                Check Now
              </>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
