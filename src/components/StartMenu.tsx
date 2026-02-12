import { useRef, useEffect, useState } from 'react';
import { ChevronDown, Lock, Unlock } from 'lucide-react';
import { getUnlockedMilestones, MILESTONE_NAMES, loadProgress } from '../game/progress';

interface StartMenuProps {
  onPlay: (startLevel: number) => void;
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
  const [showLevelSelect, setShowLevelSelect] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState(1);
  const unlockedMilestones = getUnlockedMilestones();
  const progress = loadProgress();

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
      if (!canvas) return;
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

  const handlePlay = () => {
    onPlay(selectedLevel);
  };

  return (
    <div className="fixed inset-0 z-30">
      <canvas ref={canvasRef} className="absolute inset-0" />

      <div className="relative z-10 flex flex-col items-center justify-center h-full gap-6">
        <div className="flex flex-col items-center gap-4">
          <h1 className="text-5xl sm:text-6xl md:text-8xl font-extrabold tracking-tight select-none candy-title">
            Candy Flow
          </h1>

          <p className="text-cyan-300/70 text-xs sm:text-base tracking-[0.1em] sm:tracking-[0.25em] uppercase font-semibold text-center px-6 max-w-[90vw]">
            50 Levels -- Draw lines -- Guide the candies!
          </p>

          {progress.highestCompleted > 0 && (
            <p className="text-white/30 text-xs tracking-wider">
              Best: Level {progress.highestCompleted} cleared
            </p>
          )}
        </div>

        <div className="flex flex-col items-center gap-3 mt-2">
          <button
            onClick={handlePlay}
            className="px-14 py-4 candy-play-btn text-white font-extrabold text-xl tracking-wider rounded-2xl cursor-pointer hover:scale-105 active:scale-95 transition-transform duration-200"
          >
            {selectedLevel === 1 ? 'PLAY' : `START LVL ${selectedLevel}`}
          </button>

          {unlockedMilestones.length > 1 && (
            <button
              onClick={() => setShowLevelSelect(!showLevelSelect)}
              className="flex items-center gap-2 px-4 py-2 text-cyan-300/70 hover:text-cyan-300 text-sm font-semibold tracking-wide transition-colors"
            >
              <span>Select Level</span>
              <ChevronDown className={`w-4 h-4 transition-transform ${showLevelSelect ? 'rotate-180' : ''}`} />
            </button>
          )}

          {showLevelSelect && (
            <div className="mt-2 p-3 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 max-w-xs">
              <div className="grid grid-cols-4 gap-2">
                {[1, 4, 7, 10, 12, 16, 20, 25, 30, 35, 40, 45].map((lvl) => {
                  const isUnlocked = unlockedMilestones.includes(lvl);
                  const isSelected = selectedLevel === lvl;
                  const name = MILESTONE_NAMES[lvl];

                  return (
                    <button
                      key={lvl}
                      onClick={() => isUnlocked && setSelectedLevel(lvl)}
                      disabled={!isUnlocked}
                      className={`
                        relative flex flex-col items-center gap-1 p-2 rounded-lg transition-all
                        ${isUnlocked
                          ? isSelected
                            ? 'bg-cyan-500/30 border border-cyan-400/50 text-white'
                            : 'bg-white/5 border border-white/10 text-white/70 hover:bg-white/10 hover:text-white'
                          : 'bg-white/2 border border-white/5 text-white/20 cursor-not-allowed'
                        }
                      `}
                    >
                      <div className="flex items-center gap-1">
                        {isUnlocked ? (
                          <Unlock className="w-3 h-3 text-green-400/70" />
                        ) : (
                          <Lock className="w-3 h-3 text-white/20" />
                        )}
                        <span className="font-bold text-sm">{lvl}</span>
                      </div>
                      <span className="text-[10px] opacity-60 leading-tight text-center">
                        {name}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

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
