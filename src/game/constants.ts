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

export const GAME = {
  gravity: 1.4,
  particleRadius: 4,
  chainDecayTime: 4500,
  chainSegmentLength: 12,
  chainSegmentWidth: 10,
  particleRestitution: 0.6,
  particleFriction: 0,
  bucketWidth: 120,
  bucketHeight: 85,
  bucketWallThickness: 5,
  spawnerWidth: 60,
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

export function getLevelConfig(level: number) {
  const l = Math.min(level, MAX_LEVEL);

  const target = 35 + (l - 1) * 7 + Math.floor(l / 10) * 5;
  const spawnInterval = Math.max(45, Math.round(170 - (l - 1) * 2.8));
  const gravityScale = 1 + (l - 1) * 0.025;

  const staticBarCount = l >= 2 ? Math.min(Math.ceil((l - 1) / 2), 3) : 0;
  const windZoneCount = l >= 4 ? Math.min(Math.ceil((l - 3) / 3), 2) : 0;
  const spinnerCount = l >= 6 ? Math.min(Math.ceil((l - 5) / 2), 3) : 0;
  const movingPlatformCount = l >= 9 ? Math.min(Math.ceil((l - 8) / 2), 3) : 0;

  const blackHoleCount = l >= 12 ? Math.min(Math.ceil((l - 11) / 4), 2) : 0;
  const lavaPoolCount = l >= 16 ? Math.min(Math.ceil((l - 15) / 4), 2) : 0;
  const iceZoneCount = l >= 20 ? Math.min(Math.ceil((l - 19) / 4), 2) : 0;
  const teleporterCount = l >= 25 ? Math.min(Math.ceil((l - 24) / 5), 2) : 0;
  const empPulseCount = l >= 30 ? Math.min(Math.ceil((l - 29) / 4), 2) : 0;
  const gravityFlipperCount = l >= 35 ? Math.min(Math.ceil((l - 34) / 4), 2) : 0;
  const laserGateCount = l >= 40 ? Math.min(Math.ceil((l - 39) / 4), 2) : 0;
  const asteroidCount = l >= 45 ? Math.min(l - 44, 3) : 0;

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
