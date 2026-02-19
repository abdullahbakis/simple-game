import type { AdProvider } from './ads/AdProvider';
import { DevModeAdProvider } from './ads/DevModeAdProvider';
import { AdMobProvider } from './ads/AdMobProvider';

function createProvider(): AdProvider {
  const adMob = new AdMobProvider();
  if (adMob.isAvailable()) return adMob;
  return new DevModeAdProvider();
}

let provider: AdProvider = createProvider();

export function setAdProvider(p: AdProvider): void {
  provider = p;
}

export function showRewardedAd(onReward: () => void, onDismiss?: () => void): void {
  provider.showRewardedAd(onReward, onDismiss);
}

export function isAdAvailable(): boolean {
  return provider.isAvailable();
}
