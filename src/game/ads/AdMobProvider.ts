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
  }
}

const ADMOB_REWARDED_AD_UNIT_ID_ANDROID = 'ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX';
const ADMOB_REWARDED_AD_UNIT_ID_IOS = 'ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX';

function getAdUnitId(): string {
  const ua = navigator.userAgent;
  if (/iPhone|iPad/.test(ua)) return ADMOB_REWARDED_AD_UNIT_ID_IOS;
  return ADMOB_REWARDED_AD_UNIT_ID_ANDROID;
}

export class AdMobProvider implements AdProvider {
  private adLoaded = false;
  private loading = false;

  constructor() {
    this.preloadAd();
  }

  private async preloadAd() {
    if (this.loading || this.adLoaded) return;
    this.loading = true;
    try {
      if (window.admob?.rewardedAd) {
        await window.admob.rewardedAd.load({ adUnitId: getAdUnitId() });
        this.adLoaded = true;
      } else if (window.AdMob) {
        await window.AdMob.prepareRewardVideoAd({
          adId: getAdUnitId(),
          isTesting: false,
        });
        this.adLoaded = true;
      }
    } catch {
      this.adLoaded = false;
    } finally {
      this.loading = false;
    }
  }

  isAvailable(): boolean {
    return !!(window.admob?.rewardedAd || window.AdMob);
  }

  showRewardedAd(onReward: () => void, onDismiss?: () => void): void {
    if (!this.isAvailable()) {
      onDismiss?.();
      return;
    }

    if (window.admob?.rewardedAd) {
      const handleReward = () => {
        this.adLoaded = false;
        onReward();
        this.preloadAd();
      };
      const handleClose = () => {
        this.adLoaded = false;
        onDismiss?.();
        this.preloadAd();
      };

      window.admob.rewardedAd.addEventListener('rewarded', handleReward);
      window.admob.rewardedAd.addEventListener('dismissed', handleClose);
      window.admob.rewardedAd.show().catch(() => {
        onDismiss?.();
      });
    } else if (window.AdMob) {
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
