export type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';

export interface Pos {
  x: number;
  y: number;
}

export interface Level {
  levelName: string;
  snakeTiles: Pos[];
  wallTiles: Pos[];
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ScoreCallback = (score: number) => any;
