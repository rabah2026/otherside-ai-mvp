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
                  {src.sourceType.replace(/_/g, ' ')}
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
                      {src.title} <LinkIcon className="w-2.5 h-2.5 ms-0.5" />
                    </a>
                  ) : (
                    <span>{src.title}</span>
                  )}
                </div>
              )}
              {(src.author || src.year) && (
                <div className="flex items-center gap-3 text-[10px] text-neutral-600">
                  {src.author && (
                    <span className="flex items-center gap-1">
                      <User className="w-2.5 h-2.5" />
                      {src.author}
                    </span>
                  )}
                  {src.year && (
                    <span className="flex items-center gap-1">
                      <Calendar className="w-2.5 h-2.5" />
                      {src.year}
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
