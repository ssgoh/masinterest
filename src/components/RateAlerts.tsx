import React, { useState, useEffect } from 'react';
import { RateAlert, TenorKey } from '../types/sora';
import { LATEST_SORA, TENOR_CONFIGS } from '../data/soraData';
import { Bell, Plus, Trash2, CheckCircle, AlertTriangle } from 'lucide-react';

const STORAGE_KEY = 'mas_sora_alerts_v1';

const DEFAULT_ALERTS: RateAlert[] = [
  {
    id: 'default_1',
    tenor: 'sora3m',
    condition: 'BELOW',
    targetRate: 3.20,
    createdAt: '2026-10-01',
    triggered: false,
  },
  {
    id: 'default_2',
    tenor: 'sora3m',
    condition: 'ABOVE',
    targetRate: 3.50,
    createdAt: '2026-10-01',
    triggered: false,
  },
  {
    id: 'default_3',
    tenor: 'sora',
    condition: 'ABOVE',
    targetRate: 3.40,
    createdAt: '2026-10-01',
    triggered: false,
  },
];

export const RateAlerts: React.FC = () => {
  const [alerts, setAlerts] = useState<RateAlert[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return DEFAULT_ALERTS;
  });

  const [newTenor, setNewTenor] = useState<TenorKey>('sora3m');
  const [newCondition, setNewCondition] = useState<'ABOVE' | 'BELOW'>('BELOW');
  const [newTargetRate, setNewTargetRate] = useState<number>(3.15);

  // Sync to local storage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(alerts));
    } catch {
      // ignore
    }
  }, [alerts]);

  // Evaluate alerts against LATEST_SORA
  const evaluatedAlerts = alerts.map((alert) => {
    const currentRate = LATEST_SORA[alert.tenor];
    const isTriggered =
      alert.condition === 'ABOVE'
        ? currentRate >= alert.targetRate
        : currentRate <= alert.targetRate;
    return { ...alert, triggered: isTriggered, currentRate };
  });

  const handleAddAlert = (e: React.FormEvent) => {
    e.preventDefault();
    const newAlert: RateAlert = {
      id: 'alert_' + Date.now(),
      tenor: newTenor,
      condition: newCondition,
      targetRate: Math.round(newTargetRate * 10000) / 10000,
      createdAt: new Date().toISOString().split('T')[0],
      triggered: false,
    };
    setAlerts([newAlert, ...alerts]);
  };

  const handleDeleteAlert = (id: string) => {
    setAlerts(alerts.filter((a) => a.id !== id));
  };

  return (
    <div className="space-y-6">
      {/* Intro */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Bell className="h-5 w-5 text-amber-400" />
              <span>SORA Benchmark Threshold Watch & Alerts</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Configure interest rate thresholds to monitor when mortgage benchmarks cross refinancing or repricing targets
            </p>
          </div>
          <div className="text-xs font-mono text-slate-400 bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700">
            Active Watchlist: {alerts.length} Rules
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Create Alert Form (4 cols) */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-5 lg:col-span-4 space-y-4">
          <h3 className="text-sm font-semibold text-white">Create New Alert Rule</h3>
          <form onSubmit={handleAddAlert} className="space-y-4">
            <div>
              <label className="text-xs text-slate-400">Target Benchmark</label>
              <select
                value={newTenor}
                onChange={(e) => setNewTenor(e.target.value as TenorKey)}
                className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 p-2 text-xs text-white"
              >
                <option value="sora">Daily SORA ({LATEST_SORA.sora.toFixed(4)}%)</option>
                <option value="sora1m">1-Month Compounded ({LATEST_SORA.sora1m.toFixed(4)}%)</option>
                <option value="sora3m">3-Month Compounded ({LATEST_SORA.sora3m.toFixed(4)}%)</option>
                <option value="sora6m">6-Month Compounded ({LATEST_SORA.sora6m.toFixed(4)}%)</option>
              </select>
            </div>

            <div>
              <label className="text-xs text-slate-400">Trigger Condition</label>
              <div className="mt-1 grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setNewCondition('BELOW')}
                  className={`rounded-lg border p-2 text-xs font-medium transition-colors ${
                    newCondition === 'BELOW'
                      ? 'border-emerald-500 bg-emerald-950/40 text-emerald-300'
                      : 'border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  Drops Below (≤)
                </button>
                <button
                  type="button"
                  onClick={() => setNewCondition('ABOVE')}
                  className={`rounded-lg border p-2 text-xs font-medium transition-colors ${
                    newCondition === 'ABOVE'
                      ? 'border-rose-500 bg-rose-950/40 text-rose-300'
                      : 'border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  Rises Above (≥)
                </button>
              </div>
            </div>

            <div>
              <label className="text-xs text-slate-400">Target Rate (% p.a.)</label>
              <div className="mt-1 flex items-center rounded-lg border border-slate-700 bg-slate-950 px-3 py-2">
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="10"
                  value={newTargetRate}
                  onChange={(e) => setNewTargetRate(Number(e.target.value))}
                  className="w-full bg-transparent font-mono text-sm text-white focus:outline-none"
                  required
                />
                <span className="font-mono text-xs text-slate-500">%</span>
              </div>
            </div>

            <button
              type="submit"
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-blue-500 transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span>Add Watch Rule</span>
            </button>
          </form>
        </div>

        {/* Alert Cards (8 cols) */}
        <div className="space-y-3 lg:col-span-8">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Configured Watch Rules ({evaluatedAlerts.length})</span>
            <span>Evaluated against latest fixing ({LATEST_SORA.date})</span>
          </div>

          <div className="space-y-3">
            {evaluatedAlerts.map((alert) => {
              const cfg = TENOR_CONFIGS[alert.tenor];
              return (
                <div
                  key={alert.id}
                  className={`flex flex-col gap-3 rounded-xl border p-4 sm:flex-row sm:items-center sm:justify-between transition-colors ${
                    alert.triggered
                      ? 'border-amber-500/50 bg-amber-950/20'
                      : 'border-slate-800 bg-slate-900/60'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span
                        className="h-2 w-2 rounded-full"
                        style={{ backgroundColor: cfg.color }}
                      />
                      <span className="text-sm font-semibold text-white">{cfg.label}</span>
                      <span className="text-xs text-slate-400 font-mono">
                        ({alert.condition === 'BELOW' ? '≤' : '≥'} {alert.targetRate.toFixed(2)}%)
                      </span>
                    </div>

                    <div className="text-xs text-slate-400 font-mono">
                      Current Rate:{' '}
                      <span className="font-bold text-slate-200">
                        {alert.currentRate.toFixed(4)}%
                      </span>{' '}
                      · Target:{' '}
                      <span className="font-bold text-slate-300">
                        {alert.targetRate.toFixed(2)}%
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {alert.triggered ? (
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-md border border-amber-500/30">
                        <AlertTriangle className="h-3.5 w-3.5" />
                        <span>Threshold Reached</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 text-xs text-slate-400 bg-slate-800/80 px-2.5 py-1 rounded-md border border-slate-700/60">
                        <CheckCircle className="h-3.5 w-3.5 text-slate-500" />
                        <span>Monitoring</span>
                      </div>
                    )}

                    <button
                      onClick={() => handleDeleteAlert(alert.id)}
                      className="rounded p-1.5 text-slate-500 hover:bg-slate-800 hover:text-rose-400 transition-colors"
                      title="Delete Rule"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              );
            })}

            {evaluatedAlerts.length === 0 && (
              <div className="rounded-xl border border-dashed border-slate-800 p-8 text-center text-xs text-slate-500">
                No active watch rules configured. Add a rule above to monitor SORA benchmark levels.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
