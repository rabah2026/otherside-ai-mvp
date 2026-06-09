import React from 'react';

export default function NeutralityBadge() {
  return (
    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-neutral-900 text-neutral-400 border border-neutral-800">
      <span className="w-1.5 h-1.5 rounded-full bg-neutral-500 animate-pulse" />
      Neutral Position Guarded
    </div>
  );
}
