'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import { saveMap } from '@/actions/actions';
import { CANVAS_HEIGHT, CANVAS_WIDTH } from '@/game/constants';

import { useShowAlert } from '../AlertProvider/AlertProvider';
import { theme } from '../Play/Play';
import styles from './styles.module.css';

const tools = ['Draw Wall', 'Place Snake', 'Erase Wall'] as const;
type Tool = (typeof tools)[number];

interface Pos {
  x: number;
  y: number;
}

const normalizedCursorPosFromEvent = (
  e: React.MouseEvent<HTMLCanvasElement, MouseEvent>,
  canvas: HTMLElement,
): Pos => ({
  x: Math.floor(((e.nativeEvent.offsetX / canvas.clientWidth) * CANVAS_WIDTH) / 10) * 10,
  y: Math.floor(((e.nativeEvent.offsetY / canvas.clientHeight) * CANVAS_HEIGHT) / 10) * 10,
});

const initialSnakePos: Pos[] = [
  { x: 630, y: 320 },
  { x: 630, y: 330 },
];

let gridCanvas: HTMLCanvasElement | null = null;
if (typeof window !== 'undefined') {
  gridCanvas = document.createElement('canvas');

  // grid canvas
  gridCanvas.width = CANVAS_WIDTH;
  gridCanvas.height = CANVAS_HEIGHT;
  const gridContext = gridCanvas.getContext('2d') as CanvasRenderingContext2D;
  for (let x = 10; x < CANVAS_WIDTH; x += 10) {
    gridContext.beginPath();
    gridContext.strokeStyle = '#FFF';
    gridContext.setLineDash([0.25, 0.25]);
    gridContext.moveTo(x, 0);
    gridContext.lineTo(x, CANVAS_HEIGHT);
    gridContext.stroke();
  }
  for (let y = 10; y < CANVAS_HEIGHT; y += 10) {
    gridContext.beginPath();
    gridContext.strokeStyle = '#FFF';
    gridContext.setLineDash([0.25, 0.25]);
    gridContext.moveTo(0, y);
    gridContext.lineTo(CANVAS_WIDTH, y);
    gridContext.stroke();
  }
}

export function Edit() {
  const [levelName, setLevelName] = useState('');
  const [activeTool, setActiveTool] = useState<Tool>('Draw Wall');
  const [wallTiles, setWallTiles] = useState<Pos[]>([]);
  const [snakeTiles, setSnakeTiles] = useState<Pos[][]>([[...initialSnakePos]]);
  const [curSnakeIndex, setCurSnakeIndex] = useState(0);
  const showAlert = useShowAlert();

  const [canvas, setCanvas] = useState<HTMLCanvasElement | null>(null);
  const wallCanvasRef = useRef<HTMLCanvasElement>();
  const sessionIdRef = useRef(Math.floor(Math.random() * Number.MAX_SAFE_INTEGER).toString(32));
  const mouseButtonDownRef = useRef(false);
  const context = canvas?.getContext('2d') as CanvasRenderingContext2D;
  const numSnakes = snakeTiles.length;

  useEffect(() => {
    wallCanvasRef.current = document.createElement('canvas');
    wallCanvasRef.current.width = CANVAS_WIDTH;
    wallCanvasRef.current.height = CANVAS_HEIGHT;
  }, []);

  useEffect(() => {
    if (!canvas) return;
    canvas.width = CANVAS_WIDTH;
    canvas.height = CANVAS_HEIGHT;
  }, [canvas]);

  // mounted
  useEffect(() => {
    const mouseUpHandler = () => {
      mouseButtonDownRef.current = false;
    };
    document.addEventListener('mouseup', mouseUpHandler);

    if (sessionStorage.sessionID) {
      sessionIdRef.current = sessionStorage.sessionId;
    } else {
      sessionStorage.sessionId = sessionIdRef.current;
    }

    return () => document.removeEventListener('mouseup', mouseUpHandler);
  }, []);

  useEffect(() => {
    if (curSnakeIndex < 0) {
      setCurSnakeIndex(0);
      return;
    }
    if (curSnakeIndex >= numSnakes) {
      const newSnake = [...initialSnakePos];
      // Add a snake.
      setSnakeTiles((old) => [...old, newSnake]);
      // Remove walls in places where the new Snake is being placed.
      setWallTiles((old) =>
        old.filter(
          (wallPos) =>
            !newSnake.some((snakeDot) => snakeDot.x === wallPos.x && snakeDot.y === wallPos.y),
        ),
      );
    }
  }, [curSnakeIndex, numSnakes]);

  const drawWallTile = useCallback(
    (x: number, y: number) => {
      const wallCtx = wallCanvasRef.current?.getContext('2d');
      if (!wallCtx) return;
      wallCtx.beginPath();
      wallCtx.fillStyle = theme.wallColor;
      wallCtx.rect(x, y, 10, 10);
      wallCtx.fill();
    },
    [wallCanvasRef],
  );

  const eraseWallTile = useCallback(
    (x: number, y: number) => {
      const wallCtx = wallCanvasRef.current?.getContext('2d');
      if (!wallCtx) return;
      wallCtx.clearRect(x, y, 10, 10);
    },
    [wallCanvasRef],
  );

  const renderSnake = useCallback(() => {
    snakeTiles.forEach((snake, snakeIndex) => {
      snake.forEach(({ x, y }) => {
        context.beginPath();
        context.fillStyle = theme.snakeColor[snakeIndex % theme.snakeColor.length];
        context.rect(x, y, 10, 10);
        context.fill();
      });
    });
  }, [snakeTiles, context]);

  // RENDER FRAME
  useEffect(() => {
    let animationFrame = 0;
    function renderFrame() {
      if (!context) return;
      context.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      if (wallCanvasRef.current) context.drawImage(wallCanvasRef.current, 0, 0);
      if (gridCanvas) context.drawImage(gridCanvas, 0, 0);
      renderSnake();
      animationFrame = requestAnimationFrame(renderFrame);
    }
    renderFrame();

    return () => cancelAnimationFrame(animationFrame);
  }, [context, wallCanvasRef, renderSnake]);

  const addWallTile = useCallback(
    (pos: Pos) => {
      if (wallTiles.some(({ x, y }) => x === pos.x && y === pos.y)) return;
      if (snakeTiles.some((snake) => snake.some(({ x, y }) => x === pos.x && y === pos.y))) return;
      setWallTiles((old) => [...old, pos]);
      drawWallTile(pos.x, pos.y);
    },
    [wallTiles, snakeTiles, drawWallTile],
  );

  const placeSnake = useCallback(
    (pos: Pos, snakeIndex?: number) => {
      const index = snakeIndex ?? curSnakeIndex;
      const newSnake = [{ ...pos }, { x: pos.x, y: pos.y + 10 }];
      setSnakeTiles((old) => old.map((item, itemIndex) => (itemIndex === index ? newSnake : item)));
      if (newSnake.some((dot) => wallTiles.some((tile) => dot.x === tile.x && dot.y === tile.y))) {
        setWallTiles((old) =>
          old.filter((tile) => !newSnake.some((dot) => dot.x === tile.x && dot.y === tile.y)),
        );
      }
    },
    [wallTiles, curSnakeIndex],
  );

  const removeWall = useCallback(
    (pos: Pos) => {
      const remove = wallTiles.find((tile) => tile.x === pos.x && tile.y === pos.y);
      if (remove) {
        setWallTiles((old) => old.filter((tile) => tile !== remove));
        eraseWallTile(pos.x, pos.y);
      }
    },
    [wallTiles, eraseWallTile],
  );

  const onCursorDown = useCallback(
    (event: React.MouseEvent<HTMLCanvasElement, MouseEvent>): void => {
      if (!canvas) return;
      const pos = normalizedCursorPosFromEvent(event, canvas);
      if (activeTool === 'Draw Wall') {
        addWallTile(pos);
      } else if (activeTool === 'Place Snake') {
        placeSnake(pos);
      } else if (activeTool === 'Erase Wall') {
        removeWall(pos);
      }
    },
    [canvas, activeTool, placeSnake, addWallTile, removeWall],
  );

  const mouseMoveHandler = useCallback(
    (event: React.MouseEvent<HTMLCanvasElement, MouseEvent>): void => {
      event.preventDefault();
      if (mouseButtonDownRef.current) onCursorDown(event);
    },
    [onCursorDown, mouseButtonDownRef],
  );

  const mouseDownHandler = useCallback(
    (event: React.MouseEvent<HTMLCanvasElement, MouseEvent>): void => {
      event.preventDefault();
      mouseButtonDownRef.current = true;
      onCursorDown(event);
    },
    [onCursorDown, mouseButtonDownRef],
  );

  const save = useCallback(async () => {
    const name = levelName.trim();
    if (!name) return showAlert('You havent named your level');
    if (!wallTiles?.length) return showAlert('You have to place some walls first!');
    const result = await saveMap({
      levelName: name,
      sessionId: sessionIdRef.current,
      wallTiles,
      snakeTiles,
    });
    if (result.success) {
      return showAlert('Level was saved');
    }
    return showAlert('Error saving level');
  }, [levelName, wallTiles, sessionIdRef, snakeTiles, showAlert]);

  const reset = useCallback(() => {
    setLevelName('');
    setActiveTool('Draw Wall');
    setSnakeTiles([[...initialSnakePos]]);
    setWallTiles([]);
    setCurSnakeIndex(0);
    (wallCanvasRef.current?.getContext('2d') as CanvasRenderingContext2D)?.clearRect(
      0,
      0,
      CANVAS_WIDTH,
      CANVAS_HEIGHT,
    );
  }, []);

  return (
    <main className={styles.edit}>
      <div className={styles.menu}>
        <div className={styles.metaInfo}>
          <input
            type="text"
            value={levelName}
            onInput={(e) => setLevelName((e.target as HTMLInputElement).value)}
            placeholder="level name"
          />
          <button type="button" onClick={save}>
            Save
          </button>
        </div>
        <div className={styles.tools}>
          {tools.map((tool) => (
            <button
              type="button"
              className={tool === activeTool ? styles.active : ''}
              key={tool}
              onClick={() => setActiveTool(tool)}
            >
              {tool}
            </button>
          ))}
          <button type="button" onClick={reset}>
            Reset Level
          </button>
        </div>
        {activeTool === 'Place Snake' && (
          <div className={styles.snakePicker}>
            Snake:
            {new Array(3)
              .fill(0)
              .map((_, n) => n)
              .map((n) => (
                <button
                  type="button"
                  className={`${styles.snakePick} ${curSnakeIndex === n ? styles.active : ''}`}
                  key={n}
                  disabled={n > snakeTiles.length}
                  onClick={() => setCurSnakeIndex(n)}
                >
                  {n + 1}
                </button>
              ))}
          </div>
        )}
      </div>
      <canvas
        ref={setCanvas}
        className={styles.canvas}
        width="1280"
        height="640"
        onMouseMove={mouseMoveHandler}
        onMouseDown={mouseDownHandler}
      />
    </main>
  );
}
