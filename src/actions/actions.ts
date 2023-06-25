'use server';

import { createClient } from '@sanity/client';
import type { SanityDocument } from 'sanity';
import { z } from 'zod';

import type { GamePlayerResult } from '@/components/Play/Play';
import type { Level } from '@/game/SnakeGame';
import type { Highscore } from '@/game/SnakePlayer';
import { SnakeScoreCalculator } from '@/game/SnakeScoreCalculator';
import type { Pos } from '@/game/types';

const projectId = process.env.SANITY_PROJECT_ID;
const dataset = process.env.SANITY_DATASET;
if (!projectId) throw new Error('No Sanity projectId found in process.env');
if (!dataset) throw new Error('No Sanity dataset found in process.env');

export interface ServerResultError {
  success: false;
  message: string;
}

interface ServerResultSuccess<T> {
  success: true;
  data: T;
}

export type ServerResult<T> = ServerResultError | ServerResultSuccess<T>;

const client = createClient({
  projectId,
  dataset,
  apiVersion: '2021-03-23',
  useCdn: true,
});

interface PlaySession {
  playId: string;
  sessionId: string;
  timestamp: number;
}

const playSessions: PlaySession[] = [];

export async function levelExists(levelName: string): Promise<boolean> {
  const count = await client.fetch(`count(*[_type == "level" levelName == $levelName]{_id})`, {
    levelName,
  });
  return !!count;
}

export async function getDefaultLevelName(): Promise<string> {
  return client.fetch(`*[_id == "setup"][0]{defaultLevel->{levelName}}.defaultLevel.levelName`);
}

type SanityLevel = SanityDocument &
  Omit<Level, 'snakeTiles'> & { snakeTiles: Array<{ tiles: Pos[] }> };

export async function getLevel(levelName: string): Promise<SanityDocument & Level> {
  const sanityLevel = await client.fetch<SanityLevel>(
    `*[_type == "level" && levelName == $levelName][0]`,
    { levelName },
  );
  return {
    ...sanityLevel,
    snakeTiles: [...sanityLevel.snakeTiles.map((snake) => snake.tiles)],
  };
}

export async function getLevels(): Promise<string[]> {
  return client.fetch<string[]>(`*[_type == "level"].levelName`);
}

export async function getHighscores(levelName: string, limit = 10): Promise<Highscore[]> {
  const query = `
    *[_type == "highscore" && level->levelName == $levelName]{
      playerName,
      score,
      playId,
      inputHistory,
      _updatedAt
    } | order(score desc, _updatedAt asc)[0...$limit]
  `;
  return client.fetch(query, { levelName, limit });
}

const playerResultDef = z.object({
  sessionId: z.string(),
  playId: z.string(),
  score: z.number().int().min(1),
  inputHistory: z.object({
    UP: z.array(z.number()),
    DOWN: z.array(z.number()),
    LEFT: z.array(z.number()),
    RIGHT: z.array(z.number()),
  }),
});

export async function submitHighscore({
  levelName,
  playerName,
  playerResult,
}: {
  levelName: string;
  playerName: string;
  playerResult: GamePlayerResult;
}): Promise<Highscore[]> {
  const exists = await levelExists(levelName);
  if (!exists) return Promise.reject(new Error('Level does not exist'));
  if (!playerResultDef.safeParse(playerResult).success)
    return Promise.reject(new Error('Invalid playerResult provided'));
  if (
    !playSessions.some(
      (session) =>
        session.playId === playerResult.playId && session.sessionId === playerResult.sessionId,
    )
  ) {
    return Promise.reject(new Error('No match found for combination of playId and sessionId'));
  }

  const level = await getLevel(levelName);
  const score = SnakeScoreCalculator(playerResult.playId, level, playerResult.inputHistory);

  if (score !== playerResult.score) {
    return Promise.reject(new Error('Provided score did not pass validation-check'));
  }

  const highscores = await getHighscores(levelName);
  if (!highscores.some((highscore) => highscore.score < playerResult.score)) {
    return Promise.reject(new Error('Score is not a highscore'));
  }

  await client.create({
    _type: 'highscore',
    level: { _type: 'reference', _ref: level._id },
    playerName,
    score,
    playId: playerResult.playId,
    inputHistory: playerResult.inputHistory,
  });

  // TODO: This could be optimized
  return getHighscores(levelName);
}

export async function getPlayId(sessionId: string): Promise<string> {
  if (!sessionId) throw Error('No session ID provided');

  const playId = (Math.random() * Number.MAX_SAFE_INTEGER).toString(32);
  playSessions.push({
    playId,
    sessionId,
    timestamp: Date.now(),
  });
  // TODO: sanity add play id
  return playId;
}

export async function saveMap(_: {
  levelName: string;
  sessionId: string;
  wallTiles: Pos[];
  snakeTiles: Pos[][];
}) {
  if (Math.random() !== 5) throw new Error('Not yet implemented');
  return { success: true };
}
