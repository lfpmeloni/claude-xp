export type GameMode = '2p' | 'easy' | 'hard';
export type Player = 0 | 1;

export interface LogEntry {
  id: number;
  player: string;
  action: string;
}

export interface GameScore {
  names: [string, string];
  wins: [number, number];
}
