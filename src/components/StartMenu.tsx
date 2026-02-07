import { useRef, useEffect } from 'react';

interface StartMenuProps {
  onPlay: () => void;
}

const FLOAT_CIRCLES = [
  { x: 0.2, y: 0.3, r: 120, cr: 248, cg: 180, cb: 200, dx: 0.0002, dy: 0.00025, px: 0, py: 0 },
  { x: 0.75, y: 0.6, r: 140, cr: 184, cg: 212, cb: 240, dx: 0.00015, dy: 0.0002, px: 1.5, py: 2 },
  { x: 0.5, y: 0.15, r: 100, cr: 200, cg: 230, cb: 201, dx: 0.00025, dy: 0.00015, px: 3, py: 0.5 },
  { x: 0.35, y: 0.82, r: 110, cr: 240, cg: 208, cb: 184, dx: 0.0002, dy: 0.0003, px: 2, py: 3 },
];

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

    let animId: number;

    function draw(time: number) {
      const w = canvas.width;
      const h = canvas.height;

      const grad = ctx.createLinearGradient(0, 0, 0, h);
      grad.addColorStop(0, '#FFF5F7');
      grad.addColorStop(1, '#F0F4FF');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      for (const c of FLOAT_CIRCLES) {
        const cx = c.x * w + Math.sin(time * c.dx + c.px) * 90;
        const cy = c.y * h + Math.cos(time * c.dy + c.py) * 70;
        const rg = ctx.createRadialGradient(cx, cy, 0, cx, cy, c.r);
        rg.addColorStop(0, `rgba(${c.cr},${c.cg},${c.cb},0.15)`);
        rg.addColorStop(1, 'transparent');
        ctx.fillStyle = rg;
        ctx.beginPath();
        ctx.arc(cx, cy, c.r, 0, Math.PI * 2);
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

      <div className="relative z-10 flex flex-col items-center justify-center h-full gap-8">
        <div className="flex flex-col items-center gap-3">
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold text-gray-600/80 tracking-tight select-none">
            Pearl Flow
          </h1>

          <div className="flex items-center gap-3 opacity-30">
            <div className="w-12 h-px bg-gray-400" />
            <div className="w-1.5 h-1.5 bg-gray-400 rounded-full" />
            <div className="w-12 h-px bg-gray-400" />
          </div>

          <p className="text-sm text-gray-400 tracking-[0.2em] uppercase font-medium">
            Pastel Dreams
          </p>
        </div>

        <button
          onClick={onPlay}
          className="mt-6 px-12 py-3.5 bg-white/80 hover:bg-white text-gray-500 hover:text-gray-700 font-bold text-lg tracking-wide rounded-full shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer pastel-btn"
        >
          Play
        </button>

        <p className="text-xs text-gray-300 tracking-wider font-medium">
          Draw lines to guide the pearls
        </p>
      </div>
    </div>
  );
}
