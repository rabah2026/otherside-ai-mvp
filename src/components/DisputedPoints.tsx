'use client';

import React from 'react';
import { HelpCircle } from 'lucide-react';
import { useLang } from '@/context/LanguageContext';

interface Props {
  points: string[];
}

export default function DisputedPoints({ points }: Props) {
  const { t } = useLang();
  if (!points || points.length === 0) return null;

  return (
    <div className="space-y-2.5">
      <h3 className="text-xs uppercase tracking-wider text-neutral-500 font-semibold flex items-center gap-1.5">
        <HelpCircle className="w-3.5 h-3.5" /> {t.disputed_title}
      </h3>
      <ul className="space-y-2">
        {points.map((pt, idx) => (
          <li key={idx} className="flex gap-2.5 items-start text-sm text-neutral-300">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500/80 mt-1.5 flex-shrink-0" />
            <span className="leading-relaxed">{pt}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
