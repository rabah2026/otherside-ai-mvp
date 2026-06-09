import React from 'react';
import Link from 'next/link';
import ReportBrief from '@/components/ReportBrief';
import { OtherSideReport } from '@/types';

const OPENAI_MOCK: OtherSideReport = {
  detectedStory: "The pasted story claims that OpenAI betrayed its original nonprofit mission and became too commercially aligned with Microsoft.",
  mainParty: "Elon Musk / critics of OpenAI's restructuring",
  otherParty: "OpenAI and its leadership",
  otherSideStory: "From OpenAI's side, the counter-story would likely argue that developing frontier AI required large-scale computing resources, safety work, and capital. The organization may argue that its capped-profit structure and strategic partnerships were created to make the mission practically achievable at scale, rather than to abandon it.",
  strongestCounterArgument: "A strong version of OpenAI's counter-position is that mission and funding structure are not automatically opposed. From this view, the commercial structure was a tool to fund advanced AI development, while governance and stated mission language remained intended to keep the organization aligned with public benefit.",
  bothSidesAgreeOn: [
    "OpenAI began with a mission focused on broadly beneficial AI.",
    "OpenAI later adopted a capped-profit structure.",
    "Microsoft became a major partner and investor."
  ],
  disputedPoints: [
    "Whether the structural change was a betrayal or a practical necessity.",
    "Whether Microsoft's role undermined OpenAI's independence.",
    "Whether OpenAI's original mission remained meaningfully intact."
  ],
  sourceNotes: [
    {
      sourceType: "official_statement",
      note: "OpenAI official statements provide the organization's stated rationale for its structural choices.",
      strength: "strong",
      title: "OpenAI: Our Structure",
      url: "https://openai.com/blog/openai-lp"
    },
    {
      sourceType: "court_filing",
      note: "Court filings are primary documents for the legal claims made by each side.",
      strength: "strong",
      title: "Superior Court of California Complaint",
      url: "https://www.courthousenews.com/wp-content/uploads/2024/03/musk-v-openai-complaint.pdf"
    }
  ],
  uncertaintyNotes: [
    "This sample relies on public legal arguments filed during litigation."
  ],
  neutralNote: "This is not a verdict. It presents the other side's argument without judging who is right."
};

const GALILEO_MOCK: OtherSideReport = {
  detectedStory: "The Catholic Inquisition forced Galileo Galilei to recant his heliocentric view in 1633, declaring it contrary to holy scripture and suppressing scientific truth.",
  mainParty: "Galileo Galilei / proponents of heliocentrism",
  otherParty: "The Catholic Church / Roman Inquisition",
  otherSideStory: "From the Church's institutional position, the concern was not simply anti-scientific—the Inquisition would likely argue that Galileo had been warned in 1616 not to hold or defend heliocentrism, and that he violated a formal injunction by publishing his Dialogue in 1632. The Church may contend that the trial was a matter of institutional authority and the terms of a prior agreement, not purely a rejection of empirical inquiry. Many Church officials privately accepted the mathematical utility of heliocentrism even while opposing its theological framing.",
  strongestCounterArgument: "The strongest version of the Church's position is procedural rather than scientific: Galileo had agreed in 1616 not to teach heliocentrism as physical fact, and his Dialogue was seen as a direct violation of that undertaking. The trial, in this reading, was about institutional compliance and the limits of advocacy agreed to by Galileo himself—not a frontal denial of astronomy.",
  bothSidesAgreeOn: [
    "Galileo published the Dialogue Concerning the Two Chief World Systems in 1632.",
    "The Inquisition put Galileo on trial in 1633.",
    "Galileo formally abjured his heliocentric claims under the Inquisition."
  ],
  disputedPoints: [
    "Whether the 1616 injunction was validly issued and clearly communicated to Galileo.",
    "Whether the Church's motivation was primarily theological, political, or institutional.",
    "Whether Galileo's Dialogue actually violated the injunction or merely presented heliocentrism as hypothesis."
  ],
  sourceNotes: [
    {
      sourceType: "historical_record",
      note: "Vatican archives contain the original trial documents and the 1616 injunction.",
      strength: "strong",
      title: "Vatican Secret Archives: Galileo Trial Documents"
    },
    {
      sourceType: "primary_source",
      note: "Galileo's Dialogue is the primary text at issue in the proceedings.",
      strength: "strong",
      title: "Dialogue Concerning the Two Chief World Systems (1632)"
    },
    {
      sourceType: "reporting",
      note: "Modern historical scholarship has substantially revised the 'pure suppression' narrative.",
      strength: "medium",
      title: "Finocchiaro, Maurice A. — The Galileo Affair (1989)"
    }
  ],
  uncertaintyNotes: [
    "The precise wording and scope of the 1616 injunction remains debated among historians.",
    "Internal Church motivations cannot be fully confirmed from surviving documents alone."
  ],
  neutralNote: "This is not a verdict. It presents the other side's argument without judging who is right."
};

const APPLE_EPIC_MOCK: OtherSideReport = {
  detectedStory: "Epic Games accuses Apple of maintaining an illegal monopoly on iOS app distribution by requiring all apps to use the App Store and charging a 30% commission, harming developers and consumers.",
  mainParty: "Epic Games / developer critics of Apple's App Store policies",
  otherParty: "Apple Inc.",
  otherSideStory: "From Apple's position, the counter-story would likely argue that the App Store's commission and exclusivity are the price of a curated, secure platform that Apple built and maintains. Apple may contend that the 30% fee funds review infrastructure, developer tools, and security protections that benefit both developers and users. The company would dispute that iOS constitutes a relevant antitrust market, arguing that developers can reach consumers through the web, Android, and other platforms.",
  strongestCounterArgument: "Apple's strongest counter-argument is that vertical integration within a hardware platform is not inherently anticompetitive. A developer who ships on iOS has chosen to target Apple's customers on Apple's hardware—Apple argues it is entitled to set terms for that access, just as a mall operator sets lease terms. The 30% rate is consistent with industry norms and developers are free to build web apps or choose other platforms.",
  bothSidesAgreeOn: [
    "Apple requires all iOS apps to be distributed through the App Store.",
    "Apple charges a commission of up to 30% on in-app purchases.",
    "Epic intentionally violated App Store payment terms to trigger the lawsuit."
  ],
  disputedPoints: [
    "Whether iOS constitutes its own antitrust market or competes within a broader mobile market.",
    "Whether the App Store commission is justified by Apple's platform investment.",
    "Whether Apple's policies harm competition or protect a legitimate proprietary ecosystem."
  ],
  sourceNotes: [
    {
      sourceType: "court_filing",
      note: "The district court ruling (Epic v. Apple, 2021) and subsequent appeals are primary legal documents.",
      strength: "strong",
      title: "Epic Games, Inc. v. Apple Inc., No. 4:20-cv-05640"
    },
    {
      sourceType: "official_statement",
      note: "Apple's developer documentation outlines the rationale for App Store guidelines.",
      strength: "strong",
      title: "Apple App Store Review Guidelines"
    },
    {
      sourceType: "reporting",
      note: "Financial press coverage provides context on commission rates across app stores.",
      strength: "medium",
      title: "Bloomberg: Inside the App Store Commission Debate"
    }
  ],
  uncertaintyNotes: [
    "Appeals are ongoing; the legal definition of the relevant market has not been finally settled.",
    "Economic evidence on whether the 30% commission exceeds a competitive rate is contested."
  ],
  neutralNote: "This is not a verdict. It presents the other side's argument without judging who is right."
};

const EXAMPLES = [
  {
    label: "Example 1: The OpenAI Restructuring Dispute",
    report: OPENAI_MOCK,
  },
  {
    label: "Example 2: The Galileo Trial (1633)",
    report: GALILEO_MOCK,
  },
  {
    label: "Example 3: Apple vs Epic Games — App Store Antitrust",
    report: APPLE_EPIC_MOCK,
  },
];

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
            Sample Reports
          </h1>
          <p className="text-sm text-neutral-500 max-w-xl">
            Pre-written examples showing how OtherSide AI structures a counter-position report. These are not live AI outputs — they demonstrate the report format.
          </p>
        </div>

        {/* Example Renders */}
        <div className="space-y-16">
          {EXAMPLES.map((ex) => (
            <div key={ex.label} className="space-y-4">
              <div className="text-xs font-mono uppercase tracking-widest text-neutral-500 font-semibold border-b border-neutral-900 pb-2">
                {ex.label}
              </div>
              <ReportBrief report={ex.report} demoMode={true} />
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="pt-8 text-center space-y-3 border-t border-neutral-900">
          <p className="text-sm text-neutral-500">Ready to analyze your own claim?</p>
          <Link
            href="/app"
            className="inline-block px-6 py-3 bg-white text-black text-xs font-semibold rounded-lg tracking-wider uppercase hover:bg-neutral-200 transition-colors"
          >
            Open the Workspace
          </Link>
        </div>
      </div>
    </div>
  );
}
