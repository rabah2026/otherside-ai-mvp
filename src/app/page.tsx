'use client';

import React from 'react';
import HeroSection from '@/components/HeroSection';
import Link from 'next/link';
import { HelpCircle, Sparkles, ShieldCheck } from 'lucide-react';
import LanguageToggle from '@/components/LanguageToggle';
import { useLang } from '@/context/LanguageContext';

export default function Home() {
  const { t } = useLang();

  return (
    <div className="min-h-screen bg-[#050508] relative overflow-hidden text-neutral-300">
      {/* Top nav bar with language toggle */}
      <div className="max-w-5xl mx-auto px-4 pt-4 flex justify-end relative z-20">
        <LanguageToggle />
      </div>

      <HeroSection />

      {/* Narrative Mode Pillars */}
      <div className="max-w-5xl mx-auto px-4 py-16 border-t border-neutral-900/60 relative z-10 space-y-12">
        <div className="text-center space-y-2">
          <h2 className="text-xs font-mono uppercase tracking-widest text-neutral-500 font-bold">
            {t.pillars_header}
          </h2>
          <p className="text-2xl font-serif text-white font-semibold">
            {t.pillars_title}
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-3">
          <div className="p-6 rounded-xl bg-neutral-950/40 border border-neutral-900 space-y-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-950/40 border border-indigo-900/60 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-indigo-400" />
            </div>
            <h3 className="font-serif text-lg text-white font-semibold">{t.pillar_quick_title}</h3>
            <p className="text-sm text-neutral-500 leading-relaxed">{t.pillar_quick_desc}</p>
          </div>

          <div className="p-6 rounded-xl bg-neutral-950/40 border border-neutral-900 space-y-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-950/40 border border-emerald-900/60 flex items-center justify-center">
              <HelpCircle className="w-4 h-4 text-emerald-400" />
            </div>
            <h3 className="font-serif text-lg text-white font-semibold">{t.pillar_deep_title}</h3>
            <p className="text-sm text-neutral-500 leading-relaxed">{t.pillar_deep_desc}</p>
          </div>

          <div className="p-6 rounded-xl bg-neutral-950/40 border border-neutral-900 space-y-3">
            <div className="w-8 h-8 rounded-lg bg-amber-950/40 border border-amber-900/60 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4 text-amber-400" />
            </div>
            <h3 className="font-serif text-lg text-white font-semibold">{t.pillar_history_title}</h3>
            <p className="text-sm text-neutral-500 leading-relaxed">{t.pillar_history_desc}</p>
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div className="max-w-4xl mx-auto px-4 py-16 border-t border-neutral-900/60 relative z-10 text-center space-y-8">
        <h2 className="text-xs font-mono uppercase tracking-widest text-neutral-500 font-bold">
          {t.process_header}
        </h2>
        <div className="grid gap-6 sm:grid-cols-3 text-start">
          <div className="space-y-1">
            <div className="text-sm font-mono text-neutral-600">{t.process_s1_num}</div>
            <h4 className="text-sm font-semibold text-white">{t.process_s1_title}</h4>
            <p className="text-xs text-neutral-500 leading-relaxed">{t.process_s1_desc}</p>
          </div>
          <div className="space-y-1">
            <div className="text-sm font-mono text-neutral-600">{t.process_s2_num}</div>
            <h4 className="text-sm font-semibold text-white">{t.process_s2_title}</h4>
            <p className="text-xs text-neutral-500 leading-relaxed">{t.process_s2_desc}</p>
          </div>
          <div className="space-y-1">
            <div className="text-sm font-mono text-neutral-600">{t.process_s3_num}</div>
            <h4 className="text-sm font-semibold text-white">{t.process_s3_title}</h4>
            <p className="text-xs text-neutral-500 leading-relaxed">{t.process_s3_desc}</p>
          </div>
        </div>
      </div>

      <footer className="py-12 border-t border-neutral-900 text-center text-xs text-neutral-600 space-y-2">
        <div>{t.footer_copy}</div>
        <div className="space-x-4">
          <Link href="/about" className="hover:text-neutral-400">{t.nav_neutrality_policy}</Link>
          <Link href="/examples" className="hover:text-neutral-400">{t.nav_examples}</Link>
          <Link href="/app" className="hover:text-neutral-400">{t.nav_workspace}</Link>
        </div>
      </footer>
    </div>
  );
}
