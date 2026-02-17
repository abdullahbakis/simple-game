export const MAX_LEVEL = 100;

export const CANDY_PALETTE = ['#FF6B9D', '#00D4FF', '#7FFF00', '#FFD93D', '#FF8C42', '#FF6B6B'] as const;

export const CANDY_RGB: readonly [number, number, number][] = [
  [255, 107, 157],
  [0, 212, 255],
  [127, 255, 0],
  [255, 217, 61],
  [255, 140, 66],
  [255, 107, 107],
];

export const screenScale = Math.min(window.innerWidth / 800, 1);

export const isMobile =
  /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
  window.innerWidth < 768 ||
  (('ontouchstart' in window || navigator.maxTouchPoints > 0) && window.innerWidth < 1024);

export const GAME = {
  gravity: 0.6 * screenScale,
  particleRadius: 7 * screenScale,
  chainDecayTime: 4500,
  chainSegmentLength: 8,
  chainSegmentWidth: 18 * screenScale,
  maxParticleSpeed: 12 * screenScale,
  particleRestitution: 0.6,
  particleFriction: 0,
  bucketWidth: 120 * screenScale,
  bucketHeight: 85 * screenScale,
  bucketWallThickness: 5,
  spawnerWidth: 60 * screenScale,
  trailLength: 8,
  maxParticles: 400,
  failThreshold: 0.08,
  gridSize: 40,
  countdownDuration: 3000,
};

export const MAX_GRAVITY = 1 + 39 * 0.015 + 30 * 0.01;

export interface RenderContext {
  ctx: CanvasRenderingContext2D;
  width: number;
  height: number;
  now: number;
}

function hazardLifecycle(level: number, start: number, peak: number, end: number, maxCount: number): number {
  if (level < start || level > end) return 0;
  if (level <= peak) {
    if (peak === start) return maxCount;
    const progress = (level - start) / (peak - start);
    return Math.max(1, Math.ceil(progress * maxCount));
  }
  if (end === peak) return maxCount;
  const progress = (level - peak) / (end - peak);
  return Math.max(0, Math.round(maxCount * (1 - progress)));
}

export function getLevelConfig(level: number) {
  const l = Math.min(level, MAX_LEVEL);

  const target = 35 + (l - 1) * 7 + Math.floor(l / 10) * 5;
  const spawnLevel = Math.min(l, 80);
  const spawnInterval = Math.max(45, Math.round(170 - (spawnLevel - 1) * 2.8));

  let gravityScale: number;
  if (l <= 40) {
    gravityScale = 1 + (l - 1) * 0.015;
  } else if (l <= 70) {
    gravityScale = 1 + 39 * 0.015 + (l - 40) * 0.01;
  } else {
    gravityScale = MAX_GRAVITY;
  }

  const staticBarCount = hazardLifecycle(l, 2, 4, 8, 3);
  const windZoneCount = hazardLifecycle(l, 4, 7, 12, 2);
  const spinnerCount = hazardLifecycle(l, 7, 10, 15, 3);
  const movingPlatformCount = hazardLifecycle(l, 10, 14, 19, 3);

  let blackHoleCount = hazardLifecycle(l, 12, 16, 22, 2);
  const lavaPoolCount = hazardLifecycle(l, 16, 20, 26, 2);
  let iceZoneCount = hazardLifecycle(l, 20, 24, 30, 2);
  const teleporterCount = hazardLifecycle(l, 25, 29, 35, 2);
  const empPulseCount = hazardLifecycle(l, 30, 34, 40, 2);
  const gravityFlipperCount = hazardLifecycle(l, 35, 39, 45, 2);
  let laserGateCount = hazardLifecycle(l, 40, 44, 50, 2);
  const asteroidCount = hazardLifecycle(l, 45, 49, 55, 3);

  let teslaCoilCount = hazardLifecycle(l, 50, 54, 60, 2);
  let repulsorFieldCount = hazardLifecycle(l, 55, 60, 67, 2);
  const phaseWallCount = hazardLifecycle(l, 60, 65, 72, 2);
  const magneticCoreCount = hazardLifecycle(l, 65, 70, 77, 2);
  const bumperOrbCount = hazardLifecycle(l, 70, 75, 82, 2);
  let solarFlareCount = hazardLifecycle(l, 75, 80, 87, 2);
  let slowMoFieldCount = hazardLifecycle(l, 80, 86, 95, 2);
  let voidZoneCount = hazardLifecycle(l, 90, 96, 105, 2);

  if (l >= 90) {
    slowMoFieldCount = 0;
    blackHoleCount = 0;
    iceZoneCount = 0;
    teslaCoilCount = 0;
    solarFlareCount = 0;
    repulsorFieldCount = 0;
    laserGateCount = 0;

    if (l === 100) {
      voidZoneCount = 4;
    } else if (l >= 97) {
      voidZoneCount = 2;
      repulsorFieldCount = 1;
      laserGateCount = 2;
    } else if (l >= 94) {
      voidZoneCount = 1;
      iceZoneCount = 2;
      solarFlareCount = 1;
    } else {
      voidZoneCount = 1;
      blackHoleCount = 2;
      teslaCoilCount = 1;
    }
  }

  const hazards: string[] = [];
  if (staticBarCount > 0) hazards.push('DEFLECTOR BARS');
  if (windZoneCount > 0) hazards.push('WIND ZONES');
  if (spinnerCount > 0) hazards.push('SPINNERS');
  if (movingPlatformCount > 0) hazards.push('MOVING PLATFORMS');
  if (blackHoleCount > 0) hazards.push('BLACK HOLES');
  if (lavaPoolCount > 0) hazards.push('LAVA POOLS');
  if (iceZoneCount > 0) hazards.push('ICE ZONES');
  if (teleporterCount > 0) hazards.push('TELEPORTERS');
  if (empPulseCount > 0) hazards.push('EMP PULSES');
  if (gravityFlipperCount > 0) hazards.push('GRAVITY FLIPPERS');
  if (laserGateCount > 0) hazards.push('LASER GATES');
  if (asteroidCount > 0) hazards.push('ASTEROIDS');
  if (teslaCoilCount > 0) hazards.push('TESLA COILS');
  if (repulsorFieldCount > 0) hazards.push('REPULSOR FIELDS');
  if (phaseWallCount > 0) hazards.push('PHASE WALLS');
  if (magneticCoreCount > 0) hazards.push('MAGNETIC CORES');
  if (bumperOrbCount > 0) hazards.push('BUMPER ORBS');
  if (solarFlareCount > 0) hazards.push('SOLAR FLARES');
  if (slowMoFieldCount > 0) hazards.push('SLOW-MO FIELDS');
  if (voidZoneCount > 0) hazards.push('THE VOID');

  return {
    level: l,
    target,
    spawnInterval,
    gravityScale,
    staticBarCount,
    windZoneCount,
    spinnerCount,
    movingPlatformCount,
    blackHoleCount,
    lavaPoolCount,
    iceZoneCount,
    teleporterCount,
    empPulseCount,
    gravityFlipperCount,
    laserGateCount,
    asteroidCount,
    teslaCoilCount,
    repulsorFieldCount,
    phaseWallCount,
    magneticCoreCount,
    bumperOrbCount,
    solarFlareCount,
    slowMoFieldCount,
    voidZoneCount,
    hazards,
  };
}

export type LevelConfig = ReturnType<typeof getLevelConfig>;

export const CATEGORY = {
  particle: 0x0001,
  wall: 0x0002,
  chain: 0x0004,
  bucket: 0x0008,
  sensor: 0x0010,
  obstacle: 0x0020,
};
