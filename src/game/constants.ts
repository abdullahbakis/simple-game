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
  gravity: 1.2,
  particleRadius: 4,
  chainDecayTime: 5000,
  chainSegmentLength: 12,
  chainSegmentWidth: 10,
  particleRestitution: 0.6,
  particleFriction: 0,
  bucketWidth: 130,
  bucketHeight: 90,
  bucketWallThickness: 5,
  spawnerWidth: 60,
  trailLength: 8,
  maxParticles: 400,
  failThreshold: 0.10,
  gridSize: 40,
  countdownDuration: 3000,
};

export function getLevelConfig(level: number) {
  const baseTarget = 50;
  const targetIncrease = 30;
  const target = baseTarget + (level - 1) * targetIncrease;

  const baseInterval = 180;
  const minInterval = 40;
  const spawnInterval = Math.max(minInterval, baseInterval - (level - 1) * 16);

  const gravityScale = 1 + (level - 1) * 0.05;

  const staticBarCount = level >= 2 ? Math.min(level - 1, 2) : 0;
  const windZoneCount = level >= 4 ? Math.min(level - 3, 2) : 0;
  const spinnerCount = level >= 6 ? Math.min(level - 5, 3) : 0;
  const movingPlatformCount = level >= 9 ? Math.min(level - 8, 4) : 0;

  const hazards: string[] = [];
  if (staticBarCount > 0) hazards.push('DEFLECTOR BARS');
  if (windZoneCount > 0) hazards.push('WIND ZONES');
  if (spinnerCount > 0) hazards.push('SPINNERS');
  if (movingPlatformCount > 0) hazards.push('MOVING PLATFORMS');

  return {
    level,
    target,
    spawnInterval,
    gravityScale,
    staticBarCount,
    windZoneCount,
    spinnerCount,
    movingPlatformCount,
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
