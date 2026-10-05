import React, { useState, useMemo } from 'react';
import { SoraRecord } from '../types/sora';
import { Download, Search, ArrowUpDown, ChevronLeft, ChevronRight } from 'lucide-react';

interface HistoricalTableProps {
  records: SoraRecord[];
  onExportCsv: () => void;
}

type SortField = 'date' | 'sora' | 'sora1m' | 'sora3m' | 'sora6m' | 'volume' | 'soraIndex';

export const HistoricalTable: React.FC<HistoricalTableProps> = ({ records, onExportCsv }) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortAsc, setSortAsc] = useState<boolean>(false); // default latest first
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 15;

  // Filter & Sort
  const processedRecords = useMemo(() => {
    let result = records;

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      result = result.filter(
        (r) =>
          r.date.includes(q) ||
          r.sora.toString().includes(q) ||
          r.sora3m.toString().includes(q)
      );
    }

    return [...result].sort((a, b) => {
      let valA: string | number = a[sortField];
      let valB: string | number = b[sortField];

      if (typeof valA === 'string') {
        return sortAsc
          ? (valA as string).localeCompare(valB as string)
          : (valB as string).localeCompare(valA as string);
      }

      return sortAsc ? (valA as number) - (valB as number) : (valB as number) - (valA as number);
    });
  }, [records, searchTerm, sortField, sortAsc]);

  const totalPages = Math.ceil(processedRecords.length / pageSize) || 1;
  const paginatedRecords = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return processedRecords.slice(start, start + pageSize);
  }, [processedRecords, currentPage, pageSize]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
    setCurrentPage(1);
  };

  return (
    <div className="space-y-4">
      {/* Table Actions Header */}
      <div className="flex flex-col gap-3 rounded-xl border border-slate-800 bg-slate-900/60 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search date (e.g. 2026-09)..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="rounded-lg border border-slate-700 bg-slate-950 py-1.5 pl-9 pr-3 text-xs text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
            />
          </div>
          <span className="text-xs text-slate-400 font-mono">
            {processedRecords.length} records
          </span>
        </div>

        <button
          onClick={onExportCsv}
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-200 hover:bg-slate-700 transition-colors"
        >
          <Download className="h-3.5 w-3.5 text-slate-400" />
          <span>Download All Historical Data (.CSV)</span>
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900/80">
        <table className="w-full text-left text-xs font-mono">
          <thead>
            <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400">
              <th
                onClick={() => handleSort('date')}
                className="cursor-pointer py-3 px-4 font-semibold hover:text-white"
              >
                <div className="flex items-center gap-1">
                  <span>Fixing Date</span>
                  <ArrowUpDown className="h-3 w-3" />
                </div>
              </th>
              <th
                onClick={() => handleSort('sora')}
                className="cursor-pointer py-3 px-4 font-semibold hover:text-white"
              >
                <div className="flex items-center gap-1">
                  <span>Daily SORA</span>
                  <ArrowUpDown className="h-3 w-3" />
                </div>
              </th>
              <th
                onClick={() => handleSort('sora1m')}
                className="cursor-pointer py-3 px-4 font-semibold hover:text-white"
              >
                <div className="flex items-center gap-1">
                  <span>1M Comp.</span>
                  <ArrowUpDown className="h-3 w-3" />
                </div>
              </th>
              <th
                onClick={() => handleSort('sora3m')}
                className="cursor-pointer py-3 px-4 font-semibold text-blue-300 hover:text-white"
              >
                <div className="flex items-center gap-1">
                  <span>3M Comp. (Mortgage)</span>
                  <ArrowUpDown className="h-3 w-3" />
                </div>
              </th>
              <th
                onClick={() => handleSort('sora6m')}
                className="cursor-pointer py-3 px-4 font-semibold hover:text-white"
              >
                <div className="flex items-center gap-1">
                  <span>6M Comp.</span>
                  <ArrowUpDown className="h-3 w-3" />
                </div>
              </th>
              <th
                onClick={() => handleSort('soraIndex')}
                className="cursor-pointer py-3 px-4 font-semibold hover:text-white"
              >
                <div className="flex items-center gap-1">
                  <span>SORA Index</span>
                  <ArrowUpDown className="h-3 w-3" />
                </div>
              </th>
              <th
                onClick={() => handleSort('volume')}
                className="cursor-pointer py-3 px-4 font-semibold text-right hover:text-white"
              >
                <div className="flex items-center justify-end gap-1">
                  <span>Volume (S$M)</span>
                  <ArrowUpDown className="h-3 w-3" />
                </div>
              </th>
              <th className="py-3 px-4 font-semibold text-right text-slate-400">
                25th – 75th %
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {paginatedRecords.map((r) => (
              <tr key={r.date} className="hover:bg-slate-800/40 transition-colors">
                <td className="py-2.5 px-4 font-semibold text-slate-200">{r.date}</td>
                <td className="py-2.5 px-4 font-bold text-blue-400">{r.sora.toFixed(4)}%</td>
                <td className="py-2.5 px-4 text-emerald-400">{r.sora1m.toFixed(4)}%</td>
                <td className="py-2.5 px-4 font-semibold text-violet-300 bg-violet-950/10">
                  {r.sora3m.toFixed(4)}%
                </td>
                <td className="py-2.5 px-4 text-amber-400">{r.sora6m.toFixed(4)}%</td>
                <td className="py-2.5 px-4 text-slate-300">{r.soraIndex.toFixed(6)}</td>
                <td className="py-2.5 px-4 text-right text-slate-300">
                  S$ {r.volume.toLocaleString()}
                </td>
                <td className="py-2.5 px-4 text-right text-slate-400 text-[11px]">
                  {r.percentile25.toFixed(3)}% – {r.percentile75.toFixed(3)}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="flex items-center justify-between text-xs text-slate-400">
        <div>
          Page <span className="font-semibold text-white">{currentPage}</span> of{' '}
          <span className="font-semibold text-white">{totalPages}</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="flex items-center gap-1 rounded border border-slate-700 bg-slate-800 px-2.5 py-1 text-slate-300 disabled:opacity-40 hover:bg-slate-700"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
            <span>Prev</span>
          </button>
          <button
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className="flex items-center gap-1 rounded border border-slate-700 bg-slate-800 px-2.5 py-1 text-slate-300 disabled:opacity-40 hover:bg-slate-700"
          >
            <span>Next</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
