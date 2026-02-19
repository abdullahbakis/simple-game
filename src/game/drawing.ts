import Matter from 'matter-js';
import { GAME, CATEGORY } from './constants';

export interface ChainSegment {
  body: Matter.Body | null;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  createdAt: number;
  opacity: number;
  strokeId: number;
}

interface StrokeGroup {
  bodies: Matter.Body[];
  liveCount: number;
  expireAt: number;
}

export interface DrawingState {
  isDrawing: boolean;
  lastX: number;
  lastY: number;
  segments: ChainSegment[];
  strokes: Map<number, StrokeGroup>;
  currentStrokeId: number;
  _nextId: number;
}

export function createDrawingState(): DrawingState {
  return {
    isDrawing: false,
    lastX: 0,
    lastY: 0,
    segments: [],
    strokes: new Map(),
    currentStrokeId: 0,
    _nextId: 1,
  };
}

export function startFreehand(state: DrawingState, x: number, y: number) {
  state.isDrawing = true;
  state.lastX = x;
  state.lastY = y;
  state.currentStrokeId = state._nextId++;
}

function makeSegmentBody(
  world: Matter.World,
  x1: number,
  y1: number,
  x2: number,
  y2: number
): Matter.Body {
  const cx = (x1 + x2) / 2;
  const cy = (y1 + y2) / 2;
  const dx = x2 - x1;
  const dy = y2 - y1;
  const dist = Math.sqrt(dx * dx + dy * dy);
  const angle = Math.atan2(dy, dx);

  const body = Matter.Bodies.rectangle(cx, cy, dist, GAME.chainSegmentWidth, {
    isStatic: true,
    angle,
    label: 'chain',
    collisionFilter: {
      category: CATEGORY.chain,
      mask: CATEGORY.particle,
    },
    restitution: 0.1,
    friction: 0.05,
    frictionStatic: 0,
    slop: 1.5,
  } as Matter.IChamferableBodyDefinition);

  Matter.Composite.add(world, body);
  return body;
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

  const body = makeSegmentBody(world, state.lastX, state.lastY, x, y);

  state.segments.push({
    body,
    x1: state.lastX,
    y1: state.lastY,
    x2: x,
    y2: y,
    createdAt: now,
    opacity: 1,
    strokeId: state.currentStrokeId,
  });

  state.lastX = x;
  state.lastY = y;
}

function perpendicularDist(
  p: { x: number; y: number },
  a: { x: number; y: number },
  b: { x: number; y: number }
): number {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const len = Math.sqrt(dx * dx + dy * dy);
  if (len === 0) return Math.sqrt((p.x - a.x) ** 2 + (p.y - a.y) ** 2);
  return Math.abs((p.x - a.x) * dy - (p.y - a.y) * dx) / len;
}

function rdpSimplify(
  pts: { x: number; y: number }[],
  epsilon: number
): { x: number; y: number }[] {
  if (pts.length < 3) return pts;

  let dmax = 0;
  let idx = 0;
  const end = pts.length - 1;

  for (let i = 1; i < end; i++) {
    const d = perpendicularDist(pts[i], pts[0], pts[end]);
    if (d > dmax) {
      dmax = d;
      idx = i;
    }
  }

  if (dmax > epsilon) {
    const r1 = rdpSimplify(pts.slice(0, idx + 1), epsilon);
    const r2 = rdpSimplify(pts.slice(idx), epsilon);
    return [...r1.slice(0, -1), ...r2];
  }
  return [pts[0], pts[end]];
}

function consolidateStroke(
  state: DrawingState,
  world: Matter.World,
  strokeId: number
) {
  const segs = state.segments.filter((s) => s.strokeId === strokeId);
  if (segs.length === 0) return;

  const points: { x: number; y: number }[] = [{ x: segs[0].x1, y: segs[0].y1 }];
  for (const seg of segs) points.push({ x: seg.x2, y: seg.y2 });

  const simplified = rdpSimplify(points, 8);

  let earliestCreatedAt = segs[0].createdAt;
  for (const seg of segs) {
    if (seg.createdAt < earliestCreatedAt) earliestCreatedAt = seg.createdAt;
    if (seg.body) {
      Matter.Composite.remove(world, seg.body);
      seg.body = null;
    }
  }

  const newBodies: Matter.Body[] = [];
  for (let i = 0; i < simplified.length - 1; i++) {
    const body = makeSegmentBody(
      world,
      simplified[i].x,
      simplified[i].y,
      simplified[i + 1].x,
      simplified[i + 1].y
    );
    newBodies.push(body);
  }

  state.strokes.set(strokeId, {
    bodies: newBodies,
    liveCount: segs.length,
    expireAt: earliestCreatedAt + GAME.chainDecayTime,
  });
}

export function stopFreehand(state: DrawingState, world: Matter.World) {
  if (!state.isDrawing) return;
  state.isDrawing = false;
  consolidateStroke(state, world, state.currentStrokeId);
}

export function updateChains(
  state: DrawingState,
  world: Matter.World,
  now: number
) {
  const toRemove: number[] = [];
  const fadeStart = GAME.chainDecayTime * 0.8;

  const strokeBodyRemoveAt = GAME.chainDecayTime * 0.95;

  for (const [strokeId, stroke] of state.strokes) {
    if (stroke.bodies.length > 0) {
      const age = now - (stroke.expireAt - GAME.chainDecayTime);
      if (age >= strokeBodyRemoveAt) {
        for (const b of stroke.bodies) {
          Matter.Composite.remove(world, b);
        }
        stroke.bodies.length = 0;
      }
    }
    if (now >= stroke.expireAt) {
      state.strokes.delete(strokeId);
    }
  }

  const bodyRemoveAt = GAME.chainDecayTime * 0.85;

  for (let i = 0; i < state.segments.length; i++) {
    const seg = state.segments[i];
    const age = now - seg.createdAt;

    if (age >= GAME.chainDecayTime) {
      toRemove.push(i);
    } else if (age > fadeStart) {
      seg.opacity = 1 - (age - fadeStart) / (GAME.chainDecayTime - fadeStart);
      if (age >= bodyRemoveAt && seg.body) {
        Matter.Composite.remove(world, seg.body);
        seg.body = null;
      }
    }
  }

  for (let i = toRemove.length - 1; i >= 0; i--) {
    state.segments.splice(toRemove[i], 1);
  }
}
