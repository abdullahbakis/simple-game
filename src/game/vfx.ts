import { CANDY_RGB } from './constants';

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

export function createVfxState(): VfxState {
  return { particles: [] };
}

export function spawnCollectionSparks(state: VfxState, x: number, y: number) {
  const count = 8 + Math.floor(Math.random() * 6);
  for (let i = 0; i < count; i++) {
    const [r, g, b] = CANDY_RGB[Math.floor(Math.random() * CANDY_RGB.length)];
    const angle = Math.random() * Math.PI * 2;
    const speed = 1.5 + Math.random() * 3;
    const life = 400 + Math.random() * 300;
    state.particles.push({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 2,
      life,
      maxLife: life,
      size: 2 + Math.random() * 3,
      r,
      g,
      b,
    });
  }
}

export function spawnHazardKillSparks(state: VfxState, x: number, y: number, r: number, g: number, b: number) {
  const count = 6;
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 1 + Math.random() * 2.5;
    const life = 300 + Math.random() * 200;
    state.particles.push({
      x, y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 1.5,
      life,
      maxLife: life,
      size: 2 + Math.random() * 2.5,
      r, g, b,
    });
  }
}

export function spawnDrawingSparks(state: VfxState, x: number, y: number) {
  const count = 1 + Math.floor(Math.random() * 2);
  for (let i = 0; i < count; i++) {
    const [r, g, b] = CANDY_RGB[Math.floor(Math.random() * CANDY_RGB.length)];
    const angle = Math.random() * Math.PI * 2;
    const speed = 0.4 + Math.random() * 1;
    const life = 200 + Math.random() * 150;
    state.particles.push({
      x: x + (Math.random() - 0.5) * 8,
      y: y + (Math.random() - 0.5) * 8,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life,
      maxLife: life,
      size: 1.5 + Math.random() * 1.5,
      r,
      g,
      b,
    });
  }
}

export function spawnMissSparks(state: VfxState, x: number, y: number) {
  const count = 5;
  for (let i = 0; i < count; i++) {
    const angle = -Math.PI / 2 + (Math.random() - 0.5) * Math.PI * 0.6;
    const speed = 1.5 + Math.random() * 2;
    const life = 300 + Math.random() * 200;
    state.particles.push({
      x: x + (Math.random() - 0.5) * 10,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life,
      maxLife: life,
      size: 2 + Math.random() * 2,
      r: 255,
      g: 60,
      b: 60,
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
