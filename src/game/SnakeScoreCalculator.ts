import { InputHistory } from './SnakePlayer';
import { SnakeGame, Level, Direction, DIRECTIONS } from './SnakeGame';

export function SnakeScoreCalculator(playId: string, level: Level, inputHistory: InputHistory) {
  const game = new SnakeGame(playId, level, 1);
  const agent = game.snakeAgents[0];
  let tick = 0;
  let gameover = false;
  while (!gameover) {
    const input: Direction | null =
      inputHistory.UP.indexOf(tick) >= 0
        ? 'UP'
        : inputHistory.DOWN.indexOf(tick) >= 0
        ? 'DOWN'
        : inputHistory.LEFT.indexOf(tick) >= 0
        ? 'LEFT'
        : inputHistory.RIGHT.indexOf(tick) >= 0
        ? 'RIGHT'
        : null;

    if (input) agent.setDirection(DIRECTIONS[input]);
    gameover = !agent.tick();
    tick++;
  }
  return agent.getScore();
}
