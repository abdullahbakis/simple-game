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

const pool: VfxParticle[] = [];

function acquire(): VfxParticle {
  return pool.length > 0 ? pool.pop()! : {} as VfxParticle;
}

function release(p: VfxParticle) {
  pool.push(p);
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
    const p = acquire();
    p.x = x;
    p.y = y;
    p.vx = Math.cos(angle) * speed;
    p.vy = Math.sin(angle) * speed - 2;
    p.life = life;
    p.maxLife = life;
    p.size = 2 + Math.random() * 3;
    p.r = r;
    p.g = g;
    p.b = b;
    state.particles.push(p);
  }
}

export function spawnHazardKillSparks(
  state: VfxState,
  x: number,
  y: number,
  r: number,
  g: number,
  b: number
) {
  const count = 6;
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 1 + Math.random() * 2.5;
    const life = 300 + Math.random() * 200;
    const p = acquire();
    p.x = x;
    p.y = y;
    p.vx = Math.cos(angle) * speed;
    p.vy = Math.sin(angle) * speed - 1.5;
    p.life = life;
    p.maxLife = life;
    p.size = 2 + Math.random() * 2.5;
    p.r = r;
    p.g = g;
    p.b = b;
    state.particles.push(p);
  }
}

export function spawnDrawingSparks(state: VfxState, x: number, y: number) {
  const count = 1 + Math.floor(Math.random() * 2);
  for (let i = 0; i < count; i++) {
    const [r, g, b] = CANDY_RGB[Math.floor(Math.random() * CANDY_RGB.length)];
    const angle = Math.random() * Math.PI * 2;
    const speed = 0.4 + Math.random() * 1;
    const life = 200 + Math.random() * 150;
    const p = acquire();
    p.x = x + (Math.random() - 0.5) * 8;
    p.y = y + (Math.random() - 0.5) * 8;
    p.vx = Math.cos(angle) * speed;
    p.vy = Math.sin(angle) * speed;
    p.life = life;
    p.maxLife = life;
    p.size = 1.5 + Math.random() * 1.5;
    p.r = r;
    p.g = g;
    p.b = b;
    state.particles.push(p);
  }
}

export function spawnMissSparks(state: VfxState, x: number, y: number) {
  const count = 5;
  for (let i = 0; i < count; i++) {
    const angle = -Math.PI / 2 + (Math.random() - 0.5) * Math.PI * 0.6;
    const speed = 1.5 + Math.random() * 2;
    const life = 300 + Math.random() * 200;
    const p = acquire();
    p.x = x + (Math.random() - 0.5) * 10;
    p.y = y;
    p.vx = Math.cos(angle) * speed;
    p.vy = Math.sin(angle) * speed;
    p.life = life;
    p.maxLife = life;
    p.size = 2 + Math.random() * 2;
    p.r = 255;
    p.g = 60;
    p.b = 60;
    state.particles.push(p);
  }
}

export function updateVfx(state: VfxState, delta: number) {
  const arr = state.particles;
  let i = arr.length - 1;
  while (i >= 0) {
    const p = arr[i];
    p.life -= delta;
    if (p.life <= 0) {
      release(p);
      arr[i] = arr[arr.length - 1];
      arr.pop();
      i--;
      continue;
    }
    p.x += p.vx;
    p.y += p.vy;
    p.vy += 0.06;
    p.vx *= 0.97;
    p.vy *= 0.97;
    i--;
  }
}
