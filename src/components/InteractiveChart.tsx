import React, { useState, useMemo, useRef } from 'react';
import { SoraRecord, TimeRange, TenorKey } from '../types/sora';
import { filterDataByRange, TENOR_CONFIGS } from '../data/soraData';
import { BarChart2, Layers, Activity } from 'lucide-react';

interface InteractiveChartProps {
  data: SoraRecord[];
}

export const InteractiveChart: React.FC<InteractiveChartProps> = ({ data }) => {
  const [timeRange, setTimeRange] = useState<TimeRange>('6M');
  const [activeTenors, setActiveTenors] = useState<Record<TenorKey, boolean>>({
    sora: true,
    sora1m: true,
    sora3m: true,
    sora6m: true,
  });
  const [showVolume, setShowVolume] = useState<boolean>(true);
  const [showCorridor, setShowCorridor] = useState<boolean>(false);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  // Filtered dataset
  const filteredData = useMemo(() => {
    return filterDataByRange(data, timeRange);
  }, [data, timeRange]);

  const toggleTenor = (key: TenorKey) => {
    setActiveTenors((prev) => {
      // Prevent disabling all tenors
      const activeCount = Object.values(prev).filter(Boolean).length;
      if (activeCount === 1 && prev[key]) return prev;
      return { ...prev, [key]: !prev[key] };
    });
  };

  // Compute chart bounds
  const stats = useMemo<{
    minRate: number;
    maxRate: number;
    avgRate: number;
    maxVol: number;
    highItem: SoraRecord | null;
    lowItem: SoraRecord | null;
  }>(() => {
    if (filteredData.length === 0) return { minRate: 0, maxRate: 5, avgRate: 0, maxVol: 5000, highItem: null, lowItem: null };

    let min = Infinity;
    let max = -Infinity;
    let sum = 0;
    let maxVol = 0;
    let highItem: SoraRecord | null = null;
    let lowItem: SoraRecord | null = null;

    filteredData.forEach((d) => {
      if (d.volume > maxVol) maxVol = d.volume;

      // consider enabled tenors
      const valuesToCheck: number[] = [];
      if (activeTenors.sora) valuesToCheck.push(d.sora);
      if (activeTenors.sora1m) valuesToCheck.push(d.sora1m);
      if (activeTenors.sora3m) valuesToCheck.push(d.sora3m);
      if (activeTenors.sora6m) valuesToCheck.push(d.sora6m);
      if (showCorridor) {
        valuesToCheck.push(d.percentile25);
        valuesToCheck.push(d.percentile75);
      }

      valuesToCheck.forEach((val) => {
        if (val < min) {
          min = val;
          lowItem = d;
        }
        if (val > max) {
          max = val;
          highItem = d;
        }
      });

      sum += d.sora3m;
    });

    const padding = (max - min) * 0.1 || 0.1;
    return {
      minRate: Math.max(0, Math.floor((min - padding) * 20) / 20),
      maxRate: Math.ceil((max + padding) * 20) / 20,
      avgRate: sum / filteredData.length,
      maxVol: Math.ceil(maxVol / 1000) * 1000,
      highItem,
      lowItem,
    };
  }, [filteredData, activeTenors, showCorridor]);

  // Dimensions
  const svgWidth = 900;
  const svgHeight = 400;
  const margin = { top: 20, right: 30, bottom: showVolume ? 90 : 40, left: 55 };
  const chartWidth = svgWidth - margin.left - margin.right;
  const chartHeight = svgHeight - margin.top - margin.bottom;
  const volumeHeight = showVolume ? 60 : 0;
  const volumeTop = svgHeight - volumeHeight - 25;

  // Scale helpers
  const getX = (index: number) => {
    if (filteredData.length <= 1) return margin.left;
    return margin.left + (index / (filteredData.length - 1)) * chartWidth;
  };

  const getY = (val: number) => {
    const range = stats.maxRate - stats.minRate;
    if (range === 0) return margin.top + chartHeight / 2;
    const ratio = (val - stats.minRate) / range;
    return margin.top + chartHeight * (1 - ratio);
  };

  const getVolY = (vol: number) => {
    if (stats.maxVol === 0) return svgHeight - 25;
    const ratio = vol / stats.maxVol;
    return volumeTop + volumeHeight * (1 - ratio);
  };

  // Generate SVG path strings
  const generatePath = (key: TenorKey) => {
    if (filteredData.length === 0) return '';
    return filteredData
      .map((d, i) => `${i === 0 ? 'M' : 'L'} ${getX(i).toFixed(1)} ${getY(d[key]).toFixed(1)}`)
      .join(' ');
  };

  // Generate Corridor Band (25th to 75th percentile)
  const generateCorridorPath = () => {
    if (filteredData.length === 0) return '';
    const upperPoints = filteredData.map((d, i) => `${i === 0 ? 'M' : 'L'} ${getX(i).toFixed(1)} ${getY(d.percentile75).toFixed(1)}`).join(' ');
    const lowerPoints = filteredData.slice().reverse().map((d, i) => `L ${getX(filteredData.length - 1 - i).toFixed(1)} ${getY(d.percentile25).toFixed(1)}`).join(' ');
    return `${upperPoints} ${lowerPoints} Z`;
  };

  // Y-axis grid ticks
  const yTicks = useMemo(() => {
    const ticks: number[] = [];
    const step = (stats.maxRate - stats.minRate) / 5;
    for (let i = 0; i <= 5; i++) {
      ticks.push(stats.minRate + i * step);
    }
    return ticks;
  }, [stats.minRate, stats.maxRate]);

  // X-axis date labels
  const xTicks = useMemo(() => {
    if (filteredData.length === 0) return [];
    const count = Math.min(6, filteredData.length);
    const step = Math.floor(filteredData.length / count);
    const ticks = [];
    for (let i = 0; i < filteredData.length; i += step) {
      ticks.push({ index: i, date: filteredData[i].date });
    }
    // ensure last point is shown
    if (ticks[ticks.length - 1].index !== filteredData.length - 1) {
      ticks.push({ index: filteredData.length - 1, date: filteredData[filteredData.length - 1].date });
    }
    return ticks;
  }, [filteredData]);

  // Mouse move handler for scrubbing
  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!containerRef.current || filteredData.length === 0) return;
    const rect = containerRef.current.getBoundingClientRect();
    const clientX = e.clientX - rect.left;
    const svgRelX = (clientX / rect.width) * svgWidth;

    if (svgRelX < margin.left || svgRelX > svgWidth - margin.right) {
      setHoverIndex(null);
      return;
    }

    const ratio = (svgRelX - margin.left) / chartWidth;
    const index = Math.round(ratio * (filteredData.length - 1));
    const clamped = Math.max(0, Math.min(filteredData.length - 1, index));
    setHoverIndex(clamped);
  };

  const handleMouseLeave = () => {
    setHoverIndex(null);
  };

  const activeHoverItem = hoverIndex !== null ? filteredData[hoverIndex] : filteredData[filteredData.length - 1];

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-4 shadow-xl">
      {/* Top Chart Controls */}
      <div className="flex flex-col gap-4 border-b border-slate-800/80 pb-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-semibold text-white">
              SORA Benchmark Term Structure & Historical Yield
            </h2>
            <span aria-hidden="true" className="text-slate-600">·</span>
            <span className="text-xs text-slate-400">Compounded Moving Windows</span>
          </div>
          <p className="mt-0.5 text-xs text-slate-400">
            Compare Overnight Daily SORA volatility against smoothed 1M, 3M, and 6M compounded mortgage curves
          </p>
        </div>

        {/* Timeframe Selectors */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center rounded-lg bg-slate-800/70 p-1">
            {(['1M', '3M', '6M', '1Y', '3Y', 'ALL'] as TimeRange[]).map((r) => (
              <button
                key={r}
                onClick={() => setTimeRange(r)}
                className={`rounded px-2.5 py-1 text-xs font-medium transition-colors ${
                  timeRange === r
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {r}
              </button>
            ))}
          </div>

          {/* Toggle Corridor / Volume */}
          <div className="flex items-center gap-1.5 border-l border-slate-800 pl-2">
            <button
              onClick={() => setShowCorridor(!showCorridor)}
              title="Toggle 25th-75th Percentile Interquartile Band"
              className={`flex items-center gap-1 rounded-lg border px-2.5 py-1 text-xs font-medium transition-colors ${
                showCorridor
                  ? 'border-indigo-500/50 bg-indigo-500/20 text-indigo-300'
                  : 'border-slate-800 bg-slate-800/50 text-slate-400 hover:text-slate-200'
              }`}
            >
              <Layers className="h-3.5 w-3.5" />
              <span>Corridor Band</span>
            </button>
            <button
              onClick={() => setShowVolume(!showVolume)}
              title="Toggle Interbank Aggregate Volume"
              className={`flex items-center gap-1 rounded-lg border px-2.5 py-1 text-xs font-medium transition-colors ${
                showVolume
                  ? 'border-blue-500/50 bg-blue-500/20 text-blue-300'
                  : 'border-slate-800 bg-slate-800/50 text-slate-400 hover:text-slate-200'
              }`}
            >
              <BarChart2 className="h-3.5 w-3.5" />
              <span>Volume</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tenor Toggle Badges */}
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <span className="text-xs text-slate-400">Tenors:</span>
        {(['sora', 'sora1m', 'sora3m', 'sora6m'] as TenorKey[]).map((key) => {
          const cfg = TENOR_CONFIGS[key];
          const active = activeTenors[key];
          return (
            <button
              key={key}
              onClick={() => toggleTenor(key)}
              className={`flex items-center gap-2 rounded-md border px-2.5 py-1 text-xs font-medium transition-colors ${
                active
                  ? 'border-slate-700 bg-slate-800 text-slate-200'
                  : 'border-slate-800 bg-slate-900/40 text-slate-500 hover:border-slate-700'
              }`}
            >
              <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: active ? cfg.color : '#64748b' }}
              />
              <span>{cfg.label}</span>
              {activeHoverItem && (
                <span className="font-mono text-slate-300">
                  {activeHoverItem[key].toFixed(4)}%
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Interactive SVG Canvas */}
      <div
        ref={containerRef}
        className="relative mt-4 w-full select-none overflow-hidden rounded-lg bg-slate-950/70 border border-slate-900"
      >
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full h-auto cursor-crosshair"
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          <defs>
            <linearGradient id="corridorGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#818cf8" stopOpacity="0.18" />
              <stop offset="100%" stopColor="#818cf8" stopOpacity="0.04" />
            </linearGradient>
            <linearGradient id="volumeGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.05" />
            </linearGradient>
          </defs>

          {/* Grid lines (horizontal) */}
          {yTicks.map((tick, i) => {
            const y = getY(tick);
            return (
              <g key={i}>
                <line
                  x1={margin.left}
                  y1={y}
                  x2={svgWidth - margin.right}
                  y2={y}
                  stroke="#1e293b"
                  strokeDasharray="3 3"
                />
                <text
                  x={margin.left - 8}
                  y={y + 4}
                  fill="#64748b"
                  fontSize="11"
                  fontFamily="monospace"
                  textAnchor="end"
                >
                  {tick.toFixed(2)}%
                </text>
              </g>
            );
          })}

          {/* Volume Section Grid & Labels */}
          {showVolume && (
            <g>
              <line
                x1={margin.left}
                y1={volumeTop}
                x2={svgWidth - margin.right}
                y2={volumeTop}
                stroke="#334155"
                strokeWidth="1"
              />
              <text
                x={margin.left}
                y={volumeTop - 4}
                fill="#64748b"
                fontSize="10"
                fontFamily="sans-serif"
              >
                Aggregate Volume (SGD Millions)
              </text>
              <text
                x={svgWidth - margin.right}
                y={volumeTop + 14}
                fill="#64748b"
                fontSize="10"
                fontFamily="monospace"
                textAnchor="end"
              >
                Max: S${stats.maxVol}M
              </text>
            </g>
          )}

          {/* Volume Bars */}
          {showVolume &&
            filteredData.map((d, i) => {
              const x = getX(i);
              const barWidth = Math.max(1.5, (chartWidth / filteredData.length) * 0.7);
              const y = getVolY(d.volume);
              const h = Math.max(1, svgHeight - 25 - y);
              return (
                <rect
                  key={i}
                  x={x - barWidth / 2}
                  y={y}
                  width={barWidth}
                  height={h}
                  fill="url(#volumeGrad)"
                  stroke="#3b82f6"
                  strokeWidth="0.5"
                  opacity={hoverIndex === i ? 1 : 0.6}
                />
              );
            })}

          {/* Corridor Band (25th - 75th percentile) */}
          {showCorridor && (
            <path
              d={generateCorridorPath()}
              fill="url(#corridorGrad)"
              stroke="#6366f1"
              strokeWidth="0.5"
              strokeDasharray="2 2"
              opacity="0.8"
            />
          )}

          {/* Tenor Rate Lines */}
          {activeTenors.sora && (
            <path
              d={generatePath('sora')}
              fill="none"
              stroke={TENOR_CONFIGS.sora.color}
              strokeWidth="1.2"
              opacity="0.75"
            />
          )}
          {activeTenors.sora1m && (
            <path
              d={generatePath('sora1m')}
              fill="none"
              stroke={TENOR_CONFIGS.sora1m.color}
              strokeWidth="1.8"
            />
          )}
          {activeTenors.sora6m && (
            <path
              d={generatePath('sora6m')}
              fill="none"
              stroke={TENOR_CONFIGS.sora6m.color}
              strokeWidth="1.8"
            />
          )}
          {/* 3M Highlighted with prominent stroke */}
          {activeTenors.sora3m && (
            <path
              d={generatePath('sora3m')}
              fill="none"
              stroke={TENOR_CONFIGS.sora3m.color}
              strokeWidth="2.5"
            />
          )}

          {/* X-axis date labels */}
          {xTicks.map((tick, i) => {
            const x = getX(tick.index);
            const dateObj = new Date(tick.date);
            const label = dateObj.toLocaleDateString('en-SG', {
              month: 'short',
              day: '2-digit',
              year: '2-digit',
            });
            return (
              <g key={i}>
                <line
                  x1={x}
                  y1={margin.top + chartHeight}
                  x2={x}
                  y2={margin.top + chartHeight + 4}
                  stroke="#475569"
                />
                <text
                  x={x}
                  y={svgHeight - (showVolume ? 8 : 10)}
                  fill="#94a3b8"
                  fontSize="11"
                  textAnchor="middle"
                  fontFamily="monospace"
                >
                  {label}
                </text>
              </g>
            );
          })}

          {/* Hover Crosshair and Markers */}
          {hoverIndex !== null && activeHoverItem && (
            <g>
              {/* Vertical guideline */}
              <line
                x1={getX(hoverIndex)}
                y1={margin.top}
                x2={getX(hoverIndex)}
                y2={svgHeight - (showVolume ? 25 : 30)}
                stroke="#94a3b8"
                strokeWidth="1"
                strokeDasharray="4 4"
              />

              {/* Dots on lines */}
              {activeTenors.sora && (
                <circle
                  cx={getX(hoverIndex)}
                  cy={getY(activeHoverItem.sora)}
                  r="3.5"
                  fill={TENOR_CONFIGS.sora.color}
                  stroke="#0f172a"
                  strokeWidth="2"
                />
              )}
              {activeTenors.sora1m && (
                <circle
                  cx={getX(hoverIndex)}
                  cy={getY(activeHoverItem.sora1m)}
                  r="4"
                  fill={TENOR_CONFIGS.sora1m.color}
                  stroke="#0f172a"
                  strokeWidth="2"
                />
              )}
              {activeTenors.sora3m && (
                <circle
                  cx={getX(hoverIndex)}
                  cy={getY(activeHoverItem.sora3m)}
                  r="5"
                  fill={TENOR_CONFIGS.sora3m.color}
                  stroke="#ffffff"
                  strokeWidth="2"
                />
              )}
              {activeTenors.sora6m && (
                <circle
                  cx={getX(hoverIndex)}
                  cy={getY(activeHoverItem.sora6m)}
                  r="4"
                  fill={TENOR_CONFIGS.sora6m.color}
                  stroke="#0f172a"
                  strokeWidth="2"
                />
              )}
            </g>
          )}
        </svg>

        {/* Active Inspection Floating Card */}
        {activeHoverItem && (
          <div className="pointer-events-none absolute right-4 top-4 rounded-lg border border-slate-700/80 bg-slate-900/95 p-3 text-xs shadow-2xl backdrop-blur-md">
            <div className="flex items-center justify-between gap-4 border-b border-slate-800 pb-1.5 font-mono text-slate-300">
              <span className="font-semibold text-white">{activeHoverItem.date}</span>
              <span className="text-[11px] text-slate-400">
                Index: {activeHoverItem.soraIndex.toFixed(5)}
              </span>
            </div>

            <div className="mt-2 space-y-1 font-mono">
              <div className="flex items-center justify-between gap-4">
                <span className="text-blue-400">Daily SORA:</span>
                <span className="font-semibold text-white">{activeHoverItem.sora.toFixed(4)}%</span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-emerald-400">1M Compounded:</span>
                <span className="font-semibold text-white">{activeHoverItem.sora1m.toFixed(4)}%</span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-violet-400">3M Compounded:</span>
                <span className="font-semibold text-white">{activeHoverItem.sora3m.toFixed(4)}%</span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-amber-400">6M Compounded:</span>
                <span className="font-semibold text-white">{activeHoverItem.sora6m.toFixed(4)}%</span>
              </div>
              <div className="flex items-center justify-between gap-4 border-t border-slate-800 pt-1 text-[11px] text-slate-400">
                <span>Volume:</span>
                <span>S${activeHoverItem.volume.toLocaleString()}M</span>
              </div>
              {showCorridor && (
                <div className="flex items-center justify-between gap-4 text-[10px] text-indigo-300/80">
                  <span>25th–75th %:</span>
                  <span>{activeHoverItem.percentile25.toFixed(3)}% – {activeHoverItem.percentile75.toFixed(3)}%</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Period Statistics Summary Bar */}
      <div className="mt-3 grid grid-cols-2 gap-2 border-t border-slate-800/80 pt-3 text-xs text-slate-400 sm:grid-cols-4">
        <div>
          <span className="text-slate-500">Period Low:</span>{' '}
          <span className="font-mono text-emerald-400">
            {stats.lowItem ? `${stats.lowItem.sora3m.toFixed(4)}%` : '—'}
          </span>
          {stats.lowItem && (
            <span className="ml-1 text-[10px] text-slate-500 font-mono">({stats.lowItem.date})</span>
          )}
        </div>
        <div>
          <span className="text-slate-500">Period High:</span>{' '}
          <span className="font-mono text-rose-400">
            {stats.highItem ? `${stats.highItem.sora3m.toFixed(4)}%` : '—'}
          </span>
          {stats.highItem && (
            <span className="ml-1 text-[10px] text-slate-500 font-mono">({stats.highItem.date})</span>
          )}
        </div>
        <div>
          <span className="text-slate-500">3M SORA Mean:</span>{' '}
          <span className="font-mono text-slate-200">
            {stats.avgRate.toFixed(4)}%
          </span>
        </div>
        <div>
          <span className="text-slate-500">Data Points:</span>{' '}
          <span className="font-mono text-slate-200">
            {filteredData.length} business days
          </span>
        </div>
      </div>
    </div>
  );
};
