import { useRef, useEffect, useCallback } from 'react';
import Matter from 'matter-js';
import { createGameEngine, stepEngine } from '../game/engine';
import {
  createSpawner,
  spawnParticle,
  updateTrails,
  findMissedParticles,
  removeParticle,
  clampParticleVelocities,
  handleStuckParticles,
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
import {
  createHazards,
  addHazardsToWorld,
  updateHazards,
  applyHazardForces,
  applyTeleporters,
  findHazardKills,
  cleanupTeleporterCooldowns,
} from '../game/hazards';
import { createVfxState, spawnCollectionSparks, spawnDrawingSparks, spawnHazardKillSparks, spawnMissSparks, updateVfx } from '../game/vfx';
import { renderFrame, renderCountdown } from '../game/renderer';
import { GAME, getLevelConfig } from '../game/constants';
import { initSpriteCache } from '../game/sprite-cache';
import { tickPerformance } from '../game/performance';
import { clearParticlePool } from '../game/particle-pool';
import { playCollect, playMiss, playHazardKill, playCountdownTick, playCountdownGo, playDraw, resumeAudio } from '../game/audio';
import type { LevelConfig } from '../game/constants';
import type { Spawner } from '../game/spawner';
import type { DrawingState } from '../game/drawing';
import type { Bucket } from '../game/bucket';
import type { ObstacleState } from '../game/obstacles';
import type { HazardState } from '../game/hazards';
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
  skinId: string;
  onStatsChange: (stats: GameStats) => void;
  onLevelComplete: () => void;
  onGameOver: () => void;
  onCountdownTick: (seconds: number) => void;
}

export default function GameCanvas({
  level,
  paused,
  skinId,
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
    hazards: HazardState;
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
      clearParticlePool();
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
    const bucket = createBucket(width, height, level);
    addBucketToWorld(bucket, world);
    const obstacles = createObstacles(
      levelConfig,
      width,
      height,
      bucket.x + GAME.bucketWidth / 2,
      bucket.y
    );
    addObstaclesToWorld(obstacles, world);
    const hazards = createHazards(
      levelConfig,
      width,
      height,
      bucket.x + GAME.bucketWidth / 2,
      bucket.y
    );
    addHazardsToWorld(hazards, world);
    const vfx = createVfxState();

    initSpriteCache();

    const state = {
      engine,
      world,
      spawner,
      drawing,
      bucket,
      obstacles,
      hazards,
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

    const CHAIN_COLLISION_MAX_SPEED = GAME.maxParticleSpeed * 0.5;
    function clampChainCollision(event: Matter.IEventCollision<Matter.Engine>) {
      for (const pair of event.pairs) {
        const { bodyA, bodyB } = pair;
        let particle: Matter.Body | null = null;
        if (bodyA.label === 'particle' && bodyB.label === 'chain') particle = bodyA;
        else if (bodyB.label === 'particle' && bodyA.label === 'chain') particle = bodyB;
        if (particle) {
          const vx = particle.velocity.x;
          const vy = particle.velocity.y;
          const speed = Math.sqrt(vx * vx + vy * vy);
          if (speed > CHAIN_COLLISION_MAX_SPEED) {
            const scale = CHAIN_COLLISION_MAX_SPEED / speed;
            Matter.Body.setVelocity(particle, { x: vx * scale, y: vy * scale });
          }
        }
      }
    }
    Matter.Events.on(engine, 'collisionStart', clampChainCollision);
    Matter.Events.on(engine, 'collisionActive', clampChainCollision);

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
          playCollect();

          const p = state.spawner.particles.find((pp) => pp.body.id === collected!.id);
          state.collectedBodies.delete(collected.id);
          if (p) {
            removeParticle(state.spawner, state.world, p);
          }

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

      tickPerformance(timestamp);

      const countdownElapsed = timestamp - state.countdownStart;
      const countdownRemaining = GAME.countdownDuration - countdownElapsed;
      const inCountdown = countdownRemaining > 0;

      if (inCountdown) {
        const sec = Math.ceil(countdownRemaining / 1000);
        if (sec !== lastCountdownSecond) {
          lastCountdownSecond = sec;
          onCountdownTick(sec);
          playCountdownTick();
        }
      } else if (!state.spawningStarted) {
        state.spawningStarted = true;
        onCountdownTick(0);
        playCountdownGo();
      }

      if (state.ended) {
        renderFrame(
          { ctx, width, height, now: timestamp },
          state.spawner,
          state.drawing,
          state.bucket,
          state.obstacles,
          state.hazards,
          state.vfx,
          level,
          skinId
        );
        state.animFrame = requestAnimationFrame(gameLoop);
        return;
      }

      const delta = Math.min(timestamp - lastTime, 32);
      lastTime = timestamp;

      stepEngine(state.engine, delta, () => {
        clampParticleVelocities(state.spawner, GAME.maxParticleSpeed);
      });

      if (state.spawningStarted && !state.ended) {
        spawnParticle(state.spawner, state.world, timestamp, state.levelConfig);
      }

      updateTrails(state.spawner);
      updateChains(state.drawing, state.world, timestamp);
      updateBucketPulse(state.bucket, delta);
      updateObstacles(state.obstacles, timestamp, delta);
      applyWindForces(state.obstacles, state.spawner.particles);

      updateHazards(state.hazards, timestamp, delta, width, height);
      applyHazardForces(state.hazards, state.spawner.particles);
      applyTeleporters(state.hazards, state.spawner.particles, timestamp);
      clampParticleVelocities(state.spawner, GAME.maxParticleSpeed);

      const hazardKills = findHazardKills(state.hazards, state.spawner.particles);
      for (const p of hazardKills) {
        if (!state.collectedBodies.has(p.body.id)) {
          state.totalMissed++;
          const pos = p.body.position;
          spawnHazardKillSparks(state.vfx, pos.x, pos.y, 255, 80, 40);
          playHazardKill();
        }
        state.collectedBodies.delete(p.body.id);
        removeParticle(state.spawner, state.world, p);
      }
      if (hazardKills.length > 0) {
        pushStats();
        checkFailure();
      }

      const stuckRemoved = handleStuckParticles(state.spawner, state.world, timestamp);
      for (const p of stuckRemoved) {
        state.collectedBodies.delete(p.body.id);
        removeParticle(state.spawner, state.world, p);
      }

      const activeIds = new Set(state.spawner.particles.map(p => p.body.id));
      cleanupTeleporterCooldowns(state.hazards, activeIds);

      updateVfx(state.vfx, delta);

      const missed = findMissedParticles(state.spawner, height, width);
      for (const p of missed) {
        if (!state.collectedBodies.has(p.body.id)) {
          state.totalMissed++;
          spawnMissSparks(state.vfx, p.body.position.x, height - 15);
          playMiss();
        }
        state.collectedBodies.delete(p.body.id);
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
        state.hazards,
        state.vfx,
        level,
        skinId
      );

      if (inCountdown) {
        renderCountdown(ctx, width, height, countdownRemaining / 1000);
      }

      state.animFrame = requestAnimationFrame(gameLoop);
    }

    state.animFrame = requestAnimationFrame(gameLoop);

    return () => {
      cleanup();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [level, cleanup]);

  const getCanvasCoords = useCallback((clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
    };
  }, []);

  const handlePointerDown = useCallback(
    (clientX: number, clientY: number) => {
      resumeAudio();
      if (paused) return;
      const { x, y } = getCanvasCoords(clientX, clientY);
      if (stateRef.current && !stateRef.current.ended && stateRef.current.spawningStarted) {
        startFreehand(stateRef.current.drawing, x, y);
      }
    },
    [paused, getCanvasCoords]
  );

  const handlePointerMove = useCallback(
    (clientX: number, clientY: number) => {
      const { x, y } = getCanvasCoords(clientX, clientY);
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
          playDraw();
        }
      }
    },
    [getCanvasCoords]
  );

  const handlePointerUp = useCallback(() => {
    if (stateRef.current) {
      stopFreehand(stateRef.current.drawing, stateRef.current.world);
    }
  }, []);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => handlePointerDown(e.clientX, e.clientY),
    [handlePointerDown]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => handlePointerMove(e.clientX, e.clientY),
    [handlePointerMove]
  );

  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      e.preventDefault();
      const touch = e.touches[0];
      if (touch) handlePointerDown(touch.clientX, touch.clientY);
    },
    [handlePointerDown]
  );

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      e.preventDefault();
      const touch = e.touches[0];
      if (touch) handlePointerMove(touch.clientX, touch.clientY);
    },
    [handlePointerMove]
  );

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      e.preventDefault();
      handlePointerUp();
    },
    [handlePointerUp]
  );

  return (
    <canvas
      ref={canvasRef}
      className="block w-full h-full cursor-crosshair touch-none"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handlePointerUp}
      onMouseLeave={handlePointerUp}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
    />
  );
}
