import { Volume2, VolumeX, ArrowDown, Coins, Tv, DollarSign, X, Pause, Play, Home } from 'lucide-react';
import { GAME, getLevelConfig, MAX_GRAVITY, MAX_LEVEL } from '../game/constants';
import { earnCoins, getReviveCost } from '../game/progress';
import { useLang } from '../i18n/LangContext';
import type { GameStats } from './GameCanvas';

type GameState = 'menu' | 'playing' | 'paused' | 'levelComplete' | 'gameOver';

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
  isPaused?: boolean;
  onPause?: () => void;
  onResume?: () => void;
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
  isPaused,
  onPause,
  onResume,
}: GameUIProps) {
  const { tr } = useLang();
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

  const coinsEarned = gameState === 'levelComplete'
    ? earnCoins(stats.stability, stats.totalSpawned, stats.totalMissed)
    : 0;
  const reviveCost = getReviveCost();
  const canAffordRevive = coins >= reviveCost;

  return (
    <>
      {countdown > 0 && gameState === 'playing' && (
        <div className="absolute inset-x-0 top-20 z-10 pointer-events-none flex flex-col items-center gap-3">
          <span className="text-cyan-200/80 text-xs uppercase tracking-widest font-bold text-center px-4">
            {tr.hud.levelTarget
              .replace('{level}', String(level))
              .replace('{target}', String(config.target))}
          </span>
        </div>
      )}

      <div className="absolute inset-x-0 top-0 z-10 pointer-events-none w-full max-w-[100vw] overflow-hidden">
        <div className="flex items-center justify-between px-1 py-2">
          <div className="flex items-center gap-1 sm:gap-2">
            <div className="flex items-center gap-1 bg-white/10 backdrop-blur-sm rounded-xl px-1.5 py-1 border border-white/10">
              <span className="text-white font-extrabold text-sm tabular-nums leading-none">
                {tr.hud.level.replace('{n}', String(level))}
              </span>
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
              <span className={`text-[10px] font-bold ${stabilityDanger ? 'text-red-400' : 'text-cyan-300/70'}`}>
                {tr.hud.hp}
              </span>
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

            {gameState === 'playing' && onPause && (
              <button onClick={onPause} className="pointer-events-auto p-1.5 bg-white/10 backdrop-blur-sm rounded-lg border border-white/10">
                <Pause className="w-3.5 h-3.5 text-white/70" />
              </button>
            )}
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
              {tr.levelComplete.cosmicTitle}
            </h2>
            <div className="w-16 h-0.5 bg-gradient-to-r from-transparent via-amber-400 to-transparent" />
            <p className="text-amber-100/70 text-sm leading-relaxed italic">
              {tr.levelComplete.cosmicQuote}
            </p>
            <div className="flex flex-col items-center gap-1 mt-1">
              <p className="text-amber-400 font-bold text-sm">
                {tr.levelComplete.coinsEarned.replace('{n}', String(coinsEarned))}
              </p>
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500/10 border border-amber-500/20">
                <span className="cosmic-preview-glow inline-block w-6 h-1.5 rounded-full" style={{
                  background: 'linear-gradient(90deg, #FF6B9D, #FFD700, #00D4FF, #7FFF00, #FF6B9D)'
                }} />
                <span className="text-amber-300 font-bold text-xs">{tr.levelComplete.cosmicSkinUnlocked}</span>
              </div>
            </div>
            <button
              onClick={onReturnToMenu}
              className="pointer-events-auto px-10 py-3.5 font-extrabold text-lg rounded-xl text-white finale-btn mt-2"
            >
              {tr.levelComplete.claimGlory}
            </button>
          </div>
        </div>
      )}

      {gameState === 'levelComplete' && level < MAX_LEVEL && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/65 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-0 overlay-enter w-[88vw] max-w-sm">
            <div className="relative w-full rounded-2xl overflow-hidden border border-white/10"
              style={{ background: 'linear-gradient(160deg, #0E1F35 0%, #0B1628 100%)', boxShadow: '0 0 60px rgba(0,0,0,0.5), 0 0 40px rgba(74,222,128,0.06)' }}>

              <div className="absolute inset-0 pointer-events-none" style={{
                background: 'radial-gradient(ellipse at 50% 0%, rgba(74,222,128,0.12) 0%, transparent 65%)'
              }} />

              <div className="relative flex flex-col items-center gap-4 px-6 pt-8 pb-7">
                <div className="relative">
                  <div className="text-6xl level-complete-star" style={{
                    filter: 'drop-shadow(0 0 20px rgba(74,222,128,0.7))',
                    animation: 'levelStarPop 0.5s cubic-bezier(0.175,0.885,0.32,1.275)'
                  }}>&#10022;</div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div style={{
                      width: 64, height: 64,
                      borderRadius: '50%',
                      background: 'radial-gradient(circle, rgba(74,222,128,0.15) 0%, transparent 70%)',
                      animation: 'levelCompletePulse 1.5s ease-in-out infinite'
                    }} />
                  </div>
                </div>

                <div className="flex flex-col items-center gap-1">
                  <h2 className="text-4xl font-extrabold tracking-tight" style={{
                    background: 'linear-gradient(135deg, #4ADE80, #34D399, #6EE7B7)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  }}>
                    {tr.levelComplete.nice}
                  </h2>
                  <p className="text-white/30 text-xs font-semibold uppercase tracking-widest">
                    Level {level} complete
                  </p>
                </div>

                <div className="w-full h-px bg-gradient-to-r from-transparent via-green-400/20 to-transparent" />

                <div className="w-full space-y-1.5">
                  <div className="flex items-center justify-between px-3 py-2 rounded-xl"
                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
                    <span className="text-white/35 text-xs font-semibold">Collected</span>
                    <span className="text-green-400 font-extrabold text-sm">{stats.score}</span>
                  </div>
                  {stats.totalMissed > 0 && (
                    <div className="flex items-center justify-between px-3 py-2 rounded-xl"
                      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
                      <span className="text-white/35 text-xs font-semibold">Missed</span>
                      <span className="text-red-400/80 font-extrabold text-sm">-{stats.totalMissed}</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl w-full"
                  style={{ background: 'rgba(255,193,7,0.08)', border: '1px solid rgba(255,193,7,0.15)' }}>
                  <Coins className="w-4 h-4 text-amber-400" />
                  <span className="text-white/50 text-sm">+</span>
                  <span className="text-amber-400 font-extrabold text-base">{coinsEarned}</span>
                  <span className="text-white/30 text-xs font-semibold">coins</span>
                </div>

                <button
                  onClick={onNextLevel}
                  className="pointer-events-auto w-full py-3.5 font-extrabold text-base rounded-xl text-white transition-all active:scale-95"
                  style={{
                    background: 'linear-gradient(135deg, #22C55E, #16A34A)',
                    boxShadow: '0 4px 20px rgba(34,197,94,0.35), 0 0 40px rgba(34,197,94,0.1), inset 0 1px 0 rgba(255,255,255,0.15)'
                  }}
                >
                  {tr.levelComplete.nextLevel} →
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {isPaused && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/70 backdrop-blur-md">
          <div className="flex flex-col items-center gap-4 overlay-enter px-6 text-center">
            <div className="w-14 h-14 rounded-full bg-white/10 border border-white/20 flex items-center justify-center mb-1">
              <Pause className="w-6 h-6 text-white/70" />
            </div>
            <h2 className="text-3xl font-extrabold text-white tracking-wide">Paused</h2>
            <p className="text-white/40 text-xs uppercase tracking-widest">
              Level {level}
            </p>

            <div className="flex flex-col gap-2 w-56 mt-1">
              <button
                onClick={onResume}
                className="pointer-events-auto flex items-center justify-center gap-2 px-5 py-3 bg-cyan-600 hover:bg-cyan-500 active:scale-95 text-white font-bold text-sm rounded-xl transition-all"
              >
                <Play className="w-4 h-4" />
                Continue
              </button>

              <button
                onClick={onToggleMusic}
                className="pointer-events-auto flex items-center justify-center gap-2 px-5 py-2.5 bg-white/10 hover:bg-white/15 text-white/70 font-bold text-sm rounded-xl transition-colors"
              >
                {musicOn
                  ? <><Volume2 className="w-4 h-4" /> Music On</>
                  : <><VolumeX className="w-4 h-4" /> Music Off</>
                }
              </button>

              <button
                onClick={onReturnToMenu}
                className="pointer-events-auto flex items-center justify-center gap-2 px-5 py-2.5 bg-white/5 hover:bg-white/10 text-white/40 hover:text-white/60 font-bold text-sm rounded-xl transition-colors"
              >
                <Home className="w-4 h-4" />
                Main Menu
              </button>
            </div>
          </div>
        </div>
      )}

      {gameState === 'gameOver' && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-3 overlay-enter px-6 text-center w-[90vw] max-w-xs">
            <h2 className="text-5xl font-extrabold text-red-400">{tr.gameOver.oops}</h2>
            <p className="text-white/50 text-xs mt-1">
              {tr.gameOver.score
                .replace('{score}', String(stats.score))
                .replace('{target}', String(config.target))}
            </p>

            <button
              onClick={onReviveAd}
              className="pointer-events-auto w-full flex items-center justify-center gap-2 px-5 py-3 bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-sm rounded-xl transition-colors"
            >
              <Tv className="w-4 h-4" />
              {tr.gameOver.reviveAd}
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
              {tr.gameOver.reviveCoins.replace('{n}', reviveCost.toLocaleString())}
            </button>

            <button
              onClick={onGiveUp}
              className="pointer-events-auto w-full flex items-center justify-center gap-2 px-5 py-2.5 bg-white/10 hover:bg-white/15 text-white/60 font-bold text-sm rounded-xl transition-colors mt-1"
            >
              <X className="w-4 h-4" />
              {tr.gameOver.giveUp}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
