import React from 'react';
import Link from 'next/link';

interface Example {
  title: string;
  claim: string;
  category: string;
}

interface Props {
  onSelect: (claim: string) => void;
}

export default function DemoExamplePanel({ onSelect }: Props) {
  const examples: Example[] = [
    {
      title: 'OpenAI vs Elon Musk',
      category: 'Corporate Dispute',
      claim: 'Elon Musk says OpenAI betrayed its original nonprofit mission and became too close to Microsoft.',
    },
    {
      title: 'Galileo Trial (1633)',
      category: 'Historical Narrative',
      claim: 'The Catholic Inquisition forced Galileo Galilei to recant his heliocentric view, declaring it contrary to holy scripture.',
    },
    {
      title: 'Apple vs Epic Games',
      category: 'Antitrust Dispute',
      claim: 'Epic Games accuses Apple of maintaining an illegal monopoly by charging a 30% commission on the iOS App Store.',
    },
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <h3 className="text-xs font-mono uppercase tracking-wider text-neutral-500 font-semibold">
        Or select a seeded research claim
      </h3>
      <div className="grid gap-3 sm:grid-cols-3">
        {examples.map((ex, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => onSelect(ex.claim)}
            className="text-left p-4 rounded-xl border border-neutral-900 bg-neutral-950/20 hover:border-neutral-800 transition-all space-y-2 group"
          >
            <div className="flex justify-between items-center gap-1">
              <span className="text-[10px] uppercase font-bold text-neutral-500 tracking-wider">
                {ex.category}
              </span>
              <span className="text-[10px] text-neutral-600 group-hover:text-neutral-400 font-mono transition-colors">
                Select →
              </span>
            </div>
            <h4 className="text-sm font-semibold text-neutral-200 group-hover:text-white transition-colors">
              {ex.title}
            </h4>
            <p className="text-xs text-neutral-500 leading-relaxed line-clamp-2">
              {ex.claim}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
}
