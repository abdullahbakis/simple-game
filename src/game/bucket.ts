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

export function createBucket(canvasWidth: number, canvasHeight: number): Bucket {
  const minX = canvasWidth * 0.2;
  const maxX = canvasWidth * 0.8 - GAME.bucketWidth;
  const x = minX + Math.random() * (maxX - minX);
  const y = canvasHeight - GAME.bucketHeight - 30;
  const w = GAME.bucketWidth;
  const h = GAME.bucketHeight;
  const t = GAME.bucketWallThickness;

  const leftWall = Matter.Bodies.rectangle(x, y + h / 2, t, h, {
    isStatic: true,
    label: 'bucketWall',
    collisionFilter: { category: CATEGORY.bucket, mask: CATEGORY.particle },
    restitution: 0.2,
  });

  const rightWall = Matter.Bodies.rectangle(x + w, y + h / 2, t, h, {
    isStatic: true,
    label: 'bucketWall',
    collisionFilter: { category: CATEGORY.bucket, mask: CATEGORY.particle },
    restitution: 0.2,
  });

  const bottom = Matter.Bodies.rectangle(x + w / 2, y + h, w + t, t, {
    isStatic: true,
    label: 'bucketWall',
    collisionFilter: { category: CATEGORY.bucket, mask: CATEGORY.particle },
    restitution: 0.1,
  });

  const sensor = Matter.Bodies.rectangle(x + w / 2, y + h * 0.5, w - t * 2, h * 0.6, {
    isStatic: true,
    isSensor: true,
    label: 'collector',
    collisionFilter: { category: CATEGORY.sensor, mask: CATEGORY.particle },
  });

  return {
    walls: [leftWall, rightWall, bottom],
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
