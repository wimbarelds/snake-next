import { Level } from "@/game/SnakeGame";
import { GameState } from "../Play/Play";
import { useMemo } from "react";
import styles from './styles.module.css';

export type Player = string | null;

interface Props {
  levelName: string;
  level?: Level;
  numPlayers: number;
  onSetLevelName: (levelName: string) => void;
  onSetGameState: (state: GameState) => void;
  onSetNumPlayers: (num: number) => void;
}

export function Menu({levelName, level, numPlayers, onSetLevelName, onSetGameState, onSetNumPlayers}: Props) {
  const levelLoaded = !!level;
  const levelNameLoading = levelLoaded ? levelName : 'Loading';
  const maxNumPlayers = level ? level.snakeTiles.length : 0;
  const players = useMemo(() => {
    return Array(3).fill('').map((v, i) => i + 1);
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
                  <span className="label">{ player }</span>
                </button>
              ))}
            </div>
          </div>
          <button type="button" className={styles.button} onClick={() => onSetGameState('play')} disabled={!levelLoaded}>
            Start game
            <span className={styles.smallText}>{levelNameLoading}</span>
          </button>
          {/* <button type="button" className={styles.button} onClick={() => onSetGameState('manage-controls')} disabled={!levelLoaded}>Keybindings</button> */}
          <button type="button" className={styles.button} onClick={() => onSetGameState('manage-bots')} disabled={!levelLoaded}>Manage bots</button>
          <button type="button" className={styles.button} onClick={() => onSetGameState('choose-level')} disabled={!levelLoaded}>Choose level</button>
          <button type="button" className={styles.button} onClick={() => onSetGameState('highscores')} disabled={!levelLoaded}>Show highscores</button>
        </div>
      </div>
    </div>
  )
}