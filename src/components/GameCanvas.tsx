import { useRef, useEffect, useCallback } from 'react';
import Matter from 'matter-js';
import { createGameEngine, stepEngine } from '../game/engine';
import {
  createSpawner,
  spawnParticle,
  updateTrails,
  findMissedParticles,
  removeParticle,
} from '../game/spawner';
import {
  createDrawingState,
  startFreehand,
  continueFreehand,
  stopFreehand,
  updateChains,
} from '../game/drawing';
import { createBucket, addBucketToWorld, updateBucketPulse } from '../game/bucket';
import { createObstacles, addObstaclesToWorld, updateObstacles, applyWindForces } from '../game/obstacles';
import { createVfxState, spawnCollectionSparks, spawnDrawingSparks, updateVfx } from '../game/vfx';
import { renderFrame, renderCountdown } from '../game/renderer';
import { GAME, getLevelConfig } from '../game/constants';
import type { LevelConfig } from '../game/constants';
import type { Spawner } from '../game/spawner';
import type { DrawingState } from '../game/drawing';
import type { Bucket } from '../game/bucket';
import type { ObstacleState } from '../game/obstacles';
import type { VfxState } from '../game/vfx';

export interface GameStats {
  score: number;
  totalSpawned: number;
  totalMissed: number;
  stability: number;
}

interface GameCanvasProps {
  level: number;
  paused: boolean;
  onStatsChange: (stats: GameStats) => void;
  onLevelComplete: () => void;
  onGameOver: () => void;
  onCountdownTick: (seconds: number) => void;
}

export default function GameCanvas({
  level,
  paused,
  onStatsChange,
  onLevelComplete,
  onGameOver,
  onCountdownTick,
}: GameCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef<{
    engine: Matter.Engine;
    world: Matter.World;
    spawner: Spawner;
    drawing: DrawingState;
    bucket: Bucket;
    obstacles: ObstacleState;
    vfx: VfxState;
    levelConfig: LevelConfig;
    score: number;
    totalMissed: number;
    animFrame: number;
    collectedBodies: Set<number>;
    ended: boolean;
    countdownStart: number;
    spawningStarted: boolean;
    lastDrawSpark: number;
  } | null>(null);

  const cleanup = useCallback(() => {
    if (stateRef.current) {
      cancelAnimationFrame(stateRef.current.animFrame);
      Matter.Engine.clear(stateRef.current.engine);
      Matter.Composite.clear(stateRef.current.world, false);
      stateRef.current = null;
    }
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d')!;
    if (!ctx) return;

    cleanup();

    const width = window.innerWidth;
    const height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    const levelConfig = getLevelConfig(level);
    const { engine, world } = createGameEngine(width, height, levelConfig.gravityScale);
    const spawner = createSpawner(width);
    const drawing = createDrawingState();
    const bucket = createBucket(width, height);
    addBucketToWorld(bucket, world);
    const obstacles = createObstacles(
      levelConfig,
      width,
      height,
      bucket.x + GAME.bucketWidth / 2,
      bucket.y
    );
    addObstaclesToWorld(obstacles, world);
    const vfx = createVfxState();

    const state = {
      engine,
      world,
      spawner,
      drawing,
      bucket,
      obstacles,
      vfx,
      levelConfig,
      score: 0,
      totalMissed: 0,
      animFrame: 0,
      collectedBodies: new Set<number>(),
      ended: false,
      countdownStart: performance.now(),
      spawningStarted: false,
      lastDrawSpark: 0,
    };
    stateRef.current = state;

    Matter.Events.on(engine, 'collisionStart', (event) => {
      if (state.ended) return;

      for (const pair of event.pairs) {
        const { bodyA, bodyB } = pair;

        let collected: Matter.Body | null = null;
        if (bodyA.label === 'collector' && bodyB.label === 'particle') {
          collected = bodyB;
        } else if (bodyB.label === 'collector' && bodyA.label === 'particle') {
          collected = bodyA;
        }

        if (collected && !state.collectedBodies.has(collected.id)) {
          state.collectedBodies.add(collected.id);
          state.score++;
          pushStats();

          const pos = collected.position;
          spawnCollectionSparks(state.vfx, pos.x, pos.y);
          state.bucket.collectPulse = 1;

          const p = state.spawner.particles.find((pp) => pp.body.id === collected!.id);
          if (p) removeParticle(state.spawner, state.world, p);

          if (state.score >= state.levelConfig.target) {
            state.ended = true;
            onLevelComplete();
          }
        }
      }
    });

    function pushStats() {
      const totalSpawned = state.spawner.totalSpawned;
      const stability =
        totalSpawned > 0 ? 1 - state.totalMissed / totalSpawned : 1;
      onStatsChange({
        score: state.score,
        totalSpawned,
        totalMissed: state.totalMissed,
        stability,
      });
    }

    function checkFailure() {
      if (state.ended) return;
      const totalSpawned = state.spawner.totalSpawned;
      if (totalSpawned < 10) return;
      const missRatio = state.totalMissed / totalSpawned;
      if (missRatio > GAME.failThreshold) {
        state.ended = true;
        onGameOver();
      }
    }

    let lastTime = performance.now();
    let lastCountdownSecond = -1;

    function gameLoop(timestamp: number) {
      if (!stateRef.current) return;

      const countdownElapsed = timestamp - state.countdownStart;
      const countdownRemaining = GAME.countdownDuration - countdownElapsed;
      const inCountdown = countdownRemaining > 0;

      if (inCountdown) {
        const sec = Math.ceil(countdownRemaining / 1000);
        if (sec !== lastCountdownSecond) {
          lastCountdownSecond = sec;
          onCountdownTick(sec);
        }
      } else if (!state.spawningStarted) {
        state.spawningStarted = true;
        onCountdownTick(0);
      }

      if (state.ended) {
        renderFrame(
          { ctx, width, height, now: timestamp },
          state.spawner,
          state.drawing,
          state.bucket,
          state.obstacles,
          state.vfx
        );
        return;
      }

      const delta = Math.min(timestamp - lastTime, 32);
      lastTime = timestamp;

      stepEngine(state.engine, delta);

      if (state.spawningStarted && !state.ended) {
        spawnParticle(state.spawner, state.world, timestamp, state.levelConfig);
      }

      updateTrails(state.spawner);
      updateChains(state.drawing, state.world, timestamp);
      updateBucketPulse(state.bucket, delta);
      updateObstacles(state.obstacles, timestamp, delta);
      applyWindForces(state.obstacles, state.spawner.particles);
      updateVfx(state.vfx, delta);

      const missed = findMissedParticles(state.spawner, height);
      for (const p of missed) {
        if (!state.collectedBodies.has(p.body.id)) {
          state.totalMissed++;
        }
        removeParticle(state.spawner, state.world, p);
      }
      if (missed.length > 0) {
        pushStats();
        checkFailure();
      }

      renderFrame(
        { ctx, width, height, now: timestamp },
        state.spawner,
        state.drawing,
        state.bucket,
        state.obstacles,
        state.vfx
      );

      if (inCountdown) {
        renderCountdown(ctx, width, height, countdownRemaining / 1000);
      }

      state.animFrame = requestAnimationFrame(gameLoop);
    }

    state.animFrame = requestAnimationFrame(gameLoop);

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cleanup();
    };
  }, [level, paused, cleanup, onStatsChange, onLevelComplete, onGameOver, onCountdownTick]);

  const getCanvasCoords = useCallback((e: React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  }, []);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (paused) return;
      const { x, y } = getCanvasCoords(e);
      if (stateRef.current && !stateRef.current.ended) {
        startFreehand(stateRef.current.drawing, x, y);
      }
    },
    [paused, getCanvasCoords]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      const { x, y } = getCanvasCoords(e);
      if (stateRef.current && stateRef.current.drawing.isDrawing) {
        continueFreehand(
          stateRef.current.drawing,
          stateRef.current.world,
          x,
          y,
          performance.now()
        );

        const now = performance.now();
        if (now - stateRef.current.lastDrawSpark > 40) {
          stateRef.current.lastDrawSpark = now;
          spawnDrawingSparks(stateRef.current.vfx, x, y);
        }
      }
    },
    [getCanvasCoords]
  );

  const handleMouseUp = useCallback(() => {
    if (stateRef.current) {
      stopFreehand(stateRef.current.drawing);
    }
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="block w-full h-full cursor-crosshair"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    />
  );
}
