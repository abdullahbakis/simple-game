import Matter from 'matter-js';
import { GAME, CATEGORY } from './constants';

const bodyPool: Matter.Body[] = [];

function createFreshBody(x: number, y: number): Matter.Body {
  return Matter.Bodies.circle(x, y, GAME.particleRadius, {
    restitution: GAME.particleRestitution,
    friction: GAME.particleFriction,
    frictionAir: 0.015,
    density: 0.002,
    label: 'particle',
    collisionFilter: {
      category: CATEGORY.particle,
      mask: CATEGORY.wall | CATEGORY.chain | CATEGORY.bucket | CATEGORY.sensor | CATEGORY.obstacle,
    },
  });
}

export function acquireParticleBody(world: Matter.World, x: number, y: number): Matter.Body {
  let body: Matter.Body;

  if (bodyPool.length > 0) {
    body = bodyPool.pop()!;
    Matter.Body.setPosition(body, { x, y });
    Matter.Body.setVelocity(body, { x: 0, y: 0 });
    Matter.Body.setAngularVelocity(body, 0);
    Matter.Body.setAngle(body, 0);
    body.force.x = 0;
    body.force.y = 0;
    body.torque = 0;
    body.speed = 0;
    body.angularSpeed = 0;
    body.motion = 0;
    (body as any).sleepState = 0;
    body.isSleeping = false;
    body.isStatic = false;
    body.isSensor = false;
    body.timeScale = 1;
  } else {
    body = createFreshBody(x, y);
  }

  Matter.Composite.add(world, body);
  return body;
}

export function releaseParticleBody(world: Matter.World, body: Matter.Body) {
  Matter.Composite.remove(world, body);
  bodyPool.push(body);
}

export function clearParticlePool() {
  bodyPool.length = 0;
}

const trailPosPool: { x: number; y: number }[] = [];

export function acquireTrailPos(x: number, y: number): { x: number; y: number } {
  if (trailPosPool.length > 0) {
    const pos = trailPosPool.pop()!;
    pos.x = x;
    pos.y = y;
    return pos;
  }
  return { x, y };
}

export function releaseTrailPos(pos: { x: number; y: number }) {
  trailPosPool.push(pos);
}
