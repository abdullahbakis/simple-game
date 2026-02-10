import { GAME, CANDY_RGB } from './constants';
import type { RenderContext } from './constants';
import type { Spawner } from './spawner';
import type { DrawingState } from './drawing';
import type { Bucket } from './bucket';
import type { ObstacleState } from './obstacles';
import type { HazardState } from './hazards';
import type { VfxState } from './vfx';
import { renderHazards } from './hazards-renderer';

export function renderFrame(
  rc: RenderContext,
  spawner: Spawner,
  drawing: DrawingState,
  bucket: Bucket,
  obstacles: ObstacleState,
  hazards: HazardState,
  vfx: VfxState
) {
  const { ctx, width, height } = rc;
  ctx.clearRect(0, 0, width, height);
  renderSpaceBg(rc);
  renderStars(rc);
  renderDeathZone(ctx, width, height);
  renderWindZones(rc, obstacles);
  renderStaticBars(rc, obstacles);
  renderSpinners(rc, obstacles);
  renderMovingPlatforms(rc, obstacles);
  renderHazards(rc, hazards);
  renderFunnelCollector(rc, bucket);
  renderCandyRibbons(ctx, drawing, rc.now);
  renderCandyBalls(ctx, spawner, rc.now);
  renderSpawner(ctx, spawner, rc.now);
  renderVfx(ctx, vfx);
}

const _starCache: { x: number; y: number; r: number; twinkleOffset: number }[] = [];
let _starW = 0;
let _starH = 0;

function renderSpaceBg(rc: RenderContext) {
  const { ctx, width, height } = rc;
  const grad = ctx.createLinearGradient(0, 0, 0, height);
  grad.addColorStop(0, '#0B1628');
  grad.addColorStop(0.5, '#152238');
  grad.addColorStop(1, '#1A2744');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, width, height);
}

function renderStars(rc: RenderContext) {
  const { ctx, width, height, now } = rc;

  if (_starW !== width || _starH !== height || _starCache.length === 0) {
    _starCache.length = 0;
    _starW = width;
    _starH = height;
    const count = Math.floor((width * height) / 4000);
    for (let i = 0; i < count; i++) {
      _starCache.push({
        x: Math.random() * width,
        y: Math.random() * height,
        r: 0.4 + Math.random() * 1.2,
        twinkleOffset: Math.random() * Math.PI * 2,
      });
    }
  }

  for (const s of _starCache) {
    const twinkle = 0.3 + 0.7 * (0.5 + 0.5 * Math.sin(now * 0.002 + s.twinkleOffset));
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255,255,255,${twinkle})`;
    ctx.fill();
  }
}

function renderDeathZone(ctx: CanvasRenderingContext2D, w: number, h: number) {
  const gradient = ctx.createLinearGradient(0, h - 30, 0, h);
  gradient.addColorStop(0, 'transparent');
  gradient.addColorStop(1, 'rgba(255, 50, 50, 0.25)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, h - 30, w, 30);
}

function renderCandyBalls(ctx: CanvasRenderingContext2D, spawner: Spawner, now: number) {
  for (const p of spawner.particles) {
    const ci = p.colorIdx % CANDY_RGB.length;
    const [cr, cg, cb] = CANDY_RGB[ci];
    const px = p.body.position.x;
    const py = p.body.position.y;
    const vr = GAME.particleRadius * 1.8;

    const vx = p.body.velocity.x;
    const vy = p.body.velocity.y;
    const speed = Math.sqrt(vx * vx + vy * vy);
    if (speed > 1.5) {
      for (let i = p.trail.length - 1; i >= 0; i--) {
        const t = p.trail[i];
        const frac = (p.trail.length - i) / p.trail.length;
        const alpha = frac * 0.35 * Math.min(speed / 5, 1);
        const rad = vr * (1 - i * 0.1);
        ctx.beginPath();
        ctx.arc(t.x, t.y, Math.max(rad, 1), 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${cr},${cg},${cb},${alpha})`;
        ctx.fill();
      }
    }

    ctx.save();
    ctx.shadowColor = `rgba(${cr},${cg},${cb},0.6)`;
    ctx.shadowBlur = 3;

    const grad = ctx.createRadialGradient(
      px - vr * 0.3, py - vr * 0.3, 0,
      px, py, vr
    );
    grad.addColorStop(0, '#FFFFFF');
    grad.addColorStop(0.35, `rgba(${cr},${cg},${cb},0.9)`);
    grad.addColorStop(1, `rgba(${Math.max(cr - 40, 0)},${Math.max(cg - 40, 0)},${Math.max(cb - 40, 0)},1)`);

    ctx.beginPath();
    ctx.arc(px, py, vr, 0, Math.PI * 2);
    ctx.fillStyle = grad;
    ctx.fill();

    ctx.strokeStyle = `rgba(${Math.max(cr - 60, 0)},${Math.max(cg - 60, 0)},${Math.max(cb - 60, 0)},0.5)`;
    ctx.lineWidth = 0.8;
    ctx.stroke();

    ctx.shadowBlur = 0;
    ctx.beginPath();
    ctx.arc(px - vr * 0.25, py - vr * 0.25, vr * 0.25, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.fill();

    const wobble = Math.sin(now * 0.006 + p.createdAt) * 0.5;
    const eyeSpacing = vr * 0.28;
    const eyeY = py - vr * 0.05 + wobble;
    const eyeR = vr * 0.12;

    ctx.fillStyle = '#1a1a2e';
    ctx.beginPath();
    ctx.arc(px - eyeSpacing, eyeY, eyeR, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(px + eyeSpacing, eyeY, eyeR, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(px - eyeSpacing - eyeR * 0.3, eyeY - eyeR * 0.3, eyeR * 0.45, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(px + eyeSpacing - eyeR * 0.3, eyeY - eyeR * 0.3, eyeR * 0.45, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.arc(px, py + vr * 0.2, vr * 0.18, 0, Math.PI);
    ctx.strokeStyle = '#1a1a2e';
    ctx.lineWidth = 0.6;
    ctx.stroke();

    ctx.restore();
  }
}

function renderCandyRibbons(ctx: CanvasRenderingContext2D, drawing: DrawingState, now: number) {
  if (drawing.segments.length === 0) return;

  for (const seg of drawing.segments) {
    ctx.save();
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.globalAlpha = seg.opacity;

    const hue = (now * 0.05 + seg.x1 * 0.5 + seg.y1 * 0.3) % 360;

    ctx.shadowColor = `hsla(${hue}, 100%, 65%, 0.6)`;
    ctx.shadowBlur = 2;
    ctx.lineWidth = 6;
    ctx.strokeStyle = `hsla(${hue}, 90%, 70%, 0.9)`;
    ctx.beginPath();
    ctx.moveTo(seg.x1, seg.y1);
    ctx.lineTo(seg.x2, seg.y2);
    ctx.stroke();

    ctx.shadowBlur = 0;
    ctx.lineWidth = 2;
    ctx.strokeStyle = `hsla(${hue}, 100%, 88%, 0.7)`;
    ctx.beginPath();
    ctx.moveTo(seg.x1, seg.y1);
    ctx.lineTo(seg.x2, seg.y2);
    ctx.stroke();

    ctx.restore();
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

function renderWindZones(rc: RenderContext, obstacles: ObstacleState) {
  const { ctx, now } = rc;
  for (const zone of obstacles.windZones) {
    ctx.save();
    ctx.fillStyle = 'rgba(0, 150, 255, 0.08)';
    ctx.fillRect(zone.x, zone.y, zone.width, zone.height);

    ctx.strokeStyle = 'rgba(0, 180, 255, 0.3)';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    ctx.strokeRect(zone.x, zone.y, zone.width, zone.height);
    ctx.setLineDash([]);

    const dir = zone.forceX > 0 ? 1 : -1;
    const streakCount = 5;
    const yStep = zone.height / (streakCount + 1);

    for (let i = 1; i <= streakCount; i++) {
      const baseY = zone.y + i * yStep;
      const travel = zone.width + 30;
      const offset = ((now * 0.06 + i * (travel / streakCount)) % travel) - 15;
      const sx = dir > 0 ? zone.x + offset : zone.x + zone.width - offset;
      const streakLen = 18 + (i % 3) * 6;
      const ex = sx + streakLen * dir;
      if (Math.min(sx, ex) > zone.x + zone.width || Math.max(sx, ex) < zone.x) continue;
      const clampSx = Math.max(zone.x, Math.min(zone.x + zone.width, sx));
      const clampEx = Math.max(zone.x, Math.min(zone.x + zone.width, ex));

      ctx.beginPath();
      ctx.moveTo(clampSx, baseY);
      ctx.lineTo(clampEx, baseY);
      ctx.strokeStyle = `rgba(100, 200, 255, ${0.25 + Math.sin(now * 0.003 + i) * 0.1})`;
      ctx.lineWidth = 1.5;
      ctx.lineCap = 'round';
      ctx.stroke();
    }

    ctx.font = 'bold 10px Nunito, sans-serif';
    ctx.fillStyle = 'rgba(100, 200, 255, 0.5)';
    ctx.textAlign = 'center';
    ctx.fillText('WIND', zone.x + zone.width / 2, zone.y + 14);
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
    ctx.shadowBlur = 6;
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
  ctx.shadowBlur = 20;
  ctx.fillStyle = `rgba(0, 212, 255, ${alpha})`;
  ctx.fillText(String(Math.ceil(secondsLeft)), 0, 0);
  ctx.restore();
}
