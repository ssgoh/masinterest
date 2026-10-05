import React, { useState, useMemo } from 'react';
import { LATEST_SORA, calculateMonthlyInstallment, generateAmortizationSchedule } from '../data/soraData';
import { Home, ShieldAlert, Scale, ChevronDown, ChevronUp, CheckCircle, AlertTriangle } from 'lucide-react';

interface PresetPackage {
  id: string;
  name: string;
  bank: string;
  type: '3M' | '1M' | '6M' | 'FIXED';
  spread: number;
  fixedRate?: number;
  lockInYears: number;
}

const PRESET_PACKAGES: PresetPackage[] = [
  { id: 'dbs_3m', name: 'DBS SORA Pegged', bank: 'DBS Bank', type: '3M', spread: 0.65, lockInYears: 2 },
  { id: 'ocbc_3m', name: 'OCBC Eco-Care SORA', bank: 'OCBC', type: '3M', spread: 0.60, lockInYears: 2 },
  { id: 'uob_1m', name: 'UOB 1M SORA Floating', bank: 'UOB', type: '1M', spread: 0.55, lockInYears: 2 },
  { id: 'fixed_2y', name: 'Standard 2-Year Fixed', bank: 'Fixed Tier', type: 'FIXED', spread: 0, fixedRate: 2.95, lockInYears: 2 },
  { id: 'custom', name: 'Custom Package', bank: 'Customized', type: '3M', spread: 0.70, lockInYears: 1 },
];

export const MortgageCalculator: React.FC = () => {
  const [selectedPackageId, setSelectedPackageId] = useState<string>('dbs_3m');
  const [loanAmount, setLoanAmount] = useState<number>(800000);
  const [tenureYears, setTenureYears] = useState<number>(25);
  const [customSpread, setCustomSpread] = useState<number>(0.65);
  const [customTenor, setCustomTenor] = useState<'1M' | '3M' | '6M'>('3M');
  const [customFixedRate, setCustomFixedRate] = useState<number>(2.95);
  const [monthlyIncome, setMonthlyIncome] = useState<number>(14000);
  const [otherMonthlyDebt, setOtherMonthlyDebt] = useState<number>(800);
  const [showAmortization, setShowAmortization] = useState<boolean>(false);

  const activePreset = PRESET_PACKAGES.find((p) => p.id === selectedPackageId) || PRESET_PACKAGES[0];

  // Benchmark rate lookup
  const getBenchmarkRate = (type: '1M' | '3M' | '6M' | 'FIXED') => {
    switch (type) {
      case '1M':
        return LATEST_SORA.sora1m;
      case '3M':
        return LATEST_SORA.sora3m;
      case '6M':
        return LATEST_SORA.sora6m;
      case 'FIXED':
        return activePreset.fixedRate ?? 2.95;
    }
  };

  const currentBenchmarkRate = useMemo(() => {
    if (selectedPackageId === 'custom') {
      return getBenchmarkRate(customTenor);
    }
    return getBenchmarkRate(activePreset.type);
  }, [selectedPackageId, customTenor, activePreset]);

  // Effective interest rate
  const effectiveRate = useMemo(() => {
    if (selectedPackageId === 'fixed_2y') {
      return activePreset.fixedRate ?? 2.95;
    }
    if (selectedPackageId === 'custom') {
      return currentBenchmarkRate + customSpread;
    }
    return currentBenchmarkRate + activePreset.spread;
  }, [selectedPackageId, activePreset, currentBenchmarkRate, customSpread]);

  // Current calculations
  const { monthlyPayment, totalPayment, totalInterest } = useMemo(() => {
    return calculateMonthlyInstallment(loanAmount, effectiveRate, tenureYears);
  }, [loanAmount, effectiveRate, tenureYears]);

  // MAS Regulatory Stress Test: Under MAS Notice 645, residential mortgages are evaluated at a minimum 4.00% floor interest rate
  const masStressRate = 4.00;
  const stressCalc = useMemo(() => {
    return calculateMonthlyInstallment(loanAmount, masStressRate, tenureYears);
  }, [loanAmount, masStressRate, tenureYears]);

  // TDSR calculation (Total Debt Servicing Ratio, MAS 55% maximum limit)
  const tdsrRatio = useMemo(() => {
    if (monthlyIncome <= 0) return 0;
    const totalObligations = stressCalc.monthlyPayment + otherMonthlyDebt;
    return (totalObligations / monthlyIncome) * 100;
  }, [stressCalc.monthlyPayment, otherMonthlyDebt, monthlyIncome]);

  // Fixed vs Floating Differential
  const fixedRateComparison = 2.95;
  const fixedCalc = useMemo(() => {
    return calculateMonthlyInstallment(loanAmount, fixedRateComparison, tenureYears);
  }, [loanAmount, fixedRateComparison, tenureYears]);

  const monthlyDifferenceVsFixed = monthlyPayment - fixedCalc.monthlyPayment;

  // Amortization schedule
  const amortization = useMemo(() => {
    return generateAmortizationSchedule(loanAmount, effectiveRate, tenureYears);
  }, [loanAmount, effectiveRate, tenureYears]);

  return (
    <div className="space-y-6">
      {/* Intro Header */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Home className="h-5 w-5 text-blue-400" />
              <span>Singapore Home Loan & Mortgage SORA Simulator</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Simulate retail home loans pegged to Compounded SORA with official MAS TDSR 4.00% stress-testing
            </p>
          </div>
          <div className="text-xs font-mono text-slate-400 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700/60">
            <span>Latest 3M SORA Fixing: </span>
            <span className="font-semibold text-blue-300">{LATEST_SORA.sora3m.toFixed(4)}%</span>
          </div>
        </div>

        {/* Bank Package Presets */}
        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
          {PRESET_PACKAGES.map((pkg) => (
            <button
              key={pkg.id}
              onClick={() => setSelectedPackageId(pkg.id)}
              className={`rounded-lg border p-3 text-left transition-all ${
                selectedPackageId === pkg.id
                  ? 'border-blue-500 bg-blue-950/40 ring-1 ring-blue-500'
                  : 'border-slate-800 bg-slate-900/40 hover:border-slate-700'
              }`}
            >
              <div className="text-xs font-semibold text-slate-300">{pkg.name}</div>
              <div className="mt-1 text-[11px] text-slate-400">{pkg.bank}</div>
              <div className="mt-2 font-mono text-xs font-bold text-blue-400">
                {pkg.type === 'FIXED'
                  ? `${pkg.fixedRate}% Fixed`
                  : `${pkg.type} + ${pkg.spread.toFixed(2)}%`}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Main Configuration Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Loan Controls (5 cols) */}
        <div className="space-y-5 rounded-xl border border-slate-800 bg-slate-900/90 p-5 lg:col-span-5">
          <h3 className="text-sm font-semibold text-white">Loan Parameters</h3>

          {/* Loan Amount */}
          <div>
            <div className="flex items-center justify-between text-xs text-slate-300">
              <span>Loan Amount</span>
              <span className="font-mono font-bold text-blue-400 text-sm">
                S$ {loanAmount.toLocaleString()}
              </span>
            </div>
            <input
              type="range"
              min={200000}
              max={3000000}
              step={25000}
              value={loanAmount}
              onChange={(e) => setLoanAmount(Number(e.target.value))}
              className="mt-2 w-full accent-blue-500 cursor-pointer"
            />
            <div className="mt-2 flex items-center gap-1.5 overflow-x-auto">
              {[500000, 750000, 1000000, 1500000].map((amt) => (
                <button
                  key={amt}
                  onClick={() => setLoanAmount(amt)}
                  className={`rounded border px-2 py-0.5 text-[11px] font-mono transition-colors ${
                    loanAmount === amt
                      ? 'border-blue-500 bg-blue-500/20 text-blue-300'
                      : 'border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  S${amt / 1000}k
                </button>
              ))}
            </div>
          </div>

          {/* Loan Tenure */}
          <div>
            <div className="flex items-center justify-between text-xs text-slate-300">
              <span>Loan Tenure</span>
              <span className="font-mono font-bold text-slate-200">
                {tenureYears} Years ({tenureYears * 12} months)
              </span>
            </div>
            <input
              type="range"
              min={5}
              max={35}
              step={1}
              value={tenureYears}
              onChange={(e) => setTenureYears(Number(e.target.value))}
              className="mt-2 w-full accent-blue-500 cursor-pointer"
            />
            <div className="mt-2 flex items-center gap-2">
              {[15, 20, 25, 30].map((yr) => (
                <button
                  key={yr}
                  onClick={() => setTenureYears(yr)}
                  className={`rounded border px-2.5 py-0.5 text-xs font-mono transition-colors ${
                    tenureYears === yr
                      ? 'border-blue-500 bg-blue-500/20 text-blue-300'
                      : 'border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  {yr} Yrs
                </button>
              ))}
            </div>
          </div>

          {/* Custom Settings if custom selected */}
          {selectedPackageId === 'custom' && (
            <div className="space-y-3 rounded-lg border border-slate-800 bg-slate-950/70 p-3">
              <div className="text-xs font-semibold text-slate-300">Custom Package Spec</div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] text-slate-400">Benchmark Tenor</label>
                  <select
                    value={customTenor}
                    onChange={(e) => setCustomTenor(e.target.value as '1M' | '3M' | '6M')}
                    className="mt-1 w-full rounded border border-slate-700 bg-slate-900 p-1.5 text-xs text-white"
                  >
                    <option value="1M">1M SORA ({LATEST_SORA.sora1m.toFixed(2)}%)</option>
                    <option value="3M">3M SORA ({LATEST_SORA.sora3m.toFixed(2)}%)</option>
                    <option value="6M">6M SORA ({LATEST_SORA.sora6m.toFixed(2)}%)</option>
                  </select>
                </div>
                <div>
                  <label className="text-[11px] text-slate-400">Bank Spread (%)</label>
                  <input
                    type="number"
                    step="0.05"
                    min="0"
                    max="3"
                    value={customSpread}
                    onChange={(e) => setCustomSpread(Number(e.target.value))}
                    className="mt-1 w-full rounded border border-slate-700 bg-slate-900 p-1.5 text-xs font-mono text-white"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TDSR Affordability Inputs */}
          <div className="border-t border-slate-800 pt-3 space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-300">
              <span className="font-semibold">MAS TDSR Affordability Checker</span>
              <span className="text-[11px] text-slate-400">Limit: 55%</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[11px] text-slate-400">Gross Monthly Income</label>
                <div className="mt-1 flex items-center rounded border border-slate-700 bg-slate-900 px-2 py-1 text-xs">
                  <span className="text-slate-500 mr-1">S$</span>
                  <input
                    type="number"
                    step="500"
                    value={monthlyIncome}
                    onChange={(e) => setMonthlyIncome(Number(e.target.value))}
                    className="w-full bg-transparent font-mono text-white focus:outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="text-[11px] text-slate-400">Other Debts (Car, Loans)</label>
                <div className="mt-1 flex items-center rounded border border-slate-700 bg-slate-900 px-2 py-1 text-xs">
                  <span className="text-slate-500 mr-1">S$</span>
                  <input
                    type="number"
                    step="100"
                    value={otherMonthlyDebt}
                    onChange={(e) => setOtherMonthlyDebt(Number(e.target.value))}
                    className="w-full bg-transparent font-mono text-white focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Calculation Results & Analytics (7 cols) */}
        <div className="space-y-5 lg:col-span-7">
          {/* Main Repayment Card */}
          <div className="rounded-xl border border-blue-500/40 bg-gradient-to-br from-blue-950/40 via-slate-900 to-slate-900 p-5 shadow-lg">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
              <div>
                <span className="text-xs text-blue-300 font-medium">Monthly Installment</span>
                <div className="mt-1 font-mono text-3xl font-extrabold text-white">
                  S$ {monthlyPayment.toLocaleString()}
                  <span className="text-sm font-normal text-slate-400"> / month</span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-400">Effective Interest Rate</span>
                <div className="font-mono text-2xl font-bold text-emerald-400">
                  {effectiveRate.toFixed(4)}% p.a.
                </div>
                <div className="text-[11px] font-mono text-slate-400">
                  {selectedPackageId === 'fixed_2y'
                    ? 'Fixed Rate'
                    : `Benchmark ${currentBenchmarkRate.toFixed(4)}% + Spread ${activePreset.spread.toFixed(2)}%`}
                </div>
              </div>
            </div>

            {/* Breakdown stats */}
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
              <div className="rounded-lg bg-slate-900/80 p-3 border border-slate-800/80">
                <span className="text-[11px] text-slate-400">Total Interest Payable</span>
                <div className="mt-1 font-mono text-base font-semibold text-rose-300">
                  S$ {totalInterest.toLocaleString()}
                </div>
                <span className="text-[10px] text-slate-500">
                  {((totalInterest / loanAmount) * 100).toFixed(0)}% of principal
                </span>
              </div>
              <div className="rounded-lg bg-slate-900/80 p-3 border border-slate-800/80">
                <span className="text-[11px] text-slate-400">Total Loan Cost</span>
                <div className="mt-1 font-mono text-base font-semibold text-slate-200">
                  S$ {totalPayment.toLocaleString()}
                </div>
                <span className="text-[10px] text-slate-500">
                  Over {tenureYears} years
                </span>
              </div>
              <div className="rounded-lg bg-slate-900/80 p-3 border border-slate-800/80">
                <span className="text-[11px] text-slate-400">Principal : Interest</span>
                <div className="mt-1 font-mono text-base font-semibold text-slate-200">
                  {Math.round((loanAmount / totalPayment) * 100)}% : {Math.round((totalInterest / totalPayment) * 100)}%
                </div>
                <div className="mt-1 h-1.5 w-full rounded-full bg-slate-800 overflow-hidden flex">
                  <div
                    className="bg-blue-500 h-full"
                    style={{ width: `${(loanAmount / totalPayment) * 100}%` }}
                  />
                  <div
                    className="bg-rose-500 h-full"
                    style={{ width: `${(totalInterest / totalPayment) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* MAS Regulatory TDSR Stress Test Card */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldAlert className="h-4 w-4 text-amber-400" />
                <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider">
                  MAS Notice 645 TDSR Regulatory Stress Test (4.00% Floor)
                </h4>
              </div>
              {tdsrRatio <= 55 ? (
                <div className="flex items-center gap-1 text-xs text-emerald-400 font-medium">
                  <CheckCircle className="h-3.5 w-3.5" />
                  <span>Compliant ({tdsrRatio.toFixed(1)}% / 55%)</span>
                </div>
              ) : (
                <div className="flex items-center gap-1 text-xs text-rose-400 font-medium">
                  <AlertTriangle className="h-3.5 w-3.5" />
                  <span>Exceeds Limit ({tdsrRatio.toFixed(1)}% / 55%)</span>
                </div>
              )}
            </div>

            <p className="mt-1.5 text-xs text-slate-400">
              MAS requires financial institutions in Singapore to stress-test residential mortgages at a minimum medium-term interest rate of <span className="font-semibold text-slate-300">4.00%</span> to ensure borrower solvency during interest rate hikes.
            </p>

            <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 rounded-lg bg-slate-950/60 p-3 border border-slate-800/60 font-mono text-xs">
              <div>
                <span className="text-slate-500 text-[11px]">Stress Rate Installment</span>
                <div className="font-semibold text-amber-300 mt-0.5">
                  S$ {stressCalc.monthlyPayment.toLocaleString()} /mo
                </div>
                <span className="text-[10px] text-slate-500">
                  +S$ {(stressCalc.monthlyPayment - monthlyPayment).toLocaleString()} buffer
                </span>
              </div>
              <div>
                <span className="text-slate-500 text-[11px]">Your TDSR Ratio</span>
                <div className={`font-semibold mt-0.5 ${tdsrRatio <= 55 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {tdsrRatio.toFixed(1)}%
                </div>
                <span className="text-[10px] text-slate-500">Max allowable: 55.0%</span>
              </div>
              <div>
                <span className="text-slate-500 text-[11px]">Max Borrowing Capacity</span>
                <div className="font-semibold text-slate-200 mt-0.5">
                  ~S$ {Math.round((monthlyIncome * 0.55 - otherMonthlyDebt) / (stressCalc.monthlyPayment / loanAmount)).toLocaleString()}
                </div>
                <span className="text-[10px] text-slate-500">Under 55% TDSR</span>
              </div>
            </div>
          </div>

          {/* Floating vs Fixed Breakeven Analysis */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
            <div className="flex items-center gap-2">
              <Scale className="h-4 w-4 text-violet-400" />
              <h4 className="text-xs font-semibold text-slate-200">
                Floating vs Fixed 2.95% Comparison
              </h4>
            </div>

            <div className="mt-2 flex flex-col gap-2 text-xs text-slate-300 sm:flex-row sm:items-center sm:justify-between">
              <div>
                {effectiveRate < fixedRateComparison ? (
                  <p>
                    Current floating rate is{' '}
                    <span className="font-semibold text-emerald-400">
                      {((fixedRateComparison - effectiveRate) * 100).toFixed(1)} bps lower
                    </span>{' '}
                    than a 2.95% fixed package, saving{' '}
                    <span className="font-semibold text-emerald-400 font-mono">
                      S$ {Math.abs(monthlyDifferenceVsFixed).toLocaleString()}/month
                    </span>.
                  </p>
                ) : (
                  <p>
                    A 2.95% fixed package is currently{' '}
                    <span className="font-semibold text-blue-400">
                      {((effectiveRate - fixedRateComparison) * 100).toFixed(1)} bps cheaper
                    </span>{' '}
                    than floating, saving{' '}
                    <span className="font-semibold text-blue-400 font-mono">
                      S$ {monthlyDifferenceVsFixed.toLocaleString()}/month
                    </span>.
                  </p>
                )}
              </div>
              <div className="text-[11px] text-slate-400 font-mono">
                Breakeven SORA: {(fixedRateComparison - activePreset.spread).toFixed(2)}%
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Amortization Schedule Accordion */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
        <button
          onClick={() => setShowAmortization(!showAmortization)}
          className="flex w-full items-center justify-between text-left text-sm font-semibold text-slate-200 hover:text-white"
        >
          <div className="flex items-center gap-2">
            <span>Year-by-Year Amortization Schedule</span>
            <span className="text-xs font-normal text-slate-400 font-mono">({tenureYears} Years)</span>
          </div>
          {showAmortization ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>

        {showAmortization && (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400">
                  <th className="py-2 pr-4 font-medium">Year</th>
                  <th className="py-2 px-4 font-medium">Beginning Balance</th>
                  <th className="py-2 px-4 font-medium">Principal Paid</th>
                  <th className="py-2 px-4 font-medium">Interest Paid</th>
                  <th className="py-2 pl-4 font-medium text-right">Ending Balance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {amortization.map((row) => (
                  <tr key={row.year} className="hover:bg-slate-800/40">
                    <td className="py-2 pr-4 font-semibold text-slate-300">Year {row.year}</td>
                    <td className="py-2 px-4 text-slate-400">S$ {row.beginningBalance.toLocaleString()}</td>
                    <td className="py-2 px-4 text-blue-400">S$ {row.principalPaid.toLocaleString()}</td>
                    <td className="py-2 px-4 text-rose-400">S$ {row.interestPaid.toLocaleString()}</td>
                    <td className="py-2 pl-4 text-right font-semibold text-slate-200">
                      S$ {row.endingBalance.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
