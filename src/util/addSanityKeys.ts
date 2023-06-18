import { nanoid } from 'nanoid';

export function addSanityKeys<T extends object>(items: T[]) {
  return items.map((item) => ({
    _key: nanoid(16),
    ...item,
  }));
}
