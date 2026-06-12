'use client';

import React from 'react';
import HeroSection from '@/components/HeroSection';
import Link from 'next/link';
import { HelpCircle, Sparkles, ShieldCheck } from 'lucide-react';
import { useConfig } from '@/context/ConfigContext';
import ThemeLangControls from '@/components/ThemeLangControls';

export default function Home() {
  const { t, lang } = useConfig();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 dark:bg-[#050508] dark:text-neutral-300 relative overflow-hidden transition-colors duration-300">
      {/* Top Floating bar for language and theme */}
      <div className="absolute top-4 right-4 left-4 z-50 flex justify-end">
        <ThemeLangControls />
      </div>

      <HeroSection />

      {/* Narrative Mode Pillars Section */}
      <div className="max-w-5xl mx-auto px-4 py-16 border-t border-neutral-200 dark:border-neutral-900/60 relative z-10 space-y-12">
        <div className="text-center space-y-2">
          <h2 className="text-xs font-mono uppercase tracking-widest text-neutral-400 dark:text-neutral-500 font-bold">
            {lang === 'ar' ? 'أطر التحليل' : 'Guiding Frameworks'}
          </h2>
          <p className="text-2xl font-serif text-slate-900 dark:text-white font-semibold">
            {lang === 'ar' ? 'ثلاثُ زوايا للتحليل' : 'Three perspectives of analysis'}
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-3">
          <div className="p-6 rounded-xl bg-white dark:bg-neutral-950/40 border border-neutral-200 dark:border-neutral-900 space-y-3 shadow-sm dark:shadow-none">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900/60 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            </div>
            <h3 className="font-serif text-lg text-slate-900 dark:text-white font-semibold">{t('quickCounter')}</h3>
            <p className="text-sm text-neutral-500 leading-relaxed">
              {lang === 'ar'
                ? 'ملخّصٌ سريع للموقف المقابل، يمنحك أهمّ الحجج البديلة مباشرةً دون الخوض في تفاصيل مطوّلة.'
                : 'Immediate context summary. Designed to provide instant access to the core alternative claims and arguments without wading through deep documentation.'}
            </p>
          </div>

          <div className="p-6 rounded-xl bg-white dark:bg-neutral-950/40 border border-neutral-200 dark:border-neutral-900 space-y-3 shadow-sm dark:shadow-none">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 flex items-center justify-center">
              <HelpCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h3 className="font-serif text-lg text-slate-900 dark:text-white font-semibold">{t('deepDispute')}</h3>
            <p className="text-sm text-neutral-500 leading-relaxed">
              {lang === 'ar'
                ? 'رسمٌ كاملٌ لخريطة النزاع: تسلسلٌ زمني، ونقاطُ خلافٍ مفصّلة، ومراجعةٌ لتصريحات الأطراف الرسمية.'
                : 'Exhaustive dispute mapping. Generates a breakdown of the debate timeline, point-by-point disagreements, and source-backed official responses.'}
            </p>
          </div>

          <div className="p-6 rounded-xl bg-white dark:bg-neutral-950/40 border border-neutral-200 dark:border-neutral-900 space-y-3 shadow-sm dark:shadow-none">
            <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            </div>
            <h3 className="font-serif text-lg text-slate-900 dark:text-white font-semibold">{t('historyMirror')}</h3>
            <p className="text-sm text-neutral-500 leading-relaxed">
              {lang === 'ar'
                ? 'إعادةُ قراءةٍ للروايات التاريخية، تُسلّط الضوء على وجهات النظر البديلة أو المهمّشة في المصادر الأولية.'
                : 'Perspective alignment tool. Re-contextualizes historical narratives by evaluating marginalized or unexamined historical actors and primary documents.'}
            </p>
          </div>
        </div>
      </div>

      {/* Simple Editorial How It Works Section */}
      <div className="max-w-4xl mx-auto px-4 py-16 border-t border-neutral-200 dark:border-neutral-900/60 relative z-10 text-center space-y-8">
        <h2 className="text-xs font-mono uppercase tracking-widest text-neutral-400 dark:text-neutral-500 font-bold">
          {lang === 'ar' ? 'آلية العمل' : 'The Process'}
        </h2>
        <div className={`grid gap-6 sm:grid-cols-3 ${lang === 'ar' ? 'text-right' : 'text-left'}`}>
          <div className="space-y-1">
            <div className="text-sm font-mono text-neutral-400 dark:text-neutral-600">{lang === 'ar' ? '٠١ / الإدخال' : '01 / SUBMIT'}</div>
            <h4 className="text-sm font-semibold text-slate-900 dark:text-white">{lang === 'ar' ? 'الصق رواية أحد الطرفين' : 'Paste one side'}</h4>
            <p className="text-xs text-neutral-500 leading-relaxed">{lang === 'ar' ? 'أدخِل أي ادعاءٍ أو مقتطف مقالٍ أو تغريدة.' : 'Input any statement, article snippet, or news excerpt.'}</p>
          </div>
          <div className="space-y-1">
            <div className="text-sm font-mono text-neutral-400 dark:text-neutral-600">{lang === 'ar' ? '٠٢ / التحديد' : '02 / DETECT'}</div>
            <h4 className="text-sm font-semibold text-slate-900 dark:text-white">{lang === 'ar' ? 'تحديد الأطراف' : 'Identify parties'}</h4>
            <p className="text-xs text-neutral-500 leading-relaxed">{lang === 'ar' ? 'يُحلّل المحرّك النص فيُحدّد أطراف النزاع وادعاءاته الأساسية.' : 'The AI parses claims, identifying core organizations and alternative parties.'}</p>
          </div>
          <div className="space-y-1">
            <div className="text-sm font-mono text-neutral-400 dark:text-neutral-600">{lang === 'ar' ? '٠٣ / البناء' : '03 / CONSTRUCT'}</div>
            <h4 className="text-sm font-semibold text-slate-900 dark:text-white">{lang === 'ar' ? 'مرآةٌ محايدة' : 'Guarded Mirror'}</h4>
            <p className="text-xs text-neutral-500 leading-relaxed">{lang === 'ar' ? 'يُعرَض تقريرٌ محايدٌ لرواية الجانب الآخر مع مصادرَ مُقيَّمة.' : 'A neutrality-guarded counter-story is outputted with evaluated citations.'}</p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-12 border-t border-neutral-200 dark:border-neutral-900 text-center text-xs text-neutral-400 dark:text-neutral-600 space-y-2">
        <div>{lang === 'ar' ? '«الجانب الآخر» © 2026 — غير منحازٍ وموضوعيٌّ بالتصميم.' : 'OtherSide AI © 2026. Non-partisan and objective by design.'}</div>
        <div className="space-x-4">
          <Link href="/about" className="hover:text-neutral-600 dark:hover:text-neutral-400">{t('neutralityPolicy')}</Link>
          <Link href="/examples" className="hover:text-neutral-600 dark:hover:text-neutral-400">{t('examples')}</Link>
          <Link href="/app" className="hover:text-neutral-600 dark:hover:text-neutral-400">{t('workspace')}</Link>
        </div>
      </footer>
    </div>
  );
}
