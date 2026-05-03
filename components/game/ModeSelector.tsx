'use client';

import type { GameMode } from '@/types/game';

const MODES: { id: GameMode; label: string }[] = [
  { id: '2p', label: '2 Players' },
  { id: 'easy', label: 'vs AI Easy' },
  { id: 'hard', label: 'vs AI Hard' },
];

interface ModeSelectorProps {
  mode: GameMode;
  onChange: (mode: GameMode) => void;
}

export default function ModeSelector({ mode, onChange }: ModeSelectorProps) {
  return (
    <div className="flex gap-2 flex-wrap">
      {MODES.map((m) => (
        <button
          key={m.id}
          onClick={() => onChange(m.id)}
          className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
            mode === m.id
              ? 'bg-gray-700 text-white ring-1 ring-gray-500'
              : 'bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700'
          }`}
        >
          {m.label}
        </button>
      ))}
    </div>
  );
}
