import type { RenderContext } from './constants';

interface BgParticle {
  x: number;
  y: number;
  size: number;
  speed: number;
  phase: number;
  hue: number;
  brightness: number;
}

interface BgStar {
  x: number;
  y: number;
  r: number;
  phase: number;
}

let _particles: BgParticle[] = [];
let _stars: BgStar[] = [];
let _cW = 0;
let _cH = 0;
let _cTheme = -1;

function sr(seed: number): number {
  const x = Math.sin(seed * 127.1) * 43758.5453;
  return x - Math.floor(x);
}

function themeOf(level: number): number {
  if (level <= 10) return 0;
  if (level <= 20) return 1;
  if (level <= 30) return 2;
  if (level <= 40) return 3;
  if (level <= 50) return 4;
  if (level <= 60) return 5;
  if (level <= 70) return 6;
  if (level <= 80) return 7;
  if (level <= 90) return 8;
  return 9;
}

function pCount(theme: number, w: number, h: number): number {
  const a = w * h;
  const counts: Record<number, number> = { 0: a / 4000, 2: a / 3000, 5: a / 4000, 9: a / 3000 };
  return Math.floor(counts[theme] ?? 0);
}

function rebuild(w: number, h: number, theme: number) {
  _cW = w;
  _cH = h;
  _cTheme = theme;
  _particles = [];
  _stars = [];

  const sc = Math.floor((w * h) / 5000);
  for (let i = 0; i < sc; i++) {
    _stars.push({
      x: sr(i * 3.1 + 0.5) * w,
      y: sr(i * 7.3 + 0.5) * h,
      r: 0.3 + sr(i * 11.7 + 0.5) * 1.0,
      phase: sr(i * 17.3 + 0.5) * Math.PI * 2,
    });
  }

  const pc = pCount(theme, w, h);
  for (let i = 0; i < pc; i++) {
    const s = theme * 100;
    _particles.push({
      x: sr(i * 5.7 + s) * w,
      y: sr(i * 9.3 + s) * h,
      size: 1 + sr(i * 13.1 + s) * 3,
      speed: 0.2 + sr(i * 17.9 + s) * 0.8,
      phase: sr(i * 23.1 + s) * Math.PI * 2,
      hue: sr(i * 29.3 + s) * 60,
      brightness: 0.3 + sr(i * 31.7 + s) * 0.7,
    });
  }
}

export function renderBackground(rc: RenderContext, level: number) {
  const t = themeOf(level);
  if (_cW !== rc.width || _cH !== rc.height || _cTheme !== t) rebuild(rc.width, rc.height, t);

  const renderers = [
    renderDeepOcean, renderAurora, renderEmberField, renderCrystalCave,
    renderNebula, renderRainOnGlass, renderLavaLamp, renderNorthernLights,
    renderDigitalRain, renderVoidCosmos,
  ];
  renderers[t](rc);
}

function drawStars(rc: RenderContext, maxAlpha: number) {
  const { ctx, now } = rc;
  for (const s of _stars) {
    const a = maxAlpha * (0.3 + 0.7 * (0.5 + 0.5 * Math.sin(now * 0.002 + s.phase)));
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255,255,255,${a})`;
    ctx.fill();
  }
}

function renderDeepOcean(rc: RenderContext) {
  const { ctx, width, height, now } = rc;

  const grad = ctx.createLinearGradient(0, 0, 0, height);
  grad.addColorStop(0, '#020B18');
  grad.addColorStop(0.4, '#061828');
  grad.addColorStop(0.75, '#082838');
  grad.addColorStop(1, '#0A3040');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, width, height);

  const t = now * 0.0005;
  const cell = 80;
  for (let gx = -cell; gx < width + cell; gx += cell) {
    for (let gy = height * 0.4; gy < height + cell; gy += cell) {
      const w1 = Math.sin(gx * 0.015 + t * 2.3) * Math.cos(gy * 0.012 + t * 1.7);
      const w2 = Math.sin(gx * 0.011 - t * 1.1 + gy * 0.008) * Math.cos(gy * 0.018 + t * 0.9);
      const b = (w1 + w2 + 2) * 0.25;
      if (b > 0.55) {
        const a = (b - 0.55) * 0.1;
        ctx.fillStyle = `rgba(80, 180, 200, ${a})`;
        ctx.beginPath();
        ctx.arc(
          gx + Math.sin(t + gx * 0.008) * 8,
          gy + Math.cos(t * 0.8 + gy * 0.008) * 8,
          cell * 0.5, 0, Math.PI * 2
        );
        ctx.fill();
      }
    }
  }

  for (const p of _particles) {
    const speed = p.speed * 0.3 + 0.15;
    const loopT = now * 0.0001 * speed;
    const y = ((p.y - loopT * height) % height + height) % height;
    const x = p.x + Math.sin(now * 0.0008 * p.speed + p.phase) * 25;
    const pulse = 0.3 + 0.7 * (0.5 + 0.5 * Math.sin(now * 0.003 + p.phase));
    const alpha = pulse * p.brightness * 0.35;
    const hue = 175 + p.hue * 0.3;

    ctx.beginPath();
    ctx.arc(x, y, p.size * 0.8, 0, Math.PI * 2);
    ctx.fillStyle = `hsla(${hue}, 80%, 70%, ${alpha})`;
    ctx.fill();

    if (p.size > 2.5) {
      ctx.beginPath();
      ctx.arc(x, y, p.size * 2.5, 0, Math.PI * 2);
      ctx.fillStyle = `hsla(${hue}, 70%, 60%, ${alpha * 0.15})`;
      ctx.fill();
    }
  }

  drawStars(rc, 0.12);
}

function renderAurora(rc: RenderContext) {
  const { ctx, width, height, now } = rc;

  const grad = ctx.createLinearGradient(0, 0, 0, height);
  grad.addColorStop(0, '#030810');
  grad.addColorStop(0.35, '#061018');
  grad.addColorStop(1, '#0A1820');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, width, height);

  drawStars(rc, 0.5);

  const auroraHues = [120, 150, 170, 180, 340, 155];
  for (let i = 0; i < 6; i++) {
    const baseY = height * (0.08 + i * 0.1);
    const hue = auroraHues[i] + Math.sin(now * 0.0003 + i * 1.5) * 15;
    const ribbonH = 50 + Math.sin(now * 0.0004 + i * 2) * 20;

    ctx.beginPath();
    ctx.moveTo(0, baseY + ribbonH);
    for (let x = 0; x <= width; x += 4) {
      const w1 = Math.sin(x * 0.005 + now * 0.0007 + i * 1.7) * 22;
      const w2 = Math.sin(x * 0.009 + now * 0.0004 + i * 0.9) * 12;
      const w3 = Math.sin(x * 0.003 + now * 0.0002 + i * 2.3) * 8;
      ctx.lineTo(x, baseY + w1 + w2 + w3);
    }
    ctx.lineTo(width, baseY + ribbonH);
    ctx.closePath();

    const aGrad = ctx.createLinearGradient(0, baseY - 25, 0, baseY + ribbonH);
    const alpha = 0.035 + Math.sin(now * 0.0008 + i) * 0.012;
    aGrad.addColorStop(0, 'transparent');
    aGrad.addColorStop(0.2, `hsla(${hue}, 70%, 60%, ${alpha * 0.5})`);
    aGrad.addColorStop(0.5, `hsla(${hue}, 80%, 55%, ${alpha})`);
    aGrad.addColorStop(0.8, `hsla(${hue + 15}, 75%, 50%, ${alpha * 0.5})`);
    aGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = aGrad;
    ctx.fill();
  }
}

function renderEmberField(rc: RenderContext) {
  const { ctx, width, height, now } = rc;

  const grad = ctx.createLinearGradient(0, 0, 0, height);
  grad.addColorStop(0, '#080402');
  grad.addColorStop(0.5, '#100804');
  grad.addColorStop(1, '#180C06');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, width, height);

  const wGlow = ctx.createRadialGradient(width * 0.5, height * 1.2, 0, width * 0.5, height * 1.2, height * 0.8);
  wGlow.addColorStop(0, 'rgba(160, 50, 10, 0.07)');
  wGlow.addColorStop(1, 'transparent');
  ctx.fillStyle = wGlow;
  ctx.fillRect(0, 0, width, height);

  for (const p of _particles) {
    const speed = p.speed * 0.4 + 0.2;
    const loopT = now * 0.00012 * speed;
    const y = ((p.y - loopT * height) % height + height) % height;
    const drift = Math.sin(now * 0.001 * p.speed + p.phase) * 18
      + Math.sin(now * 0.0006 + p.phase * 2) * 10;
    const x = p.x + drift;
    const flicker = 0.3 + 0.7 * (0.5 + 0.5 * Math.sin(now * 0.01 + p.phase * 3));
    const alpha = flicker * p.brightness * 0.4;
    const hue = 15 + p.hue * 0.5;
    const size = p.size * (0.4 + flicker * 0.6);

    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fillStyle = `hsla(${hue}, 95%, 58%, ${alpha})`;
    ctx.fill();

    if (size > 2) {
      ctx.beginPath();
      ctx.arc(x, y, size * 2.5, 0, Math.PI * 2);
      ctx.fillStyle = `hsla(${hue}, 90%, 45%, ${alpha * 0.1})`;
      ctx.fill();
    }
  }

  for (let i = 0; i < 5; i++) {
    const ox = sr(i * 57.3 + 3) * width;
    const oy = height * (0.25 + sr(i * 31.7 + 3) * 0.5);
    const dX = Math.sin(now * 0.0003 + i * 2.1) * 35;
    const dY = Math.sin(now * 0.0002 + i * 1.7) * 25;
    const pulse = 0.5 + 0.5 * Math.sin(now * 0.001 + i * 1.3);
    const r = 25 + pulse * 18;
    const a = 0.025 + pulse * 0.02;

    const og = ctx.createRadialGradient(ox + dX, oy + dY, 0, ox + dX, oy + dY, r);
    og.addColorStop(0, `rgba(255, 130, 30, ${a})`);
    og.addColorStop(0.6, `rgba(255, 60, 15, ${a * 0.4})`);
    og.addColorStop(1, 'transparent');
    ctx.fillStyle = og;
    ctx.beginPath();
    ctx.arc(ox + dX, oy + dY, r, 0, Math.PI * 2);
    ctx.fill();
  }
}

function renderCrystalCave(rc: RenderContext) {
  const { ctx, width, height, now } = rc;

  const grad = ctx.createLinearGradient(0, 0, 0, height);
  grad.addColorStop(0, '#040810');
  grad.addColorStop(0.5, '#081018');
  grad.addColorStop(1, '#0C1825');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, width, height);

  drawStars(rc, 0.15);

  const cx = width * 0.5;
  const cy = height * 0.45;
  const t = now * 0.0002;

  for (let i = 0; i < 8; i++) {
    const angle = t + (i / 8) * Math.PI * 2;
    const dist = 80 + Math.sin(now * 0.0005 + i * 1.3) * 40;
    const px = cx + Math.cos(angle) * dist;
    const py = cy + Math.sin(angle) * dist * 0.7;
    const sz = 40 + Math.sin(now * 0.0008 + i * 2) * 15;

    ctx.save();
    ctx.translate(px, py);
    ctx.rotate(angle + now * 0.0001);

    const sides = 6;
    ctx.beginPath();
    for (let s = 0; s <= sides; s++) {
      const a = (s / sides) * Math.PI * 2;
      const r = sz * (0.8 + 0.2 * Math.sin(a * 3 + now * 0.001));
      const sx = Math.cos(a) * r;
      const sy = Math.sin(a) * r;
      if (s === 0) ctx.moveTo(sx, sy);
      else ctx.lineTo(sx, sy);
    }
    ctx.closePath();

    const hue = 192 + i * 3 + Math.sin(now * 0.0006 + i) * 6;
    const alpha = 0.025 + Math.sin(now * 0.001 + i * 0.7) * 0.01;
    const fGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, sz);
    fGrad.addColorStop(0, `hsla(${hue}, 60%, 80%, ${alpha * 1.5})`);
    fGrad.addColorStop(0.6, `hsla(${hue + 8}, 50%, 60%, ${alpha})`);
    fGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = fGrad;
    ctx.fill();

    ctx.strokeStyle = `hsla(${Math.min(hue + 20, 220)}, 70%, 75%, ${alpha * 1.2})`;
    ctx.lineWidth = 0.5;
    ctx.stroke();

    ctx.restore();
  }

  for (let i = 0; i < 15; i++) {
    const sx = sr(i * 43.7 + 4) * width;
    const sy = sr(i * 67.3 + 4) * height;
    const sparkle = 0.5 + 0.5 * Math.sin(now * 0.005 + i * 2.7);
    if (sparkle > 0.7) {
      const sa = (sparkle - 0.7) * 1.8;
      const ss = 1 + sparkle * 2;
      ctx.beginPath();
      ctx.arc(sx, sy, ss, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(200, 230, 255, ${sa * 0.3})`;
      ctx.fill();
    }
  }
}

function renderNebula(rc: RenderContext) {
  const { ctx, width, height, now } = rc;

  const grad = ctx.createLinearGradient(0, 0, 0, height);
  grad.addColorStop(0, '#050508');
  grad.addColorStop(0.5, '#080A10');
  grad.addColorStop(1, '#0A0C14');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, width, height);

  drawStars(rc, 0.4);

  const blobs = [
    { sx: 0.25, sy: 0.3, hue: 180, r: 150 },
    { sx: 0.7, sy: 0.5, hue: 38, r: 130 },
    { sx: 0.4, sy: 0.7, hue: 165, r: 120 },
    { sx: 0.8, sy: 0.25, hue: 45, r: 100 },
    { sx: 0.15, sy: 0.6, hue: 195, r: 110 },
    { sx: 0.6, sy: 0.15, hue: 32, r: 90 },
  ];

  for (let i = 0; i < blobs.length; i++) {
    const bl = blobs[i];
    const bx = bl.sx * width + Math.sin(now * 0.0002 + i * 2.3) * 40;
    const by = bl.sy * height + Math.cos(now * 0.00015 + i * 1.7) * 30;
    const br = bl.r + Math.sin(now * 0.0003 + i * 3.1) * 25;
    const hue = bl.hue + Math.sin(now * 0.0004 + i) * 10;
    const alpha = 0.04 + Math.sin(now * 0.0006 + i * 1.5) * 0.015;

    const ng = ctx.createRadialGradient(bx, by, 0, bx, by, br);
    ng.addColorStop(0, `hsla(${hue}, 60%, 55%, ${alpha})`);
    ng.addColorStop(0.4, `hsla(${hue + 12}, 50%, 45%, ${alpha * 0.6})`);
    ng.addColorStop(0.7, `hsla(${hue + 20}, 40%, 35%, ${alpha * 0.2})`);
    ng.addColorStop(1, 'transparent');
    ctx.fillStyle = ng;
    ctx.beginPath();
    ctx.arc(bx, by, br, 0, Math.PI * 2);
    ctx.fill();
  }
}

function renderRainOnGlass(rc: RenderContext) {
  const { ctx, width, height, now } = rc;

  const grad = ctx.createLinearGradient(0, 0, 0, height);
  grad.addColorStop(0, '#060A10');
  grad.addColorStop(0.5, '#0A1018');
  grad.addColorStop(1, '#0E1620');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, width, height);

  for (let i = 0; i < 12; i++) {
    const bx = sr(i * 41.3 + 6) * width;
    const by = sr(i * 73.7 + 6) * height;
    const br = 30 + sr(i * 17.1 + 6) * 50;
    const pulse = 0.5 + 0.5 * Math.sin(now * 0.0005 + i * 2.3);
    const alpha = 0.02 + pulse * 0.015;
    const hue = 200 + sr(i * 51.3) * 25;

    const bg = ctx.createRadialGradient(bx, by, 0, bx, by, br);
    bg.addColorStop(0, `hsla(${hue}, 40%, 60%, ${alpha})`);
    bg.addColorStop(0.7, `hsla(${hue}, 30%, 50%, ${alpha * 0.3})`);
    bg.addColorStop(1, 'transparent');
    ctx.fillStyle = bg;
    ctx.beginPath();
    ctx.arc(bx, by, br, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.lineCap = 'round';
  for (const p of _particles) {
    const speed = p.speed * 2 + 1;
    const loopT = now * 0.0003 * speed;
    const y = (p.y + loopT * height) % height;
    const x = p.x + Math.sin(p.phase) * 3;
    const streakLen = 8 + p.speed * 15;
    const alpha = p.brightness * 0.18;

    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + 0.3, y - streakLen);
    ctx.strokeStyle = `rgba(180, 210, 240, ${alpha})`;
    ctx.lineWidth = 0.5 + p.size * 0.15;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(x, y, 0.8, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(210, 230, 250, ${alpha * 1.4})`;
    ctx.fill();
  }
  ctx.lineCap = 'butt';
}

function renderLavaLamp(rc: RenderContext) {
  const { ctx, width, height, now } = rc;

  const grad = ctx.createLinearGradient(0, 0, 0, height);
  grad.addColorStop(0, '#0A0408');
  grad.addColorStop(0.5, '#120610');
  grad.addColorStop(1, '#180816');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, width, height);

  const blobs = [
    { sx: 0.2, phase: 0, hue: 0, baseR: 60 },
    { sx: 0.5, phase: 1.5, hue: 25, baseR: 70 },
    { sx: 0.8, phase: 3, hue: 340, baseR: 55 },
    { sx: 0.35, phase: 4.5, hue: 15, baseR: 50 },
    { sx: 0.65, phase: 2.2, hue: 350, baseR: 65 },
    { sx: 0.15, phase: 5.1, hue: 30, baseR: 45 },
    { sx: 0.85, phase: 0.8, hue: 8, baseR: 55 },
  ];

  for (let i = 0; i < blobs.length; i++) {
    const bl = blobs[i];
    const cycle = (now * 0.00008 + bl.phase) % (Math.PI * 2);
    const bx = bl.sx * width + Math.sin(now * 0.0002 + bl.phase) * 40;
    const by = height * (0.3 + Math.sin(cycle) * 0.25);
    const stretch = 1 + Math.sin(cycle * 2) * 0.3;
    const r = bl.baseR + Math.sin(now * 0.0005 + bl.phase) * 15;
    const hue = bl.hue + Math.sin(now * 0.0003 + i) * 10;
    const alpha = 0.055 + Math.sin(now * 0.0008 + bl.phase) * 0.02;

    ctx.save();
    ctx.translate(bx, by);
    ctx.scale(1, stretch);

    const lg = ctx.createRadialGradient(0, 0, 0, 0, 0, r);
    lg.addColorStop(0, `hsla(${hue}, 90%, 55%, ${alpha})`);
    lg.addColorStop(0.4, `hsla(${hue + 8}, 85%, 45%, ${alpha * 0.7})`);
    lg.addColorStop(0.7, `hsla(${hue + 15}, 80%, 35%, ${alpha * 0.3})`);
    lg.addColorStop(1, 'transparent');
    ctx.fillStyle = lg;
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }
}

function renderNorthernLights(rc: RenderContext) {
  const { ctx, width, height, now } = rc;

  const grad = ctx.createLinearGradient(0, 0, 0, height);
  grad.addColorStop(0, '#040608');
  grad.addColorStop(0.4, '#080C12');
  grad.addColorStop(1, '#0C1018');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, width, height);

  drawStars(rc, 0.45);

  const palette = [45, 350, 140, 30, 160, 10, 50, 120];

  for (let i = 0; i < palette.length; i++) {
    const baseHue = palette[i];
    const baseY = height * (0.06 + i * 0.08);
    const hue = baseHue + Math.sin(now * 0.0004 + i * 1.1) * 15;
    const ribbonH = 45 + Math.sin(now * 0.0003 + i * 1.8) * 18;

    ctx.beginPath();
    ctx.moveTo(0, baseY + ribbonH);
    for (let x = 0; x <= width; x += 3) {
      const w1 = Math.sin(x * 0.006 + now * 0.001 + i * 1.5) * 18;
      const w2 = Math.sin(x * 0.01 + now * 0.0006 + i * 0.7) * 10;
      const w3 = Math.sin(x * 0.004 + now * 0.0004 + i * 2.1) * 7;
      const w4 = Math.sin(x * 0.015 + now * 0.0008 + i * 3.2) * 5;
      ctx.lineTo(x, baseY + w1 + w2 + w3 + w4);
    }
    ctx.lineTo(width, baseY + ribbonH);
    ctx.closePath();

    const rGrad = ctx.createLinearGradient(0, baseY - 20, 0, baseY + ribbonH);
    const alpha = 0.04 + Math.sin(now * 0.0007 + i * 0.9) * 0.015;
    rGrad.addColorStop(0, 'transparent');
    rGrad.addColorStop(0.25, `hsla(${hue}, 75%, 55%, ${alpha * 0.4})`);
    rGrad.addColorStop(0.5, `hsla(${hue}, 85%, 50%, ${alpha})`);
    rGrad.addColorStop(0.75, `hsla(${hue + 12}, 80%, 45%, ${alpha * 0.4})`);
    rGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = rGrad;
    ctx.fill();
  }
}

function renderDigitalRain(rc: RenderContext) {
  const { ctx, width, height, now } = rc;

  const grad = ctx.createLinearGradient(0, 0, 0, height);
  grad.addColorStop(0, '#020804');
  grad.addColorStop(0.5, '#041008');
  grad.addColorStop(1, '#06180C');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, width, height);

  ctx.strokeStyle = 'rgba(0, 80, 40, 0.03)';
  ctx.lineWidth = 0.5;
  const gridSp = 30;
  for (let x = (now * 0.005) % gridSp; x < width; x += gridSp) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }

  const colW = 18;
  const cols = Math.ceil(width / colW);
  const dotSp = 14;
  const trailLen = 16;

  for (let c = 0; c < cols; c++) {
    const x = c * colW + colW * 0.5;
    const speed = 0.04 + sr(c * 7.3 + 9) * 0.06;
    const colOffset = sr(c * 13.1 + 9) * height * 3;
    const headY = (now * speed + colOffset) % (height + trailLen * dotSp);

    for (let d = 0; d < trailLen; d++) {
      const y = headY - d * dotSp;
      if (y < -5 || y > height + 5) continue;

      const fade = 1 - d / trailLen;
      const alpha = fade * 0.35;
      if (alpha <= 0.01) continue;

      const lit = d === 0 ? 85 : 45 + sr(c * 3.1 + d * 7.7 + 9) * 15;
      const hue = 145 + sr(c * 11.3 + d * 3.3) * 15;
      const sz = d === 0 ? 2 : 1.2;

      ctx.fillStyle = `hsla(${hue}, 80%, ${lit}%, ${alpha})`;
      ctx.fillRect(x - sz * 0.5, y - sz * 0.5, sz, sz);
    }
  }

  for (let i = 0; i < 6; i++) {
    const fx = sr(i * 23.7 + 9) * width;
    const speed = 0.06 + sr(i * 31.1 + 9) * 0.04;
    const fy = (now * speed + sr(i * 47.3 + 9) * height * 2) % (height + 20) - 10;
    const pulse = 0.5 + 0.5 * Math.sin(now * 0.005 + i * 2.1);

    ctx.beginPath();
    ctx.arc(fx, fy, 2 + pulse, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(100, 255, 150, ${0.15 + pulse * 0.1})`;
    ctx.fill();

    ctx.beginPath();
    ctx.arc(fx, fy, 6 + pulse * 3, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(80, 200, 120, ${0.03 + pulse * 0.02})`;
    ctx.fill();
  }
}

function renderVoidCosmos(rc: RenderContext) {
  const { ctx, width, height, now } = rc;

  const grad = ctx.createLinearGradient(0, 0, 0, height);
  grad.addColorStop(0, '#020204');
  grad.addColorStop(0.5, '#040408');
  grad.addColorStop(1, '#06060C');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, width, height);

  const gcx = width * 0.5;
  const gcy = height * 0.45;
  const coreR = 80 + Math.sin(now * 0.0003) * 10;
  const cGlow = ctx.createRadialGradient(gcx, gcy, 0, gcx, gcy, coreR);
  cGlow.addColorStop(0, 'rgba(100, 180, 220, 0.06)');
  cGlow.addColorStop(0.3, 'rgba(80, 150, 200, 0.03)');
  cGlow.addColorStop(1, 'transparent');
  ctx.fillStyle = cGlow;
  ctx.beginPath();
  ctx.arc(gcx, gcy, coreR, 0, Math.PI * 2);
  ctx.fill();

  for (const p of _particles) {
    const dx = p.x - gcx;
    const dy = p.y - gcy;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const baseAngle = Math.atan2(dy, dx);

    const orbitSpeed = 0.0002 + (1 / (dist + 50)) * 2;
    const angle = baseAngle + now * orbitSpeed * p.speed + p.phase;
    const spiralOffset = dist * 0.01;
    const armAngle = angle + spiralOffset;

    const px = gcx + Math.cos(armAngle) * dist;
    const py = gcy + Math.sin(armAngle) * dist * 0.7;

    const twinkle = 0.3 + 0.7 * (0.5 + 0.5 * Math.sin(now * 0.003 + p.phase));
    const alpha = twinkle * p.brightness * 0.45;
    const cosmosHue = p.hue < 30 ? (40 + p.hue * 0.5) : (180 + (p.hue - 30) * 1.3);

    ctx.beginPath();
    ctx.arc(px, py, p.size * 0.6, 0, Math.PI * 2);
    ctx.fillStyle = `hsla(${cosmosHue}, 60%, 75%, ${alpha})`;
    ctx.fill();
  }

  drawStars(rc, 0.55);

  for (let i = 0; i < 3; i++) {
    const period = 8000;
    const cycle = ((now + i * period / 3) % period) / period;
    if (cycle > 0.12) continue;

    const t = cycle / 0.12;
    const seed = Math.floor((now + i * period / 3) / period);
    const startX = sr(seed * 7.3 + i * 23.1) * width;
    const startY = sr(seed * 11.7 + i * 37.3) * height * 0.5;
    const angle = 0.3 + sr(seed + i * 5) * 0.6;
    const dist = t * 200;

    const sx = startX + Math.cos(angle) * dist;
    const sy = startY + Math.sin(angle) * dist;
    const tailLen = 40;
    const tx = sx - Math.cos(angle) * tailLen;
    const ty = sy - Math.sin(angle) * tailLen;

    const alpha = Math.sin(t * Math.PI) * 0.5;
    const sGrad = ctx.createLinearGradient(tx, ty, sx, sy);
    sGrad.addColorStop(0, 'transparent');
    sGrad.addColorStop(1, `rgba(255, 255, 255, ${alpha})`);
    ctx.beginPath();
    ctx.moveTo(tx, ty);
    ctx.lineTo(sx, sy);
    ctx.strokeStyle = sGrad;
    ctx.lineWidth = 1.5;
    ctx.lineCap = 'round';
    ctx.stroke();
    ctx.lineCap = 'butt';
  }
}
