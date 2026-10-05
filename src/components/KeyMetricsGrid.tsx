import React from 'react';
import { TrendingUp, TrendingDown, Minus, Info } from 'lucide-react';
import { LATEST_SORA, PREVIOUS_SORA } from '../data/soraData';

export const KeyMetricsGrid: React.FC = () => {
  // Calculate day-over-day changes in basis points (1% = 100 bps)
  const calcBps = (curr: number, prev: number) => {
    const diff = (curr - prev) * 100;
    return Math.round(diff * 10) / 10;
  };

  const deltaDaily = calcBps(LATEST_SORA.sora, PREVIOUS_SORA.sora);
  const delta1m = calcBps(LATEST_SORA.sora1m, PREVIOUS_SORA.sora1m);
  const delta3m = calcBps(LATEST_SORA.sora3m, PREVIOUS_SORA.sora3m);
  const delta6m = calcBps(LATEST_SORA.sora6m, PREVIOUS_SORA.sora6m);
  const deltaIndex = Math.round((LATEST_SORA.soraIndex - PREVIOUS_SORA.soraIndex) * 100000) / 100000;

  const renderDelta = (bps: number) => {
    if (bps > 0) {
      return (
        <span className="inline-flex items-center text-rose-400 font-mono text-xs">
          <TrendingUp className="mr-0.5 h-3 w-3" />
          +{bps.toFixed(1)} bps
        </span>
      );
    }
    if (bps < 0) {
      return (
        <span className="inline-flex items-center text-emerald-400 font-mono text-xs">
          <TrendingDown className="mr-0.5 h-3 w-3" />
          {bps.toFixed(1)} bps
        </span>
      );
    }
    return (
      <span className="inline-flex items-center text-slate-400 font-mono text-xs">
        <Minus className="mr-0.5 h-3 w-3" />
        0.0 bps
      </span>
    );
  };

  return (
    <div className="space-y-4">
      {/* Primary Key Metrics */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {/* Daily SORA */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-4 transition-colors hover:border-slate-700">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-medium text-slate-300">Daily SORA</span>
            <span>Overnight</span>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <div className="font-mono text-2xl font-bold tracking-tight text-white lg:text-3xl">
              {LATEST_SORA.sora.toFixed(4)}%
            </div>
            {renderDelta(deltaDaily)}
          </div>
          <div className="mt-2 flex items-center justify-between border-t border-slate-800/80 pt-2 text-[11px] text-slate-400">
            <span>Range: {LATEST_SORA.lowest.toFixed(4)}% – {LATEST_SORA.highest.toFixed(4)}%</span>
            <span>DoD Change</span>
          </div>
        </div>

        {/* 1-Month Compounded SORA */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-4 transition-colors hover:border-slate-700">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-medium text-slate-300">1-Month Compounded</span>
            <span>30-Day Window</span>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <div className="font-mono text-2xl font-bold tracking-tight text-emerald-400 lg:text-3xl">
              {LATEST_SORA.sora1m.toFixed(4)}%
            </div>
            {renderDelta(delta1m)}
          </div>
          <div className="mt-2 flex items-center justify-between border-t border-slate-800/80 pt-2 text-[11px] text-slate-400">
            <span>Corporate / Business loans</span>
            <span>DoD Change</span>
          </div>
        </div>

        {/* 3-Month Compounded SORA (Primary Home Loan Benchmark) */}
        <div className="rounded-xl border border-blue-500/50 bg-gradient-to-br from-blue-950/40 via-slate-900 to-slate-900 p-4 shadow-sm shadow-blue-950/20 ring-1 ring-blue-500/20">
          <div className="flex items-center justify-between text-xs text-slate-300">
            <div className="flex items-center gap-1.5 font-semibold text-blue-300">
              <span>3-Month Compounded</span>
              <span className="rounded bg-blue-500/20 px-1.5 py-0.5 text-[10px] text-blue-300 font-sans uppercase tracking-wider">
                Mortgage Standard
              </span>
            </div>
            <span className="text-[11px] text-slate-400">90-Day Window</span>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <div className="font-mono text-2xl font-bold tracking-tight text-white lg:text-3xl">
              {LATEST_SORA.sora3m.toFixed(4)}%
            </div>
            {renderDelta(delta3m)}
          </div>
          <div className="mt-2 flex items-center justify-between border-t border-slate-800/80 pt-2 text-[11px] text-blue-200/70">
            <span>Primary Singapore Housing Benchmark</span>
            <span>DoD Change</span>
          </div>
        </div>

        {/* 6-Month Compounded SORA */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-4 transition-colors hover:border-slate-700">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-medium text-slate-300">6-Month Compounded</span>
            <span>180-Day Window</span>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <div className="font-mono text-2xl font-bold tracking-tight text-amber-400 lg:text-3xl">
              {LATEST_SORA.sora6m.toFixed(4)}%
            </div>
            {renderDelta(delta6m)}
          </div>
          <div className="mt-2 flex items-center justify-between border-t border-slate-800/80 pt-2 text-[11px] text-slate-400">
            <span>Longer tenor stability</span>
            <span>DoD Change</span>
          </div>
        </div>
      </div>

      {/* Secondary Benchmark Metrics Bar */}
      <div className="grid grid-cols-1 gap-3 rounded-xl border border-slate-800/80 bg-slate-900/50 p-4 md:grid-cols-3">
        {/* SORA Index */}
        <div className="flex flex-col justify-between border-b border-slate-800/60 pb-3 md:border-b-0 md:border-r md:pr-4 md:pb-0">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>SORA Index</span>
            <span className="text-[11px] text-slate-500">Base 100 @ 3 Jan 2020</span>
          </div>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="font-mono text-xl font-semibold text-slate-200">
              {LATEST_SORA.soraIndex.toFixed(6)}
            </span>
            <span className="font-mono text-xs text-emerald-400">
              +{deltaIndex.toFixed(5)}
            </span>
          </div>
          <p className="mt-1 text-[11px] text-slate-400">
            Used for official arbitrary start/end date compounding calculations
          </p>
        </div>

        {/* Aggregate Volume */}
        <div className="flex flex-col justify-between border-b border-slate-800/60 pb-3 md:border-b-0 md:border-r md:pr-4 md:pb-0">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Daily Aggregate Volume</span>
            <span className="text-[11px] text-slate-500">MAS Reporting Banks</span>
          </div>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="font-mono text-xl font-semibold text-slate-200">
              S$ {(LATEST_SORA.volume).toLocaleString()} Million
            </span>
            <span className="text-xs text-slate-400 font-mono">
              ~S$ {(LATEST_SORA.volume / 1000).toFixed(2)}B
            </span>
          </div>
          <p className="mt-1 text-[11px] text-slate-400">
            Transactions executed between 8:00 AM – 6:15 PM SGT
          </p>
        </div>

        {/* 25th - 75th Percentile Corridor */}
        <div className="flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Interquartile Distribution (25th – 75th)</span>
            <span className="text-[11px] text-slate-500">Middle 50% Volume</span>
          </div>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="font-mono text-xl font-semibold text-slate-200">
              {LATEST_SORA.percentile25.toFixed(4)}% – {LATEST_SORA.percentile75.toFixed(4)}%
            </span>
            <span className="text-xs font-mono text-slate-400">
              Spread: {((LATEST_SORA.percentile75 - LATEST_SORA.percentile25) * 100).toFixed(1)} bps
            </span>
          </div>
          <p className="mt-1 text-[11px] text-slate-400">
            Calculation: Volume-Weighted Trimmed Mean methodology
          </p>
        </div>
      </div>
    </div>
  );
};
