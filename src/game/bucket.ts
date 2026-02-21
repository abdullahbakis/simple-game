import Matter from 'matter-js';
import { GAME, CATEGORY } from './constants';

export interface Bucket {
  walls: Matter.Body[];
  sensor: Matter.Body;
  x: number;
  y: number;
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
  const capRadius = GAME.particleRadius * 1.8;

  const leftWall = Matter.Bodies.rectangle(x, y + h / 2, t, h, {
    isStatic: true,
    label: 'bucketWall',
    collisionFilter: { category: CATEGORY.bucket, mask: CATEGORY.particle },
    restitution: 0.2,
    chamfer: { radius: 5 },
  } as Matter.IChamferableBodyDefinition);

  const rightWall = Matter.Bodies.rectangle(x + w, y + h / 2, t, h, {
    isStatic: true,
    label: 'bucketWall',
    collisionFilter: { category: CATEGORY.bucket, mask: CATEGORY.particle },
    restitution: 0.2,
    chamfer: { radius: 5 },
  } as Matter.IChamferableBodyDefinition);

  const bottom = Matter.Bodies.rectangle(x + w / 2, y + h, w + t, t, {
    isStatic: true,
    label: 'bucketWall',
    collisionFilter: { category: CATEGORY.bucket, mask: CATEGORY.particle },
    restitution: 0.1,
  });

  const leftCap = Matter.Bodies.circle(x, y - capRadius * 0.3, capRadius, {
    isStatic: true,
    label: 'bucketCap',
    collisionFilter: { category: CATEGORY.bucket, mask: CATEGORY.particle | CATEGORY.chain },
    restitution: 1.5,
    friction: 0,
    frictionStatic: 0,
    render: { visible: false },
  });

  const rightCap = Matter.Bodies.circle(x + w, y - capRadius * 0.3, capRadius, {
    isStatic: true,
    label: 'bucketCap',
    collisionFilter: { category: CATEGORY.bucket, mask: CATEGORY.particle | CATEGORY.chain },
    restitution: 1.5,
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
