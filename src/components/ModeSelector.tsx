'use client';

import React from 'react';
import { OtherSideMode } from '@/types';
import { Zap, BookOpen, Compass } from 'lucide-react';
import { useLang } from '@/context/LanguageContext';

interface Props {
  selected: OtherSideMode;
  onChange: (mode: OtherSideMode) => void;
}

export default function ModeSelector({ selected, onChange }: Props) {
  const { t } = useLang();

  const modes: { id: OtherSideMode; label: string; desc: string; icon: React.ReactNode }[] = [
    {
      id: 'quick',
      label: t.mode_quick_label,
      desc: t.mode_quick_desc,
      icon: <Zap className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />,
    },
    {
      id: 'deep',
      label: t.mode_deep_label,
      desc: t.mode_deep_desc,
      icon: <Compass className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />,
    },
    {
      id: 'history',
      label: t.mode_history_label,
      desc: t.mode_history_desc,
      icon: <BookOpen className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />,
    },
  ];

  const active = modes.find((m) => m.id === selected)!;

  return (
    <div className="max-w-3xl mx-auto space-y-2">
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
      <p className="text-xs text-neutral-500 text-center px-2 min-h-[1.25rem]">
        {active.desc}
      </p>
    </div>
  );
}
