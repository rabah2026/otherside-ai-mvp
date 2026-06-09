import React, { useState } from 'react';
import { AlertCircle } from 'lucide-react';

interface Props {
  value: string;
  onChange: (text: string) => void;
  onSubmit: (text: string) => void;
  loading: boolean;
}

export default function StoryInput({ value, onChange, onSubmit, loading }: Props) {

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!value.trim() || loading) return;
    onSubmit(value);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-3xl mx-auto">
      <div className="relative">
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Paste an article excerpt, tweet, legal claim, historical account, or argument..."
          rows={6}
          disabled={loading}
          className="w-full p-4 rounded-xl bg-neutral-900/40 border border-neutral-800 text-white placeholder-neutral-600 focus:outline-none focus:border-neutral-700 disabled:opacity-50 text-sm leading-relaxed resize-y font-mono"
        />
        {value.trim() && (
          <button
            type="button"
            onClick={() => onChange('')}
            className="absolute right-3 bottom-3 text-xs text-neutral-500 hover:text-neutral-300"
          >
            Clear
          </button>
        )}
      </div>

      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-1.5 text-xs text-neutral-500 font-mono">
          <AlertCircle className="w-3.5 h-3.5" /> Presenting missing perspectives only.
        </div>
        <button
          type="submit"
          disabled={!value.trim() || loading}
          className="px-6 py-2.5 bg-white text-black hover:bg-neutral-200 transition-colors text-xs font-semibold rounded-lg disabled:opacity-30 disabled:hover:bg-white tracking-wider uppercase"
        >
          {loading ? 'Analyzing...' : 'Generate Case Brief'}
        </button>
      </div>
    </form>
  );
}
