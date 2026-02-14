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

    const outerGrad = ctx.createRadialGradient(bh.x, bh.y, bh.killRadius, bh.x, bh.y, bh.radius);
    outerGrad.addColorStop(0, 'rgba(10, 5, 30, 0.7)');
    outerGrad.addColorStop(0.3, 'rgba(20, 10, 50, 0.3)');
    outerGrad.addColorStop(0.7, 'rgba(0, 60, 120, 0.08)');
    outerGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = outerGrad;
    ctx.beginPath();
    ctx.arc(bh.x, bh.y, bh.radius, 0, Math.PI * 2);
    ctx.fill();

    ctx.shadowColor = 'rgba(0, 100, 180, 0.6)';
    ctx.shadowBlur = 12;
    const coreGrad = ctx.createRadialGradient(bh.x, bh.y, 0, bh.x, bh.y, bh.killRadius);
    coreGrad.addColorStop(0, '#000000');
    coreGrad.addColorStop(0.7, '#0a0a1a');
    coreGrad.addColorStop(1, 'rgba(0, 80, 160, 0.8)');
    ctx.fillStyle = coreGrad;
    ctx.beginPath();
    ctx.arc(bh.x, bh.y, bh.killRadius, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    for (let i = 0; i < 3; i++) {
      const ringR = bh.killRadius + 8 + i * 10;
      const rot = bh.angle * (i % 2 === 0 ? 1 : -1) + i * 1.5;
      ctx.save();
      ctx.translate(bh.x, bh.y);
      ctx.rotate(rot);
      ctx.setLineDash([3, 6]);
      const alpha = 0.25 - i * 0.06 + Math.sin(now * 0.003 + i) * 0.08;
      ctx.strokeStyle = `rgba(0, 140, 220, ${Math.max(alpha, 0.05)})`;
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.ellipse(0, 0, ringR * 1.3, ringR * 0.6, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();
    }

    for (let i = 0; i < 6; i++) {
      const a = bh.angle * 2 + (i / 6) * Math.PI * 2;
      const orbitR = bh.killRadius + 6 + Math.sin(now * 0.004 + i * 2) * 8;
      const px = bh.x + Math.cos(a) * orbitR * 1.2;
      const py = bh.y + Math.sin(a) * orbitR * 0.5;
      const pAlpha = 0.4 + Math.sin(now * 0.005 + i) * 0.3;
      ctx.beginPath();
      ctx.arc(px, py, 1.5, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(100, 180, 255, ${pAlpha})`;
      ctx.fill();
    }

    ctx.font = 'bold 9px Nunito, sans-serif';
    ctx.fillStyle = 'rgba(100, 160, 220, 0.5)';
    ctx.textAlign = 'center';
    ctx.fillText('BLACK HOLE', bh.x, bh.y - bh.killRadius - 10);

    ctx.restore();
  }
}

function renderLavaPools(rc: RenderContext, hazards: HazardState) {
  const { ctx, now } = rc;
  for (const lava of hazards.lavaPools) {
    ctx.save();

    const grad = ctx.createLinearGradient(lava.x, lava.y, lava.x, lava.y + lava.height);
    grad.addColorStop(0, 'rgba(255, 120, 20, 0.9)');
    grad.addColorStop(0.5, 'rgba(220, 60, 10, 0.85)');
    grad.addColorStop(1, 'rgba(160, 30, 5, 0.9)');
    ctx.fillStyle = grad;
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

    ctx.font = 'bold 8px Nunito, sans-serif';
    ctx.fillStyle = 'rgba(255, 160, 60, 0.6)';
    ctx.textAlign = 'center';
    ctx.fillText('LAVA', lava.x + lava.width / 2, lava.y - 6);

    ctx.restore();
  }
}

function renderIceZones(rc: RenderContext, hazards: HazardState) {
  const { ctx, now } = rc;
  for (const ice of hazards.iceZones) {
    ctx.save();

    ctx.save();
    roundedRect(ctx, ice.x, ice.y, ice.width, ice.height, 6);
    ctx.clip();

    const bgGrad = ctx.createLinearGradient(ice.x, ice.y, ice.x, ice.y + ice.height);
    bgGrad.addColorStop(0, 'rgba(180, 230, 255, 0.12)');
    bgGrad.addColorStop(0.5, 'rgba(140, 210, 240, 0.08)');
    bgGrad.addColorStop(1, 'rgba(160, 220, 250, 0.1)');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(ice.x, ice.y, ice.width, ice.height);

    ctx.strokeStyle = 'rgba(200, 240, 255, 0.15)';
    ctx.lineWidth = 1;
    const seed1 = Math.floor(ice.x * 7.3 + ice.y * 3.1);
    for (let i = 0; i < 6; i++) {
      const sx = ice.x + ((seed1 + i * 37) % ice.width);
      const sy = ice.y + ((seed1 * 3 + i * 53) % ice.height);
      ctx.beginPath();
      ctx.moveTo(sx, sy);
      const branches = 2 + (i % 3);
      for (let b = 0; b < branches; b++) {
        const angle = (seed1 + i + b * 1.8) * 0.7;
        const len = 10 + (i * 7) % 20;
        ctx.lineTo(sx + Math.cos(angle) * len, sy + Math.sin(angle) * len);
        ctx.moveTo(sx, sy);
      }
      ctx.stroke();
    }

    const shimmerX = ice.x + ((now * 0.03) % (ice.width + 40)) - 20;
    const shimmerGrad = ctx.createLinearGradient(shimmerX - 15, 0, shimmerX + 15, 0);
    shimmerGrad.addColorStop(0, 'transparent');
    shimmerGrad.addColorStop(0.5, 'rgba(255, 255, 255, 0.12)');
    shimmerGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = shimmerGrad;
    ctx.fillRect(shimmerX - 15, ice.y, 30, ice.height);

    ctx.restore();

    for (let i = 0; i < 5; i++) {
      const fx = ice.x + 10 + ((i * ice.width / 5 + now * 0.01) % (ice.width - 20));
      const fy = ice.y + 10 + ((i * ice.height / 5 + now * 0.008) % (ice.height - 20));
      const fAlpha = 0.25 + Math.sin(now * 0.003 + i * 1.8) * 0.15;
      const fSize = 4 + Math.sin(now * 0.002 + i) * 1.5;

      ctx.save();
      ctx.translate(fx, fy);
      ctx.rotate(now * 0.001 + i);
      ctx.strokeStyle = `rgba(200, 230, 255, ${fAlpha})`;
      ctx.lineWidth = 0.8;
      for (let j = 0; j < 3; j++) {
        const a = (j / 3) * Math.PI;
        ctx.beginPath();
        ctx.moveTo(-Math.cos(a) * fSize, -Math.sin(a) * fSize);
        ctx.lineTo(Math.cos(a) * fSize, Math.sin(a) * fSize);
        ctx.stroke();
        const branchLen = fSize * 0.4;
        for (const sign of [-1, 1]) {
          const bx = Math.cos(a) * fSize * 0.6;
          const by = Math.sin(a) * fSize * 0.6;
          const ba = a + sign * 0.6;
          ctx.beginPath();
          ctx.moveTo(bx, by);
          ctx.lineTo(bx + Math.cos(ba) * branchLen, by + Math.sin(ba) * branchLen);
          ctx.stroke();
        }
      }
      ctx.restore();
    }

    ctx.strokeStyle = 'rgba(160, 220, 255, 0.3)';
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 3]);
    roundedRect(ctx, ice.x, ice.y, ice.width, ice.height, 6);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.font = 'bold 9px Nunito, sans-serif';
    ctx.fillStyle = 'rgba(160, 220, 255, 0.45)';
    ctx.textAlign = 'center';
    ctx.fillText('ICE', ice.x + ice.width / 2, ice.y + 13);

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

    ctx.font = 'bold 8px Nunito, sans-serif';
    ctx.fillStyle = 'rgba(255, 200, 80, 0.4)';
    ctx.textAlign = 'center';
    ctx.fillText('EMP', emp.x, emp.y - 16);

    ctx.restore();
  }
}

function renderGravityFlippers(rc: RenderContext, hazards: HazardState) {
  const { ctx, now } = rc;
  for (const gf of hazards.gravityFlippers) {
    ctx.save();

    const bgGrad = ctx.createLinearGradient(gf.x, gf.y, gf.x, gf.y + gf.height);
    bgGrad.addColorStop(0, 'rgba(40, 200, 120, 0.1)');
    bgGrad.addColorStop(1, 'rgba(40, 200, 120, 0.04)');
    ctx.fillStyle = bgGrad;
    roundedRect(ctx, gf.x, gf.y, gf.width, gf.height, 5);
    ctx.fill();

    ctx.strokeStyle = 'rgba(40, 200, 120, 0.25)';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    roundedRect(ctx, gf.x, gf.y, gf.width, gf.height, 5);
    ctx.stroke();
    ctx.setLineDash([]);

    const streakCount = 4;
    for (let i = 0; i < streakCount; i++) {
      const sx = gf.x + (i + 0.5) * (gf.width / streakCount);
      const travel = gf.height + 20;
      const offset = ((now * 0.06 + i * (travel / streakCount)) % travel);
      const sy = gf.y + gf.height - offset;
      const streakLen = 12 + (i % 2) * 6;
      const ey = sy - streakLen;
      if (sy < gf.y || ey > gf.y + gf.height) continue;
      const clampSy = Math.min(gf.y + gf.height, Math.max(gf.y, sy));
      const clampEy = Math.min(gf.y + gf.height, Math.max(gf.y, ey));
      const alpha = 0.25 + Math.sin(now * 0.004 + i) * 0.1;
      ctx.beginPath();
      ctx.moveTo(sx, clampSy);
      ctx.lineTo(sx, clampEy);
      ctx.strokeStyle = `rgba(50, 220, 140, ${alpha})`;
      ctx.lineWidth = 1.5;
      ctx.lineCap = 'round';
      ctx.stroke();
    }

    const arrowX = gf.x + gf.width / 2;
    const arrowY = gf.y + 16;
    ctx.beginPath();
    ctx.moveTo(arrowX - 5, arrowY + 5);
    ctx.lineTo(arrowX, arrowY);
    ctx.lineTo(arrowX + 5, arrowY + 5);
    ctx.strokeStyle = 'rgba(50, 220, 140, 0.35)';
    ctx.lineWidth = 1.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();

    ctx.font = 'bold 8px Nunito, sans-serif';
    ctx.fillStyle = 'rgba(50, 220, 140, 0.4)';
    ctx.textAlign = 'center';
    ctx.fillText('ANTI-GRAV', gf.x + gf.width / 2, gf.y - 4);

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

    ctx.font = 'bold 8px Nunito, sans-serif';
    ctx.fillStyle = 'rgba(100, 220, 255, 0.5)';
    ctx.textAlign = 'center';
    ctx.fillText('TESLA', (tc.x1 + tc.x2) / 2, Math.min(tc.y1, tc.y2) - 16);

    ctx.restore();
  }
}

function renderRepulsorFields(rc: RenderContext, hazards: HazardState) {
  const { ctx, now } = rc;
  for (const rf of hazards.repulsorFields) {
    ctx.save();

    const pulse = 0.5 + Math.sin(now * 0.004) * 0.3;
    const grad = ctx.createRadialGradient(rf.x, rf.y, 0, rf.x, rf.y, rf.radius);
    grad.addColorStop(0, `rgba(255, 100, 200, ${0.18 * pulse})`);
    grad.addColorStop(0.5, `rgba(255, 60, 160, ${0.08 * pulse})`);
    grad.addColorStop(1, 'transparent');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(rf.x, rf.y, rf.radius, 0, Math.PI * 2);
    ctx.fill();

    for (let i = 0; i < 4; i++) {
      const t = ((now * 0.001 + i * 0.25) % 1);
      const ringR = t * rf.radius;
      const ringAlpha = (1 - t) * 0.25;
      ctx.strokeStyle = `rgba(255, 100, 200, ${ringAlpha})`;
      ctx.lineWidth = 1.5 * (1 - t);
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

    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2 + now * 0.002;
      const t = ((now * 0.002 + i * 0.125) % 1);
      const r = 10 + t * (rf.radius - 15);
      const dotAlpha = (1 - t) * 0.5;
      const dotSize = (1 - t) * 2;
      const ax = rf.x + Math.cos(a) * r;
      const ay = rf.y + Math.sin(a) * r;
      ctx.beginPath();
      ctx.arc(ax, ay, Math.max(dotSize, 0.3), 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 140, 220, ${dotAlpha})`;
      ctx.fill();
    }

    ctx.font = 'bold 8px Nunito, sans-serif';
    ctx.fillStyle = 'rgba(255, 120, 200, 0.5)';
    ctx.textAlign = 'center';
    ctx.fillText('REPULSOR', rf.x, rf.y - rf.radius - 6);

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
    grad.addColorStop(0, 'rgba(200, 80, 40, 0.15)');
    grad.addColorStop(0.5, 'rgba(180, 60, 30, 0.06)');
    grad.addColorStop(1, 'transparent');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(mc.x, mc.y, mc.radius, 0, Math.PI * 2);
    ctx.fill();

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

    for (let i = 0; i < 6; i++) {
      const baseAngle = (i / 6) * Math.PI * 2 + now * 0.001;
      const startR = 16;
      const endR = mc.radius * 0.7;
      ctx.strokeStyle = `rgba(220, 100, 50, ${0.2 - i * 0.02})`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let t = 0; t <= 1; t += 0.05) {
        const r = startR + t * (endR - startR);
        const curve = Math.sin(t * Math.PI) * 0.4;
        const a = baseAngle + curve * (i % 2 === 0 ? 1 : -1);
        const fx = mc.x + Math.cos(a) * r;
        const fy = mc.y + Math.sin(a) * r;
        if (t === 0) ctx.moveTo(fx, fy);
        else ctx.lineTo(fx, fy);
      }
      ctx.stroke();
    }

    for (let i = 0; i < 4; i++) {
      const a = now * 0.003 + (i / 4) * Math.PI * 2;
      const r = 20 + Math.sin(now * 0.002 + i * 1.5) * 6;
      const ox = mc.x + Math.cos(a) * r;
      const oy = mc.y + Math.sin(a) * r;
      ctx.beginPath();
      ctx.arc(ox, oy, 2, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 140, 60, ${0.4 + Math.sin(now * 0.005 + i) * 0.2})`;
      ctx.fill();
    }

    ctx.font = 'bold 8px Nunito, sans-serif';
    ctx.fillStyle = 'rgba(220, 120, 60, 0.5)';
    ctx.textAlign = 'center';
    ctx.fillText('MAG', mc.x, mc.y - 18);

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

    const auraGrad = ctx.createLinearGradient(sf.xOffset, sf.y - sf.killHeight * 3, sf.xOffset, sf.y + sf.killHeight * 3);
    auraGrad.addColorStop(0, 'transparent');
    auraGrad.addColorStop(0.3, `rgba(255, 150, 20, ${0.15 * pulse})`);
    auraGrad.addColorStop(0.5, `rgba(255, 80, 10, ${0.3 * pulse})`);
    auraGrad.addColorStop(0.7, `rgba(255, 150, 20, ${0.15 * pulse})`);
    auraGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = auraGrad;
    ctx.fillRect(sf.xOffset, sf.y - sf.killHeight * 3, sf.width, sf.killHeight * 6);

    const innerGrad = ctx.createLinearGradient(sf.xOffset, sf.y - sf.killHeight, sf.xOffset, sf.y + sf.killHeight);
    innerGrad.addColorStop(0, 'transparent');
    innerGrad.addColorStop(0.3, `rgba(255, 200, 60, ${0.5 * pulse})`);
    innerGrad.addColorStop(0.5, `rgba(255, 160, 30, ${0.7 * pulse})`);
    innerGrad.addColorStop(0.7, `rgba(255, 200, 60, ${0.5 * pulse})`);
    innerGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = innerGrad;
    ctx.fillRect(sf.xOffset, sf.y - sf.killHeight, sf.width, sf.killHeight * 2);

    ctx.shadowColor = `rgba(255, 220, 80, ${0.7 * pulse})`;
    ctx.shadowBlur = 4;
    ctx.strokeStyle = `rgba(255, 250, 200, ${0.9 * pulse})`;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(sf.xOffset, sf.y);
    ctx.lineTo(sf.xOffset + sf.width, sf.y);
    ctx.stroke();
    ctx.shadowBlur = 0;

    for (let i = 0; i < 6; i++) {
      const t = ((now * 0.003 + i * 0.167) % 1);
      const sx = sf.xOffset + t * sf.width;
      const sy = sf.y + (Math.sin(now * 0.008 + i * 2) * sf.killHeight * 1.5);
      const sparkAlpha = 0.5 + Math.sin(now * 0.01 + i) * 0.3;
      ctx.beginPath();
      ctx.arc(sx, sy, 1.5, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 240, 150, ${sparkAlpha * pulse})`;
      ctx.fill();
    }

    ctx.font = 'bold 8px Nunito, sans-serif';
    ctx.fillStyle = `rgba(255, 200, 80, ${0.5 * pulse})`;
    ctx.textAlign = 'center';
    ctx.fillText('FLARE', sf.xOffset + sf.width / 2, sf.y - sf.killHeight * 2 - 4);

    ctx.restore();
  }
}

function renderSlowMoFields(rc: RenderContext, hazards: HazardState) {
  const { ctx, now } = rc;
  for (const sm of hazards.slowMoFields) {
    ctx.save();

    const bgGrad = ctx.createLinearGradient(sm.x, sm.y, sm.x, sm.y + sm.height);
    bgGrad.addColorStop(0, `rgba(200, 160, 60, ${0.08 + Math.sin(now * 0.003) * 0.02})`);
    bgGrad.addColorStop(1, `rgba(180, 140, 40, ${0.05 + Math.sin(now * 0.003) * 0.02})`);
    ctx.fillStyle = bgGrad;
    roundedRect(ctx, sm.x, sm.y, sm.width, sm.height, 5);
    ctx.fill();

    ctx.strokeStyle = 'rgba(200, 170, 60, 0.25)';
    ctx.lineWidth = 1;
    ctx.setLineDash([6, 4]);
    roundedRect(ctx, sm.x, sm.y, sm.width, sm.height, 5);
    ctx.stroke();
    ctx.setLineDash([]);

    const clockX = sm.x + sm.width / 2;
    const clockY = sm.y + sm.height / 2;
    const clockR = Math.min(sm.width, sm.height) * 0.18;

    ctx.strokeStyle = 'rgba(200, 170, 60, 0.35)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(clockX, clockY, clockR, 0, Math.PI * 2);
    ctx.stroke();

    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2 - Math.PI / 2;
      const inner = clockR * 0.8;
      const outer = clockR * 0.95;
      ctx.beginPath();
      ctx.moveTo(clockX + Math.cos(a) * inner, clockY + Math.sin(a) * inner);
      ctx.lineTo(clockX + Math.cos(a) * outer, clockY + Math.sin(a) * outer);
      ctx.strokeStyle = 'rgba(200, 170, 60, 0.3)';
      ctx.lineWidth = i % 3 === 0 ? 1.5 : 0.8;
      ctx.stroke();
    }

    const minuteAngle = now * 0.0005;
    ctx.beginPath();
    ctx.moveTo(clockX, clockY);
    ctx.lineTo(clockX + Math.cos(minuteAngle) * clockR * 0.65, clockY + Math.sin(minuteAngle) * clockR * 0.65);
    ctx.strokeStyle = 'rgba(220, 190, 80, 0.5)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    const hourAngle = now * 0.0001;
    ctx.beginPath();
    ctx.moveTo(clockX, clockY);
    ctx.lineTo(clockX + Math.cos(hourAngle) * clockR * 0.4, clockY + Math.sin(hourAngle) * clockR * 0.4);
    ctx.strokeStyle = 'rgba(220, 190, 80, 0.6)';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(clockX, clockY, 2, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(220, 190, 80, 0.5)';
    ctx.fill();

    for (let i = 0; i < 2; i++) {
      const t = ((now * 0.0008 + i * 0.5) % 1);
      const rippleR = clockR + t * 15;
      const rippleAlpha = (1 - t) * 0.15;
      ctx.strokeStyle = `rgba(200, 170, 60, ${rippleAlpha})`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(clockX, clockY, rippleR, 0, Math.PI * 2);
      ctx.stroke();
    }

    ctx.font = 'bold 8px Nunito, sans-serif';
    ctx.fillStyle = 'rgba(200, 170, 60, 0.45)';
    ctx.textAlign = 'center';
    ctx.fillText('SLOW', sm.x + sm.width / 2, sm.y + 13);

    ctx.restore();
  }
}

function renderVoidZones(rc: RenderContext, hazards: HazardState) {
  const { ctx, now } = rc;
  for (const vz of hazards.voidZones) {
    ctx.save();

    const pulse = 0.7 + Math.sin(now * 0.005) * 0.3;
    const cx = vz.x + vz.width / 2;
    const cy = vz.y + vz.height / 2;

    const outerGrad = ctx.createRadialGradient(
      cx, cy, 0, cx, cy, Math.max(vz.width, vz.height) * 0.6
    );
    outerGrad.addColorStop(0, `rgba(0, 0, 0, ${0.8 * pulse})`);
    outerGrad.addColorStop(0.5, `rgba(20, 0, 40, ${0.5 * pulse})`);
    outerGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = outerGrad;
    ctx.fillRect(vz.x - 10, vz.y - 10, vz.width + 20, vz.height + 20);

    ctx.fillStyle = `rgba(0, 0, 0, ${0.9 * pulse})`;
    ctx.fillRect(vz.x, vz.y, vz.width, vz.height);

    for (let sy = vz.y; sy < vz.y + vz.height; sy += 4) {
      if (Math.sin(sy * 3.7 + now * 0.01) > 0.3) continue;
      const glitchX = vz.x + Math.sin(sy * 0.5 + now * 0.008) * 3;
      const glitchW = vz.width * (0.3 + Math.sin(sy * 2.1 + now * 0.005) * 0.3);
      ctx.fillStyle = `rgba(60, 0, 90, ${0.3 + Math.sin(sy + now * 0.01) * 0.2})`;
      ctx.fillRect(glitchX, sy, glitchW, 2);
    }

    for (let i = 0; i < 12; i++) {
      const nx = vz.x + Math.abs(Math.sin(now * 0.01 + i * 7.3)) * vz.width;
      const ny = vz.y + Math.abs(Math.sin(now * 0.008 + i * 4.7)) * vz.height;
      const nAlpha = 0.2 + Math.sin(now * 0.02 + i * 2.1) * 0.15;
      ctx.fillStyle = `rgba(100, 60, 140, ${nAlpha})`;
      ctx.fillRect(nx, ny, 2, 2);
    }

    const jitter = Math.sin(now * 0.03) * 2;
    ctx.shadowColor = `rgba(80, 0, 120, ${0.6 * pulse})`;
    ctx.shadowBlur = 8;
    ctx.strokeStyle = `rgba(120, 40, 180, ${0.5 * pulse})`;
    ctx.lineWidth = 2;
    ctx.strokeRect(vz.x + jitter * 0.3, vz.y, vz.width, vz.height);
    ctx.shadowBlur = 0;

    for (let i = 0; i < 5; i++) {
      const a = now * 0.003 + (i / 5) * Math.PI * 2;
      const r = 8 + Math.sin(now * 0.004 + i) * 4;
      const px = cx + Math.cos(a) * r;
      const py = cy + Math.sin(a) * r;
      ctx.beginPath();
      ctx.arc(px, py, 1.5, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(150, 80, 220, ${0.4 + Math.sin(now * 0.006 + i) * 0.3})`;
      ctx.fill();
    }

    ctx.font = 'bold 9px Nunito, sans-serif';
    ctx.fillStyle = `rgba(150, 80, 220, ${0.5 * pulse})`;
    ctx.textAlign = 'center';
    ctx.fillText('VOID', cx, vz.y - 6);

    ctx.restore();
  }
}
