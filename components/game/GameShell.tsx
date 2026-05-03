'use client';

import { useEffect, useRef } from 'react';
import type { LogEntry, GameScore } from '@/types/game';

interface GameShellProps {
  score: GameScore;
  log: LogEntry[];
  onResetScore: () => void;
  children: React.ReactNode;
}

const PLAYER_COLORS = ['text-blue-400', 'text-orange-400'] as const;

export default function GameShell({ score, log, onResetScore, children }: GameShellProps) {
  const logBottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    logBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [log]);

  return (
    <div className="flex min-h-screen">
      {/* Game content */}
      <div className="flex-1 p-10 overflow-auto">{children}</div>

      {/* Right panel */}
      <div className="w-64 shrink-0 border-l border-gray-800 h-screen sticky top-0 flex flex-col bg-gray-950">
        {/* Score */}
        <div className="p-4 border-b border-gray-800">
          <div className="flex items-center justify-between mb-3">
            <span className="text-white text-sm font-semibold">Score</span>
            <button
              onClick={onResetScore}
              className="text-xs text-gray-600 hover:text-gray-300 transition-colors"
            >
              Reset
            </button>
          </div>
          {score.names.map((name, i) => (
            <div key={i} className="flex items-center justify-between py-1">
              <span className={`text-sm truncate ${PLAYER_COLORS[i]}`}>{name}</span>
              <span className="text-white font-bold tabular-nums ml-2">{score.wins[i]}</span>
            </div>
          ))}
        </div>

        {/* Log */}
        <div className="flex-1 overflow-hidden flex flex-col">
          <div className="px-4 py-3 border-b border-gray-800">
            <span className="text-white text-sm font-semibold">Move Log</span>
          </div>
          <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1">
            {log.length === 0 ? (
              <p className="text-gray-700 text-xs pt-1">No moves yet.</p>
            ) : (
              log.map((entry) => (
                <div key={entry.id} className="text-xs leading-relaxed">
                  <span className="text-gray-300 font-medium">{entry.player}</span>
                  <span className="text-gray-600"> {entry.action}</span>
                </div>
              ))
            )}
            <div ref={logBottomRef} />
          </div>
        </div>
      </div>
    </div>
  );
}
