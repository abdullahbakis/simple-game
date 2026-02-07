import Matter from 'matter-js';
import { CATEGORY } from './constants';
import type { LevelConfig } from './constants';

export interface StaticBar {
  body: Matter.Body;
  x: number;
  y: number;
  width: number;
  height: number;
  angle: number;
}

export interface WindZone {
  x: number;
  y: number;
  width: number;
  height: number;
  forceX: number;
}

export interface Spinner {
  arms: Matter.Body[];
  x: number;
  y: number;
  armLength: number;
  armWidth: number;
  angle: number;
  speed: number;
}

export interface MovingPlatform {
  body: Matter.Body;
  originX: number;
  y: number;
  width: number;
  height: number;
  speed: number;
  range: number;
  phase: number;
}

export interface ObstacleState {
  staticBars: StaticBar[];
  windZones: WindZone[];
  spinners: Spinner[];
  movingPlatforms: MovingPlatform[];
}

function avoidsBucket(x: number, y: number, bx: number, by: number, margin: number): boolean {
  return Math.abs(x - bx) > margin || y < by - margin;
}

export function createObstacles(
  levelConfig: LevelConfig,
  canvasWidth: number,
  canvasHeight: number,
  bucketCenterX: number,
  bucketTopY: number
): ObstacleState {
  const staticBars: StaticBar[] = [];
  const windZones: WindZone[] = [];
  const spinners: Spinner[] = [];
  const movingPlatforms: MovingPlatform[] = [];

  const safeTop = 100;
  const safeBottom = bucketTopY - 60;
  const usableHeight = Math.max(safeBottom - safeTop, 100);

  for (let i = 0; i < levelConfig.staticBarCount; i++) {
    const w = 100 + Math.random() * 120;
    const h = 10;
    let x = 0;
    let y = 0;
    for (let a = 0; a < 15; a++) {
      x = canvasWidth * 0.15 + Math.random() * canvasWidth * 0.7;
      y = safeTop + ((i + 0.5) / Math.max(levelConfig.staticBarCount, 1)) * usableHeight * 0.6;
      if (avoidsBucket(x, y, bucketCenterX, bucketTopY, 90)) break;
    }
    const angle = (Math.random() - 0.5) * 0.8;

    const body = Matter.Bodies.rectangle(x, y, w, h, {
      isStatic: true,
      angle,
      label: 'staticBar',
      collisionFilter: { category: CATEGORY.obstacle, mask: CATEGORY.particle },
      restitution: 0.4,
      friction: 0,
    });

    staticBars.push({ body, x, y, width: w, height: h, angle });
  }

  for (let i = 0; i < levelConfig.windZoneCount; i++) {
    const w = 120 + Math.random() * 80;
    const h = 150 + Math.random() * 100;
    const cx = canvasWidth * 0.15 + ((i + 0.5) / Math.max(levelConfig.windZoneCount, 1)) * canvasWidth * 0.6;
    const y = safeTop + 50 + i * 130;
    const forceX = (Math.random() > 0.5 ? 1 : -1) * (0.0003 + Math.random() * 0.0002);

    windZones.push({ x: cx - w / 2, y, width: w, height: h, forceX });
  }

  for (let i = 0; i < levelConfig.spinnerCount; i++) {
    const armLength = 80 + Math.random() * 40;
    const armWidth = 10;
    let x = 0;
    let y = 0;
    for (let a = 0; a < 15; a++) {
      x = canvasWidth * 0.2 + ((i + 0.5) / Math.max(levelConfig.spinnerCount, 1)) * canvasWidth * 0.6;
      y = safeTop + 80 + ((i % 2) * 0.3 + 0.2) * usableHeight;
      if (avoidsBucket(x, y, bucketCenterX, bucketTopY, 110)) break;
    }
    const speed = 0.0008 + Math.random() * 0.0005;
    const initialAngle = Math.random() * Math.PI;

    const arm1 = Matter.Bodies.rectangle(x, y, armLength, armWidth, {
      isStatic: true,
      angle: initialAngle,
      label: 'spinner',
      collisionFilter: { category: CATEGORY.obstacle, mask: CATEGORY.particle },
      restitution: 0.5,
      friction: 0,
    });

    const arm2 = Matter.Bodies.rectangle(x, y, armLength, armWidth, {
      isStatic: true,
      angle: initialAngle + Math.PI / 2,
      label: 'spinner',
      collisionFilter: { category: CATEGORY.obstacle, mask: CATEGORY.particle },
      restitution: 0.5,
      friction: 0,
    });

    spinners.push({ arms: [arm1, arm2], x, y, armLength, armWidth, angle: initialAngle, speed });
  }

  for (let i = 0; i < levelConfig.movingPlatformCount; i++) {
    const w = 100 + Math.random() * 60;
    const h = 10;
    const x = canvasWidth * 0.2 + ((i + 0.5) / Math.max(levelConfig.movingPlatformCount, 1)) * canvasWidth * 0.6;
    const y = safeTop + 60 + ((i + 0.5) / Math.max(levelConfig.movingPlatformCount, 1)) * usableHeight * 0.7;
    const speed = 0.0008 + Math.random() * 0.0006;
    const range = 80 + Math.random() * 100;
    const phase = Math.random() * Math.PI * 2;

    const body = Matter.Bodies.rectangle(x, y, w, h, {
      isStatic: true,
      label: 'movingPlatform',
      collisionFilter: { category: CATEGORY.obstacle, mask: CATEGORY.particle },
      restitution: 0.3,
      friction: 0,
    });

    movingPlatforms.push({ body, originX: x, y, width: w, height: h, speed, range, phase });
  }

  return { staticBars, windZones, spinners, movingPlatforms };
}

export function addObstaclesToWorld(obstacles: ObstacleState, world: Matter.World) {
  for (const s of obstacles.staticBars) {
    Matter.Composite.add(world, s.body);
  }
  for (const sp of obstacles.spinners) {
    for (const arm of sp.arms) {
      Matter.Composite.add(world, arm);
    }
  }
  for (const mp of obstacles.movingPlatforms) {
    Matter.Composite.add(world, mp.body);
  }
}

export function updateObstacles(obstacles: ObstacleState, now: number, delta: number) {
  for (const sp of obstacles.spinners) {
    sp.angle += sp.speed * delta;
    Matter.Body.setAngle(sp.arms[0], sp.angle);
    Matter.Body.setPosition(sp.arms[0], { x: sp.x, y: sp.y });
    Matter.Body.setAngle(sp.arms[1], sp.angle + Math.PI / 2);
    Matter.Body.setPosition(sp.arms[1], { x: sp.x, y: sp.y });
  }

  for (const mp of obstacles.movingPlatforms) {
    const offset = Math.sin(now * mp.speed + mp.phase) * mp.range;
    Matter.Body.setPosition(mp.body, { x: mp.originX + offset, y: mp.y });
  }
}

export function applyWindForces(
  obstacles: ObstacleState,
  particles: { body: Matter.Body }[]
) {
  for (const zone of obstacles.windZones) {
    for (const p of particles) {
      const pos = p.body.position;
      if (
        pos.x >= zone.x &&
        pos.x <= zone.x + zone.width &&
        pos.y >= zone.y &&
        pos.y <= zone.y + zone.height
      ) {
        Matter.Body.applyForce(p.body, p.body.position, { x: zone.forceX, y: 0 });
      }
    }
  }
}
