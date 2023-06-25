import { DIRECTIONS } from './constants';
import type { SnakeAgent } from './SnakeAgent';
import type { SnakeGame } from './SnakeGame';
import type { InputHistory } from './SnakePlayer';
import { SnakePlayer } from './SnakePlayer';

export class SnakeRecording {
  private agent: SnakeAgent;
  private inputHistory: InputHistory;
  private recordingOverPromise: Promise<void>;
  private recordingOverPromiseResolver!: () => void;
  private tickIndex = 0;

  constructor(game: SnakeGame, inputHistory: InputHistory) {
    // Store arguments
    [this.agent] = game.snakeAgents;
    this.inputHistory = inputHistory;
    // Create promise to signify we're done
    this.recordingOverPromise = new Promise((resolve) => {
      this.recordingOverPromiseResolver = resolve;
    });

    setTimeout(this.tick.bind(this), this.tickInterval);
  }

  public get over(): Promise<void> {
    return this.recordingOverPromise;
  }

  private tick() {
    const directions = Object.keys(this.inputHistory) as Array<keyof typeof this.inputHistory>;
    const input = directions.find((direction) =>
      this.inputHistory[direction].includes(this.tickIndex),
    );

    if (input) this.agent.setDirection(DIRECTIONS[input]);
    if (this.agent.tick()) {
      setTimeout(this.tick.bind(this), this.tickInterval);
      this.tickIndex += 1;
    } else {
      this.recordingOverPromiseResolver();
    }
  }

  private get tickInterval(): number {
    const calc1 = 1 / (this.agent.getScore() + 10) ** 0.1;
    const calc2 = 1 - (1 - calc1) * 2;
    const calc3 = (calc2 - 0.2) * 2.5;
    const calc4 =
      calc3 * SnakePlayer.TICK_INTERVAL_RANGE +
      (SnakePlayer.TICK_INTERVAL_BASE - SnakePlayer.TICK_INTERVAL_RANGE);
    return calc4 / 4;
  }
}
