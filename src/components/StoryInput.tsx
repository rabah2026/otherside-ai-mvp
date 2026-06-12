import React from 'react';
import { AlertCircle } from 'lucide-react';
import { useConfig } from '@/context/ConfigContext';

interface Props {
  value: string;
  onChange: (text: string) => void;
  onSubmit: (text: string) => void;
  loading: boolean;
}

export default function StoryInput({ value, onChange, onSubmit, loading }: Props) {
  const { t, lang } = useConfig();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!value.trim() || loading) return;
    onSubmit(value);
  };

  const getPlaceholder = () => {
    return lang === 'ar'
      ? 'أدخل مقتطفًا من مقال، أو تغريدة، أو ادعاءً قانونيًا، أو رواية تاريخية، أو حجة...'
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
          className="w-full p-4 rounded-xl bg-neutral-100/40 dark:bg-neutral-900/40 border border-neutral-200 dark:border-neutral-800 text-slate-800 dark:text-white placeholder-neutral-400 dark:placeholder-neutral-600 focus:outline-none focus:border-neutral-300 dark:focus:border-neutral-700 disabled:opacity-50 text-sm leading-relaxed resize-y font-mono"
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
