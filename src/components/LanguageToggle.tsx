'use client';

import React from 'react';
import { useLang } from '@/context/LanguageContext';
import { Languages } from 'lucide-react';

export default function LanguageToggle() {
  const { toggleLang, t } = useLang();
  return (
    <button
      type="button"
      onClick={toggleLang}
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-neutral-800 bg-neutral-950/40 text-[11px] font-mono text-neutral-400 hover:text-white hover:border-neutral-600 transition-all"
    >
      <Languages className="w-3.5 h-3.5" />
      {t.lang_switch}
    </button>
  );
}
