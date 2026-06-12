'use client';

import React from 'react';
import Link from 'next/link';
import { useConfig } from '@/context/ConfigContext';
import ThemeLangControls from '@/components/ThemeLangControls';

export default function About() {
  const { t, lang } = useConfig();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 dark:bg-[#050508] dark:text-neutral-300 relative overflow-hidden transition-colors duration-300">
      <div className="glow-beam" />
      
      <div className="max-w-3xl mx-auto px-4 py-20 relative z-10 space-y-12">
        {/* Navigation */}
        <div className="flex justify-between items-center border-b border-neutral-200 dark:border-neutral-900 pb-6">
          <Link href="/" className="font-serif text-slate-900 dark:text-white hover:text-neutral-500 font-semibold tracking-wide">
            {t('title')}
          </Link>
          <div className="flex items-center gap-4">
            <div className="space-x-4 text-xs font-mono">
              <Link href="/app" className="hover:text-slate-900 dark:hover:text-white">{t('workspace')}</Link>
              <Link href="/examples" className="hover:text-slate-900 dark:hover:text-white">{t('examples')}</Link>
            </div>
            <ThemeLangControls />
          </div>
        </div>

        {/* Title */}
        <div className="space-y-3">
          <h1 className="text-3xl sm:text-4xl font-serif text-slate-900 dark:text-white tracking-tight">
            {t('policyTitle')}
          </h1>
          <p className="text-xs font-mono text-neutral-500 uppercase tracking-widest">
            {t('policySubtitle')}
          </p>
        </div>

        {/* Content Pillars */}
        {lang === 'ar' ? (
          <div className="space-y-8 font-light leading-relaxed text-sm">
            <section className="space-y-3">
              <h2 className="text-lg font-serif text-slate-900 dark:text-white font-medium">1. الغياب التام لتقرير الأحكام</h2>
              <p>
                لا يقوم الجانب الآخر AI بالتحكيم في النزاعات، أو تحديد الصحة المطلقة، أو إصدار أحكام نهائية. نحن نرفض التقسيم الثنائي البسيط للمسائل المعقدة. تم بناء برنامجنا فقط لعرض المنظور المقابل لأي قصة يتم تقديمها.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-serif text-slate-900 dark:text-white font-medium">2. تقديم الروايات المقابلة</h2>
              <p>
                يحتوي كل نزاع عام على سياقات مهملة، واختلافات في الافتراضات التأسيسية، وتفسيرات متباينة للحقائق. هدفنا هو صياغة أقوى نسخة عادلة ممكنة من هذا المنظور البديل حتى يتمكن المستخدمون من قراءة النزاع بسياق متوازن.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-serif text-slate-900 dark:text-white font-medium">3. سياسة اللغة اللغوية المحمية</h2>
              <p>
                لضمان النزاهة التامة، تمر جميع التقارير التي يتم إنشاؤها عبر مصفاة حماية لغوية صارمة. يتم تلقائيًا استبدال الكلمات التي تشير إلى المطلقات الأخلاقية أو الخداع المطلق أو الصحة المؤكدة بعبارات مشروطة وموضوعية (مثل "يبدو أنه يدعي"، "يعارض هذا التمثيل").
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-serif text-slate-900 dark:text-white font-medium">4. شفافية الاستشهاد بالمصادر</h2>
              <p>
                نحن نعطي الأولوية للمصادر الأولية (التصريحات الرسمية للمنظمات، والملفات القضائية، والنسخ المباشرة) على التقارير الصحفية الثانوية. يتم تصنيف كل مصدر وقوته بشكل واضح:
              </p>
              <ul className={`list-disc space-y-1 text-neutral-500 dark:text-neutral-400 text-xs ${lang === 'ar' ? 'pr-5' : 'pl-5'}`}>
                <li><strong>قوي:</strong> أدلة مباشرة غير مصفاة (مثل مذكرات المحكمة، والبيانات الصحفية الرسمية).</li>
                <li><strong>متوسط:</strong> تقارير صحفية متوازنة، أو سياقات تنظيمية موثوقة.</li>
                <li><strong>ضعيف:</strong> ادعاءات عامة غير مؤكدة، أو منشورات رأي وتدوينات غير مسندة بمصادر.</li>
              </ul>
            </section>

            <section className="p-5 rounded-lg bg-neutral-200/40 dark:bg-neutral-900/30 border border-neutral-300 dark:border-neutral-800/40 text-xs italic space-y-2">
              <p className="font-semibold text-neutral-800 dark:text-neutral-300 not-italic">{t('disclaimerTitle')}</p>
              {t('disclaimerText')}
            </section>
          </div>
        ) : (
          <div className="space-y-8 font-light leading-relaxed text-sm">
            <section className="space-y-3">
              <h2 className="text-lg font-serif text-slate-900 dark:text-white font-medium">1. Absolute Lack of Verdicts</h2>
              <p>
                OtherSide AI does not arbitrate disputes, determine absolute correctness, or issue verdicts. We reject the binary categorization of complex matters. Our software is built solely to present the counter-perspective of a submitted narrative.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-serif text-slate-900 dark:text-white font-medium">2. Counter-Narrative Presentation</h2>
              <p>
                Every public dispute contains overlooked context, differences in foundational assumptions, and varying interpretations of facts. Our goal is to synthesize the strongest possible fair version of that alternative perspective so users can read the dispute with balanced context.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-serif text-slate-900 dark:text-white font-medium">3. Guarded Language Policy</h2>
              <p>
                To ensure impartiality, all generated summaries pass through a static Neutrality Guard. Words implying moral absolutes, outright deception, or absolute correctness are replaced with conditional, objective phrases (e.g., "appears to claim", "disputes this representation").
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-serif text-slate-900 dark:text-white font-medium">4. Transparency of Citations</h2>
              <p>
                We prioritize primary sources (official organization statements, court filings, direct transcripts) over secondary reporting. Each source is evaluated and labelled by strength:
              </p>
              <ul className="list-disc pl-5 space-y-1 text-neutral-500 dark:text-neutral-400 text-xs">
                <li><strong>Strong:</strong> Direct, unfiltered evidence (e.g. court motions, official press releases).</li>
                <li><strong>Medium:</strong> Balanced journalistic reporting, regulatory context.</li>
                <li><strong>Weak:</strong> Unverified public claims, opinion blogs, indirect comments.</li>
              </ul>
            </section>

            <section className="p-5 rounded-lg bg-neutral-200/40 dark:bg-neutral-900/30 border border-neutral-300 dark:border-neutral-800/40 text-xs italic space-y-2">
              <p className="font-semibold text-neutral-800 dark:text-neutral-300 not-italic">{t('disclaimerTitle')}</p>
              {t('disclaimerText')}
            </section>
          </div>
        )}

        {/* Footer */}
        <div className="pt-12 border-t border-neutral-200 dark:border-neutral-900 text-center">
          <Link
            href="/app"
            className="inline-block px-6 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-black hover:bg-slate-800 dark:hover:bg-neutral-200 transition-colors text-xs font-semibold rounded-lg tracking-wider uppercase"
          >
            {t('launchWorkspace')}
          </Link>
        </div>
      </div>
    </div>
  );
}
