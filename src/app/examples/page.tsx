import React from 'react';
import Link from 'next/link';
import ReportBrief from '@/components/ReportBrief';
import { OtherSideReport } from '@/types';

const OPENAI_MOCK: OtherSideReport = {
  detectedStory: "The pasted story claims that OpenAI betrayed its original nonprofit mission and became too commercially aligned with Microsoft.",
  mainParty: "Elon Musk / critics of OpenAI’s restructuring",
  otherParty: "OpenAI and its leadership",
  otherSideStory: "From OpenAI’s side, the counter-story would likely argue that developing frontier AI required large-scale computing resources, safety work, and capital. The organization may argue that its capped-profit structure and strategic partnerships were created to make the mission practically achievable at scale, rather than to abandon it.",
  strongestCounterArgument: "A strong version of OpenAI’s counter-position is that mission and funding structure are not automatically opposed. From this view, the commercial structure was a tool to fund advanced AI development, while governance and stated mission language remained intended to keep the organization aligned with public benefit.",
  bothSidesAgreeOn: [
    "OpenAI began with a mission focused on broadly beneficial AI.",
    "OpenAI later adopted a capped-profit structure.",
    "Microsoft became a major partner and investor."
  ],
  disputedPoints: [
    "Whether the structural change was a betrayal or a practical necessity.",
    "Whether Microsoft’s role undermined OpenAI’s independence.",
    "Whether OpenAI’s original mission remained meaningfully intact."
  ],
  sourceNotes: [
    {
      sourceType: "official_statement",
      note: "OpenAI official statements would be important for its stated rationale.",
      strength: "strong",
      title: "OpenAI: Our Structure",
      url: "https://openai.com/blog/openai-lp"
    },
    {
      sourceType: "court_filing",
      note: "Court filings would be strong sources for the legal claims made by each side.",
      strength: "strong",
      title: "Superior Court of California Complaint",
      url: "https://www.courthousenews.com/wp-content/uploads/2024/03/musk-v-openai-complaint.pdf"
    }
  ],
  uncertaintyNotes: [
    "This report relies on public legal arguments filed during litigation."
  ],
  neutralNote: "This is not a verdict. It presents the other side’s argument without judging who is right."
};

export default function Examples() {
  return (
    <div className="min-h-screen bg-[#050508] text-neutral-300 relative overflow-hidden">
      <div className="glow-beam" />
      
      <div className="max-w-4xl mx-auto px-4 py-20 relative z-10 space-y-12">
        {/* Navigation */}
        <div className="flex justify-between items-center border-b border-neutral-900 pb-6">
          <Link href="/" className="font-serif text-white hover:text-neutral-400 font-semibold tracking-wide">
            OtherSide AI
          </Link>
          <div className="space-x-4 text-xs font-mono">
            <Link href="/app" className="hover:text-white">Workspace</Link>
            <Link href="/about" className="hover:text-white">Neutrality Policy</Link>
          </div>
        </div>

        {/* Title */}
        <div className="space-y-3 text-center sm:text-left">
          <h1 className="text-3xl sm:text-4xl font-serif text-white tracking-tight">
            Case Studies & Examples
          </h1>
          <p className="text-sm text-neutral-500 max-w-xl">
            Explore how OtherSide AI dissects complex disputes and presents structured, non-judgmental reports.
          </p>
        </div>

        {/* Example Render */}
        <div className="space-y-6">
          <div className="text-xs font-mono uppercase tracking-widest text-neutral-500 font-semibold border-b border-neutral-900 pb-2">
            Example 1: The OpenAI Restructuring Dispute
          </div>
          <ReportBrief report={OPENAI_MOCK} demoMode={false} />
        </div>
      </div>
    </div>
  );
}
