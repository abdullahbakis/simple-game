const STORAGE_KEY = 'candyflow_progress';

export const MILESTONE_LEVELS = [1, 12, 16, 20, 25, 30, 35, 40, 45] as const;

export const MILESTONE_NAMES: Record<number, string> = {
  1: 'Start',
  12: 'Black Holes',
  16: 'Lava Pools',
  20: 'Ice Zones',
  25: 'Teleporters',
  30: 'EMP Pulses',
  35: 'Anti-Gravity',
  40: 'Laser Gates',
  45: 'Asteroids',
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
