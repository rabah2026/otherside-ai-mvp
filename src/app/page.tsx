import React from 'react';
import HeroSection from '@/components/HeroSection';
import Link from 'next/link';
import { HelpCircle, Sparkles, ShieldCheck } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-[#050508] relative overflow-hidden text-neutral-300">
      <HeroSection />

      {/* Narrative Mode Pillars Section */}
      <div className="max-w-5xl mx-auto px-4 py-16 border-t border-neutral-900/60 relative z-10 space-y-12">
        <div className="text-center space-y-2">
          <h2 className="text-xs font-mono uppercase tracking-widest text-neutral-500 font-bold">
            Guiding Frameworks
          </h2>
          <p className="text-2xl font-serif text-white font-semibold">
            Three perspectives of analysis
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-3">
          <div className="p-6 rounded-xl bg-neutral-950/40 border border-neutral-900 space-y-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-950/40 border border-indigo-900/60 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-indigo-400" />
            </div>
            <h3 className="font-serif text-lg text-white font-semibold">Quick Counter</h3>
            <p className="text-sm text-neutral-500 leading-relaxed">
              Immediate context summary. Designed to provide instant access to the core alternative claims and arguments without wading through deep documentation.
            </p>
          </div>

          <div className="p-6 rounded-xl bg-neutral-950/40 border border-neutral-900 space-y-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-950/40 border border-emerald-900/60 flex items-center justify-center">
              <HelpCircle className="w-4 h-4 text-emerald-400" />
            </div>
            <h3 className="font-serif text-lg text-white font-semibold">Deep Dispute</h3>
            <p className="text-sm text-neutral-500 leading-relaxed">
              Exhaustive dispute mapping. Generates a breakdown of the debate timeline, point-by-point disagreements, and source-backed official responses.
            </p>
          </div>

          <div className="p-6 rounded-xl bg-neutral-950/40 border border-neutral-900 space-y-3">
            <div className="w-8 h-8 rounded-lg bg-amber-950/40 border border-amber-900/60 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4 text-amber-400" />
            </div>
            <h3 className="font-serif text-lg text-white font-semibold">History Mirror</h3>
            <p className="text-sm text-neutral-500 leading-relaxed">
              Perspective alignment tool. Re-contextualizes historical narratives by evaluating marginalized or unexamined historical actors and primary documents.
            </p>
          </div>
        </div>
      </div>

      {/* Simple Editorial How It Works Section */}
      <div className="max-w-4xl mx-auto px-4 py-16 border-t border-neutral-900/60 relative z-10 text-center space-y-8">
        <h2 className="text-xs font-mono uppercase tracking-widest text-neutral-500 font-bold">
          The Process
        </h2>
        <div className="grid gap-6 sm:grid-cols-3 text-left">
          <div className="space-y-1">
            <div className="text-sm font-mono text-neutral-600">01 / SUBMIT</div>
            <h4 className="text-sm font-semibold text-white">Paste one side</h4>
            <p className="text-xs text-neutral-500 leading-relaxed">Input any statement, article snippet, or news excerpt.</p>
          </div>
          <div className="space-y-1">
            <div className="text-sm font-mono text-neutral-600">02 / DETECT</div>
            <h4 className="text-sm font-semibold text-white">Identify parties</h4>
            <p className="text-xs text-neutral-500 leading-relaxed">The AI parses claims, identifying core organizations and alternative parties.</p>
          </div>
          <div className="space-y-1">
            <div className="text-sm font-mono text-neutral-600">03 / CONSTRUCT</div>
            <h4 className="text-sm font-semibold text-white">Guarded Mirror</h4>
            <p className="text-xs text-neutral-500 leading-relaxed">A neutrality-guarded counter-story is outputted with evaluated citations.</p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-12 border-t border-neutral-900 text-center text-xs text-neutral-600 space-y-2">
        <div>OtherSide AI © 2026. Non-partisan and objective by design.</div>
        <div className="space-x-4">
          <Link href="/about" className="hover:text-neutral-400">Neutrality Policy</Link>
          <Link href="/examples" className="hover:text-neutral-400">Examples</Link>
          <Link href="/app" className="hover:text-neutral-400">App</Link>
        </div>
      </footer>
    </div>
  );
}
