import { Volume2, VolumeX, ArrowDown } from 'lucide-react';
import { GAME, getLevelConfig, MAX_LEVEL } from '../game/constants';
import type { GameStats } from './GameCanvas';

type GameState = 'menu' | 'playing' | 'levelComplete' | 'gameOver';

interface GameUIProps {
  level: number;
  stats: GameStats;
  gameState: GameState;
  countdown: number;
  onNextLevel: () => void;
  onRetry: () => void;
  musicOn: boolean;
  onToggleMusic: () => void;
}

const HAZARD_STYLES: Record<string, string> = {
  'DEFLECTOR BARS': 'text-pink-300 bg-pink-500/20 border-pink-400/40',
  'WIND ZONES': 'text-cyan-300 bg-cyan-500/20 border-cyan-400/40',
  'SPINNERS': 'text-green-300 bg-green-500/20 border-green-400/40',
  'MOVING PLATFORMS': 'text-yellow-300 bg-yellow-500/20 border-yellow-400/40',
  'BLACK HOLES': 'text-slate-300 bg-slate-600/30 border-slate-400/40',
  'LAVA POOLS': 'text-orange-300 bg-orange-500/20 border-orange-400/40',
  'ICE ZONES': 'text-sky-200 bg-sky-400/20 border-sky-300/40',
  'TELEPORTERS': 'text-teal-300 bg-teal-500/20 border-teal-400/40',
  'EMP PULSES': 'text-amber-300 bg-amber-500/20 border-amber-400/40',
  'GRAVITY FLIPPERS': 'text-emerald-300 bg-emerald-500/20 border-emerald-400/40',
  'LASER GATES': 'text-red-300 bg-red-500/20 border-red-400/40',
  'ASTEROIDS': 'text-stone-300 bg-stone-500/20 border-stone-400/40',
};

export default function GameUI({
  level,
  stats,
  gameState,
  countdown,
  onNextLevel,
  onRetry,
  musicOn,
  onToggleMusic,
}: GameUIProps) {
  const config = getLevelConfig(level);
  const stabilityPct = Math.max(0, stats.stability * 100);
  const lossPoint = 1 - GAME.failThreshold;
  const hpPct = stats.totalSpawned >= 10
    ? Math.max(0, Math.min(100, ((stats.stability - lossPoint) / GAME.failThreshold) * 100))
    : 100;
  const stabilityDanger = hpPct <= 30;
  const progressPct = Math.min((stats.score / config.target) * 100, 100);
  const isVictory = level >= MAX_LEVEL && gameState === 'levelComplete';

  const gravityScale = config.gravityScale;
  const maxGravity = 1 + (MAX_LEVEL - 1) * 0.025;
  const gravityPct = Math.min(((gravityScale - 1) / (maxGravity - 1)) * 100, 100);
  const gravityHigh = gravityPct > 60;
  const gravityMed = gravityPct > 30;

  return (
    <>
      {countdown > 0 && gameState === 'playing' && (
        <div className="absolute inset-x-0 top-20 z-10 pointer-events-none flex flex-col items-center gap-3">
          <span className="text-cyan-200/80 text-xs uppercase tracking-widest font-bold text-center px-4">
            Level {level} -- Target: {config.target}
          </span>
        </div>
      )}

      <div className="absolute inset-x-0 top-0 z-10 pointer-events-none w-full max-w-[100vw] overflow-hidden">
        <div className="flex items-center justify-between px-1 py-2">
          <div className="flex items-center gap-1 sm:gap-2">
            <div className="flex items-center gap-1 bg-white/10 backdrop-blur-sm rounded-xl px-1.5 py-1 border border-white/10">
              <span className="text-white font-extrabold text-sm tabular-nums leading-none">L{level}</span>
            </div>

            <div className="flex items-center gap-1 bg-white/10 backdrop-blur-sm rounded-xl px-1.5 py-1 border border-white/10">
              <span className="text-white font-extrabold text-sm tabular-nums leading-none">{stats.score}</span>
              <span className="text-white/30 text-[10px]">/</span>
              <span className="text-white/50 text-[10px] font-bold">{config.target}</span>
            </div>

            <div className="flex items-center gap-1 bg-white/10 backdrop-blur-sm rounded-xl px-1.5 py-1 border border-white/10">
              <ArrowDown className={`w-3 h-3 ${gravityHigh ? 'text-orange-400' : 'text-cyan-300/70'}`} />
              <span className="font-extrabold text-[10px] text-white">{gravityScale.toFixed(2)}x</span>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur-sm rounded-xl px-1.5 py-1 border border-white/10">
              <span className={`text-[10px] font-bold ${stabilityDanger ? 'text-red-400' : 'text-cyan-300/70'}`}>HP</span>
              <div className="w-12 h-2 bg-white/10 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-300 ${stabilityDanger ? 'bg-red-400' : 'bg-green-400'}`}
                  style={{ width: `${hpPct}%` }}
                />
              </div>
              <span className={`font-extrabold text-[10px] ${stabilityDanger ? 'text-red-400 stability-flash' : 'text-green-400'}`}>
                {hpPct.toFixed(0)}%
              </span>
            </div>

            <button onClick={onToggleMusic} className="pointer-events-auto p-1.5 bg-white/10 backdrop-blur-sm rounded-lg border border-white/10">
              {musicOn ? <Volume2 className="w-3.5 h-3.5 text-cyan-300" /> : <VolumeX className="w-3.5 h-3.5 text-white/40" />}
            </button>
          </div>
        </div>

        <div className="flex justify-center px-4">
          <div className="w-[80%] h-1 bg-white/10 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-cyan-400 to-pink-500" style={{ width: `${progressPct}%` }} />
          </div>
        </div>
      </div>

      {gameState === 'levelComplete' && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-6 overlay-enter px-6 text-center">
            <h2 className="text-5xl font-extrabold text-green-400">NICE!</h2>
            <button onClick={onNextLevel} className="pointer-events-auto px-10 py-3.5 bg-green-500 text-white font-extrabold text-lg rounded-xl">Next Level</button>
          </div>
        </div>
      )}

      {gameState === 'gameOver' && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-6 overlay-enter px-6 text-center">
            <h2 className="text-5xl font-extrabold text-red-400">OOPS!</h2>
            <button onClick={onRetry} className="pointer-events-auto px-10 py-3.5 bg-red-500 text-white font-extrabold text-lg rounded-xl">Try Again</button>
          </div>
        </div>
      )}
    </>
  );
}