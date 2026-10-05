/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Header } from './components/Header';
import { KeyMetricsGrid } from './components/KeyMetricsGrid';
import { InteractiveChart } from './components/InteractiveChart';
import { MortgageCalculator } from './components/MortgageCalculator';
import { CustomCompoundingCalculator } from './components/CustomCompoundingCalculator';
import { HistoricalTable } from './components/HistoricalTable';
import { RateAlerts } from './components/RateAlerts';
import { EducationalModal } from './components/EducationalModal';
import { SORA_HISTORICAL_DATA } from './data/soraData';
import { ExternalLink, ShieldCheck } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [isGuideOpen, setIsGuideOpen] = useState<boolean>(false);

  // CSV Export utility
  const handleExportCsv = () => {
    const headers = [
      'Date',
      'Daily SORA (% p.a.)',
      '1M Compounded SORA (% p.a.)',
      '3M Compounded SORA (% p.a.)',
      '6M Compounded SORA (% p.a.)',
      'SORA Index',
      'Aggregate Volume (SGD Millions)',
      '25th Percentile',
      '75th Percentile',
      'Lowest Transaction',
      'Highest Transaction',
      'Calculation Method',
    ];

    const rows = SORA_HISTORICAL_DATA.map((r) => [
      r.date,
      r.sora.toFixed(4),
      r.sora1m.toFixed(4),
      r.sora3m.toFixed(4),
      r.sora6m.toFixed(4),
      r.soraIndex.toFixed(6),
      r.volume,
      r.percentile25.toFixed(4),
      r.percentile75.toFixed(4),
      r.lowest.toFixed(4),
      r.highest.toFixed(4),
      `"${r.calculationMethod}"`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `mas_sora_historical_series_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-slate-950 font-sans text-slate-100 antialiased selection:bg-blue-600 selection:text-white">
      {/* Institutional Top Header */}
      <Header
        onOpenGuide={() => setIsGuideOpen(true)}
        onExportCsv={handleExportCsv}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* Main Content Container */}
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 space-y-6">
        {/* Render Tab Contents */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <KeyMetricsGrid />
            <InteractiveChart data={SORA_HISTORICAL_DATA} />
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-white">Singapore Mortgage Market Pulse</h3>
                  <button
                    onClick={() => setActiveTab('calculator')}
                    className="text-xs text-blue-400 hover:text-blue-300"
                  >
                    Open Full Simulator →
                  </button>
                </div>
                <p className="mt-2 text-xs text-slate-300">
                  Most Singapore residential mortgage packages (DBS, OCBC, UOB) are currently priced around{' '}
                  <span className="font-semibold text-white">3M Compounded SORA + 0.60% to 0.70%</span> spread.
                  With 3M SORA at <span className="font-mono text-blue-300">{SORA_HISTORICAL_DATA[SORA_HISTORICAL_DATA.length - 1].sora3m.toFixed(4)}%</span>,
                  effective floating rates hover around{' '}
                  <span className="font-mono text-emerald-400 font-semibold">
                    {(SORA_HISTORICAL_DATA[SORA_HISTORICAL_DATA.length - 1].sora3m + 0.65).toFixed(2)}% p.a.
                  </span>
                </p>
                <div className="mt-4 flex items-center gap-3">
                  <button
                    onClick={() => setActiveTab('calculator')}
                    className="rounded-lg bg-blue-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-blue-500 transition-colors"
                  >
                    Calculate Monthly Installment
                  </button>
                  <button
                    onClick={() => setIsGuideOpen(true)}
                    className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-200 hover:bg-slate-700 transition-colors"
                  >
                    Learn SORA Mechanics
                  </button>
                </div>
              </div>

              <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-white">MAS Benchmark Administration</h3>
                  <a
                    href="https://www.mas.gov.sg/bonds-and-bills/sora"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-xs text-slate-400 hover:text-white"
                  >
                    <span>Official Portal</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
                <p className="mt-2 text-xs text-slate-300">
                  SORA complies with IOSCO Principles for Financial Benchmarks. It reflects actual transactions with an average daily volume exceeding S$3.5 Billion across reporting Singapore banks.
                </p>
                <div className="mt-4 flex items-center gap-2 text-xs text-emerald-400">
                  <ShieldCheck className="h-4 w-4" />
                  <span>Volume-Weighted Trimmed Mean Methodology Active</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'calculator' && <MortgageCalculator />}

        {activeTab === 'compounding' && <CustomCompoundingCalculator />}

        {activeTab === 'historical' && (
          <HistoricalTable
            records={SORA_HISTORICAL_DATA}
            onExportCsv={handleExportCsv}
          />
        )}

        {activeTab === 'alerts' && <RateAlerts />}
      </main>

      {/* Educational Guide Modal */}
      <EducationalModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
      />

      {/* Footer */}
      <footer className="mt-12 border-t border-slate-900 bg-slate-950 py-6 text-xs text-slate-500">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 sm:flex-row sm:px-6">
          <div className="flex items-center gap-2">
            <span>MAS SORA Tracker</span>
            <span aria-hidden="true">·</span>
            <span>Data reference: Monetary Authority of Singapore</span>
            <span aria-hidden="true">·</span>
            <span>SGD Overnight Benchmark</span>
          </div>
          <div>
            <span>For financial reference and informational purposes only</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
