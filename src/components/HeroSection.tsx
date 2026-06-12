import React from 'react';
import Link from 'next/link';
import { useConfig } from '@/context/ConfigContext';

export default function HeroSection() {
  const { t, lang } = useConfig();

  return (
    <div className="relative text-center py-20 sm:py-28 overflow-hidden z-10 text-slate-800 dark:text-neutral-300">
      <div className="glow-beam" />
      <div className="max-w-4xl mx-auto px-4 space-y-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-[10px] sm:text-xs font-mono uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
          <span className="w-1.5 h-1.5 rounded-full bg-neutral-400 dark:bg-neutral-500" />
          {lang === 'ar' ? 'مكتب الاستخبارات الجيل الأول' : 'Intelligence Desk MVP'}
        </div>
        <h1 className="text-4xl sm:text-6xl font-serif text-slate-900 dark:text-white tracking-tight font-light leading-none">
          {lang === 'ar' ? (
            <>
              لكل قصة جانب <span className="font-normal italic">آخر</span>.
            </>
          ) : (
            <>
              Every story has <span className="font-normal italic">another</span> side.
            </>
          )}
        </h1>
        <p className="text-base sm:text-lg text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto leading-relaxed font-light">
          {t('desc')}
        </p>
        <div className="pt-4 flex items-center justify-center gap-4">
          <Link
            href="/app"
            className="px-6 py-3 bg-slate-900 dark:bg-white text-white dark:text-black hover:bg-slate-800 dark:hover:bg-neutral-200 transition-colors text-xs font-semibold rounded-lg tracking-wider uppercase"
          >
            {t('cta')}
          </Link>
          <Link
            href="/about"
            className="px-6 py-3 bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 text-slate-700 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white transition-colors text-xs font-semibold rounded-lg tracking-wider uppercase"
          >
            {t('neutralityPolicy')}
          </Link>
        </div>
        <p className="text-xs text-neutral-500 font-mono pt-4">
          {t('policyNote')}
        </p>
      </div>
    </div>
  );
}
