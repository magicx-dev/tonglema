
import React, { useState, useCallback, useEffect } from 'react';
import { Header } from './components/Header';
import { StatusCard } from './components/StatusCard';
import { SITES } from './constants';
import { checkConnectivity } from './services/networkService';
import { CheckResult, ConnectivityStatus, CheckResultMap, SiteConfig } from './types';
import { Shield, Globe2, Info, Layers } from 'lucide-react';

export default function App() {
  const [results, setResults] = useState<CheckResultMap>({});
  const [isChecking, setIsChecking] = useState(false);
  const [lastChecked, setLastChecked] = useState<number | null>(null);
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [refreshInterval, setRefreshInterval] = useState<number>(0); // 0 = off

  // Theme toggle handler
  const toggleTheme = useCallback(() => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', newTheme);
  }, [theme]);

  // Initialize theme
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme) {
      setTheme(savedTheme);
      if (savedTheme === 'dark') document.documentElement.classList.add('dark');
      else document.documentElement.classList.remove('dark');
    } else if (systemPrefersDark) {
      setTheme('dark');
      document.documentElement.classList.add('dark');
    } else {
      setTheme('light');
      document.documentElement.classList.remove('dark');
    }
  }, []);

  // Function to check a single site
  const handleCheckSite = useCallback(async (id: string, url: string) => {
    setResults(prev => ({
      ...prev,
      [id]: {
        siteId: id,
        status: ConnectivityStatus.PENDING,
        latency: 0,
        timestamp: Date.now()
      }
    }));

    const result = await checkConnectivity(id, url);
    
    setResults(prev => ({
      ...prev,
      [id]: result
    }));
  }, []);

  // Function to check all sites
  const handleCheckAll = useCallback(async () => {
    // If we are already strictly checking manually, maybe we don't block, 
    // but for simplicity let's prevent overlaps
    if (isChecking) return;
    
    setIsChecking(true);
    setLastChecked(Date.now());

    // NOTE: We do NOT reset all to PENDING here if we want a smoother auto-refresh experience.
    // We only want visual updates when new data comes in.
    // But for manual "Check Now", user might expect a reset. 
    // Let's assume we keep existing state and just update status to PENDING locally per item effectively
    // or just let the UI show loading spinner based on internal state if needed.
    // For this app, showing "Pinging..." in the card (handled by StatusCard status) is good.
    
    // To avoid "flashing" the whole UI to grey, we can iterate and set status to PENDING 
    // only if we want that visual feedback. 
    // Let's update the statuses to PENDING to show activity.
    setResults(prev => {
      const next = { ...prev };
      SITES.forEach(site => {
        next[site.id] = {
          ...(next[site.id] || { latency: 0 }),
          siteId: site.id,
          status: ConnectivityStatus.PENDING,
          timestamp: Date.now()
        };
      });
      return next;
    });

    // Execute in batches
    const batchSize = 6; // Increased batch size
    for (let i = 0; i < SITES.length; i += batchSize) {
      const batch = SITES.slice(i, i + batchSize);
      const promises = batch.map(site => checkConnectivity(site.id, site.url));
      const batchResults = await Promise.all(promises);
      
      setResults(prev => {
        const next = { ...prev };
        batchResults.forEach(res => {
          next[res.siteId] = res;
        });
        return next;
      });
    }

    setIsChecking(false);
  }, [isChecking]);

  // Auto Refresh Effect
  useEffect(() => {
    if (refreshInterval === 0) return;

    const id = setInterval(() => {
      // We need to bypass the `isChecking` check inside handleCheckAll partially 
      // or ensure handleCheckAll is stable. 
      // If `isChecking` is true, the interval callback will just return, which is fine.
      handleCheckAll();
    }, refreshInterval);

    return () => clearInterval(id);
  }, [refreshInterval, handleCheckAll]);

  // Run check on mount
  useEffect(() => {
    handleCheckAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Calculate overview stats
  const stats = Object.values(results).reduce<{ online: number; offline: number; avgLatency: number; count: number }>((acc, curr) => {
    if (curr.status === ConnectivityStatus.SUCCESS) acc.online++;
    if (curr.status === ConnectivityStatus.ERROR || curr.status === ConnectivityStatus.TIMEOUT) acc.offline++;
    if (curr.latency > 0) {
      acc.avgLatency += curr.latency;
      acc.count++;
    }
    return acc;
  }, { online: 0, offline: 0, avgLatency: 0, count: 0 });
  
  const avgLatency = stats.count > 0 ? Math.round(stats.avgLatency / stats.count) : 0;

  // Group sites by category
  const groupedSites = SITES.reduce<Record<string, SiteConfig[]>>((acc, site) => {
    if (!acc[site.category]) acc[site.category] = [];
    acc[site.category].push(site);
    return acc;
  }, {});

  // Define category order
  const categoryOrder = ['AI', 'Search', 'Social', 'Media', 'Dev'];

  return (
    <div className="min-h-screen bg-background text-text flex flex-col transition-colors duration-500">
      <Header 
        onCheckAll={handleCheckAll} 
        isChecking={isChecking} 
        lastChecked={lastChecked}
        theme={theme}
        toggleTheme={toggleTheme}
        refreshInterval={refreshInterval}
        setRefreshInterval={setRefreshInterval}
      />

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 py-8 space-y-10">
        
        {/* Overview Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-surface/50 backdrop-blur-sm border border-border rounded-2xl p-6 flex items-center gap-5 shadow-sm hover:shadow-md transition-shadow">
             <div className="p-3.5 rounded-xl bg-green-500/10 text-green-600 dark:text-green-400 ring-1 ring-green-500/20">
               <Shield className="w-7 h-7" />
             </div>
             <div>
               <p className="text-sm font-medium text-muted uppercase tracking-wider">Services Online</p>
               <div className="flex items-baseline gap-2">
                 <p className="text-3xl font-bold text-text">{stats.online}</p>
                 <span className="text-muted text-sm">/ {SITES.length}</span>
               </div>
             </div>
          </div>
          <div className="bg-surface/50 backdrop-blur-sm border border-border rounded-2xl p-6 flex items-center gap-5 shadow-sm hover:shadow-md transition-shadow">
             <div className="p-3.5 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 ring-1 ring-blue-500/20">
               <Globe2 className="w-7 h-7" />
             </div>
             <div>
               <p className="text-sm font-medium text-muted uppercase tracking-wider">Avg. Latency</p>
               <div className="flex items-baseline gap-2">
                 <p className="text-3xl font-bold text-text">{avgLatency}</p>
                 <span className="text-sm font-medium text-muted">ms</span>
               </div>
             </div>
          </div>
          <div className="bg-surface/50 backdrop-blur-sm border border-border rounded-2xl p-6 flex items-center gap-5 shadow-sm hover:shadow-md transition-shadow">
             <div className="p-3.5 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 ring-1 ring-purple-500/20">
               <Info className="w-7 h-7" />
             </div>
             <div>
               <p className="text-sm font-medium text-muted uppercase tracking-wider">Network Mode</p>
               <div className="flex items-baseline gap-2">
                 <p className="text-lg font-bold text-text">Browser Proxy</p>
               </div>
             </div>
          </div>
        </div>

        {/* Grouped Sections */}
        <div className="space-y-10">
          {categoryOrder.map(category => {
            const categorySites = groupedSites[category];
            if (!categorySites) return null;

            return (
              <div key={category} className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="flex items-center gap-3 mb-5">
                  <h2 className="text-lg font-bold text-text flex items-center gap-2 bg-surface/50 px-3 py-1 rounded-lg border border-border/50 backdrop-blur-sm">
                    {category === 'AI' && <Layers className="w-4 h-4 text-primary" />}
                    {category}
                  </h2>
                  <div className="h-px flex-1 bg-gradient-to-r from-border to-transparent"></div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                  {categorySites.map((site) => (
                    <StatusCard
                      key={site.id}
                      site={site}
                      result={results[site.id]}
                      onCheck={handleCheckSite}
                    />
                  ))}
                </div>
              </div>
            );
          })}
          
          {/* Render any categories not in the explicit order list */}
          {Object.keys(groupedSites).filter(cat => !categoryOrder.includes(cat)).map(category => (
             <div key={category} className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="flex items-center gap-3 mb-5">
                   <h2 className="text-lg font-bold text-text flex items-center gap-2 bg-surface/50 px-3 py-1 rounded-lg border border-border/50 backdrop-blur-sm">
                    {category}
                  </h2>
                  <div className="h-px flex-1 bg-gradient-to-r from-border to-transparent"></div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                  {groupedSites[category].map((site) => (
                    <StatusCard
                      key={site.id}
                      site={site}
                      result={results[site.id]}
                      onCheck={handleCheckSite}
                    />
                  ))}
                </div>
             </div>
          ))}
        </div>

      </main>

      <footer className="py-10 border-t border-border mt-auto bg-surface/30 backdrop-blur-lg">
        <div className="max-w-7xl mx-auto px-4 text-center space-y-2">
          <p className="text-sm font-medium text-text">© {new Date().getFullYear()} TongLeMa</p>
          <p className="text-xs text-muted max-w-md mx-auto leading-relaxed">
            Real-time connectivity dashboard. Checks are performed directly from your browser via encrypted HEAD requests. 
            Latency times may include browser processing overhead.
          </p>
        </div>
      </footer>
    </div>
  );
}
