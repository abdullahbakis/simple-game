import { useState, useCallback, useRef, useEffect } from 'react';
import GameCanvas from './components/GameCanvas';
import GameUI from './components/GameUI';
import StartMenu from './components/StartMenu';
import ShopModal from './components/ShopModal';
import type { GameStats } from './components/GameCanvas';
import { updateProgress, loadCoins, saveCoins, earnCoins, getReviveCost, loadProgress, MILESTONE_LEVELS, unlockMilestone } from './game/progress';
import { getUnlockedSkins, unlockSkin, getSelectedSkin, selectSkin } from './game/skins';
import { playLevelComplete, playVictory, playGameOver, startMusic, stopMusic, resumeAudio } from './game/audio';
import { showRewardedAd } from './game/AdManager';
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

  const doRevive = useCallback(() => {
    setGameState('playing');
    setCountdown(3);
    setStats({ score: 0, totalSpawned: 0, totalMissed: 0, stability: 1 });
    resetKeyRef.current++;
    forceRender((n) => n + 1);
  }, []);

  const handleReviveAd = useCallback(() => {
    showRewardedAd(() => {
      doRevive();
    });
  }, [doRevive]);

  const handleReviveCoins = useCallback(() => {
    const cost = getReviveCost();
    setCoins(prev => {
      if (prev < cost) return prev;
      const next = prev - cost;
      saveCoins(next);
      return next;
    });
    doRevive();
  }, [doRevive]);

  const handleGiveUp = useCallback(() => {
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

  const addCoins = useCallback((amount: number) => {
    setCoins(prev => {
      const next = prev + amount;
      saveCoins(next);
      return next;
    });
  }, []);

  const handleWatchAdForCoins = useCallback(() => {
    showRewardedAd(() => {
      addCoins(250);
    });
  }, [addCoins]);

  const handlePurchaseCoins = useCallback((amount: number) => {
    addCoins(amount);
  }, [addCoins]);

  const getNextMilestoneCost = useCallback((): number | null => {
    const progress = loadProgress();
    const nextMilestone = MILESTONE_LEVELS.find(l => l > progress.highestLevel);
    if (!nextMilestone) return null;
    if (progress.highestLevel < 30) return 2000;
    if (progress.highestLevel < 60) return 5000;
    return 10000;
  }, []);

  const handleUnlockNextMilestone = useCallback(() => {
    const progress = loadProgress();
    const nextMilestone = MILESTONE_LEVELS.find(l => l > progress.highestLevel);
    const cost = getNextMilestoneCost();
    if (!nextMilestone || cost === null || coins < cost) return;

    unlockMilestone(nextMilestone);
    setCoins(prev => {
      const next = prev - cost;
      saveCoins(next);
      return next;
    });
  }, [coins, getNextMilestoneCost]);

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
            onNextLevel={handleNextLevel}
            onReviveAd={handleReviveAd}
            onReviveCoins={handleReviveCoins}
            onGiveUp={handleGiveUp}
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
          onWatchAdForCoins={handleWatchAdForCoins}
          onPurchaseCoins={handlePurchaseCoins}
          nextMilestoneCost={getNextMilestoneCost()}
          onUnlockNextMilestone={handleUnlockNextMilestone}
        />
      )}
    </div>
  );
}

export default App;
