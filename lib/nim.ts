export interface NimMove {
  row: number;
  count: number;
}

function isLosingPosition(rows: number[]): boolean {
  const maxPile = Math.max(...rows);
  const nonZero = rows.filter((r) => r > 0).length;
  if (maxPile <= 1) {
    // Misère endgame: losing if odd number of non-empty piles (forced to take last)
    return nonZero % 2 === 1;
  }
  // Standard Nim: losing if XOR of all piles is 0
  return rows.reduce((a, b) => a ^ b, 0) === 0;
}

export function getEasyNimMove(rows: number[]): NimMove {
  const valid = rows
    .map((count, row) => ({ row, count }))
    .filter((r) => r.count > 0);
  const { row, count } = valid[Math.floor(Math.random() * valid.length)];
  return { row, count: Math.ceil(Math.random() * count) };
}

export function getHardNimMove(rows: number[]): NimMove {
  for (let row = 0; row < rows.length; row++) {
    for (let count = 1; count <= rows[row]; count++) {
      const next = rows.map((r, i) => (i === row ? r - count : r));
      if (isLosingPosition(next)) return { row, count };
    }
  }
  // Already in a losing position — make any valid move
  return getEasyNimMove(rows);
}
