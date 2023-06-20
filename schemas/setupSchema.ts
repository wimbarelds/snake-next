import { defineField, defineType } from 'sanity';

export const setupSchema = defineType({
  type: 'document',
  name: 'setup',
  title: 'Setup',
  fields: [
    defineField({
      type: 'string',
      name: 'status',
      title: 'Status',
    }),
    defineField({
      type: 'reference',
      name: 'defaultLevel',
      title: 'Default Level',
      to: [{ type: 'level' }],
    }),
  ],
});
