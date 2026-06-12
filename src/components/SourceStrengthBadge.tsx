import React from 'react';
import { SourceStrength } from '@/types';
import { useConfig } from '@/context/ConfigContext';

interface Props {
  strength: SourceStrength;
}

export default function SourceStrengthBadge({ strength }: Props) {
  const { lang } = useConfig();

  const config: Record<SourceStrength, { label: { en: string; ar: string }; className: string }> = {
    strong: {
      label: { en: 'Strong source', ar: 'مصدر قوي' },
      className: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/50',
    },
    medium: {
      label: { en: 'Medium source', ar: 'مصدر متوسط' },
      className: 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800/50',
    },
    weak: {
      label: { en: 'Weak source', ar: 'مصدر ضعيف' },
      className: 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-800/50',
    },
    missing: {
      label: { en: 'No source', ar: 'بدون مصدر' },
      className: 'bg-neutral-100 dark:bg-neutral-900 text-neutral-500 border-neutral-200 dark:border-neutral-800',
    },
  };

  const { label, className } = config[strength] ?? config.missing;

  return (
    <span className={`inline-block px-2 py-0.5 text-[10px] font-medium rounded-full border ${className}`}>
      {label[lang] ?? label.en}
    </span>
  );
}
