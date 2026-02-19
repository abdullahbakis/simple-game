export interface LineSkin {
  id: string;
  name: string;
  cost: number;
}

export const LINE_SKINS: LineSkin[] = [
  { id: 'rainbow', name: 'Rainbow', cost: 0 },
  { id: 'gold', name: 'Gold', cost: 2500 },
  { id: 'neon-blue', name: 'Neon Blue', cost: 2500 },
  { id: 'ice', name: 'Ice', cost: 2500 },
  { id: 'slime', name: 'Slime', cost: 7500 },
  { id: 'bubble', name: 'Bubble', cost: 7500 },
  { id: 'toxic', name: 'Toxic', cost: 7500 },
  { id: 'fire', name: 'Fire', cost: 15000 },
  { id: 'electric', name: 'Electric', cost: 15000 },
  { id: 'love', name: 'Love', cost: 15000 },
  { id: 'matrix', name: 'Matrix', cost: 30000 },
  { id: 'void', name: 'Void', cost: 30000 },
  { id: 'starry', name: 'Starry', cost: 30000 },
  { id: 'glitch', name: 'Glitch', cost: 75000 },
  { id: 'rgb', name: 'Neon Pulse', cost: 75000 },
  { id: 'plasma', name: 'Plasma', cost: 75000 },
  { id: 'cosmic-emperor', name: 'Cosmic Emperor', cost: 375000 },
];

const SKINS_KEY = 'candyflow_skins';
const SELECTED_SKIN_KEY = 'candyflow_selected_skin';

export function getUnlockedSkins(): string[] {
  try {
    const data = localStorage.getItem(SKINS_KEY);
    if (data) return JSON.parse(data);
  } catch {}
  return ['rainbow'];
}

export function unlockSkin(skinId: string) {
  const unlocked = getUnlockedSkins();
  if (!unlocked.includes(skinId)) {
    unlocked.push(skinId);
    localStorage.setItem(SKINS_KEY, JSON.stringify(unlocked));
  }
}

export function getSelectedSkin(): string {
  try {
    return localStorage.getItem(SELECTED_SKIN_KEY) || 'rainbow';
  } catch {
    return 'rainbow';
  }
}

export function selectSkin(skinId: string) {
  localStorage.setItem(SELECTED_SKIN_KEY, skinId);
}
