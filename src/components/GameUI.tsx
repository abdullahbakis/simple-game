import { Volume2, VolumeX, ArrowDown, Coins, Tv, DollarSign, X } from 'lucide-react';
import { GAME, getLevelConfig, MAX_GRAVITY, MAX_LEVEL } from '../game/constants';
import { earnCoins, getReviveCost } from '../game/progress';
import type { GameStats } from './GameCanvas';

type GameState = 'menu' | 'playing' | 'levelComplete' | 'gameOver';

interface GameUIProps {
  level: number;
  stats: GameStats;
  gameState: GameState;
  countdown: number;
  coins: number;
  onNextLevel: () => void;
  onReviveAd: () => void;
  onReviveCoins: () => void;
  onGiveUp: () => void;
  musicOn: boolean;
  onToggleMusic: () => void;
  onReturnToMenu?: () => void;
}

export default function GameUI({
  level,
  stats,
  gameState,
  countdown,
  coins,
  onNextLevel,
  onReviveAd,
  onReviveCoins,
  onGiveUp,
  musicOn,
  onToggleMusic,
  onReturnToMenu,
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
  const reviveCost = getReviveCost();
  const canAffordRevive = coins >= reviveCost;

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
              <span className="font-extrabold text-[10px] text-amber-400">{coins.toLocaleString()}</span>
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

      {gameState === 'levelComplete' && level >= MAX_LEVEL && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/80 backdrop-blur-md">
          <div className="flex flex-col items-center gap-5 overlay-enter px-8 text-center max-w-sm">
            <div className="finale-crown-glow">
              <div className="text-6xl finale-crown-pulse">&#9813;</div>
            </div>
            <h2 className="text-4xl sm:text-5xl font-extrabold finale-title-gradient tracking-tight leading-tight">
              COSMIC EMPEROR
            </h2>
            <div className="w-16 h-0.5 bg-gradient-to-r from-transparent via-amber-400 to-transparent" />
            <p className="text-amber-100/70 text-sm leading-relaxed italic">
              "The universe doesn't yield to the strong -- it yields to the relentless.
              You didn't just play the game. You mastered chaos itself."
            </p>
            <div className="flex flex-col items-center gap-1 mt-1">
              <p className="text-amber-400 font-bold text-sm">+{coinsEarned} coins earned</p>
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500/10 border border-amber-500/20">
                <span className="cosmic-preview-glow inline-block w-6 h-1.5 rounded-full" style={{
                  background: 'linear-gradient(90deg, #FF6B9D, #FFD700, #00D4FF, #7FFF00, #FF6B9D)'
                }} />
                <span className="text-amber-300 font-bold text-xs">Cosmic Emperor Skin Unlocked</span>
              </div>
            </div>
            <button
              onClick={onReturnToMenu}
              className="pointer-events-auto px-10 py-3.5 font-extrabold text-lg rounded-xl text-white finale-btn mt-2"
            >
              Claim Glory
            </button>
          </div>
        </div>
      )}

      {gameState === 'levelComplete' && level < MAX_LEVEL && (
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
          <div className="flex flex-col items-center gap-3 overlay-enter px-6 text-center w-[90vw] max-w-xs">
            <h2 className="text-5xl font-extrabold text-red-400">OOPS!</h2>
            <p className="text-white/50 text-xs mt-1">Score: {stats.score} / {config.target}</p>

            <button
              onClick={onReviveAd}
              className="pointer-events-auto w-full flex items-center justify-center gap-2 px-5 py-3 bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-sm rounded-xl transition-colors"
            >
              <Tv className="w-4 h-4" />
              Revive (Watch Ad)
            </button>

            <button
              onClick={onReviveCoins}
              disabled={!canAffordRevive}
              className={`pointer-events-auto w-full flex items-center justify-center gap-2 px-5 py-3 font-bold text-sm rounded-xl transition-colors ${
                canAffordRevive
                  ? 'bg-amber-600 hover:bg-amber-500 text-white'
                  : 'bg-white/5 text-white/25 cursor-not-allowed'
              }`}
            >
              <DollarSign className="w-4 h-4" />
              Revive ({reviveCost.toLocaleString()} Coins)
            </button>

            <button
              onClick={onGiveUp}
              className="pointer-events-auto w-full flex items-center justify-center gap-2 px-5 py-2.5 bg-white/10 hover:bg-white/15 text-white/60 font-bold text-sm rounded-xl transition-colors mt-1"
            >
              <X className="w-4 h-4" />
              Give Up
            </button>
          </div>
        </div>
      )}
    </>
  );
}
