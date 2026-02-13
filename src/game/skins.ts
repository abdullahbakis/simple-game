export interface LineSkin {
  id: string;
  name: string;
  cost: number;
}

export const LINE_SKINS: LineSkin[] = [
  { id: 'rainbow', name: 'Rainbow', cost: 0 },
  { id: 'gold', name: 'Gold', cost: 100 },
  { id: 'neon-blue', name: 'Neon Blue', cost: 150 },
  { id: 'fire', name: 'Fire', cost: 200 },
  { id: 'ice', name: 'Ice', cost: 200 },
  { id: 'matrix', name: 'Matrix', cost: 250 },
  { id: 'slime', name: 'Slime', cost: 250 },
  { id: 'bubble', name: 'Bubble', cost: 300 },
  { id: 'void', name: 'Void', cost: 350 },
  { id: 'electric', name: 'Electric', cost: 350 },
  { id: 'love', name: 'Love', cost: 400 },
  { id: 'starry', name: 'Starry', cost: 450 },
  { id: 'glitch', name: 'Glitch', cost: 500 },
  { id: 'liquid-metal', name: 'Liquid Metal', cost: 600 },
  { id: 'rgb', name: 'RGB Gamer', cost: 750 },
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
