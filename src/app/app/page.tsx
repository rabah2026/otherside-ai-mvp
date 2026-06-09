'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import ModeSelector from '@/components/ModeSelector';
import StoryInput from '@/components/StoryInput';
import ReportBrief from '@/components/ReportBrief';
import DemoExamplePanel from '@/components/DemoExamplePanel';
import LanguageToggle from '@/components/LanguageToggle';
import { OtherSideMode, OtherSideReport, SourceStrictness } from '@/types';
import { ShieldAlert, RefreshCw, Settings2, Share2, Check, Download } from 'lucide-react';
import { useLang } from '@/context/LanguageContext';

function AppWorkspace() {
  const { t, lang } = useLang();
  const [mode, setMode] = useState<OtherSideMode>('quick');
  const [strictness, setStrictness] = useState<SourceStrictness>('balanced');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<OtherSideReport | null>(null);
  const [demoMode, setDemoMode] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const searchParams = useSearchParams();

  useEffect(() => {
    const q = searchParams.get('q');
    const m = searchParams.get('mode') as OtherSideMode | null;
    const autorun = searchParams.get('autorun') === '1';

    if (q) {
      let decoded: string;
      try {
        decoded = decodeURIComponent(q);
      } catch {
        decoded = q;
      }
      setText(decoded);
      if (m && ['quick', 'deep', 'history'].includes(m)) setMode(m);
      if (autorun) handleGenerate(decoded);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

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
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: inputText, mode, sourceStrictness: strictness, language: lang }),
      });

      if (!res.ok) throw new Error('Failed to generate report');

      const data = await res.json();
      if (data.error) throw new Error(data.error);

      setReport(data.report);
      setDemoMode(data.demoMode);
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred during generation.');
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    const baseUrl = `${window.location.origin}/app`;
    const excerpt = text.length > 120 ? text.substring(0, 120) + '…' : text;
    if (navigator.share) {
      try {
        await navigator.share({
          title: t.nav_brand,
          text: excerpt,
          url: baseUrl,
        });
      } catch {
        // user cancelled share sheet — no action needed
      }
    } else {
      await navigator.clipboard.writeText(baseUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-[#050508] text-neutral-300 relative overflow-hidden flex flex-col justify-between">
      <div className="glow-beam no-print" />

      <div className="max-w-5xl mx-auto px-4 py-8 relative z-10 w-full flex-grow space-y-10">
        {/* Navigation / Header */}
        <div className="no-print flex justify-between items-center border-b border-neutral-900 pb-4">
          <Link href="/" className="font-serif text-white hover:text-neutral-400 font-semibold tracking-wide flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded bg-white" />
            {t.nav_brand}
          </Link>
          <div className="flex items-center gap-3 text-xs font-mono">
            <Link href="/about" className="hover:text-white">{t.nav_neutrality_policy}</Link>
            <Link href="/examples" className="hover:text-white">{t.nav_examples}</Link>
            <LanguageToggle />
          </div>
        </div>

        {/* Input Configuration & Modes */}
        <div className="no-print space-y-5">
          <div className="text-center space-y-1">
            <h1 className="text-2xl sm:text-3xl font-serif text-white font-semibold">
              {t.workspace_title}
            </h1>
            <p className="text-xs text-neutral-500 font-mono">
              {t.workspace_subtitle}
            </p>
          </div>

          <ModeSelector selected={mode} onChange={setMode} />
          <StoryInput value={text} onChange={setText} onSubmit={handleGenerate} loading={loading} />

          {/* Advanced settings */}
          <div className="max-w-3xl mx-auto">
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center gap-1.5 text-[11px] font-mono text-neutral-600 hover:text-neutral-400 transition-colors"
            >
              <Settings2 className="w-3 h-3" />
              {showAdvanced ? t.workspace_advanced_hide : t.workspace_advanced}
            </button>

            {showAdvanced && (
              <div className="mt-3 flex flex-col sm:flex-row items-start sm:items-center gap-3 p-3 rounded-lg bg-neutral-950/40 border border-neutral-900">
                <span className="text-xs font-mono text-neutral-500 flex-shrink-0">{t.workspace_strictness_label}</span>
                <div className="flex gap-2">
                  {(['balanced', 'strict', 'lenient'] as SourceStrictness[]).map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setStrictness(st)}
                      className={`px-3 py-1 rounded text-[10px] font-mono uppercase border transition-all ${
                        strictness === st
                          ? 'bg-neutral-900 text-white border-neutral-700'
                          : 'bg-transparent text-neutral-500 border-transparent hover:border-neutral-800'
                      }`}
                    >
                      {st === 'balanced' ? t.workspace_balanced : st === 'strict' ? t.workspace_strict : t.workspace_lenient}
                    </button>
                  ))}
                </div>
                <p className="text-[10px] text-neutral-600 sm:ms-auto">
                  {strictness === 'strict' && t.workspace_strict_desc}
                  {strictness === 'balanced' && t.workspace_balanced_desc}
                  {strictness === 'lenient' && t.workspace_lenient_desc}
                </p>
              </div>
            )}
          </div>

          {!report && !loading && (
            <DemoExamplePanel onSelect={handleSelectExample} />
          )}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="py-20 text-center space-y-4">
            <RefreshCw className="w-8 h-8 text-neutral-500 animate-spin mx-auto" />
            <p className="text-xs font-mono text-neutral-500">
              {t.workspace_loading}
            </p>
          </div>
        )}

        {/* Error Output */}
        {error && (
          <div className="max-w-3xl mx-auto p-4 rounded-lg bg-rose-950/30 border border-rose-900/40 text-rose-400 text-xs flex gap-2 items-start">
            <ShieldAlert className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold">{t.workspace_error_prefix}</span> {error}
            </div>
          </div>
        )}

        {/* Report */}
        {report && !loading && (
          <div className="space-y-4">
            <div className="no-print flex items-center justify-between max-w-4xl mx-auto">
              <div className="text-xs font-mono uppercase tracking-widest text-neutral-500">
                {t.workspace_report_label}
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-neutral-800 bg-neutral-950/40 text-xs text-neutral-400 hover:text-white hover:border-neutral-600 transition-all"
                >
                  <Download className="w-3.5 h-3.5" />
                  {t.report_export_pdf}
                </button>
                <button
                  type="button"
                  onClick={handleShare}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-neutral-800 bg-neutral-950/40 text-xs text-neutral-400 hover:text-white hover:border-neutral-600 transition-all"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">{t.workspace_copied}</span>
                    </>
                  ) : (
                    <>
                      <Share2 className="w-3.5 h-3.5" />
                      {t.workspace_share}
                    </>
                  )}
                </button>
              </div>
            </div>
            <ReportBrief report={report} demoMode={demoMode} />
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="no-print py-6 border-t border-neutral-900 text-center text-[10px] text-neutral-600">
        {t.workspace_footer}
      </footer>
    </div>
  );
}

export default function AppPage() {
  return (
    <Suspense fallback={null}>
      <AppWorkspace />
    </Suspense>
  );
}
