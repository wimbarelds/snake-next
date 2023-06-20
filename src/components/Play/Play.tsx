'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Highscores } from './subcomponents/Highscores/Highscores';
import { Level, SnakeAgentController, SnakeGame } from '@/game/SnakeGame';
import { SnakeRenderer, Theme } from '@/game/SnakeRenderer';
import { InputHistory, SnakePlayer } from '@/game/SnakePlayer';
import { getPlayId } from '@/actions/actions';
import { keyBindings } from '@/game/SnakeKeyBindings';
import { LevelPicker } from './subcomponents/LevelPicker/LevelPicker';
import { BotLoader } from './subcomponents/BotLoader/BotLoader';
import { Scores } from './subcomponents/Scores/Scores';
import { Menu } from './subcomponents/Menu/Menu';
import { SnakeRecording } from '@/game/SnakeRecording';
import { SnakeBot } from '@/game/SnakeBot';
import { useShowAlert } from '../AlertProvider/AlertProvider';

interface GamePlayerState {
  playId: string;
  game: SnakeGame;
  renderer: SnakeRenderer;
  players: SnakeAgentController[];
}

export interface GamePlayerResult {
  sessionId: string;
  playId: string;
  score: number;
  inputHistory: InputHistory;
}

export const theme: Theme = {
  wallColor: '#fd5819',
  snakeColor: [
    'hsl(190, 89%, 49%)',
    'hsl(220, 89%, 49%)',
    'hsl(250, 89%, 49%)',
    'hsl(160, 89%, 49%)',
  ],
  floorColor: '#FFF',
  candyColor: '#3F3',
};

export type GameState =
  | 'menu'
  | 'play'
  | 'replay'
  | 'highscores'
  | 'choose-level'
  | 'play-bot'
  | 'manage-controls'
  | 'manage-bots';

export function Play({level, levelNames}: {level: Level, levelNames: string[]}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameState, setGameState] = useState<GameState>('menu');
  const [scores, setScores] = useState([0]);
  const [numPlayers, __setNumPlayers] = useState(1);
  const [playerResult, setPlayerResult] = useState<GamePlayerResult | null>(null);
  const sessionIdRef = useRef(Math.floor(Math.random() * Number.MAX_SAFE_INTEGER).toString(32));
  const showAlert = useShowAlert();

  // Created/Mounted
  useEffect(() => {
    if (sessionStorage.sessionId || localStorage.sessionId) {
      sessionIdRef.current = sessionStorage.sessionId || localStorage.sessionId;
    } else {
      localStorage.sessionId = sessionIdRef.current;
    }
  }, [sessionIdRef]);

  const maxNumPlayers = level ? level.snakeTiles.length : 0;
  const showBotLoader = gameState === 'manage-bots';
  const showLevelPicker = gameState === 'choose-level';
  const showScores = gameState === 'play' || gameState === 'replay' || gameState === 'play-bot';
  const showHighscores = gameState === 'highscores';
  const showMenu = gameState === 'menu';

  const setNumPlayers = useCallback(
    (num: number) => {
      if (num > maxNumPlayers) {
        showAlert(`This map only supports ${maxNumPlayers} players`);
        __setNumPlayers(maxNumPlayers);
        return;
      } else if (num < 1) {
        showAlert('Stop being such a jerk', 'Jerk Alert');
        return;
      } else {
        __setNumPlayers(num);
      }
    },
    [maxNumPlayers],
  );

  useEffect(() => level && setNumPlayers(numPlayers));

  const startReplay = useCallback(
    async ({ playId, inputHistory }: { playId: string; inputHistory: InputHistory }) => {
      const canvas = canvasRef.current;
      const context = canvas?.getContext('2d');
      // TODO: Proper alert
      if (!context) {
        showAlert('Cant play when level and canvas arent loaded');
        return;
      }

      const game = new SnakeGame(playId, level, 1);
      game.addScoreListener(setScore);

      const renderer = new SnakeRenderer(game, theme, context);
      const recording = new SnakeRecording(game, inputHistory);
      setGameState('replay');
      await recording.over;
      renderer.destroy();
      setTimeout(() => setGameState('highscores'), 500);
    },
    [canvasRef, level, theme],
  );

  const setScore = useCallback(({ playerIndex, score }: { playerIndex: number; score: number }) => {
    setScores((prevScores) =>
      prevScores.map((value, valueIndex) => (valueIndex === playerIndex ? score : value)),
    );
  }, []);

  const playersGameoverHandler = useCallback(
    (state: GamePlayerState) => {
      state.players.forEach((player) => player.destroy());
      state.renderer.destroy();

      if (numPlayers === 1) {
        setPlayerResult({
          playId: state.playId,
          sessionId: sessionIdRef.current,
          score: state.game.getScores()[0],
          inputHistory: (state.players[0] as SnakePlayer).inputHistory,
        });
      } else {
        setPlayerResult(null);
      }
      setGameState('highscores');
    },
    [numPlayers, sessionIdRef],
  );

  const play = useCallback(async () => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d');
    // TODO: Proper alert
    if (!context) {
      showAlert('Cant play when canvas not ready');
      return;
    }

    setPlayerResult(null);
    setScores(new Array(numPlayers).fill(0));

    // TODO: Make this server function
    const playId = await getPlayId(sessionIdRef.current);
    const game = new SnakeGame(playId, level, numPlayers);
    game.addScoreListener(setScore);

    const renderer = new SnakeRenderer(game, theme, context);
    const players = game.assignAgentControllers(
      (agent, index) => new SnakePlayer(agent, keyBindings[index]),
    );
    game.gameover.then(() => playersGameoverHandler({ playId, game, renderer, players }));
  }, [canvasRef, level, numPlayers, sessionIdRef]);

  const closeHighscores = useCallback(() => {
    setGameState('menu');
    setPlayerResult(null);
  }, []);

  const closeBotLoader = useCallback(() => {
    setGameState('menu');
  }, []);

  const botGameoverHandler = useCallback((state: GamePlayerState) => {
    state.players.forEach((player) => player.destroy());
    state.renderer.destroy();
    setGameState('menu');
  }, []);

  const playBot = useCallback(
    async (bots: Worker[]): Promise<void> => {
      const canvas = canvasRef.current;
      const context = canvas?.getContext('2d');
      // TODO: Proper alert
      if (!context) {
        showAlert('Cant play when level and canvas isnt ready');
        return;
      }

      setGameState('play-bot');
      setPlayerResult(null);
      const playId = await getPlayId(sessionIdRef.current);

      const game = new SnakeGame(playId, level, bots.length);
      game.addScoreListener(setScore);

      const renderer = new SnakeRenderer(game, theme, context);
      const botPlayers = bots.map((bot, botIndex) => new SnakeBot(game, level, bot, botIndex));

      game.gameover.then(() => botGameoverHandler({ playId, game, renderer, players: botPlayers }));
    },
    [level, canvasRef, sessionIdRef, botGameoverHandler],
  );

  useEffect(() => {
    if (gameState === 'play') {
      play();
    }
  }, [gameState]);

  return (
    <div className="play">
      {showScores && <Scores scores={scores} />}
      {showMenu && (
        <Menu
          level={level}
          numPlayers={numPlayers}
          onSetGameState={setGameState}
          onSetNumPlayers={setNumPlayers}
        />
      )}
      {showHighscores && (
        <Highscores
          levelName={level.levelName}
          playerResult={playerResult}
          onClose={closeHighscores}
          onStartReplay={startReplay}
        />
      )}
      {showLevelPicker && <LevelPicker levels={levelNames} />}
      {showBotLoader && (
        <BotLoader numPlayers={numPlayers} onClose={() => closeBotLoader()} onPlayBot={playBot} />
      )}
      <canvas width="1280" height="640" ref={canvasRef} />
    </div>
  );
}
