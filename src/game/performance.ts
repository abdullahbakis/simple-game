import { isMobile } from './constants';

let fps = 60;
let frameCount = 0;
let lastFpsCheck = 0;

let smoothTrailLimit = 8.0;
let shadowMultiplier = 1.0;

const shadowBlurDesc = (() => {
  try {
    return Object.getOwnPropertyDescriptor(CanvasRenderingContext2D.prototype, 'shadowBlur') ?? null;
  } catch {
    return null;
  }
})();

export function tickPerformance(now: number) {
  frameCount++;
  const elapsed = now - lastFpsCheck;
  if (elapsed < 500) return;

  fps = Math.round((frameCount * 1000) / elapsed);
  frameCount = 0;
  lastFpsCheck = now;

  if (!isMobile) return;

  const targetTrail =
    fps >= 55 ? 8 :
    fps >= 45 ? 6 :
    fps >= 35 ? 4 : 3;

  smoothTrailLimit += (targetTrail - smoothTrailLimit) * 0.15;

  const targetShadow =
    fps >= 55 ? 1.0 :
    fps >= 45 ? 0.7 :
    fps >= 35 ? 0.35 : 0.0;

  shadowMultiplier += (targetShadow - shadowMultiplier) * 0.12;
}

export function getTrailLimit(): number {
  if (!isMobile) return 8;
  return Math.max(3, Math.round(smoothTrailLimit));
}

export function shouldUseShadowBlur(): boolean {
  return true;
}

export function disableShadows(ctx: CanvasRenderingContext2D) {
  applyShadowContext(ctx);
}

export function enableShadows(ctx: CanvasRenderingContext2D) {
  clearShadowContext(ctx);
}

export function applyShadowContext(ctx: CanvasRenderingContext2D) {
  if (!isMobile || shadowMultiplier >= 0.99) {
    const own = Object.getOwnPropertyDescriptor(ctx, 'shadowBlur');
    if (own) delete (ctx as any).shadowBlur;
    return;
  }

  const m = shadowMultiplier < 0.08 ? 0 : shadowMultiplier;

  if (m <= 0) {
    Object.defineProperty(ctx, 'shadowBlur', {
      get() { return 0; },
      set() {},
      configurable: true,
    });
    return;
  }

  if (!shadowBlurDesc?.set) {
    Object.defineProperty(ctx, 'shadowBlur', {
      get() { return 0; },
      set() {},
      configurable: true,
    });
    return;
  }

  const setter = shadowBlurDesc.set;
  Object.defineProperty(ctx, 'shadowBlur', {
    get() { return 0; },
    set(v: number) {
      setter.call(ctx, v * m);
    },
    configurable: true,
  });
}

export function clearShadowContext(ctx: CanvasRenderingContext2D) {
  const own = Object.getOwnPropertyDescriptor(ctx, 'shadowBlur');
  if (own) delete (ctx as any).shadowBlur;
}
