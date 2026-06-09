'use client';

import React, { useId } from 'react';
import { OtherSideReport } from '@/types';
import NeutralityBadge from './NeutralityBadge';
import EvidenceStrip from './EvidenceStrip';
import DisputedPoints from './DisputedPoints';
import { ShieldCheck, Scale, AlertCircle, FileText, CheckCircle2 } from 'lucide-react';
import { useLang } from '@/context/LanguageContext';

interface Props {
  report: OtherSideReport;
  demoMode: boolean;
}

export default function ReportBrief({ report, demoMode }: Props) {
  const { t } = useLang();
  const stableId = useId().replace(/:/g, '').substring(0, 5).toUpperCase();

  return (
    <div className="glass-panel rounded-xl overflow-hidden border border-neutral-800/60 max-w-4xl mx-auto relative">
      {demoMode && (
        <div className="flex items-start gap-3 px-6 py-4 bg-amber-950/40 border-b border-amber-800/40">
          <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
          <div className="text-xs text-amber-300 leading-relaxed">
            <span className="font-semibold uppercase tracking-wider">{t.report_demo_title}</span>
            {' '}{t.report_demo_body_prefix}{' '}
            <code className="font-mono bg-amber-950/60 px-1 rounded">{t.report_demo_env_key1}</code>
            {' '}&amp;{' '}
            <code className="font-mono bg-amber-950/60 px-1 rounded">{t.report_demo_env_key2}</code>
            {' '}{t.report_demo_body_suffix}
          </div>
        </div>
      )}

      <div className="p-6 sm:p-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-6 border-b border-neutral-900">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <NeutralityBadge />
            </div>
            <h2 className="text-xl sm:text-2xl font-serif text-white leading-tight font-semibold">
              {t.report_title}
            </h2>
          </div>
          <div className="text-left sm:text-right text-xs text-neutral-500 font-mono space-y-0.5">
            <div>{t.report_id_prefix} OB-{stableId}</div>
            <div>{t.report_classification}</div>
          </div>
        </div>

        <div className="bg-neutral-900/20 border border-neutral-800/30 p-4 rounded-lg space-y-2">
          <div className="text-[10px] uppercase font-bold tracking-wider text-neutral-500 flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5" /> {t.report_detected_narrative}
          </div>
          <p className="text-sm text-neutral-400 leading-relaxed italic">
            "{report.detectedStory}"
          </p>
          <div className="grid grid-cols-2 gap-4 pt-3 border-t border-neutral-900 text-xs">
            <div>
              <span className="text-neutral-500">{t.report_main_party}</span>{' '}
              <span className="text-neutral-300 font-medium">{report.mainParty}</span>
            </div>
            <div>
              <span className="text-neutral-500">{t.report_other_party}</span>{' '}
              <span className="text-neutral-300 font-medium">{report.otherParty}</span>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <h3 className="text-xs uppercase tracking-wider text-neutral-500 font-semibold flex items-center gap-1.5">
            <Scale className="w-3.5 h-3.5" /> {t.report_other_side_title}
          </h3>
          <p className="text-base text-neutral-200 leading-relaxed font-serif">
            {report.otherSideStory}
          </p>
        </div>

        <div className="p-5 rounded-lg border-s-2 border-neutral-700 bg-neutral-900/20 space-y-2">
          <h3 className="text-xs uppercase tracking-wider text-neutral-400 font-semibold flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-neutral-400" /> {t.report_strongest_counter_title}
          </h3>
          <p className="text-sm text-neutral-300 leading-relaxed">
            {report.strongestCounterArgument}
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          {report.bothSidesAgreeOn && report.bothSidesAgreeOn.length > 0 && (
            <div className="space-y-2.5">
              <h3 className="text-xs uppercase tracking-wider text-neutral-500 font-semibold flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" /> {t.report_agreement_title}
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
          <DisputedPoints points={report.disputedPoints} />
        </div>

        <div className="thin-divider" />
        <EvidenceStrip sources={report.sourceNotes} />

        <div className="grid gap-4 sm:grid-cols-2 pt-4 text-xs text-neutral-500 border-t border-neutral-900">
          {report.uncertaintyNotes && report.uncertaintyNotes.length > 0 && (
            <div className="space-y-1">
              <div className="font-semibold uppercase tracking-wider flex items-center gap-1">
                <AlertCircle className="w-3 h-3 text-neutral-600" /> {t.report_uncertainty_title}
              </div>
              <ul className="list-disc ps-4 space-y-0.5">
                {report.uncertaintyNotes.map((note, idx) => (
                  <li key={idx}>{note}</li>
                ))}
              </ul>
            </div>
          )}
          <div className="space-y-1">
            <div className="font-semibold uppercase tracking-wider">{t.report_policy_note_title}</div>
            <p className="leading-relaxed">{report.neutralNote}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
