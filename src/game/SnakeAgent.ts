import { Pos, DIRECTIONS, SnakeGame, Direction } from './SnakeGame';
import { getDirectionKey } from './SnakePlayer';

type AgentScoreCallback = (score: number) => any;
type AgentMoveCallback = (direction: Direction) => any;

export class SnakeAgent {
  // score
  // direction
  private snakeGame: SnakeGame;
  private snakeTiles: Pos[];
  private direction: Pos = DIRECTIONS.DOWN;
  private _score: number = 0;
  private scoreCallbacks: AgentScoreCallback[] = [];
  private moveCallbacks: AgentMoveCallback[] = [];
  private gameoverPromise: Promise<number>;
  private gameoverPromiseResolver!: () => void;

  public constructor(snakeGame: SnakeGame, snakeTiles: Pos[]) {
    this.snakeGame = snakeGame;
    this.snakeTiles = snakeTiles;

    // Add game-over promise
    this.gameoverPromise = new Promise((resolve, reject) => {
      this.gameoverPromiseResolver = () => resolve(this.score);
    });
  }

  public get gameover(): Promise<number> {
    return this.gameoverPromise;
  }

  private get snakeHead(): Pos {
    return this.snakeTiles[this.snakeTiles.length - 1];
  }

  private get snakeTailEnd(): Pos {
    return this.snakeTiles[0];
  }

  public getTiles(): Pos[] {
    return this.snakeTiles;
  }

  public getScore(): number {
    return this._score;
  }

  public addMoveListener(callback: AgentMoveCallback): void {
    this.moveCallbacks.push(callback);
  }

  private set score(val: number) {
    this._score = val;
    this.scoreCallbacks.forEach((callback) => callback(val));
  }

  public addScoreListener(callback: (score: number) => any) {
    this.scoreCallbacks.push(callback);
  }

  public isSnakeCollisionAt(pos: Pos) {
    return this.snakeTiles.some(
      (snakeTile) => pos !== snakeTile && pos.x === snakeTile.x && pos.y === snakeTile.y,
    );
  }

  private moveHead(): false | Pos[] {
    // Move head
    this.snakeTiles.push({
      x: this.snakeHead.x + this.direction.x,
      y: this.snakeHead.y + this.direction.y,
    });
    // Check if we need to increment score
    if (this.snakeGame.isCandyAt(this.snakeHead)) {
      this.score = this._score + 1;
      return this.snakeGame.placeCandy();
    }
    return false;
  }

  private moveTail(): boolean {
    const head = this.snakeHead;
    const dead =
      this.snakeGame.isSnakeCollisionAt(head) ||
      this.snakeGame.isOutOfBoundsAt(head) ||
      this.snakeGame.isWallCollisionAt(head);
    if (dead) this.gameoverPromiseResolver();
    // Only remove the last tail bit if we didn't hit a candy (effectively keeping our snake's length)
    else if (!this.snakeGame.removeCandyAt(this.snakeTailEnd)) this.snakeTiles.shift();
    // Return whether or not we died
    return !dead;
  }

  public tick(): boolean | Pos[] {
    const candyPlaced = this.moveHead();
    const alive = this.moveTail();
    this.moveCallbacks.forEach((callback) => {
      callback(getDirectionKey(this.direction));
    });
    return !alive ? false : candyPlaced || true;
  }

  public setDirection(newDirection: Pos) {
    // Don't allow direction reversal
    if (this.direction === DIRECTIONS.DOWN && newDirection === DIRECTIONS.UP) return;
    if (this.direction === DIRECTIONS.UP && newDirection === DIRECTIONS.DOWN) return;
    if (this.direction === DIRECTIONS.LEFT && newDirection === DIRECTIONS.RIGHT) return;
    if (this.direction === DIRECTIONS.RIGHT && newDirection === DIRECTIONS.LEFT) return;
    this.direction = newDirection;
  }

  public activateCheats(): void {
    this.snakeGame.activateCheats();
  }
}
