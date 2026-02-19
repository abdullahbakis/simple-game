import type { AdProvider } from './AdProvider';

declare global {
  interface Window {
    admob?: {
      rewardedAd?: {
        load: (options: { adUnitId: string }) => Promise<void>;
        show: () => Promise<void>;
        addEventListener: (event: string, handler: (result?: { type: string }) => void) => void;
        removeEventListener: (event: string, handler: () => void) => void;
      };
    };
    AdMob?: {
      prepareRewardVideoAd: (options: { adId: string; isTesting: boolean }) => Promise<void>;
      showRewardVideoAd: () => Promise<void>;
      addEventListener: (event: string, handler: (info?: { type: string }) => void) => void;
    };
    Capacitor?: {
      isNativePlatform: () => boolean;
      getPlatform: () => string;
      Plugins?: {
        AdMob?: CapacitorAdMob;
      };
    };
  }
}

interface CapacitorAdMob {
  initialize: (options: { testingDevices?: string[]; initializeForTesting?: boolean }) => Promise<void>;
  prepareRewardVideoAd: (options: { adId: string }) => Promise<void>;
  showRewardVideoAd: () => Promise<void>;
  addListener: (
    event: string,
    handler: (info?: { type: string; amount?: number }) => void
  ) => { remove: () => void };
}

export const ADMOB_AD_UNIT_IDS = {
  android: {
    rewarded: 'ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX',
  },
  ios: {
    rewarded: 'ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX',
  },
};

function getPlatform(): 'ios' | 'android' | 'web' {
  if (window.Capacitor?.isNativePlatform?.()) {
    const p = window.Capacitor.getPlatform();
    if (p === 'ios' || p === 'android') return p;
  }
  if (/iPhone|iPad|iPod/.test(navigator.userAgent)) return 'ios';
  if (/Android/.test(navigator.userAgent)) return 'android';
  return 'web';
}

function getAdUnitId(): string {
  const platform = getPlatform();
  if (platform === 'ios') return ADMOB_AD_UNIT_IDS.ios.rewarded;
  return ADMOB_AD_UNIT_IDS.android.rewarded;
}

export class AdMobProvider implements AdProvider {
  private adLoaded = false;
  private loading = false;
  private capacitorAdMob: CapacitorAdMob | null = null;

  constructor() {
    this.detectCapacitorPlugin();
    this.preloadAd();
  }

  private detectCapacitorPlugin() {
    this.capacitorAdMob = window.Capacitor?.Plugins?.AdMob ?? null;
    if (this.capacitorAdMob) {
      this.capacitorAdMob.initialize({ initializeForTesting: false }).catch(() => {});
    }
  }

  private async preloadAd() {
    if (this.loading || this.adLoaded) return;
    this.loading = true;
    try {
      if (this.capacitorAdMob) {
        await this.capacitorAdMob.prepareRewardVideoAd({ adId: getAdUnitId() });
        this.adLoaded = true;
      } else if (window.admob?.rewardedAd) {
        await window.admob.rewardedAd.load({ adUnitId: getAdUnitId() });
        this.adLoaded = true;
      } else if (window.AdMob) {
        await window.AdMob.prepareRewardVideoAd({ adId: getAdUnitId(), isTesting: false });
        this.adLoaded = true;
      }
    } catch {
      this.adLoaded = false;
    } finally {
      this.loading = false;
    }
  }

  isAvailable(): boolean {
    return !!(this.capacitorAdMob || window.admob?.rewardedAd || window.AdMob);
  }

  showRewardedAd(onReward: () => void, onDismiss?: () => void): void {
    if (!this.isAvailable()) {
      onDismiss?.();
      return;
    }

    if (this.capacitorAdMob) {
      const rewardListener = this.capacitorAdMob.addListener('onRewarded', () => {
        rewardListener.remove();
        this.adLoaded = false;
        onReward();
        this.preloadAd();
      });
      const closeListener = this.capacitorAdMob.addListener('onRewardedVideoAdClosed', () => {
        closeListener.remove();
        this.adLoaded = false;
        onDismiss?.();
        this.preloadAd();
      });
      this.capacitorAdMob.showRewardVideoAd().catch(() => {
        rewardListener.remove();
        closeListener.remove();
        onDismiss?.();
      });
      return;
    }

    if (window.admob?.rewardedAd) {
      const handleReward = () => {
        window.admob!.rewardedAd!.removeEventListener('rewarded', handleReward);
        this.adLoaded = false;
        onReward();
        this.preloadAd();
      };
      const handleClose = () => {
        window.admob!.rewardedAd!.removeEventListener('dismissed', handleClose);
        this.adLoaded = false;
        onDismiss?.();
        this.preloadAd();
      };
      window.admob.rewardedAd.addEventListener('rewarded', handleReward);
      window.admob.rewardedAd.addEventListener('dismissed', handleClose);
      window.admob.rewardedAd.show().catch(() => {
        onDismiss?.();
      });
      return;
    }

    if (window.AdMob) {
      window.AdMob.addEventListener('onRewarded', () => {
        this.adLoaded = false;
        onReward();
        this.preloadAd();
      });
      window.AdMob.addEventListener('onRewardedVideoAdClosed', () => {
        this.adLoaded = false;
        onDismiss?.();
        this.preloadAd();
      });
      window.AdMob.showRewardVideoAd().catch(() => {
        onDismiss?.();
      });
    }
  }
}
