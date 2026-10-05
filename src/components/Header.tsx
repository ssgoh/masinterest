import React, { useState, useEffect } from 'react';
import { Calendar, HelpCircle, Download, Clock } from 'lucide-react';
import { LATEST_SORA } from '../data/soraData';

interface HeaderProps {
  onOpenGuide: () => void;
  onExportCsv: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenGuide,
  onExportCsv,
  activeTab,
  setActiveTab,
}) => {
  const [sgtTime, setSgtTime] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      // Format to Singapore Time (UTC+8)
      const formatted = new Intl.DateTimeFormat('en-SG', {
        timeZone: 'Asia/Singapore',
        weekday: 'short',
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      }).format(now);
      setSgtTime(formatted + ' SGT');
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="border-b border-slate-800 bg-slate-950 text-slate-100">
      {/* Top institution ticker bar */}
      <div className="border-b border-slate-900 bg-slate-900/60 px-4 py-1.5 text-xs text-slate-400">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-300">Monetary Authority of Singapore (MAS)</span>
            <span aria-hidden="true" className="text-slate-600">·</span>
            <span>Financial Benchmark Administrator</span>
            <span aria-hidden="true" className="text-slate-600">·</span>
            <span className="text-emerald-400">Next Fixing: Business Day 09:00 SGT</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 font-mono text-slate-300">
              <Clock className="h-3.5 w-3.5 text-slate-500" />
              <span>{sgtTime || '09:00:00 SGT'}</span>
            </div>
            <span aria-hidden="true" className="text-slate-600">·</span>
            <span className="font-mono text-slate-400">Fixing: {LATEST_SORA.date}</span>
          </div>
        </div>
      </div>

      {/* Main navigation header */}
      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600 font-serif text-lg font-bold text-white shadow-sm">
                S$
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight text-white sm:text-2xl">
                  MAS SORA Tracker
                </h1>
                <p className="text-xs text-slate-400">
                  Singapore Overnight Rate Average · Real-Time Benchmark, Compounded Rates & Mortgage Analytics
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onOpenGuide}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs font-medium text-slate-200 hover:border-slate-600 hover:bg-slate-800 transition-colors"
            >
              <HelpCircle className="h-3.5 w-3.5 text-blue-400" />
              <span>SORA Methodology</span>
            </button>
            <button
              onClick={onExportCsv}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs font-medium text-slate-200 hover:border-slate-600 hover:bg-slate-800 transition-colors"
            >
              <Download className="h-3.5 w-3.5 text-slate-400" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mt-5 flex border-b border-slate-800 gap-1 overflow-x-auto pb-0">
          {[
            { id: 'overview', label: 'Benchmark Overview' },
            { id: 'calculator', label: 'Home Loan & Mortgage Simulator' },
            { id: 'compounding', label: 'MAS Index Compounding Calculator' },
            { id: 'historical', label: 'Historical Fixings' },
            { id: 'alerts', label: 'Rate Watch & Alerts' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`whitespace-nowrap px-4 py-2.5 text-sm font-medium border-b-2 transition-all ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-400 bg-blue-950/20'
                  : 'border-transparent text-slate-400 hover:border-slate-700 hover:text-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>
    </header>
  );
};
