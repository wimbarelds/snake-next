import type { Direction, Pos } from './types';

export const DIRECTIONS: { [d in Direction]: Pos } = {
  UP: { x: 0, y: -10 },
  DOWN: { x: 0, y: 10 },
  LEFT: { x: -10, y: 0 },
  RIGHT: { x: 10, y: 0 },
};

export const CANVAS_WIDTH = 1280;
export const CANVAS_HEIGHT = 640;
