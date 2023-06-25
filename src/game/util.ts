import { CANVAS_HEIGHT, CANVAS_WIDTH } from './constants';
import type { Pos } from './types';

export function isOutOfBounds(pos: Pos): boolean {
  if (pos.x < 0) return true;
  if (pos.y < 0) return true;
  if (pos.x >= CANVAS_WIDTH) return true;
  if (pos.y >= CANVAS_HEIGHT) return true;
  return false;
}
