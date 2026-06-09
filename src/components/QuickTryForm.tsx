'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight } from 'lucide-react';
import { useLang } from '@/context/LanguageContext';

export default function QuickTryForm() {
  const [text, setText] = useState('');
  const router = useRouter();
  const { t } = useLang();

  const SAMPLES = [
    { label: t.form_sample_openai, claim: t.demo_openai_claim },
    { label: t.form_sample_galileo, claim: t.demo_galileo_claim },
    { label: t.form_sample_apple, claim: t.demo_apple_claim },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) return;
    router.push(`/app?q=${encodeURIComponent(trimmed)}&autorun=1`);
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto mt-8 space-y-3">
      <div className="flex flex-wrap gap-2 justify-center">
        {SAMPLES.map((s) => (
          <button
            key={s.label}
            type="button"
            onClick={() => setText(s.claim)}
            className={`px-3 py-1 rounded-full border text-xs font-mono transition-all ${
              text === s.claim
                ? 'bg-neutral-800 border-neutral-600 text-white'
                : 'bg-transparent border-neutral-800 text-neutral-500 hover:border-neutral-600 hover:text-neutral-300'
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={t.form_placeholder}
        rows={3}
        className="w-full bg-neutral-950/60 border border-neutral-800 rounded-xl px-4 py-3 text-sm text-neutral-200 placeholder-neutral-600 resize-none focus:outline-none focus:border-neutral-600 transition-colors"
      />
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={!text.trim()}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-black text-xs font-semibold rounded-lg tracking-wider uppercase hover:bg-neutral-200 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          {t.form_submit} <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </form>
  );
}
