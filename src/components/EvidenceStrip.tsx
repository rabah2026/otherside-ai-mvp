import React from 'react';
import { SourceNote } from '@/types';
import SourceStrengthBadge from './SourceStrengthBadge';
import { FileText, Link as LinkIcon, BookOpen } from 'lucide-react';
import { useConfig } from '@/context/ConfigContext';

interface Props {
  sources: SourceNote[];
}

export default function EvidenceStrip({ sources }: Props) {
  const { t } = useConfig();
  if (!sources || sources.length === 0) return null;

  return (
    <div className="space-y-3">
      <h3 className="text-xs uppercase tracking-wider text-neutral-500 font-semibold flex items-center gap-1.5">
        <BookOpen className="w-3.5 h-3.5" /> {t('refSources')}
      </h3>
      <div className="grid gap-3 sm:grid-cols-2">
        {sources.map((src, idx) => (
          <div key={idx} className="p-3.5 rounded-lg bg-neutral-100/40 dark:bg-neutral-900/30 border border-neutral-200 dark:border-neutral-800/40 flex flex-col justify-between space-y-2">
            <div>
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <span className="text-[10px] uppercase font-bold text-neutral-500 tracking-wider">
                  {src.sourceType.replace('_', ' ')}
                </span>
                <SourceStrengthBadge strength={src.strength} />
              </div>
              <p className="text-sm text-neutral-800 dark:text-neutral-300 leading-relaxed">{src.note}</p>
            </div>
            {src.title && (
              <div className="pt-2 border-t border-neutral-200 dark:border-neutral-900 flex items-center gap-1 text-xs text-neutral-600 dark:text-neutral-400 font-medium hover:text-neutral-900 dark:hover:text-neutral-200 transition-colors">
                <FileText className="w-3 h-3 text-neutral-400 dark:text-neutral-500" />
                {src.url ? (
                  <a href={src.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-0.5 hover:underline">
                    {src.title} <LinkIcon className="w-2.5 h-2.5 ml-0.5" />
                  </a>
                ) : (
                  <span>{src.title}</span>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
