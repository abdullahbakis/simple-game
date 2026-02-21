import Matter from 'matter-js';
import { GAME, CANDY_PALETTE, screenScale } from './constants';
import type { LevelConfig } from './constants';
import { acquireParticleBody, releaseParticleBody, acquireTrailPos, releaseTrailPos } from './particle-pool';

export interface Particle {
  body: Matter.Body;
  trail: { x: number; y: number }[];
  createdAt: number;
  colorIdx: number;
  stuckSince?: number;
}

export interface Spawner {
  particles: Particle[];
  lastSpawn: number;
  x: number;
  y: number;
  totalSpawned: number;
}

export function createSpawner(canvasWidth: number): Spawner {
  return {
    particles: [],
    lastSpawn: 0,
    x: canvasWidth / 2,
    y: 40,
    totalSpawned: 0,
  };
}

export function spawnParticle(
  spawner: Spawner,
  world: Matter.World,
  now: number,
  levelConfig: LevelConfig
): Particle | null {
  if (now - spawner.lastSpawn < levelConfig.spawnInterval) return null;
  if (spawner.particles.length >= GAME.maxParticles) return null;

  spawner.lastSpawn = now;
  spawner.totalSpawned++;

  const offsetX = (Math.random() - 0.5) * GAME.spawnerWidth;
  const body = acquireParticleBody(world, spawner.x + offsetX, spawner.y);

  const particle: Particle = {
    body,
    trail: [],
    createdAt: now,
    colorIdx: Math.floor(Math.random() * CANDY_PALETTE.length),
  };

  spawner.particles.push(particle);
  return particle;
}

export function updateTrails(spawner: Spawner) {
  for (const p of spawner.particles) {
    p.trail.unshift(acquireTrailPos(p.body.position.x, p.body.position.y));
    if (p.trail.length > GAME.trailLength) {
      releaseTrailPos(p.trail.pop()!);
    }
  }
}

export function removeParticle(
  spawner: Spawner,
  world: Matter.World,
  particle: Particle
) {
  for (const pos of particle.trail) releaseTrailPos(pos);
  particle.trail = [];

  releaseParticleBody(world, particle.body);

  const idx = spawner.particles.indexOf(particle);
  if (idx !== -1) spawner.particles.splice(idx, 1);
}

export function findMissedParticles(
  spawner: Spawner,
  canvasHeight: number,
  canvasWidth?: number
): Particle[] {
  const missed: Particle[] = [];
  const margin = 10;
  for (const p of spawner.particles) {
    const { x, y } = p.body.position;
    if (
      y > canvasHeight + margin ||
      (canvasWidth !== undefined && (x < -margin || x > canvasWidth + margin))
    ) {
      missed.push(p);
    }
  }
  return missed;
}

export function clampParticleVelocities(spawner: Spawner, maxSpeed: number) {
  for (const p of spawner.particles) {
    const vx = p.body.velocity.x;
    const vy = p.body.velocity.y;
    const speed = Math.sqrt(vx * vx + vy * vy);
    if (speed > maxSpeed) {
      const scale = maxSpeed / speed;
      Matter.Body.setVelocity(p.body, { x: vx * scale, y: vy * scale });
    }
  }
}

const NUDGE_THRESHOLD = 800;
const REMOVE_THRESHOLD = 3500;
const STUCK_SPEED = 0.6 * screenScale;

export function handleStuckParticles(
  spawner: Spawner,
  _world: Matter.World,
  now: number
): Particle[] {
  const removed: Particle[] = [];

  for (const p of spawner.particles) {
    const vx = p.body.velocity.x;
    const vy = p.body.velocity.y;
    const speed = Math.sqrt(vx * vx + vy * vy);

    if (speed > STUCK_SPEED) {
      p.stuckSince = undefined;
      continue;
    }

    if (p.stuckSince === undefined) {
      p.stuckSince = now;
      continue;
    }

    const duration = now - p.stuckSince;

    if (duration > REMOVE_THRESHOLD) {
      removed.push(p);
    } else if (duration > NUDGE_THRESHOLD) {
      const nudgeAngle = Math.PI * 0.5 + (Math.random() - 0.5) * Math.PI * 0.6;
      Matter.Body.applyForce(p.body, p.body.position, {
        x: Math.cos(nudgeAngle) * 0.001 * screenScale,
        y: Math.sin(nudgeAngle) * 0.0012 * screenScale,
      });
      p.stuckSince = now - NUDGE_THRESHOLD + 300;
    }
  }

  return removed;
}
