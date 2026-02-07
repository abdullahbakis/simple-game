import type { RenderContext } from './constants';
import type { HazardState } from './hazards';

export function renderHazards(rc: RenderContext, hazards: HazardState) {
  renderBlackHoles(rc, hazards);
  renderLavaPools(rc, hazards);
  renderIceZones(rc, hazards);
  renderTeleporters(rc, hazards);
  renderEmpPulses(rc, hazards);
  renderGravityFlippers(rc, hazards);
  renderLaserGates(rc, hazards);
  renderAsteroids(rc, hazards);
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

    const ringCount = 3;
    for (let i = 0; i < ringCount; i++) {
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

    const particleCount = 6;
    for (let i = 0; i < particleCount; i++) {
      const a = bh.angle * 2 + (i / particleCount) * Math.PI * 2;
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

    const r = 4;
    ctx.beginPath();
    ctx.moveTo(lava.x + r, lava.y);
    ctx.lineTo(lava.x + lava.width - r, lava.y);
    ctx.quadraticCurveTo(lava.x + lava.width, lava.y, lava.x + lava.width, lava.y + r);
    ctx.lineTo(lava.x + lava.width, lava.y + lava.height - r);
    ctx.quadraticCurveTo(lava.x + lava.width, lava.y + lava.height, lava.x + lava.width - r, lava.y + lava.height);
    ctx.lineTo(lava.x + r, lava.y + lava.height);
    ctx.quadraticCurveTo(lava.x, lava.y + lava.height, lava.x, lava.y + lava.height - r);
    ctx.lineTo(lava.x, lava.y + r);
    ctx.quadraticCurveTo(lava.x, lava.y, lava.x + r, lava.y);
    ctx.closePath();
    ctx.fill();

    ctx.shadowColor = 'rgba(255, 100, 0, 0.5)';
    ctx.shadowBlur = 10;
    ctx.strokeStyle = 'rgba(255, 180, 50, 0.6)';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.shadowBlur = 0;

    const bubbleCount = 4;
    for (let i = 0; i < bubbleCount; i++) {
      const bx = lava.x + 10 + ((now * 0.02 + i * lava.width / bubbleCount) % (lava.width - 20));
      const bubbleY = lava.y + lava.height * 0.3 + Math.sin(now * 0.004 + i * 2) * lava.height * 0.2;
      const br = 2 + Math.sin(now * 0.006 + i * 3) * 1;
      ctx.beginPath();
      ctx.arc(bx, bubbleY, Math.max(br, 0.5), 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 200, 80, ${0.4 + Math.sin(now * 0.005 + i) * 0.2})`;
      ctx.fill();
    }

    const heatGrad = ctx.createLinearGradient(lava.x, lava.y - 15, lava.x, lava.y);
    heatGrad.addColorStop(0, 'transparent');
    heatGrad.addColorStop(1, 'rgba(255, 100, 0, 0.1)');
    ctx.fillStyle = heatGrad;
    ctx.fillRect(lava.x, lava.y - 15, lava.width, 15);

    ctx.font = 'bold 8px Nunito, sans-serif';
    ctx.fillStyle = 'rgba(255, 160, 60, 0.6)';
    ctx.textAlign = 'center';
    ctx.fillText('LAVA', lava.x + lava.width / 2, lava.y - 4);

    ctx.restore();
  }
}

function renderIceZones(rc: RenderContext, hazards: HazardState) {
  const { ctx, now } = rc;
  for (const ice of hazards.iceZones) {
    ctx.save();

    ctx.fillStyle = 'rgba(140, 210, 240, 0.08)';
    ctx.fillRect(ice.x, ice.y, ice.width, ice.height);

    ctx.strokeStyle = 'rgba(160, 220, 255, 0.3)';
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 3]);
    ctx.strokeRect(ice.x, ice.y, ice.width, ice.height);
    ctx.setLineDash([]);

    const flakeCount = 5;
    for (let i = 0; i < flakeCount; i++) {
      const fx = ice.x + 10 + ((i * ice.width / flakeCount + now * 0.01) % (ice.width - 20));
      const fy = ice.y + 10 + ((i * ice.height / flakeCount + now * 0.008) % (ice.height - 20));
      const fAlpha = 0.2 + Math.sin(now * 0.003 + i * 1.8) * 0.15;
      const fSize = 3 + Math.sin(now * 0.002 + i) * 1;

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
      }
      ctx.restore();
    }

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
    ctx.shadowColor = `rgba(255, 200, 50, ${0.4 + orbPulse * 0.3})`;
    ctx.shadowBlur = 8;
    const orbGrad = ctx.createRadialGradient(emp.x, emp.y, 0, emp.x, emp.y, 8);
    orbGrad.addColorStop(0, `rgba(255, 230, 100, ${0.7 + orbPulse * 0.3})`);
    orbGrad.addColorStop(1, `rgba(255, 180, 30, ${0.3 + orbPulse * 0.2})`);
    ctx.fillStyle = orbGrad;
    ctx.beginPath();
    ctx.arc(emp.x, emp.y, 6 + orbPulse * 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    if (emp.active && emp.currentRadius > 0) {
      const life = 1 - emp.currentRadius / emp.maxRadius;
      const alpha = life * 0.5;

      ctx.strokeStyle = `rgba(255, 210, 60, ${alpha})`;
      ctx.lineWidth = 3 * life + 1;
      ctx.beginPath();
      ctx.arc(emp.x, emp.y, emp.currentRadius, 0, Math.PI * 2);
      ctx.stroke();

      if (emp.currentRadius > 20) {
        ctx.strokeStyle = `rgba(255, 230, 100, ${alpha * 0.4})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(emp.x, emp.y, emp.currentRadius - 15, 0, Math.PI * 2);
        ctx.stroke();
      }
    }

    ctx.font = 'bold 8px Nunito, sans-serif';
    ctx.fillStyle = 'rgba(255, 200, 80, 0.4)';
    ctx.textAlign = 'center';
    ctx.fillText('EMP', emp.x, emp.y - 14);

    ctx.restore();
  }
}

function renderGravityFlippers(rc: RenderContext, hazards: HazardState) {
  const { ctx, now } = rc;
  for (const gf of hazards.gravityFlippers) {
    ctx.save();

    ctx.fillStyle = 'rgba(40, 200, 120, 0.06)';
    ctx.fillRect(gf.x, gf.y, gf.width, gf.height);

    ctx.strokeStyle = 'rgba(40, 200, 120, 0.25)';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    ctx.strokeRect(gf.x, gf.y, gf.width, gf.height);
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

    ctx.shadowColor = `rgba(255, 40, 40, ${0.5 * pulse})`;
    ctx.shadowBlur = 12;
    ctx.strokeStyle = `rgba(255, 50, 50, ${0.8 * pulse})`;
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(ax, ay);
    ctx.lineTo(bx, by);
    ctx.stroke();

    ctx.shadowBlur = 0;
    ctx.strokeStyle = `rgba(255, 180, 180, ${0.5 * pulse})`;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(ax, ay);
    ctx.lineTo(bx, by);
    ctx.stroke();

    ctx.shadowColor = 'rgba(255, 50, 50, 0.6)';
    ctx.shadowBlur = 6;
    for (const [ex, ey] of [[ax, ay], [bx, by]]) {
      ctx.beginPath();
      ctx.arc(ex, ey, 4, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 80, 80, ${pulse})`;
      ctx.fill();
    }
    ctx.shadowBlur = 0;

    ctx.beginPath();
    ctx.arc(lg.x, lg.y, 3, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 200, 200, 0.4)';
    ctx.fill();

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
