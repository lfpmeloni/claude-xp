'use client';

import { useState, useCallback } from 'react';
import type { Player } from '@/types/game';

export function useScore() {
  const [wins, setWins] = useState<[number, number]>([0, 0]);

  const addWin = useCallback((player: Player) => {
    setWins((prev) => {
      const next: [number, number] = [prev[0], prev[1]];
      next[player]++;
      return next;
    });
  }, []);

  const reset = useCallback(() => setWins([0, 0]), []);

  return { wins, addWin, reset };
}
