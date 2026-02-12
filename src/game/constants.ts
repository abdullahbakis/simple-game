export const MAX_LEVEL = 50;

export const CANDY_PALETTE = ['#FF6B9D', '#00D4FF', '#7FFF00', '#FFD93D', '#FF8C42', '#FF6B6B'] as const;

export const CANDY_RGB: readonly [number, number, number][] = [
  [255, 107, 157],
  [0, 212, 255],
  [127, 255, 0],
  [255, 217, 61],
  [255, 140, 66],
  [255, 107, 107],
];

// Mevcut ekran genişliğine göre bir ölçek faktörü belirleyelim (800px baz alınmıştır)
const screenScale = Math.min(window.innerWidth / 800, 1);

export const GAME = {
  gravity: 1.4,
  particleRadius: 7 * screenScale, // Şekerleri küçült
  chainDecayTime: 4500,
  chainSegmentLength: 8,
  chainSegmentWidth: 18 * screenScale, // Çizgileri incelt
  maxParticleSpeed: 12,
  particleRestitution: 0.6,
  particleFriction: 0,
  bucketWidth: 120 * screenScale, // Sepeti küçült
  bucketHeight: 85 * screenScale, // Sepeti küçült
  bucketWallThickness: 5,
  spawnerWidth: 60 * screenScale,
  trailLength: 8,
  maxParticles: 400,
  failThreshold: 0.08,
  gridSize: 40,
  countdownDuration: 3000,
};

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
  const spawnInterval = Math.max(45, Math.round(170 - (l - 1) * 2.8));
  const gravityScale = 1 + (l - 1) * 0.025;

  const staticBarCount = hazardLifecycle(l, 2, 4, 8, 3);
  const windZoneCount = hazardLifecycle(l, 4, 7, 12, 2);
  const spinnerCount = hazardLifecycle(l, 6, 9, 15, 3);
  const movingPlatformCount = hazardLifecycle(l, 9, 13, 19, 3);

  const blackHoleCount = hazardLifecycle(l, 12, 16, 23, 2);
  const lavaPoolCount = hazardLifecycle(l, 16, 20, 27, 2);
  const iceZoneCount = hazardLifecycle(l, 20, 24, 31, 2);
  const teleporterCount = hazardLifecycle(l, 25, 29, 36, 2);
  const empPulseCount = hazardLifecycle(l, 30, 34, 41, 2);
  const gravityFlipperCount = hazardLifecycle(l, 35, 39, 46, 2);
  const laserGateCount = hazardLifecycle(l, 40, 44, 55, 2);
  const asteroidCount = hazardLifecycle(l, 45, 50, 50, 3);

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
