'use client';

import React from 'react';
import { OtherSideMode } from '@/types';
import { Zap, BookOpen, Compass } from 'lucide-react';

interface Props {
  selected: OtherSideMode;
  onChange: (mode: OtherSideMode) => void;
}

const modes: { id: OtherSideMode; label: string; desc: string; icon: React.ReactNode }[] = [
  {
    id: 'quick',
    label: 'Quick Counter',
    desc: 'Fast summary of the core alternative argument — no timeline, just the key counter-claim.',
    icon: <Zap className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />,
  },
  {
    id: 'deep',
    label: 'Deep Dispute',
    desc: 'Full breakdown with timeline, point-by-point disagreements, and source-backed responses.',
    icon: <Compass className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />,
  },
  {
    id: 'history',
    label: 'History Mirror',
    desc: 'For historical events — surfaces omitted actors, marginalized voices, and primary documents.',
    icon: <BookOpen className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />,
  },
];

export default function ModeSelector({ selected, onChange }: Props) {
  const active = modes.find((m) => m.id === selected)!;

  return (
    <div className="max-w-3xl mx-auto space-y-2">
      {/* Compact pill tabs */}
      <div className="flex rounded-xl bg-neutral-950/60 border border-neutral-900 p-1 gap-1">
        {modes.map((m) => (
          <button
            key={m.id}
            type="button"
            onClick={() => onChange(m.id)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-2 sm:px-3 rounded-lg text-[11px] sm:text-xs font-semibold transition-all ${
              selected === m.id
                ? 'bg-neutral-800 text-white shadow-sm'
                : 'text-neutral-500 hover:text-neutral-300'
            }`}
          >
            {m.icon}
            <span className="truncate">{m.label}</span>
          </button>
        ))}
      </div>

      {/* Description for selected mode only */}
      <p className="text-xs text-neutral-500 text-center px-2 min-h-[1.25rem] transition-all">
        {active.desc}
      </p>
    </div>
  );
}
