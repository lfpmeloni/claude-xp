'use client';

import { useState } from 'react';

const INITIAL_ROWS = [3, 5, 7] as const;
const PLAYER_NAMES = ['Player 1', 'Player 2'] as const;
const PLAYER_COLORS = ['text-blue-400', 'text-orange-400'] as const;
const PLAYER_BORDERS = ['border-blue-500', 'border-orange-500'] as const;

type Player = 0 | 1;

type GameState = {
  rows: [number, number, number];
  currentPlayer: Player;
  selectedRow: number | null;
  removeCount: number;
  gameOver: boolean;
  loser: Player | null;
};

function newGame(): GameState {
  return {
    rows: [...INITIAL_ROWS] as [number, number, number],
    currentPlayer: (Math.floor(Math.random() * 2) as Player),
    selectedRow: null,
    removeCount: 1,
    gameOver: false,
    loser: null,
  };
}

function Sticks({
  total,
  current,
  pending,
  selected,
}: {
  total: number;
  current: number;
  pending: number;
  selected: boolean;
}) {
  return (
    <div className="flex items-end gap-0.5">
      {Array.from({ length: total }, (_, i) => {
        const isPresent = i < current;
        const isPending = selected && isPresent && i >= current - pending;
        return (
          <div
            key={i}
            className={`w-2.5 rounded-t-sm transition-colors duration-100 ${
              !isPresent
                ? 'bg-transparent'
                : isPending
                ? 'bg-red-400'
                : selected
                ? 'bg-yellow-300'
                : 'bg-amber-400'
            }`}
            style={{ height: 44 }}
          />
        );
      })}
    </div>
  );
}

export default function SoegGame() {
  const [game, setGame] = useState<GameState>(newGame);

  const selectRow = (rowIndex: number) => {
    if (game.gameOver || game.rows[rowIndex] === 0) return;
    setGame((prev) => ({
      ...prev,
      selectedRow: prev.selectedRow === rowIndex ? null : rowIndex,
      removeCount: 1,
    }));
  };

  const adjustCount = (delta: number) => {
    if (game.selectedRow === null) return;
    const max = game.rows[game.selectedRow];
    setGame((prev) => ({
      ...prev,
      removeCount: Math.max(1, Math.min(max, prev.removeCount + delta)),
    }));
  };

  const confirmMove = () => {
    if (game.selectedRow === null || game.gameOver) return;
    setGame((prev) => {
      const newRows = [...prev.rows] as [number, number, number];
      newRows[prev.selectedRow!] -= prev.removeCount;
      const isEmpty = newRows.every((r) => r === 0);
      return {
        rows: newRows,
        currentPlayer: isEmpty
          ? prev.currentPlayer
          : ((1 - prev.currentPlayer) as Player),
        selectedRow: null,
        removeCount: 1,
        gameOver: isEmpty,
        loser: isEmpty ? prev.currentPlayer : null,
      };
    });
  };

  const { rows, currentPlayer, selectedRow, removeCount, gameOver, loser } = game;
  const winner = loser !== null ? ((1 - loser) as Player) : null;

  return (
    <div className="p-10 max-w-lg">
      <h1 className="text-2xl font-bold text-white mb-1">Soeg</h1>
      <p className="text-gray-500 text-sm mb-8">
        Remove sticks from one row per turn. The player who removes the last
        stick <span className="text-red-400">loses</span>.
      </p>

      {/* Status */}
      <div
        className={`mb-6 px-4 py-3 rounded-lg bg-gray-800 border-l-4 ${
          gameOver ? 'border-gray-600' : PLAYER_BORDERS[currentPlayer]
        }`}
      >
        {gameOver ? (
          <span>
            <span className={`font-bold ${PLAYER_COLORS[winner!]}`}>
              {PLAYER_NAMES[winner!]} wins
            </span>
            <span className="text-gray-500 text-sm ml-2">
              — {PLAYER_NAMES[loser!]} removed the last stick
            </span>
          </span>
        ) : (
          <span>
            <span className={`font-semibold ${PLAYER_COLORS[currentPlayer]}`}>
              {PLAYER_NAMES[currentPlayer]}
            </span>
            <span className="text-gray-500 text-sm ml-2">
              {selectedRow === null ? '— select a row' : `— row ${selectedRow + 1} selected`}
            </span>
          </span>
        )}
      </div>

      {/* Board */}
      <div className="space-y-2 mb-6">
        {rows.map((count, rowIndex) => (
          <button
            key={rowIndex}
            onClick={() => selectRow(rowIndex)}
            disabled={gameOver || count === 0}
            className={`w-full flex items-center gap-4 px-4 py-3 rounded-lg transition-all ${
              selectedRow === rowIndex
                ? 'bg-gray-700 ring-2 ring-yellow-500'
                : count === 0
                ? 'bg-gray-900 opacity-30 cursor-not-allowed'
                : 'bg-gray-800 hover:bg-gray-700 cursor-pointer'
            }`}
          >
            <span className="text-gray-500 text-xs w-6 shrink-0 text-right">
              R{rowIndex + 1}
            </span>
            <Sticks
              total={INITIAL_ROWS[rowIndex]}
              current={count}
              pending={selectedRow === rowIndex ? removeCount : 0}
              selected={selectedRow === rowIndex}
            />
            <span className="text-gray-600 text-xs ml-auto tabular-nums">{count}</span>
          </button>
        ))}
      </div>

      {/* Move controls */}
      {selectedRow !== null && !gameOver && (
        <div className="flex items-center gap-3 bg-gray-800 rounded-lg px-4 py-3 mb-4">
          <span className="text-gray-400 text-sm">Remove</span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => adjustCount(-1)}
              disabled={removeCount <= 1}
              className="w-7 h-7 rounded bg-gray-700 hover:bg-gray-600 text-white text-sm disabled:opacity-25 disabled:cursor-not-allowed transition-colors"
            >
              −
            </button>
            <span className="text-white font-mono font-bold w-8 text-center">
              {removeCount}
            </span>
            <button
              onClick={() => adjustCount(1)}
              disabled={removeCount >= rows[selectedRow]}
              className="w-7 h-7 rounded bg-gray-700 hover:bg-gray-600 text-white text-sm disabled:opacity-25 disabled:cursor-not-allowed transition-colors"
            >
              +
            </button>
          </div>
          <span className="text-gray-600 text-xs">from row {selectedRow + 1}</span>
          <button
            onClick={confirmMove}
            className="ml-auto px-4 py-1.5 bg-yellow-600 hover:bg-yellow-500 text-black font-bold rounded text-sm transition-colors"
          >
            Confirm
          </button>
        </div>
      )}

      {/* Restart */}
      {gameOver && (
        <button
          onClick={() => setGame(newGame())}
          className="w-full py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg text-sm transition-colors"
        >
          Play Again
        </button>
      )}
    </div>
  );
}
