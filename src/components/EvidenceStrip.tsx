'use client';

import React from 'react';
import { SourceNote } from '@/types';
import SourceStrengthBadge from './SourceStrengthBadge';
import { FileText, Link as LinkIcon, BookOpen, User, Calendar } from 'lucide-react';
import { useLang } from '@/context/LanguageContext';

interface Props {
  sources: SourceNote[];
}

export default function EvidenceStrip({ sources }: Props) {
  const { t } = useLang();
  if (!sources || sources.length === 0) return null;

  const sourceTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      official_statement: t.source_type_official_statement,
      court_filing: t.source_type_court_filing,
      reporting: t.source_type_reporting,
      primary_source: t.source_type_primary_source,
      historical_record: t.source_type_historical_record,
      unknown: t.source_type_unknown,
    };
    return labels[type] ?? type.replace(/_/g, ' ');
  };

  return (
    <div className="space-y-3">
      <h3 className="text-xs uppercase tracking-wider text-neutral-500 font-semibold flex items-center gap-1.5">
        <BookOpen className="w-3.5 h-3.5" /> {t.evidence_title}
      </h3>
      <div className="grid gap-3 sm:grid-cols-2">
        {sources.map((src, idx) => (
          <div key={idx} className="p-3.5 rounded-lg bg-neutral-900/30 border border-neutral-800/40 flex flex-col justify-between space-y-2">
            <div>
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <span className="text-[10px] uppercase font-bold text-neutral-500 tracking-wider">
                  {sourceTypeLabel(src.sourceType)}
                </span>
                <SourceStrengthBadge strength={src.strength} />
              </div>
              <p className="text-sm text-neutral-300 leading-relaxed">{src.note}</p>
            </div>
            <div className="pt-2 border-t border-neutral-900 space-y-1.5">
              {src.title && (
                <div className="flex items-center gap-1 text-xs text-neutral-400 font-medium hover:text-neutral-200 transition-colors">
                  <FileText className="w-3 h-3 text-neutral-500 flex-shrink-0" />
                  {src.url ? (
                    <a href={src.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-0.5 hover:underline">
                      <span dir="auto">{src.title}</span> <LinkIcon className="w-2.5 h-2.5 ms-0.5" />
                    </a>
                  ) : (
                    <span dir="auto">{src.title}</span>
                  )}
                </div>
              )}
              {(src.author || src.year) && (
                <div className="flex items-center gap-3 text-[10px] text-neutral-600">
                  {src.author && (
                    <span className="flex items-center gap-1">
                      <User className="w-2.5 h-2.5 flex-shrink-0" />
                      <span dir="auto">{src.author}</span>
                    </span>
                  )}
                  {src.year && (
                    <span className="flex items-center gap-1">
                      <Calendar className="w-2.5 h-2.5 flex-shrink-0" />
                      <span dir="ltr">{src.year}</span>
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
