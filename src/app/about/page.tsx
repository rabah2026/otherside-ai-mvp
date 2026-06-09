import React from 'react';
import Link from 'next/link';

export default function About() {
  return (
    <div className="min-h-screen bg-[#050508] text-neutral-300 relative overflow-hidden">
      <div className="glow-beam" />
      
      <div className="max-w-3xl mx-auto px-4 py-20 relative z-10 space-y-12">
        {/* Navigation */}
        <div className="flex justify-between items-center border-b border-neutral-900 pb-6">
          <Link href="/" className="font-serif text-white hover:text-neutral-400 font-semibold tracking-wide">
            OtherSide AI
          </Link>
          <div className="space-x-4 text-xs font-mono">
            <Link href="/app" className="hover:text-white">Workspace</Link>
            <Link href="/examples" className="hover:text-white">Examples</Link>
          </div>
        </div>

        {/* Title */}
        <div className="space-y-3">
          <h1 className="text-3xl sm:text-4xl font-serif text-white tracking-tight">
            Neutrality Policy
          </h1>
          <p className="text-xs font-mono text-neutral-500 uppercase tracking-widest">
            Last Updated: June 2026
          </p>
        </div>

        {/* Content Pillars */}
        <div className="space-y-8 font-light leading-relaxed text-sm">
          <section className="space-y-3">
            <h2 className="text-lg font-serif text-white font-medium">1. Absolute Lack of Verdicts</h2>
            <p>
              OtherSide AI does not arbitrate disputes, determine absolute correctness, or issue verdicts. We reject the binary categorization of complex matters. Our software is built solely to present the counter-perspective of a submitted narrative.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-serif text-white font-medium">2. Counter-Narrative Presentation</h2>
            <p>
              Every public dispute contains overlooked context, differences in foundational assumptions, and varying interpretations of facts. Our goal is to synthesize the strongest possible fair version of that alternative perspective so users can read the dispute with balanced context.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-serif text-white font-medium">3. Guarded Language Policy</h2>
            <p>
              To ensure impartiality, all generated summaries pass through a static Neutrality Guard. Words implying moral absolutes, outright deception, or absolute correctness are replaced with conditional, objective phrases (e.g., "appears to claim", "disputes this representation").
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-serif text-white font-medium">4. Transparency of Citations</h2>
            <p>
              We prioritize primary sources (official organization statements, court filings, direct transcripts) over secondary reporting. Each source is evaluated and labelled by strength:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-neutral-400 text-xs">
              <li><strong>Strong:</strong> Direct, unfiltered evidence (e.g. court motions, official press releases).</li>
              <li><strong>Medium:</strong> Balanced journalistic reporting, regulatory context.</li>
              <li><strong>Weak:</strong> Unverified public claims, opinion blogs, indirect comments.</li>
            </ul>
          </section>

          <section className="p-5 rounded-lg bg-neutral-900/30 border border-neutral-800/40 text-xs italic space-y-2">
            <p className="font-semibold text-neutral-300 not-italic">Disclaimer Note:</p>
            OtherSide AI is designed as a neutral reference synthesis engine. It does not replace independent legal, financial, or primary academic research. Use responsibly.
          </section>
        </div>

        {/* Footer */}
        <div className="pt-12 border-t border-neutral-900 text-center">
          <Link
            href="/app"
            className="inline-block px-6 py-2.5 bg-white text-black hover:bg-neutral-200 transition-colors text-xs font-semibold rounded-lg tracking-wider uppercase"
          >
            Launch workspace
          </Link>
        </div>
      </div>
    </div>
  );
}
