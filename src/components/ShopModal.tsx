import { useState, useEffect } from 'react';
import { X, Check, Lock, Tv, Unlock, Coins, ShoppingCart, Loader } from 'lucide-react';
import { LINE_SKINS } from '../game/skins';
import { useLang } from '../i18n/LangContext';
import { getIAPProducts, purchaseCoins, isIAPAvailable } from '../game/iap/IAPManager';
import type { IAPProduct } from '../game/iap/IAPManager';

interface ShopModalProps {
  coins: number;
  unlockedSkins: string[];
  selectedSkin: string;
  onBuy: (skinId: string, cost: number) => void;
  onSelect: (skinId: string) => void;
  onClose: () => void;
  onWatchAdForCoins: () => void;
  onPurchaseCoins: (amount: number) => void;
  nextMilestoneCost: number | null;
  onUnlockNextMilestone: () => void;
}

export default function ShopModal({
  coins,
  unlockedSkins,
  selectedSkin,
  onBuy,
  onSelect,
  onClose,
  onWatchAdForCoins,
  onPurchaseCoins,
  nextMilestoneCost,
  onUnlockNextMilestone,
}: ShopModalProps) {
  const { tr } = useLang();
  const canAffordMilestone = nextMilestoneCost !== null && coins >= nextMilestoneCost;
  const [iapProducts, setIapProducts] = useState<IAPProduct[]>([]);
  const [purchasingId, setPurchasingId] = useState<string | null>(null);
  const [purchaseError, setPurchaseError] = useState<string | null>(null);
  const nativeIAP = isIAPAvailable();

  useEffect(() => {
    getIAPProducts().then(setIapProducts);
  }, []);

  const handlePurchase = async (product: IAPProduct) => {
    if (purchasingId) return;
    setPurchasingId(product.id);
    setPurchaseError(null);
    await purchaseCoins(
      product.id,
      (coins) => {
        onPurchaseCoins(coins);
        setPurchasingId(null);
      },
      (msg) => {
        setPurchaseError(msg);
        setPurchasingId(null);
      }
    );
  };

  const iapLabels = [
    tr.shop.iapPouch,
    tr.shop.iapSack,
    tr.shop.iapChest,
    tr.shop.iapBarrel,
    tr.shop.iapVault,
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="relative w-[90vw] max-w-md max-h-[85vh] bg-[#0E1A2E] border border-white/10 rounded-2xl overflow-hidden flex flex-col overlay-enter">
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
          <h2 className="text-xl font-extrabold text-white tracking-wide">{tr.shop.title}</h2>
          <div className="flex items-center gap-3">
            <span className="text-amber-400 font-bold text-sm">{coins.toLocaleString()} {tr.shop.coins.replace('{n}', '').trim()}</span>
            <button onClick={onClose} className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors">
              <X className="w-4 h-4 text-white/70" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-5 shop-scroll">
          <section>
            <h3 className="text-xs font-bold text-cyan-400 uppercase tracking-widest mb-3">{tr.shop.bank}</h3>
            <div className="space-y-2">
              <button
                onClick={onWatchAdForCoins}
                className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-cyan-500/10 border border-cyan-500/20 hover:bg-cyan-500/20 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Tv className="w-4 h-4 text-cyan-400" />
                  <span className="text-white font-bold text-sm">{tr.shop.freeCoins}</span>
                </div>
                <span className="text-cyan-400 font-extrabold text-sm">+250</span>
              </button>

              {purchaseError && (
                <p className="text-red-400 text-[10px] text-center px-2">{purchaseError}</p>
              )}
              <div className="grid grid-cols-3 gap-1.5">
                {(iapProducts.length > 0 ? iapProducts : []).map((product, i) => {
                  const isPurchasing = purchasingId === product.id;
                  return (
                    <button
                      key={product.id}
                      onClick={() => handlePurchase(product)}
                      disabled={!!purchasingId}
                      className="flex flex-col items-center gap-0.5 px-2 py-2.5 rounded-xl bg-amber-500/10 border border-amber-500/15 hover:bg-amber-500/20 transition-colors disabled:opacity-60"
                    >
                      {isPurchasing ? (
                        <Loader className="w-3 h-3 text-amber-400 animate-spin" />
                      ) : (
                        <>
                          <div className="flex items-center gap-0.5">
                            {nativeIAP && <ShoppingCart className="w-2.5 h-2.5 text-amber-300/60" />}
                            <span className="text-white font-bold text-[11px]">{iapLabels[i]}</span>
                          </div>
                          <span className="text-amber-400 font-extrabold text-[10px]">
                            {(product.coins / 1000).toFixed(0)}k
                          </span>
                          <span className="text-white/40 text-[9px]">{product.price}</span>
                        </>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </section>

          {nextMilestoneCost !== null && (
            <section>
              <h3 className="text-xs font-bold text-green-400 uppercase tracking-widest mb-3">{tr.shop.special}</h3>
              <button
                onClick={onUnlockNextMilestone}
                disabled={!canAffordMilestone}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border transition-colors ${
                  canAffordMilestone
                    ? 'bg-green-500/10 border-green-500/20 hover:bg-green-500/20'
                    : 'bg-white/3 border-white/5 cursor-not-allowed'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Unlock className={`w-4 h-4 ${canAffordMilestone ? 'text-green-400' : 'text-white/20'}`} />
                  <span className={`font-bold text-sm ${canAffordMilestone ? 'text-white' : 'text-white/30'}`}>
                    {tr.shop.unlockNextMilestone}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Coins className={`w-3 h-3 ${canAffordMilestone ? 'text-amber-400' : 'text-white/20'}`} />
                  <span className={`font-extrabold text-sm ${canAffordMilestone ? 'text-amber-400' : 'text-white/20'}`}>
                    {nextMilestoneCost.toLocaleString()}
                  </span>
                </div>
              </button>
            </section>
          )}

          <section>
            <h3 className="text-xs font-bold text-amber-400 uppercase tracking-widest mb-3">{tr.shop.lineSkins}</h3>
            <div className="space-y-2">
              {LINE_SKINS.map((skin) => {
                const owned = unlockedSkins.includes(skin.id);
                const isSelected = selectedSkin === skin.id;
                const canAfford = coins >= skin.cost;
                const isCosmic = skin.id === 'cosmic-emperor';

                return (
                  <div
                    key={skin.id}
                    className={`
                      flex items-center justify-between px-4 py-3 rounded-xl border transition-all
                      ${isCosmic && !owned
                        ? 'cosmic-shop-card border-amber-400/40 relative overflow-hidden'
                        : isCosmic && isSelected
                          ? 'cosmic-shop-card border-amber-400/50 relative overflow-hidden'
                          : isSelected
                            ? 'bg-cyan-500/15 border-cyan-400/40'
                            : owned
                              ? 'bg-white/5 border-white/10 hover:bg-white/8'
                              : 'bg-white/3 border-white/5'
                      }
                    `}
                  >
                    {isCosmic && <div className="cosmic-sparkle-bg absolute inset-0 pointer-events-none" />}
                    <div className="flex items-center gap-3 relative z-10">
                      <SkinPreview skinId={skin.id} />
                      <div>
                        <p className={`font-bold text-sm ${
                          isCosmic ? 'cosmic-text-shimmer' : owned ? 'text-white' : 'text-white/50'
                        }`}>
                          {skin.name}
                        </p>
                        {!owned && (
                          <p className={`text-xs ${
                            isCosmic ? 'text-amber-300/80' : canAfford ? 'text-amber-400' : 'text-white/30'
                          }`}>
                            {tr.shop.coins.replace('{n}', skin.cost.toLocaleString())}
                          </p>
                        )}
                        {isCosmic && !owned && (
                          <p className="text-[9px] text-amber-400/50 mt-0.5">
                            {tr.shop.orBeatLevel100}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="relative z-10">
                      {isSelected ? (
                        <span className={`flex items-center gap-1 text-xs font-bold ${isCosmic ? 'text-amber-300' : 'text-cyan-400'}`}>
                          <Check className="w-3.5 h-3.5" /> {tr.shop.equipped}
                        </span>
                      ) : owned ? (
                        <button
                          onClick={() => onSelect(skin.id)}
                          className={`px-3 py-1.5 text-white text-xs font-bold rounded-lg transition-colors ${
                            isCosmic ? 'bg-amber-500/30 hover:bg-amber-500/50' : 'bg-white/10 hover:bg-white/20'
                          }`}
                        >
                          {tr.shop.equip}
                        </button>
                      ) : canAfford ? (
                        <button
                          onClick={() => onBuy(skin.id, skin.cost)}
                          className={`px-3 py-1.5 text-white text-xs font-bold rounded-lg transition-colors ${
                            isCosmic ? 'bg-amber-500/80 hover:bg-amber-500 cosmic-btn-glow' : 'bg-amber-500/80 hover:bg-amber-500'
                          }`}
                        >
                          {tr.shop.buy}
                        </button>
                      ) : (
                        <span className="flex items-center gap-1 text-white/20 text-xs">
                          <Lock className="w-3 h-3" /> {tr.shop.locked}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
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
    toxic: 'linear-gradient(90deg, #39FF14, #7FFF00)',
    rgb: 'linear-gradient(90deg, #00E5FF, #FF1493, #00CED1, #FF69B4)',
    plasma: 'linear-gradient(90deg, #FF00FF, #FF69B4, #FF00FF)',
    'cosmic-emperor': 'linear-gradient(90deg, #FF6B9D, #FFD700, #00D4FF, #7FFF00, #FF6B9D)',
  };

  if (skinId === 'cosmic-emperor') {
    return (
      <div className="relative">
        <div
          className="w-8 h-2 rounded-full cosmic-preview-glow"
          style={{ background: colors[skinId] }}
        />
      </div>
    );
  }

  return (
    <div
      className="w-8 h-2 rounded-full"
      style={{ background: colors[skinId] || colors.rainbow }}
    />
  );
}
