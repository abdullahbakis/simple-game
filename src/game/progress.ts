const STORAGE_KEY = 'neonide_progress';
const COINS_KEY = 'neonide_coins';

export const MILESTONE_LEVELS = [1, 4, 7, 10, 12, 16, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 90] as const;

export const MILESTONE_NAMES: Record<number, string> = {
  1: 'Start',
  4: 'Wind Zones',
  7: 'Spinners',
  10: 'Platforms',
  12: 'Black Holes',
  16: 'Lava Pools',
  20: 'Ice Zones',
  25: 'Teleporters',
  30: 'EMP Pulses',
  35: 'Anti-Gravity',
  40: 'Laser Gates',
  45: 'Asteroids',
  50: 'Tesla Coils',
  55: 'Repulsors',
  60: 'Phase Walls',
  65: 'Mag Cores',
  70: 'Bumpers',
  75: 'Solar Flares',
  80: 'Slow-Mo',
  90: 'The Void',
};

export interface Progress {
  highestLevel: number;
  highestCompleted: number;
}

export function loadProgress(): Progress {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
      const parsed = JSON.parse(data);
      return {
        highestLevel: parsed.highestLevel || 1,
        highestCompleted: parsed.highestCompleted || 0,
      };
    }
  } catch {
    // Ignore errors
  }
  return { highestLevel: 1, highestCompleted: 0 };
}

export function saveProgress(progress: Progress) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch {
    // Ignore errors
  }
}

export function updateProgress(completedLevel: number): Progress {
  const current = loadProgress();
  const newProgress: Progress = {
    highestLevel: Math.max(current.highestLevel, completedLevel + 1),
    highestCompleted: Math.max(current.highestCompleted, completedLevel),
  };
  saveProgress(newProgress);
  return newProgress;
}

export function getUnlockedMilestones(): number[] {
  const progress = loadProgress();
  return MILESTONE_LEVELS.filter(level => level <= progress.highestLevel);
}

export function resetProgress() {
  saveProgress({ highestLevel: 1, highestCompleted: 0 });
}

export function loadCoins(): number {
  try {
    const data = localStorage.getItem(COINS_KEY);
    if (data) return JSON.parse(data);
  } catch {}
  return 0;
}

export function saveCoins(coins: number) {
  try {
    localStorage.setItem(COINS_KEY, JSON.stringify(coins));
  } catch {}
}

export function earnCoins(_stability: number, _totalSpawned = 0, totalMissed = 0, score = 0): number {
  return Math.max(1, score - totalMissed);
}

export function getReviveCost(): number {
  return 250;
}

export function unlockMilestone(milestoneLevel: number) {
  const current = loadProgress();
  const newProgress: Progress = {
    highestLevel: Math.max(current.highestLevel, milestoneLevel),
    highestCompleted: current.highestCompleted,
  };
  saveProgress(newProgress);
}
