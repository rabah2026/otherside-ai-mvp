import React from 'react';
import { OtherSideReport } from '@/types';
import NeutralityBadge from './NeutralityBadge';
import EvidenceStrip from './EvidenceStrip';
import DisputedPoints from './DisputedPoints';
import { ShieldCheck, Scale, AlertCircle, FileText, CheckCircle2 } from 'lucide-react';

interface Props {
  report: OtherSideReport;
  demoMode: boolean;
}

export default function ReportBrief({ report, demoMode }: Props) {
  return (
    <div className="glass-panel rounded-xl overflow-hidden border border-neutral-800/60 p-6 sm:p-8 space-y-8 max-w-4xl mx-auto relative">
      {/* Premium Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-6 border-b border-neutral-900">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <NeutralityBadge />
            {demoMode && (
              <span className="bg-amber-950/40 border border-amber-800/40 text-amber-400 text-[10px] px-2 py-0.5 rounded font-mono uppercase tracking-wider">
                Demo Fallback Mode
              </span>
            )}
          </div>
          <h2 className="text-xl sm:text-2xl font-serif text-white leading-tight font-semibold">
            Intelligence Brief: The Counter-Position
          </h2>
        </div>
        <div className="text-left sm:text-right text-xs text-neutral-500 font-mono space-y-0.5">
          <div>Report ID: OB-{Math.random().toString(36).substring(2, 7).toUpperCase()}</div>
          <div>Classification: PUBLIC / NON-PARTISAN</div>
        </div>
      </div>

      {/* Input Context Summary */}
      <div className="bg-neutral-900/20 border border-neutral-800/30 p-4 rounded-lg space-y-2">
        <div className="text-[10px] uppercase font-bold tracking-wider text-neutral-500 flex items-center gap-1.5">
          <FileText className="w-3.5 h-3.5" /> Detected Narrative
        </div>
        <p className="text-sm text-neutral-400 leading-relaxed italic">
          "{report.detectedStory}"
        </p>
        <div className="grid grid-cols-2 gap-4 pt-3 border-t border-neutral-900 text-xs">
          <div>
            <span className="text-neutral-500">Main party:</span>{' '}
            <span className="text-neutral-300 font-medium">{report.mainParty}</span>
          </div>
          <div>
            <span className="text-neutral-500">Other party:</span>{' '}
            <span className="text-neutral-300 font-medium">{report.otherParty}</span>
          </div>
        </div>
      </div>

      {/* The Other Side Story */}
      <div className="space-y-3">
        <h3 className="text-xs uppercase tracking-wider text-neutral-500 font-semibold flex items-center gap-1.5">
          <Scale className="w-3.5 h-3.5" /> The Other Side's Narrative
        </h3>
        <p className="text-base text-neutral-200 leading-relaxed font-serif">
          {report.otherSideStory}
        </p>
      </div>

      {/* Strongest Counter Argument */}
      <div className="p-5 rounded-lg border-l-2 border-neutral-700 bg-neutral-900/20 space-y-2">
        <h3 className="text-xs uppercase tracking-wider text-neutral-400 font-semibold flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-neutral-400" /> Strongest Counter-Argument
        </h3>
        <p className="text-sm text-neutral-300 leading-relaxed">
          {report.strongestCounterArgument}
        </p>
      </div>

      {/* Split grid for agreements and disputes */}
      <div className="grid gap-6 sm:grid-cols-2">
        {/* Agreements */}
        {report.bothSidesAgreeOn && report.bothSidesAgreeOn.length > 0 && (
          <div className="space-y-2.5">
            <h3 className="text-xs uppercase tracking-wider text-neutral-500 font-semibold flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" /> Points of Agreement
            </h3>
            <ul className="space-y-2">
              {report.bothSidesAgreeOn.map((pt, idx) => (
                <li key={idx} className="flex gap-2.5 items-start text-sm text-neutral-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500/80 mt-1.5 flex-shrink-0" />
                  <span className="leading-relaxed">{pt}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Disputes */}
        <DisputedPoints points={report.disputedPoints} />
      </div>

      {/* Thin Divider */}
      <div className="thin-divider" />

      {/* Sources */}
      <EvidenceStrip sources={report.sourceNotes} />

      {/* Uncertainty & Policy notes */}
      <div className="grid gap-4 sm:grid-cols-2 pt-4 text-xs text-neutral-500 border-t border-neutral-900">
        {report.uncertaintyNotes && report.uncertaintyNotes.length > 0 && (
          <div className="space-y-1">
            <div className="font-semibold uppercase tracking-wider flex items-center gap-1">
              <AlertCircle className="w-3 h-3 text-neutral-600" /> Areas of Uncertainty
            </div>
            <ul className="list-disc pl-4 space-y-0.5">
              {report.uncertaintyNotes.map((note, idx) => (
                <li key={idx}>{note}</li>
              ))}
            </ul>
          </div>
        )}
        <div className="space-y-1">
          <div className="font-semibold uppercase tracking-wider">Policy Note</div>
          <p className="leading-relaxed">{report.neutralNote}</p>
        </div>
      </div>
    </div>
  );
}
