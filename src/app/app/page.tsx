'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import ModeSelector from '@/components/ModeSelector';
import StoryInput from '@/components/StoryInput';
import ReportBrief from '@/components/ReportBrief';
import DemoExamplePanel from '@/components/DemoExamplePanel';
import { OtherSideMode, OtherSideReport, SourceStrictness } from '@/types';
import { ShieldAlert, RefreshCw, Layers } from 'lucide-react';

export default function AppWorkspace() {
  const [mode, setMode] = useState<OtherSideMode>('quick');
  const [strictness, setStrictness] = useState<SourceStrictness>('balanced');
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<OtherSideReport | null>(null);
  const [demoMode, setDemoMode] = useState(false);
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
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred during generation.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050508] text-neutral-300 relative overflow-hidden flex flex-col justify-between">
      <div className="glow-beam" />

      {/* Main Workspace Wrapper */}
      <div className="max-w-5xl mx-auto px-4 py-8 relative z-10 w-full flex-grow space-y-12">
        {/* Navigation / Header */}
        <div className="flex justify-between items-center border-b border-neutral-900 pb-4">
          <Link href="/" className="font-serif text-white hover:text-neutral-400 font-semibold tracking-wide flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded bg-white" />
            OtherSide AI
          </Link>
          <div className="space-x-4 text-xs font-mono">
            <Link href="/about" className="hover:text-white">Neutrality Policy</Link>
            <Link href="/examples" className="hover:text-white">Examples</Link>
          </div>
        </div>

        {/* Input Configuration & Modes */}
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-2xl sm:text-3xl font-serif text-white font-semibold">
              Research Workspace
            </h1>
            <p className="text-xs text-neutral-500 font-mono">
              ENTER AN INCOMING CLAIM TO START THE EXTRACTION
            </p>
          </div>

          {/* Mode Selector */}
          <ModeSelector selected={mode} onChange={setMode} />

          {/* Source Strictness Controls */}
          <div className="max-w-3xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 p-3 rounded-lg bg-neutral-950/40 border border-neutral-900">
            <div className="flex items-center gap-2 text-xs font-mono text-neutral-400">
              <Layers className="w-4 h-4 text-neutral-500" />
              <span>Source Strictness Filter:</span>
            </div>
            <div className="flex gap-2">
              {(['balanced', 'strict', 'reasoned'] as SourceStrictness[]).map((st) => (
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
                  {st}
                </button>
              ))}
            </div>
          </div>

          {/* Interactive Form */}
          <StoryInput onSubmit={handleGenerate} loading={loading} />

          {/* Seed Examples (Only shown if no report or currently loading) */}
          {!report && !loading && (
            <DemoExamplePanel onSelect={handleSelectExample} />
          )}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="py-20 text-center space-y-4">
            <RefreshCw className="w-8 h-8 text-neutral-500 animate-spin mx-auto" />
            <p className="text-xs font-mono text-neutral-500">
              COMPILING SOURCE INDEXES AND REWRITING PERSPECTIVES...
            </p>
          </div>
        )}

        {/* Error Output */}
        {error && (
          <div className="max-w-3xl mx-auto p-4 rounded-lg bg-rose-950/30 border border-rose-900/40 text-rose-400 text-xs flex gap-2 items-start">
            <ShieldAlert className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold">Error:</span> {error}
            </div>
          </div>
        )}

        {/* Report brief presentation */}
        {report && !loading && (
          <div className="space-y-6">
            <div className="text-xs font-mono uppercase tracking-widest text-neutral-500 text-center">
              Generated Analysis Report
            </div>
            <ReportBrief report={report} demoMode={demoMode} />
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="py-6 border-t border-neutral-900 text-center text-[10px] text-neutral-600">
        OtherSide AI © 2026. All source notes strictly guarded for linguistic neutrality.
      </footer>
    </div>
  );
}
