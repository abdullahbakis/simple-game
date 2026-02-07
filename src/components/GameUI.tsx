import { getLevelConfig } from '../game/constants';
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
  'DEFLECTOR BARS': 'text-rose-400/70 bg-rose-50 border-rose-200/60',
  'WIND ZONES': 'text-blue-400/70 bg-blue-50 border-blue-200/60',
  'SPINNERS': 'text-emerald-400/70 bg-emerald-50 border-emerald-200/60',
  'MOVING PLATFORMS': 'text-violet-400/70 bg-violet-50 border-violet-200/60',
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

  return (
    <>
      {countdown > 0 && gameState === 'playing' && (
        <div className="absolute inset-x-0 top-20 z-10 pointer-events-none flex flex-col items-center gap-3">
          <span className="text-gray-400 text-sm uppercase tracking-widest font-semibold">
            Level {level} -- Target: {config.target} pearls
          </span>
          {config.hazards.length > 0 && (
            <div className="flex items-center gap-2">
              {config.hazards.map((hazard) => (
                <span
                  key={hazard}
                  className={`text-xs px-2.5 py-0.5 rounded-full border ${HAZARD_STYLES[hazard] || 'text-gray-400/70 bg-gray-50 border-gray-200/60'}`}
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
            <div className="flex items-center gap-2 bg-white/60 backdrop-blur-sm rounded-full px-3.5 py-1.5 shadow-sm">
              <span className="text-gray-400 text-xs uppercase tracking-wider font-semibold">Lvl</span>
              <span className="text-gray-700 font-bold text-lg tabular-nums leading-none">
                {level}
              </span>
            </div>

            <div className="flex items-center gap-2 bg-white/60 backdrop-blur-sm rounded-full px-3.5 py-1.5 shadow-sm">
              <span className="text-gray-400 text-xs uppercase tracking-wider font-semibold">Collected</span>
              <span className="text-gray-700 font-bold text-lg tabular-nums leading-none">
                {stats.score}
              </span>
              <span className="text-gray-300 text-xs">/</span>
              <span className="text-gray-400 text-xs">{config.target}</span>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-white/60 backdrop-blur-sm rounded-full px-3.5 py-1.5 shadow-sm">
            <span
              className={`text-xs uppercase tracking-wider font-semibold ${
                stabilityDanger ? 'text-rose-400' : 'text-gray-400'
              }`}
            >
              Stability
            </span>
            <div className="w-20 h-2 bg-gray-200/80 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  stabilityDanger ? 'bg-rose-300' : 'bg-emerald-300'
                }`}
                style={{ width: `${stabilityPct}%` }}
              />
            </div>
            <span
              className={`font-bold text-sm tabular-nums ${
                stabilityDanger ? 'text-rose-400 stability-flash' : 'text-gray-600'
              }`}
            >
              {stabilityPct.toFixed(0)}%
            </span>
          </div>
        </div>

        <div className="flex justify-center px-5">
          <div className="w-64 h-1 bg-gray-200/40 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-200 bg-pink-200"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>

        {config.hazards.length > 0 && countdown <= 0 && (
          <div className="flex justify-center mt-2">
            <div className="flex items-center gap-2 text-xs">
              {config.hazards.map((hazard) => (
                <span
                  key={hazard}
                  className={`px-2 py-0.5 rounded-full border ${HAZARD_STYLES[hazard] || 'text-gray-400/70 bg-gray-50 border-gray-200/60'}`}
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
          <div className="absolute inset-0 bg-white/70 backdrop-blur-sm" />
          <div className="relative flex flex-col items-center gap-6 overlay-enter">
            <div className="text-center">
              <h2 className="text-4xl font-extrabold tracking-wide text-emerald-500 mb-2">
                Level Complete
              </h2>
              <p className="text-gray-400 text-sm font-medium">
                {stats.score} pearls collected -- Stability {stabilityPct.toFixed(0)}%
              </p>
            </div>
            <button
              onClick={onNextLevel}
              className="pointer-events-auto px-8 py-3 bg-emerald-50 border border-emerald-300 text-emerald-600 font-bold text-lg rounded-full hover:bg-emerald-100 hover:shadow-md transition-all duration-200"
            >
              Next Level
            </button>
          </div>
        </div>
      )}

      {gameState === 'gameOver' && (
        <div className="absolute inset-0 z-20 flex items-center justify-center">
          <div className="absolute inset-0 bg-white/80 backdrop-blur-sm" />
          <div className="relative flex flex-col items-center gap-6 overlay-enter">
            <div className="text-center">
              <h2 className="text-4xl font-extrabold tracking-wide text-rose-400 mb-2">
                Game Over
              </h2>
              <p className="text-gray-400 text-sm font-medium mb-1">
                Too many pearls lost
              </p>
              <p className="text-gray-300 text-xs">
                Level {level} -- {stats.score} collected -- {stats.totalMissed} missed
              </p>
            </div>
            <button
              onClick={onRetry}
              className="pointer-events-auto px-8 py-3 bg-rose-50 border border-rose-300 text-rose-500 font-bold text-lg rounded-full hover:bg-rose-100 hover:shadow-md transition-all duration-200"
            >
              Try Again
            </button>
          </div>
        </div>
      )}
    </>
  );
}
