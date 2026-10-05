export interface SoraRecord {
  date: string; // YYYY-MM-DD
  sora: number; // Daily SORA (% p.a.)
  sora1m: number; // 1-Month Compounded SORA (% p.a.)
  sora3m: number; // 3-Month Compounded SORA (% p.a.)
  sora6m: number; // 6-Month Compounded SORA (% p.a.)
  soraIndex: number; // SORA Index (base 100 on 3 Jan 2020)
  volume: number; // Aggregate volume in SGD millions
  percentile25: number;
  percentile75: number;
  highest: number;
  lowest: number;
  calculationMethod: string;
}

export type TimeRange = '1M' | '3M' | '6M' | '1Y' | '3Y' | 'ALL';

export type TenorKey = 'sora' | 'sora1m' | 'sora3m' | 'sora6m';

export interface TenorConfig {
  key: TenorKey;
  label: string;
  description: string;
  color: string;
  strokeDash?: string;
}

export interface MortgageScenario {
  id: string;
  name: string;
  benchmarkTenor: '1M' | '3M' | '6M' | 'FIXED';
  spread: number; // e.g. 0.65%
  fixedRate?: number; // e.g. 2.95%
  loanAmount: number; // e.g. 800,000
  tenureYears: number; // e.g. 25
  monthlyIncome?: number; // For TDSR calculation e.g. 12,000
  otherCommitments?: number; // e.g. 1,000
}

export interface RateAlert {
  id: string;
  tenor: TenorKey;
  condition: 'ABOVE' | 'BELOW';
  targetRate: number;
  createdAt: string;
  triggered: boolean;
}
