import React from 'react';
import { SourceStrength } from '@/types';
import { useConfig } from '@/context/ConfigContext';

interface Props {
  strength: SourceStrength;
}

export default function SourceStrengthBadge({ strength }: Props) {
  const { t } = useConfig();
  
  const getColors = () => {
    switch (strength) {
      case 'strong':
        return 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-300 dark:border-emerald-800/60';
      case 'medium':
        return 'bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border-amber-300 dark:border-amber-800/60';
      case 'weak':
        return 'bg-rose-100 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border-rose-300 dark:border-rose-800/60';
      case 'missing':
      default:
        return 'bg-neutral-100 dark:bg-neutral-900 text-neutral-500 border-neutral-200 dark:border-neutral-800';
    }
  };

  return (
    <span className={`inline-block px-2 py-0.5 text-[10px] font-medium rounded border ${getColors()} uppercase tracking-wider`}>
      {strength} {t('sourceStrength')}
    </span>
  );
}
