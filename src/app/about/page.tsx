'use client';

import React from 'react';
import Link from 'next/link';
import LanguageToggle from '@/components/LanguageToggle';
import { useLang } from '@/context/LanguageContext';

export default function About() {
  const { t } = useLang();

  return (
    <div className="min-h-screen bg-[#050508] text-neutral-300 relative overflow-hidden">
      <div className="glow-beam" />

      <div className="max-w-3xl mx-auto px-4 py-20 relative z-10 space-y-12">
        <div className="flex justify-between items-center border-b border-neutral-900 pb-6">
          <Link href="/" className="font-serif text-white hover:text-neutral-400 font-semibold tracking-wide">
            {t.nav_brand}
          </Link>
          <div className="flex items-center gap-3 text-xs font-mono">
            <Link href="/app" className="hover:text-white">{t.nav_workspace}</Link>
            <Link href="/examples" className="hover:text-white">{t.nav_examples}</Link>
            <LanguageToggle />
          </div>
        </div>

        <div className="space-y-3">
          <h1 className="text-3xl sm:text-4xl font-serif text-white tracking-tight">
            {t.about_title}
          </h1>
          <p className="text-xs font-mono text-neutral-500 uppercase tracking-widest">
            {t.about_updated}
          </p>
        </div>

        <div className="space-y-8 font-light leading-relaxed text-sm">
          <section className="space-y-3">
            <h2 className="text-lg font-serif text-white font-medium">{t.about_s1_title}</h2>
            <p>{t.about_s1_body}</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-serif text-white font-medium">{t.about_s2_title}</h2>
            <p>{t.about_s2_body}</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-serif text-white font-medium">{t.about_s3_title}</h2>
            <p>{t.about_s3_body}</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-serif text-white font-medium">{t.about_s4_title}</h2>
            <p>{t.about_s4_body}</p>
            <ul className="list-disc ps-5 space-y-1 text-neutral-400 text-xs">
              <li><strong>{t.about_strong_label}</strong> {t.about_strong_desc}</li>
              <li><strong>{t.about_medium_label}</strong> {t.about_medium_desc}</li>
              <li><strong>{t.about_weak_label}</strong> {t.about_weak_desc}</li>
            </ul>
          </section>

          <section className="p-5 rounded-lg bg-neutral-900/30 border border-neutral-800/40 text-xs italic space-y-2">
            <p className="font-semibold text-neutral-300 not-italic">{t.about_disclaimer_title}</p>
            {t.about_disclaimer_body}
          </section>
        </div>

        <div className="pt-12 border-t border-neutral-900 text-center">
          <Link
            href="/app"
            className="inline-block px-6 py-2.5 bg-white text-black hover:bg-neutral-200 transition-colors text-xs font-semibold rounded-lg tracking-wider uppercase"
          >
            {t.about_launch_btn}
          </Link>
        </div>
      </div>
    </div>
  );
}
