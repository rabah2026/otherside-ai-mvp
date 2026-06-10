import React from 'react';
import { OtherSideMode } from '@/types';
import { Zap, BookOpen, Compass } from 'lucide-react';
import { useConfig } from '@/context/ConfigContext';

interface Props {
  selected: OtherSideMode;
  onChange: (mode: OtherSideMode) => void;
}

export default function ModeSelector({ selected, onChange }: Props) {
  const { t, lang } = useConfig();
  
  const modes: { id: OtherSideMode; label: string; desc: string; icon: React.ReactNode }[] = [
    {
      id: 'quick',
      label: t('quickCounter'),
      desc: t('quickCounterDesc'),
      icon: <Zap className="w-4.5 h-4.5 text-indigo-500 dark:text-indigo-400" />,
    },
    {
      id: 'deep',
      label: t('deepDispute'),
      desc: t('deepDisputeDesc'),
      icon: <Compass className="w-4.5 h-4.5 text-emerald-600 dark:text-emerald-400" />,
    },
    {
      id: 'history',
      label: t('historyMirror'),
      desc: t('historyMirrorDesc'),
      icon: <BookOpen className="w-4.5 h-4.5 text-amber-600 dark:text-amber-400" />,
    },
  ];

  return (
    <div className="grid gap-3 sm:grid-cols-3 max-w-3xl mx-auto">
      {modes.map((m) => {
        const active = selected === m.id;
        return (
          <button
            key={m.id}
            type="button"
            onClick={() => onChange(m.id)}
            className={`p-4 rounded-xl border transition-all ${
              lang === 'ar' ? 'text-right' : 'text-left'
            } ${
              active
                ? 'bg-neutral-100 dark:bg-neutral-900 border-neutral-300 dark:border-neutral-700 shadow-[0_0_15px_rgba(99,102,241,0.06)] text-slate-900 dark:text-white'
                : 'bg-neutral-50/50 dark:bg-neutral-950/40 border-neutral-200 dark:border-neutral-900 text-neutral-500 dark:text-neutral-400 hover:border-neutral-300 dark:hover:border-neutral-800'
            }`}
          >
            <div className="flex items-center gap-2 mb-1">
              {m.icon}
              <span className="font-semibold text-sm">{m.label}</span>
            </div>
            <p className="text-xs text-neutral-500 dark:text-neutral-500 leading-normal">{m.desc}</p>
          </button>
        );
      })}
    </div>
  );
}
