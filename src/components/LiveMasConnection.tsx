import React, { useState, useEffect } from 'react';
import { Server, Wifi, Key, Play, RefreshCw, AlertCircle, CheckCircle2, ExternalLink } from 'lucide-react';

interface HealthData {
  status: string;
  service: string;
  timestamp: string;
  uptime: number;
  masKeyConfigured: boolean;
  endpoint: string;
}

export const LiveMasConnection: React.FC = () => {
  const [health, setHealth] = useState<HealthData | null>(null);
  const [healthLoading, setHealthLoading] = useState<boolean>(true);
  const [manualKey, setManualKey] = useState<string>('');
  const [queryLimit, setQueryLimit] = useState<number>(10);
  const [apiResponse, setApiResponse] = useState<any>(null);
  const [apiStatus, setApiStatus] = useState<number | null>(null);
  const [apiLoading, setApiLoading] = useState<boolean>(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const fetchHealth = async () => {
    setHealthLoading(true);
    try {
      const res = await fetch('/api/health');
      const data = await res.json();
      setHealth(data);
    } catch (err: any) {
      console.error('Health check failed:', err);
    } finally {
      setHealthLoading(false);
    }
  };

  useEffect(() => {
    fetchHealth();
  }, []);

  const handleTestConnection = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiLoading(true);
    setApiError(null);
    setApiResponse(null);
    setApiStatus(null);

    try {
      const headers: Record<string, string> = {};
      if (manualKey.trim()) {
        headers['KeyId'] = manualKey.trim();
      }

      const res = await fetch(`/api/sora?limit=${queryLimit}`, {
        headers,
      });

      setApiStatus(res.status);
      const data = await res.json();
      setApiResponse(data);
    } catch (err: any) {
      setApiError(err?.message || 'Failed to request /api/sora');
    } finally {
      setApiLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Overview Banner */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Server className="h-5 w-5 text-emerald-400" />
              <span>MAS Serverless Gateway Connection</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Direct connection to the Monetary Authority of Singapore Domestic Interest Rates & SORA API Gateway
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={fetchHealth}
              disabled={healthLoading}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-200 hover:bg-slate-700 transition-colors"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${healthLoading ? 'animate-spin' : ''}`} />
              <span>Refresh Health</span>
            </button>
          </div>
        </div>

        {/* Serverless Endpoints Info */}
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-lg border border-slate-800 bg-slate-950/70 p-3.5">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-semibold text-slate-300">/api/health.ts</span>
              <span className="font-mono text-[10px] text-emerald-400">STATUS: {health?.status || 'CHECKING'}</span>
            </div>
            <p className="mt-1 text-xs text-slate-400">
              Monitors serverless uptime and detects if <code className="text-blue-300">MAS_KEY_ID</code> is loaded in the environment.
            </p>
            <div className="mt-2 text-[11px] font-mono text-slate-400 flex items-center gap-1">
              <span>Key Loaded:</span>
              {health?.masKeyConfigured ? (
                <span className="text-emerald-400 font-semibold">Yes (Configured)</span>
              ) : (
                <span className="text-amber-400 font-semibold">No (Manual header mode)</span>
              )}
            </div>
          </div>

          <div className="rounded-lg border border-slate-800 bg-slate-950/70 p-3.5">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-semibold text-slate-300">/api/sora.ts</span>
              <span className="font-mono text-[10px] text-blue-400">GATEWAY PROXY</span>
            </div>
            <p className="mt-1 text-xs text-slate-400">
              Pulls Daily SORA + compounded 1M/3M/6M averages from MAS with <code className="text-blue-300">KeyId</code> header.
            </p>
            <div className="mt-2 text-[11px] font-mono text-slate-500 truncate">
              apimg-gw/.../domestic_interest_rates_daily
            </div>
          </div>

          <div className="rounded-lg border border-slate-800 bg-slate-950/70 p-3.5">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-semibold text-slate-300">MAS Developer Portal</span>
              <a
                href="https://eservices.mas.gov.sg/developer"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-[10px] text-blue-400 hover:text-blue-300"
              >
                <span>Docs</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
            <p className="mt-1 text-xs text-slate-400">
              Subscribe to the MAS Domestic Interest Rates dataset to obtain your personal KeyId.
            </p>
            <div className="mt-2 text-[11px] font-mono text-slate-400">
              Required Header: <code className="text-amber-300">KeyId: &lt;YOUR_KEY&gt;</code>
            </div>
          </div>
        </div>
      </div>

      {/* Live Test Console */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Connection Form (5 cols) */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-5 lg:col-span-5 space-y-4">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <Key className="h-4 w-4 text-blue-400" />
            <span>Test MAS Connection with KeyId</span>
          </h3>

          <form onSubmit={handleTestConnection} className="space-y-4">
            <div>
              <label className="text-xs text-slate-300">
                MAS API KeyId (optional if set in env)
              </label>
              <input
                type="text"
                placeholder="Enter MAS KeyId (e.g. 5f8a...)"
                value={manualKey}
                onChange={(e) => setManualKey(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 p-2 text-xs font-mono text-white placeholder-slate-600 focus:border-blue-500 focus:outline-none"
              />
              <p className="mt-1 text-[11px] text-slate-500">
                If not specified, the endpoint checks <code className="text-slate-400">process.env.MAS_KEY_ID</code>.
              </p>
            </div>

            <div>
              <label className="text-xs text-slate-300">Record Limit</label>
              <input
                type="number"
                min="1"
                max="100"
                value={queryLimit}
                onChange={(e) => setQueryLimit(Number(e.target.value))}
                className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 p-2 text-xs font-mono text-white focus:border-blue-500 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={apiLoading}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-emerald-500 transition-colors disabled:opacity-50"
            >
              {apiLoading ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <span>Requesting MAS Gateway...</span>
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 fill-current" />
                  <span>Execute /api/sora Test</span>
                </>
              )}
            </button>
          </form>

          {/* Quick instructions on env */}
          <div className="rounded-lg border border-slate-800 bg-slate-950/70 p-3 space-y-2 text-xs text-slate-400">
            <span className="font-semibold text-slate-300">How to configure MAS_KEY_ID:</span>
            <p className="text-[11px]">
              Add to your <code className="text-slate-200">.env</code> file:
            </p>
            <pre className="rounded bg-slate-900 p-2 font-mono text-[11px] text-blue-300 overflow-x-auto">
              MAS_KEY_ID="your_mas_key_id_here"
            </pre>
            <p className="text-[11px]">
              The server will automatically authenticate all requests using this key without exposing it to the client browser.
            </p>
          </div>
        </div>

        {/* Response Viewer (7 cols) */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-5 lg:col-span-7 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <Wifi className="h-4 w-4 text-emerald-400" />
              <span>Gateway Live Output</span>
            </h3>
            {apiStatus !== null && (
              <span
                className={`font-mono text-xs px-2 py-0.5 rounded font-semibold ${
                  apiStatus === 200
                    ? 'bg-emerald-500/20 text-emerald-300'
                    : 'bg-amber-500/20 text-amber-300'
                }`}
              >
                HTTP {apiStatus}
              </span>
            )}
          </div>

          {apiError && (
            <div className="flex items-center gap-2 rounded-lg border border-rose-800 bg-rose-950/30 p-3 text-xs text-rose-300">
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
              <span>{apiError}</span>
            </div>
          )}

          <div className="rounded-lg border border-slate-800 bg-slate-950 p-4 font-mono text-xs text-slate-300 max-h-[420px] overflow-y-auto">
            {apiResponse ? (
              <pre className="whitespace-pre-wrap">
                {JSON.stringify(apiResponse, null, 2)}
              </pre>
            ) : (
              <div className="py-12 text-center text-slate-500">
                Click &quot;Execute /api/sora Test&quot; to inspect the live response from the MAS endpoint.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
