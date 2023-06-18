import { NextResponse } from 'next/server';
import { createClient } from '@sanity/client';
import { readFileSync, readdirSync, existsSync } from 'fs';
import { resolve } from 'path';
import { nanoid } from 'nanoid';
import { addSanityKeys } from '@/util/addSanityKeys';
import { Level } from '@/game/SnakeGame';
import { Highscore } from '@/game/SnakePlayer';

const projectId = process.env.SANITY_PROJECT_ID;
const dataset = process.env.SANITY_DATASET;
if (!projectId) throw new Error('No Sanity projectId found in process.env');
if (!dataset) throw new Error('No Sanity dataset found in process.env');

const client = createClient({
  projectId,
  dataset,
  apiVersion: '2021-03-23',
  useCdn: true,
  token: process.env.SANITY_EDITOR_TOKEN,
});

export async function GET(request: Request) {
  const state = await client.fetch(`*[_type == "setup"][0].status`);
  if (!state) {
    await client.createIfNotExists({
      _id: 'setup',
      _type: 'setup',
      status: 'initialized',
    });

    const root = resolve('.', 'public', 'levels');
    const levels = readdirSync(root);
    for (const level of levels) {
      const path = resolve(root, level);
      const { sessionId, ...map } = JSON.parse(
        readFileSync(resolve(path, 'map.json'), { encoding: 'utf-8' }),
      ) as Level & { sessionId: null };
      const levelId = `level_${level}`;
      await client.createOrReplace({
        _type: 'level',
        _id: levelId,
        ...map,
        wallTiles: addSanityKeys(map.wallTiles),
        snakeTiles: addSanityKeys(map.snakeTiles).map((snake) => ({
          _key: nanoid(16),
          _type: 'object',
          tiles: snake.map((tile) => ({
            ...tile,
            _key: nanoid(16),
          })),
        })),
      });
      if (!existsSync(resolve(path, 'highscores.json'))) continue;
      const highscores = JSON.parse(
        readFileSync(resolve(path, 'highscores.json'), { encoding: 'utf-8' }),
      ) as Highscore[];
      for (const highscore of highscores) {
        await client.create({
          _type: 'highscore',
          level: {
            _type: 'reference',
            _ref: levelId,
          },
          ...highscore,
        });
      }
    }
  }
  return NextResponse.json({ state });
}
