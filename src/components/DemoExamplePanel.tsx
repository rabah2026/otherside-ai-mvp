import React from 'react';
import { useConfig } from '@/context/ConfigContext';

interface Example {
  title: string;
  claim: string;
  category: string;
  titleAr: string;
  claimAr: string;
  categoryAr: string;
}

interface Props {
  onSelect: (claim: string) => void;
}

export default function DemoExamplePanel({ onSelect }: Props) {
  const { t, lang } = useConfig();
  
  const examples: Example[] = [
    {
      title: 'OpenAI vs Elon Musk',
      category: 'Corporate Dispute',
      claim: 'Elon Musk says OpenAI betrayed its original nonprofit mission and became too close to Microsoft.',
      titleAr: 'إيلون ماسك ضد OpenAI',
      categoryAr: 'نزاع شركات',
      claimAr: 'يقول إيلون ماسك إن OpenAI خانت مهمتها غير الربحية الأصلية وأصبحت قريبة جدًا من مايكروسوفت.',
    },
    {
      title: 'Galileo Trial (1633)',
      category: 'Historical Narrative',
      claim: 'The Catholic Inquisition forced Galileo Galilei to recant his heliocentric view, declaring it contrary to holy scripture.',
      titleAr: 'محاكمة غاليليو (1633)',
      categoryAr: 'رواية تاريخية',
      claimAr: 'أجبرت محاكم التفتيش الكاثوليكية غاليليو غاليلي على التراجع عن رؤيته لمركزية الشمس، معلنة أنها تتعارض مع الكتاب المقدس.',
    },
    {
      title: 'Apple vs Epic Games',
      category: 'Antitrust Dispute',
      claim: 'Epic Games accuses Apple of maintaining an illegal monopoly by charging a 30% commission on the iOS App Store.',
      titleAr: 'أبل ضد إيبك غيمز',
      categoryAr: 'نزاع مكافحة الاحتكار',
      claimAr: 'تتهم شركة إيبك غيمز شركة أبل بالحفاظ على احتكار غير قانوني بفرض عمولة قدرها 30٪ على متجر تطبيقات iOS.',
    },
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <h3 className="text-xs font-mono uppercase tracking-wider text-neutral-500 font-semibold">
        {t('seededClaims')}
      </h3>
      <div className="grid gap-3 sm:grid-cols-3">
        {examples.map((ex, idx) => {
          const titleText = lang === 'ar' ? ex.titleAr : ex.title;
          const categoryText = lang === 'ar' ? ex.categoryAr : ex.category;
          const claimText = lang === 'ar' ? ex.claimAr : ex.claim;
          return (
            <button
              key={idx}
              type="button"
              onClick={() => onSelect(claimText)}
              className={`p-4 rounded-xl border border-neutral-200 dark:border-neutral-900 bg-neutral-100/20 dark:bg-neutral-950/20 hover:border-neutral-300 dark:hover:border-neutral-800 transition-all space-y-2 group ${
                lang === 'ar' ? 'text-right' : 'text-left'
              }`}
            >
              <div className="flex justify-between items-center gap-1">
                <span className="text-[10px] uppercase font-bold text-neutral-500 tracking-wider">
                  {categoryText}
                </span>
                <span className="text-[10px] text-neutral-400 dark:text-neutral-600 group-hover:text-neutral-700 dark:group-hover:text-neutral-400 font-mono transition-colors">
                  {t('select')}
                </span>
              </div>
              <h4 className="text-sm font-semibold text-slate-800 dark:text-neutral-200 group-hover:text-black dark:group-hover:text-white transition-colors">
                {titleText}
              </h4>
              <p className="text-xs text-neutral-500 leading-relaxed line-clamp-2">
                {claimText}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
