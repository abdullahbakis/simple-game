import { useState, useEffect, useRef } from 'react';
import { ChevronRight, X } from 'lucide-react';
import { useLang } from '../i18n/LangContext';

const TUTORIAL_KEY = 'neonide_tutorial_done';

type AnimationType = 'draw' | 'fall' | 'bucket' | 'hp';

const STEP_ANIMATIONS: AnimationType[] = ['draw', 'fall', 'bucket', 'hp'];
const STEP_ICONS = ['✏️', '🍬', '🪣', '❤️'];

interface TutorialOverlayProps {
  onDone: () => void;
}

export function isTutorialDone(): boolean {
  try {
    return localStorage.getItem(TUTORIAL_KEY) === '1';
  } catch {
    return false;
  }
}

export default function TutorialOverlay({ onDone }: TutorialOverlayProps) {
  const [step, setStep] = useState(0);
  const [animating, setAnimating] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const { tr } = useLang();
  const trRef = useRef(tr);
  trRef.current = tr;

  const STEPS = [
    { title: tr.tutorial.drawLinesTitle, description: tr.tutorial.drawLinesDesc, icon: STEP_ICONS[0], animationType: STEP_ANIMATIONS[0] },
    { title: tr.tutorial.guideCandiesTitle, description: tr.tutorial.guideCandiesDesc, icon: STEP_ICONS[1], animationType: STEP_ANIMATIONS[1] },
    { title: tr.tutorial.fillBucketTitle, description: tr.tutorial.fillBucketDesc, icon: STEP_ICONS[2], animationType: STEP_ANIMATIONS[2] },
    { title: tr.tutorial.watchHpTitle, description: tr.tutorial.watchHpDesc, icon: STEP_ICONS[3], animationType: STEP_ANIMATIONS[3] },
  ];

  const currentStep = STEPS[step];

  function markDone() {
    try { localStorage.setItem(TUTORIAL_KEY, '1'); } catch {}
    onDone();
  }

  function nextStep() {
    if (step < STEPS.length - 1) {
      setAnimating(true);
      setTimeout(() => {
        setStep(s => s + 1);
        setAnimating(false);
      }, 220);
    } else {
      markDone();
    }
  }

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    const W = canvas.width;
    const H = canvas.height;
    let t = 0;

    const drawLine = (ctx: CanvasRenderingContext2D, t: number) => {
      ctx.clearRect(0, 0, W, H);
      const progress = (Math.sin(t * 0.02) + 1) / 2;
      const startX = W * 0.1;
      const endX = W * 0.9;
      const y = H * 0.45;
      ctx.strokeStyle = `rgba(255, 107, 157, ${0.3 + 0.5 * progress})`;
      ctx.lineWidth = 4;
      ctx.lineCap = 'round';
      ctx.shadowColor = '#FF6B9D';
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.moveTo(startX, y);
      ctx.lineTo(startX + (endX - startX) * Math.min(1, t * 0.03), y + Math.sin(t * 0.04) * 10);
      ctx.stroke();
      ctx.shadowBlur = 0;

      const dotX = startX + (endX - startX) * ((t * 0.015) % 1);
      const dotY = y + Math.sin(t * 0.04) * 10;
      ctx.beginPath();
      ctx.arc(dotX, dotY, 5, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.fill();
    };

    const drawFall = (ctx: CanvasRenderingContext2D, t: number) => {
      ctx.clearRect(0, 0, W, H);
      const colors = ['#FF6B9D', '#00D4FF', '#7FFF00', '#FFD93D', '#FF8C42'];
      for (let i = 0; i < 5; i++) {
        const x = W * (0.15 + i * 0.18);
        const baseY = (t * 1.2 + i * 30) % (H + 20) - 10;
        ctx.beginPath();
        ctx.arc(x, baseY, 7, 0, Math.PI * 2);
        ctx.fillStyle = colors[i];
        ctx.shadowColor = colors[i];
        ctx.shadowBlur = 10;
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      ctx.strokeStyle = 'rgba(0, 212, 255, 0.6)';
      ctx.lineWidth = 3;
      ctx.lineCap = 'round';
      ctx.shadowColor = '#00D4FF';
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.moveTo(W * 0.05, H * 0.6);
      ctx.lineTo(W * 0.95, H * 0.55);
      ctx.stroke();
      ctx.shadowBlur = 0;
    };

    const drawBucket = (ctx: CanvasRenderingContext2D, t: number) => {
      ctx.clearRect(0, 0, W, H);
      const bx = W / 2;
      const by = H * 0.7;
      const bw = 60;
      const bh = 40;

      const pulse = 1 + 0.05 * Math.sin(t * 0.1);
      ctx.save();
      ctx.translate(bx, by);
      ctx.scale(pulse, pulse);
      ctx.strokeStyle = 'rgba(0, 212, 255, 0.8)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(-bw / 2, -bh / 2);
      ctx.lineTo(-bw / 2, bh / 2);
      ctx.lineTo(bw / 2, bh / 2);
      ctx.lineTo(bw / 2, -bh / 2);
      ctx.stroke();
      const fillPct = (Math.sin(t * 0.03) + 1) / 2;
      ctx.fillStyle = 'rgba(0, 212, 255, 0.15)';
      ctx.fillRect(-bw / 2, bh / 2 - bh * fillPct, bw, bh * fillPct);
      ctx.restore();

      const colors = ['#FF6B9D', '#7FFF00', '#FFD93D'];
      for (let i = 0; i < 3; i++) {
        const progress = ((t * 0.8 + i * 40) % 120) / 120;
        const cx = bx + (Math.sin(i * 2.1) * 20);
        const cy = H * 0.1 + progress * (by - H * 0.1);
        if (cy < by) {
          ctx.beginPath();
          ctx.arc(cx, cy, 6, 0, Math.PI * 2);
          ctx.fillStyle = colors[i];
          ctx.shadowColor = colors[i];
          ctx.shadowBlur = 8;
          ctx.fill();
          ctx.shadowBlur = 0;
        }
      }
    };

    const drawHP = (ctx: CanvasRenderingContext2D, t: number) => {
      ctx.clearRect(0, 0, W, H);
      const hp = 0.3 + 0.3 * Math.abs(Math.sin(t * 0.02));
      const barW = W * 0.7;
      const barH = 14;
      const barX = (W - barW) / 2;
      const barY = H * 0.35;

      ctx.fillStyle = 'rgba(255,255,255,0.08)';
      ctx.roundRect(barX, barY, barW, barH, 7);
      ctx.fill();

      const gradient = ctx.createLinearGradient(barX, 0, barX + barW * hp, 0);
      gradient.addColorStop(0, '#ef4444');
      gradient.addColorStop(1, '#f97316');
      ctx.fillStyle = gradient;
      ctx.shadowColor = '#ef4444';
      ctx.shadowBlur = 12;
      ctx.roundRect(barX, barY, barW * hp, barH, 7);
      ctx.fill();
      ctx.shadowBlur = 0;

      ctx.fillStyle = 'rgba(255,255,255,0.6)';
      ctx.font = 'bold 11px Nunito, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(trRef.current.hud.hp, W / 2, barY + barH + 16);

      const warnAlpha = 0.5 + 0.5 * Math.sin(t * 0.15);
      ctx.fillStyle = `rgba(239, 68, 68, ${warnAlpha * 0.12})`;
      ctx.fillRect(0, 0, W, H);
    };

    function loop() {
      t++;
      if (!canvas) return;
      switch (currentStep.animationType) {
        case 'draw': drawLine(ctx, t); break;
        case 'fall': drawFall(ctx, t); break;
        case 'bucket': drawBucket(ctx, t); break;
        case 'hp': drawHP(ctx, t); break;
      }
      rafRef.current = requestAnimationFrame(loop);
    }
    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [step, currentStep.animationType]);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center" style={{ backgroundColor: 'rgba(0,0,0,0.8)' }}>
      <div
        className={`
          w-full max-w-sm mx-4 mb-8 rounded-2xl overflow-hidden border
          bg-[#0E1A2E] shadow-2xl
          transition-all duration-200
          ${animating ? 'opacity-0 scale-95 translate-y-2' : 'opacity-100 scale-100 translate-y-0'}
        `}
        style={{ borderColor: 'rgba(255,255,255,0.1)', boxShadow: '0 0 60px rgba(0,0,0,0.6), 0 0 30px rgba(0,212,255,0.05)' }}
      >
        <div className="relative">
          <canvas
            ref={canvasRef}
            className="w-full"
            style={{ height: 140 }}
          />
          <button
            onClick={markDone}
            className="absolute top-3 right-3 p-1.5 rounded-lg transition-colors"
            style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}
          >
            <X className="w-3.5 h-3.5" style={{ color: 'rgba(255,255,255,0.5)' }} />
          </button>
        </div>

        <div className="px-5 pb-5 pt-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">{currentStep.icon}</span>
            <h3 className="text-white font-extrabold text-lg tracking-tight">{currentStep.title}</h3>
          </div>
          <p className="text-sm leading-relaxed mb-4" style={{ color: 'rgba(255,255,255,0.55)' }}>
            {currentStep.description}
          </p>

          <div className="flex items-center justify-between">
            <div className="flex gap-1.5">
              {STEPS.map((_, i) => (
                <div
                  key={i}
                  className={`h-1.5 rounded-full transition-all duration-300 ${i === step ? 'w-5 bg-cyan-400' : 'w-1.5'}`}
                  style={
                    i < step
                      ? { backgroundColor: 'rgba(8,145,178,0.5)' }
                      : i > step
                      ? { backgroundColor: 'rgba(255,255,255,0.15)' }
                      : undefined
                  }
                />
              ))}
            </div>

            <button
              onClick={nextStep}
              className="flex items-center gap-1 px-5 py-2 bg-cyan-500 active:scale-95 text-white font-bold text-sm rounded-xl transition-all"
            >
              {step < STEPS.length - 1 ? (
                <>{tr.tutorial.next} <ChevronRight className="w-4 h-4" /></>
              ) : (
                tr.tutorial.play
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
