import { useState, useCallback, useRef, useEffect } from 'react';
import GameCanvas from './components/GameCanvas';
import GameUI from './components/GameUI';
import StartMenu from './components/StartMenu';
import ShopModal from './components/ShopModal';
import ToastNotification from './components/ToastNotification';
import TutorialOverlay, { isTutorialDone } from './components/TutorialOverlay';
import type { GameStats } from './components/GameCanvas';
import type { ToastData } from './components/ToastNotification';
import { updateProgress, loadCoins, saveCoins, earnCoins, getReviveCost, loadProgress, MILESTONE_LEVELS, unlockMilestone } from './game/progress';
import { getUnlockedSkins, unlockSkin, getSelectedSkin, selectSkin } from './game/skins';
import { playLevelComplete, playVictory, playGameOver, startMusic, stopMusic, resumeAudio } from './game/audio';
import { showRewardedAd } from './game/AdManager';
import { MAX_LEVEL } from './game/constants';
import { getMilestoneForLevel } from './game/milestones';
import { LangProvider, useLang } from './i18n/LangContext';
import type { Translations } from './i18n/translations';

type GameState = 'menu' | 'playing' | 'paused' | 'levelComplete' | 'gameOver';

let toastIdCounter = 0;

const MILESTONE_KEYS: Record<number, keyof Translations['milestones']> = {
  5: 'firstSteps',
  10: 'risingStar',
  15: 'chainArtist',
  20: 'gravityMaster',
  25: 'warpNavigator',
  30: 'stormChaser',
  35: 'antiGravityAce',
  40: 'laserDancer',
  45: 'meteorDodger',
  50: 'teslaTamer',
  55: 'forceBender',
  60: 'phaseWalker',
  65: 'ironWill',
  70: 'orbitBreaker',
  75: 'solarGuardian',
  80: 'timeBender',
  85: 'apexPredator',
  90: 'voidWalker',
  95: 'livingLegend',
};

function AppInner() {
  const [level, setLevel] = useState(1);
  const [gameState, setGameState] = useState<GameState>('menu');
  const [countdown, setCountdown] = useState(3);
  const [musicOn, setMusicOn] = useState(true);
  const [coins, setCoins] = useState(loadCoins);
  const [selectedSkinId, setSelectedSkinId] = useState(getSelectedSkin);
  const [unlockedSkins, setUnlockedSkins] = useState(getUnlockedSkins);
  const [showShop, setShowShop] = useState(false);
  const [toasts, setToasts] = useState<ToastData[]>([]);
  const [showTutorial, setShowTutorial] = useState(!isTutorialDone());
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
  const shownToastsRef = useRef<Set<number>>(new Set());
  const { tr } = useLang();

  useEffect(() => {
    levelRef.current = level;
  }, [level]);

  useEffect(() => {
    statsRef.current = stats;
  }, [stats]);

  const showToast = useCallback((title: string, subtitle: string) => {
    const id = ++toastIdCounter;
    setToasts(prev => [...prev, { id, title, subtitle }]);
  }, []);

  const dismissToast = useCallback((id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

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
      unlockSkin('cosmic-emperor');
      setUnlockedSkins(getUnlockedSkins());
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
    shownToastsRef.current.clear();
    if (musicOn) startMusic();
  }, [musicOn]);

  const handleNextLevel = useCallback(() => {
    const nextLevel = levelRef.current + 1;
    setLevel(nextLevel);
    setGameState('playing');
    setCountdown(3);
    setStats({ score: 0, totalSpawned: 0, totalMissed: 0, stability: 1 });
    resetKeyRef.current++;
    forceRender((n) => n + 1);

    const milestone = getMilestoneForLevel(nextLevel);
    if (milestone && !shownToastsRef.current.has(nextLevel)) {
      shownToastsRef.current.add(nextLevel);
      const key = MILESTONE_KEYS[nextLevel];
      const translated = key ? tr.milestones[key] : null;
      setTimeout(() => {
        showToast(
          translated ? translated.title : milestone.title,
          translated ? translated.subtitle : milestone.subtitle,
        );
      }, 500);
    }
  }, [showToast, tr]);

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

  const handleReturnToMenu = useCallback(() => {
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

  const handlePause = useCallback(() => {
    setGameState('paused');
  }, []);

  const handleResume = useCallback(() => {
    setGameState('playing');
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
  const isPaused = gameState === 'paused';

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
            onReturnToMenu={handleReturnToMenu}
            isPaused={isPaused}
            onPause={handlePause}
            onResume={handleResume}
          />
          <ToastNotification toasts={toasts} onDismiss={dismissToast} />
        </>
      )}
      {showTutorial && gameState === 'menu' && (
        <TutorialOverlay onDone={() => setShowTutorial(false)} />
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

function App() {
  return (
    <LangProvider>
      <AppInner />
    </LangProvider>
  );
}

export default App;
