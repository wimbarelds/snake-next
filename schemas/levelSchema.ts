import { defineArrayMember, defineField, defineType } from 'sanity';

export const tileSchema = defineType({
  type: 'object',
  name: 'tile',
  fields: [
    defineField({
      name: 'x',
      type: 'number',
      title: 'X',
    }),
    defineField({
      name: 'y',
      type: 'number',
      title: 'Y',
    }),
  ],
});

export const levelSchema = defineType({
  type: 'document',
  name: 'level',
  title: 'Level',
  fields: [
    defineField({
      type: 'string',
      name: 'levelName',
      title: 'Level Name',
      validation: (Rule) => Rule.required().min(2),
    }),
    defineField({
      type: 'array',
      name: 'snakeTiles',
      title: 'SnakeTiles',
      hidden: true,
      // TODO: components
      of: [
        defineArrayMember({
          type: 'object',
          fields: [
            defineField({
              type: 'array',
              name: 'tiles',
              of: [defineArrayMember({ type: 'tile' })],
            }),
          ],
        }),
      ],
    }),
    defineField({
      type: 'array',
      name: 'wallTiles',
      title: 'WallTiles',
      hidden: true,
      // TODO: components
      of: [defineArrayMember({ type: 'tile' })],
    }),
  ],
  preview: {
    select: {
      title: 'levelName',
    },
  },
});
