'use client';

import { useState, useCallback, useRef } from 'react';
import type { LogEntry } from '@/types/game';

export function useGameLog() {
  const [entries, setEntries] = useState<LogEntry[]>([]);
  const idRef = useRef(0);

  const addEntry = useCallback((player: string, action: string) => {
    const id = idRef.current++;
    setEntries((prev) => [...prev, { id, player, action }]);
  }, []);

  const clear = useCallback(() => {
    setEntries([]);
    idRef.current = 0;
  }, []);

  return { entries, addEntry, clear };
}
