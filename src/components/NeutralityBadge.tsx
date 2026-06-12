import React from 'react';
import { useConfig } from '@/context/ConfigContext';

export default function NeutralityBadge() {
  const { t } = useConfig();
  return (
    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-neutral-100 dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 border border-neutral-200 dark:border-neutral-800">
      <span className="w-1.5 h-1.5 rounded-full bg-neutral-400 dark:bg-neutral-500 animate-pulse" />
      {t('neutralPositionGuarded')}
    </div>
  );
}
