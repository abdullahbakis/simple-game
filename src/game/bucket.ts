import Matter from 'matter-js';
import { GAME, CATEGORY } from './constants';
import type { Particle } from './spawner';

export interface Bucket {
  walls: Matter.Body[];
  sensor: Matter.Body;
  x: number;
  y: number;
  cornerLeft: { x: number; y: number };
  cornerRight: { x: number; y: number };
  pulsePhase: number;
  collectPulse: number;
}

export function createBucket(canvasWidth: number, canvasHeight: number, level?: number): Bucket {
  const w = GAME.bucketWidth;
  const h = GAME.bucketHeight;
  const t = GAME.bucketWallThickness;

  let x: number;
  if (level !== undefined && level > 3) {
    const minX = w + 20;
    const maxX = canvasWidth - w - 20;
    x = minX + Math.random() * (maxX - minX);
  } else {
    const centerX = (canvasWidth - w) / 2;
    const maxOffset = canvasWidth * 0.15;
    x = Math.max(canvasWidth * 0.1, Math.min(canvasWidth * 0.9 - w, centerX + (Math.random() - 0.5) * maxOffset * 2));
  }

  const y = canvasHeight - h - 30;
  const capRadius = t * 0.8 + GAME.particleRadius * 0.4;

  const wallChamfer = Math.min(5, t);
  const leftWall = Matter.Bodies.rectangle(x, y + h / 2, t, h, {
    isStatic: true,
    label: 'bucketWall',
    collisionFilter: { category: CATEGORY.bucket, mask: CATEGORY.particle },
    restitution: 0.3,
    friction: 0.01,
    frictionStatic: 0,
    chamfer: { radius: wallChamfer },
  } as Matter.IChamferableBodyDefinition);

  const rightWall = Matter.Bodies.rectangle(x + w, y + h / 2, t, h, {
    isStatic: true,
    label: 'bucketWall',
    collisionFilter: { category: CATEGORY.bucket, mask: CATEGORY.particle },
    restitution: 0.3,
    friction: 0.01,
    frictionStatic: 0,
    chamfer: { radius: wallChamfer },
  } as Matter.IChamferableBodyDefinition);

  const bottom = Matter.Bodies.rectangle(x + w / 2, y + h, w + t, t, {
    isStatic: true,
    label: 'bucketWall',
    collisionFilter: { category: CATEGORY.bucket, mask: CATEGORY.particle },
    restitution: 0.1,
  });

  const leftCap = Matter.Bodies.circle(x, y, capRadius, {
    isStatic: true,
    label: 'bucketCap',
    collisionFilter: { category: CATEGORY.bucket, mask: CATEGORY.particle },
    restitution: 0.8,
    friction: 0,
    frictionStatic: 0,
    render: { visible: false },
  });

  const rightCap = Matter.Bodies.circle(x + w, y, capRadius, {
    isStatic: true,
    label: 'bucketCap',
    collisionFilter: { category: CATEGORY.bucket, mask: CATEGORY.particle },
    restitution: 0.8,
    friction: 0,
    frictionStatic: 0,
    render: { visible: false },
  });

  const sensor = Matter.Bodies.rectangle(x + w / 2, y + h * 0.5, w - t * 2, h * 0.6, {
    isStatic: true,
    isSensor: true,
    label: 'collector',
    collisionFilter: { category: CATEGORY.sensor, mask: CATEGORY.particle },
  });

  return {
    walls: [leftWall, rightWall, bottom, leftCap, rightCap],
    sensor,
    x,
    y,
    cornerLeft: { x, y },
    cornerRight: { x: x + w, y },
    pulsePhase: 0,
    collectPulse: 0,
  };
}

export function addBucketToWorld(bucket: Bucket, world: Matter.World) {
  Matter.Composite.add(world, [...bucket.walls, bucket.sensor]);
}

export function updateBucketPulse(bucket: Bucket, delta: number) {
  bucket.pulsePhase += delta * 0.003;
  if (bucket.pulsePhase > Math.PI * 2) bucket.pulsePhase -= Math.PI * 2;
  if (bucket.collectPulse > 0) {
    bucket.collectPulse = Math.max(0, bucket.collectPulse - delta / 200);
  }
}

const WEDGE_RADIUS = GAME.particleRadius * 2.5 + GAME.bucketWallThickness;
const WEDGE_SPEED_THRESHOLD = 0.8;
const WEDGE_POP_FORCE = 0.0005;

export function antiWedge(bucket: Bucket, particles: Particle[]) {
  const corners = [bucket.cornerLeft, bucket.cornerRight];
  const cx = bucket.x + GAME.bucketWidth / 2;

  for (const p of particles) {
    const pos = p.body.position;
    const vx = p.body.velocity.x;
    const vy = p.body.velocity.y;
    const speed = Math.sqrt(vx * vx + vy * vy);

    if (speed > WEDGE_SPEED_THRESHOLD) continue;

    for (const corner of corners) {
      const dx = pos.x - corner.x;
      const dy = pos.y - corner.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist > WEDGE_RADIUS) continue;

      const towardCenter = pos.x < cx ? 1 : -1;
      Matter.Body.applyForce(p.body, pos, {
        x: WEDGE_POP_FORCE * towardCenter,
        y: -WEDGE_POP_FORCE * 1.5,
      });
      Matter.Body.setVelocity(p.body, {
        x: vx + towardCenter * 2,
        y: -3,
      });
      break;
    }
  }
}
