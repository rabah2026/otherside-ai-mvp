import React from 'react';
import { useConfig } from '@/context/ConfigContext';
import { Sun, Moon, Globe } from 'lucide-react';

export default function ThemeLangControls() {
  const { lang, theme, setLang, setTheme } = useConfig();

  return (
    <div className="flex items-center gap-3 bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-1.5 rounded-lg">
      {/* Lang Switcher */}
      <button
        onClick={() => setLang(lang === 'en' ? 'ar' : 'en')}
        className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded hover:bg-neutral-200 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 transition-colors"
        title="Switch Language"
      >
        <Globe className="w-3.5 h-3.5" />
        <span>{lang === 'en' ? 'العربية' : 'English'}</span>
      </button>

      <div className="w-px h-4 bg-neutral-200 dark:bg-neutral-800" />

      {/* Theme Toggle */}
      <button
        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        className="p-1 rounded hover:bg-neutral-200 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 transition-colors"
        title="Toggle Theme"
      >
        {theme === 'dark' ? (
          <Sun className="w-3.5 h-3.5 text-amber-400" />
        ) : (
          <Moon className="w-3.5 h-3.5 text-indigo-500" />
        )}
      </button>
    </div>
  );
}
