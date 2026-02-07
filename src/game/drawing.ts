import Matter from 'matter-js';
import { GAME, CATEGORY } from './constants';

export interface ChainSegment {
  body: Matter.Body;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  createdAt: number;
  opacity: number;
}

export interface DrawingState {
  isDrawing: boolean;
  lastX: number;
  lastY: number;
  segments: ChainSegment[];
}

export function createDrawingState(): DrawingState {
  return {
    isDrawing: false,
    lastX: 0,
    lastY: 0,
    segments: [],
  };
}

export function startFreehand(state: DrawingState, x: number, y: number) {
  state.isDrawing = true;
  state.lastX = x;
  state.lastY = y;
}

export function continueFreehand(
  state: DrawingState,
  world: Matter.World,
  x: number,
  y: number,
  now: number
) {
  if (!state.isDrawing) return;

  const dx = x - state.lastX;
  const dy = y - state.lastY;
  const dist = Math.sqrt(dx * dx + dy * dy);

  if (dist < GAME.chainSegmentLength) return;

  const cx = (state.lastX + x) / 2;
  const cy = (state.lastY + y) / 2;
  const angle = Math.atan2(dy, dx);

  const body = Matter.Bodies.rectangle(cx, cy, dist, GAME.chainSegmentWidth, {
    isStatic: true,
    angle,
    label: 'chain',
    collisionFilter: {
      category: CATEGORY.chain,
      mask: CATEGORY.particle,
    },
    restitution: 0.4,
    friction: 0,
    frictionStatic: 0,
  });

  Matter.Composite.add(world, body);

  state.segments.push({
    body,
    x1: state.lastX,
    y1: state.lastY,
    x2: x,
    y2: y,
    createdAt: now,
    opacity: 1,
  });

  state.lastX = x;
  state.lastY = y;
}

export function stopFreehand(state: DrawingState) {
  state.isDrawing = false;
}

export function updateChains(
  state: DrawingState,
  world: Matter.World,
  now: number
) {
  const toRemove: number[] = [];
  const fadeStart = GAME.chainDecayTime * 0.6;

  for (let i = 0; i < state.segments.length; i++) {
    const seg = state.segments[i];
    const age = now - seg.createdAt;

    if (age >= GAME.chainDecayTime) {
      Matter.Composite.remove(world, seg.body);
      toRemove.push(i);
    } else if (age > fadeStart) {
      seg.opacity = 1 - (age - fadeStart) / (GAME.chainDecayTime - fadeStart);
    }
  }

  for (let i = toRemove.length - 1; i >= 0; i--) {
    state.segments.splice(toRemove[i], 1);
  }
}
