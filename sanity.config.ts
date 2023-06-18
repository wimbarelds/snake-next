import {defineConfig} from 'sanity'
import {deskTool} from 'sanity/desk'
import {visionTool} from '@sanity/vision'
import { highscoreSchema } from './schemas/highscoresSchema'
import { levelSchema, tileSchema } from './schemas/levelSchema'
import { setupSchema } from './schemas/setupSchema'

export default defineConfig({
  name: 'default',
  title: 'snake-backend',

  projectId: 'qnpq4yts',
  dataset: 'production',

  plugins: [deskTool(), visionTool()],

  schema: {
    types: [
      highscoreSchema,
      levelSchema,
      tileSchema,
      setupSchema,
    ],
  },
})
