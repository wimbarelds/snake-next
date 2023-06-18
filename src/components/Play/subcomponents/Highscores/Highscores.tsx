import { Highscore, InputHistory } from '@/game/SnakePlayer';
import { GamePlayerResult } from '../../Play';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getHighscores, submitHighscore } from '@/actions/actions';
import { useCallback, useState } from 'react';
import styles from './styles.module.css';

interface Props {
  levelName: string;
  playerResult: GamePlayerResult | null;
  onClose: () => void;
  onStartReplay: (props: { playId: string; inputHistory: InputHistory }) => void;
}

export function Highscores({ levelName, playerResult, onClose, onStartReplay }: Props) {
  const {
    isLoading: highscoresLoading,
    error: highscoresError,
    data: highscores,
  } = useQuery<Highscore[]>({
    queryKey: ['highscores', levelName],
    queryFn: () => getHighscores(levelName),
  });
  const [playerName, setPlayername] = useState('');
  const [scoreSubmitted, setScoreSubmitted] = useState(false);
  const playerScore = playerResult?.score ?? 0;
  const playerHasHighscore =
    highscores && playerScore && highscores.some((highscore) => highscore.score < playerScore);

  const queryClient = useQueryClient();
  const mutateHighscores = useMutation({
    mutationFn: submitHighscore,
    onError: (err: string) => {
      alert(err);
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['highscores', levelName], data);
      setScoreSubmitted(true);
      setPlayername('');
    },
  });

  const canSubmitScore =
    !scoreSubmitted && playerHasHighscore && playerName && !mutateHighscores.isLoading;

  const submitScore = useCallback(
    () => playerResult && mutateHighscores.mutate({ playerName, playerResult, levelName }),
    [playerName, playerResult, levelName],
  );

  return (
    <div className="overlay__container">
      <div className="overlay__backdrop"></div>
      <div className="overlay__content modal">
        <div className="modal__title">
          <h2>Highscores</h2>
          <button className="modal__close" onClick={onClose}>
            &times;
          </button>
        </div>
        <div className="modal__body">
          {highscores ? (
            <ul className={styles.highscores}>
              {highscores?.map((highscore, index) => (
                <li
                  className={styles.highscore}
                  key={index}
                  onClick={() =>
                    onStartReplay({
                      playId: highscore.playId,
                      inputHistory: highscore.inputHistory,
                    })
                  }
                >
                  <button className={styles.highscoreReplay} title="Watch replay" type="button">
                    <img src="/Replay_1.png" alt="" className={styles.rewind} />
                    <img src="/Replay_2.png" alt="" className={styles.arrow} />
                  </button>
                  <span className={styles.highscoreName}>{highscore.playerName}</span>
                  <span className={styles.highscoreScore}>{highscore.score}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p>Loading highscores</p>
          )}
          {playerResult && (
            <div className={styles.playerresult}>
              <p className={styles.playerscore}>
                <span className={styles.label}>Your score:</span>
                <span className={styles.value}>{playerResult.score}</span>
              </p>
              {playerHasHighscore && (
                <div className={styles.submitHighscore}>
                  <h3>Thats a highscore!</h3>
                  {canSubmitScore && (
                    <div className={styles.submitHighscoreForm}>
                      <input
                        type="text"
                        value={playerName}
                        onInput={(e) => setPlayername((e.target as HTMLInputElement).value)}
                        placeholder="Enter your name"
                      />
                      <button onClick={submitScore}>Submit</button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
