import { DIRECTIONS } from './constants';
import type { SnakeAgent } from './SnakeAgent';
import type { SnakeAgentController } from './SnakeGame';
import type { Direction, Pos } from './types';

export type KeyMap = {
  [d in Direction]: number;
};
type ReverseKeyMap = {
  [n: number]: Direction;
};

const KONAMI = [38, 38, 40, 40, 37, 39, 37, 39, 66, 65];

export const getDirectionKey = (pos: Pos): Direction => {
  if (pos.x < 0) return 'LEFT';
  if (pos.x > 0) return 'RIGHT';
  if (pos.y < 0) return 'UP';
  return 'DOWN';
};

export type InputHistory = {
  [d in Direction]: number[];
};

export interface Highscore {
  playerName: string;
  score: number;
  inputHistory: InputHistory;
  playId: string;
}

export class SnakePlayer implements SnakeAgentController {
  public static readonly TICK_INTERVAL_BASE: number = 150;
  public static readonly TICK_INTERVAL_RANGE: number = 130;

  private readonly KEYMAP: KeyMap;
  private readonly REVERSE_KEYMAP: ReverseKeyMap;

  private tickCount = 0;
  private tickTimeout = 0;
  private tickInput: Pos | null = null;
  private queuedInput: Pos | null = null;
  private agent: SnakeAgent;
  private KONAMIKeyCodeHistory: number[] = [];

  private inputHandler: (e: KeyboardEvent) => void;
  public readonly inputHistory: InputHistory = { UP: [], DOWN: [], LEFT: [], RIGHT: [] };

  constructor(agent: SnakeAgent, keyBindings: KeyMap) {
    this.KEYMAP = keyBindings;
    this.REVERSE_KEYMAP = {
      [this.KEYMAP.UP]: 'UP',
      [this.KEYMAP.DOWN]: 'DOWN',
      [this.KEYMAP.LEFT]: 'LEFT',
      [this.KEYMAP.RIGHT]: 'RIGHT',
    };

    // Add input handler
    this.agent = agent;
    this.inputHandler = (e: KeyboardEvent) => {
      // Only handle Konami input for 1 player
      this.konamiLogger(e.keyCode);

      const direction = this.REVERSE_KEYMAP[e.keyCode];
      const newDirection = DIRECTIONS[direction];
      if (!newDirection) return;

      if (!this.tickInput) {
        this.agent.setDirection(newDirection);
        this.tickInput = newDirection;
      } else if (!this.queuedInput) {
        this.queuedInput = newDirection;
      }
    };
    this.bindKeys();
    this.scheduleNextTick();
  }

  public destroy() {
    this.unbindKeys();
    clearTimeout(this.tickTimeout);
  }

  private tick() {
    if (this.agent.tick()) {
      // agent is alive
      // Add input history if needed
      if (this.tickInput) this.inputHistory[getDirectionKey(this.tickInput)].push(this.tickCount);
      // Increment tickCounter
      this.tickCount += 1;
      // Schedule next tick
      this.scheduleNextTick();

      if (this.queuedInput) {
        this.tickInput = this.queuedInput;
        this.agent.setDirection(this.queuedInput);
        this.queuedInput = null;
      } else {
        this.tickInput = null;
      }
    } else {
      // agent is dead
      this.destroy();
    }
  }

  private scheduleNextTick() {
    this.tickTimeout = setTimeout(this.tick.bind(this), this.tickInterval) as unknown as number; // in node this is of 'Timeout' type, but we don't care and can ignore this
  }

  private get tickInterval(): number {
    const calc1 = 1 / (this.agent.getScore() + 10) ** 0.1;
    const calc2 = 1 - (1 - calc1) * 2;
    const calc3 = (calc2 - 0.2) * 2.5;
    const calc4 =
      calc3 * SnakePlayer.TICK_INTERVAL_RANGE +
      (SnakePlayer.TICK_INTERVAL_BASE - SnakePlayer.TICK_INTERVAL_RANGE);
    return calc4;
  }

  private konamiLogger(keyCode: number) {
    this.KONAMIKeyCodeHistory.push(keyCode);
    while (this.KONAMIKeyCodeHistory.length > KONAMI.length) {
      this.KONAMIKeyCodeHistory.splice(0, 1);
    }
    // Check for KONAMI code match
    if (
      this.KONAMIKeyCodeHistory.length === KONAMI.length &&
      this.KONAMIKeyCodeHistory.every((key, index) => KONAMI[index] === key)
    ) {
      this.agent.activateCheats();
    }
  }

  private bindKeys() {
    window.addEventListener('keydown', this.inputHandler);
  }

  private unbindKeys() {
    window.removeEventListener('keydown', this.inputHandler);
  }
}
