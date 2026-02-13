import { useState, useCallback, useRef, useEffect } from 'react';
import GameCanvas from './components/GameCanvas';
import GameUI from './components/GameUI';
import StartMenu from './components/StartMenu';
import ShopModal from './components/ShopModal';
import type { GameStats } from './components/GameCanvas';
import { updateProgress, loadCoins, saveCoins, earnCoins, unlockMilestone } from './game/progress';
import { getUnlockedSkins, unlockSkin, getSelectedSkin, selectSkin } from './game/skins';
import { playLevelComplete, playVictory, playGameOver, startMusic, stopMusic, resumeAudio } from './game/audio';
import { MAX_LEVEL } from './game/constants';

type GameState = 'menu' | 'playing' | 'levelComplete' | 'gameOver';

function App() {
  const [level, setLevel] = useState(1);
  const [gameState, setGameState] = useState<GameState>('menu');
  const [countdown, setCountdown] = useState(3);
  const [musicOn, setMusicOn] = useState(true);
  const [coins, setCoins] = useState(loadCoins);
  const [selectedSkinId, setSelectedSkinId] = useState(getSelectedSkin);
  const [unlockedSkins, setUnlockedSkins] = useState(getUnlockedSkins);
  const [showShop, setShowShop] = useState(false);
  const [failCount, setFailCount] = useState(0);
  const [stats, setStats] = useState<GameStats>({
    score: 0,
    totalSpawned: 0,
    totalMissed: 0,
    stability: 1,
  });
  const resetKeyRef = useRef(0);
  const [, forceRender] = useState(0);
  const levelRef = useRef(level);
  const statsRef = useRef(stats);

  useEffect(() => {
    levelRef.current = level;
  }, [level]);

  useEffect(() => {
    statsRef.current = stats;
  }, [stats]);

  const handleStatsChange = useCallback((newStats: GameStats) => {
    setStats(newStats);
  }, []);

  const handleLevelComplete = useCallback(() => {
    setGameState('levelComplete');
    updateProgress(levelRef.current);
    const earned = earnCoins(statsRef.current.stability);
    setCoins(prev => {
      const next = prev + earned;
      saveCoins(next);
      return next;
    });
    setFailCount(0);
    if (levelRef.current >= MAX_LEVEL) {
      playVictory();
    } else {
      playLevelComplete();
    }
  }, []);

  const handleGameOver = useCallback(() => {
    setGameState('gameOver');
    setFailCount(prev => prev + 1);
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
    setFailCount(0);
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

  const handleUnlockMilestone = useCallback(() => {
    if (coins >= 500) {
      setCoins(prev => {
        const next = prev - 500;
        saveCoins(next);
        return next;
      });
      unlockMilestone(levelRef.current + 1);
      setLevel(prev => prev + 1);
      setGameState('playing');
      setCountdown(3);
      setStats({ score: 0, totalSpawned: 0, totalMissed: 0, stability: 1 });
      setFailCount(0);
      resetKeyRef.current++;
      forceRender((n) => n + 1);
    }
  }, [coins]);

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

  const handleBuySkin = useCallback((skinId: string, cost: number) => {
    if (coins >= cost) {
      unlockSkin(skinId);
      setUnlockedSkins(getUnlockedSkins());
      setCoins(prev => {
        const next = prev - cost;
        saveCoins(next);
        return next;
      });
    }
  }, [coins]);

  const handleSelectSkin = useCallback((skinId: string) => {
    selectSkin(skinId);
    setSelectedSkinId(skinId);
  }, []);

  const paused = gameState !== 'playing';

  return (
    <div className="fixed inset-0 bg-[#0B1628] overflow-hidden select-none">
      {gameState === 'menu' ? (
        <StartMenu coins={coins} onPlay={handlePlay} onOpenShop={() => setShowShop(true)} />
      ) : (
        <>
          <GameCanvas
            key={resetKeyRef.current}
            level={level}
            paused={paused}
            skinId={selectedSkinId}
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
            coins={coins}
            failCount={failCount}
            onNextLevel={handleNextLevel}
            onRetry={handleRetry}
            onUnlockMilestone={handleUnlockMilestone}
            musicOn={musicOn}
            onToggleMusic={handleToggleMusic}
          />
        </>
      )}
      {showShop && (
        <ShopModal
          coins={coins}
          unlockedSkins={unlockedSkins}
          selectedSkin={selectedSkinId}
          onBuy={handleBuySkin}
          onSelect={handleSelectSkin}
          onClose={() => setShowShop(false)}
        />
      )}
    </div>
  );
}

export default App;
