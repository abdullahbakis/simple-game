import Matter from 'matter-js';
import { GAME, CATEGORY, CANDY_PALETTE } from './constants';
import type { LevelConfig } from './constants';

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
  const body = Matter.Bodies.circle(
    spawner.x + offsetX,
    spawner.y,
    GAME.particleRadius,
    {
      restitution: GAME.particleRestitution,
      friction: GAME.particleFriction,
      frictionAir: 0.015,
      density: 0.002,
      label: 'particle',
      collisionFilter: {
        category: CATEGORY.particle,
        mask: CATEGORY.wall | CATEGORY.chain | CATEGORY.bucket | CATEGORY.sensor | CATEGORY.obstacle,
      },
    }
  );

  Matter.Composite.add(world, body);

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
    p.trail.unshift({ x: p.body.position.x, y: p.body.position.y });
    if (p.trail.length > GAME.trailLength) {
      p.trail.pop();
    }
  }
}

export function removeParticle(
  spawner: Spawner,
  world: Matter.World,
  particle: Particle
) {
  Matter.Composite.remove(world, particle.body);
  const idx = spawner.particles.indexOf(particle);
  if (idx !== -1) spawner.particles.splice(idx, 1);
}

export function findMissedParticles(
  spawner: Spawner,
  canvasHeight: number
): Particle[] {
  const missed: Particle[] = [];
  for (const p of spawner.particles) {
    if (p.body.position.y > canvasHeight + 20) {
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

const NUDGE_THRESHOLD = 1800;
const REMOVE_THRESHOLD = 4000;
const STUCK_SPEED = 0.5;

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
      const angle = Math.random() * Math.PI * 2;
      Matter.Body.applyForce(p.body, p.body.position, {
        x: Math.cos(angle) * 0.0006,
        y: Math.sin(angle) * 0.0004 + 0.0005,
      });
      p.stuckSince = now - NUDGE_THRESHOLD + 400;
    }
  }

  return removed;
}
