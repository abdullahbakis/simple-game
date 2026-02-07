export interface VfxParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  r: number;
  g: number;
  b: number;
}

export interface VfxState {
  particles: VfxParticle[];
}

const SPARKLE_COLORS: [number, number, number][] = [
  [255, 255, 255],
  [255, 230, 240],
  [230, 240, 255],
  [240, 255, 240],
];

export function createVfxState(): VfxState {
  return { particles: [] };
}

export function spawnCollectionSparks(state: VfxState, x: number, y: number) {
  const count = 6 + Math.floor(Math.random() * 5);
  for (let i = 0; i < count; i++) {
    const [r, g, b] = SPARKLE_COLORS[Math.floor(Math.random() * SPARKLE_COLORS.length)];
    const angle = Math.random() * Math.PI * 2;
    const speed = 1.2 + Math.random() * 2.5;
    const life = 300 + Math.random() * 200;
    state.particles.push({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 1.5,
      life,
      maxLife: life,
      size: 1.5 + Math.random() * 2,
      r,
      g,
      b,
    });
  }
}

export function spawnDrawingSparks(state: VfxState, x: number, y: number) {
  const count = 1 + Math.floor(Math.random() * 2);
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 0.3 + Math.random() * 0.8;
    const life = 150 + Math.random() * 100;
    state.particles.push({
      x: x + (Math.random() - 0.5) * 6,
      y: y + (Math.random() - 0.5) * 6,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life,
      maxLife: life,
      size: 1 + Math.random() * 1,
      r: 230,
      g: 220,
      b: 235,
    });
  }
}

export function updateVfx(state: VfxState, delta: number) {
  for (let i = state.particles.length - 1; i >= 0; i--) {
    const p = state.particles[i];
    p.life -= delta;
    if (p.life <= 0) {
      state.particles.splice(i, 1);
      continue;
    }
    p.x += p.vx;
    p.y += p.vy;
    p.vy += 0.06;
    p.vx *= 0.97;
    p.vy *= 0.97;
  }
}
