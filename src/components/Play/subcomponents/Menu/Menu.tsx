import { Level } from '@/game/SnakeGame';
import { useMemo } from 'react';
import styles from './styles.module.css';
import { GameState } from '../../Play';

export type Player = string | null;

interface Props {
  level: Level;
  numPlayers: number;
  onSetGameState: (state: GameState) => void;
  onSetNumPlayers: (num: number) => void;
}

export function Menu({
  level,
  numPlayers,
  onSetGameState,
  onSetNumPlayers,
}: Props) {
  const maxNumPlayers = level.snakeTiles.length;
  const players = useMemo(() => {
    return Array(3)
      .fill('')
      .map((v, i) => i + 1);
  }, []);

  return (
    <div className={styles.backdrop}>
      <div className={styles.menu}>
        <h2>Game Menu</h2>
        <div className={styles.menuItems}>
          <div className={styles.numPlayers}>
            <p>Num players</p>
            <div className={styles.numPlayersButtons}>
              {players.map((player, index) => (
                <button
                  type="button"
                  key={player}
                  className={`${player === numPlayers ? styles.active : ''} ${styles.button}`}
                  disabled={index >= maxNumPlayers}
                  onClick={() => onSetNumPlayers(player)}
                >
                  <span className="label">{player}</span>
                </button>
              ))}
            </div>
          </div>
          <button
            type="button"
            className={styles.button}
            onClick={() => onSetGameState('play')}
          >
            Start game
            <span className={styles.smallText}>{level.levelName}</span>
          </button>
          {/* <button type="button" className={styles.button} onClick={() => onSetGameState('manage-controls')} disabled={!levelLoaded}>Keybindings</button> */}
          <button
            type="button"
            className={styles.button}
            onClick={() => onSetGameState('manage-bots')}
          >
            Manage bots
          </button>
          <button
            type="button"
            className={styles.button}
            onClick={() => onSetGameState('choose-level')}
          >
            Choose level
          </button>
          <button
            type="button"
            className={styles.button}
            onClick={() => onSetGameState('highscores')}
          >
            Show highscores
          </button>
        </div>
      </div>
    </div>
  );
}
