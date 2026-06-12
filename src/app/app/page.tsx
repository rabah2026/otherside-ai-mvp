'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import ModeSelector from '@/components/ModeSelector';
import StoryInput from '@/components/StoryInput';
import ReportBrief from '@/components/ReportBrief';
import DemoExamplePanel from '@/components/DemoExamplePanel';
import ThemeLangControls from '@/components/ThemeLangControls';
import { OtherSideMode, OtherSideReport, SourceStrictness } from '@/types';
import { ShieldAlert, RefreshCw } from 'lucide-react';
import { useConfig } from '@/context/ConfigContext';

export default function AppWorkspace() {
  const { t, lang } = useConfig();
  const [mode, setMode] = useState<OtherSideMode>('quick');
  const [strictness, setStrictness] = useState<SourceStrictness>('balanced');
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<OtherSideReport | null>(null);
  const [demoMode, setDemoMode] = useState(false);
  const [demoReason, setDemoReason] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSelectExample = (claim: string) => {
    setText(claim);
  };

  const handleGenerate = async (inputText: string) => {
    setLoading(true);
    setError(null);
    setReport(null);

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: inputText,
          mode,
          sourceStrictness: strictness,
          lang,
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to generate report');
      }

      const data = await res.json();
      if (data.error) {
        throw new Error(data.error);
      }

      setReport(data.report);
      setDemoMode(data.demoMode);
      setDemoReason(data.demoReason || null);
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred during generation.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 dark:bg-[#050508] dark:text-neutral-300 relative overflow-hidden flex flex-col justify-between transition-colors duration-300">
      <div className="glow-beam" />

      {/* Main Workspace Wrapper */}
      <div className="max-w-5xl mx-auto px-4 py-8 relative z-10 w-full flex-grow space-y-12">
        {/* Navigation / Header */}
        <div className="flex justify-between items-center border-b border-neutral-200 dark:border-neutral-900 pb-4">
          <Link href="/" className="font-serif text-slate-900 dark:text-white hover:text-neutral-500 font-semibold tracking-wide flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded bg-slate-900 dark:bg-white" />
            {t('title')}
          </Link>
          <div className="flex items-center gap-4">
            <div className="space-x-4 text-xs font-mono">
              <Link href="/about" className="hover:text-slate-900 dark:hover:text-white">{t('neutralityPolicy')}</Link>
              <Link href="/examples" className="hover:text-slate-900 dark:hover:text-white">{t('examples')}</Link>
            </div>
            <ThemeLangControls />
          </div>
        </div>

        {/* Input Configuration & Modes */}
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-2xl sm:text-3xl font-serif text-slate-900 dark:text-white font-semibold">
              {t('researchWorkspace')}
            </h1>
            <p className="text-xs text-neutral-500 font-mono">
              {t('workspaceDesc')}
            </p>
          </div>

          {/* Mode Selector */}
          <ModeSelector selected={mode} onChange={setMode} />

          {/* Interactive Form */}
          <StoryInput
            value={text}
            onChange={setText}
            onSubmit={handleGenerate}
            loading={loading}
            sourceStrictness={strictness}
            onSourceStrictnessChange={setStrictness}
          />

          {/* Seed Examples (Only shown if no report or currently loading) */}
          {!report && !loading && (
            <DemoExamplePanel onSelect={handleSelectExample} />
          )}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="py-20 text-center space-y-4">
            <RefreshCw className="w-8 h-8 text-neutral-400 dark:text-neutral-500 animate-spin mx-auto" />
            <p className="text-xs font-mono text-neutral-500">
              {t('compiling')}
            </p>
          </div>
        )}

        {/* Error Output */}
        {error && (
          <div className="max-w-3xl mx-auto p-4 rounded-lg bg-rose-100 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/40 text-rose-700 dark:text-rose-400 text-xs flex gap-2 items-start">
            <ShieldAlert className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold">{lang === 'ar' ? 'خطأ:' : 'Error:'}</span> {error}
            </div>
          </div>
        )}

        {/* Report brief presentation */}
        {report && !loading && (
          <div className="space-y-6">
            <div className="text-xs font-mono uppercase tracking-widest text-neutral-400 dark:text-neutral-500 text-center">
              {lang === 'ar' ? 'نتيجة التحليل' : 'Generated Analysis Report'}
            </div>
            <ReportBrief report={report} demoMode={demoMode} demoReason={demoReason} />
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="py-6 border-t border-neutral-200 dark:border-neutral-900 text-center text-[10px] text-neutral-500 dark:text-neutral-600">
        {t('copyright')}
      </footer>
    </div>
  );
}
