import type { RenderContext } from './constants';
import type { HazardState } from './hazards';

function roundedRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

export function renderHazards(rc: RenderContext, hazards: HazardState) {
  renderBlackHoles(rc, hazards);
  renderLavaPools(rc, hazards);
  renderIceZones(rc, hazards);
  renderTeleporters(rc, hazards);
  renderEmpPulses(rc, hazards);
  renderGravityFlippers(rc, hazards);
  renderLaserGates(rc, hazards);
  renderAsteroids(rc, hazards);
  renderTeslaCoils(rc, hazards);
  renderRepulsorFields(rc, hazards);
  renderPhaseWalls(rc, hazards);
  renderMagneticCores(rc, hazards);
  renderBumperOrbs(rc, hazards);
  renderSolarFlares(rc, hazards);
  renderSlowMoFields(rc, hazards);
  renderVoidZones(rc, hazards);
}

function renderBlackHoles(rc: RenderContext, hazards: HazardState) {
  const { ctx, now } = rc;
  for (const bh of hazards.blackHoles) {
    ctx.save();

    const outerGrad = ctx.createRadialGradient(bh.x, bh.y, bh.killRadius * 0.8, bh.x, bh.y, bh.radius);
    outerGrad.addColorStop(0, 'rgba(5, 2, 20, 0.8)');
    outerGrad.addColorStop(0.2, 'rgba(15, 8, 40, 0.4)');
    outerGrad.addColorStop(0.5, 'rgba(0, 40, 80, 0.1)');
    outerGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = outerGrad;
    ctx.beginPath();
    ctx.arc(bh.x, bh.y, bh.radius, 0, Math.PI * 2);
    ctx.fill();

    ctx.shadowColor = 'rgba(30, 100, 200, 0.7)';
    ctx.shadowBlur = 15;
    const coreGrad = ctx.createRadialGradient(bh.x, bh.y, 0, bh.x, bh.y, bh.killRadius);
    coreGrad.addColorStop(0, '#000000');
    coreGrad.addColorStop(0.6, '#020208');
    coreGrad.addColorStop(0.85, 'rgba(10, 30, 80, 0.9)');
    coreGrad.addColorStop(1, 'rgba(40, 100, 200, 0.7)');
    ctx.fillStyle = coreGrad;
    ctx.beginPath();
    ctx.arc(bh.x, bh.y, bh.killRadius, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    for (let i = 0; i < 4; i++) {
      const diskR = bh.killRadius * (1.4 + i * 0.4);
      const rot = bh.angle * (i % 2 === 0 ? 1.2 : -0.8) + i * 0.8;
      const alpha = 0.3 - i * 0.055 + Math.sin(now * 0.003 + i * 1.2) * 0.06;
      ctx.save();
      ctx.translate(bh.x, bh.y);
      ctx.rotate(rot);
      const diskGrad = ctx.createLinearGradient(-diskR, 0, diskR, 0);
      const hueShift = i * 20;
      diskGrad.addColorStop(0, `rgba(${40 + hueShift}, ${80 + hueShift}, 220, ${alpha * 0.6})`);
      diskGrad.addColorStop(0.3, `rgba(${80 + hueShift}, ${140 + hueShift}, 255, ${alpha})`);
      diskGrad.addColorStop(0.5, `rgba(${120 + hueShift}, ${180 + hueShift}, 255, ${alpha * 1.2})`);
      diskGrad.addColorStop(0.7, `rgba(${80 + hueShift}, ${140 + hueShift}, 255, ${alpha})`);
      diskGrad.addColorStop(1, `rgba(${40 + hueShift}, ${80 + hueShift}, 220, ${alpha * 0.6})`);
      ctx.fillStyle = diskGrad;
      ctx.beginPath();
      ctx.ellipse(0, 0, diskR, diskR * 0.25, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    const edgeGlow = ctx.createRadialGradient(bh.x, bh.y, bh.killRadius * 0.9, bh.x, bh.y, bh.killRadius * 1.15);
    edgeGlow.addColorStop(0, 'transparent');
    edgeGlow.addColorStop(0.5, `rgba(60, 140, 255, ${0.15 + Math.sin(now * 0.005) * 0.05})`);
    edgeGlow.addColorStop(1, 'transparent');
    ctx.fillStyle = edgeGlow;
    ctx.beginPath();
    ctx.arc(bh.x, bh.y, bh.killRadius * 1.15, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }
}

function renderLavaPools(rc: RenderContext, hazards: HazardState) {
  const { ctx, now } = rc;
  for (const lava of hazards.lavaPools) {
    ctx.save();

    const baseGrad = ctx.createLinearGradient(lava.x, lava.y, lava.x, lava.y + lava.height);
    baseGrad.addColorStop(0, 'rgba(255, 120, 20, 0.9)');
    baseGrad.addColorStop(0.5, 'rgba(220, 60, 10, 0.85)');
    baseGrad.addColorStop(1, 'rgba(160, 30, 5, 0.9)');
    ctx.fillStyle = baseGrad;
    roundedRect(ctx, lava.x, lava.y + 4, lava.width, lava.height - 4, 3);
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(lava.x, lava.y + lava.height * 0.3);
    for (let px = 0; px <= lava.width; px += 2) {
      const wave = Math.sin((px * 0.08) + now * 0.004) * 3 + Math.sin((px * 0.12) + now * 0.006) * 1.5;
      ctx.lineTo(lava.x + px, lava.y + wave);
    }
    ctx.lineTo(lava.x + lava.width, lava.y + lava.height);
    ctx.lineTo(lava.x, lava.y + lava.height);
    ctx.closePath();
    const surfGrad = ctx.createLinearGradient(lava.x, lava.y, lava.x, lava.y + lava.height);
    surfGrad.addColorStop(0, 'rgba(255, 160, 40, 0.95)');
    surfGrad.addColorStop(0.4, 'rgba(255, 80, 10, 0.9)');
    surfGrad.addColorStop(1, 'rgba(180, 30, 5, 0.95)');
    ctx.fillStyle = surfGrad;
    ctx.fill();

    ctx.shadowColor = 'rgba(255, 200, 50, 0.8)';
    ctx.shadowBlur = 6;
    ctx.strokeStyle = 'rgba(255, 220, 80, 0.7)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    for (let px = 0; px <= lava.width; px += 2) {
      const wave = Math.sin((px * 0.08) + now * 0.004) * 3 + Math.sin((px * 0.12) + now * 0.006) * 1.5;
      if (px === 0) ctx.moveTo(lava.x + px, lava.y + wave);
      else ctx.lineTo(lava.x + px, lava.y + wave);
    }
    ctx.stroke();
    ctx.shadowBlur = 0;

    for (let i = 0; i < 5; i++) {
      const bx = lava.x + 10 + ((now * 0.02 + i * lava.width / 5) % (lava.width - 20));
      const bubbleY = lava.y + lava.height * 0.4 + Math.sin(now * 0.004 + i * 2) * lava.height * 0.15;
      const br = 2 + Math.sin(now * 0.006 + i * 3);
      ctx.beginPath();
      ctx.arc(bx, bubbleY, Math.max(br, 0.5), 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 200, 80, ${0.4 + Math.sin(now * 0.005 + i) * 0.2})`;
      ctx.fill();
    }

    for (let i = 0; i < 4; i++) {
      const t = ((now * 0.001 + i * 0.25) % 1);
      const ex = lava.x + (i + 0.5) * (lava.width / 4) + Math.sin(now * 0.003 + i * 2) * 5;
      const ey = lava.y - t * 25;
      const eAlpha = (1 - t) * 0.6;
      const eSize = (1 - t) * 2.5;
      ctx.beginPath();
      ctx.arc(ex, ey, Math.max(eSize, 0.3), 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 140, 30, ${eAlpha})`;
      ctx.fill();
    }

    const heatGrad = ctx.createLinearGradient(lava.x, lava.y - 20, lava.x, lava.y);
    heatGrad.addColorStop(0, 'transparent');
    heatGrad.addColorStop(1, 'rgba(255, 80, 0, 0.08)');
    ctx.fillStyle = heatGrad;
    ctx.fillRect(lava.x - 5, lava.y - 20, lava.width + 10, 20);

    ctx.restore();
  }
}

function renderIceZones(rc: RenderContext, hazards: HazardState) {
  const { ctx, now } = rc;
  for (const ice of hazards.iceZones) {
    ctx.save();

    ctx.save();
    roundedRect(ctx, ice.x, ice.y, ice.width, ice.height, 4);
    ctx.clip();

    const bgGrad = ctx.createLinearGradient(ice.x, ice.y, ice.x + ice.width * 0.3, ice.y + ice.height);
    bgGrad.addColorStop(0, 'rgba(200, 240, 255, 0.6)');
    bgGrad.addColorStop(0.3, 'rgba(160, 220, 245, 0.5)');
    bgGrad.addColorStop(0.6, 'rgba(180, 235, 255, 0.55)');
    bgGrad.addColorStop(1, 'rgba(140, 210, 240, 0.4)');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(ice.x, ice.y, ice.width, ice.height);

    const glossGrad = ctx.createLinearGradient(ice.x, ice.y, ice.x, ice.y + ice.height * 0.4);
    glossGrad.addColorStop(0, 'rgba(255, 255, 255, 0.1)');
    glossGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = glossGrad;
    ctx.fillRect(ice.x, ice.y, ice.width, ice.height * 0.4);

    const seed = Math.floor(ice.x * 7.3 + ice.y * 3.1);
    ctx.strokeStyle = 'rgba(200, 240, 255, 0.25)';
    ctx.lineWidth = 1.2;
    ctx.lineCap = 'round';
    for (let i = 0; i < 8; i++) {
      const sx = ice.x + ((seed + i * 43) % (ice.width * 0.8)) + ice.width * 0.1;
      const sy = ice.y + ((seed * 3 + i * 61) % (ice.height * 0.8)) + ice.height * 0.1;
      ctx.beginPath();
      ctx.moveTo(sx, sy);
      const mainAngle = ((seed + i) * 1.7) % (Math.PI * 2);
      const mainLen = 12 + (i * 11) % 25;
      const ex = sx + Math.cos(mainAngle) * mainLen;
      const ey = sy + Math.sin(mainAngle) * mainLen;
      ctx.lineTo(ex, ey);
      ctx.stroke();

      for (let b = 0; b < 2; b++) {
        const bt = 0.3 + b * 0.35;
        const bx = sx + (ex - sx) * bt;
        const by = sy + (ey - sy) * bt;
        const branchAngle = mainAngle + (b % 2 === 0 ? 0.6 : -0.7);
        const branchLen = mainLen * (0.3 + b * 0.1);
        ctx.beginPath();
        ctx.moveTo(bx, by);
        ctx.lineTo(bx + Math.cos(branchAngle) * branchLen, by + Math.sin(branchAngle) * branchLen);
        ctx.stroke();
      }
    }

    ctx.strokeStyle = 'rgba(220, 250, 255, 0.12)';
    ctx.lineWidth = 0.6;
    for (let i = 0; i < 5; i++) {
      const lx = ice.x + ((seed * 2 + i * 71) % ice.width);
      const ly = ice.y + ((seed + i * 47) % ice.height);
      const lLen = 8 + (i * 13) % 18;
      const lAngle = ((seed + i * 3) * 0.9) % Math.PI;
      ctx.beginPath();
      ctx.moveTo(lx, ly);
      ctx.lineTo(lx + Math.cos(lAngle) * lLen, ly + Math.sin(lAngle) * lLen);
      ctx.stroke();
    }

    const shimmerX = ice.x + ((now * 0.025) % (ice.width + 50)) - 25;
    const shimmerGrad = ctx.createLinearGradient(shimmerX - 12, 0, shimmerX + 12, 0);
    shimmerGrad.addColorStop(0, 'transparent');
    shimmerGrad.addColorStop(0.5, 'rgba(255, 255, 255, 0.15)');
    shimmerGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = shimmerGrad;
    ctx.fillRect(shimmerX - 12, ice.y, 24, ice.height);

    ctx.restore();

    ctx.strokeStyle = 'rgba(180, 230, 255, 0.35)';
    ctx.lineWidth = 1.5;
    roundedRect(ctx, ice.x, ice.y, ice.width, ice.height, 4);
    ctx.stroke();

    ctx.restore();
  }
}

function renderTeleporters(rc: RenderContext, hazards: HazardState) {
  const { ctx, now } = rc;
  for (const tp of hazards.teleporters) {
    ctx.save();

    ctx.setLineDash([4, 8]);
    ctx.strokeStyle = `hsla(${tp.hue}, 70%, 60%, 0.15)`;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(tp.x1, tp.y1);
    ctx.lineTo(tp.x2, tp.y2);
    ctx.stroke();
    ctx.setLineDash([]);

    for (const [px, py] of [[tp.x1, tp.y1], [tp.x2, tp.y2]]) {
      const pulse = Math.sin(now * 0.004) * 0.15;

      ctx.shadowColor = `hsla(${tp.hue}, 80%, 60%, 0.5)`;
      ctx.shadowBlur = 10;

      const outerR = tp.radius + 4 + pulse * 3;
      ctx.beginPath();
      ctx.arc(px, py, outerR, 0, Math.PI * 2);
      ctx.strokeStyle = `hsla(${tp.hue}, 70%, 55%, ${0.3 + pulse})`;
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(px, py, tp.radius, 0, Math.PI * 2);
      const portalGrad = ctx.createRadialGradient(px, py, 0, px, py, tp.radius);
      portalGrad.addColorStop(0, `hsla(${tp.hue}, 80%, 70%, 0.4)`);
      portalGrad.addColorStop(0.7, `hsla(${tp.hue}, 70%, 50%, 0.2)`);
      portalGrad.addColorStop(1, `hsla(${tp.hue}, 60%, 40%, 0.1)`);
      ctx.fillStyle = portalGrad;
      ctx.fill();

      ctx.shadowBlur = 0;

      const spinR = tp.radius * 0.7;
      const rot = now * 0.003;
      ctx.save();
      ctx.translate(px, py);
      ctx.rotate(rot);
      ctx.setLineDash([2, 4]);
      ctx.strokeStyle = `hsla(${tp.hue}, 90%, 75%, 0.3)`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(0, 0, spinR, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();
    }

    ctx.restore();
  }
}

function renderEmpPulses(rc: RenderContext, hazards: HazardState) {
  const { ctx, now } = rc;
  for (const emp of hazards.empPulses) {
    ctx.save();

    const orbPulse = 0.5 + Math.sin(now * 0.005) * 0.3;
    ctx.shadowColor = `rgba(255, 200, 50, ${0.5 + orbPulse * 0.4})`;
    ctx.shadowBlur = 12;
    const orbGrad = ctx.createRadialGradient(emp.x, emp.y, 0, emp.x, emp.y, 12);
    orbGrad.addColorStop(0, `rgba(255, 240, 140, ${0.8 + orbPulse * 0.2})`);
    orbGrad.addColorStop(0.5, `rgba(255, 210, 60, ${0.5 + orbPulse * 0.3})`);
    orbGrad.addColorStop(1, `rgba(255, 180, 30, ${0.2 + orbPulse * 0.2})`);
    ctx.fillStyle = orbGrad;
    ctx.beginPath();
    ctx.arc(emp.x, emp.y, 8 + orbPulse * 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    if (emp.active && emp.currentRadius > 0) {
      const life = 1 - emp.currentRadius / emp.maxRadius;
      const alpha = life * 0.6;

      ctx.shadowColor = `rgba(255, 210, 60, ${alpha * 0.5})`;
      ctx.shadowBlur = 8;
      ctx.strokeStyle = `rgba(255, 210, 60, ${alpha})`;
      ctx.lineWidth = 3 * life + 1.5;
      ctx.beginPath();
      ctx.arc(emp.x, emp.y, emp.currentRadius, 0, Math.PI * 2);
      ctx.stroke();

      if (emp.currentRadius > 15) {
        ctx.strokeStyle = `rgba(255, 230, 100, ${alpha * 0.5})`;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(emp.x, emp.y, emp.currentRadius * 0.85, 0, Math.PI * 2);
        ctx.stroke();
      }

      if (emp.currentRadius > 30) {
        ctx.strokeStyle = `rgba(255, 200, 50, ${alpha * 0.2})`;
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 6]);
        ctx.beginPath();
        ctx.arc(emp.x, emp.y, emp.currentRadius + 8, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);
      }
      ctx.shadowBlur = 0;
    }

    ctx.restore();
  }
}

function renderGravityFlippers(rc: RenderContext, hazards: HazardState) {
  const { ctx, now } = rc;
  for (const gf of hazards.gravityFlippers) {
    ctx.save();

    ctx.save();
    roundedRect(ctx, gf.x, gf.y, gf.width, gf.height, 5);
    ctx.clip();

    const bgGrad = ctx.createLinearGradient(gf.x, gf.y + gf.height, gf.x, gf.y);
    bgGrad.addColorStop(0, 'rgba(40, 200, 120, 0.04)');
    bgGrad.addColorStop(0.5, 'rgba(40, 200, 120, 0.08)');
    bgGrad.addColorStop(1, 'rgba(40, 220, 140, 0.12)');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(gf.x, gf.y, gf.width, gf.height);

    const cols = Math.max(2, Math.floor(gf.width / 30));
    const rows = Math.max(3, Math.floor(gf.height / 25));
    for (let col = 0; col < cols; col++) {
      for (let row = 0; row < rows; row++) {
        const cx = gf.x + (col + 0.5) * (gf.width / cols);
        const travel = gf.height + 30;
        const phase = (col * 0.3 + row * 0.5);
        const t = ((now * 0.0008 + phase) % 1);
        const cy = gf.y + gf.height - t * travel;
        if (cy < gf.y - 10 || cy > gf.y + gf.height + 10) continue;
        const alpha = Math.sin(t * Math.PI) * 0.4;

        ctx.strokeStyle = `rgba(50, 220, 140, ${alpha})`;
        ctx.lineWidth = 1.5;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        const aSize = 4;
        ctx.beginPath();
        ctx.moveTo(cx - aSize, cy + aSize);
        ctx.lineTo(cx, cy - aSize);
        ctx.lineTo(cx + aSize, cy + aSize);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(cx, cy - aSize);
        ctx.lineTo(cx, cy + aSize + 3);
        ctx.stroke();
      }
    }

    for (let i = 0; i < 8; i++) {
      const px = gf.x + ((i * gf.width / 8 + now * 0.015) % gf.width);
      const t = ((now * 0.0006 + i * 0.125) % 1);
      const py = gf.y + gf.height * (1 - t);
      const pAlpha = Math.sin(t * Math.PI) * 0.5;
      const pSize = 1.5 + Math.sin(t * Math.PI) * 1;
      ctx.beginPath();
      ctx.arc(px, py, pSize, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(80, 255, 180, ${pAlpha})`;
      ctx.fill();
    }

    ctx.restore();

    ctx.strokeStyle = 'rgba(40, 200, 120, 0.2)';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    roundedRect(ctx, gf.x, gf.y, gf.width, gf.height, 5);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.restore();
  }
}

function renderLaserGates(rc: RenderContext, hazards: HazardState) {
  const { ctx, now } = rc;
  for (const lg of hazards.laserGates) {
    ctx.save();

    const halfLen = lg.length / 2;
    const ax = lg.x + Math.cos(lg.angle) * halfLen;
    const ay = lg.y + Math.sin(lg.angle) * halfLen;
    const bx = lg.x - Math.cos(lg.angle) * halfLen;
    const by = lg.y - Math.sin(lg.angle) * halfLen;

    const pulse = 0.7 + Math.sin(now * 0.008) * 0.3;

    ctx.shadowColor = `rgba(255, 40, 40, ${0.6 * pulse})`;
    ctx.shadowBlur = 14;
    ctx.strokeStyle = `rgba(255, 50, 50, ${0.85 * pulse})`;
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(ax, ay);
    ctx.lineTo(bx, by);
    ctx.stroke();

    ctx.shadowBlur = 0;
    ctx.strokeStyle = `rgba(255, 200, 200, ${0.6 * pulse})`;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(ax, ay);
    ctx.lineTo(bx, by);
    ctx.stroke();

    ctx.shadowColor = 'rgba(255, 50, 50, 0.7)';
    ctx.shadowBlur = 8;
    for (const [ex, ey] of [[ax, ay], [bx, by]]) {
      ctx.beginPath();
      ctx.arc(ex, ey, 5, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 80, 80, ${pulse})`;
      ctx.fill();
      ctx.beginPath();
      ctx.arc(ex, ey, 2.5, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 220, 220, ${pulse * 0.8})`;
      ctx.fill();
    }
    ctx.shadowBlur = 0;

    ctx.restore();
  }
}

function renderAsteroids(rc: RenderContext, hazards: HazardState) {
  const { ctx } = rc;
  for (const ast of hazards.asteroids) {
    const pos = ast.body.position;
    ctx.save();
    ctx.translate(pos.x, pos.y);

    ctx.shadowColor = 'rgba(140, 120, 100, 0.3)';
    ctx.shadowBlur = 6;

    const grad = ctx.createRadialGradient(-ast.radius * 0.2, -ast.radius * 0.2, 0, 0, 0, ast.radius);
    grad.addColorStop(0, '#8B7D6B');
    grad.addColorStop(0.6, '#6B5D4B');
    grad.addColorStop(1, '#4B3D2B');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(0, 0, ast.radius, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = 'rgba(60, 50, 40, 0.4)';
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.shadowBlur = 0;

    const craterSeeds = [0.2, 0.6, 0.85];
    for (let i = 0; i < craterSeeds.length; i++) {
      const ca = craterSeeds[i] * Math.PI * 2 + ast.radius;
      const cr = ast.radius * (0.25 + i * 0.08);
      const cx = Math.cos(ca) * cr;
      const cy = Math.sin(ca) * cr;
      const crad = ast.radius * (0.12 + i * 0.03);
      ctx.beginPath();
      ctx.arc(cx, cy, crad, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(40, 30, 20, ${0.2 + i * 0.05})`;
      ctx.fill();
    }

    ctx.beginPath();
    ctx.arc(-ast.radius * 0.25, -ast.radius * 0.25, ast.radius * 0.3, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.fill();

    ctx.restore();
  }
}

function renderTeslaCoils(rc: RenderContext, hazards: HazardState) {
  const { ctx, now } = rc;
  for (const tc of hazards.teslaCoils) {
    ctx.save();

    for (const [px, py] of [[tc.x1, tc.y1], [tc.x2, tc.y2]]) {
      ctx.shadowColor = 'rgba(0, 200, 255, 0.6)';
      ctx.shadowBlur = 10;
      const grad = ctx.createRadialGradient(px, py, 0, px, py, 12);
      grad.addColorStop(0, 'rgba(130, 230, 255, 0.95)');
      grad.addColorStop(0.5, 'rgba(60, 180, 230, 0.5)');
      grad.addColorStop(1, 'rgba(0, 140, 200, 0.2)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(px, py, 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      ctx.beginPath();
      ctx.arc(px - 2, py - 2, 3, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.fill();

      ctx.strokeStyle = 'rgba(0, 200, 255, 0.35)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(px, py, 14, 0, Math.PI * 2);
      ctx.stroke();
    }

    if (tc.active) {
      const segments = 10;
      ctx.shadowColor = 'rgba(100, 220, 255, 0.9)';
      ctx.shadowBlur = 5;
      ctx.strokeStyle = `rgba(100, 220, 255, ${0.7 + Math.sin(now * 0.02) * 0.3})`;
      ctx.lineWidth = 2.5;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(tc.x1, tc.y1);
      for (let i = 1; i < segments; i++) {
        const t = i / segments;
        const mx = tc.x1 + (tc.x2 - tc.x1) * t + (Math.random() - 0.5) * 22;
        const my = tc.y1 + (tc.y2 - tc.y1) * t + (Math.random() - 0.5) * 22;
        ctx.lineTo(mx, my);
      }
      ctx.lineTo(tc.x2, tc.y2);
      ctx.stroke();

      ctx.strokeStyle = `rgba(220, 245, 255, ${0.5 + Math.sin(now * 0.03) * 0.2})`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(tc.x1, tc.y1);
      for (let i = 1; i < segments; i++) {
        const t = i / segments;
        const mx = tc.x1 + (tc.x2 - tc.x1) * t + (Math.random() - 0.5) * 14;
        const my = tc.y1 + (tc.y2 - tc.y1) * t + (Math.random() - 0.5) * 14;
        ctx.lineTo(mx, my);
      }
      ctx.lineTo(tc.x2, tc.y2);
      ctx.stroke();
      ctx.shadowBlur = 0;
    }

    ctx.restore();
  }
}

function renderRepulsorFields(rc: RenderContext, hazards: HazardState) {
  const { ctx, now } = rc;
  for (const rf of hazards.repulsorFields) {
    ctx.save();

    const pulse = 0.5 + Math.sin(now * 0.004) * 0.3;
    const grad = ctx.createRadialGradient(rf.x, rf.y, 0, rf.x, rf.y, rf.radius);
    grad.addColorStop(0, `rgba(255, 100, 200, ${0.6 * pulse})`);
    grad.addColorStop(0.5, `rgba(255, 60, 160, ${0.3 * pulse})`);
    grad.addColorStop(1, 'transparent');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(rf.x, rf.y, rf.radius, 0, Math.PI * 2);
    ctx.fill();

    for (let i = 0; i < 5; i++) {
      const t = ((now * 0.0008 + i * 0.2) % 1);
      const ringR = 10 + t * (rf.radius - 10);
      const ringAlpha = (1 - t) * 0.35;
      const lineW = (1 - t) * 2.5 + 0.5;
      ctx.strokeStyle = `rgba(255, 100, 200, ${ringAlpha})`;
      ctx.lineWidth = lineW;
      ctx.beginPath();
      ctx.arc(rf.x, rf.y, ringR, 0, Math.PI * 2);
      ctx.stroke();
    }

    ctx.shadowColor = 'rgba(255, 120, 220, 0.7)';
    ctx.shadowBlur = 10;
    const coreGrad = ctx.createRadialGradient(rf.x, rf.y, 0, rf.x, rf.y, 8);
    coreGrad.addColorStop(0, 'rgba(255, 200, 240, 0.9)');
    coreGrad.addColorStop(1, 'rgba(255, 80, 180, 0.4)');
    ctx.fillStyle = coreGrad;
    ctx.beginPath();
    ctx.arc(rf.x, rf.y, 6 + pulse * 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    ctx.restore();
  }
}

function renderPhaseWalls(rc: RenderContext, hazards: HazardState) {
  const { ctx, now } = rc;
  for (const pw of hazards.phaseWalls) {
    ctx.save();
    ctx.translate(pw.x, pw.y);
    ctx.rotate(pw.angle);

    const w = pw.width;
    const h = pw.height;

    if (pw.solid) {
      ctx.shadowColor = 'rgba(0, 255, 200, 0.4)';
      ctx.shadowBlur = 4;
      const grad = ctx.createLinearGradient(0, -h / 2, 0, h / 2);
      grad.addColorStop(0, 'rgba(0, 255, 200, 0.8)');
      grad.addColorStop(0.5, 'rgba(0, 220, 180, 0.7)');
      grad.addColorStop(1, 'rgba(0, 180, 160, 0.8)');
      ctx.fillStyle = grad;
      roundedRect(ctx, -w / 2, -h / 2, w, h, 3);
      ctx.fill();
      ctx.shadowBlur = 0;

      ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.fillRect(-w / 2 + 2, -h / 2 + 1, w * 0.3, h - 2);
    } else {
      ctx.setLineDash([4, 6]);
      ctx.strokeStyle = `rgba(0, 255, 200, ${0.15 + Math.sin(now * 0.006) * 0.05})`;
      ctx.lineWidth = 1;
      roundedRect(ctx, -w / 2, -h / 2, w, h, 3);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    ctx.restore();
  }
}

function renderMagneticCores(rc: RenderContext, hazards: HazardState) {
  const { ctx, now } = rc;
  for (const mc of hazards.magneticCores) {
    ctx.save();

    const grad = ctx.createRadialGradient(mc.x, mc.y, 0, mc.x, mc.y, mc.radius);
    grad.addColorStop(0, 'rgba(200, 80, 40, 0.12)');
    grad.addColorStop(0.5, 'rgba(180, 60, 30, 0.05)');
    grad.addColorStop(1, 'transparent');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(mc.x, mc.y, mc.radius, 0, Math.PI * 2);
    ctx.fill();

    for (let i = 0; i < 8; i++) {
      const baseAngle = (i / 8) * Math.PI * 2 + now * 0.0008;
      const outerR = mc.radius * 0.85;
      const innerR = 16;
      ctx.strokeStyle = `rgba(220, 110, 50, ${0.15 + Math.sin(now * 0.003 + i) * 0.05})`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let t = 0; t <= 1; t += 0.04) {
        const r = outerR - t * (outerR - innerR);
        const spiralCurve = Math.sin(t * Math.PI * 1.5) * 0.3;
        const a = baseAngle + spiralCurve * (i % 2 === 0 ? 1 : -1);
        const fx = mc.x + Math.cos(a) * r;
        const fy = mc.y + Math.sin(a) * r;
        if (t === 0) ctx.moveTo(fx, fy);
        else ctx.lineTo(fx, fy);
      }
      ctx.stroke();
    }

    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2 + now * 0.002;
      const t = ((now * 0.0015 + i * 0.167) % 1);
      const r = mc.radius * 0.8 * (1 - t) + 14 * t;
      const dotAlpha = 0.5 * Math.sin(t * Math.PI);
      const dotSize = 1.5 + (1 - t) * 1;
      const px = mc.x + Math.cos(a) * r;
      const py = mc.y + Math.sin(a) * r;
      ctx.beginPath();
      ctx.arc(px, py, Math.max(dotSize, 0.3), 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 140, 60, ${dotAlpha})`;
      ctx.fill();
    }

    ctx.shadowColor = 'rgba(220, 100, 50, 0.7)';
    ctx.shadowBlur = 10;
    const coreGrad = ctx.createRadialGradient(mc.x, mc.y, 0, mc.x, mc.y, 14);
    coreGrad.addColorStop(0, 'rgba(255, 160, 80, 0.95)');
    coreGrad.addColorStop(0.6, 'rgba(240, 100, 40, 0.6)');
    coreGrad.addColorStop(1, 'rgba(200, 80, 30, 0.3)');
    ctx.fillStyle = coreGrad;
    ctx.beginPath();
    ctx.arc(mc.x, mc.y, 12, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    ctx.beginPath();
    ctx.arc(mc.x - 3, mc.y - 3, 4, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.fill();

    ctx.restore();
  }
}

function renderBumperOrbs(rc: RenderContext, hazards: HazardState) {
  const { ctx, now } = rc;
  for (const bo of hazards.bumperOrbs) {
    const pos = bo.body.position;
    ctx.save();

    const pulse = 0.8 + Math.sin(now * 0.006) * 0.2;

    const outerGlow = ctx.createRadialGradient(pos.x, pos.y, bo.radius, pos.x, pos.y, bo.radius + 8);
    outerGlow.addColorStop(0, `rgba(255, 220, 0, ${0.3 * pulse})`);
    outerGlow.addColorStop(1, 'transparent');
    ctx.fillStyle = outerGlow;
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, bo.radius + 8, 0, Math.PI * 2);
    ctx.fill();

    ctx.shadowColor = `rgba(255, 220, 0, ${0.5 * pulse})`;
    ctx.shadowBlur = 10;
    const grad = ctx.createRadialGradient(
      pos.x - bo.radius * 0.2, pos.y - bo.radius * 0.2, 0,
      pos.x, pos.y, bo.radius
    );
    grad.addColorStop(0, '#FFFACC');
    grad.addColorStop(0.3, '#FFEE88');
    grad.addColorStop(0.7, '#FFD700');
    grad.addColorStop(1, '#CC9900');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, bo.radius, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = `rgba(255, 240, 100, ${0.5 * pulse})`;
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.shadowBlur = 0;

    ctx.beginPath();
    ctx.arc(pos.x - bo.radius * 0.25, pos.y - bo.radius * 0.25, bo.radius * 0.3, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.fill();

    const impactT = ((now * 0.002) % 1);
    const impactR = bo.radius + impactT * 12;
    const impactAlpha = (1 - impactT) * 0.3;
    ctx.strokeStyle = `rgba(255, 220, 80, ${impactAlpha})`;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, impactR, 0, Math.PI * 2);
    ctx.stroke();

    ctx.restore();
  }
}

function renderSolarFlares(rc: RenderContext, hazards: HazardState) {
  const { ctx, now } = rc;
  for (const sf of hazards.solarFlares) {
    ctx.save();

    const pulse = 0.7 + Math.sin(now * 0.01) * 0.3;
    const beamH = sf.killHeight;

    const outerAura = ctx.createLinearGradient(sf.xOffset, sf.y - beamH * 4, sf.xOffset, sf.y + beamH * 4);
    outerAura.addColorStop(0, 'transparent');
    outerAura.addColorStop(0.25, `rgba(200, 60, 0, ${0.06 * pulse})`);
    outerAura.addColorStop(0.4, `rgba(255, 100, 10, ${0.12 * pulse})`);
    outerAura.addColorStop(0.5, `rgba(255, 130, 20, ${0.18 * pulse})`);
    outerAura.addColorStop(0.6, `rgba(255, 100, 10, ${0.12 * pulse})`);
    outerAura.addColorStop(0.75, `rgba(200, 60, 0, ${0.06 * pulse})`);
    outerAura.addColorStop(1, 'transparent');
    ctx.fillStyle = outerAura;
    ctx.fillRect(sf.xOffset, sf.y - beamH * 4, sf.width, beamH * 8);

    const innerBeam = ctx.createLinearGradient(sf.xOffset, sf.y - beamH * 1.5, sf.xOffset, sf.y + beamH * 1.5);
    innerBeam.addColorStop(0, 'transparent');
    innerBeam.addColorStop(0.2, `rgba(255, 200, 80, ${0.35 * pulse})`);
    innerBeam.addColorStop(0.4, `rgba(255, 230, 120, ${0.6 * pulse})`);
    innerBeam.addColorStop(0.5, `rgba(255, 245, 180, ${0.75 * pulse})`);
    innerBeam.addColorStop(0.6, `rgba(255, 230, 120, ${0.6 * pulse})`);
    innerBeam.addColorStop(0.8, `rgba(255, 200, 80, ${0.35 * pulse})`);
    innerBeam.addColorStop(1, 'transparent');
    ctx.fillStyle = innerBeam;
    ctx.fillRect(sf.xOffset, sf.y - beamH * 1.5, sf.width, beamH * 3);

    ctx.shadowColor = `rgba(255, 240, 150, ${0.8 * pulse})`;
    ctx.shadowBlur = 6;
    ctx.strokeStyle = `rgba(255, 252, 230, ${0.95 * pulse})`;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(sf.xOffset, sf.y);
    ctx.lineTo(sf.xOffset + sf.width, sf.y);
    ctx.stroke();
    ctx.shadowBlur = 0;

    ctx.strokeStyle = `rgba(255, 255, 255, ${0.4 * pulse})`;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(sf.xOffset, sf.y);
    ctx.lineTo(sf.xOffset + sf.width, sf.y);
    ctx.stroke();

    for (let i = 0; i < 8; i++) {
      const t = ((now * 0.003 + i * 0.125) % 1);
      const sx = sf.xOffset + t * sf.width;
      const sy = sf.y + Math.sin(now * 0.008 + i * 2.5) * beamH * 2;
      const sparkAlpha = 0.5 + Math.sin(now * 0.012 + i) * 0.3;
      ctx.beginPath();
      ctx.arc(sx, sy, 1.2, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 250, 200, ${sparkAlpha * pulse})`;
      ctx.fill();
    }

    ctx.restore();
  }
}

function slowMoBlobPath(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, now: number) {
  const cx = x + w / 2;
  const cy = y + h / 2;
  const rx = w / 2;
  const ry = h / 2;
  const points = 64;
  ctx.beginPath();
  for (let i = 0; i <= points; i++) {
    const t = (i / points) * Math.PI * 2;
    const wobble = 1
      + 0.1 * Math.sin(t * 5 + now * 0.0008)
      + 0.06 * Math.cos(t * 8 - now * 0.0012)
      + 0.04 * Math.sin(t * 3 + now * 0.0006);
    const px = cx + Math.cos(t) * rx * wobble;
    const py = cy + Math.sin(t) * ry * wobble;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
}

function renderSlowMoFields(rc: RenderContext, hazards: HazardState) {
  const { ctx, now } = rc;
  for (const sm of hazards.slowMoFields) {
    ctx.save();

    const cx = sm.x + sm.width / 2;
    const cy = sm.y + sm.height / 2;
    const maxR = Math.max(sm.width, sm.height) / 2;

    ctx.save();
    slowMoBlobPath(ctx, sm.x, sm.y, sm.width, sm.height, now);
    ctx.clip();

    const bgGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, maxR);
    bgGrad.addColorStop(0, 'rgba(40, 100, 180, 0.18)');
    bgGrad.addColorStop(0.4, 'rgba(30, 80, 160, 0.12)');
    bgGrad.addColorStop(0.7, 'rgba(20, 60, 140, 0.07)');
    bgGrad.addColorStop(1, 'rgba(15, 50, 120, 0.03)');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(sm.x - 15, sm.y - 15, sm.width + 30, sm.height + 30);

    const ringCount = 4;
    for (let i = 0; i < ringCount; i++) {
      const phase = now * 0.0004 + i * 1.5;
      const progress = (phase % 3) / 3;
      const ringR = maxR * 0.2 + progress * maxR * 0.8;
      const ringAlpha = (1 - progress) * 0.12;
      if (ringAlpha < 0.01) continue;

      ctx.beginPath();
      ctx.arc(cx, cy, ringR, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(80, 160, 220, ${ringAlpha})`;
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }

    const wavePhase = now * 0.0003;
    for (let i = 0; i < 4; i++) {
      const baseY = sm.y + sm.height * (0.2 + i * 0.2);
      const alpha = 0.08 + Math.sin(now * 0.0015 + i * 1.1) * 0.03;
      ctx.strokeStyle = `rgba(60, 140, 200, ${alpha})`;
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      for (let px = 0; px <= sm.width; px += 3) {
        const xNorm = px / sm.width;
        const edgeFade = Math.sin(xNorm * Math.PI);
        const y = baseY + Math.sin(px * 0.015 + wavePhase + i * 2.2) * 8 * edgeFade;
        if (px === 0) ctx.moveTo(sm.x + px, y);
        else ctx.lineTo(sm.x + px, y);
      }
      ctx.stroke();
    }

    for (let i = 0; i < 15; i++) {
      const seed = i * 137.5 + sm.x * 3.1;
      const angle = seed * 2.39996;
      const dist = Math.abs(Math.sin(seed * 0.3)) * maxR * 0.85;
      const px = cx + Math.cos(angle) * dist;
      const baseY = cy + Math.sin(angle) * dist * (sm.height / sm.width);
      const drift = Math.sin(now * 0.0004 + seed) * 6;
      const py = baseY + drift;
      const pSize = 1.5 + Math.sin(seed * 0.7) * 1;
      const distFromCenter = Math.sqrt(Math.pow(px - cx, 2) + Math.pow(py - cy, 2)) / maxR;
      const pAlpha = (0.25 + Math.sin(now * 0.001 + seed) * 0.1) * Math.max(0, 1 - distFromCenter);

      ctx.beginPath();
      ctx.arc(px, py, pSize, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(100, 180, 230, ${pAlpha})`;
      ctx.fill();
    }

    const clockX = cx;
    const clockY = cy;
    const clockR = Math.min(sm.width, sm.height) * 0.12;
    const clockAlpha = 0.15 + Math.sin(now * 0.002) * 0.05;

    ctx.beginPath();
    ctx.arc(clockX, clockY, clockR, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(100, 180, 230, ${clockAlpha})`;
    ctx.lineWidth = 1.5;
    ctx.stroke();

    for (let i = 0; i < 12; i++) {
      const tickAngle = (i / 12) * Math.PI * 2 - Math.PI / 2;
      const inner = clockR * 0.8;
      const outer = clockR * 0.95;
      ctx.beginPath();
      ctx.moveTo(clockX + Math.cos(tickAngle) * inner, clockY + Math.sin(tickAngle) * inner);
      ctx.lineTo(clockX + Math.cos(tickAngle) * outer, clockY + Math.sin(tickAngle) * outer);
      ctx.strokeStyle = `rgba(100, 180, 230, ${clockAlpha * 0.7})`;
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    const slowHandAngle = (now * 0.0002) % (Math.PI * 2) - Math.PI / 2;
    ctx.beginPath();
    ctx.moveTo(clockX, clockY);
    ctx.lineTo(clockX + Math.cos(slowHandAngle) * clockR * 0.65, clockY + Math.sin(slowHandAngle) * clockR * 0.65);
    ctx.strokeStyle = `rgba(120, 190, 240, ${clockAlpha})`;
    ctx.lineWidth = 1.5;
    ctx.lineCap = 'round';
    ctx.stroke();

    ctx.restore();

    ctx.globalAlpha = 0.2 + Math.sin(now * 0.0015) * 0.05;
    ctx.strokeStyle = 'rgba(60, 150, 210, 0.35)';
    ctx.lineWidth = 1.5;
    slowMoBlobPath(ctx, sm.x, sm.y, sm.width, sm.height, now);
    ctx.stroke();
    ctx.globalAlpha = 1;

    ctx.restore();
  }
}

function renderVoidZones(rc: RenderContext, hazards: HazardState) {
  const { ctx, now } = rc;
  for (const vz of hazards.voidZones) {
    ctx.save();

    const cx = vz.x + vz.width / 2;
    const cy = vz.y + vz.height / 2;
    const pulse = 0.7 + Math.sin(now * 0.005) * 0.3;

    const outerGrad = ctx.createRadialGradient(
      cx, cy, 0, cx, cy, Math.max(vz.width, vz.height) * 0.65
    );
    outerGrad.addColorStop(0, `rgba(0, 0, 0, ${0.85 * pulse})`);
    outerGrad.addColorStop(0.5, `rgba(10, 0, 20, ${0.4 * pulse})`);
    outerGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = outerGrad;
    ctx.fillRect(vz.x - 10, vz.y - 10, vz.width + 20, vz.height + 20);

    ctx.fillStyle = `rgba(0, 0, 0, ${0.92 * pulse})`;
    ctx.fillRect(vz.x, vz.y, vz.width, vz.height);

    const glitchSeed = Math.floor(now * 0.02);
    for (let sy = vz.y; sy < vz.y + vz.height; sy += 3) {
      const hashVal = Math.sin(sy * 3.7 + glitchSeed * 0.5) * 43758.5453;
      const rnd = hashVal - Math.floor(hashVal);
      if (rnd > 0.35) continue;
      const shiftX = Math.sin(sy * 0.5 + glitchSeed * 0.3) * 4;
      const barW = vz.width * (0.15 + rnd * 0.5);
      const barX = vz.x + shiftX + (vz.width - barW) * Math.abs(Math.sin(sy * 1.1 + glitchSeed * 0.2));
      const r = Math.floor(40 + rnd * 60);
      const g = Math.floor(rnd * 30);
      const b = Math.floor(60 + rnd * 80);
      ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${0.25 + rnd * 0.2})`;
      ctx.fillRect(Math.max(vz.x, barX), sy, Math.min(barW, vz.x + vz.width - barX), 2);
    }

    const jitterFrame = Math.floor(now * 0.015);
    for (let i = 0; i < 3; i++) {
      const tearY = vz.y + ((jitterFrame * 17 + i * 41) % Math.floor(vz.height));
      const tearH = 2 + (jitterFrame + i * 7) % 5;
      const tearShift = Math.sin(jitterFrame * 0.7 + i * 2.3) * 6;
      if (tearY + tearH > vz.y + vz.height) continue;
      ctx.fillStyle = `rgba(0, 0, 0, 0.9)`;
      ctx.fillRect(vz.x + tearShift, tearY, vz.width, tearH);
      ctx.fillStyle = `rgba(80, 20, 120, 0.3)`;
      ctx.fillRect(vz.x + tearShift + 2, tearY, vz.width - 4, 1);
    }

    for (let i = 0; i < 15; i++) {
      const h1 = Math.sin(now * 0.008 + i * 7.3);
      const h2 = Math.sin(now * 0.006 + i * 4.7);
      const nx = vz.x + ((h1 * 0.5 + 0.5) * vz.width);
      const ny = vz.y + ((h2 * 0.5 + 0.5) * vz.height);
      const nAlpha = 0.15 + Math.sin(now * 0.015 + i * 2.1) * 0.1;
      ctx.fillStyle = `rgba(${80 + Math.floor(h1 * 40)}, ${40 + Math.floor(h2 * 20)}, ${120 + Math.floor(h1 * 40)}, ${nAlpha})`;
      ctx.fillRect(nx, ny, 2, 2);
    }

    const jitter = Math.sin(now * 0.03) * 2;
    ctx.shadowColor = `rgba(80, 0, 120, ${0.5 * pulse})`;
    ctx.shadowBlur = 6;
    ctx.strokeStyle = `rgba(100, 30, 160, ${0.4 * pulse})`;
    ctx.lineWidth = 1.5;
    ctx.strokeRect(vz.x + jitter * 0.4, vz.y - jitter * 0.2, vz.width, vz.height);
    ctx.shadowBlur = 0;

    ctx.strokeStyle = `rgba(140, 60, 200, ${0.2 * pulse})`;
    ctx.lineWidth = 1;
    ctx.strokeRect(vz.x - jitter * 0.3, vz.y + jitter * 0.15, vz.width, vz.height);

    ctx.restore();
  }
}
