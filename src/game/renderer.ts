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
  vfx: VfxState,
  level: number = 1,
  skinId: string = 'rainbow'
) {
  const { ctx, width, height } = rc;
  ctx.clearRect(0, 0, width, height);
  renderSpaceBg(rc, level);
  renderStars(rc);
  renderDeathZone(ctx, width, height);
  renderWindZones(rc, obstacles);
  renderStaticBars(rc, obstacles);
  renderSpinners(rc, obstacles);
  renderMovingPlatforms(rc, obstacles);
  renderHazards(rc, hazards);
  renderFunnelCollector(rc, bucket);
  renderCandyRibbons(ctx, drawing, rc.now, skinId);
  renderSkinEffects(ctx, drawing, rc.now, skinId);
  renderCandyBalls(ctx, spawner, rc.now);
  renderSpawner(ctx, spawner, rc.now);
  renderVfx(ctx, vfx);
}

const _starCache: { x: number; y: number; r: number; twinkleOffset: number }[] = [];
let _starW = 0;
let _starH = 0;

interface BgTheme {
  top: string;
  mid: string;
  bottom: string;
}

function getBgTheme(level: number): BgTheme {
  if (level <= 20) return { top: '#0B1628', mid: '#152238', bottom: '#1A2744' };
  if (level <= 40) return { top: '#081820', mid: '#0E2830', bottom: '#143838' };
  if (level <= 60) return { top: '#0A0A18', mid: '#121228', bottom: '#181830' };
  if (level <= 80) return { top: '#1A0A08', mid: '#281210', bottom: '#301818' };
  return { top: '#080810', mid: '#101020', bottom: '#181828' };
}

function renderSpaceBg(rc: RenderContext, level: number) {
  const { ctx, width, height } = rc;
  const theme = getBgTheme(level);
  const grad = ctx.createLinearGradient(0, 0, 0, height);
  grad.addColorStop(0, theme.top);
  grad.addColorStop(0.5, theme.mid);
  grad.addColorStop(1, theme.bottom);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, width, height);

  if (level <= 20) renderBreezeAtmosphere(rc);
  else if (level <= 40) renderVortexAtmosphere(rc);
  else if (level <= 60) renderElectricAtmosphere(rc);
  else if (level <= 80) renderInfernoAtmosphere(rc);
  else renderAbyssAtmosphere(rc);
}

function renderBreezeAtmosphere(rc: RenderContext) {
  const { ctx, width, height, now } = rc;
  for (let i = 0; i < 4; i++) {
    const baseY = height * (0.15 + i * 0.2);
    const drift = now * 0.008 + i * 100;
    const alpha = 0.03 + Math.sin(now * 0.001 + i) * 0.01;
    ctx.strokeStyle = `rgba(180, 210, 240, ${alpha})`;
    ctx.lineWidth = 2 + i * 0.5;
    ctx.beginPath();
    for (let x = 0; x <= width; x += 4) {
      const y = baseY + Math.sin((x + drift) * 0.008) * 15 + Math.sin((x + drift) * 0.003) * 8;
      if (x === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
  }
}

function renderVortexAtmosphere(rc: RenderContext) {
  const { ctx, width, height, now } = rc;
  const cx = width * 0.5;
  const cy = height * 0.45;
  const rot = now * 0.0003;
  for (let arm = 0; arm < 3; arm++) {
    const armOffset = (arm / 3) * Math.PI * 2;
    ctx.strokeStyle = `rgba(40, 120, 100, ${0.04 - arm * 0.008})`;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    for (let t = 0; t < 8; t += 0.05) {
      const angle = t + rot + armOffset;
      const r = t * 25;
      const x = cx + Math.cos(angle) * r;
      const y = cy + Math.sin(angle) * r * 0.6;
      if (t === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
  }
}

function renderElectricAtmosphere(rc: RenderContext) {
  const { ctx, width, height, now } = rc;
  const spacing = 40;
  ctx.strokeStyle = 'rgba(0, 180, 200, 0.04)';
  ctx.lineWidth = 0.5;
  for (let x = (now * 0.01) % spacing; x < width; x += spacing) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }
  for (let y = (now * 0.008) % spacing; y < height; y += spacing) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }

  for (let gx = spacing; gx < width; gx += spacing) {
    for (let gy = spacing; gy < height; gy += spacing) {
      const pulse = Math.sin(now * 0.003 + gx * 0.1 + gy * 0.1);
      if (pulse > 0.7) {
        const nodeAlpha = (pulse - 0.7) * 0.15;
        ctx.fillStyle = `rgba(0, 220, 255, ${nodeAlpha})`;
        ctx.beginPath();
        ctx.arc(gx, gy, 2, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }
}

function renderInfernoAtmosphere(rc: RenderContext) {
  const { ctx, width, height, now } = rc;
  const heatGrad = ctx.createLinearGradient(0, height * 0.7, 0, height);
  heatGrad.addColorStop(0, 'transparent');
  heatGrad.addColorStop(1, 'rgba(180, 40, 10, 0.06)');
  ctx.fillStyle = heatGrad;
  ctx.fillRect(0, height * 0.7, width, height * 0.3);

  for (let i = 0; i < 5; i++) {
    const baseX = width * (0.1 + i * 0.2);
    const t = ((now * 0.0005 + i * 0.2) % 1);
    const y = height * (1 - t);
    const wobble = Math.sin(now * 0.003 + i * 2) * 10;
    ctx.strokeStyle = `rgba(200, 80, 20, ${(1 - t) * 0.04})`;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(baseX + wobble, y);
    ctx.lineTo(baseX + wobble + Math.sin(now * 0.004 + i) * 5, y - 30);
    ctx.stroke();
  }

  for (let i = 0; i < 6; i++) {
    const t = ((now * 0.0003 + i * 0.167) % 1);
    const ex = width * (0.05 + (i * 0.17));
    const ey = height * (1 - t);
    const eAlpha = (1 - t) * 0.06;
    const eSize = (1 - t) * 2;
    ctx.fillStyle = `rgba(255, 100, 20, ${eAlpha})`;
    ctx.beginPath();
    ctx.arc(ex + Math.sin(now * 0.002 + i) * 8, ey, Math.max(eSize, 0.3), 0, Math.PI * 2);
    ctx.fill();
  }
}

function renderAbyssAtmosphere(rc: RenderContext) {
  const { ctx, width, height, now } = rc;
  for (let i = 0; i < 3; i++) {
    const shimmerX = width * 0.3 + i * width * 0.2 + Math.sin(now * 0.0005 + i * 2) * 60;
    const shimmerY = height * 0.5;
    const shimmerR = 100 + Math.sin(now * 0.001 + i) * 30;
    const shimmerAlpha = 0.025 + Math.sin(now * 0.002 + i * 1.5) * 0.012;
    const sg = ctx.createRadialGradient(shimmerX, shimmerY, 0, shimmerX, shimmerY, shimmerR);
    sg.addColorStop(0, `rgba(100, 140, 200, ${shimmerAlpha})`);
    sg.addColorStop(1, 'transparent');
    ctx.fillStyle = sg;
    ctx.beginPath();
    ctx.arc(shimmerX, shimmerY, shimmerR, 0, Math.PI * 2);
    ctx.fill();
  }

  for (let i = 0; i < 2; i++) {
    const mistX = width * (0.3 + i * 0.4) + Math.sin(now * 0.0003 + i * 3) * 80;
    const mistY = height * (0.3 + i * 0.3);
    const mistR = 140 + Math.sin(now * 0.0008 + i) * 40;
    const mistAlpha = 0.015 + Math.sin(now * 0.001 + i * 2) * 0.008;
    const mg = ctx.createRadialGradient(mistX, mistY, 0, mistX, mistY, mistR);
    mg.addColorStop(0, `rgba(60, 80, 160, ${mistAlpha})`);
    mg.addColorStop(0.6, `rgba(40, 50, 120, ${mistAlpha * 0.5})`);
    mg.addColorStop(1, 'transparent');
    ctx.fillStyle = mg;
    ctx.beginPath();
    ctx.arc(mistX, mistY, mistR, 0, Math.PI * 2);
    ctx.fill();
  }
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

type SkinEffectType = 'fire' | 'ice' | 'electric' | 'slime' | 'stars' | null;

function getSkinEffectType(skinId: string): SkinEffectType {
  switch (skinId) {
    case 'fire': return 'fire';
    case 'ice': return 'ice';
    case 'electric': return 'electric';
    case 'slime':
    case 'toxic': return 'slime';
    case 'gold':
    case 'starry': return 'stars';
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
