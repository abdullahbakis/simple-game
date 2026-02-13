import { Volume2, VolumeX, ArrowDown, Coins } from 'lucide-react';
import { GAME, getLevelConfig, MAX_GRAVITY } from '../game/constants';
import { earnCoins } from '../game/progress';
import type { GameStats } from './GameCanvas';

type GameState = 'menu' | 'playing' | 'levelComplete' | 'gameOver';

interface GameUIProps {
  level: number;
  stats: GameStats;
  gameState: GameState;
  countdown: number;
  coins: number;
  failCount: number;
  onNextLevel: () => void;
  onRetry: () => void;
  onUnlockMilestone: () => void;
  musicOn: boolean;
  onToggleMusic: () => void;
}

export default function GameUI({
  level,
  stats,
  gameState,
  countdown,
  coins,
  failCount,
  onNextLevel,
  onRetry,
  onUnlockMilestone,
  musicOn,
  onToggleMusic,
}: GameUIProps) {
  const config = getLevelConfig(level);
  const lossPoint = 1 - GAME.failThreshold;
  const hpPct = stats.totalSpawned >= 10
    ? Math.max(0, Math.min(100, ((stats.stability - lossPoint) / GAME.failThreshold) * 100))
    : 100;
  const stabilityDanger = hpPct <= 30;
  const progressPct = Math.min((stats.score / config.target) * 100, 100);
  const gravityScale = config.gravityScale;
  const gravityPct = Math.min(((gravityScale - 1) / (MAX_GRAVITY - 1)) * 100, 100);
  const gravityHigh = gravityPct > 60;

  const coinsEarned = gameState === 'levelComplete' ? earnCoins(stats.stability) : 0;
  const canUnlockMilestone = failCount >= 3 && coins >= 500;

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

            <div className="flex items-center gap-1 bg-white/10 backdrop-blur-sm rounded-xl px-1.5 py-1 border border-white/10">
              <Coins className="w-3 h-3 text-amber-400" />
              <span className="font-extrabold text-[10px] text-amber-400">{coins}</span>
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
          <div className="flex flex-col items-center gap-4 overlay-enter px-6 text-center">
            <h2 className="text-5xl font-extrabold text-green-400">NICE!</h2>
            <p className="text-amber-400 font-bold text-sm">+{coinsEarned} coins earned</p>
            <button onClick={onNextLevel} className="pointer-events-auto px-10 py-3.5 bg-green-500 text-white font-extrabold text-lg rounded-xl">Next Level</button>
          </div>
        </div>
      )}

      {gameState === 'gameOver' && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-4 overlay-enter px-6 text-center">
            <h2 className="text-5xl font-extrabold text-red-400">OOPS!</h2>
            {canUnlockMilestone && (
              <button
                onClick={onUnlockMilestone}
                className="pointer-events-auto px-6 py-2 bg-amber-500/80 hover:bg-amber-500 text-white font-bold text-sm rounded-xl transition-colors"
              >
                Skip Level (500 coins)
              </button>
            )}
            <button onClick={onRetry} className="pointer-events-auto px-10 py-3.5 bg-red-500 text-white font-extrabold text-lg rounded-xl">Try Again</button>
          </div>
        </div>
      )}
    </>
  );
}
