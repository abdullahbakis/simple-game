import Matter from 'matter-js';
import { GAME, CATEGORY, CANDY_PALETTE } from './constants';
import type { LevelConfig } from './constants';

export interface Particle {
  body: Matter.Body;
  trail: { x: number; y: number }[];
  createdAt: number;
  colorIdx: number;
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
      frictionAir: 0.01,
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
