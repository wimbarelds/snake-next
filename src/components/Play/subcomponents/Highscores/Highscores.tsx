import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useState } from 'react';

import { getHighscores, submitHighscore } from '@/actions/actions';
import { useShowAlert } from '@/components/AlertProvider/AlertProvider';
import type { Highscore, InputHistory } from '@/game/SnakePlayer';

import type { GamePlayerResult } from '../../Play';
import styles from './styles.module.css';

interface Props {
  levelName: string;
  playerResult: GamePlayerResult | null;
  onClose: () => void;
  onStartReplay: (props: { playId: string; inputHistory: InputHistory }) => void;
}

export function Highscores({ levelName, playerResult, onClose, onStartReplay }: Props) {
  const { data: highscores } = useQuery<Highscore[]>({
    queryKey: ['highscores', levelName],
    queryFn: () => getHighscores(levelName),
  });
  const [playerName, setPlayername] = useState('');
  const [scoreSubmitted, setScoreSubmitted] = useState(false);
  const showAlert = useShowAlert();
  const playerScore = playerResult?.score ?? 0;
  const playerHasHighscore =
    highscores && playerScore && highscores.some((highscore) => highscore.score < playerScore);

  const queryClient = useQueryClient();
  const mutateHighscores = useMutation({
    mutationFn: submitHighscore,
    onError: (err: string) => {
      showAlert(err);
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
    [playerName, playerResult, levelName, mutateHighscores],
  );

  return (
    <div className="overlay__container">
      <div className="overlay__backdrop" />
      <div className="overlay__content modal">
        <div className="modal__title">
          <h2>Highscores</h2>
          <button className="modal__close" onClick={onClose} type="button">
            &times;
          </button>
        </div>
        <div className="modal__body">
          {highscores ? (
            <ul className={styles.highscores}>
              {highscores?.map((highscore) => (
                // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-noninteractive-element-interactions
                <li
                  className={styles.highscore}
                  key={highscore.playId}
                  onClick={() =>
                    onStartReplay({
                      playId: highscore.playId,
                      inputHistory: highscore.inputHistory,
                    })
                  }
                >
                  <button className={styles.highscoreReplay} title="Watch replay" type="button">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="/Replay_1.png" alt="" className={styles.rewind} />
                    {/* eslint-disable-next-line @next/next/no-img-element */}
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
                      <button type="button" onClick={submitScore}>
                        Submit
                      </button>
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
