import Matter from 'matter-js';
import { GAME, CATEGORY } from './constants';
import type { LevelConfig } from './constants';
import type { Particle } from './spawner';
const SCALE = Math.min(window.innerWidth / 800, 1);

export interface BlackHole {
  x: number;
  y: number;
  radius: number;
  killRadius: number;
  strength: number;
  angle: number;
  speed: number;
}

export interface LavaPool {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface IceZone {
  x: number;
  y: number;
  width: number;
  height: number;
  dampening: number;
}

export interface TeleporterPair {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  radius: number;
  cooldowns: Map<number, number>;
  hue: number;
}

export interface EmpPulse {
  x: number;
  y: number;
  interval: number;
  lastPulse: number;
  currentRadius: number;
  maxRadius: number;
  strength: number;
  active: boolean;
}

export interface GravityFlipper {
  x: number;
  y: number;
  width: number;
  height: number;
  strength: number;
}

export interface LaserGate {
  x: number;
  y: number;
  length: number;
  angle: number;
  speed: number;
  killWidth: number;
}

export interface Asteroid {
  body: Matter.Body;
  radius: number;
  vx: number;
  vy: number;
}

export interface HazardState {
  blackHoles: BlackHole[];
  lavaPools: LavaPool[];
  iceZones: IceZone[];
  teleporters: TeleporterPair[];
  empPulses: EmpPulse[];
  gravityFlippers: GravityFlipper[];
  laserGates: LaserGate[];
  asteroids: Asteroid[];
}

function avoidsBucket(x: number, y: number, bx: number, by: number, margin: number): boolean {
  return Math.abs(x - bx) > margin || y < by - margin;
}

export function createHazards(
  config: LevelConfig,
  canvasWidth: number,
  _canvasHeight: number,
  bucketCenterX: number,
  bucketTopY: number
): HazardState {
  const safeTop = 120;
  const safeBottom = bucketTopY - 80;
  const usableHeight = Math.max(safeBottom - safeTop, 100);
  const margin = 110;

  const blackHoles: BlackHole[] = [];
  for (let i = 0; i < config.blackHoleCount; i++) {
    let x = 0, y = 0;
    for (let a = 0; a < 50; a++) {
      x = canvasWidth * 0.15 + Math.random() * canvasWidth * 0.7;
      y = safeTop + ((i + 0.5) / Math.max(config.blackHoleCount, 1)) * usableHeight * 0.5;
      if (avoidsBucket(x, y, bucketCenterX, bucketTopY, margin)) break;
    }
    blackHoles.push({
      x, y,
      radius: (80 + Math.random() * 30) * SCALE,
      killRadius: (22 + Math.random() * 6) * SCALE,
      strength: 0.0004 + Math.random() * 0.0002,
      angle: Math.random() * Math.PI * 2,
      speed: 0.001 + Math.random() * 0.0005,
    });
  }

  const lavaPools: LavaPool[] = [];
  for (let i = 0; i < config.lavaPoolCount; i++) {
    const w = 100 + Math.random() * 80;
    const h = 18 + Math.random() * 12;
    const cx = canvasWidth * 0.15 + ((i + 0.5) / Math.max(config.lavaPoolCount, 1)) * canvasWidth * 0.7;
    const y = safeTop + usableHeight * 0.55 + i * 50;
    lavaPools.push({ x: cx - w / 2, y, width: w, height: h });
  }

  const iceZones: IceZone[] = [];
  for (let i = 0; i < config.iceZoneCount; i++) {
    const w = 90 + Math.random() * 60;
    const h = 110 + Math.random() * 70;
    const cx = canvasWidth * 0.15 + ((i + 0.5) / Math.max(config.iceZoneCount, 1)) * canvasWidth * 0.7;
    const y = safeTop + 40 + i * 120;
    iceZones.push({ x: cx - w / 2, y, width: w, height: h, dampening: 0.975 });
  }

  const teleporters: TeleporterPair[] = [];
  for (let i = 0; i < config.teleporterCount; i++) {
    const r = 18 + Math.random() * 6;
    const x1 = canvasWidth * 0.12 + Math.random() * canvasWidth * 0.3;
    const y1 = safeTop + 60 + Math.random() * usableHeight * 0.4;
    const x2 = canvasWidth * 0.58 + Math.random() * canvasWidth * 0.3;
    const y2 = safeTop + 60 + Math.random() * usableHeight * 0.4;
    teleporters.push({ x1, y1, x2, y2, radius: r, cooldowns: new Map(), hue: 170 + i * 70 });
  }

  const empPulses: EmpPulse[] = [];
  for (let i = 0; i < config.empPulseCount; i++) {
    let x = 0, y = 0;
    for (let a = 0; a < 15; a++) {
      x = canvasWidth * 0.2 + Math.random() * canvasWidth * 0.6;
      y = safeTop + ((i + 0.5) / Math.max(config.empPulseCount, 1)) * usableHeight * 0.6;
      if (avoidsBucket(x, y, bucketCenterX, bucketTopY, margin)) break;
    }
    if (!avoidsBucket(x, y, bucketCenterX, bucketTopY, margin)) {
      x = x < bucketCenterX ? canvasWidth * 0.15 : canvasWidth * 0.85;
    }
    empPulses.push({
      x, y,
      interval: 3000 + Math.random() * 2000,
      lastPulse: -10000,
      currentRadius: 0,
      maxRadius: 120 + Math.random() * 60,
      strength: 0.0006 + Math.random() * 0.0003,
      active: false,
    });
  }

  const gravityFlippers: GravityFlipper[] = [];
  for (let i = 0; i < config.gravityFlipperCount; i++) {
    const w = 80 + Math.random() * 50;
    const h = 100 + Math.random() * 60;
    const cx = canvasWidth * 0.15 + ((i + 0.5) / Math.max(config.gravityFlipperCount, 1)) * canvasWidth * 0.6;
    const y = safeTop + 80 + i * 140;
    gravityFlippers.push({ x: cx - w / 2, y, width: w, height: h, strength: 0.003 });
  }

  const laserGates: LaserGate[] = [];
  for (let i = 0; i < config.laserGateCount; i++) {
    let x = 0, y = 0;
    for (let a = 0; a < 15; a++) {
      x = canvasWidth * 0.2 + Math.random() * canvasWidth * 0.6;
      y = safeTop + ((i + 0.5) / Math.max(config.laserGateCount, 1)) * usableHeight * 0.7;
      if (avoidsBucket(x, y, bucketCenterX, bucketTopY, margin + 20)) break;
    }
    if (!avoidsBucket(x, y, bucketCenterX, bucketTopY, margin + 20)) {
      x = x < bucketCenterX ? canvasWidth * 0.15 : canvasWidth * 0.85;
    }
    laserGates.push({
      x, y,
      length: 80 + Math.random() * 60,
      angle: Math.random() * Math.PI,
      speed: 0.0006 + Math.random() * 0.0004,
      killWidth: 6,
    });
  }

  const asteroids: Asteroid[] = [];
  for (let i = 0; i < config.asteroidCount; i++) {
    const radius = 18 + Math.random() * 14;
    const x = canvasWidth * 0.2 + Math.random() * canvasWidth * 0.6;
    const y = safeTop + Math.random() * usableHeight * 0.5;
    const speed = 0.8 + Math.random() * 0.6;
    const angle = Math.random() * Math.PI * 2;
    const body = Matter.Bodies.circle(x, y, radius, {
      isStatic: true,
      label: 'asteroid',
      collisionFilter: { category: CATEGORY.obstacle, mask: CATEGORY.particle },
      restitution: 0.8,
      friction: 0,
    });
    asteroids.push({ body, radius, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed });
  }

  return { blackHoles, lavaPools, iceZones, teleporters, empPulses, gravityFlippers, laserGates, asteroids };
}

export function addHazardsToWorld(hazards: HazardState, world: Matter.World) {
  for (const ast of hazards.asteroids) {
    Matter.Composite.add(world, ast.body);
  }
}

export function updateHazards(
  hazards: HazardState,
  now: number,
  delta: number,
  canvasWidth: number,
  canvasHeight: number
) {
  for (const bh of hazards.blackHoles) {
    bh.angle += bh.speed * delta;
  }

  for (const lg of hazards.laserGates) {
    lg.angle += lg.speed * delta;
  }

  for (const emp of hazards.empPulses) {
    if (now - emp.lastPulse > emp.interval) {
      emp.lastPulse = now;
      emp.currentRadius = 0;
      emp.active = true;
    }
    if (emp.active) {
      emp.currentRadius += delta * 0.15;
      if (emp.currentRadius > emp.maxRadius) {
        emp.active = false;
      }
    }
  }

  for (const ast of hazards.asteroids) {
    let nx = ast.body.position.x + ast.vx * delta * 0.06;
    let ny = ast.body.position.y + ast.vy * delta * 0.06;
    if (nx < ast.radius + 10) { nx = ast.radius + 10; ast.vx = Math.abs(ast.vx); }
    if (nx > canvasWidth - ast.radius - 10) { nx = canvasWidth - ast.radius - 10; ast.vx = -Math.abs(ast.vx); }
    if (ny < ast.radius + 10) { ny = ast.radius + 10; ast.vy = Math.abs(ast.vy); }
    if (ny > canvasHeight - ast.radius - 50) { ny = canvasHeight - ast.radius - 50; ast.vy = -Math.abs(ast.vy); }
    Matter.Body.setPosition(ast.body, { x: nx, y: ny });
  }
}

export function applyHazardForces(hazards: HazardState, particles: { body: Matter.Body }[]) {
  for (const bh of hazards.blackHoles) {
    for (const p of particles) {
      const dx = bh.x - p.body.position.x;
      const dy = bh.y - p.body.position.y;
      const distSq = dx * dx + dy * dy;
      const dist = Math.sqrt(distSq);
      if (dist < bh.radius && dist > bh.killRadius) {
        const force = bh.strength * (1 - dist / bh.radius);
        Matter.Body.applyForce(p.body, p.body.position, {
          x: (dx / dist) * force,
          y: (dy / dist) * force,
        });
      }
    }
  }

  for (const ice of hazards.iceZones) {
    for (const p of particles) {
      const pos = p.body.position;
      if (pos.x >= ice.x && pos.x <= ice.x + ice.width &&
          pos.y >= ice.y && pos.y <= ice.y + ice.height) {
        const dampedVx = p.body.velocity.x * ice.dampening;
        const dampedVy = p.body.velocity.y * ice.dampening;
        const minFall = 0.35;
        Matter.Body.setVelocity(p.body, {
          x: dampedVx,
          y: dampedVy > 0 ? Math.max(dampedVy, minFall) : dampedVy,
        });
      }
    }
  }

  for (const emp of hazards.empPulses) {
    if (!emp.active) continue;
    const ringInner = Math.max(0, emp.currentRadius - 25);
    const ringOuter = emp.currentRadius + 25;
    for (const p of particles) {
      const dx = p.body.position.x - emp.x;
      const dy = p.body.position.y - emp.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist > ringInner && dist < ringOuter && dist > 1) {
        Matter.Body.applyForce(p.body, p.body.position, {
          x: (dx / dist) * emp.strength,
          y: (dy / dist) * emp.strength,
        });
      }
    }
  }

  for (const gf of hazards.gravityFlippers) {
    for (const p of particles) {
      const pos = p.body.position;
      if (pos.x >= gf.x && pos.x <= gf.x + gf.width &&
          pos.y >= gf.y && pos.y <= gf.y + gf.height) {
        if (p.body.velocity.y > -4) {
          Matter.Body.applyForce(p.body, p.body.position, { x: 0, y: -gf.strength });
        }
      }
    }
  }
}

export function applyTeleporters(hazards: HazardState, particles: Particle[], now: number) {
  for (const tp of hazards.teleporters) {
    for (const p of particles) {
      const cd = tp.cooldowns.get(p.body.id);
      if (cd && now - cd < 1500) continue;
      const pos = p.body.position;

      const dx1 = pos.x - tp.x1;
      const dy1 = pos.y - tp.y1;
      if (dx1 * dx1 + dy1 * dy1 < tp.radius * tp.radius) {
        Matter.Body.setPosition(p.body, { x: tp.x2, y: tp.y2 + tp.radius + 5 });
        Matter.Body.setVelocity(p.body, { x: p.body.velocity.x * 0.5, y: Math.max(p.body.velocity.y, 2) });
        tp.cooldowns.set(p.body.id, now);
        continue;
      }

      const dx2 = pos.x - tp.x2;
      const dy2 = pos.y - tp.y2;
      if (dx2 * dx2 + dy2 * dy2 < tp.radius * tp.radius) {
        Matter.Body.setPosition(p.body, { x: tp.x1, y: tp.y1 + tp.radius + 5 });
        Matter.Body.setVelocity(p.body, { x: p.body.velocity.x * 0.5, y: Math.max(p.body.velocity.y, 2) });
        tp.cooldowns.set(p.body.id, now);
      }
    }
  }
}

function pointToSegmentDist(px: number, py: number, ax: number, ay: number, bx: number, by: number): number {
  const abx = bx - ax;
  const aby = by - ay;
  const apx = px - ax;
  const apy = py - ay;
  const lenSq = abx * abx + aby * aby;
  if (lenSq === 0) return Math.sqrt(apx * apx + apy * apy);
  const t = Math.max(0, Math.min(1, (apx * abx + apy * aby) / lenSq));
  const cx = ax + t * abx;
  const cy = ay + t * aby;
  const dx = px - cx;
  const dy = py - cy;
  return Math.sqrt(dx * dx + dy * dy);
}

export function findHazardKills(hazards: HazardState, particles: Particle[]): Particle[] {
  const killed = new Set<Particle>();

  for (const bh of hazards.blackHoles) {
    const kr2 = bh.killRadius * bh.killRadius;
    for (const p of particles) {
      const dx = p.body.position.x - bh.x;
      const dy = p.body.position.y - bh.y;
      if (dx * dx + dy * dy < kr2) {
        killed.add(p);
      }
    }
  }

  for (const lava of hazards.lavaPools) {
    for (const p of particles) {
      const pos = p.body.position;
      if (pos.x >= lava.x && pos.x <= lava.x + lava.width &&
          pos.y >= lava.y && pos.y <= lava.y + lava.height) {
        killed.add(p);
      }
    }
  }

  for (const lg of hazards.laserGates) {
    const halfLen = lg.length / 2;
    const ax = lg.x + Math.cos(lg.angle) * halfLen;
    const ay = lg.y + Math.sin(lg.angle) * halfLen;
    const bx = lg.x - Math.cos(lg.angle) * halfLen;
    const by = lg.y - Math.sin(lg.angle) * halfLen;
    const hitDist = lg.killWidth / 2 + GAME.particleRadius * 1.5;

    for (const p of particles) {
      const dist = pointToSegmentDist(p.body.position.x, p.body.position.y, ax, ay, bx, by);
      if (dist < hitDist) {
        killed.add(p);
      }
    }
  }

  return [...killed];
}

export function cleanupTeleporterCooldowns(hazards: HazardState, activeIds: Set<number>) {
  for (const tp of hazards.teleporters) {
    for (const id of tp.cooldowns.keys()) {
      if (!activeIds.has(id)) {
        tp.cooldowns.delete(id);
      }
    }
  }
}
