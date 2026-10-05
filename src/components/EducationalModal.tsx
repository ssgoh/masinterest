import React from 'react';
import { X, BookOpen, ExternalLink, CheckCircle2 } from 'lucide-react';

interface EducationalModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EducationalModal: React.FC<EducationalModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
      <div className="relative max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-2xl text-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 font-serif font-bold text-white">
              S$
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">
                Understanding MAS SORA & The Singapore Benchmark
              </h3>
              <p className="text-xs text-slate-400">
                Monetary Authority of Singapore (MAS) official benchmark framework
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="mt-5 space-y-6 text-xs text-slate-300 leading-relaxed">
          {/* Section 1 */}
          <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
            <h4 className="text-sm font-semibold text-white flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-blue-400" />
              <span>What is SORA (Singapore Overnight Rate Average)?</span>
            </h4>
            <p className="mt-2">
              SORA is the volume-weighted average rate of unsecured overnight interbank SGD lending transactions brokered in Singapore between 8:00 AM and 6:15 PM SGT. It is administered directly by the Monetary Authority of Singapore (MAS) and published every Singapore business day at 09:00 SGT.
            </p>
            <p className="mt-2">
              Unlike legacy rates that relied on bank expert judgment, SORA is 100% anchored in actual market transactions in Singapore's deep and active overnight cash market.
            </p>
          </div>

          {/* Section 2 */}
          <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
            <h4 className="text-sm font-semibold text-white flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              <span>Why Singapore Replaced SOR and SIBOR</span>
            </h4>
            <p className="mt-2">
              Previously, Singapore loans were tied to SOR (SGD Swap Offer Rate, which relied on USD LIBOR) and SIBOR (Singapore Interbank Offered Rate). With the global phase-out of LIBOR and the recommendation of the Steering Committee for SOR & SIBOR Transition to SORA (SC-STS), MAS transitioned the financial system to SORA:
            </p>
            <ul className="mt-2 list-disc list-inside space-y-1 text-slate-400">
              <li><strong className="text-slate-300">SOR discontinued:</strong> Phased out following the cessation of USD LIBOR.</li>
              <li><strong className="text-slate-300">SIBOR discontinued:</strong> Fully phased out in 2024. All legacy mortgages transitioned to Compounded SORA packages.</li>
              <li><strong className="text-slate-300">Transaction-backed:</strong> Eliminates risk of benchmark manipulation and survey discrepancies.</li>
            </ul>
          </div>

          {/* Section 3 */}
          <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
            <h4 className="text-sm font-semibold text-white flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-violet-400" />
              <span>Compounded SORA: In Advance vs In Arrears</span>
            </h4>
            <p className="mt-2">
              Overnight interest rates fluctuate daily. To provide stability for retail borrowers and businesses, MAS publishes Compounded SORA rates calculated over 1-month, 3-month, and 6-month historical windows:
            </p>
            <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                <span className="font-semibold text-blue-300">Compounded in Advance (Retail Standard)</span>
                <p className="mt-1 text-[11px] text-slate-400">
                  Used by DBS, OCBC, and UOB for residential mortgages. The interest rate for your upcoming 3-month payment period is fixed based on the past 90 days of SORA, giving full certainty of your monthly repayment before the period begins.
                </p>
              </div>
              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                <span className="font-semibold text-emerald-300">Compounded in Arrears (Wholesale)</span>
                <p className="mt-1 text-[11px] text-slate-400">
                  Used in institutional derivatives, syndicated corporate loans, and capital markets. Interest compounds daily during the interest period and is settled at the end of the period.
                </p>
              </div>
            </div>
          </div>

          {/* Section 4 */}
          <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
            <h4 className="text-sm font-semibold text-white flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-amber-400" />
              <span>How MAS Monetary Policy Affects SORA</span>
            </h4>
            <p className="mt-2">
              Singapore has an open capital account with no restrictions on capital flows. Consequently, the Monetary Authority of Singapore does not set domestic policy interest rates (unlike the US Federal Reserve or European Central Bank).
            </p>
            <p className="mt-2">
              Instead, MAS manages monetary policy via the exchange rate of the Singapore dollar (S$NEER band). Singapore domestic interest rates (SORA) are therefore primarily determined by global interest rates (especially US Fed Funds Rate) and market expectations of the Singapore dollar's appreciation or depreciation.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 flex items-center justify-between border-t border-slate-800 pt-4 text-xs text-slate-400">
          <a
            href="https://www.mas.gov.sg/bonds-and-bills/sora"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-blue-400 hover:text-blue-300 transition-colors"
          >
            <span>Visit Official MAS SORA Portal</span>
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
          <button
            onClick={onClose}
            className="rounded-lg bg-slate-800 px-4 py-2 font-medium text-white hover:bg-slate-700 transition-colors"
          >
            Close Guide
          </button>
        </div>
      </div>
    </div>
  );
};
