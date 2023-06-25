import { DIRECTIONS } from './constants';
import type { Level } from './SnakeGame';
import { SnakeGame } from './SnakeGame';
import type { InputHistory } from './SnakePlayer';

export function SnakeScoreCalculator(playId: string, level: Level, inputHistory: InputHistory) {
  const game = new SnakeGame(playId, level, 1);
  const agent = game.snakeAgents[0];

  for (let tick = 0, gameover = false; !gameover; tick += 1) {
    const directions = Object.keys(inputHistory) as Array<keyof typeof inputHistory>;
    const input = directions.find((direction) => inputHistory[direction].includes(tick));

    if (input) agent.setDirection(DIRECTIONS[input]);
    gameover = !agent.tick();
    tick += 1;
  }
  return agent.getScore();
}
