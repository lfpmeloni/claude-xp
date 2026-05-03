'use client';

import { useState, useEffect } from 'react';
import GameShell from './game/GameShell';
import ModeSelector from './game/ModeSelector';
import { useScore } from '@/hooks/useScore';
import { useGameLog } from '@/hooks/useGameLog';
import {
  getWinner,
  getWinningLine,
  isDraw,
  getEasyAIMove,
  getHardAIMove,
} from '@/lib/tictactoe';
import type { Board, Cell } from '@/lib/tictactoe';
import type { GameMode, Player } from '@/types/game';

const EMPTY_BOARD: Board = [null, null, null, null, null, null, null, null, null];

interface TTTState {
  board: Board;
  currentPlayer: Player;
  gameOver: boolean;
  winner: Cell;
  isDraw: boolean;
}

function newGame(): TTTState {
  return {
    board: [...EMPTY_BOARD] as Board,
    currentPlayer: Math.floor(Math.random() * 2) as Player,
    gameOver: false,
    winner: null,
    isDraw: false,
  };
}

const SYMBOLS: [Cell, Cell] = ['X', 'O'];
const P_COLORS = ['text-blue-400', 'text-orange-400'] as const;
const P_BORDERS = ['border-blue-500', 'border-orange-500'] as const;
const CELL_COLORS: Record<string, string> = {
  X: 'text-blue-400',
  O: 'text-orange-400',
};

function aiLabel(mode: GameMode) {
  return mode === 'easy' ? 'AI (Easy)' : 'AI (Hard)';
}

const POS_LABELS = ['top-left','top-center','top-right','mid-left','center','mid-right','bot-left','bot-center','bot-right'];

export default function TicTacToeGame() {
  const [mode, setMode] = useState<GameMode>('2p');
  const [game, setGame] = useState<TTTState>(newGame);
  const score = useScore();
  const log = useGameLog();

  const p2Label = mode === '2p' ? 'Player 2' : aiLabel(mode);
  const names: [string, string] = ['Player 1', p2Label];
  const pName = (p: Player) => names[p];
  const pSymbol = (p: Player) => SYMBOLS[p];

  const applyMove = (state: TTTState, cellIndex: number) => {
    if (state.board[cellIndex] || state.gameOver) return;

    const newBoard = [...state.board] as Board;
    newBoard[cellIndex] = pSymbol(state.currentPlayer);

    const w = getWinner(newBoard);
    const draw = isDraw(newBoard);
    const over = !!w || draw;
    const nextPlayer = over ? state.currentPlayer : ((1 - state.currentPlayer) as Player);

    log.addEntry(pName(state.currentPlayer), `played ${pSymbol(state.currentPlayer)} at ${POS_LABELS[cellIndex]}`);

    if (w) {
      score.addWin(state.currentPlayer);
      log.addEntry(pName(state.currentPlayer), 'wins!');
    } else if (draw) {
      log.addEntry('—', 'draw');
    }

    setGame({
      board: newBoard,
      currentPlayer: nextPlayer,
      gameOver: over,
      winner: w,
      isDraw: draw,
    });
  };

  // AI move
  useEffect(() => {
    if (game.gameOver || game.currentPlayer !== 1 || mode === '2p') return;
    const timer = setTimeout(() => {
      const aiSymbol = pSymbol(1);
      const move =
        mode === 'easy'
          ? getEasyAIMove(game.board)
          : getHardAIMove(game.board, aiSymbol);
      applyMove(game, move);
    }, 600);
    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [game, mode]);

  const handleCellClick = (i: number) => {
    if (game.gameOver || game.board[i]) return;
    if (mode !== '2p' && game.currentPlayer === 1) return;
    applyMove(game, i);
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

  const winLine = getWinningLine(game.board);
  const isAITurn = mode !== '2p' && game.currentPlayer === 1 && !game.gameOver;

  return (
    <GameShell
      score={{ names, wins: score.wins }}
      log={log.entries}
      onResetScore={score.reset}
    >
      <h1 className="text-2xl font-bold text-white mb-1">Tic-Tac-Toe</h1>
      <p className="text-gray-500 text-sm mb-5">
        Three in a row wins. Player 1 is{' '}
        <span className="text-blue-400 font-bold">X</span>, Player 2 is{' '}
        <span className="text-orange-400 font-bold">O</span>.
      </p>

      <ModeSelector mode={mode} onChange={handleModeChange} />

      {/* Status */}
      <div
        className={`mt-5 mb-6 px-4 py-3 rounded-lg bg-gray-800 border-l-4 ${
          game.gameOver ? 'border-gray-600' : P_BORDERS[game.currentPlayer]
        }`}
      >
        {game.gameOver ? (
          game.isDraw ? (
            <span className="text-gray-300 font-semibold">Draw!</span>
          ) : (
            <span>
              <span className={`font-bold ${P_COLORS[game.winner === 'X' ? 0 : 1]}`}>
                {game.winner === SYMBOLS[0] ? names[0] : names[1]} wins
              </span>
              <span className="text-gray-500 text-sm ml-2">
                ({game.winner} gets three in a row)
              </span>
            </span>
          )
        ) : isAITurn ? (
          <span className={`font-semibold ${P_COLORS[1]}`}>{p2Label} is thinking…</span>
        ) : (
          <span>
            <span className={`font-semibold ${P_COLORS[game.currentPlayer]}`}>
              {names[game.currentPlayer]}
            </span>
            <span className="text-gray-500 text-sm ml-2">
              — click a cell to place {pSymbol(game.currentPlayer)}
            </span>
          </span>
        )}
      </div>

      {/* Board — centered */}
      <div className="flex justify-center">
        <div className="grid grid-cols-3 gap-2">
          {game.board.map((cell, i) => {
            const isWinCell = winLine?.includes(i) ?? false;
            return (
              <button
                key={i}
                onClick={() => handleCellClick(i)}
                disabled={!!cell || game.gameOver || isAITurn}
                className={`w-20 h-20 rounded-xl text-3xl font-black flex items-center justify-center transition-all ${
                  isWinCell
                    ? 'bg-gray-600 ring-2 ring-yellow-400'
                    : cell
                    ? 'bg-gray-800 cursor-not-allowed'
                    : game.gameOver || isAITurn
                    ? 'bg-gray-800 cursor-not-allowed'
                    : 'bg-gray-800 hover:bg-gray-700 cursor-pointer active:scale-95'
                }`}
              >
                {cell && (
                  <span className={CELL_COLORS[cell]}>{cell}</span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Restart */}
      <div className="mt-6 flex justify-center">
        <button
          onClick={handleRestart}
          className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm transition-colors"
        >
          {game.gameOver ? 'Play Again' : 'Restart'}
        </button>
      </div>
    </GameShell>
  );
}
