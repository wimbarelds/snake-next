import { CANVAS_HEIGHT, CANVAS_WIDTH } from './constants';
import type { SnakeAgent } from './SnakeAgent';
import type { SnakeGame } from './SnakeGame';
import type { Pos } from './types';

export interface Theme {
  wallColor: string;
  snakeColor: string[];
  floorColor: string;
  candyColor: string;
}

function createCanvas() {
  const canvas = document.createElement('canvas');
  canvas.width = CANVAS_WIDTH;
  canvas.height = CANVAS_HEIGHT;
  return canvas;
}

function drawStaticCanvas(tiles: Pos[], color: string) {
  const canvas = createCanvas();
  const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
  ctx.beginPath();
  ctx.fillStyle = color;
  for (const tile of tiles) {
    ctx.rect(tile.x, tile.y, 10, 10);
  }
  ctx.fill();
  return canvas;
}

export class SnakeRenderer {
  private game: SnakeGame;
  private theme: Theme;
  private ctx: CanvasRenderingContext2D;
  private wallCanvas: HTMLCanvasElement;
  private floorCanvas!: HTMLCanvasElement;
  private animationFrame = 0;

  constructor(game: SnakeGame, theme: Theme, context: CanvasRenderingContext2D) {
    this.game = game;
    this.theme = theme;
    this.ctx = context;

    this.wallCanvas = drawStaticCanvas(game.getWallTiles(), theme.wallColor);
    this.floorCanvas = drawStaticCanvas(game.getFloorTiles(), theme.floorColor);

    this.draw();
  }

  public draw() {
    // Clear the screen
    this.ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    // Draw Floor
    this.ctx.drawImage(this.floorCanvas, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    // Draw Walls
    this.ctx.drawImage(this.wallCanvas, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    // Draw Candy
    this.drawTilesOnContext(this.game.getCandyTiles(), this.theme.candyColor);
    // Draw Snake
    this.game.snakeAgents.forEach((agent: SnakeAgent, agentIndex: number) => {
      this.drawTilesOnContext(agent.getTiles(), this.theme.snakeColor[agentIndex]);
    });
    // Draw the next frame when we're ready
    this.animationFrame = requestAnimationFrame(this.draw.bind(this));
  }

  public destroy() {
    this.draw();
    cancelAnimationFrame(this.animationFrame);
  }

  private drawTilesOnContext(tiles: Pos[], color: string) {
    this.ctx.beginPath();
    for (const tile of tiles) {
      this.ctx.rect(tile.x, tile.y, 10, 10);
    }
    this.ctx.fillStyle = color;
    this.ctx.fill();
  }
}
