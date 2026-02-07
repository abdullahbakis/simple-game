import { GAME } from './constants';
import type { Spawner } from './spawner';
import type { DrawingState } from './drawing';
import type { Bucket } from './bucket';
import type { ObstacleState } from './obstacles';
import type { VfxState } from './vfx';

export interface RenderContext {
  ctx: CanvasRenderingContext2D;
  width: number;
  height: number;
  now: number;
}

const PEARL_TINTS = [
  { mid: '#FFF4F6', edge: '#EEBECE' },
  { mid: '#F4F6FF', edge: '#BECEE8' },
  { mid: '#F2FFF6', edge: '#B8E0C4' },
  { mid: '#FFF8F2', edge: '#E8CCBA' },
];

export function renderFrame(
  rc: RenderContext,
  spawner: Spawner,
  drawing: DrawingState,
  bucket: Bucket,
  obstacles: ObstacleState,
  vfx: VfxState
) {
  const { ctx, width, height } = rc;
  ctx.clearRect(0, 0, width, height);
  renderPastelBg(ctx, width, height);
  renderDeathZone(ctx, width, height);
  renderWindZones(rc, obstacles);
  renderStaticBars(rc, obstacles);
  renderSpinners(rc, obstacles);
  renderMovingPlatforms(rc, obstacles);
  renderCloudCollector(ctx, bucket);
  renderSilkRibbons(ctx, drawing);
  renderPearlParticles(ctx, spawner);
  renderSpawner(ctx, spawner, rc.now);
  renderVfx(ctx, vfx);
}

function renderPastelBg(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number
) {
  const grad = ctx.createLinearGradient(0, 0, 0, h);
  grad.addColorStop(0, '#FFF5F7');
  grad.addColorStop(1, '#F0F4FF');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);
}

function renderDeathZone(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number
) {
  const gradient = ctx.createLinearGradient(0, h - 20, 0, h);
  gradient.addColorStop(0, 'transparent');
  gradient.addColorStop(1, 'rgba(190, 180, 195, 0.15)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, h - 20, w, 20);
}

function renderPearlParticles(
  ctx: CanvasRenderingContext2D,
  spawner: Spawner
) {
  for (const p of spawner.particles) {
    const ci = p.colorIdx % PEARL_TINTS.length;
    const tint = PEARL_TINTS[ci];
    const px = p.body.position.x;
    const py = p.body.position.y;
    const vr = GAME.particleRadius * 1.6;

    const vx = p.body.velocity.x;
    const vy = p.body.velocity.y;
    const speed = Math.sqrt(vx * vx + vy * vy);
    if (speed > 1) {
      for (let i = p.trail.length - 1; i >= 0; i--) {
        const t = p.trail[i];
        const frac = (p.trail.length - i) / p.trail.length;
        const alpha = frac * 0.1 * Math.min(speed / 5, 1);
        const rad = vr * (1 - i * 0.08);
        ctx.beginPath();
        ctx.arc(t.x, t.y, Math.max(rad, 1), 0, Math.PI * 2);
        ctx.fillStyle = `rgba(215, 200, 210, ${alpha})`;
        ctx.fill();
      }
    }

    ctx.save();
    ctx.shadowColor = 'rgba(0, 0, 0, 0.1)';
    ctx.shadowBlur = 5;
    ctx.shadowOffsetY = 2;

    const grad = ctx.createRadialGradient(
      px - vr * 0.25, py - vr * 0.25, 0,
      px, py, vr
    );
    grad.addColorStop(0, '#FFFFFF');
    grad.addColorStop(0.45, tint.mid);
    grad.addColorStop(1, tint.edge);

    ctx.beginPath();
    ctx.arc(px, py, vr, 0, Math.PI * 2);
    ctx.fillStyle = grad;
    ctx.fill();

    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;
    ctx.beginPath();
    ctx.arc(px - vr * 0.2, py - vr * 0.2, vr * 0.25, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.fill();

    ctx.restore();
  }
}

function renderSilkRibbons(
  ctx: CanvasRenderingContext2D,
  drawing: DrawingState
) {
  if (drawing.segments.length === 0) return;

  for (const seg of drawing.segments) {
    ctx.save();
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = 4;
    ctx.globalAlpha = seg.opacity * 0.75;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.06)';
    ctx.shadowBlur = 3;
    ctx.shadowOffsetY = 1;
    ctx.beginPath();
    ctx.moveTo(seg.x1, seg.y1);
    ctx.lineTo(seg.x2, seg.y2);
    ctx.stroke();
    ctx.restore();
  }
}

function renderCloudCollector(
  ctx: CanvasRenderingContext2D,
  bucket: Bucket
) {
  const cx = bucket.x + GAME.bucketWidth / 2;
  const cy = bucket.y + GAME.bucketHeight / 2;
  const basePulse = 0.85 + Math.sin(bucket.pulsePhase) * 0.15;
  const boost = bucket.collectPulse;

  const clouds = [
    { dx: 0, dy: 0, r: 34 },
    { dx: -24, dy: 5, r: 26 },
    { dx: 24, dy: 5, r: 26 },
    { dx: -13, dy: -12, r: 23 },
    { dx: 13, dy: -12, r: 23 },
    { dx: 0, dy: 13, r: 29 },
  ];

  ctx.save();
  ctx.shadowColor = 'rgba(0, 0, 0, 0.06)';
  ctx.shadowBlur = 10;
  ctx.shadowOffsetY = 4;

  const alpha = 0.55 + basePulse * 0.15 + boost * 0.25;

  for (const c of clouds) {
    ctx.beginPath();
    ctx.arc(cx + c.dx, cy + c.dy, c.r, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
    ctx.fill();
  }

  ctx.restore();
}

function renderWindZones(rc: RenderContext, obstacles: ObstacleState) {
  const { ctx, now } = rc;
  for (const zone of obstacles.windZones) {
    ctx.save();
    ctx.fillStyle = 'rgba(184, 212, 240, 0.08)';
    ctx.fillRect(zone.x, zone.y, zone.width, zone.height);

    ctx.strokeStyle = 'rgba(184, 212, 240, 0.2)';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    ctx.strokeRect(zone.x, zone.y, zone.width, zone.height);
    ctx.setLineDash([]);

    const dir = zone.forceX > 0 ? 1 : -1;
    const streakCount = 4;
    const yStep = zone.height / (streakCount + 1);
    ctx.strokeStyle = 'rgba(184, 212, 240, 0.15)';
    ctx.lineWidth = 1;
    ctx.lineCap = 'round';

    for (let i = 1; i <= streakCount; i++) {
      const baseY = zone.y + i * yStep;
      const travel = zone.width + 30;
      const offset = ((now * 0.04 + i * (travel / streakCount)) % travel) - 15;
      const sx = dir > 0 ? zone.x + offset : zone.x + zone.width - offset;
      const streakLen = 15 + (i % 3) * 5;
      const ex = sx + streakLen * dir;
      if (Math.min(sx, ex) > zone.x + zone.width || Math.max(sx, ex) < zone.x) continue;
      const clampSx = Math.max(zone.x, Math.min(zone.x + zone.width, sx));
      const clampEx = Math.max(zone.x, Math.min(zone.x + zone.width, ex));

      ctx.beginPath();
      ctx.moveTo(clampSx, baseY);
      ctx.lineTo(clampEx, baseY);
      ctx.stroke();
    }

    ctx.font = '10px Nunito, sans-serif';
    ctx.fillStyle = 'rgba(160, 180, 210, 0.4)';
    ctx.textAlign = 'center';
    ctx.fillText('wind', zone.x + zone.width / 2, zone.y + 14);
    ctx.restore();
  }
}

function renderStaticBars(rc: RenderContext, obstacles: ObstacleState) {
  const { ctx } = rc;
  for (const bar of obstacles.staticBars) {
    ctx.save();
    ctx.translate(bar.x, bar.y);
    ctx.rotate(bar.angle);
    ctx.shadowColor = 'rgba(0, 0, 0, 0.06)';
    ctx.shadowBlur = 4;
    ctx.shadowOffsetY = 2;
    ctx.fillStyle = '#F8C4D4';
    ctx.fillRect(-bar.width / 2, -bar.height / 2, bar.width, bar.height);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
    ctx.fillRect(-bar.width / 2, -bar.height / 2, bar.width, bar.height / 2);
    ctx.restore();
  }
}

function renderSpinners(rc: RenderContext, obstacles: ObstacleState) {
  const { ctx } = rc;
  for (const sp of obstacles.spinners) {
    ctx.save();
    ctx.translate(sp.x, sp.y);
    ctx.rotate(sp.angle);
    ctx.shadowColor = 'rgba(0, 0, 0, 0.06)';
    ctx.shadowBlur = 4;
    ctx.fillStyle = '#B8E0C4';
    ctx.fillRect(-sp.armLength / 2, -sp.armWidth / 2, sp.armLength, sp.armWidth);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.fillRect(-sp.armLength / 2, -sp.armWidth / 2, sp.armLength, sp.armWidth / 2);
    ctx.restore();

    ctx.save();
    ctx.translate(sp.x, sp.y);
    ctx.rotate(sp.angle + Math.PI / 2);
    ctx.shadowColor = 'rgba(0, 0, 0, 0.06)';
    ctx.shadowBlur = 4;
    ctx.fillStyle = '#B8E0C4';
    ctx.fillRect(-sp.armLength / 2, -sp.armWidth / 2, sp.armLength, sp.armWidth);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.fillRect(-sp.armLength / 2, -sp.armWidth / 2, sp.armLength, sp.armWidth / 2);
    ctx.restore();

    ctx.save();
    ctx.shadowColor = 'rgba(0, 0, 0, 0.08)';
    ctx.shadowBlur = 3;
    ctx.beginPath();
    ctx.arc(sp.x, sp.y, 5, 0, Math.PI * 2);
    ctx.fillStyle = '#A0D0B0';
    ctx.fill();
    ctx.restore();
  }
}

function renderMovingPlatforms(rc: RenderContext, obstacles: ObstacleState) {
  const { ctx } = rc;
  for (const mp of obstacles.movingPlatforms) {
    const pos = mp.body.position;
    ctx.save();
    ctx.translate(pos.x, pos.y);
    ctx.shadowColor = 'rgba(0, 0, 0, 0.06)';
    ctx.shadowBlur = 4;
    ctx.shadowOffsetY = 2;
    ctx.fillStyle = '#D4C4E8';
    ctx.fillRect(-mp.width / 2, -mp.height / 2, mp.width, mp.height);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.fillRect(-mp.width / 2, -mp.height / 2, mp.width, mp.height / 2);
    ctx.restore();
  }
}

function renderSpawner(
  ctx: CanvasRenderingContext2D,
  spawner: Spawner,
  now: number
) {
  ctx.save();
  const pulse = 0.5 + Math.sin(now * 0.002) * 0.5;
  ctx.strokeStyle = `rgba(180, 190, 210, ${0.2 + pulse * 0.3})`;
  ctx.lineWidth = 2;
  ctx.lineCap = 'round';
  const hw = GAME.spawnerWidth / 2;
  ctx.beginPath();
  ctx.moveTo(spawner.x - hw, spawner.y + 2);
  ctx.quadraticCurveTo(spawner.x, spawner.y + 8, spawner.x + hw, spawner.y + 2);
  ctx.stroke();
  ctx.restore();
}

function renderVfx(ctx: CanvasRenderingContext2D, vfx: VfxState) {
  for (const p of vfx.particles) {
    const life = p.life / p.maxLife;
    const alpha = life * 0.7;
    const size = p.size * (0.3 + life * 0.7);

    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.shadowColor = `rgba(${p.r},${p.g},${p.b},${alpha * 0.3})`;
    ctx.shadowBlur = 4;
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
  ctx.fillStyle = 'rgba(255, 245, 247, 0.6)';
  ctx.fillRect(0, 0, width, height);

  const scale = 1 + (secondsLeft % 1) * 0.15;
  const alpha = 0.3 + (secondsLeft % 1) * 0.5;

  ctx.translate(width / 2, height / 2);
  ctx.scale(scale, scale);

  ctx.font = 'bold 100px Nunito, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = `rgba(180, 165, 175, ${alpha})`;
  ctx.fillText(String(Math.ceil(secondsLeft)), 0, 0);
  ctx.restore();
}
