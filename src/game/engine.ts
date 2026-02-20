import Matter from 'matter-js';
import { GAME, CATEGORY } from './constants';

export interface GameEngine {
  engine: Matter.Engine;
  world: Matter.World;
}

export function createGameEngine(width: number, height: number, gravityScale: number = 1): GameEngine {
  const engine = Matter.Engine.create({
    gravity: { x: 0, y: GAME.gravity * gravityScale, scale: 0.001 },
    positionIterations: 6,
    velocityIterations: 4,
    constraintIterations: 2,
  } as Matter.IEngineDefinition);

  const wallThickness = 40;

  const leftWall = Matter.Bodies.rectangle(
    -wallThickness / 2,
    height / 2,
    wallThickness,
    height * 2,
    {
      isStatic: true,
      label: 'wall',
      collisionFilter: { category: CATEGORY.wall, mask: CATEGORY.particle },
    }
  );

  const rightWall = Matter.Bodies.rectangle(
    width + wallThickness / 2,
    height / 2,
    wallThickness,
    height * 2,
    {
      isStatic: true,
      label: 'wall',
      collisionFilter: { category: CATEGORY.wall, mask: CATEGORY.particle },
    }
  );

  Matter.Composite.add(engine.world, [leftWall, rightWall]);

  return { engine, world: engine.world };
}

const FIXED_STEP = 1000 / 60;

export function stepEngine(
  engine: Matter.Engine,
  delta: number,
  afterStep?: () => void
) {
  const clampedDelta = Math.min(delta, FIXED_STEP * 3);
  let remaining = clampedDelta;
  while (remaining >= FIXED_STEP) {
    Matter.Engine.update(engine, FIXED_STEP);
    afterStep?.();
    remaining -= FIXED_STEP;
  }
  if (remaining > 1) {
    Matter.Engine.update(engine, remaining);
    afterStep?.();
  }
}
