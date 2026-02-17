import { isMobile } from './constants';

let fps = 60;
let frameCount = 0;
let lastFpsCheck = 0;
let quality = 0;

export function tickPerformance(now: number) {
  frameCount++;
  const elapsed = now - lastFpsCheck;
  if (elapsed < 1000) return;

  fps = Math.round((frameCount * 1000) / elapsed);
  frameCount = 0;
  lastFpsCheck = now;

  if (!isMobile) return;

  if (fps < 30 && quality < 2) {
    quality++;
  } else if (fps < 40 && quality < 1) {
    quality++;
  } else if (fps > 50 && quality > 0) {
    quality--;
  }
}

export function getTrailLimit(): number {
  if (!isMobile) return 8;
  if (quality === 0) return 8;
  if (quality === 1) return 5;
  return 3;
}

export function shouldUseShadowBlur(): boolean {
  if (!isMobile) return true;
  return quality === 0;
}

export function disableShadows(ctx: CanvasRenderingContext2D) {
  Object.defineProperty(ctx, 'shadowBlur', {
    get() { return 0; },
    set() {},
    configurable: true,
  });
}

export function enableShadows(ctx: CanvasRenderingContext2D) {
  delete (ctx as any).shadowBlur;
}
