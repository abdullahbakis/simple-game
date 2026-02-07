import { useState, useCallback, useRef, useEffect } from 'react';
import GameCanvas from './components/GameCanvas';
import GameUI from './components/GameUI';
import StartMenu from './components/StartMenu';
import type { GameStats } from './components/GameCanvas';
import { updateProgress } from './game/progress';
import { playLevelComplete, playVictory, playGameOver, startMusic, stopMusic, resumeAudio } from './game/audio';
import { MAX_LEVEL } from './game/constants';

type GameState = 'menu' | 'playing' | 'levelComplete' | 'gameOver';

function App() {
  const [level, setLevel] = useState(1);
  const [gameState, setGameState] = useState<GameState>('menu');
  const [countdown, setCountdown] = useState(3);
  const [musicOn, setMusicOn] = useState(true);
  const [stats, setStats] = useState<GameStats>({
    score: 0,
    totalSpawned: 0,
    totalMissed: 0,
    stability: 1,
  });
  const resetKeyRef = useRef(0);
  const [, forceRender] = useState(0);
  const levelRef = useRef(level);

  useEffect(() => {
    levelRef.current = level;
  }, [level]);

  const handleStatsChange = useCallback((newStats: GameStats) => {
    setStats(newStats);
  }, []);

  const handleLevelComplete = useCallback(() => {
    setGameState('levelComplete');
    updateProgress(levelRef.current);
    if (levelRef.current >= MAX_LEVEL) {
      playVictory();
    } else {
      playLevelComplete();
    }
  }, []);

  const handleGameOver = useCallback(() => {
    setGameState('gameOver');
    playGameOver();
  }, []);

  const handleCountdownTick = useCallback((seconds: number) => {
    setCountdown(seconds);
  }, []);

  const handlePlay = useCallback((startLevel: number = 1) => {
    resumeAudio();
    setLevel(startLevel);
    setGameState('playing');
    setCountdown(3);
    setStats({ score: 0, totalSpawned: 0, totalMissed: 0, stability: 1 });
    resetKeyRef.current++;
    forceRender((n) => n + 1);
    if (musicOn) startMusic();
  }, [musicOn]);

  const handleNextLevel = useCallback(() => {
    setLevel((l) => l + 1);
    setGameState('playing');
    setCountdown(3);
    setStats({ score: 0, totalSpawned: 0, totalMissed: 0, stability: 1 });
    resetKeyRef.current++;
    forceRender((n) => n + 1);
  }, []);

  const handleRetry = useCallback(() => {
    setGameState('menu');
    stopMusic();
  }, []);

  const handleToggleMusic = useCallback(() => {
    setMusicOn(prev => {
      const newVal = !prev;
      if (newVal) {
        startMusic();
      } else {
        stopMusic();
      }
      return newVal;
    });
  }, []);

  const paused = gameState !== 'playing';

  return (
    <div className="fixed inset-0 bg-[#0B1628] overflow-hidden select-none">
      {gameState === 'menu' ? (
        <StartMenu onPlay={handlePlay} />
      ) : (
        <>
          <GameCanvas
            key={resetKeyRef.current}
            level={level}
            paused={paused}
            onStatsChange={handleStatsChange}
            onLevelComplete={handleLevelComplete}
            onGameOver={handleGameOver}
            onCountdownTick={handleCountdownTick}
          />
          <GameUI
            level={level}
            stats={stats}
            gameState={gameState}
            countdown={countdown}
            onNextLevel={handleNextLevel}
            onRetry={handleRetry}
            musicOn={musicOn}
            onToggleMusic={handleToggleMusic}
          />
        </>
      )}
    </div>
  );
}

export default App;
