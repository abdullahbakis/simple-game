import { GAME, CANDY_RGB } from './constants';

const PADDING = 6;
let sprites: HTMLCanvasElement[] = [];
let spriteOffset = 0;

export function initSpriteCache() {
  const vr = GAME.particleRadius * 1.8;
  spriteOffset = vr + PADDING;
  const size = Math.ceil(spriteOffset * 2);

  sprites = [];

  for (let ci = 0; ci < CANDY_RGB.length; ci++) {
    const [cr, cg, cb] = CANDY_RGB[ci];
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d')!;

    const cx = spriteOffset;
    const cy = spriteOffset;

    ctx.shadowColor = `rgba(${cr},${cg},${cb},0.6)`;
    ctx.shadowBlur = 3;

    const grad = ctx.createRadialGradient(
      cx - vr * 0.3, cy - vr * 0.3, 0,
      cx, cy, vr
    );
    grad.addColorStop(0, '#FFFFFF');
    grad.addColorStop(0.35, `rgba(${cr},${cg},${cb},0.9)`);
    grad.addColorStop(1, `rgba(${Math.max(cr - 40, 0)},${Math.max(cg - 40, 0)},${Math.max(cb - 40, 0)},1)`);

    ctx.beginPath();
    ctx.arc(cx, cy, vr, 0, Math.PI * 2);
    ctx.fillStyle = grad;
    ctx.fill();

    ctx.strokeStyle = `rgba(${Math.max(cr - 60, 0)},${Math.max(cg - 60, 0)},${Math.max(cb - 60, 0)},0.5)`;
    ctx.lineWidth = 0.8;
    ctx.stroke();

    ctx.shadowBlur = 0;

    ctx.beginPath();
    ctx.arc(cx - vr * 0.25, cy - vr * 0.25, vr * 0.25, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.fill();

    const eyeSpacing = vr * 0.28;
    const eyeY = cy - vr * 0.05;
    const eyeR = vr * 0.12;

    ctx.fillStyle = '#1a1a2e';
    ctx.beginPath();
    ctx.arc(cx - eyeSpacing, eyeY, eyeR, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(cx + eyeSpacing, eyeY, eyeR, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(cx - eyeSpacing - eyeR * 0.3, eyeY - eyeR * 0.3, eyeR * 0.45, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(cx + eyeSpacing - eyeR * 0.3, eyeY - eyeR * 0.3, eyeR * 0.45, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.arc(cx, cy + vr * 0.2, vr * 0.18, 0, Math.PI);
    ctx.strokeStyle = '#1a1a2e';
    ctx.lineWidth = 0.6;
    ctx.stroke();

    sprites.push(canvas);
  }
}

export function getBallSprite(colorIdx: number): HTMLCanvasElement {
  return sprites[colorIdx % sprites.length];
}

export function getSpriteOffset(): number {
  return spriteOffset;
}
