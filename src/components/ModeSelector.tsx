import React from 'react';
import { OtherSideMode } from '@/types';
import { Zap, BookOpen, Compass } from 'lucide-react';

interface Props {
  selected: OtherSideMode;
  onChange: (mode: OtherSideMode) => void;
}

export default function ModeSelector({ selected, onChange }: Props) {
  const modes: { id: OtherSideMode; label: string; desc: string; icon: React.ReactNode }[] = [
    {
      id: 'quick',
      label: 'Quick Counter',
      desc: 'Concise summary of alternative views.',
      icon: <Zap className="w-4.5 h-4.5 text-indigo-400" />,
    },
    {
      id: 'deep',
      label: 'Deep Dispute',
      desc: 'Detailed history, timeline and key positions.',
      icon: <Compass className="w-4.5 h-4.5 text-emerald-400" />,
    },
    {
      id: 'history',
      label: 'History Mirror',
      desc: 'For historical disputes — surfaces omitted actors, marginalized voices, and primary documents.',
      icon: <BookOpen className="w-4.5 h-4.5 text-amber-400" />,
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
            className={`text-left p-4 rounded-xl border transition-all ${
              active
                ? 'bg-neutral-900 border-neutral-700 shadow-[0_0_15px_rgba(99,102,241,0.1)] text-white'
                : 'bg-neutral-950/40 border-neutral-900 text-neutral-400 hover:border-neutral-800'
            }`}
          >
            <div className="flex items-center gap-2 mb-1">
              {m.icon}
              <span className="font-semibold text-sm">{m.label}</span>
            </div>
            <p className="text-xs text-neutral-500 leading-normal">{m.desc}</p>
          </button>
        );
      })}
    </div>
  );
}
