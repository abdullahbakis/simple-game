import { getLevelConfig, MAX_LEVEL } from '../game/constants';
import type { GameStats } from './GameCanvas';

type GameState = 'menu' | 'playing' | 'levelComplete' | 'gameOver';

interface GameUIProps {
  level: number;
  stats: GameStats;
  gameState: GameState;
  countdown: number;
  onNextLevel: () => void;
  onRetry: () => void;
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
}: GameUIProps) {
  const config = getLevelConfig(level);
  const stabilityPct = Math.max(0, stats.stability * 100);
  const stabilityDanger = stabilityPct <= 90;
  const progressPct = Math.min((stats.score / config.target) * 100, 100);
  const isVictory = level >= MAX_LEVEL && gameState === 'levelComplete';

  return (
    <>
      {countdown > 0 && gameState === 'playing' && (
        <div className="absolute inset-x-0 top-20 z-10 pointer-events-none flex flex-col items-center gap-3">
          <span className="text-cyan-200/80 text-sm uppercase tracking-widest font-bold">
            Level {level} -- Target: {config.target} candies
          </span>
          {config.hazards.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap justify-center px-4">
              {config.hazards.map((hazard) => (
                <span
                  key={hazard}
                  className={`text-xs px-2.5 py-0.5 rounded-full border ${HAZARD_STYLES[hazard] || 'text-gray-300 bg-gray-500/20 border-gray-400/40'}`}
                >
                  {hazard.toLowerCase()}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="absolute inset-x-0 top-0 z-10 pointer-events-none">
        <div className="flex items-center justify-between px-5 py-3">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-xl px-3.5 py-1.5 border border-white/10">
              <span className="text-cyan-300/70 text-xs uppercase tracking-wider font-bold">Lvl</span>
              <span className="text-white font-extrabold text-lg tabular-nums leading-none">
                {level}
              </span>
              <span className="text-white/20 text-xs">/{MAX_LEVEL}</span>
            </div>

            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-xl px-3.5 py-1.5 border border-white/10">
              <span className="text-cyan-300/70 text-xs uppercase tracking-wider font-bold">Got</span>
              <span className="text-white font-extrabold text-lg tabular-nums leading-none">
                {stats.score}
              </span>
              <span className="text-white/30 text-xs">/</span>
              <span className="text-white/50 text-xs font-bold">{config.target}</span>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-xl px-3.5 py-1.5 border border-white/10">
            <span
              className={`text-xs uppercase tracking-wider font-bold ${
                stabilityDanger ? 'text-red-400' : 'text-cyan-300/70'
              }`}
            >
              HP
            </span>
            <div className="w-20 h-2.5 bg-white/10 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  stabilityDanger ? 'bg-red-400' : 'bg-green-400'
                }`}
                style={{
                  width: `${stabilityPct}%`,
                  boxShadow: stabilityDanger
                    ? '0 0 8px rgba(248,113,113,0.5)'
                    : '0 0 8px rgba(74,222,128,0.5)',
                }}
              />
            </div>
            <span
              className={`font-extrabold text-sm tabular-nums ${
                stabilityDanger ? 'text-red-400 stability-flash' : 'text-green-400'
              }`}
            >
              {stabilityPct.toFixed(0)}%
            </span>
          </div>
        </div>

        <div className="flex justify-center px-5">
          <div className="w-64 h-1.5 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-200"
              style={{
                width: `${progressPct}%`,
                background: 'linear-gradient(90deg, #00D4FF, #FF6B9D)',
                boxShadow: '0 0 8px rgba(0, 212, 255, 0.4)',
              }}
            />
          </div>
        </div>

        {config.hazards.length > 0 && countdown <= 0 && (
          <div className="flex justify-center mt-2">
            <div className="flex items-center gap-2 text-xs flex-wrap justify-center px-4">
              {config.hazards.map((hazard) => (
                <span
                  key={hazard}
                  className={`px-2 py-0.5 rounded-full border ${HAZARD_STYLES[hazard] || 'text-gray-300 bg-gray-500/20 border-gray-400/40'}`}
                >
                  {hazard.toLowerCase()}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {gameState === 'levelComplete' && (
        <div className="absolute inset-0 z-20 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div className="relative flex flex-col items-center gap-6 overlay-enter">
            {isVictory ? (
              <>
                <div className="text-center">
                  <h2
                    className="text-6xl font-extrabold tracking-wide text-amber-400 mb-4"
                    style={{ textShadow: '0 0 30px rgba(251, 191, 36, 0.6)' }}
                  >
                    VICTORY!
                  </h2>
                  <p className="text-white/80 text-lg font-bold mb-2">
                    All {MAX_LEVEL} levels conquered!
                  </p>
                  <p className="text-white/40 text-sm font-semibold">
                    {stats.score} candies caught -- {stabilityPct.toFixed(0)}% stability
                  </p>
                </div>
                <button
                  onClick={onRetry}
                  className="pointer-events-auto px-12 py-4 bg-amber-500 hover:bg-amber-400 text-white font-extrabold text-lg rounded-xl hover:shadow-lg hover:shadow-amber-500/30 transition-all duration-200"
                >
                  Play Again
                </button>
              </>
            ) : (
              <>
                <div className="text-center">
                  <h2
                    className="text-5xl font-extrabold tracking-wide text-green-400 mb-3"
                    style={{ textShadow: '0 0 20px rgba(74, 222, 128, 0.5)' }}
                  >
                    NICE!
                  </h2>
                  <p className="text-white/60 text-sm font-bold">
                    {stats.score} candies caught -- Stability {stabilityPct.toFixed(0)}%
                  </p>
                </div>
                <button
                  onClick={onNextLevel}
                  className="pointer-events-auto px-10 py-3.5 bg-green-500 hover:bg-green-400 text-white font-extrabold text-lg rounded-xl hover:shadow-lg hover:shadow-green-500/30 transition-all duration-200"
                >
                  Next Level
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {gameState === 'gameOver' && (
        <div className="absolute inset-0 z-20 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div className="relative flex flex-col items-center gap-6 overlay-enter">
            <div className="text-center">
              <h2 className="text-5xl font-extrabold tracking-wide text-red-400 mb-3"
                style={{ textShadow: '0 0 20px rgba(248, 113, 113, 0.5)' }}
              >
                OOPS!
              </h2>
              <p className="text-white/60 text-sm font-bold mb-1">
                Too many candies lost!
              </p>
              <p className="text-white/30 text-xs font-semibold">
                Level {level} -- {stats.score} caught -- {stats.totalMissed} missed
              </p>
            </div>
            <button
              onClick={onRetry}
              className="pointer-events-auto px-10 py-3.5 bg-red-500 hover:bg-red-400 text-white font-extrabold text-lg rounded-xl hover:shadow-lg hover:shadow-red-500/30 transition-all duration-200"
            >
              Try Again
            </button>
          </div>
        </div>
      )}
    </>
  );
}
