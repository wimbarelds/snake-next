import { KeyMap } from './SnakePlayer';
import { Direction } from './SnakeGame';

export const keyBindings: KeyMap[] =
  typeof window === 'object' && window?.localStorage?.keyBindings
    ? JSON.parse(localStorage.keyBindings)
    : [
        {
          UP: 38,
          DOWN: 40,
          LEFT: 37,
          RIGHT: 39,
        },
        {
          UP: 87,
          DOWN: 83,
          LEFT: 65,
          RIGHT: 68,
        },
        {
          UP: 104,
          DOWN: 98,
          LEFT: 100,
          RIGHT: 102,
        },
      ];

export function isKeyAvailable(keyCode: number) {
  return !keyBindings.some((keyMap: KeyMap) =>
    Object.values(keyMap).some((code) => code === keyCode),
  );
}

export function saveBindings(keyMap: KeyMap, playerIndex: number) {
  if (playerIndex < 0) throw new Error('Stop trying to be a jerk. Jerk!');

  const keyCodesInUse: number[] = Object.values(keyMap).filter(
    (keyCode) => !isKeyAvailable(keyCode),
  );
  const unavailableKeyNames: Direction[] = (Object.keys(keyMap) as Direction[]).filter(
    (keyName) => !keyCodesInUse.some((keyCode) => keyMap[keyName] === keyCode),
  );
  if (unavailableKeyNames.length > 0)
    throw new Error(
      'Some of the chosen keycodes are unavailable: ' + unavailableKeyNames.join(', '),
    );

  if (playerIndex >= keyBindings.length) keyBindings.push(keyMap);
  else keyBindings[playerIndex] = keyMap;

  localStorage.keyBindings = JSON.stringify(keyBindings);
}
