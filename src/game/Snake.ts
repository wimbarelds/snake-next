import seedRandom from 'seed-random';

import { DIRECTIONS } from './constants';
import type { Level, Pos, ScoreCallback } from './types';
import { isOutOfBounds } from './util';

// For repeatable candy placements
const NUM_CANDY_ON_MAP = 25;

export class Snake {
  private level: Level;
  private _score = 0;
  private wallTiles: Pos[];
  private floorTiles: Pos[];
  private candyTiles: Pos[] = [];
  private snakeTiles!: Pos[];
  private randomizer!: () => number;
  private direction!: Pos;
  private scoreCallbacks: ScoreCallback[] = [];

  private get score() {
    return this._score;
  }

  private set score(val: number) {
    this._score = val;
    this.scoreCallbacks.forEach((callback) => callback(val));
  }

  constructor(playId: string, level: Level) {
    this.level = level;
    this.wallTiles = level.wallTiles.slice().sort((a, b) => (a.x === b.x ? a.y - b.y : a.x - b.x)); // if we sort our wall tiles we search for collision checks much faster
    this.reset(playId);
    this.floorTiles = this.computeFloorTiles();

    this.placeCandy(NUM_CANDY_ON_MAP);
  }

  public addScoreListener(callback: ScoreCallback) {
    this.scoreCallbacks.push(callback);
  }

  private computeFloorTiles(): Pos[] {
    const floorTiles: Pos[] = [];
    // First copy our snake tiles as floor tiles as the snake must always start on valid floortiles
    this.snakeTiles.forEach((snakeTile) => floorTiles.push({ x: snakeTile.x, y: snakeTile.y }));
    // Then expand outwards from there in all directions until a wall is hit
    // Create a map in which we record which tiles have been scanned, so we don't scan anything twice
    type ScanKey = `${number}.${number}`;
    type ScanMap = { [key: ScanKey]: true };
    const scannedMap = this.snakeTiles.reduce(
      (acc: ScanMap, curr): ScanMap => ({
        ...acc,
        [`${curr.x}.${curr.y}`]: true,
      }),
      {},
    );

    // Create a list of tiles to search from
    let searchFromTiles = floorTiles.slice();
    for (;;) {
      const newTiles: Pos[] = [];
      for (const floorTile of searchFromTiles) {
        const search = [
          { x: floorTile.x - 10, y: floorTile.y },
          { x: floorTile.x + 10, y: floorTile.y },
          { x: floorTile.x, y: floorTile.y - 10 },
          { x: floorTile.x, y: floorTile.y + 10 },
        ];
        for (const tile of search) {
          const key: ScanKey = `${tile.x}.${tile.y}`;
          if (scannedMap[key]) continue; // If we've already scanned this tile, ignore it
          scannedMap[key] = true; // Otherwise we're scanning it now, so adding it to the list
          if (this.isWallCollisionAt(tile)) continue; // If there is a wall here, it's not a floor tile
          if (isOutOfBounds(tile)) continue;
          newTiles.push(tile);
        }
      }
      // If we haven't found any new tiles, we're done
      if (newTiles.length === 0) break;
      // Add all the newly found tiles to the floorTiles list
      floorTiles.push(...newTiles);
      // Then search from the new
      searchFromTiles = newTiles;
    }
    return floorTiles;
  }

  private getRandom(min = 0, max = 1, floored = false) {
    const delta = max - min;
    const value = min + this.randomizer() * delta;
    return floored ? Math.floor(value) : value;
  }

  private isWallCollisionAt(pos: Pos): boolean {
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

  private isTailCollision() {
    const head = this.snakeTiles[this.snakeTiles.length - 1];
    for (let i = 0; i < this.snakeTiles.length - 2; i += 1) {
      const tailBit = this.snakeTiles[i];
      if (tailBit.x === head.x && tailBit.y === head.y) return true;
    }
    return false;
  }

  private placeCandy(n = 1): Pos[] {
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

    for (let i = 0; i < n; i += 1) {
      if (validTiles.length === 0) break;
      const tileIndex = this.getRandom(0, validTiles.length, true);
      const tile = validTiles.splice(tileIndex, 1)[0];
      this.candyTiles.push(tile);
      placements.push(tile);
    }

    return placements;
  }

  private indexOfCandyAt(pos: Pos) {
    return this.candyTiles.findIndex((candyTile) => candyTile.x === pos.x && candyTile.y === pos.y);
  }

  private removeCandyAt(pos: Pos): boolean {
    const index = this.indexOfCandyAt(pos);
    // If there is no candy here, return false
    if (index === -1) return false;
    // If there is candy here, remove it
    this.candyTiles.splice(index, 1);
    return true;
    // TODO: Announce a candy is removed
  }

  public reset(playId: string): void {
    this.score = 0;
    this.randomizer = seedRandom(playId);
    this.snakeTiles = this.level.snakeTiles.slice();
    this.direction = DIRECTIONS.DOWN;
  }

  public setDirection(newDirection: Pos) {
    // Don't allow direction reversal
    if (this.direction === DIRECTIONS.DOWN && newDirection === DIRECTIONS.UP) return;
    if (this.direction === DIRECTIONS.UP && newDirection === DIRECTIONS.DOWN) return;
    if (this.direction === DIRECTIONS.LEFT && newDirection === DIRECTIONS.RIGHT) return;
    if (this.direction === DIRECTIONS.RIGHT && newDirection === DIRECTIONS.LEFT) return;
    this.direction = newDirection;
  }

  public tick(): boolean | Pos[] {
    // First add a new block at the head of the snake
    const oldHead = this.snakeTiles[this.snakeTiles.length - 1];
    const newHeadPos = { x: oldHead.x + this.direction.x, y: oldHead.y + this.direction.y };
    this.snakeTiles.push(newHeadPos);
    // Check if we ran into a wall
    if (this.isWallCollisionAt(newHeadPos) || isOutOfBounds(newHeadPos) || this.isTailCollision()) {
      return false;
    }
    // If we cannot remove a candy at the snake tail end, then chop off it's tail (otherwise leave it, letting the snake extend)
    if (!this.removeCandyAt(this.snakeTiles[0])) {
      this.snakeTiles.splice(0, 1);
    }
    // Check for candy collisions at head
    if (this.indexOfCandyAt(newHeadPos) !== -1) {
      this.score += 1;
      const candyPlaced: Pos[] = this.placeCandy();
      return candyPlaced;
    }
    // We didn't run into a wall, so all is good
    return true;
  }

  public enableCheats(): void {
    this.placeCandy(250);
    // TODO: Announce cheats were enabled
  }

  public getScore() {
    return this.score;
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
