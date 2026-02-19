import { GAME, CANDY_RGB } from './constants';
import type { RenderContext } from './constants';
import type { Spawner } from './spawner';
import type { DrawingState } from './drawing';
import type { Bucket } from './bucket';
import type { ObstacleState } from './obstacles';
import type { HazardState } from './hazards';
import type { VfxState } from './vfx';
import { renderHazards } from './hazards-renderer';
import { renderBackground } from './backgrounds';
import { getBallSprite, getSpriteOffset } from './sprite-cache';
import { getTrailLimit, applyShadowContext, clearShadowContext } from './performance';

export function renderFrame(
  rc: RenderContext,
  spawner: Spawner,
  drawing: DrawingState,
  bucket: Bucket,
  obstacles: ObstacleState,
  hazards: HazardState,
  vfx: VfxState,
  level: number = 1,
  skinId: string = 'rainbow'
) {
  const { ctx, width, height } = rc;

  applyShadowContext(ctx);

  ctx.clearRect(0, 0, width, height);
  renderBackground(rc, level);
  renderDeathZone(ctx, width, height);
  renderWindZones(rc, obstacles);
  renderStaticBars(rc, obstacles);
  renderSpinners(rc, obstacles);
  renderMovingPlatforms(rc, obstacles);
  renderHazards(rc, hazards);
  renderFunnelCollector(rc, bucket);
  renderCandyRibbons(ctx, drawing, rc.now, skinId);
  renderSkinEffects(ctx, drawing, rc.now, skinId);
  renderCandyBalls(ctx, spawner);
  renderSpawner(ctx, spawner, rc.now);
  renderVfx(ctx, vfx);

  clearShadowContext(ctx);
}

function renderDeathZone(ctx: CanvasRenderingContext2D, w: number, h: number) {
  const gradient = ctx.createLinearGradient(0, h - 30, 0, h);
  gradient.addColorStop(0, 'transparent');
  gradient.addColorStop(1, 'rgba(255, 50, 50, 0.25)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, h - 30, w, 30);
}

function renderCandyBalls(ctx: CanvasRenderingContext2D, spawner: Spawner) {
  const trailLimit = getTrailLimit();
  const vr = GAME.particleRadius * 1.8;
  const off = getSpriteOffset();

  for (const p of spawner.particles) {
    const ci = p.colorIdx % CANDY_RGB.length;
    const [cr, cg, cb] = CANDY_RGB[ci];
    const px = p.body.position.x;
    const py = p.body.position.y;

    const vx = p.body.velocity.x;
    const vy = p.body.velocity.y;
    const speed = Math.sqrt(vx * vx + vy * vy);
    if (speed > 1.5) {
      const len = Math.min(p.trail.length, trailLimit);
      for (let i = len - 1; i >= 0; i--) {
        const t = p.trail[i];
        const frac = (len - i) / len;
        const alpha = frac * 0.35 * Math.min(speed / 5, 1);
        const rad = vr * (1 - i * 0.1);
        ctx.beginPath();
        ctx.arc(t.x, t.y, Math.max(rad, 1), 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${cr},${cg},${cb},${alpha})`;
        ctx.fill();
      }
    }

    ctx.drawImage(getBallSprite(ci), px - off, py - off);
  }
}

function getSkinColors(skinId: string, now: number, x: number, y: number): { hue: number; sat: number; light: number } {
  const pos = x * 0.5 + y * 0.3;
  switch (skinId) {
    case 'gold': return { hue: 45, sat: 90, light: 60 };
    case 'neon-blue': return { hue: 200, sat: 100, light: 60 };
    case 'fire': return { hue: (15 + Math.sin(now * 0.01 + pos * 0.01) * 15), sat: 95, light: 55 };
    case 'ice': return { hue: 195, sat: 70, light: 75 };
    case 'matrix': return { hue: 120, sat: 100, light: 50 };
    case 'slime': return { hue: (90 + Math.sin(now * 0.005 + pos * 0.01) * 20), sat: 80, light: 55 };
    case 'bubble': return { hue: (200 + Math.sin(now * 0.003 + pos * 0.02) * 30), sat: 60, light: 75 };
    case 'void': return { hue: 260, sat: 20, light: 25 };
    case 'electric': return { hue: 185, sat: 100, light: 70 };
    case 'love': return { hue: (340 + Math.sin(now * 0.004 + pos * 0.01) * 15), sat: 85, light: 60 };
    case 'starry': return { hue: (60 + Math.sin(now * 0.002 + pos * 0.03) * 40), sat: 30, light: 85 };
    case 'glitch': return { hue: (now * 0.5 + Math.random() * 60) % 360, sat: 100, light: 60 };
    case 'toxic': return { hue: (85 + Math.sin(now * 0.008 + pos * 0.01) * 15), sat: 90, light: 50 };
    case 'plasma': return { hue: (310 + Math.sin(now * 0.01 + pos * 0.02) * 25), sat: 100, light: 60 };
    case 'rgb': return { hue: (now * 0.2 + pos * 0.5) % 360, sat: 100, light: 55 };
    case 'cosmic-emperor': {
      const cycle = (now * 0.08 + pos * 0.3) % 360;
      const shimmer = Math.sin(now * 0.005 + pos * 0.02) * 15;
      return { hue: cycle, sat: 85 + shimmer, light: 65 + Math.sin(now * 0.01 + pos * 0.05) * 10 };
    }
    default: return { hue: (now * 0.05 + pos) % 360, sat: 90, light: 70 };
  }
}

function renderCandyRibbons(ctx: CanvasRenderingContext2D, drawing: DrawingState, now: number, skinId: string) {
  if (drawing.segments.length === 0) return;

  const isMatrix = skinId === 'matrix';
  const isGlitch = skinId === 'glitch';

  for (const seg of drawing.segments) {
    ctx.save();
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    let opacity = seg.opacity;
    let lineW = 6;

    if (isMatrix) {
      opacity *= 0.6 + Math.sin(now * 0.02 + seg.x1 * 0.1) * 0.4;
      lineW = 4 + Math.sin(now * 0.015 + seg.y1 * 0.08) * 3;
    } else if (isGlitch) {
      opacity *= Math.random() > 0.15 ? 1 : 0.2;
      lineW = 3 + Math.random() * 6;
    }

    ctx.globalAlpha = opacity;
    const { hue, sat, light } = getSkinColors(skinId, now, seg.x1, seg.y1);

    ctx.shadowColor = `hsla(${hue}, ${sat}%, ${light}%, 0.6)`;
    ctx.shadowBlur = 2;
    ctx.lineWidth = lineW;
    ctx.strokeStyle = `hsla(${hue}, ${sat}%, ${light}%, 0.9)`;
    ctx.beginPath();
    ctx.moveTo(seg.x1, seg.y1);
    ctx.lineTo(seg.x2, seg.y2);
    ctx.stroke();

    ctx.shadowBlur = 0;
    ctx.lineWidth = 2;
    ctx.strokeStyle = `hsla(${hue}, ${Math.min(sat + 10, 100)}%, ${Math.min(light + 18, 95)}%, 0.7)`;
    ctx.beginPath();
    ctx.moveTo(seg.x1, seg.y1);
    ctx.lineTo(seg.x2, seg.y2);
    ctx.stroke();

    ctx.restore();
  }
}

type SkinEffectType = 'fire' | 'ice' | 'electric' | 'slime' | 'stars' | 'cosmic' | null;

function getSkinEffectType(skinId: string): SkinEffectType {
  switch (skinId) {
    case 'fire': return 'fire';
    case 'ice': return 'ice';
    case 'electric': return 'electric';
    case 'slime':
    case 'toxic': return 'slime';
    case 'gold':
    case 'starry': return 'stars';
    case 'cosmic-emperor': return 'cosmic';
    default: return null;
  }
}

function renderSkinEffects(ctx: CanvasRenderingContext2D, drawing: DrawingState, now: number, skinId: string) {
  if (drawing.segments.length === 0) return;
  const effectType = getSkinEffectType(skinId);
  if (!effectType) return;

  ctx.save();

  const step = Math.max(3, Math.floor(drawing.segments.length / 60));
  for (let i = 0; i < drawing.segments.length; i += step) {
    const seg = drawing.segments[i];
    const mx = (seg.x1 + seg.x2) / 2;
    const my = (seg.y1 + seg.y2) / 2;
    const seed = mx * 73.1 + my * 37.7;

    switch (effectType) {
      case 'fire':
        renderFireParticles(ctx, mx, my, now, seed, seg.opacity);
        break;
      case 'ice':
        renderIceParticles(ctx, mx, my, now, seed, seg.opacity);
        break;
      case 'electric':
        renderElectricSparks(ctx, seg, now, seed);
        break;
      case 'slime':
        renderSlimeDrips(ctx, mx, my, now, seed, seg.opacity, skinId);
        break;
      case 'stars':
        renderTwinklingStars(ctx, mx, my, now, seed, seg.opacity, skinId);
        break;
      case 'cosmic':
        renderCosmicSparkles(ctx, mx, my, now, seed, seg.opacity);
        break;
    }
  }

  ctx.restore();
}

function renderFireParticles(ctx: CanvasRenderingContext2D, x: number, y: number, now: number, seed: number, opacity: number) {
  for (let j = 0; j < 2; j++) {
    const t = (now * 0.003 + seed + j * 1.7) % 1;
    const px = x + Math.sin(seed * 0.7 + j * 3 + now * 0.004) * 6;
    const py = y - t * 18;
    const size = (1 - t) * 3;
    const alpha = (1 - t) * 0.7 * opacity;
    const hue = 15 + Math.sin(seed + j) * 20;
    ctx.globalAlpha = alpha;
    ctx.fillStyle = `hsl(${hue}, 95%, 55%)`;
    ctx.fillRect(px - size / 2, py - size / 2, size, size);
  }
}

function renderIceParticles(ctx: CanvasRenderingContext2D, x: number, y: number, now: number, seed: number, opacity: number) {
  for (let j = 0; j < 2; j++) {
    const t = (now * 0.002 + seed * 0.3 + j * 2.1) % 1;
    const px = x + Math.sin(seed * 0.5 + j * 4 + now * 0.003) * 8;
    const py = y + t * 16;
    const size = (1 - t) * 2.5;
    const alpha = (1 - t) * 0.6 * opacity;
    ctx.globalAlpha = alpha;
    ctx.fillStyle = `rgba(200, 240, 255, 1)`;
    ctx.beginPath();
    ctx.arc(px, py, size, 0, Math.PI * 2);
    ctx.fill();
  }
}

function renderElectricSparks(
  ctx: CanvasRenderingContext2D,
  seg: { x1: number; y1: number; x2: number; y2: number; opacity: number },
  now: number,
  seed: number
) {
  if (Math.sin(now * 0.02 + seed) > 0.3) return;

  ctx.globalAlpha = seg.opacity * 0.8;
  ctx.strokeStyle = Math.random() > 0.5 ? 'rgba(255, 255, 100, 0.9)' : 'rgba(255, 255, 255, 0.8)';
  ctx.lineWidth = 1;
  ctx.beginPath();

  const mx = (seg.x1 + seg.x2) / 2;
  const my = (seg.y1 + seg.y2) / 2;
  const len = 8 + Math.sin(seed) * 4;
  const angle = Math.sin(now * 0.01 + seed) * Math.PI;

  ctx.moveTo(mx, my);
  const midX = mx + Math.cos(angle) * len * 0.5 + (Math.random() - 0.5) * 4;
  const midY = my + Math.sin(angle) * len * 0.5 + (Math.random() - 0.5) * 4;
  ctx.lineTo(midX, midY);
  ctx.lineTo(midX + Math.cos(angle) * len * 0.5, midY + Math.sin(angle) * len * 0.5);
  ctx.stroke();
}

function renderSlimeDrips(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  now: number,
  seed: number,
  opacity: number,
  skinId: string
) {
  const t = (now * 0.0015 + seed * 0.4) % 1;
  const px = x + Math.sin(seed * 0.3) * 3;
  const py = y + t * 20;
  const size = (1 - t * 0.5) * 2.5;
  const alpha = (1 - t) * 0.65 * opacity;
  const hue = skinId === 'toxic' ? 85 : 95;
  ctx.globalAlpha = alpha;
  ctx.fillStyle = `hsl(${hue}, 90%, 45%)`;
  ctx.beginPath();
  ctx.arc(px, py, size, 0, Math.PI * 2);
  ctx.fill();
}

function renderTwinklingStars(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  now: number,
  seed: number,
  opacity: number,
  skinId: string
) {
  for (let j = 0; j < 2; j++) {
    const angle = seed * 1.3 + j * 2.5 + now * 0.002;
    const dist = 5 + Math.sin(seed * 0.7 + j) * 4;
    const px = x + Math.cos(angle) * dist;
    const py = y + Math.sin(angle) * dist;
    const twinkle = 0.5 + 0.5 * Math.sin(now * 0.008 + seed + j * 1.9);
    const alpha = twinkle * 0.8 * opacity;
    const size = 1 + twinkle * 1.5;

    ctx.globalAlpha = alpha;
    if (skinId === 'gold') {
      ctx.fillStyle = `hsl(45, 90%, ${60 + twinkle * 20}%)`;
    } else {
      ctx.fillStyle = `hsl(${50 + twinkle * 30}, 30%, ${80 + twinkle * 15}%)`;
    }
    ctx.beginPath();
    ctx.arc(px, py, size, 0, Math.PI * 2);
    ctx.fill();
  }
}

function renderCosmicSparkles(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  now: number,
  seed: number,
  opacity: number
) {
  for (let j = 0; j < 3; j++) {
    const angle = seed * 1.1 + j * 2.09 + now * 0.003;
    const dist = 4 + Math.sin(seed * 0.5 + j * 1.3) * 5;
    const px = x + Math.cos(angle) * dist;
    const py = y + Math.sin(angle) * dist;
    const twinkle = 0.5 + 0.5 * Math.sin(now * 0.01 + seed + j * 2.1);
    const alpha = twinkle * 0.9 * opacity;
    const size = 0.8 + twinkle * 2;
    const hue = (now * 0.08 + seed * 30 + j * 120) % 360;

    ctx.globalAlpha = alpha;
    ctx.fillStyle = `hsl(${hue}, 90%, 75%)`;
    ctx.shadowColor = `hsl(${hue}, 100%, 60%)`;
    ctx.shadowBlur = 4;
    ctx.beginPath();
    ctx.arc(px, py, size, 0, Math.PI * 2);
    ctx.fill();

    if (twinkle > 0.7) {
      ctx.globalAlpha = alpha * 0.5;
      ctx.strokeStyle = `hsl(${hue}, 100%, 85%)`;
      ctx.lineWidth = 0.5;
      const sparkLen = size * 2.5;
      ctx.beginPath();
      ctx.moveTo(px - sparkLen, py);
      ctx.lineTo(px + sparkLen, py);
      ctx.moveTo(px, py - sparkLen);
      ctx.lineTo(px, py + sparkLen);
      ctx.stroke();
    }

    ctx.shadowBlur = 0;
  }
}

function renderFunnelCollector(rc: RenderContext, bucket: Bucket) {
  const { ctx, now } = rc;
  const cx = bucket.x + GAME.bucketWidth / 2;
  const cy = bucket.y + GAME.bucketHeight / 2;
  const basePulse = 0.85 + Math.sin(bucket.pulsePhase) * 0.15;
  const boost = bucket.collectPulse;

  ctx.save();

  const glowAlpha = 0.15 + basePulse * 0.1 + boost * 0.3;
  const glowR = 55 + boost * 15;
  const gGlow = ctx.createRadialGradient(cx, cy, 0, cx, cy, glowR);
  gGlow.addColorStop(0, `rgba(0, 212, 255, ${glowAlpha})`);
  gGlow.addColorStop(1, 'transparent');
  ctx.fillStyle = gGlow;
  ctx.beginPath();
  ctx.arc(cx, cy, glowR, 0, Math.PI * 2);
  ctx.fill();

  const bw = GAME.bucketWidth * 0.8;
  const bh = GAME.bucketHeight * 0.65;
  const bx = cx - bw / 2;
  const by = cy - bh / 2;
  const r = 10;

  ctx.beginPath();
  ctx.moveTo(bx - 12, by);
  ctx.lineTo(bx + bw + 12, by);
  ctx.lineTo(bx + bw + 4, by + bh - r);
  ctx.quadraticCurveTo(bx + bw + 4, by + bh, bx + bw + 4 - r, by + bh);
  ctx.lineTo(bx - 4 + r, by + bh);
  ctx.quadraticCurveTo(bx - 4, by + bh, bx - 4, by + bh - r);
  ctx.closePath();

  const bucketGrad = ctx.createLinearGradient(bx, by, bx, by + bh);
  bucketGrad.addColorStop(0, `rgba(0, 180, 220, ${0.6 + boost * 0.3})`);
  bucketGrad.addColorStop(1, `rgba(0, 100, 160, ${0.7 + boost * 0.2})`);
  ctx.fillStyle = bucketGrad;
  ctx.fill();

  ctx.strokeStyle = `rgba(0, 230, 255, ${0.5 + boost * 0.4})`;
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.fillStyle = `rgba(255, 255, 255, ${0.08 + boost * 0.05})`;
  ctx.fillRect(bx + 4, by + 3, bw * 0.3, bh - 6);

  const rimY = by - 2;
  ctx.beginPath();
  ctx.moveTo(bx - 16, rimY);
  ctx.lineTo(bx + bw + 16, rimY);
  ctx.strokeStyle = `rgba(0, 230, 255, ${0.7 + boost * 0.3})`;
  ctx.lineWidth = 3;
  ctx.lineCap = 'round';
  ctx.shadowColor = 'rgba(0, 212, 255, 0.5)';
  ctx.shadowBlur = 2;
  ctx.stroke();
  ctx.shadowBlur = 0;

  const ringCount = 3;
  for (let i = 0; i < ringCount; i++) {
    const ringR = 30 + i * 12 + boost * 5;
    const rotation = now * 0.001 * (i % 2 === 0 ? 1 : -1) + i * 1.2;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(rotation);
    ctx.setLineDash([4, 8]);
    ctx.strokeStyle = `rgba(0, 212, 255, ${0.12 - i * 0.03 + boost * 0.1})`;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(0, 0, ringR, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();
  }

  ctx.restore();
}

function windCloudPath(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, now: number) {
  const cx = x + w / 2;
  const cy = y + h / 2;
  const rx = w / 2;
  const ry = h / 2;
  const lobes = 10;
  ctx.beginPath();
  for (let i = 0; i <= 60; i++) {
    const t = (i / 60) * Math.PI * 2;
    const lobeWobble = 1 + 0.15 * Math.sin(t * lobes + now * 0.001) + 0.08 * Math.cos(t * 7 - now * 0.0015);
    const px = cx + Math.cos(t) * rx * lobeWobble;
    const py = cy + Math.sin(t) * ry * lobeWobble;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
}

function renderWindZones(rc: RenderContext, obstacles: ObstacleState) {
  const { ctx, now } = rc;
  for (const zone of obstacles.windZones) {
    ctx.save();

    ctx.save();
    windCloudPath(ctx, zone.x, zone.y, zone.width, zone.height, now);
    ctx.clip();

    const bgGrad = ctx.createRadialGradient(
      zone.x + zone.width / 2, zone.y + zone.height / 2, 0,
      zone.x + zone.width / 2, zone.y + zone.height / 2, Math.max(zone.width, zone.height) / 2
    );
    bgGrad.addColorStop(0, 'rgba(180, 220, 255, 0.5)');
    bgGrad.addColorStop(0.6, 'rgba(160, 210, 250, 0.3)');
    bgGrad.addColorStop(1, 'rgba(140, 200, 245, 0.1)');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(zone.x - 10, zone.y - 10, zone.width + 20, zone.height + 20);

    const puffCount = 8;
    for (let i = 0; i < puffCount; i++) {
      const seed = i * 53.7 + zone.x * 1.7;
      const bx = zone.x + (0.1 + Math.abs(Math.sin(seed * 1.3)) * 0.8) * zone.width;
      const by = zone.y + (0.15 + Math.abs(Math.sin(seed * 2.7)) * 0.7) * zone.height;
      const br = 12 + Math.sin(seed * 0.8) * 6;
      const breathe = 1 + Math.sin(now * 0.0015 + seed) * 0.15;
      const r = br * breathe;
      const pAlpha = 0.08 + Math.sin(now * 0.001 + seed * 0.5) * 0.03;
      const pg = ctx.createRadialGradient(bx, by, 0, bx, by, r);
      pg.addColorStop(0, `rgba(210, 235, 255, ${pAlpha * 2})`);
      pg.addColorStop(0.5, `rgba(190, 225, 250, ${pAlpha})`);
      pg.addColorStop(1, 'transparent');
      ctx.fillStyle = pg;
      ctx.beginPath();
      ctx.arc(bx, by, r, 0, Math.PI * 2);
      ctx.fill();
    }

    const dir = zone.forceX > 0 ? 1 : -1;
    const streakCount = 8;
    const yStep = zone.height / (streakCount + 1);
    for (let i = 1; i <= streakCount; i++) {
      const baseY = zone.y + i * yStep + Math.sin(now * 0.002 + i * 1.3) * 5;
      const travel = zone.width + 80;
      const offset = ((now * 0.05 + i * (travel / streakCount)) % travel) - 40;
      const startX = dir > 0 ? zone.x + offset : zone.x + zone.width - offset;
      const streakLen = 25 + (i % 3) * 12;
      const cx = zone.x + zone.width / 2;
      const cy = zone.y + zone.height / 2;
      const distFromCenter = Math.sqrt(
        Math.pow((startX - cx) / (zone.width / 2), 2) +
        Math.pow((baseY - cy) / (zone.height / 2), 2)
      );
      const centerFade = Math.max(0, 1 - distFromCenter * 0.8);
      const alpha = (0.2 + Math.sin(now * 0.003 + i * 0.9) * 0.1) * centerFade;

      if (alpha < 0.02) continue;
      ctx.beginPath();
      ctx.moveTo(startX, baseY);
      const steps = 10;
      for (let s = 1; s <= steps; s++) {
        const t = s / steps;
        const px = startX + streakLen * dir * t;
        const py = baseY + Math.sin(t * Math.PI * 2.5 + now * 0.004 + i) * 4;
        ctx.lineTo(px, py);
      }
      ctx.strokeStyle = `rgba(160, 220, 255, ${alpha})`;
      ctx.lineWidth = 1.0 + (i % 3) * 0.4;
      ctx.lineCap = 'round';
      ctx.stroke();
    }

    ctx.restore();

    ctx.globalAlpha = 0.15 + Math.sin(now * 0.002) * 0.05;
    ctx.strokeStyle = 'rgba(160, 215, 255, 0.4)';
    ctx.lineWidth = 1.5;
    windCloudPath(ctx, zone.x, zone.y, zone.width, zone.height, now);
    ctx.stroke();
    ctx.globalAlpha = 1;

    ctx.restore();
  }
}

function renderStaticBars(rc: RenderContext, obstacles: ObstacleState) {
  const { ctx } = rc;
  for (const bar of obstacles.staticBars) {
    ctx.save();
    ctx.translate(bar.x, bar.y);
    ctx.rotate(bar.angle);

    ctx.shadowColor = 'rgba(255, 107, 157, 0.4)';
    ctx.shadowBlur = 2;

    const grad = ctx.createLinearGradient(0, -bar.height / 2, 0, bar.height / 2);
    grad.addColorStop(0, '#FF8EAF');
    grad.addColorStop(1, '#FF5580');
    ctx.fillStyle = grad;

    const r = 4;
    const w = bar.width;
    const h = bar.height;
    ctx.beginPath();
    ctx.moveTo(-w / 2 + r, -h / 2);
    ctx.lineTo(w / 2 - r, -h / 2);
    ctx.quadraticCurveTo(w / 2, -h / 2, w / 2, -h / 2 + r);
    ctx.lineTo(w / 2, h / 2 - r);
    ctx.quadraticCurveTo(w / 2, h / 2, w / 2 - r, h / 2);
    ctx.lineTo(-w / 2 + r, h / 2);
    ctx.quadraticCurveTo(-w / 2, h / 2, -w / 2, h / 2 - r);
    ctx.lineTo(-w / 2, -h / 2 + r);
    ctx.quadraticCurveTo(-w / 2, -h / 2, -w / 2 + r, -h / 2);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.fillRect(-w / 2 + 2, -h / 2 + 1, w - 4, h / 3);

    ctx.restore();
  }
}

function renderSpinners(rc: RenderContext, obstacles: ObstacleState) {
  const { ctx } = rc;
  for (const sp of obstacles.spinners) {
    ctx.save();
    ctx.translate(sp.x, sp.y);
    ctx.rotate(sp.angle);

    ctx.shadowColor = 'rgba(127, 255, 0, 0.4)';
    ctx.shadowBlur = 2;

    const grad = ctx.createLinearGradient(-sp.armLength / 2, 0, sp.armLength / 2, 0);
    grad.addColorStop(0, '#5AE000');
    grad.addColorStop(0.5, '#7FFF00');
    grad.addColorStop(1, '#5AE000');
    ctx.fillStyle = grad;

    const r = 3;
    const w = sp.armLength;
    const h = sp.armWidth;
    ctx.beginPath();
    ctx.moveTo(-w / 2 + r, -h / 2);
    ctx.lineTo(w / 2 - r, -h / 2);
    ctx.quadraticCurveTo(w / 2, -h / 2, w / 2, -h / 2 + r);
    ctx.lineTo(w / 2, h / 2 - r);
    ctx.quadraticCurveTo(w / 2, h / 2, w / 2 - r, h / 2);
    ctx.lineTo(-w / 2 + r, h / 2);
    ctx.quadraticCurveTo(-w / 2, h / 2, -w / 2, h / 2 - r);
    ctx.lineTo(-w / 2, -h / 2 + r);
    ctx.quadraticCurveTo(-w / 2, -h / 2, -w / 2 + r, -h / 2);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.fillRect(-w / 2 + 2, -h / 2 + 1, w - 4, h / 3);
    ctx.restore();

    ctx.save();
    ctx.translate(sp.x, sp.y);
    ctx.rotate(sp.angle + Math.PI / 2);
    ctx.shadowColor = 'rgba(127, 255, 0, 0.4)';
    ctx.shadowBlur = 2;
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.moveTo(-w / 2 + r, -h / 2);
    ctx.lineTo(w / 2 - r, -h / 2);
    ctx.quadraticCurveTo(w / 2, -h / 2, w / 2, -h / 2 + r);
    ctx.lineTo(w / 2, h / 2 - r);
    ctx.quadraticCurveTo(w / 2, h / 2, w / 2 - r, h / 2);
    ctx.lineTo(-w / 2 + r, h / 2);
    ctx.quadraticCurveTo(-w / 2, h / 2, -w / 2, h / 2 - r);
    ctx.lineTo(-w / 2, -h / 2 + r);
    ctx.quadraticCurveTo(-w / 2, -h / 2, -w / 2 + r, -h / 2);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.fillRect(-w / 2 + 2, -h / 2 + 1, w - 4, h / 3);
    ctx.restore();

    ctx.save();
    ctx.shadowColor = 'rgba(127, 255, 0, 0.6)';
    ctx.shadowBlur = 2;
    ctx.beginPath();
    ctx.arc(sp.x, sp.y, 6, 0, Math.PI * 2);
    ctx.fillStyle = '#AAFF44';
    ctx.fill();
    ctx.strokeStyle = '#5AE000';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.restore();
  }
}

function renderMovingPlatforms(rc: RenderContext, obstacles: ObstacleState) {
  const { ctx, now } = rc;
  for (const mp of obstacles.movingPlatforms) {
    const pos = mp.body.position;
    ctx.save();
    ctx.translate(pos.x, pos.y);

    ctx.shadowColor = 'rgba(255, 217, 61, 0.4)';
    ctx.shadowBlur = 8;

    const grad = ctx.createLinearGradient(0, -mp.height / 2, 0, mp.height / 2);
    grad.addColorStop(0, '#FFE066');
    grad.addColorStop(1, '#FFAA00');
    ctx.fillStyle = grad;

    const r = 4;
    const w = mp.width;
    const h = mp.height;
    ctx.beginPath();
    ctx.moveTo(-w / 2 + r, -h / 2);
    ctx.lineTo(w / 2 - r, -h / 2);
    ctx.quadraticCurveTo(w / 2, -h / 2, w / 2, -h / 2 + r);
    ctx.lineTo(w / 2, h / 2 - r);
    ctx.quadraticCurveTo(w / 2, h / 2, w / 2 - r, h / 2);
    ctx.lineTo(-w / 2 + r, h / 2);
    ctx.quadraticCurveTo(-w / 2, h / 2, -w / 2, h / 2 - r);
    ctx.lineTo(-w / 2, -h / 2 + r);
    ctx.quadraticCurveTo(-w / 2, -h / 2, -w / 2 + r, -h / 2);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.fillRect(-w / 2 + 2, -h / 2 + 1, w - 4, h / 3);

    const arrowAlpha = 0.3 + Math.sin(now * 0.004) * 0.15;
    ctx.fillStyle = `rgba(255, 255, 255, ${arrowAlpha})`;
    ctx.font = 'bold 9px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('<  >', 0, 0);

    ctx.restore();
  }
}

function renderSpawner(ctx: CanvasRenderingContext2D, spawner: Spawner, now: number) {
  ctx.save();
  const hw = GAME.spawnerWidth / 2;
  const pulse = 0.5 + Math.sin(now * 0.003) * 0.5;

  ctx.shadowColor = `rgba(0, 212, 255, ${0.3 + pulse * 0.3})`;
  ctx.shadowBlur = 2;
  ctx.strokeStyle = `rgba(0, 212, 255, ${0.5 + pulse * 0.4})`;
  ctx.lineWidth = 2.5;
  ctx.lineCap = 'round';

  ctx.beginPath();
  ctx.moveTo(spawner.x - hw, spawner.y);
  ctx.quadraticCurveTo(spawner.x, spawner.y + 10, spawner.x + hw, spawner.y);
  ctx.stroke();

  ctx.fillStyle = `rgba(0, 212, 255, ${0.08 + pulse * 0.06})`;
  ctx.beginPath();
  ctx.moveTo(spawner.x - hw, spawner.y);
  ctx.quadraticCurveTo(spawner.x, spawner.y + 10, spawner.x + hw, spawner.y);
  ctx.quadraticCurveTo(spawner.x, spawner.y - 6, spawner.x - hw, spawner.y);
  ctx.fill();

  ctx.restore();
}

function renderVfx(ctx: CanvasRenderingContext2D, vfx: VfxState) {
  for (const p of vfx.particles) {
    const life = p.life / p.maxLife;
    const alpha = life * 0.9;
    const size = p.size * (0.3 + life * 0.7);

    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.shadowColor = `rgba(${p.r},${p.g},${p.b},${alpha * 0.5})`;
    ctx.shadowBlur = 2;
    ctx.beginPath();
    ctx.arc(p.x, p.y, Math.max(size, 0.5), 0, Math.PI * 2);
    ctx.fillStyle = `rgb(${p.r},${p.g},${p.b})`;
    ctx.fill();
    ctx.restore();
  }
}

export function renderCountdown(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  secondsLeft: number
) {
  ctx.save();
  ctx.fillStyle = 'rgba(11, 22, 40, 0.6)';
  ctx.fillRect(0, 0, width, height);

  const scale = 1 + (secondsLeft % 1) * 0.2;
  const alpha = 0.5 + (secondsLeft % 1) * 0.5;

  ctx.translate(width / 2, height / 2);
  ctx.scale(scale, scale);

  ctx.font = 'bold 100px Nunito, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.shadowColor = 'rgba(0, 212, 255, 0.5)';
  ctx.shadowBlur = 5;
  ctx.fillStyle = `rgba(0, 212, 255, ${alpha})`;
  ctx.fillText(String(Math.ceil(secondsLeft)), 0, 0);
  ctx.restore();
}
