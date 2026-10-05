import React, { useState, useMemo } from 'react';
import { SORA_HISTORICAL_DATA, calculateCompoundedFromIndex } from '../data/soraData';
import { Calculator, ArrowRight, BookOpen, Check } from 'lucide-react';

export const CustomCompoundingCalculator: React.FC = () => {
  const latestRecord = SORA_HISTORICAL_DATA[SORA_HISTORICAL_DATA.length - 1];
  const ninetyDaysAgoRecord = SORA_HISTORICAL_DATA[Math.max(0, SORA_HISTORICAL_DATA.length - 65)];

  const [startDateStr, setStartDateStr] = useState<string>(ninetyDaysAgoRecord.date);
  const [endDateStr, setEndDateStr] = useState<string>(latestRecord.date);

  // Available dates
  const minDate = SORA_HISTORICAL_DATA[0].date;
  const maxDate = latestRecord.date;

  // Find nearest records
  const startRecord = useMemo(() => {
    return SORA_HISTORICAL_DATA.find((d) => d.date >= startDateStr) || SORA_HISTORICAL_DATA[0];
  }, [startDateStr]);

  const endRecord = useMemo(() => {
    const rev = [...SORA_HISTORICAL_DATA].reverse();
    return rev.find((d) => d.date <= endDateStr) || latestRecord;
  }, [endDateStr, latestRecord]);

  // Calendar days difference
  const calendarDays = useMemo(() => {
    const d1 = new Date(startRecord.date).getTime();
    const d2 = new Date(endRecord.date).getTime();
    const diff = Math.round((d2 - d1) / (1000 * 60 * 60 * 24));
    return Math.max(1, diff);
  }, [startRecord, endRecord]);

  // Compounded rate
  const compoundedRate = useMemo(() => {
    return calculateCompoundedFromIndex(startRecord.soraIndex, endRecord.soraIndex, calendarDays);
  }, [startRecord.soraIndex, endRecord.soraIndex, calendarDays]);

  // Quick Presets
  const applyPreset = (daysBack: number) => {
    const end = new Date(latestRecord.date);
    const start = new Date(end);
    start.setDate(start.getDate() - daysBack);
    setStartDateStr(start.toISOString().split('T')[0]);
    setEndDateStr(latestRecord.date);
  };

  return (
    <div className="space-y-6">
      {/* Intro */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Calculator className="h-5 w-5 text-indigo-400" />
              <span>MAS SORA Index Official Compounding Calculator</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Compute the exact compounded SORA rate across any custom interest period using the official Monetary Authority of Singapore index methodology
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Presets:</span>
            <button
              onClick={() => applyPreset(30)}
              className="rounded border border-slate-700 bg-slate-800/80 px-2.5 py-1 text-xs font-mono text-slate-200 hover:bg-slate-700"
            >
              30 Days (1M)
            </button>
            <button
              onClick={() => applyPreset(90)}
              className="rounded border border-slate-700 bg-slate-800/80 px-2.5 py-1 text-xs font-mono text-slate-200 hover:bg-slate-700"
            >
              90 Days (3M)
            </button>
            <button
              onClick={() => applyPreset(180)}
              className="rounded border border-slate-700 bg-slate-800/80 px-2.5 py-1 text-xs font-mono text-slate-200 hover:bg-slate-700"
            >
              180 Days (6M)
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Date Inputs (5 cols) */}
        <div className="space-y-5 rounded-xl border border-slate-800 bg-slate-900/90 p-5 lg:col-span-5">
          <h3 className="text-sm font-semibold text-white">Calculation Window</h3>

          <div>
            <label className="text-xs text-slate-400">Start Date (Business Day)</label>
            <input
              type="date"
              min={minDate}
              max={endDateStr}
              value={startDateStr}
              onChange={(e) => setStartDateStr(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 p-2.5 font-mono text-sm text-white focus:border-blue-500 focus:outline-none"
            />
            <div className="mt-1.5 flex items-center justify-between text-[11px] text-slate-400 font-mono">
              <span>Actual Date: {startRecord.date}</span>
              <span>Start Index: {startRecord.soraIndex.toFixed(6)}</span>
            </div>
          </div>

          <div>
            <label className="text-xs text-slate-400">End Date (Business Day)</label>
            <input
              type="date"
              min={startDateStr}
              max={maxDate}
              value={endDateStr}
              onChange={(e) => setEndDateStr(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 p-2.5 font-mono text-sm text-white focus:border-blue-500 focus:outline-none"
            />
            <div className="mt-1.5 flex items-center justify-between text-[11px] text-slate-400 font-mono">
              <span>Actual Date: {endRecord.date}</span>
              <span>End Index: {endRecord.soraIndex.toFixed(6)}</span>
            </div>
          </div>

          <div className="rounded-lg border border-slate-800 bg-slate-950/60 p-3 space-y-2 text-xs">
            <div className="flex items-center justify-between text-slate-300">
              <span>Calendar Days ({'d'}):</span>
              <span className="font-mono font-bold text-white">{calendarDays} days</span>
            </div>
            <div className="flex items-center justify-between text-slate-300">
              <span>Start Index ({'Index_start'}):</span>
              <span className="font-mono text-slate-300">{startRecord.soraIndex.toFixed(6)}</span>
            </div>
            <div className="flex items-center justify-between text-slate-300">
              <span>End Index ({'Index_end'}):</span>
              <span className="font-mono text-slate-300">{endRecord.soraIndex.toFixed(6)}</span>
            </div>
          </div>
        </div>

        {/* Results & Mathematical Breakdown (7 cols) */}
        <div className="space-y-5 lg:col-span-7">
          {/* Result Highlight */}
          <div className="rounded-xl border border-indigo-500/40 bg-gradient-to-br from-indigo-950/40 via-slate-900 to-slate-900 p-6 shadow-xl">
            <span className="text-xs font-semibold uppercase tracking-wider text-indigo-300">
              Calculated Compounded SORA Rate
            </span>
            <div className="mt-2 flex items-baseline gap-3">
              <span className="font-mono text-4xl font-extrabold text-white">
                {compoundedRate.toFixed(4)}%
              </span>
              <span className="text-sm text-slate-400">per annum</span>
            </div>
            <p className="mt-2 text-xs text-slate-300">
              For the {calendarDays}-day period from{' '}
              <span className="font-mono font-semibold text-white">{startRecord.date}</span> to{' '}
              <span className="font-mono font-semibold text-white">{endRecord.date}</span>
            </p>
          </div>

          {/* Mathematical Proof & Formula */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-5 space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-blue-400" />
              <span>Official MAS Compounding Formula</span>
            </h4>

            {/* Formula Block */}
            <div className="rounded-lg bg-slate-950 p-4 font-mono text-xs text-blue-300 border border-slate-800/80 overflow-x-auto">
              <p className="text-slate-400 mb-1">// Monetary Authority of Singapore SORA Index Formula:</p>
              <p className="text-sm font-bold text-white">
                Compounded SORA = [ (Index_end / Index_start) - 1 ] × (365 / d) × 100
              </p>
            </div>

            {/* Substitution Step-by-Step */}
            <div className="rounded-lg bg-slate-950/60 p-4 space-y-2 font-mono text-xs border border-slate-800/60">
              <div className="text-slate-400 text-[11px] uppercase tracking-wide">Step-by-Step Substitution:</div>
              <div className="text-slate-300">
                1. Index Ratio = {endRecord.soraIndex.toFixed(6)} / {startRecord.soraIndex.toFixed(6)} ={' '}
                <span className="text-white font-semibold">
                  {(endRecord.soraIndex / startRecord.soraIndex).toFixed(8)}
                </span>
              </div>
              <div className="text-slate-300">
                2. Subtraction (-1) = {(endRecord.soraIndex / startRecord.soraIndex - 1).toFixed(8)}
              </div>
              <div className="text-slate-300">
                3. Annualization Factor = 365 / {calendarDays} ={' '}
                <span className="text-white font-semibold">{(365 / calendarDays).toFixed(6)}</span>
              </div>
              <div className="border-t border-slate-800 pt-1.5 text-emerald-400 font-semibold">
                4. Final Annualized Rate = {compoundedRate.toFixed(4)}% p.a.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
