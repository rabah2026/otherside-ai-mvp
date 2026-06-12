import React from 'react';
import { OtherSideMode } from '@/types';
import { Zap, BookOpen, Compass } from 'lucide-react';
import { useConfig } from '@/context/ConfigContext';

interface Props {
  selected: OtherSideMode;
  onChange: (mode: OtherSideMode) => void;
}

export default function ModeSelector({ selected, onChange }: Props) {
  const { t } = useConfig();

  const modes: { id: OtherSideMode; label: string; icon: React.ReactNode }[] = [
    {
      id: 'quick',
      label: t('quickCounter'),
      icon: <Zap className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" />,
    },
    {
      id: 'deep',
      label: t('deepDispute'),
      icon: <Compass className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />,
    },
    {
      id: 'history',
      label: t('historyMirror'),
      icon: <BookOpen className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />,
    },
  ];

  return (
    <div className="flex flex-wrap gap-2 justify-center max-w-3xl mx-auto">
      {modes.map((m) => {
        const active = selected === m.id;
        return (
          <button
            key={m.id}
            type="button"
            onClick={() => onChange(m.id)}
            className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium border transition-all ${
              active
                ? 'bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 border-neutral-900 dark:border-neutral-100'
                : 'bg-white dark:bg-transparent text-neutral-500 dark:text-neutral-400 border-neutral-200 dark:border-neutral-800 hover:border-neutral-400 dark:hover:border-neutral-600 hover:text-neutral-800 dark:hover:text-neutral-200'
            }`}
          >
            {m.icon}
            {m.label}
          </button>
        );
      })}
    </div>
  );
}
