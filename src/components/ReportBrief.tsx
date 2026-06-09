'use client';

import React, { useId } from 'react';
import { OtherSideReport } from '@/types';
import NeutralityBadge from './NeutralityBadge';
import EvidenceStrip from './EvidenceStrip';
import DisputedPoints from './DisputedPoints';
import { ShieldCheck, Scale, AlertCircle, FileText, CheckCircle2, FlaskConical } from 'lucide-react';

interface Props {
  report: OtherSideReport;
  demoMode: boolean;
}

export default function ReportBrief({ report, demoMode }: Props) {
  const stableId = useId().replace(/:/g, '').substring(0, 5).toUpperCase();

  return (
    <div className="glass-panel rounded-xl overflow-hidden border border-neutral-800/60 max-w-4xl mx-auto relative">
      {/* Demo mode warning banner — shown prominently above everything */}
      {demoMode && (
        <div className="flex items-start gap-3 px-6 py-4 bg-amber-950/40 border-b border-amber-800/40">
          <FlaskConical className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
          <div className="text-xs text-amber-300 leading-relaxed">
            <span className="font-semibold uppercase tracking-wider">Sample Report — No AI provider connected.</span>
            {' '}This output is a pre-written example, not a live analysis. To generate real reports, configure{' '}
            <code className="font-mono bg-amber-950/60 px-1 rounded">AI_API_BASE_URL</code> and{' '}
            <code className="font-mono bg-amber-950/60 px-1 rounded">OPENAI_API_KEY</code> in your environment.
          </div>
        </div>
      )}

      <div className="p-6 sm:p-8 space-y-8">
        {/* Premium Header */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-6 border-b border-neutral-900">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <NeutralityBadge />
            </div>
            <h2 className="text-xl sm:text-2xl font-serif text-white leading-tight font-semibold">
              Intelligence Brief: The Counter-Position
            </h2>
          </div>
          <div className="text-left sm:text-right text-xs text-neutral-500 font-mono space-y-0.5">
            <div>Report ID: OB-{stableId}</div>
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
    </div>
  );
}
