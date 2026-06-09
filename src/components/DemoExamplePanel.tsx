'use client';

import React from 'react';
import { useLang } from '@/context/LanguageContext';

interface Props {
  onSelect: (claim: string) => void;
}

export default function DemoExamplePanel({ onSelect }: Props) {
  const { t } = useLang();

  const examples = [
    { title: t.demo_openai_title, category: t.demo_openai_category, claim: t.demo_openai_claim },
    { title: t.demo_galileo_title, category: t.demo_galileo_category, claim: t.demo_galileo_claim },
    { title: t.demo_apple_title, category: t.demo_apple_category, claim: t.demo_apple_claim },
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <h3 className="text-xs font-mono uppercase tracking-wider text-neutral-500 font-semibold">
        {t.demo_panel_header}
      </h3>
      <div className="grid gap-3 sm:grid-cols-3">
        {examples.map((ex, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => onSelect(ex.claim)}
            className="text-left p-4 rounded-xl border border-neutral-900 bg-neutral-950/20 hover:border-neutral-800 transition-all space-y-2 group"
          >
            <div className="flex justify-between items-center gap-1">
              <span className="text-[10px] uppercase font-bold text-neutral-500 tracking-wider">
                {ex.category}
              </span>
              <span className="text-[10px] text-neutral-600 group-hover:text-neutral-400 font-mono transition-colors">
                {t.demo_select_arrow}
              </span>
            </div>
            <h4 className="text-sm font-semibold text-neutral-200 group-hover:text-white transition-colors">
              {ex.title}
            </h4>
            <p className="text-xs text-neutral-500 leading-relaxed line-clamp-2">
              {ex.claim}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
}
