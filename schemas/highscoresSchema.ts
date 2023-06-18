import { defineField, defineType } from 'sanity';

export const highscoreSchema = defineType({
  type: 'document',
  name: 'highscore',
  title: 'Highscore',
  fields: [
    defineField({
      type: 'reference',
      name: 'level',
      title: 'Level',
      to: [{ type: 'level' }],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      type: 'string',
      name: 'playerName',
      title: 'Player Name',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      type: 'number',
      name: 'score',
      title: 'Score',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      type: 'string',
      name: 'playId',
      title: 'playId',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      type: 'object',
      name: 'inputHistory',
      title: 'Input History',
      validation: (Rule) => Rule.required(),
      fields: [
        defineField({
          name: 'UP',
          type: 'array',
          of: [{ type: 'number' }],
          validation: (Rule) => Rule.required(),
        }),
        defineField({
          name: 'DOWN',
          type: 'array',
          of: [{ type: 'number' }],
          validation: (Rule) => Rule.required(),
        }),
        defineField({
          name: 'LEFT',
          type: 'array',
          of: [{ type: 'number' }],
          validation: (Rule) => Rule.required(),
        }),
        defineField({
          name: 'RIGHT',
          type: 'array',
          of: [{ type: 'number' }],
          validation: (Rule) => Rule.required(),
        }),
      ],
    }),
  ],
});
