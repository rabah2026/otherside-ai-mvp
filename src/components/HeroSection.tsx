import React from 'react';
import Link from 'next/link';
import QuickTryForm from './QuickTryForm';

export default function HeroSection() {
  return (
    <div className="relative text-center py-16 sm:py-24 overflow-hidden z-10">
      <div className="glow-beam" />
      <div className="max-w-4xl mx-auto px-4 space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-900 border border-neutral-800 text-[10px] sm:text-xs font-mono uppercase tracking-wider text-neutral-400">
          <span className="w-1.5 h-1.5 rounded-full bg-neutral-500" />
          Intelligence Desk MVP
        </div>
        <h1 className="text-4xl sm:text-6xl font-serif text-white tracking-tight font-light leading-none">
          Every story has <span className="font-normal italic">another</span> side.
        </h1>
        <p className="text-base sm:text-lg text-neutral-400 max-w-2xl mx-auto leading-relaxed font-light">
          Paste a claim, article, tweet, or historical narrative. OtherSide AI shows the counter-story and supporting references without giving a verdict.
        </p>

        {/* Inline quick-try form */}
        <QuickTryForm />

        <p className="text-xs text-neutral-600 font-mono pt-2">
          No judgment. No winner. No moral lecture. Just the missing perspective.{' '}
          <Link href="/about" className="hover:text-neutral-400 transition-colors">Neutrality Policy →</Link>
        </p>
      </div>
    </div>
  );
}
