import React, { useState } from 'react';
import { AlertCircle, ChevronDown, Layers, SlidersHorizontal } from 'lucide-react';
import { useConfig } from '@/context/ConfigContext';
import { SourceStrictness } from '@/types';

interface Props {
  value: string;
  onChange: (text: string) => void;
  onSubmit: (text: string) => void;
  loading: boolean;
  sourceStrictness: SourceStrictness;
  onSourceStrictnessChange: (strictness: SourceStrictness) => void;
}

const STRICTNESS_LABELS: Record<SourceStrictness, { en: string; ar: string }> = {
  balanced: { en: 'Balanced', ar: 'متوازن' },
  strict: { en: 'Strict', ar: 'صارم' },
  reasoned: { en: 'Reasoned', ar: 'استدلالي' },
};

export default function StoryInput({
  value,
  onChange,
  onSubmit,
  loading,
  sourceStrictness,
  onSourceStrictnessChange,
}: Props) {
  const { t, lang } = useConfig();
  const [advancedOpen, setAdvancedOpen] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!value.trim() || loading) return;
    onSubmit(value);
  };

  const getPlaceholder = () => {
    return lang === 'ar'
      ? 'الصق خبرًا أو تغريدة أو رأيًا — سنريك الجانب الآخر...'
      : 'Paste an article excerpt, tweet, legal claim, historical account, or argument...';
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-3xl mx-auto">
      <div className="relative">
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={getPlaceholder()}
          rows={6}
          disabled={loading}
          className={`w-full p-4 rounded-xl bg-neutral-100/40 dark:bg-neutral-900/40 border border-neutral-200 dark:border-neutral-800 text-slate-800 dark:text-white placeholder-neutral-400 dark:placeholder-neutral-600 focus:outline-none focus:border-neutral-300 dark:focus:border-neutral-700 disabled:opacity-50 text-base sm:text-sm leading-relaxed resize-y ${lang === 'ar' ? '' : 'font-mono'}`}
        />
        {value.trim() && (
          <button
            type="button"
            onClick={() => onChange('')}
            className={`absolute bottom-3 text-xs text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 ${lang === 'ar' ? 'left-3' : 'right-3'}`}
          >
            {lang === 'ar' ? 'مسح' : 'Clear'}
          </button>
        )}
      </div>

      <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white/70 dark:bg-neutral-950/30 overflow-hidden">
        <button
          type="button"
          onClick={() => setAdvancedOpen((current) => !current)}
          className="w-full flex items-center justify-between gap-3 px-4 py-3 text-xs text-neutral-500 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200 transition-colors"
        >
          <span className="flex items-center gap-2 font-medium">
            <SlidersHorizontal className="w-3.5 h-3.5" />
            {lang === 'ar' ? 'الإعدادات المتقدمة' : 'Advanced settings'}
          </span>
          <ChevronDown className={`w-3.5 h-3.5 transition-transform ${advancedOpen ? 'rotate-180' : ''}`} />
        </button>

        {advancedOpen && (
          <div className="px-4 pb-4 pt-1 border-t border-neutral-100 dark:border-neutral-800/70 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400">
                <Layers className="w-3.5 h-3.5 text-neutral-400" />
                <span>{t('strictnessFilter')}</span>
              </div>
              <div className="flex gap-2 flex-wrap">
                {(['balanced', 'strict', 'reasoned'] as SourceStrictness[]).map((strictness) => (
                  <button
                    key={strictness}
                    type="button"
                    disabled={loading}
                    onClick={() => onSourceStrictnessChange(strictness)}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-medium border transition-all ${
                      lang === 'ar' ? '' : 'font-mono uppercase'
                    } ${
                      sourceStrictness === strictness
                        ? 'bg-slate-900 dark:bg-white text-white dark:text-black border-slate-900 dark:border-white'
                        : 'bg-transparent text-neutral-500 border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700'
                    } disabled:opacity-50`}
                  >
                    {lang === 'ar' ? STRICTNESS_LABELS[strictness].ar : STRICTNESS_LABELS[strictness].en}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-1.5 text-xs text-neutral-500 font-mono">
          <AlertCircle className="w-3.5 h-3.5" /> {t('policyNote')}
        </div>
        <button
          type="submit"
          disabled={!value.trim() || loading}
          className="px-6 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-black hover:bg-slate-800 dark:hover:bg-neutral-200 transition-colors text-xs font-semibold rounded-lg disabled:opacity-30 tracking-wider uppercase"
        >
          {loading ? t('generating') : t('generateBrief')}
        </button>
      </div>
    </form>
  );
}
