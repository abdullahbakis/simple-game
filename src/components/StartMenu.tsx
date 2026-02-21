import { useRef, useEffect, useState } from 'react';
import { ChevronDown, Lock, Unlock, Coins, ShoppingBag, Globe, X } from 'lucide-react';
import { getUnlockedMilestones, MILESTONE_NAMES, MILESTONE_LEVELS, loadProgress } from '../game/progress';
import { useLang } from '../i18n/LangContext';
import { TRANSLATIONS } from '../i18n/translations';
import type { LangCode } from '../i18n/translations';

const PRIVACY_POLICY_URL = '/privacy-policy.html';

interface StartMenuProps {
  coins: number;
  onPlay: (startLevel: number) => void;
  onOpenShop: () => void;
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

const LANG_OPTIONS: { code: LangCode; flag: string }[] = [
  { code: 'en', flag: '🇬🇧' },
  { code: 'tr', flag: '🇹🇷' },
  { code: 'es', flag: '🇪🇸' },
  { code: 'fr', flag: '🇫🇷' },
  { code: 'de', flag: '🇩🇪' },
  { code: 'it', flag: '🇮🇹' },
  { code: 'pt', flag: '🇧🇷' },
  { code: 'ru', flag: '🇷🇺' },
  { code: 'uk', flag: '🇺🇦' },
  { code: 'ja', flag: '🇯🇵' },
  { code: 'zh', flag: '🇨🇳' },
];

export default function StartMenu({ coins, onPlay, onOpenShop }: StartMenuProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [showLevelSelect, setShowLevelSelect] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState(1);
  const [showLangPicker, setShowLangPicker] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const unlockedMilestones = getUnlockedMilestones();
  const progress = loadProgress();
  const { lang, tr, setLang } = useLang();

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

  const currentLangOption = LANG_OPTIONS.find(l => l.code === lang)!;

  return (
    <div className="fixed inset-0 z-30">
      <canvas ref={canvasRef} className="absolute inset-0" />

      <div className="relative z-10 flex flex-col items-center justify-center h-full gap-5">
        <div className="flex flex-col items-center gap-3">
          <h1 className="text-5xl sm:text-6xl md:text-8xl font-extrabold tracking-tight select-none candy-title">
            Neonide
          </h1>

          <p className="text-sm sm:text-base tracking-[0.1em] sm:tracking-[0.25em] uppercase font-semibold text-center px-6 max-w-[90vw]" style={{ color: 'rgba(103,232,249,0.7)' }}>
            {tr.startMenu.tagline}
          </p>

          <div className="flex items-center gap-4">
            {progress.highestCompleted > 0 && (
              <p className="text-xs tracking-wider" style={{ color: 'rgba(255,255,255,0.3)' }}>
                {tr.startMenu.best.replace('{n}', String(progress.highestCompleted))}
              </p>
            )}
            <div className="flex items-center gap-1.5">
              <Coins className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-amber-400 font-bold text-sm">{coins}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center gap-3 mt-1">
          <div className="flex items-center gap-3">
            <button
              onClick={handlePlay}
              className="px-12 py-3.5 candy-play-btn text-white font-extrabold text-xl tracking-wider rounded-2xl cursor-pointer hover:scale-105 active:scale-95 transition-transform duration-200"
            >
              {selectedLevel === 1
                ? tr.startMenu.play
                : tr.startMenu.startLevel.replace('{n}', String(selectedLevel))}
            </button>

            <button
              onClick={onOpenShop}
              className="p-3.5 rounded-2xl transition-colors border"
              style={{ backgroundColor: 'rgba(255,255,255,0.1)', borderColor: 'rgba(255,255,255,0.1)' }}
            >
              <ShoppingBag className="w-5 h-5 text-amber-400" />
            </button>
          </div>

          {unlockedMilestones.length > 1 && (
            <button
              onClick={() => setShowLevelSelect(!showLevelSelect)}
              className="flex items-center gap-2 px-4 py-2 text-sm font-semibold tracking-wide transition-colors"
              style={{ color: 'rgba(103,232,249,0.7)' }}
            >
              <span>{tr.startMenu.selectLevel}</span>
              <ChevronDown className={`w-4 h-4 transition-transform ${showLevelSelect ? 'rotate-180' : ''}`} />
            </button>
          )}

          {showLevelSelect && (
            <div className="mt-1 p-3 bg-[#0B1628] rounded-xl max-w-sm max-h-[40vh] overflow-y-auto shop-scroll border" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
              <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
                {[...MILESTONE_LEVELS].map((lvl) => {
                  const isUnlocked = unlockedMilestones.includes(lvl);
                  const isSelected = selectedLevel === lvl;
                  const name = MILESTONE_NAMES[lvl];

                  return (
                    <button
                      key={lvl}
                      onClick={() => isUnlocked && setSelectedLevel(lvl)}
                      disabled={!isUnlocked}
                      className="relative flex flex-col items-center gap-1 p-2 rounded-lg transition-all"
                      style={
                        isUnlocked
                          ? isSelected
                            ? { backgroundColor: 'rgba(6,182,212,0.3)', border: '1px solid rgba(34,211,238,0.5)', color: '#fff' }
                            : { backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)' }
                          : { backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.2)', cursor: 'not-allowed' }
                      }
                    >
                      <div className="flex items-center gap-1">
                        {isUnlocked ? (
                          <Unlock className="w-3 h-3 text-green-400" style={{ opacity: 0.7 }} />
                        ) : (
                          <Lock className="w-3 h-3" style={{ color: 'rgba(255,255,255,0.2)' }} />
                        )}
                        <span className="font-bold text-sm">{lvl}</span>
                      </div>
                      <span className="text-[9px] opacity-60 leading-tight text-center">
                        {name}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3 mt-1">
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

        <div className="absolute bottom-4 left-0 right-0 flex items-center justify-between px-5">
          <button
            onClick={() => setShowPrivacy(true)}
            className="text-[10px] tracking-widest uppercase font-semibold transition-colors"
            style={{ color: 'rgba(255,255,255,0.25)' }}
          >
            {tr.startMenu.privacyPolicy}
          </button>

          <div className="relative">
            <button
              onClick={() => setShowLangPicker(!showLangPicker)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl transition-colors border"
              style={{ backgroundColor: 'rgba(255,255,255,0.08)', borderColor: 'rgba(255,255,255,0.1)' }}
            >
              <Globe className="w-3.5 h-3.5" style={{ color: 'rgba(103,232,249,0.7)' }} />
              <span className="text-xs font-semibold" style={{ color: 'rgba(255,255,255,0.7)' }}>{currentLangOption.flag} {TRANSLATIONS[lang].langName}</span>
              <ChevronDown className={`w-3 h-3 transition-transform ${showLangPicker ? 'rotate-180' : ''}`} style={{ color: 'rgba(255,255,255,0.4)' }} />
            </button>

            {showLangPicker && (
              <div className="absolute bottom-full right-0 mb-2 w-44 bg-[#0E1A2E] rounded-xl overflow-hidden shadow-2xl z-50 border" style={{ borderColor: 'rgba(255,255,255,0.15)' }}>
                {LANG_OPTIONS.map((opt) => (
                  <button
                    key={opt.code}
                    onClick={() => { setLang(opt.code); setShowLangPicker(false); }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-left text-xs font-semibold transition-colors"
                    style={
                      lang === opt.code
                        ? { backgroundColor: 'rgba(6,182,212,0.2)', color: 'rgb(103,232,249)' }
                        : { color: 'rgba(255,255,255,0.6)' }
                    }
                  >
                    <span className="text-sm">{opt.flag}</span>
                    <span>{TRANSLATIONS[opt.code].langName}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {showPrivacy && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}>
          <div className="relative w-[90vw] max-w-md bg-[#0E1A2E] rounded-2xl overflow-hidden overlay-enter border" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
            <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
              <h2 className="text-base font-extrabold text-white tracking-wide">
                {tr.startMenu.privacyPolicy}
              </h2>
              <button
                onClick={() => setShowPrivacy(false)}
                className="p-1.5 rounded-lg transition-colors"
                style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}
              >
                <X className="w-4 h-4" style={{ color: 'rgba(255,255,255,0.7)' }} />
              </button>
            </div>
            <div className="px-5 py-5 space-y-3">
              <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.5)' }}>
                Your privacy matters to us. To read our full Privacy Policy, please visit the link below.
              </p>
              <a
                href={PRIVACY_POLICY_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full text-center px-5 py-3 text-white font-bold text-sm rounded-xl transition-colors"
                style={{ backgroundColor: 'rgba(8,145,178,0.8)' }}
              >
                {tr.startMenu.privacyPolicy} ↗
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
