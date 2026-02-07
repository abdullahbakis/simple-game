import { useState, useCallback, useRef } from 'react';
import GameCanvas from './components/GameCanvas';
import GameUI from './components/GameUI';
import StartMenu from './components/StartMenu';
import type { GameStats } from './components/GameCanvas';

type GameState = 'menu' | 'playing' | 'levelComplete' | 'gameOver';

function App() {
  const [level, setLevel] = useState(1);
  const [gameState, setGameState] = useState<GameState>('menu');
  const [countdown, setCountdown] = useState(3);
  const [stats, setStats] = useState<GameStats>({
    score: 0,
    totalSpawned: 0,
    totalMissed: 0,
    stability: 1,
  });
  const resetKeyRef = useRef(0);
  const [, forceRender] = useState(0);

  const handleStatsChange = useCallback((newStats: GameStats) => {
    setStats(newStats);
  }, []);

  const handleLevelComplete = useCallback(() => {
    setGameState('levelComplete');
  }, []);

  const handleGameOver = useCallback(() => {
    setGameState('gameOver');
  }, []);

  const handleCountdownTick = useCallback((seconds: number) => {
    setCountdown(seconds);
  }, []);

  const handlePlay = useCallback(() => {
    setLevel(1);
    setGameState('playing');
    setCountdown(3);
    setStats({ score: 0, totalSpawned: 0, totalMissed: 0, stability: 1 });
    resetKeyRef.current++;
    forceRender((n) => n + 1);
  }, []);

  const handleNextLevel = useCallback(() => {
    setLevel((l) => l + 1);
    setGameState('playing');
    setCountdown(3);
    setStats({ score: 0, totalSpawned: 0, totalMissed: 0, stability: 1 });
    resetKeyRef.current++;
    forceRender((n) => n + 1);
  }, []);

  const handleRetry = useCallback(() => {
    setLevel(1);
    setGameState('playing');
    setCountdown(3);
    setStats({ score: 0, totalSpawned: 0, totalMissed: 0, stability: 1 });
    resetKeyRef.current++;
    forceRender((n) => n + 1);
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
          />
        </>
      )}
    </div>
  );
}

export default App;
