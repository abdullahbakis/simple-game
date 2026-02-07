import { useRef, useEffect } from 'react';

interface StartMenuProps {
  onPlay: () => void;
}

const CANDY_COLORS = [
  { r: 255, g: 107, b: 157 },
  { r: 0, g: 212, b: 255 },
  { r: 127, g: 255, b: 0 },
  { r: 255, g: 217, b: 61 },
  { r: 255, g: 140, b: 66 },
  { r: 255, g: 107, b: 107 },
];

interface FloatingBlob {
  x: number;
  y: number;
  r: number;
  color: typeof CANDY_COLORS[number];
  vx: number;
  vy: number;
  phase: number;
}

export default function StartMenu({ onPlay }: StartMenuProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const blobs: FloatingBlob[] = [];
    for (let i = 0; i < 12; i++) {
      blobs.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        r: 30 + Math.random() * 80,
        color: CANDY_COLORS[i % CANDY_COLORS.length],
        vx: (Math.random() - 0.5) * 0.6,
        vy: (Math.random() - 0.5) * 0.6,
        phase: Math.random() * Math.PI * 2,
      });
    }

    let animId: number;

    function draw(time: number) {
      const w = canvas.width;
      const h = canvas.height;

      const grad = ctx.createLinearGradient(0, 0, 0, h);
      grad.addColorStop(0, '#0B1628');
      grad.addColorStop(0.5, '#152238');
      grad.addColorStop(1, '#1A2744');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      for (const b of blobs) {
        b.x += b.vx + Math.sin(time * 0.001 + b.phase) * 0.3;
        b.y += b.vy + Math.cos(time * 0.0008 + b.phase) * 0.3;

        if (b.x < -b.r) b.x = w + b.r;
        if (b.x > w + b.r) b.x = -b.r;
        if (b.y < -b.r) b.y = h + b.r;
        if (b.y > h + b.r) b.y = -b.r;

        const rg = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, b.r);
        rg.addColorStop(0, `rgba(${b.color.r},${b.color.g},${b.color.b},0.2)`);
        rg.addColorStop(1, 'transparent');
        ctx.fillStyle = rg;
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
        ctx.fill();
      }

      const starCount = 60;
      for (let i = 0; i < starCount; i++) {
        const sx = ((i * 137.508 + time * 0.002) % w);
        const sy = ((i * 97.3 + time * 0.001) % h);
        const twinkle = 0.3 + 0.5 * Math.sin(time * 0.003 + i * 2.1);
        ctx.beginPath();
        ctx.arc(sx, sy, 0.8 + Math.sin(i) * 0.4, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${twinkle})`;
        ctx.fill();
      }

      animId = requestAnimationFrame(draw);
    }

    animId = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <div className="fixed inset-0 z-30">
      <canvas ref={canvasRef} className="absolute inset-0" />

      <div className="relative z-10 flex flex-col items-center justify-center h-full gap-6">
        <div className="flex flex-col items-center gap-4">
          <h1 className="text-5xl sm:text-6xl md:text-8xl font-extrabold tracking-tight select-none candy-title">
            Candy Flow
          </h1>

          <p className="text-cyan-300/70 text-sm sm:text-base tracking-[0.25em] uppercase font-semibold">
            Draw lines -- Guide the candies!
          </p>
        </div>

        <button
          onClick={onPlay}
          className="mt-4 px-14 py-4 candy-play-btn text-white font-extrabold text-xl tracking-wider rounded-2xl cursor-pointer hover:scale-105 active:scale-95 transition-transform duration-200"
        >
          PLAY
        </button>

        <div className="flex items-center gap-3 mt-2">
          {CANDY_COLORS.slice(0, 5).map((c, i) => (
            <div
              key={i}
              className="w-3 h-3 rounded-full candy-dot"
              style={{
                backgroundColor: `rgb(${c.r},${c.g},${c.b})`,
                boxShadow: `0 0 8px rgba(${c.r},${c.g},${c.b},0.6)`,
                animationDelay: `${i * 0.15}s`,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
