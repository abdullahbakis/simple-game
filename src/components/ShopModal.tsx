import { X, Check, Lock } from 'lucide-react';
import { LINE_SKINS } from '../game/skins';

interface ShopModalProps {
  coins: number;
  unlockedSkins: string[];
  selectedSkin: string;
  onBuy: (skinId: string, cost: number) => void;
  onSelect: (skinId: string) => void;
  onClose: () => void;
}

export default function ShopModal({
  coins,
  unlockedSkins,
  selectedSkin,
  onBuy,
  onSelect,
  onClose,
}: ShopModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="relative w-[90vw] max-w-md max-h-[80vh] bg-[#0E1A2E] border border-white/10 rounded-2xl overflow-hidden flex flex-col overlay-enter">
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
          <h2 className="text-xl font-extrabold text-white tracking-wide">Line Skins</h2>
          <div className="flex items-center gap-3">
            <span className="text-amber-400 font-bold text-sm">{coins} coins</span>
            <button onClick={onClose} className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors">
              <X className="w-4 h-4 text-white/70" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-2 shop-scroll">
          {LINE_SKINS.map((skin) => {
            const owned = unlockedSkins.includes(skin.id);
            const isSelected = selectedSkin === skin.id;
            const canAfford = coins >= skin.cost;

            return (
              <div
                key={skin.id}
                className={`
                  flex items-center justify-between px-4 py-3 rounded-xl border transition-all
                  ${isSelected
                    ? 'bg-cyan-500/15 border-cyan-400/40'
                    : owned
                      ? 'bg-white/5 border-white/10 hover:bg-white/8'
                      : 'bg-white/3 border-white/5'
                  }
                `}
              >
                <div className="flex items-center gap-3">
                  <SkinPreview skinId={skin.id} />
                  <div>
                    <p className={`font-bold text-sm ${owned ? 'text-white' : 'text-white/50'}`}>
                      {skin.name}
                    </p>
                    {!owned && (
                      <p className={`text-xs ${canAfford ? 'text-amber-400' : 'text-white/30'}`}>
                        {skin.cost} coins
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  {isSelected ? (
                    <span className="flex items-center gap-1 text-cyan-400 text-xs font-bold">
                      <Check className="w-3.5 h-3.5" /> Equipped
                    </span>
                  ) : owned ? (
                    <button
                      onClick={() => onSelect(skin.id)}
                      className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-lg transition-colors"
                    >
                      Equip
                    </button>
                  ) : canAfford ? (
                    <button
                      onClick={() => onBuy(skin.id, skin.cost)}
                      className="px-3 py-1.5 bg-amber-500/80 hover:bg-amber-500 text-white text-xs font-bold rounded-lg transition-colors"
                    >
                      Buy
                    </button>
                  ) : (
                    <span className="flex items-center gap-1 text-white/20 text-xs">
                      <Lock className="w-3 h-3" /> Locked
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function SkinPreview({ skinId }: { skinId: string }) {
  const colors: Record<string, string> = {
    rainbow: 'linear-gradient(90deg, #FF6B9D, #00D4FF, #7FFF00, #FFD93D)',
    gold: 'linear-gradient(90deg, #FFD700, #FFA500)',
    'neon-blue': 'linear-gradient(90deg, #00BFFF, #00FFFF)',
    fire: 'linear-gradient(90deg, #FF4500, #FF8C00, #FFD700)',
    ice: 'linear-gradient(90deg, #B0E0E6, #ADD8E6, #87CEEB)',
    matrix: 'linear-gradient(90deg, #00FF00, #00CC00)',
    slime: 'linear-gradient(90deg, #7FFF00, #ADFF2F)',
    bubble: 'linear-gradient(90deg, #87CEEB, #FFB6C1)',
    void: 'linear-gradient(90deg, #2D1B4E, #1A1A2E)',
    electric: 'linear-gradient(90deg, #00CED1, #FFFFFF, #00CED1)',
    love: 'linear-gradient(90deg, #FF1493, #FF69B4)',
    starry: 'linear-gradient(90deg, #FFFACD, #FAFAD2, #FFE4B5)',
    glitch: 'linear-gradient(90deg, #FF0000, #00FF00, #0000FF)',
    'liquid-metal': 'linear-gradient(90deg, #C0C0C0, #A9A9A9, #D3D3D3)',
    rgb: 'linear-gradient(90deg, #FF0000, #00FF00, #0000FF)',
  };

  return (
    <div
      className="w-8 h-2 rounded-full"
      style={{ background: colors[skinId] || colors.rainbow }}
    />
  );
}
