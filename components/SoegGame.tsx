'use client';

import { useState, useEffect } from 'react';
import GameShell from './game/GameShell';
import ModeSelector from './game/ModeSelector';
import { useScore } from '@/hooks/useScore';
import { useGameLog } from '@/hooks/useGameLog';
import { getEasyNimMove, getHardNimMove } from '@/lib/nim';
import type { GameMode, Player } from '@/types/game';

const INITIAL_ROWS = [3, 5, 7] as const;

type NimRows = [number, number, number];

interface SoegState {
  rows: NimRows;
  currentPlayer: Player;
  selectedRow: number | null;
  removeCount: number;
  gameOver: boolean;
  loser: Player | null;
}

function newGame(): SoegState {
  return {
    rows: [...INITIAL_ROWS] as NimRows,
    currentPlayer: Math.floor(Math.random() * 2) as Player,
    selectedRow: null,
    removeCount: 1,
    gameOver: false,
    loser: null,
  };
}

function computeMove(state: SoegState, rowIndex: number, count: number): SoegState {
  const rows = state.rows.map((r, i) => (i === rowIndex ? r - count : r)) as NimRows;
  const isEmpty = rows.every((r) => r === 0);
  return {
    rows,
    currentPlayer: isEmpty ? state.currentPlayer : ((1 - state.currentPlayer) as Player),
    selectedRow: null,
    removeCount: 1,
    gameOver: isEmpty,
    loser: isEmpty ? state.currentPlayer : null,
  };
}

const P_COLORS = ['text-blue-400', 'text-orange-400'] as const;
const P_BORDERS = ['border-blue-500', 'border-orange-500'] as const;

function aiName(mode: GameMode) {
  return mode === 'easy' ? 'AI (Easy)' : 'AI (Hard)';
}

export default function SoegGame() {
  const [mode, setMode] = useState<GameMode>('2p');
  const [game, setGame] = useState<SoegState>(newGame);
  const score = useScore();
  const log = useGameLog();

  const p2Label = mode === '2p' ? 'Player 2' : aiName(mode);
  const names: [string, string] = ['Player 1', p2Label];

  const pName = (p: Player) => names[p];

  const applyMove = (state: SoegState, rowIndex: number, count: number) => {
    const next = computeMove(state, rowIndex, count);
    log.addEntry(pName(state.currentPlayer), `removed ${count} from row ${rowIndex + 1}`);
    if (next.gameOver) {
      score.addWin((1 - next.loser!) as Player);
      log.addEntry(pName(next.loser!), 'removed the last stick — loses');
    }
    setGame(next);
  };

  // AI move
  useEffect(() => {
    if (game.gameOver || game.currentPlayer !== 1 || mode === '2p') return;
    const timer = setTimeout(() => {
      const move =
        mode === 'easy' ? getEasyNimMove(game.rows) : getHardNimMove(game.rows);
      applyMove(game, move.row, move.count);
    }, 700);
    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [game, mode]);

  const handleRowClick = (rowIndex: number) => {
    if (game.gameOver || game.rows[rowIndex] === 0) return;
    if (mode !== '2p' && game.currentPlayer === 1) return;
    setGame((prev) => {
      if (prev.selectedRow === rowIndex) {
        const max = prev.rows[rowIndex];
        return {
          ...prev,
          removeCount: prev.removeCount < max ? prev.removeCount + 1 : max,
        };
      }
      return { ...prev, selectedRow: rowIndex, removeCount: 1 };
    });
  };

  const handleConfirm = () => {
    if (game.selectedRow === null || game.gameOver) return;
    applyMove(game, game.selectedRow, game.removeCount);
  };

  const handleModeChange = (m: GameMode) => {
    setMode(m);
    setGame(newGame());
    log.clear();
  };

  const handleRestart = () => {
    setGame(newGame());
    log.clear();
  };

  const { rows, currentPlayer, selectedRow, removeCount, gameOver, loser } = game;
  const winner = loser !== null ? ((1 - loser) as Player) : null;
  const isAITurn = mode !== '2p' && currentPlayer === 1 && !gameOver;

  return (
    <GameShell
      score={{ names, wins: score.wins }}
      log={log.entries}
      onResetScore={score.reset}
    >
      <h1 className="text-2xl font-bold text-white mb-1">Soeg</h1>
      <p className="text-gray-500 text-sm mb-5">
        Remove sticks from one row per turn. Last to remove{' '}
        <span className="text-red-400">loses</span>.
      </p>

      <ModeSelector mode={mode} onChange={handleModeChange} />

      {/* Status */}
      <div
        className={`mt-5 mb-6 px-4 py-3 rounded-lg bg-gray-800 border-l-4 ${
          gameOver ? 'border-gray-600' : P_BORDERS[currentPlayer]
        }`}
      >
        {gameOver ? (
          <span>
            <span className={`font-bold ${P_COLORS[winner!]}`}>{names[winner!]} wins</span>
            <span className="text-gray-500 text-sm ml-2">
              — {names[loser!]} removed the last stick
            </span>
          </span>
        ) : isAITurn ? (
          <span className={`font-semibold ${P_COLORS[1]}`}>{p2Label} is thinking…</span>
        ) : (
          <span>
            <span className={`font-semibold ${P_COLORS[currentPlayer]}`}>
              {names[currentPlayer]}
            </span>
            <span className="text-gray-500 text-sm ml-2">
              {selectedRow === null
                ? '— click a row to select sticks'
                : `— ${removeCount} stick${removeCount > 1 ? 's' : ''} from row ${selectedRow + 1} (click again to add more)`}
            </span>
          </span>
        )}
      </div>

      {/* Board — centered */}
      <div className="flex flex-col items-center gap-2">
        {rows.map((count, rowIndex) => {
          const total = INITIAL_ROWS[rowIndex];
          const isSelected = selectedRow === rowIndex;
          const pending = isSelected ? removeCount : 0;

          return (
            <button
              key={rowIndex}
              onClick={() => handleRowClick(rowIndex)}
              disabled={gameOver || count === 0 || isAITurn}
              className={`flex items-center gap-4 px-5 py-3 rounded-xl transition-all select-none ${
                isSelected
                  ? 'bg-gray-700 ring-2 ring-yellow-500'
                  : count === 0
                  ? 'bg-gray-900 opacity-25 cursor-not-allowed'
                  : isAITurn
                  ? 'bg-gray-800 cursor-not-allowed'
                  : 'bg-gray-800 hover:bg-gray-700 cursor-pointer active:scale-95'
              }`}
            >
              <span className="text-gray-500 text-xs w-5 text-right shrink-0">
                R{rowIndex + 1}
              </span>

              {/* Sticks */}
              <div className="flex items-end gap-0.5">
                {Array.from({ length: total }, (_, i) => {
                  const isPresent = i < count;
                  const isPending = isSelected && isPresent && i >= count - pending;
                  return (
                    <div
                      key={i}
                      style={{ width: 10, height: 44 }}
                      className={`rounded-t-sm transition-colors duration-100 ${
                        !isPresent
                          ? 'bg-transparent'
                          : isPending
                          ? 'bg-red-400'
                          : isSelected
                          ? 'bg-yellow-300'
                          : 'bg-amber-400'
                      }`}
                    />
                  );
                })}
              </div>

              <span className="text-gray-600 text-xs w-4 text-left shrink-0">{count}</span>
            </button>
          );
        })}
      </div>

      {/* Actions */}
      <div className="mt-6 flex gap-3 justify-center">
        {!gameOver && selectedRow !== null && !isAITurn && (
          <button
            onClick={handleConfirm}
            className="px-5 py-2 bg-yellow-600 hover:bg-yellow-500 text-black font-bold rounded-lg text-sm transition-colors"
          >
            Remove {removeCount} stick{removeCount > 1 ? 's' : ''}
          </button>
        )}
        <button
          onClick={handleRestart}
          className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm transition-colors"
        >
          {gameOver ? 'Play Again' : 'Restart'}
        </button>
      </div>
    </GameShell>
  );
}
