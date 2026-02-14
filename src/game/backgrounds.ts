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
  hue: number;
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
  const counts: Record<number, number> = { 0: a / 2500, 2: a / 2000, 5: a / 2500, 9: a / 2000 };
  return Math.floor(counts[theme] ?? 0);
}

function rebuild(w: number, h: number, theme: number) {
  _cW = w;
  _cH = h;
  _cTheme = theme;
  _particles = [];
  _stars = [];

  const sc = Math.floor((w * h) / 3000);
  for (let i = 0; i < sc; i++) {
    _stars.push({
      x: sr(i * 3.1 + 0.5) * w,
      y: sr(i * 7.3 + 0.5) * h,
      r: 0.3 + sr(i * 11.7 + 0.5) * 1.2,
      phase: sr(i * 17.3 + 0.5) * Math.PI * 2,
      hue: sr(i * 41.3) * 40 + 190,
    });
  }

  const pc = pCount(theme, w, h);
  for (let i = 0; i < pc; i++) {
    const s = theme * 100;
    _particles.push({
      x: sr(i * 5.7 + s) * w,
      y: sr(i * 9.3 + s) * h,
      size: 0.5 + sr(i * 13.1 + s) * 3.5,
      speed: 0.15 + sr(i * 17.9 + s) * 0.85,
      phase: sr(i * 23.1 + s) * Math.PI * 2,
      hue: sr(i * 29.3 + s) * 60,
      brightness: 0.2 + sr(i * 31.7 + s) * 0.8,
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

function drawStars(rc: RenderContext, maxAlpha: number, colorful = false) {
  const { ctx, now } = rc;
  for (const s of _stars) {
    const a = maxAlpha * (0.2 + 0.8 * (0.5 + 0.5 * Math.sin(now * 0.002 + s.phase)));
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
    ctx.fillStyle = colorful && s.r > 0.8
      ? `hsla(${s.hue}, 30%, 90%, ${a})` : `rgba(255,255,255,${a})`;
    ctx.fill();
  }
}

function orb(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, h: number, s: number, l: number, a: number) {
  const g = ctx.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, `hsla(${h}, ${s}%, ${l}%, ${a})`);
  g.addColorStop(0.4, `hsla(${h}, ${s}%, ${l * 0.7}%, ${a * 0.35})`);
  g.addColorStop(1, 'transparent');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
}

function lightBeam(ctx: CanvasRenderingContext2D, x: number, y0: number, y1: number, w0: number, w1: number, a: number, h: number) {
  ctx.beginPath();
  ctx.moveTo(x - w0 / 2, y0);
  ctx.lineTo(x + w0 / 2, y0);
  ctx.lineTo(x + w1 / 2, y1);
  ctx.lineTo(x - w1 / 2, y1);
  ctx.closePath();
  const g = ctx.createLinearGradient(0, y0, 0, y1);
  g.addColorStop(0, `hsla(${h}, 50%, 80%, ${a})`);
  g.addColorStop(0.5, `hsla(${h}, 40%, 70%, ${a * 0.4})`);
  g.addColorStop(1, 'transparent');
  ctx.fillStyle = g;
  ctx.fill();
}

function auroraCurtain(ctx: CanvasRenderingContext2D, w: number, baseY: number, rH: number, now: number, i: number, hue: number, a: number) {
  ctx.beginPath();
  ctx.moveTo(0, baseY + rH);
  for (let x = 0; x <= w; x += 3) {
    const y = Math.sin(x * 0.005 + now * 0.0007 + i * 1.5) * 22
      + Math.sin(x * 0.009 + now * 0.0004 + i * 0.9) * 14
      + Math.sin(x * 0.003 + now * 0.0002 + i * 2.3) * 9
      + Math.sin(x * 0.015 + now * 0.0008 + i * 3.2) * 5
      + Math.sin(x * 0.007 + now * 0.0005 + i * 1.1) * 11;
    ctx.lineTo(x, baseY + y);
  }
  ctx.lineTo(w, baseY + rH);
  ctx.closePath();
  const g = ctx.createLinearGradient(0, baseY - rH * 0.4, 0, baseY + rH);
  g.addColorStop(0, 'transparent');
  g.addColorStop(0.15, `hsla(${hue}, 72%, 60%, ${a * 0.3})`);
  g.addColorStop(0.4, `hsla(${hue}, 84%, 55%, ${a})`);
  g.addColorStop(0.6, `hsla(${hue + 10}, 86%, 52%, ${a * 0.9})`);
  g.addColorStop(0.8, `hsla(${hue + 5}, 70%, 55%, ${a * 0.3})`);
  g.addColorStop(1, 'transparent');
  ctx.fillStyle = g;
  ctx.fill();
}

function renderDeepOcean(rc: RenderContext) {
  const { ctx, width: w, height: h, now } = rc;
  const bg = ctx.createLinearGradient(0, 0, 0, h);
  bg.addColorStop(0, '#010810');
  bg.addColorStop(0.25, '#031520');
  bg.addColorStop(0.5, '#052530');
  bg.addColorStop(0.75, '#083040');
  bg.addColorStop(1, '#0B3848');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, w, h);

  for (let i = 0; i < 5; i++) {
    const x = w * (0.12 + i * 0.19) + Math.sin(now * 0.0003 + i * 1.7) * 30;
    const tw = 6 + Math.sin(now * 0.0005 + i * 2.3) * 3;
    const bw = 70 + Math.sin(now * 0.0004 + i * 1.9) * 20;
    lightBeam(ctx, x, -10, h * 0.8, tw, bw, 0.03 + Math.sin(now * 0.0006 + i * 1.3) * 0.012, 190);
  }

  const ct = now * 0.0004;
  for (let gx = 0; gx < w; gx += 45) {
    for (let gy = h * 0.3; gy < h; gy += 45) {
      const v1 = Math.sin(gx * 0.018 + ct * 2.5) * Math.cos(gy * 0.014 + ct * 1.8);
      const v2 = Math.sin(gx * 0.012 - ct * 1.3 + gy * 0.009) * Math.cos(gy * 0.02 + ct);
      const v3 = Math.sin((gx + gy) * 0.008 + ct * 0.7) * 0.5;
      const b = (v1 + v2 + v3 + 3) / 6;
      if (b > 0.5) {
        ctx.fillStyle = `rgba(60, 190, 210, ${(b - 0.5) * 0.16})`;
        ctx.beginPath();
        ctx.arc(gx + Math.sin(ct * 1.5 + gx * 0.01) * 10, gy + Math.cos(ct * 1.2 + gy * 0.01) * 10, 22 + b * 12, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  for (let i = 0; i < 8; i++) {
    const jx = sr(i * 37.3 + 0.1) * w + Math.sin(now * 0.0002 + i * 2.1) * 40;
    const jy = sr(i * 53.7 + 0.1) * h * 0.65 + h * 0.15 + Math.sin(now * 0.00015 + i * 1.7) * 25;
    const pulse = 0.5 + 0.5 * Math.sin(now * 0.001 + i * 1.3);
    const bodyR = 14 + sr(i * 19.3) * 10 + pulse * 5;
    const hue = 175 + sr(i * 23.7) * 25;
    const a = 0.025 + pulse * 0.02;
    orb(ctx, jx, jy, bodyR * 2.8, hue, 70, 65, a * 0.4);
    ctx.beginPath();
    ctx.ellipse(jx, jy, bodyR, bodyR * 0.55, 0, Math.PI, 0);
    ctx.fillStyle = `hsla(${hue}, 75%, 72%, ${a})`;
    ctx.fill();
    for (let t = 0; t < 4; t++) {
      const tx = jx + (t - 1.5) * bodyR * 0.45;
      ctx.beginPath();
      ctx.moveTo(tx, jy);
      for (let seg = 0; seg < 28; seg += 3) {
        ctx.lineTo(tx + Math.sin(now * 0.003 + i * 2 + t + seg * 0.1) * (3 + seg * 0.12), jy + seg);
      }
      ctx.strokeStyle = `hsla(${hue}, 60%, 65%, ${a * 0.4})`;
      ctx.lineWidth = 0.8;
      ctx.stroke();
    }
  }

  for (const pt of _particles) {
    const spd = pt.speed * 0.25 + 0.12;
    const y = ((pt.y - now * 0.00008 * spd * h) % h + h) % h;
    const x = pt.x + Math.sin(now * 0.0006 * pt.speed + pt.phase) * 28 + Math.cos(now * 0.0004 + pt.phase * 1.5) * 14;
    const pulse = 0.5 + 0.5 * Math.sin(now * 0.004 + pt.phase);
    const flash = Math.sin(now * 0.008 + pt.phase * 5) > 0.93 ? 2.5 : 1;
    const a = pulse * pt.brightness * 0.32 * flash;
    const hue = 170 + pt.hue * 0.4;
    const sz = pt.size * 0.7 * (0.8 + pulse * 0.4);
    ctx.beginPath();
    ctx.arc(x, y, sz, 0, Math.PI * 2);
    ctx.fillStyle = `hsla(${hue}, 80%, ${65 + pulse * 15}%, ${a})`;
    ctx.fill();
    if (flash > 1 || pt.size > 3) {
      ctx.beginPath();
      ctx.arc(x, y, sz * 3.5, 0, Math.PI * 2);
      ctx.fillStyle = `hsla(${hue}, 60%, 60%, ${a * 0.1})`;
      ctx.fill();
    }
  }

  for (let c = 0; c < 4; c++) {
    const cx = w * (0.18 + c * 0.22) + Math.sin(now * 0.0001 + c * 3) * 20;
    for (let b = 0; b < 14; b++) {
      const spd = 0.04 + sr(c * 11 + b * 7) * 0.035;
      const by = (h + 20) - ((now * spd + sr(c * 17 + b * 13) * h) % (h + 40));
      const bx = cx + Math.sin(now * 0.002 + b * 1.5 + c) * 8;
      const bs = 1.5 + sr(c * 5 + b * 3) * 2.5;
      ctx.beginPath();
      ctx.arc(bx, by, bs, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(140, 215, 235, ${0.06 + sr(c * 3 + b * 9) * 0.05})`;
      ctx.lineWidth = 0.5;
      ctx.stroke();
    }
  }

  const hg = ctx.createLinearGradient(0, h * 0.6, 0, h);
  hg.addColorStop(0, 'transparent');
  hg.addColorStop(1, 'rgba(10, 60, 80, 0.04)');
  ctx.fillStyle = hg;
  ctx.fillRect(0, h * 0.6, w, h * 0.4);
  drawStars(rc, 0.06);
}

function renderAurora(rc: RenderContext) {
  const { ctx, width: w, height: h, now } = rc;
  const bg = ctx.createLinearGradient(0, 0, 0, h);
  bg.addColorStop(0, '#020610');
  bg.addColorStop(0.3, '#050C18');
  bg.addColorStop(0.7, '#081420');
  bg.addColorStop(1, '#0B1A28');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, w, h);

  drawStars(rc, 0.55, true);

  for (let i = 0; i < 80; i++) {
    const x = sr(i * 7.1 + 200) * w;
    const y = h * (0.05 + sr(i * 11.3 + 200) * 0.35);
    ctx.beginPath();
    ctx.arc(x, y, 0.3 + sr(i * 13.7 + 200) * 0.8, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255,255,255,${0.12 + sr(i * 17.1 + 200) * 0.2})`;
    ctx.fill();
  }

  const mwg = ctx.createLinearGradient(0, h * 0.02, 0, h * 0.4);
  mwg.addColorStop(0, 'transparent');
  mwg.addColorStop(0.5, 'rgba(120, 160, 200, 0.015)');
  mwg.addColorStop(1, 'transparent');
  ctx.fillStyle = mwg;
  ctx.fillRect(0, h * 0.02, w, h * 0.38);

  const hues = [120, 155, 175, 185, 340, 160, 140, 170];
  for (let i = 0; i < hues.length; i++) {
    const hue = hues[i] + Math.sin(now * 0.0003 + i * 1.5) * 15;
    const y = h * (0.04 + i * 0.065);
    const rH = 55 + Math.sin(now * 0.0004 + i * 2) * 20;
    auroraCurtain(ctx, w, y, rH, now, i, hue, 0.045 + Math.sin(now * 0.0008 + i) * 0.015);
  }

  for (let i = 0; i < 14; i++) {
    const px = sr(i * 31.7 + 1) * w;
    const py = h * (0.06 + sr(i * 47.3 + 1) * 0.38);
    const pulse = 0.5 + 0.5 * Math.sin(now * 0.002 + i * 2.3);
    if (pulse > 0.65) {
      orb(ctx, px, py, 18 + pulse * 14, 130 + sr(i * 23) * 50, 70, 60, (pulse - 0.65) * 0.1);
    }
  }

  const rg = ctx.createLinearGradient(0, h * 0.85, 0, h);
  rg.addColorStop(0, 'transparent');
  rg.addColorStop(0.5, `hsla(140, 50%, 40%, ${0.025 + Math.sin(now * 0.0005) * 0.01})`);
  rg.addColorStop(1, `hsla(160, 40%, 30%, ${0.035 + Math.sin(now * 0.0004) * 0.01})`);
  ctx.fillStyle = rg;
  ctx.fillRect(0, h * 0.85, w, h * 0.15);

  for (let i = 0; i < 6; i++) {
    const fx = sr(i * 67.3 + 1) * w;
    const fy = sr(i * 43.7 + 1) * h * 0.4;
    const pulse = 0.5 + 0.5 * Math.sin(now * 0.003 + i * 1.7);
    ctx.beginPath();
    ctx.arc(fx, fy, 1 + pulse * 2, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255, 255, 240, ${0.3 + pulse * 0.4})`;
    ctx.fill();
    ctx.strokeStyle = `rgba(255, 255, 240, ${pulse * 0.15})`;
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    ctx.moveTo(fx - 6 - pulse * 4, fy);
    ctx.lineTo(fx + 6 + pulse * 4, fy);
    ctx.moveTo(fx, fy - 4 - pulse * 3);
    ctx.lineTo(fx, fy + 4 + pulse * 3);
    ctx.stroke();
  }
}

function renderEmberField(rc: RenderContext) {
  const { ctx, width: w, height: h, now } = rc;
  const bg = ctx.createLinearGradient(0, 0, 0, h);
  bg.addColorStop(0, '#060200');
  bg.addColorStop(0.3, '#0C0503');
  bg.addColorStop(0.6, '#140906');
  bg.addColorStop(1, '#1C0E08');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, w, h);

  for (let i = 0; i < 3; i++) {
    const gx = w * (0.2 + i * 0.3) + Math.sin(now * 0.0002 + i * 2.1) * 60;
    const pulse = 0.5 + 0.5 * Math.sin(now * 0.0008 + i * 1.5);
    orb(ctx, gx, h * 1.15, h * 0.4 + pulse * 40, 15, 85, 45, 0.04 + pulse * 0.025);
  }

  for (let i = 0; i < 6; i++) {
    const baseY = h * (0.3 + i * 0.1);
    ctx.beginPath();
    for (let x = 0; x <= w; x += 4) {
      const y = baseY + Math.sin(x * 0.01 + now * 0.001 + i * 2) * 8
        + Math.sin(x * 0.006 + now * 0.0007 + i * 1.3) * 5;
      if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.strokeStyle = `rgba(200, 80, 20, ${0.015 + Math.sin(now * 0.001 + i) * 0.005})`;
    ctx.lineWidth = 15 + i * 3;
    ctx.stroke();
  }

  for (let i = 0; i < 5; i++) {
    const baseX = sr(i * 43.3 + 2) * w;
    const t = now * 0.00015;
    ctx.beginPath();
    for (let seg = 0; seg < 60; seg++) {
      const frac = seg / 60;
      const x = baseX + Math.sin(seg * 0.15 + t + i * 2) * 25 * (1 + frac)
        + Math.sin(seg * 0.08 + t * 0.7 + i) * 15;
      const y = h * (0.9 - frac * 0.6);
      if (seg === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.strokeStyle = `rgba(60, 40, 30, ${0.04 + Math.sin(now * 0.0005 + i) * 0.015})`;
    ctx.lineWidth = 8 + Math.sin(now * 0.0003 + i * 3) * 3;
    ctx.lineCap = 'round';
    ctx.stroke();
  }
  ctx.lineCap = 'butt';

  for (let i = 0; i < 8; i++) {
    const ox = sr(i * 57.3 + 3) * w + Math.sin(now * 0.0003 + i * 2.1) * 35;
    const oy = h * (0.2 + sr(i * 31.7 + 3) * 0.55) + Math.sin(now * 0.0002 + i * 1.7) * 25;
    const pulse = 0.5 + 0.5 * Math.sin(now * 0.001 + i * 1.3);
    orb(ctx, ox, oy, 22 + pulse * 18 + sr(i * 13) * 15, 10 + sr(i * 7) * 30, 90, 55, 0.03 + pulse * 0.025);
  }

  for (const pt of _particles) {
    const spd = pt.speed * 0.35 + 0.18;
    const y = ((pt.y - now * 0.00012 * spd * h) % h + h) % h;
    const x = pt.x + Math.sin(now * 0.001 * pt.speed + pt.phase) * 20
      + Math.sin(now * 0.0007 + pt.phase * 2) * 12;
    const flicker = 0.3 + 0.7 * (0.5 + 0.5 * Math.sin(now * 0.012 + pt.phase * 3));
    const a = flicker * pt.brightness * 0.4;
    const hue = 12 + pt.hue * 0.5;
    const sz = pt.size * (0.4 + flicker * 0.6);
    ctx.beginPath();
    ctx.arc(x, y, sz, 0, Math.PI * 2);
    ctx.fillStyle = `hsla(${hue}, 95%, ${55 + flicker * 15}%, ${a})`;
    ctx.fill();
    if (sz > 2.5) {
      ctx.beginPath();
      ctx.arc(x, y, sz * 3, 0, Math.PI * 2);
      ctx.fillStyle = `hsla(${hue}, 85%, 50%, ${a * 0.08})`;
      ctx.fill();
    }
  }

  for (let i = 0; i < 4; i++) {
    const flash = Math.sin(now * 0.003 + i * 7.3);
    if (flash > 0.95) {
      const fx = sr(Math.floor(now * 0.003 + i * 7.3) + i) * w;
      const fy = h * (0.3 + sr(i * 19.7) * 0.4);
      orb(ctx, fx, fy, 35, 30, 100, 80, (flash - 0.95) * 1.2);
    }
  }
}

function renderCrystalCave(rc: RenderContext) {
  const { ctx, width: w, height: h, now } = rc;
  const bg = ctx.createLinearGradient(0, 0, 0, h);
  bg.addColorStop(0, '#030610');
  bg.addColorStop(0.5, '#060C1A');
  bg.addColorStop(1, '#0A1428');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, w, h);

  drawStars(rc, 0.2);

  for (let i = 0; i < 5; i++) {
    const x = w * (0.15 + i * 0.175) + Math.sin(now * 0.0002 + i * 2) * 20;
    ctx.save();
    ctx.translate(x, 0);
    ctx.rotate(Math.sin(now * 0.0001 + i * 1.5) * 0.15);
    lightBeam(ctx, 0, -10, h * 0.85, 3 + Math.sin(now * 0.0005 + i) * 1.5,
      50 + Math.sin(now * 0.0003 + i * 1.7) * 15, 0.022 + Math.sin(now * 0.0006 + i) * 0.008, 195);
    lightBeam(ctx, 3, -10, h * 0.7, 1, 15, 0.012, 215);
    lightBeam(ctx, -3, -10, h * 0.7, 1, 15, 0.012, 175);
    ctx.restore();
  }

  const cx = w * 0.5;
  const cy = h * 0.45;
  const rot = now * 0.00015;
  for (let i = 0; i < 12; i++) {
    const angle = rot + (i / 12) * Math.PI * 2;
    const dist = 60 + sr(i * 17.3 + 4) * 80 + Math.sin(now * 0.0004 + i * 1.3) * 20;
    const px = cx + Math.cos(angle) * dist;
    const py = cy + Math.sin(angle) * dist * 0.65;
    const sz = 25 + sr(i * 23.7 + 4) * 20 + Math.sin(now * 0.0006 + i * 2) * 8;
    ctx.save();
    ctx.translate(px, py);
    ctx.rotate(angle * 0.5 + now * 0.00008);
    ctx.beginPath();
    for (let v = 0; v <= 6; v++) {
      const a = (v / 6) * Math.PI * 2;
      const r = sz * (0.85 + 0.15 * Math.sin(a * 3 + now * 0.001));
      if (v === 0) ctx.moveTo(Math.cos(a) * r, Math.sin(a) * r);
      else ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
    }
    ctx.closePath();
    const hue = 192 + Math.sin(now * 0.0005 + i * 0.7) * 8;
    const a = 0.028 + Math.sin(now * 0.001 + i * 0.5) * 0.012;
    const fg = ctx.createRadialGradient(0, 0, 0, 0, 0, sz);
    fg.addColorStop(0, `hsla(${hue}, 65%, 82%, ${a * 1.5})`);
    fg.addColorStop(0.5, `hsla(${hue + 5}, 55%, 65%, ${a})`);
    fg.addColorStop(1, 'transparent');
    ctx.fillStyle = fg;
    ctx.fill();
    ctx.strokeStyle = `hsla(${Math.min(hue + 20, 218)}, 70%, 75%, ${a * 1.2})`;
    ctx.lineWidth = 0.6;
    ctx.stroke();
    ctx.restore();
  }

  for (let i = 0; i < 3; i++) {
    const sx = w * (0.25 + i * 0.25) + Math.sin(now * 0.0003 + i * 2) * 50;
    const sy = h * (0.3 + i * 0.2) + Math.cos(now * 0.0002 + i * 1.5) * 30;
    const pulse = 0.5 + 0.5 * Math.sin(now * 0.0005 + i * 1.8);
    orb(ctx, sx, sy, 50 + pulse * 20, 190 + Math.sin(now * 0.0008 + i * 3) * 15, 40, 70, 0.02 + pulse * 0.01);
  }

  for (let i = 0; i < 25; i++) {
    const sx = sr(i * 43.7 + 4) * w;
    const sy = sr(i * 67.3 + 4) * h;
    const sparkle = 0.5 + 0.5 * Math.sin(now * 0.006 + i * 2.7);
    if (sparkle > 0.65) {
      ctx.beginPath();
      ctx.arc(sx, sy, 1 + sparkle * 2, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(200, 230, 255, ${(sparkle - 0.65) * 0.5})`;
      ctx.fill();
    }
  }
}

function renderNebula(rc: RenderContext) {
  const { ctx, width: w, height: h, now } = rc;
  const bg = ctx.createLinearGradient(0, 0, 0, h);
  bg.addColorStop(0, '#030308');
  bg.addColorStop(0.5, '#060810');
  bg.addColorStop(1, '#080A14');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, w, h);

  drawStars(rc, 0.5, true);

  const blobs = [
    { sx: 0.25, sy: 0.3, hue: 180, r: 160 }, { sx: 0.7, sy: 0.5, hue: 38, r: 140 },
    { sx: 0.4, sy: 0.7, hue: 165, r: 130 }, { sx: 0.8, sy: 0.25, hue: 45, r: 110 },
    { sx: 0.15, sy: 0.6, hue: 195, r: 120 }, { sx: 0.6, sy: 0.15, hue: 32, r: 100 },
    { sx: 0.5, sy: 0.45, hue: 175, r: 90 }, { sx: 0.35, sy: 0.2, hue: 40, r: 85 },
    { sx: 0.85, sy: 0.7, hue: 185, r: 100 }, { sx: 0.1, sy: 0.35, hue: 50, r: 80 },
  ];

  for (let i = 0; i < blobs.length; i++) {
    const bl = blobs[i];
    const bx = bl.sx * w + Math.sin(now * 0.00015 + i * 2.3) * 45;
    const by = bl.sy * h + Math.cos(now * 0.0001 + i * 1.7) * 35;
    const br = bl.r + Math.sin(now * 0.0003 + i * 3.1) * 25;
    const hue = bl.hue + Math.sin(now * 0.0004 + i) * 10;
    const a = 0.045 + Math.sin(now * 0.0006 + i * 1.5) * 0.018;
    const ng = ctx.createRadialGradient(bx, by, 0, bx, by, br);
    ng.addColorStop(0, `hsla(${hue}, 65%, 58%, ${a})`);
    ng.addColorStop(0.35, `hsla(${hue + 12}, 55%, 48%, ${a * 0.6})`);
    ng.addColorStop(0.65, `hsla(${hue + 20}, 42%, 38%, ${a * 0.2})`);
    ng.addColorStop(1, 'transparent');
    ctx.fillStyle = ng;
    ctx.beginPath();
    ctx.arc(bx, by, br, 0, Math.PI * 2);
    ctx.fill();
  }

  for (let i = 0; i < 4; i++) {
    const dx = w * (0.2 + i * 0.2) + Math.sin(now * 0.0001 + i * 3) * 30;
    const dy = h * (0.3 + sr(i * 37) * 0.4);
    const angle = sr(i * 19) * 0.8 - 0.4;
    const len = 120 + sr(i * 41) * 80;
    ctx.beginPath();
    ctx.moveTo(dx - Math.cos(angle) * len * 0.5, dy - Math.sin(angle) * len * 0.5);
    ctx.lineTo(dx + Math.cos(angle) * len * 0.5, dy + Math.sin(angle) * len * 0.5);
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.15)';
    ctx.lineWidth = 12 + sr(i * 29) * 8;
    ctx.stroke();
  }

  const coreX = w * 0.48;
  const coreY = h * 0.42;
  const cPulse = 0.5 + 0.5 * Math.sin(now * 0.0004);
  orb(ctx, coreX, coreY, 60 + cPulse * 15, 42, 55, 70, 0.04 + cPulse * 0.02);
  orb(ctx, coreX, coreY, 25 + cPulse * 8, 180, 60, 80, 0.05 + cPulse * 0.02);

  for (let i = 0; i < 30; i++) {
    const scx = coreX + (sr(i * 11.3 + 5) - 0.5) * 120;
    const scy = coreY + (sr(i * 17.7 + 5) - 0.5) * 80;
    const pulse = 0.5 + 0.5 * Math.sin(now * 0.003 + i * 2.1);
    ctx.beginPath();
    ctx.arc(scx, scy, 0.5 + sr(i * 23.1 + 5) * 1.5, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255, 240, 200, ${0.15 + pulse * 0.2})`;
    ctx.fill();
  }
}

function renderRainOnGlass(rc: RenderContext) {
  const { ctx, width: w, height: h, now } = rc;
  const bg = ctx.createLinearGradient(0, 0, 0, h);
  bg.addColorStop(0, '#050810');
  bg.addColorStop(0.5, '#080E18');
  bg.addColorStop(1, '#0C1420');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, w, h);

  for (let i = 0; i < 18; i++) {
    const bx = sr(i * 41.3 + 6) * w;
    const by = sr(i * 73.7 + 6) * h;
    const br = 25 + sr(i * 17.1 + 6) * 55;
    const pulse = 0.5 + 0.5 * Math.sin(now * 0.0005 + i * 2.3);
    const a = 0.022 + pulse * 0.018;
    const warm = sr(i * 51.3) > 0.5;
    const hue = warm ? 35 + sr(i * 61.7) * 15 : 200 + sr(i * 71.3) * 20;
    orb(ctx, bx, by, br, hue, warm ? 50 : 35, 55, a);
    if (br > 50) {
      ctx.beginPath();
      ctx.arc(bx, by, br * 0.7, 0, Math.PI * 2);
      ctx.strokeStyle = `hsla(${hue}, ${warm ? 50 : 35}%, 55%, ${a * 0.3})`;
      ctx.lineWidth = 1;
      ctx.stroke();
    }
  }

  const fog = ctx.createLinearGradient(0, h * 0.3, 0, h * 0.7);
  fog.addColorStop(0, 'transparent');
  fog.addColorStop(0.5, 'rgba(80, 100, 130, 0.02)');
  fog.addColorStop(1, 'transparent');
  ctx.fillStyle = fog;
  ctx.fillRect(0, h * 0.3, w, h * 0.4);

  ctx.lineCap = 'round';
  for (const pt of _particles) {
    const speed = pt.speed * 2.5 + 1.2;
    const y = (pt.y + now * 0.0003 * speed * h) % h;
    const windAngle = Math.sin(now * 0.0002 + pt.phase) * 0.08;
    const x = pt.x + Math.sin(pt.phase) * 4 + windAngle * (h - y);
    const streakLen = 10 + pt.speed * 18;
    const a = pt.brightness * 0.16;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x - windAngle * streakLen, y - streakLen);
    ctx.strokeStyle = `rgba(170, 200, 235, ${a})`;
    ctx.lineWidth = 0.4 + pt.size * 0.12;
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(x, y, 0.7, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(210, 225, 245, ${a * 1.5})`;
    ctx.fill();
  }
  ctx.lineCap = 'butt';

  for (let i = 0; i < 6; i++) {
    const rx = sr(i * 53.7 + 6) * w;
    const speed = 0.02 + sr(i * 67.1 + 6) * 0.02;
    ctx.beginPath();
    for (let y = 0; y < h; y += 3) {
      const t = (now * speed + sr(i * 31.3 + 6) * h + y) % h;
      const x = rx + Math.sin(y * 0.02 + now * 0.001 + i * 2) * 3
        + Math.sin(y * 0.008 + now * 0.0005 + i) * 6;
      if (y === 0) ctx.moveTo(x, t); else ctx.lineTo(x, ((t + y) % h));
    }
    ctx.strokeStyle = `rgba(150, 185, 220, ${0.02 + Math.sin(now * 0.0008 + i) * 0.008})`;
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }

  const pg = ctx.createLinearGradient(0, h * 0.9, 0, h);
  pg.addColorStop(0, 'transparent');
  pg.addColorStop(1, 'rgba(60, 90, 120, 0.03)');
  ctx.fillStyle = pg;
  ctx.fillRect(0, h * 0.9, w, h * 0.1);
}

function renderLavaLamp(rc: RenderContext) {
  const { ctx, width: w, height: h, now } = rc;
  const bg = ctx.createLinearGradient(0, 0, 0, h);
  bg.addColorStop(0, '#080304');
  bg.addColorStop(0.4, '#100608');
  bg.addColorStop(0.7, '#180A0C');
  bg.addColorStop(1, '#200C0E');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, w, h);

  const blobDefs = [
    { sx: 0.18, py: 0, hue: 5, r: 65 }, { sx: 0.48, py: 1.5, hue: 25, r: 75 },
    { sx: 0.78, py: 3, hue: 345, r: 60 }, { sx: 0.33, py: 4.5, hue: 15, r: 55 },
    { sx: 0.63, py: 2.2, hue: 355, r: 70 }, { sx: 0.12, py: 5.1, hue: 30, r: 50 },
    { sx: 0.88, py: 0.8, hue: 10, r: 58 }, { sx: 0.5, py: 3.8, hue: 20, r: 48 },
    { sx: 0.72, py: 1.2, hue: 0, r: 52 },
  ];

  for (let i = 0; i < blobDefs.length; i++) {
    const bl = blobDefs[i];
    const cycle = (now * 0.00007 + bl.py) % (Math.PI * 2);
    const bx = bl.sx * w + Math.sin(now * 0.00018 + bl.py) * 45;
    const by = h * (0.25 + Math.sin(cycle) * 0.28);
    const stretch = 1 + Math.sin(cycle * 2) * 0.35;
    const r = bl.r + Math.sin(now * 0.0005 + bl.py) * 15;
    const hue = bl.hue + Math.sin(now * 0.0003 + i) * 10;
    const a = 0.06 + Math.sin(now * 0.0007 + bl.py) * 0.025;
    ctx.save();
    ctx.translate(bx, by);
    ctx.scale(1, stretch);
    const lg = ctx.createRadialGradient(0, 0, 0, 0, 0, r);
    lg.addColorStop(0, `hsla(${hue + 15}, 100%, 70%, ${a * 1.3})`);
    lg.addColorStop(0.25, `hsla(${hue}, 92%, 58%, ${a})`);
    lg.addColorStop(0.55, `hsla(${hue - 5}, 85%, 42%, ${a * 0.6})`);
    lg.addColorStop(0.8, `hsla(${hue - 10}, 75%, 30%, ${a * 0.2})`);
    lg.addColorStop(1, 'transparent');
    ctx.fillStyle = lg;
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  for (let i = 0; i < 5; i++) {
    const x1 = blobDefs[i].sx * w;
    const x2 = blobDefs[(i + 1) % blobDefs.length].sx * w;
    const y1 = h * 0.45 + Math.sin(now * 0.0003 + i) * 30;
    const y2 = h * 0.45 + Math.sin(now * 0.0003 + i + 1) * 30;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.quadraticCurveTo((x1 + x2) / 2 + Math.sin(now * 0.0005 + i * 2) * 30,
      (y1 + y2) / 2 + Math.sin(now * 0.0004 + i * 1.5) * 40, x2, y2);
    ctx.strokeStyle = `rgba(255, 80, 20, ${0.02 + Math.sin(now * 0.001 + i) * 0.01})`;
    ctx.lineWidth = 6 + Math.sin(now * 0.0008 + i * 2) * 3;
    ctx.stroke();
  }

  for (let i = 0; i < 20; i++) {
    const spd = 0.03 + sr(i * 17.3 + 7) * 0.04;
    const x = sr(i * 43.7 + 7) * w + Math.sin(now * 0.002 + i * 3) * 10;
    const y = (h + 10) - ((now * spd + sr(i * 31.1 + 7) * h) % (h + 20));
    const flicker = 0.5 + 0.5 * Math.sin(now * 0.01 + i * 5);
    ctx.beginPath();
    ctx.arc(x, y, 1 + flicker, 0, Math.PI * 2);
    ctx.fillStyle = `hsla(${20 + sr(i * 7) * 25}, 100%, ${60 + flicker * 20}%, ${0.2 + flicker * 0.2})`;
    ctx.fill();
  }

  for (let i = 0; i < 4; i++) {
    const y = h * (0.2 + i * 0.2);
    ctx.beginPath();
    for (let x = 0; x <= w; x += 5) {
      const wy = y + Math.sin(x * 0.008 + now * 0.0015 + i * 2) * 3
        + Math.sin(x * 0.004 + now * 0.001 + i) * 5;
      if (x === 0) ctx.moveTo(x, wy); else ctx.lineTo(x, wy);
    }
    ctx.strokeStyle = `rgba(255, 120, 40, ${0.01 + Math.sin(now * 0.0008 + i) * 0.005})`;
    ctx.lineWidth = 20;
    ctx.stroke();
  }
}

function renderNorthernLights(rc: RenderContext) {
  const { ctx, width: w, height: h, now } = rc;
  const bg = ctx.createLinearGradient(0, 0, 0, h);
  bg.addColorStop(0, '#030508');
  bg.addColorStop(0.4, '#060A12');
  bg.addColorStop(1, '#0A0E18');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, w, h);

  drawStars(rc, 0.5, true);

  const palette = [45, 350, 140, 30, 160, 10, 50, 120, 40, 155];
  for (let i = 0; i < palette.length; i++) {
    const hue = palette[i] + Math.sin(now * 0.0004 + i * 1.1) * 15;
    const y = h * (0.03 + i * 0.058);
    const rH = 50 + Math.sin(now * 0.0003 + i * 1.8) * 20;
    auroraCurtain(ctx, w, y, rH, now, i, hue, 0.045 + Math.sin(now * 0.0007 + i * 0.9) * 0.018);
  }

  for (let i = 0; i < 5; i++) {
    const px = w * (0.15 + i * 0.175) + Math.sin(now * 0.0005 + i * 2.1) * 30;
    const peakY = h * (0.05 + Math.sin(now * 0.0003 + i * 1.7) * 0.03);
    lightBeam(ctx, px, peakY, h * 0.5, 3, 25,
      0.015 + Math.sin(now * 0.001 + i * 1.3) * 0.008, palette[i * 2 % palette.length]);
  }

  const rg = ctx.createLinearGradient(0, h * 0.82, 0, h);
  const gp = 0.5 + 0.5 * Math.sin(now * 0.0005);
  rg.addColorStop(0, 'transparent');
  rg.addColorStop(0.4, `hsla(45, 40%, 40%, ${0.015 + gp * 0.01})`);
  rg.addColorStop(0.7, `hsla(140, 35%, 35%, ${0.02 + gp * 0.01})`);
  rg.addColorStop(1, `hsla(30, 30%, 30%, ${0.025 + gp * 0.01})`);
  ctx.fillStyle = rg;
  ctx.fillRect(0, h * 0.82, w, h * 0.18);

  for (let i = 0; i < 4; i++) {
    const period = 6000;
    const cycle = ((now + i * period / 4) % period) / period;
    if (cycle > 0.1) continue;
    const t = cycle / 0.1;
    const seed = Math.floor((now + i * period / 4) / period);
    const sx = sr(seed * 7.3 + i * 23) * w;
    const sy = sr(seed * 11.7 + i * 37) * h * 0.4;
    const angle = 0.2 + sr(seed + i * 5) * 0.7;
    const dist = t * 180;
    const ex = sx + Math.cos(angle) * dist;
    const ey = sy + Math.sin(angle) * dist;
    const sGrad = ctx.createLinearGradient(
      ex - Math.cos(angle) * 35, ey - Math.sin(angle) * 35, ex, ey);
    sGrad.addColorStop(0, 'transparent');
    sGrad.addColorStop(1, `rgba(255, 255, 255, ${Math.sin(t * Math.PI) * 0.5})`);
    ctx.beginPath();
    ctx.moveTo(ex - Math.cos(angle) * 35, ey - Math.sin(angle) * 35);
    ctx.lineTo(ex, ey);
    ctx.strokeStyle = sGrad;
    ctx.lineWidth = 1.5;
    ctx.lineCap = 'round';
    ctx.stroke();
    ctx.lineCap = 'butt';
  }
}

function renderDigitalRain(rc: RenderContext) {
  const { ctx, width: w, height: h, now } = rc;
  const bg = ctx.createLinearGradient(0, 0, 0, h);
  bg.addColorStop(0, '#010602');
  bg.addColorStop(0.5, '#030C05');
  bg.addColorStop(1, '#051208');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, w, h);

  const gridSp = 28;
  ctx.lineWidth = 0.5;
  for (let x = (now * 0.005) % gridSp; x < w; x += gridSp) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, h);
    ctx.strokeStyle = 'rgba(0, 80, 40, 0.025)';
    ctx.stroke();
  }
  for (let y = (now * 0.004) % gridSp; y < h; y += gridSp) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(w, y);
    ctx.strokeStyle = 'rgba(0, 80, 40, 0.02)';
    ctx.stroke();
  }

  for (let gx = gridSp; gx < w; gx += gridSp) {
    for (let gy = gridSp; gy < h; gy += gridSp) {
      const pulse = Math.sin(now * 0.002 + gx * 0.05 + gy * 0.05);
      if (pulse > 0.85) {
        ctx.fillStyle = `rgba(0, 255, 130, ${(pulse - 0.85) * 0.12})`;
        ctx.beginPath();
        ctx.arc(gx, gy, 2.5, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  const colW = 16;
  const cols = Math.ceil(w / colW);
  const dotSp = 12;
  const trailLen = 18;
  for (let c = 0; c < cols; c++) {
    const x = c * colW + colW * 0.5;
    const speed = 0.045 + sr(c * 7.3 + 9) * 0.065;
    const colOffset = sr(c * 13.1 + 9) * h * 3;
    const headY = (now * speed + colOffset) % (h + trailLen * dotSp);
    for (let d = 0; d < trailLen; d++) {
      const y = headY - d * dotSp;
      if (y < -5 || y > h + 5) continue;
      const fade = 1 - d / trailLen;
      const a = fade * 0.4;
      if (a <= 0.01) continue;
      const lit = d === 0 ? 88 : d === 1 ? 70 : 42 + sr(c * 3.1 + d * 7.7 + 9) * 15;
      const hue = 145 + sr(c * 11.3 + d * 3.3) * 15;
      const sz = d === 0 ? 2.2 : d === 1 ? 1.8 : 1.2;
      ctx.fillStyle = `hsla(${hue}, 82%, ${lit}%, ${a})`;
      ctx.fillRect(x - sz * 0.5, y - sz * 0.5, sz, sz);
    }
    if (headY > 0 && headY < h) {
      ctx.beginPath();
      ctx.arc(x, headY, 3.5, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(150, 255, 200, 0.06)';
      ctx.fill();
    }
  }

  for (let i = 0; i < 8; i++) {
    const y = sr(i * 37.3 + 9) * h;
    const speed = 0.02 + sr(i * 43.7 + 9) * 0.03;
    const x = (now * speed + sr(i * 67.1 + 9) * w) % (w + 40) - 20;
    const len = 30 + sr(i * 53.1 + 9) * 40;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + len, y);
    ctx.strokeStyle = `rgba(0, 200, 100, ${0.02 + Math.sin(now * 0.002 + i * 2) * 0.01})`;
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  for (let i = 0; i < 3; i++) {
    const period = 4000;
    const cycle = ((now + i * period / 3) % period) / period;
    const cx = sr(Math.floor((now + i * period / 3) / period) * 7 + i) * w;
    const cy = sr(Math.floor((now + i * period / 3) / period) * 11 + i) * h;
    const r = cycle * Math.max(w, h) * 0.6;
    const a = Math.max(0, 0.03 - cycle * 0.03);
    if (a > 0.002) {
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(0, 255, 130, ${a})`;
      ctx.lineWidth = 1;
      ctx.stroke();
    }
  }

  for (let i = 0; i < 8; i++) {
    const fx = sr(i * 23.7 + 9) * w;
    const speed = 0.06 + sr(i * 31.1 + 9) * 0.04;
    const fy = (now * speed + sr(i * 47.3 + 9) * h * 2) % (h + 20) - 10;
    const pulse = 0.5 + 0.5 * Math.sin(now * 0.005 + i * 2.1);
    ctx.beginPath();
    ctx.arc(fx, fy, 2.5 + pulse, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(100, 255, 150, ${0.15 + pulse * 0.12})`;
    ctx.fill();
    orb(ctx, fx, fy, 10 + pulse * 5, 150, 80, 55, 0.02 + pulse * 0.015);
  }

  for (let y = 0; y < h; y += 3) {
    const scanA = 0.008 + Math.sin(y * 0.5 + now * 0.01) * 0.004;
    ctx.fillStyle = `rgba(0, 255, 100, ${scanA})`;
    ctx.fillRect(0, y, w, 1);
  }
}

function renderVoidCosmos(rc: RenderContext) {
  const { ctx, width: w, height: h, now } = rc;
  const bg = ctx.createLinearGradient(0, 0, 0, h);
  bg.addColorStop(0, '#010103');
  bg.addColorStop(0.5, '#030306');
  bg.addColorStop(1, '#050509');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, w, h);

  for (let i = 0; i < 4; i++) {
    const gx = sr(i * 61.3 + 10) * w;
    const gy = sr(i * 47.7 + 10) * h;
    const gr = 15 + sr(i * 23.1 + 10) * 10;
    ctx.save();
    ctx.translate(gx, gy);
    ctx.rotate(now * 0.0001 * (i % 2 === 0 ? 1 : -1));
    ctx.scale(1, 0.5);
    const gg = ctx.createRadialGradient(0, 0, 0, 0, 0, gr);
    gg.addColorStop(0, 'rgba(180, 200, 220, 0.06)');
    gg.addColorStop(0.5, 'rgba(140, 170, 200, 0.02)');
    gg.addColorStop(1, 'transparent');
    ctx.fillStyle = gg;
    ctx.beginPath();
    ctx.arc(0, 0, gr, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  const gcx = w * 0.5;
  const gcy = h * 0.45;
  const corePulse = 0.5 + 0.5 * Math.sin(now * 0.0003);
  orb(ctx, gcx, gcy, 100 + corePulse * 15, 200, 50, 60, 0.035 + corePulse * 0.015);
  orb(ctx, gcx, gcy, 45 + corePulse * 8, 190, 65, 75, 0.06 + corePulse * 0.03);
  orb(ctx, gcx, gcy, 15 + corePulse * 4, 180, 70, 90, 0.1 + corePulse * 0.04);

  for (let arm = 0; arm < 2; arm++) {
    const armOff = arm * Math.PI;
    for (let i = 0; i < 60; i++) {
      const dist = 20 + i * 4;
      const angle = armOff + dist * 0.02 + now * 0.00008;
      const spread = (sr(arm * 100 + i * 7.3) - 0.5) * 20;
      const ax = gcx + Math.cos(angle) * (dist + spread);
      const ay = gcy + Math.sin(angle) * (dist + spread) * 0.6;
      const twinkle = 0.5 + 0.5 * Math.sin(now * 0.003 + i * 1.7 + arm);
      const hue = arm === 0 ? (190 + sr(i * 17) * 20) : (35 + sr(i * 23) * 15);
      ctx.beginPath();
      ctx.arc(ax, ay, 0.5 + sr(arm * 50 + i * 13) * 1.5, 0, Math.PI * 2);
      ctx.fillStyle = `hsla(${hue}, 50%, 75%, ${twinkle * 0.25})`;
      ctx.fill();
    }
  }

  for (const pt of _particles) {
    const dx = pt.x - gcx;
    const dy = pt.y - gcy;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const baseAngle = Math.atan2(dy, dx);
    const orbitSpeed = 0.0002 + (1 / (dist + 50)) * 2;
    const angle = baseAngle + now * orbitSpeed * pt.speed + pt.phase;
    const px = gcx + Math.cos(angle + dist * 0.01) * dist;
    const py = gcy + Math.sin(angle + dist * 0.01) * dist * 0.7;
    const twinkle = 0.3 + 0.7 * (0.5 + 0.5 * Math.sin(now * 0.003 + pt.phase));
    const a = twinkle * pt.brightness * 0.4;
    const hue = pt.hue < 30 ? (40 + pt.hue * 0.5) : (185 + (pt.hue - 30) * 1.2);
    ctx.beginPath();
    ctx.arc(px, py, pt.size * 0.55, 0, Math.PI * 2);
    ctx.fillStyle = `hsla(${hue}, 55%, 75%, ${a})`;
    ctx.fill();
  }

  for (let i = 0; i < 3; i++) {
    const cx = w * (0.25 + i * 0.25) + Math.sin(now * 0.00015 + i * 2) * 60;
    const cy = h * (0.2 + sr(i * 73 + 10) * 0.5) + Math.cos(now * 0.0001 + i * 1.5) * 40;
    orb(ctx, cx, cy, 60 + Math.sin(now * 0.0004 + i) * 15, 195, 30, 50,
      0.015 + Math.sin(now * 0.0005 + i * 2) * 0.006);
  }

  drawStars(rc, 0.6, true);

  for (let i = 0; i < 5; i++) {
    const period = 5000;
    const cycle = ((now + i * period / 5) % period) / period;
    if (cycle > 0.12) continue;
    const t = cycle / 0.12;
    const seed = Math.floor((now + i * period / 5) / period);
    const sx = sr(seed * 7.3 + i * 23) * w;
    const sy = sr(seed * 11.7 + i * 37) * h * 0.6;
    const angle = 0.2 + sr(seed + i * 5) * 0.8;
    const dist = t * 220;
    const ex = sx + Math.cos(angle) * dist;
    const ey = sy + Math.sin(angle) * dist;
    const sGrad = ctx.createLinearGradient(
      ex - Math.cos(angle) * 50, ey - Math.sin(angle) * 50, ex, ey);
    sGrad.addColorStop(0, 'transparent');
    sGrad.addColorStop(1, `rgba(255, 255, 255, ${Math.sin(t * Math.PI) * 0.55})`);
    ctx.beginPath();
    ctx.moveTo(ex - Math.cos(angle) * 50, ey - Math.sin(angle) * 50);
    ctx.lineTo(ex, ey);
    ctx.strokeStyle = sGrad;
    ctx.lineWidth = 1.5;
    ctx.lineCap = 'round';
    ctx.stroke();
    ctx.lineCap = 'butt';
  }
}
