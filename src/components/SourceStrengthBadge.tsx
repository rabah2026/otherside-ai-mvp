import React from 'react';
import { SourceStrength } from '@/types';

interface Props {
  strength: SourceStrength;
}

export default function SourceStrengthBadge({ strength }: Props) {
  const getColors = () => {
    switch (strength) {
      case 'strong':
        return 'bg-emerald-950/40 text-emerald-400 border-emerald-800/60';
      case 'medium':
        return 'bg-amber-950/40 text-amber-400 border-amber-800/60';
      case 'weak':
        return 'bg-rose-950/40 text-rose-400 border-rose-800/60';
      case 'missing':
      default:
        return 'bg-neutral-900 text-neutral-500 border-neutral-800';
    }
  };

  return (
    <span className={`inline-block px-2 py-0.5 text-[10px] font-medium rounded border ${getColors()} uppercase tracking-wider`}>
      {strength} source
    </span>
  );
}
