'use client';

import React from 'react';
import Link from 'next/link';
import ReportBrief from '@/components/ReportBrief';
import { OPENAI_REPORT_EN, OPENAI_REPORT_AR } from '@/lib/example-reports';
import { useConfig } from '@/context/ConfigContext';
import ThemeLangControls from '@/components/ThemeLangControls';

export default function Examples() {
  const { t, lang } = useConfig();
  const mockData = lang === 'ar' ? OPENAI_REPORT_AR : OPENAI_REPORT_EN;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 dark:bg-[#050508] dark:text-neutral-300 relative overflow-hidden transition-colors duration-300">
      <div className="glow-beam" />
      
      <div className="max-w-4xl mx-auto px-4 py-20 relative z-10 space-y-12">
        {/* Navigation */}
        <div className="flex justify-between items-center border-b border-neutral-200 dark:border-neutral-900 pb-6">
          <Link href="/" className="font-serif text-slate-900 dark:text-white hover:text-neutral-500 font-semibold tracking-wide">
            {t('title')}
          </Link>
          <div className="flex items-center gap-4">
            <div className="space-x-4 text-xs font-mono">
              <Link href="/app" className="hover:text-slate-900 dark:hover:text-white">{t('workspace')}</Link>
              <Link href="/about" className="hover:text-slate-900 dark:hover:text-white">{t('neutralityPolicy')}</Link>
            </div>
            <ThemeLangControls />
          </div>
        </div>

        {/* Title */}
        <div className="space-y-3 text-center sm:text-left">
          <h1 className="text-3xl sm:text-4xl font-serif text-slate-900 dark:text-white tracking-tight">
            {t('caseStudiesTitle')}
          </h1>
          <p className="text-sm text-neutral-500 max-w-xl">
            {t('caseStudiesSubtitle')}
          </p>
        </div>

        {/* Example Render */}
        <div className="space-y-6">
          <div className="text-xs font-mono uppercase tracking-widest text-neutral-500 font-semibold border-b border-neutral-200 dark:border-neutral-900 pb-2">
            {t('exampleOpenAI')}
          </div>
          <ReportBrief report={mockData} />
        </div>
      </div>
    </div>
  );
}
