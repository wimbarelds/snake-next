import { DIRECTIONS } from './constants';
import type { SnakeAgent } from './SnakeAgent';
import type { Level, SnakeGame } from './SnakeGame';
import type { InputHistory } from './SnakePlayer';
import type { Direction } from './types';

export class SnakeBot {
  public static readonly TICK_INTERVAL_BASE: number = 150;
  public static readonly TICK_INTERVAL_RANGE: number = 130;

  private tickCount = 0;
  private tickTimeout = 0;
  private direction: Direction = 'DOWN';
  private tickInput: Direction | null = null;
  private snakeAgent: SnakeAgent;
  private worker: Worker;
  private gameoverPromise: Promise<InputHistory>;
  private gameoverPromiseResolver!: (value: InputHistory) => void;
  private inputHistory: InputHistory = { UP: [], DOWN: [], LEFT: [], RIGHT: [] };

  constructor(snakeGame: SnakeGame, level: Level, worker: Worker, botIndex: number) {
    this.snakeAgent = snakeGame.snakeAgents[botIndex];
    this.worker = worker;
    this.gameoverPromise = new Promise((resolve) => {
      this.gameoverPromiseResolver = resolve;
    });

    worker.postMessage({
      type: 'init',
      data: {
        level,
        candyTiles: snakeGame.getCandyTiles(),
        botIndex,
      },
    });

    snakeGame.snakeAgents.forEach((agent, snakeIndex) => {
      agent.addMoveListener((direction) => {
        this.worker.postMessage({
          type: 'move',
          data: {
            direction,
            snakeIndex,
          },
        });
      });
    });

    worker.addEventListener('message', (event) => {
      const command: Direction = event.data;
      if (['UP', 'DOWN', 'LEFT', 'RIGHT'].indexOf(command) !== -1) {
        this.snakeAgent.setDirection(DIRECTIONS[command]);
        this.tickInput = command;
        this.direction = command;
      } else {
        // eslint-disable-next-line no-console
        console.error('Invalid command received from bot', command);
      }
    });

    // Give bots 1 second to initialize
    this.tickTimeout = setTimeout(this.tick.bind(this), 1000) as unknown as number;
  }

  public get gameover() {
    return this.gameoverPromise;
  }

  private get tickInterval(): number {
    const calc1 = 1 / (this.snakeAgent.getScore() + 10) ** 0.1;
    const calc2 = 1 - (1 - calc1) * 2;
    const calc3 = (calc2 - 0.2) * 2.5;
    const calc4 =
      calc3 * SnakeBot.TICK_INTERVAL_RANGE +
      (SnakeBot.TICK_INTERVAL_BASE - SnakeBot.TICK_INTERVAL_RANGE);
    return calc4;
  }

  public destroy() {
    clearTimeout(this.tickTimeout);
  }

  private tick() {
    // Record tick input if any
    if (this.tickInput) this.inputHistory[this.tickInput].push(this.tickCount);
    this.tickInput = null;

    // Send tick to the game and increate our counter
    const gameTick = this.snakeAgent.tick();
    this.tickCount += 1;

    // Deal with what happened during the tick
    if (!gameTick) {
      // If death is what happened...
      // eslint-disable-next-line no-console
      console.log('Your bot is game-over, score:', this.snakeAgent.getScore());
      this.gameoverPromiseResolver(this.inputHistory);
    } else {
      // We didn't die so, figure out what to do next
      // If candies were placed, tell our worker
      if (gameTick !== true) {
        this.worker.postMessage({
          type: 'candy',
          data: gameTick,
        });
      }
      // Afterwards, tell our worker that a tick happened,
      // and how long until the next tick happens
      const interval = this.tickInterval;
      this.worker.postMessage({
        type: 'tick',
        data: {
          interval,
          direction: this.direction,
        },
      });

      this.tickTimeout = setTimeout(this.tick.bind(this), interval) as unknown as number;
    }
  }
}
