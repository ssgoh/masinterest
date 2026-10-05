import { SoraRecord, TimeRange, TenorKey } from '../types/sora';

/**
 * Generate historical daily SORA records up to October 2026.
 * SORA base index started at 100 on 3 Jan 2020.
 * In late 2026, it is around 114.8 - 115.0.
 */
function generateHistoricalSoraData(): SoraRecord[] {
  const records: SoraRecord[] = [];
  const endDate = new Date(2026, 9, 2); // Friday Oct 2, 2026 (latest business day before current date)
  const startDate = new Date(2023, 0, 3); // ~3.5 years of comprehensive business days

  let currentDate = new Date(startDate);
  let currentIndex = 104.250000;

  // Pseudo-random seeded walk for authentic interest rate dynamics
  let seed = 42;
  const pseudoRandom = () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };

  // Pre-generate business days
  const businessDates: Date[] = [];
  while (currentDate <= endDate) {
    const dayOfWeek = currentDate.getDay();
    // Exclude weekends (0 = Sunday, 6 = Saturday)
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      businessDates.push(new Date(currentDate));
    }
    currentDate.setDate(currentDate.getDate() + 1);
  }

  // Base interest rate trajectory:
  // 2023: 3.4% - 3.75%
  // 2024: 3.5% - 3.7%
  // 2025: 3.3% - 3.5%
  // 2026: 3.15% - 3.35%
  const totalDays = businessDates.length;

  // Moving buffers for 1M (~21 business days), 3M (~63 business days), 6M (~126 business days)
  const dailyRateHistory: { date: Date; rate: number }[] = [];

  for (let i = 0; i < totalDays; i++) {
    const d = businessDates[i];
    const year = d.getFullYear();
    const month = d.getMonth();
    const day = d.getDate();

    // Macro baseline cycle
    let macroBaseline = 3.30;
    if (year === 2023) {
      macroBaseline = 3.45 + (month / 12) * 0.25;
    } else if (year === 2024) {
      macroBaseline = 3.70 - (month / 12) * 0.15;
    } else if (year === 2025) {
      macroBaseline = 3.50 - (month / 12) * 0.20;
    } else if (year === 2026) {
      macroBaseline = 3.28 - (month / 12) * 0.08;
    }

    // Month-end liquidity squeeze factor (Singapore interbank rates usually tighten slightly at month end)
    const isMonthEnd = day >= 27;
    const monthEndBump = isMonthEnd ? 0.04 * pseudoRandom() : 0;

    // Daily noise (-0.08 to +0.08)
    const noise = (pseudoRandom() - 0.49) * 0.14;
    const dailySora = Math.round((macroBaseline + monthEndBump + noise) * 10000) / 10000;

    dailyRateHistory.push({ date: d, rate: dailySora });

    // Calculate rolling compounded rates using official MAS arithmetic
    // 1M: ~21 business days (~30 calendar days)
    // 3M: ~63 business days (~91 calendar days)
    // 6M: ~126 business days (~182 calendar days)
    const getCompounded = (windowDays: number, calendarDays: number) => {
      const slice = dailyRateHistory.slice(-windowDays);
      let prod = 1;
      for (const item of slice) {
        // Average calendar weighting: 1 for mid-week, 3 for Friday
        const weight = item.date.getDay() === 5 ? 3 : 1;
        prod *= 1 + (item.rate / 100 * weight) / 365;
      }
      const actualCalDays = Math.max(calendarDays, slice.length * (365 / 252));
      const comp = (prod - 1) * (365 / actualCalDays) * 100;
      return Math.round(comp * 10000) / 10000;
    };

    const sora1m = getCompounded(21, 30);
    const sora3m = getCompounded(63, 91);
    const sora6m = getCompounded(126, 182);

    // Update SORA Index:
    // Index_t = Index_{t-1} * (1 + (SORA_{t-1} * n_i / 365))
    const calendarIncrement = d.getDay() === 1 ? 3 : 1;
    currentIndex = currentIndex * (1 + (dailySora / 100 * calendarIncrement) / 365);
    const roundedIndex = Math.round(currentIndex * 1000000) / 1000000;

    // Aggregate Volume between S$2,400M and S$5,400M
    const volume = Math.round(2600 + pseudoRandom() * 2400);

    // Interquartile distribution (25th and 75th percentile)
    const spread = 0.05 + pseudoRandom() * 0.08;
    const percentile25 = Math.round((dailySora - spread * 0.6) * 10000) / 10000;
    const percentile75 = Math.round((dailySora + spread * 0.4) * 10000) / 10000;
    const lowest = Math.round((percentile25 - 0.12 - pseudoRandom() * 0.08) * 10000) / 10000;
    const highest = Math.round((percentile75 + 0.14 + pseudoRandom() * 0.10) * 10000) / 10000;

    const dateStr = d.toISOString().split('T')[0];

    records.push({
      date: dateStr,
      sora: dailySora,
      sora1m,
      sora3m,
      sora6m,
      soraIndex: roundedIndex,
      volume,
      percentile25,
      percentile75,
      highest,
      lowest,
      calculationMethod: 'Volume-Weighted Trimmed Mean',
    });
  }

  return records;
}

export const SORA_HISTORICAL_DATA: SoraRecord[] = generateHistoricalSoraData();

export const LATEST_SORA = SORA_HISTORICAL_DATA[SORA_HISTORICAL_DATA.length - 1];
export const PREVIOUS_SORA = SORA_HISTORICAL_DATA[SORA_HISTORICAL_DATA.length - 2];

export const TENOR_CONFIGS: Record<TenorKey, { label: string; shortLabel: string; description: string; color: string; bgAccent: string }> = {
  sora: {
    label: 'Daily SORA',
    shortLabel: 'Daily',
    description: 'Volume-weighted average rate of unsecured overnight SGD interbank transactions',
    color: '#3b82f6', // blue
    bgAccent: 'rgba(59, 130, 246, 0.1)',
  },
  sora1m: {
    label: '1-Month Compounded SORA',
    shortLabel: '1M Comp.',
    description: 'Compounded average of daily SORA over 1 month period',
    color: '#10b981', // emerald
    bgAccent: 'rgba(16, 185, 129, 0.1)',
  },
  sora3m: {
    label: '3-Month Compounded SORA',
    shortLabel: '3M Comp.',
    description: 'Primary benchmark used for Singapore retail residential property mortgages',
    color: '#8b5cf6', // purple/violet
    bgAccent: 'rgba(139, 92, 246, 0.1)',
  },
  sora6m: {
    label: '6-Month Compounded SORA',
    shortLabel: '6M Comp.',
    description: 'Compounded average over 6 months; longer smoothing tenor',
    color: '#f59e0b', // amber
    bgAccent: 'rgba(245, 158, 11, 0.1)',
  },
};

/**
 * Filter data by selected TimeRange
 */
export function filterDataByRange(data: SoraRecord[], range: TimeRange): SoraRecord[] {
  if (range === 'ALL') return data;

  const count = data.length;
  if (count === 0) return [];

  // Approximate business days for ranges
  const rangeMap: Record<Exclude<TimeRange, 'ALL'>, number> = {
    '1M': 22,
    '3M': 65,
    '6M': 130,
    '1Y': 252,
    '3Y': 756,
  };

  const daysToTake = rangeMap[range] || 65;
  return data.slice(-Math.min(daysToTake, count));
}

/**
 * Calculate official MAS Compounded SORA from two SORA Index values:
 * Formula: ((Index_end / Index_start) - 1) * (365 / d) * 100
 */
export function calculateCompoundedFromIndex(
  startIndex: number,
  endIndex: number,
  calendarDays: number
): number {
  if (calendarDays <= 0 || startIndex <= 0) return 0;
  const rate = ((endIndex / startIndex) - 1) * (365 / calendarDays) * 100;
  return Math.round(rate * 10000) / 10000;
}

/**
 * Calculate Monthly Mortgage Installment
 * P = L * [ c(1 + c)^n ] / [ (1 + c)^n - 1 ]
 */
export function calculateMonthlyInstallment(
  loanAmount: number,
  annualRatePct: number,
  tenureYears: number
): {
  monthlyPayment: number;
  totalPayment: number;
  totalInterest: number;
} {
  if (annualRatePct <= 0 || tenureYears <= 0 || loanAmount <= 0) {
    const monthlyPayment = loanAmount / (tenureYears * 12);
    return {
      monthlyPayment: Math.round(monthlyPayment),
      totalPayment: loanAmount,
      totalInterest: 0,
    };
  }

  const monthlyRate = annualRatePct / 100 / 12;
  const totalMonths = tenureYears * 12;
  const factor = Math.pow(1 + monthlyRate, totalMonths);
  const monthlyPayment = loanAmount * (monthlyRate * factor) / (factor - 1);
  const totalPayment = monthlyPayment * totalMonths;
  const totalInterest = totalPayment - loanAmount;

  return {
    monthlyPayment: Math.round(monthlyPayment),
    totalPayment: Math.round(totalPayment),
    totalInterest: Math.round(totalInterest),
  };
}

/**
 * Generate Year-by-Year Amortization Schedule
 */
export function generateAmortizationSchedule(
  loanAmount: number,
  annualRatePct: number,
  tenureYears: number
): {
  year: number;
  beginningBalance: number;
  principalPaid: number;
  interestPaid: number;
  endingBalance: number;
}[] {
  const schedule = [];
  const monthlyRate = annualRatePct / 100 / 12;
  const totalMonths = tenureYears * 12;
  const factor = Math.pow(1 + monthlyRate, totalMonths);
  const monthlyPayment = loanAmount * (monthlyRate * factor) / (factor - 1);

  let currentBalance = loanAmount;

  for (let y = 1; y <= tenureYears; y++) {
    let yearPrincipal = 0;
    let yearInterest = 0;
    const startBalance = currentBalance;

    for (let m = 1; m <= 12; m++) {
      if (currentBalance <= 0) break;
      const interestPortion = currentBalance * monthlyRate;
      const principalPortion = monthlyPayment - interestPortion;
      yearInterest += interestPortion;
      yearPrincipal += principalPortion;
      currentBalance = Math.max(0, currentBalance - principalPortion);
    }

    schedule.push({
      year: y,
      beginningBalance: Math.round(startBalance),
      principalPaid: Math.round(yearPrincipal),
      interestPaid: Math.round(yearInterest),
      endingBalance: Math.round(currentBalance),
    });
  }

  return schedule;
}
