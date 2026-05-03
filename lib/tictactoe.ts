export type Cell = 'X' | 'O' | null;
export type Board = [Cell, Cell, Cell, Cell, Cell, Cell, Cell, Cell, Cell];

const LINES = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6],
] as const;

export function getWinner(board: Board): Cell {
  for (const [a, b, c] of LINES) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return board[a];
    }
  }
  return null;
}

export function getWinningLine(board: Board): readonly number[] | null {
  for (const line of LINES) {
    const [a, b, c] = line;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) return line;
  }
  return null;
}

export function isDraw(board: Board): boolean {
  return !getWinner(board) && board.every((c) => c !== null);
}

export function getEasyAIMove(board: Board): number {
  const empty = board.map((c, i) => (c === null ? i : -1)).filter((i) => i >= 0);
  return empty[Math.floor(Math.random() * empty.length)];
}

export function getHardAIMove(board: Board, aiSymbol: Cell): number {
  const human: Cell = aiSymbol === 'X' ? 'O' : 'X';

  function minimax(b: Board, isMax: boolean, depth: number): number {
    const winner = getWinner(b);
    if (winner === aiSymbol) return 10 - depth;
    if (winner === human) return depth - 10;
    if (b.every((c) => c !== null)) return 0;

    if (isMax) {
      let best = -Infinity;
      for (let i = 0; i < 9; i++) {
        if (!b[i]) {
          b[i] = aiSymbol;
          best = Math.max(best, minimax(b, false, depth + 1));
          b[i] = null;
        }
      }
      return best;
    } else {
      let best = Infinity;
      for (let i = 0; i < 9; i++) {
        if (!b[i]) {
          b[i] = human;
          best = Math.min(best, minimax(b, true, depth + 1));
          b[i] = null;
        }
      }
      return best;
    }
  }

  let bestVal = -Infinity;
  let bestMove = -1;
  const b = [...board] as Board;
  for (let i = 0; i < 9; i++) {
    if (!b[i]) {
      b[i] = aiSymbol;
      const val = minimax(b, false, 0);
      b[i] = null;
      if (val > bestVal) {
        bestVal = val;
        bestMove = i;
      }
    }
  }
  return bestMove;
}
