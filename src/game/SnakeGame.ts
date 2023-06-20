import { CANVAS_WIDTH, CANVAS_HEIGHT } from './SnakeRenderer';
import { SnakeAgent } from './SnakeAgent';

const seedRandom: any = require('seed-random'); // For repeatable candy placements
const NUM_CANDY_ON_MAP = 25;

type GameScoreCallback = ({ playerIndex, score }: { playerIndex: number; score: number }) => any;

export type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';

export const DIRECTIONS: { [d in Direction]: Pos } = {
  UP: { x: 0, y: -10 },
  DOWN: { x: 0, y: 10 },
  LEFT: { x: -10, y: 0 },
  RIGHT: { x: 10, y: 0 },
};

export interface Pos {
  x: number;
  y: number;
}

export interface Level {
  levelName: string;
  snakeTiles: Pos[][];
  wallTiles: Pos[];
}

export interface SnakeAgentController {
  destroy(): void;
}

function cloneLevel(level: Level): Level {
  return {
    levelName: level.levelName,
    wallTiles: level.wallTiles.map((tile) => ({ ...tile })),
    snakeTiles: level.snakeTiles.map((snake) => snake.map((atom) => ({ ...atom }))),
  };
}

export class SnakeGame {
  private level: Level;
  private wallTiles: Pos[];
  private floorTiles: Pos[];
  private candyTiles: Pos[] = [];
  private randomizer!: () => number;
  private agents: SnakeAgent[];
  private gameoverPromise: Promise<number[]>;

  constructor(playId: string, level: Level, numPlayers: number) {
    this.level = cloneLevel(level);
    this.agents = new Array(numPlayers)
      .fill(0)
      .map((x, agentIndex) => new SnakeAgent(this, this.level.snakeTiles[agentIndex]));
    this.wallTiles = this.level.wallTiles
      .slice()
      .sort((a, b) => (a.x === b.x ? a.y - b.y : a.x - b.x)); // if we sort our wall tiles we search for collision checks much faster
    this.floorTiles = this.computeFloorTiles();

    this.gameoverPromise = Promise.all(this.agents.map((agent) => agent.gameover));

    this.reset(playId);
  }

  public get gameover(): Promise<number[]> {
    return this.gameoverPromise;
  }

  public get snakeAgents(): SnakeAgent[] {
    return this.agents;
  }

  private get snakeTiles() {
    return this.agents.reduce((tiles: Pos[], agent: SnakeAgent): Pos[] => {
      tiles.push.apply(tiles, agent.getTiles());
      return tiles;
    }, []);
  }

  private computeFloorTiles(): Pos[] {
    const floorTiles: Pos[] = [];
    // First copy our snake tiles as floor tiles as the snake must always start on valid floortiles
    floorTiles.push.apply(floorTiles, this.snakeTiles);
    // Then expand outwards from there in all directions until a wall is hit
    // Create a map in which we record which tiles have been scanned, so we don't scan anything twice
    const scannedMap = floorTiles.reduce((acc: any, curr): any => {
      acc[`${curr.x}.${curr.y}`] = true;
      return acc;
    }, {});

    // Create a list of tiles to search from
    let searchFromTiles = floorTiles.slice();
    while (true) {
      const newTiles: Pos[] = [];
      for (const floorTile of searchFromTiles) {
        const search = [
          { x: floorTile.x - 10, y: floorTile.y },
          { x: floorTile.x + 10, y: floorTile.y },
          { x: floorTile.x, y: floorTile.y - 10 },
          { x: floorTile.x, y: floorTile.y + 10 },
        ];
        for (const tile of search) {
          const key = `${tile.x}.${tile.y}`;
          if (scannedMap[key]) continue; // If we've already scanned this tile, ignore it
          scannedMap[key] = true; // Otherwise we're scanning it now, so adding it to the list
          if (this.isWallCollisionAt(tile)) continue; // If there is a wall here, it's not a floor tile
          if (this.isOutOfBoundsAt(tile)) continue;
          newTiles.push(tile);
        }
      }
      // If we haven't found any new tiles, we're done
      if (newTiles.length === 0) break;
      // Add all the newly found tiles to the floorTiles list
      floorTiles.push.apply(floorTiles, newTiles);
      // Then search from the new
      searchFromTiles = newTiles;
    }
    return floorTiles;
  }

  private getRandom(min: number = 0, max: number = 1, floored: boolean = false) {
    const delta = max - min;
    const value = min + this.randomizer() * delta;
    return floored ? Math.floor(value) : value;
  }

  public assignAgentControllers(
    creationCallback: (agent: SnakeAgent, agentIndex: number) => SnakeAgentController,
  ) {
    return this.agents.map((agent: SnakeAgent, agentIndex: number) =>
      creationCallback(agent, agentIndex),
    );
  }

  public addScoreListener(listener: GameScoreCallback) {
    // Add listeners to all agents and update our listeners whenever one of our agents reports a score change
    for (let i = 0; i < this.agents.length; i++) {
      this.agents[i].addScoreListener((score: number) => {
        listener({ playerIndex: i, score });
      });
    }
  }

  public getScores(): number[] {
    return this.agents.map((agent) => agent.getScore());
  }

  public isWallCollisionAt(pos: Pos): boolean {
    // Determine an initial search point based on the x point of the position
    const xMin = this.wallTiles[0].x;
    const xMax = this.wallTiles[this.wallTiles.length - 1].x;
    const xDelta = xMax - xMin;
    const pct = Math.min(1, Math.max(0, (pos.x - xMin) / xDelta));
    const searchStart = Math.floor(pct * (this.wallTiles.length - 1));
    // Make sure our search start point isn't the position we're looking for
    const searchStartTile = this.wallTiles[searchStart];
    if (searchStartTile.x === pos.x && searchStartTile.y === pos.y) return true;
    // Determine which direction we should be looking in
    const direction =
      pos.x > searchStartTile.x || (pos.x === searchStartTile.x && pos.y > searchStartTile.y)
        ? 1
        : -1;
    for (let i = searchStart + direction; i < this.wallTiles.length && i >= 0; i += direction) {
      const tile = this.wallTiles[i];
      if (tile.x === pos.x && tile.y === pos.y) return true;
      if (direction === 1 && tile.x > pos.x) return false;
      if (direction === -1 && tile.x < pos.x) return false;
    }
    return false;
  }

  public isOutOfBoundsAt(pos: Pos): boolean {
    if (pos.x < 0) return true;
    if (pos.y < 0) return true;
    if (pos.x >= CANVAS_WIDTH) return true;
    if (pos.y >= CANVAS_HEIGHT) return true;
    return false;
  }

  public isSnakeCollisionAt(pos: Pos) {
    return this.agents.some((agent) => agent.isSnakeCollisionAt(pos));
  }

  public isCandyAt(pos: Pos) {
    return this.indexOfCandyAt(pos) !== -1;
  }

  public placeCandy(n: number = 1): Pos[] {
    const validTiles = this.floorTiles.filter((floorTile) => {
      if (
        this.snakeTiles.some(
          (snakeTile) => snakeTile.x === floorTile.x && snakeTile.y === floorTile.y,
        )
      )
        return false;
      if (
        this.candyTiles.some(
          (candyTile) => candyTile.x === floorTile.x && candyTile.y === floorTile.y,
        )
      )
        return false;
      return true;
    });

    const placements: Pos[] = [];

    for (let i = 0; i < n; i++) {
      if (validTiles.length === 0) break;
      const tileIndex = this.getRandom(0, validTiles.length, true);
      const tile = validTiles.splice(tileIndex, 1)[0];
      this.candyTiles.push(tile);
      placements.push(tile);
    }

    return placements;
  }

  private indexOfCandyAt(pos: Pos): number {
    return this.candyTiles.findIndex((candyTile) => candyTile.x === pos.x && candyTile.y === pos.y);
  }

  public removeCandyAt(pos: Pos): boolean {
    const index = this.indexOfCandyAt(pos);
    // If there is no candy here, return false
    if (index === -1) return false;
    // If there is candy here, remove it
    this.candyTiles.splice(index, 1);
    return true;
    // TODO: Announce a candy is removed
  }

  public reset(playId: string): void {
    this.randomizer = seedRandom(playId);
    this.candyTiles = [];
    this.placeCandy(NUM_CANDY_ON_MAP);
  }

  public activateCheats(): void {
    this.placeCandy(250);
  }

  public getWallTiles(): Pos[] {
    return this.wallTiles;
  }

  public getFloorTiles(): Pos[] {
    return this.floorTiles;
  }

  public getCandyTiles(): Pos[] {
    return this.candyTiles;
  }

  public getSnakeTiles(): Pos[] {
    return this.snakeTiles;
  }
}
